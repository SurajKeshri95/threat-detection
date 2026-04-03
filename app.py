import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

database_url = os.getenv("DATABASE_URL", "")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=300
)
)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')
COLS_PATH  = os.path.join(BASE_DIR, 'feature_cols.pkl')

def train_and_save_model():
    print("No model found — training from database...")
    import pandas as pd
    from xgboost import XGBClassifier

    df = pd.read_sql(
        "SELECT * FROM social_accounts WHERE label IS NOT NULL",
        engine
    )
    print(f"Loaded {len(df)} accounts for training")

    df['follow_ratio']     = df['followers_count'].fillna(0) / (df['following_count'].fillna(0) + 1)
    df['age_score']        = 1 / (df['account_age_days'].fillna(0) + 1)
    df['engagement_ratio'] = (df['followers_count'].fillna(0) + df['listed_count'].fillna(0)) / (df['tweet_count'].fillna(0) + 1)
    df['no_profile_pic']   = (~df['has_profile_pic'].fillna(False)).astype(int)
    df['no_description']   = (~df['has_description'].fillna(False)).astype(int)
    df['is_default']       = df['default_profile'].fillna(False).astype(int)
    df['is_verified_int']  = df['is_verified'].fillna(False).astype(int)
    df['low_followers']    = (df['followers_count'].fillna(0) < 50).astype(int)
    df['tweet_count_log']  = df['tweet_count'].fillna(0).astype(float).apply(np.log1p)
    df['listed_count_log'] = df['listed_count'].fillna(0).astype(float).apply(np.log1p)
    df['is_bot']           = (df['label'] == 'bot').astype(int)

    feature_cols = [
        'follow_ratio', 'age_score', 'engagement_ratio',
        'no_profile_pic', 'no_description', 'is_default',
        'is_verified_int', 'low_followers',
        'tweet_count_log', 'listed_count_log'
    ]

    df[feature_cols] = df[feature_cols].fillna(0).replace([np.inf, -np.inf], 0)

    X = df[feature_cols]
    y = df['is_bot']

    model = XGBClassifier(
        n_estimators=200, max_depth=6,
        learning_rate=0.1, random_state=42,
        eval_metric='logloss', verbosity=0
    )
    model.fit(X, y)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(COLS_PATH, 'wb') as f:
        pickle.dump(feature_cols, f)

    print("✅ Model trained and saved successfully!")
    return model, feature_cols

# Load or train model at startup
if os.path.exists(MODEL_PATH):
    print("Loading existing model...")
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(COLS_PATH, 'rb') as f:
        feature_cols = pickle.load(f)
    print("✅ Model loaded!")
else:
    model, feature_cols = train_and_save_model()

def compute_features(account):
    followers = account.get('followers_count') or 0
    following = account.get('following_count') or 0
    tweets    = account.get('tweet_count') or 0
    listed    = account.get('listed_count') or 0
    age_days  = account.get('account_age_days') or 0

    return [
        followers / (following + 1),
        1 / (age_days + 1),
        (followers + listed) / (tweets + 1),
        0 if account.get('has_profile_pic') else 1,
        0 if account.get('has_description') else 1,
        1 if account.get('default_profile') else 0,
        1 if account.get('is_verified') else 0,
        1 if followers < 50 else 0,
        float(np.log1p(tweets)),
        float(np.log1p(listed))
    ]

def score_to_label(score):
    if score >= 70: return 'High Risk'
    if score >= 40: return 'Medium Risk'
    return 'Low Risk'

@app.route('/predict', methods=['POST'])
def predict():
    data     = request.get_json()
    username = data.get('username', '').strip()
    if not username:
        return jsonify({'error': 'Username is required'}), 400

    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT * FROM social_accounts WHERE username = :u LIMIT 1"
        ), {'u': username}).fetchone()

    if result is None:
        return jsonify({'error': f'Account "{username}" not found'}), 404

    account  = dict(result._mapping)
    features = np.array(compute_features(account)).reshape(1, -1)
    prob     = float(model.predict_proba(features)[0][1])
    threat_score = round(prob * 100, 1)

    with engine.connect() as conn:
        conn.execute(text(
            "UPDATE social_accounts SET threat_score = :s WHERE username = :u"
        ), {'s': threat_score, 'u': username})
        conn.commit()

    return jsonify({
        'username':       username,
        'threat_score':   threat_score,
        'label':          score_to_label(threat_score),
        'account_age_days':  account.get('account_age_days'),
        'followers_count':   account.get('followers_count'),
        'following_count':   account.get('following_count'),
        'tweet_count':       account.get('tweet_count'),
        'is_verified':       account.get('is_verified'),
    })

@app.route('/accounts', methods=['GET'])
def get_accounts():
    with engine.connect() as conn:
        results = conn.execute(text("""
            SELECT username, label, threat_score,
                   followers_count, following_count,
                   tweet_count, account_age_days, source
            FROM social_accounts
            WHERE threat_score IS NOT NULL
            ORDER BY threat_score DESC
            LIMIT 100
        """)).fetchall()
    return jsonify([dict(r._mapping) for r in results])

@app.route('/stats', methods=['GET'])
def get_stats():
    with engine.connect() as conn:
        total     = conn.execute(text("SELECT COUNT(*) FROM social_accounts")).scalar()
        bots      = conn.execute(text("SELECT COUNT(*) FROM social_accounts WHERE label='bot'")).scalar()
        high_risk = conn.execute(text("SELECT COUNT(*) FROM social_accounts WHERE threat_score >= 70")).scalar()
        avg_score = conn.execute(text("SELECT AVG(threat_score) FROM social_accounts WHERE threat_score IS NOT NULL")).scalar()

    return jsonify({
        'total_accounts':   total,
        'total_bots':       bots,
        'high_risk_count':  high_risk,
        'avg_threat_score': round(float(avg_score or 0), 1)
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
