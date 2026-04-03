import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";

const API = "https://threat-detection-api-fqo5.onrender.com";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --sp-black:    #000000;
    --sp-dark:     #121212;
    --sp-card:     #181818;
    --sp-hover:    #282828;
    --sp-green:    #1DB954;
    --sp-green2:   #1ed760;
    --sp-white:    #FFFFFF;
    --sp-gray:     #B3B3B3;
    --sp-gray2:    #535353;
    --sp-red:      #E91429;
    --sp-orange:   #E8740C;
    --sp-purple:   #7C3AED;
    --sp-blue:     #2D46B9;
    --font-main:   'Circular Std', 'Helvetica Neue', sans-serif;
    --font-mono:   'DM Mono', monospace;
  }

  html, body, #root {
    height: 100%;
    background: var(--sp-black);
    color: var(--sp-white);
    font-family: var(--font-main);
    overflow: hidden;
  }

  .app-shell {
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: 1fr 90px;
    height: 100vh;
    gap: 8px;
    padding: 8px;
    background: var(--sp-black);
  }

  /* SIDEBAR */
  .sidebar {
    grid-row: 1;
    background: var(--sp-dark);
    border-radius: 12px;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    background: var(--sp-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .logo-sub {
    font-size: 10px;
    color: var(--sp-gray);
    font-weight: 400;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .nav-section { display: flex; flex-direction: column; gap: 4px; }

  .nav-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--sp-gray);
    padding: 0 12px;
    margin-bottom: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--sp-gray);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.15s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .nav-item:hover { background: var(--sp-hover); color: var(--sp-white); }
  .nav-item.active { background: var(--sp-hover); color: var(--sp-white); }
  .nav-item .nav-icon { font-size: 20px; width: 24px; text-align: center; flex-shrink: 0; }

  .stat-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }

  .stat-mini {
    background: var(--sp-hover);
    border-radius: 8px;
    padding: 12px;
  }

  .stat-mini-label { font-size: 11px; color: var(--sp-gray); margin-bottom: 4px; }
  .stat-mini-val { font-size: 20px; font-weight: 900; }

  /* MAIN */
  .main {
    grid-row: 1;
    background: linear-gradient(180deg, #1a3a2a 0%, var(--sp-dark) 340px);
    border-radius: 12px;
    overflow-y: auto;
    position: relative;
  }

  .main-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: transparent;
    backdrop-filter: blur(20px);
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .main-header.scrolled { background: rgba(18,18,18,0.95); }

  .header-title { font-size: 28px; font-weight: 900; }

  .header-badge {
    background: var(--sp-green);
    color: var(--sp-black);
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .main-content { padding: 0 32px 32px; }

  /* SEARCH HERO */
  .search-hero {
    margin-bottom: 32px;
  }

  .search-label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--sp-gray);
    margin-bottom: 12px;
  }

  .search-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    background: var(--sp-white);
    border-radius: 500px;
    padding: 6px 6px 6px 20px;
    max-width: 600px;
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: 15px;
    font-family: var(--font-main);
    font-weight: 500;
    color: var(--sp-black);
  }

  .search-input::placeholder { color: #767676; }

  .scan-btn {
    background: var(--sp-green);
    border: none;
    border-radius: 500px;
    padding: 12px 28px;
    font-size: 14px;
    font-weight: 700;
    font-family: var(--font-main);
    color: var(--sp-black);
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .scan-btn:hover:not(:disabled) {
    background: var(--sp-green2);
    transform: scale(1.03);
  }

  .scan-btn:disabled { background: var(--sp-gray2); color: var(--sp-gray); cursor: not-allowed; }

  /* RESULT CARD */
  .result-card {
    background: var(--sp-card);
    border-radius: 12px;
    padding: 24px;
    margin-top: 16px;
    max-width: 600px;
    border: 1px solid rgba(255,255,255,0.06);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .result-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .result-username { font-size: 22px; font-weight: 900; }
  .result-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

  .meta-pill {
    background: var(--sp-hover);
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 12px;
    color: var(--sp-gray);
    font-family: var(--font-mono);
  }

  .score-circle {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  .score-num { font-size: 26px; font-weight: 900; line-height: 1; }
  .score-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  .risk-badge {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 500px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: 8px;
  }

  .score-bar-wrap { height: 4px; background: var(--sp-hover); border-radius: 2px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s cubic-bezier(.16,1,.3,1); }

  .error-toast {
    background: #2a0a0e;
    border: 1px solid var(--sp-red);
    border-radius: 8px;
    padding: 14px 18px;
    color: #ff6b7a;
    font-size: 14px;
    margin-top: 12px;
    max-width: 600px;
  }

  /* SECTION */
  .section { margin-bottom: 32px; }
  .section-title {
    font-size: 22px;
    font-weight: 900;
    margin-bottom: 16px;
    letter-spacing: -0.3px;
  }

  /* CHARTS GRID */
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .chart-card {
    background: var(--sp-card);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    transition: background 0.2s;
  }

  .chart-card:hover { background: var(--sp-hover); }
  .chart-title { font-size: 14px; font-weight: 700; margin-bottom: 16px; color: var(--sp-gray); text-transform: uppercase; letter-spacing: 1px; }

  /* TABLE */
  .accounts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .account-card {
    background: var(--sp-card);
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.04);
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .account-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }

  .account-card.bot::before    { background: var(--sp-red); }
  .account-card.legit::before  { background: var(--sp-green); }

  .account-card:hover { background: var(--sp-hover); transform: translateY(-2px); }

  .ac-username { font-size: 13px; font-weight: 700; margin-bottom: 8px; font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .ac-score {
    font-size: 28px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }

  .ac-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .ac-bar { height: 3px; background: var(--sp-hover); border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .ac-bar-fill { height: 100%; border-radius: 2px; }

  /* BOTTOM BAR */
  .bottom-bar {
    grid-column: 1 / -1;
    background: #181818;
    border-top: 1px solid #282828;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }

  .bottom-info { display: flex; align-items: center; gap: 16px; }
  .bottom-icon { font-size: 28px; }
  .bottom-name { font-size: 13px; font-weight: 700; }
  .bottom-sub  { font-size: 11px; color: var(--sp-gray); margin-top: 2px; }

  .bottom-center { display: flex; flex-direction: column; align-items: center; gap: 8px; }

  .playback-btns { display: flex; align-items: center; gap: 20px; }

  .pb-btn {
    background: none;
    border: none;
    color: var(--sp-gray);
    font-size: 18px;
    cursor: pointer;
    transition: color 0.15s;
  }

  .pb-btn:hover { color: var(--sp-white); }
  .pb-btn.main-btn { background: var(--sp-white); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: transform 0.15s; }
  .pb-btn.main-btn:hover { transform: scale(1.06); }

  .progress-row { display: flex; align-items: center; gap: 10px; width: 400px; }
  .progress-time { font-size: 11px; color: var(--sp-gray); font-family: var(--font-mono); }
  .progress-bar { flex: 1; height: 4px; background: var(--sp-gray2); border-radius: 2px; cursor: pointer; position: relative; }
  .progress-fill { height: 100%; background: var(--sp-white); border-radius: 2px; transition: width 0.5s linear; }
  .progress-bar:hover .progress-fill { background: var(--sp-green); }

  .bottom-right { display: flex; align-items: center; gap: 12px; }
  .vol-icon { font-size: 16px; color: var(--sp-gray); }
  .vol-bar { width: 80px; height: 4px; background: var(--sp-gray2); border-radius: 2px; cursor: pointer; }
  .vol-fill { height: 100%; width: 65%; background: var(--sp-white); border-radius: 2px; }
  .vol-bar:hover .vol-fill { background: var(--sp-green); }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--sp-gray2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--sp-gray); }

  /* LOADING PULSE */
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .pulsing { animation: pulse 1.5s ease infinite; }

  /* TOOLTIP */
  .recharts-tooltip-wrapper .recharts-default-tooltip {
    background: var(--sp-card) !important;
    border: 1px solid var(--sp-hover) !important;
    border-radius: 8px !important;
    font-family: var(--font-main) !important;
  }
`;

function getRiskColor(score) {
  if (score >= 70) return 'var(--sp-red)';
  if (score >= 40) return 'var(--sp-orange)';
  return 'var(--sp-green)';
}

function getRiskLabel(score) {
  if (score >= 70) return 'High Risk';
  if (score >= 40) return 'Medium Risk';
  return 'Low Risk';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#282828', border: '1px solid #535353', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ fontSize: 12, color: '#b3b3b3', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [username, setUsername] = useState('');
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats]       = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [scrolled, setScrolled]   = useState(false);
  const [progress, setProgress]   = useState(32);
  const mainRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/accounts`).then(r => setAccounts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.1), 500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async () => {
    if (!username.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post(`${API}/predict`, { username });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Account not found in database');
    }
    setLoading(false);
  };

  const pieData = [
    { name: 'Bots',  value: stats?.total_bots || 0 },
    { name: 'Legit', value: (stats?.total_accounts || 0) - (stats?.total_bots || 0) },
  ];

  const riskData = [
    { name: 'High',   value: accounts.filter(a => (a.threat_score||0) >= 70).length,  fill: '#E91429' },
    { name: 'Medium', value: accounts.filter(a => (a.threat_score||0) >= 40 && (a.threat_score||0) < 70).length, fill: '#E8740C' },
    { name: 'Low',    value: accounts.filter(a => (a.threat_score||0) < 40).length,   fill: '#1DB954' },
  ];

  const areaData = accounts.slice(0, 20).map((a, i) => ({
    name: i + 1,
    score: a.threat_score || 0,
  }));

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">🛡️</div>
            <div>
              <div className="logo-text">X Account</div>
              <div className="logo-sub">Bot_Finder</div>
            </div>
          </div>

          <nav className="nav-section">
            <div className="nav-label">Menu</div>
            {[
              { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
              { id: 'scanner',   icon: '⌕', label: 'Scanner' },
              { id: 'accounts',  icon: '◉', label: 'Accounts' },
              { id: 'analytics', icon: '≋', label: 'Analytics' },
            ].map(item => (
              <button key={item.id} className={`nav-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <nav className="nav-section">
            <div className="nav-label">Data</div>
            {[
              { id: 'kaggle',   icon: '◈', label: 'Kaggle Dataset' },
              { id: 'twitter',  icon: '◎', label: 'Twitter Feed' },
              { id: 'model',    icon: '◆', label: 'XGBoost Model' },
            ].map(item => (
              <button key={item.id} className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="stat-cards">
            <div className="stat-mini">
              <div className="stat-mini-label">Total Accounts</div>
              <div className="stat-mini-val" style={{ color: 'var(--sp-green)' }}>
                {stats ? stats.total_accounts.toLocaleString() : <span className="pulsing">—</span>}
              </div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Bots Detected</div>
              <div className="stat-mini-val" style={{ color: 'var(--sp-red)' }}>
                {stats ? stats.total_bots.toLocaleString() : <span className="pulsing">—</span>}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main" ref={mainRef} onScroll={e => setScrolled(e.target.scrollTop > 10)}>
          <div className={`main-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-title">
              {activeNav === 'dashboard' && 'Overview'}
              {activeNav === 'scanner'   && 'Threat Scanner'}
              {activeNav === 'accounts'  && 'Flagged Accounts'}
              {activeNav === 'analytics' && 'Analytics'}
            </div>
            <div className="header-badge">ML Powered</div>
          </div>

          <div className="main-content">

            {/* STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
              {[
                { label: 'Total Accounts', val: stats?.total_accounts?.toLocaleString(), color: 'var(--sp-green)', icon: '◎' },
                { label: 'Confirmed Bots', val: stats?.total_bots?.toLocaleString(),     color: 'var(--sp-red)',   icon: '⚠' },
                { label: 'High Risk',      val: stats?.high_risk_count,                  color: 'var(--sp-orange)', icon: '◈' },
                { label: 'Avg Threat',     val: stats ? stats.avg_threat_score + '%' : null, color: '#a78bfa',    icon: '≋' },
              ].map(card => (
                <div key={card.label} style={{ background: 'var(--sp-card)', borderRadius: 10, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: 11, color: 'var(--sp-gray)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 6 }}>{card.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: card.color }}>
                    {card.val ?? <span className="pulsing" style={{ color: 'var(--sp-gray2)' }}>—</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* SEARCH */}
            <div className="section search-hero">
              <div className="search-label">Scan an account</div>
              <div className="search-bar">
                <span style={{ fontSize: 18, color: '#767676' }}>⌕</span>
                <input
                  className="search-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter X account ID..."
                />
                <button className="scan-btn" onClick={handleSearch} disabled={loading}>
                  {loading ? '⟳ Scanning...' : '▶ Scan'}
                </button>
              </div>

              {error && <div className="error-toast">⚠ {error}</div>}

              {result && (
                <div className="result-card">
                  <div className="result-top">
                    <div>
                      <div className="result-username">@{result.username}</div>
                      <div className="result-meta">
                        {[
                          ['Followers', result.followers_count],
                          ['Following', result.following_count],
                          ['Tweets',    result.tweet_count],
                          ['Age',       result.account_age_days != null ? result.account_age_days + 'd' : 'N/A'],
                        ].map(([k, v]) => (
                          <span key={k} className="meta-pill">{k}: {v ?? 'N/A'}</span>
                        ))}
                      </div>
                      <div className="risk-badge" style={{
                        background: getRiskColor(result.threat_score) + '22',
                        color: getRiskColor(result.threat_score),
                        border: `1px solid ${getRiskColor(result.threat_score)}44`,
                      }}>
                        {getRiskLabel(result.threat_score)}
                      </div>
                    </div>
                    <div className="score-circle" style={{ background: getRiskColor(result.threat_score) + '18', border: `2px solid ${getRiskColor(result.threat_score)}` }}>
                      <div className="score-num" style={{ color: getRiskColor(result.threat_score) }}>{result.threat_score}</div>
                      <div className="score-lbl" style={{ color: getRiskColor(result.threat_score) }}>Score</div>
                    </div>
                  </div>
                  <div className="score-bar-wrap">
                    <div className="score-bar-fill" style={{ width: result.threat_score + '%', background: getRiskColor(result.threat_score) }} />
                  </div>
                </div>
              )}
            </div>

            {/* CHARTS */}
            <div className="section">
              <div className="section-title">Analytics</div>
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-title">Bot vs Legit</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                        <Cell fill="#E91429" />
                        <Cell fill="#1DB954" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ color: '#b3b3b3', fontSize: 12 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-title">Risk Breakdown</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={riskData} barSize={40}>
                      <XAxis dataKey="name" tick={{ fill: '#b3b3b3', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#b3b3b3', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="chart-title">Threat Score Distribution — Top 20 Accounts</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1DB954" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: '#535353', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#535353', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="#1DB954" strokeWidth={2} fill="url(#scoreGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ACCOUNTS GRID */}
            <div className="section">
              <div className="section-title">Flagged Accounts</div>
              <div className="accounts-grid">
                {accounts.slice(0, 18).map((acc, i) => (
                  <div key={i} className={`account-card ${acc.label}`} onClick={() => setUsername(acc.username)}>
                    <div className="ac-username">@{acc.username}</div>
                    <div className="ac-score" style={{ color: getRiskColor(acc.threat_score || 0) }}>
                      {acc.threat_score ?? '—'}
                    </div>
                    <div className="ac-label" style={{ color: acc.label === 'bot' ? 'var(--sp-red)' : 'var(--sp-green)' }}>
                      {acc.label === 'bot' ? '⚠ Bot' : '✓ Legit'}
                    </div>
                    <div className="ac-bar">
                      <div className="ac-bar-fill" style={{ width: (acc.threat_score || 0) + '%', background: getRiskColor(acc.threat_score || 0) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>

        {/* BOTTOM SPOTIFY BAR */}
        <footer className="bottom-bar">
          <div className="bottom-info">
            <div className="bottom-icon">🛡️</div>
            <div>
              <div className="bottom-name">Developed By Suraj Keshri</div>
              <div className="bottom-sub">XGBoost · 37,438 accounts · 90%+ accuracy</div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
