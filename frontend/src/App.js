import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const API = "https://threat-detection-api-fqo5.onrender.com";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --void:#020408;--deep:#060d14;--surface:#0a1628;--card:#0d1f35;--card2:#112240;
  --border:rgba(0,255,180,0.12);--border2:rgba(0,255,180,0.25);
  --cyan:#00ffb4;--cyan2:#00e09a;--cyan3:rgba(0,255,180,0.12);
  --red:#ff3860;--red2:rgba(255,56,96,0.12);
  --amber:#ffb800;--amber2:rgba(255,184,0,0.12);
  --blue:#00b4ff;--purple:#a855f7;
  --text:#e2f0ff;--text2:#7a9cc0;--text3:#3d5a7a;
  --mono:'JetBrains Mono',monospace;--display:'Orbitron',monospace;--body:'Space Grotesk',sans-serif;
}
html,body,#root{height:100%;background:var(--void);color:var(--text);font-family:var(--body);overflow:hidden}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)}
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 50% 0%,rgba(0,255,180,0.05) 0%,transparent 65%)}
.grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(rgba(0,255,180,0.06) 1px,transparent 1px);background-size:32px 32px}
.shell{display:grid;grid-template-columns:68px 1fr;grid-template-rows:52px 1fr;height:100vh}
.topbar{grid-column:1/-1;background:var(--deep);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:16px;position:relative;z-index:10}
.topbar::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);animation:scanH 4s ease-in-out infinite;opacity:0.6}
@keyframes scanH{0%,100%{opacity:0.3;transform:scaleX(0.3)}50%{opacity:1;transform:scaleX(1)}}
.logo-mark{font-family:var(--display);font-size:17px;font-weight:900;color:var(--cyan);letter-spacing:3px;text-shadow:0 0 24px rgba(0,255,180,0.5)}
.logo-sub{font-size:9px;color:var(--text3);letter-spacing:4px;text-transform:uppercase;font-family:var(--mono);margin-top:2px}
.topbar-right{margin-left:auto;display:flex;align-items:center;gap:14px}
.status-pill{display:flex;align-items:center;gap:6px;padding:4px 14px;border-radius:20px;border:1px solid var(--border2);background:var(--cyan3);font-size:10px;font-family:var(--mono);color:var(--cyan);letter-spacing:1px}
.status-dot{width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan);animation:pdot 2s ease-in-out infinite}
@keyframes pdot{0%,100%{opacity:1}50%{opacity:0.3}}
.time-disp{font-family:var(--mono);font-size:11px;color:var(--text3);letter-spacing:1px}
.sidebar{background:var(--deep);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:14px 0;gap:4px;z-index:10;position:relative}
.nav-ic{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;border:1px solid transparent;font-size:17px;color:var(--text3);position:relative}
.nav-ic:hover{background:var(--cyan3);color:var(--cyan);border-color:var(--border2)}
.nav-ic.act{background:var(--cyan3);color:var(--cyan);border-color:var(--border2);box-shadow:0 0 16px rgba(0,255,180,0.12)}
.nav-ic.act::before{content:'';position:absolute;left:-1px;top:50%;transform:translateY(-50%);width:3px;height:22px;border-radius:2px;background:var(--cyan);box-shadow:0 0 10px var(--cyan)}
.ndiv{width:30px;height:1px;background:var(--border);margin:6px 0}
.main{overflow-y:auto;overflow-x:hidden;background:var(--void);position:relative;z-index:1}
.main::-webkit-scrollbar{width:3px}
.main::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.page{padding:22px;animation:fin 0.3s ease}
@keyframes fin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ph{margin-bottom:22px}
.pt{font-family:var(--display);font-size:20px;font-weight:700;color:var(--text);letter-spacing:1px;display:flex;align-items:center;gap:12px}
.pt-acc{font-size:10px;font-family:var(--mono);color:var(--cyan);padding:3px 10px;border-radius:4px;border:1px solid var(--border2);background:var(--cyan3);letter-spacing:2px}
.ps{font-size:12px;color:var(--text3);margin-top:5px;font-family:var(--mono)}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
.sc{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden;cursor:default;transition:all 0.25s}
.sc:hover{border-color:var(--border2);transform:translateY(-2px)}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ac,var(--cyan));box-shadow:0 0 12px var(--ac,var(--cyan))}
.sc-icon{font-size:18px;margin-bottom:8px;opacity:0.7}
.sc-lbl{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;font-family:var(--mono);margin-bottom:5px}
.sc-val{font-family:var(--display);font-size:26px;font-weight:700;color:var(--ac,var(--cyan));text-shadow:0 0 20px var(--ac,rgba(0,255,180,0.3))}
.sc-sub{font-size:10px;color:var(--text3);margin-top:3px;font-family:var(--mono)}
.sc-corner{position:absolute;bottom:10px;right:14px;font-size:8px;font-family:var(--mono);color:var(--text3);letter-spacing:1px}
.cr{display:grid;grid-template-columns:1fr 1fr 2fr;gap:10px;margin-bottom:20px}
.cc{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;transition:border-color 0.2s}
.cc:hover{border-color:var(--border2)}
.ct{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);font-family:var(--mono);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.ct::before{content:'';width:10px;height:2px;background:var(--cyan);box-shadow:0 0 6px var(--cyan);border-radius:1px}
.sw{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px;position:relative;overflow:hidden}
.sw::before{content:'THREAT SCANNER';position:absolute;top:18px;right:22px;font-family:var(--mono);font-size:8px;letter-spacing:3px;color:var(--text3)}
.sir{display:flex;gap:10px;align-items:center}
.siw{flex:1;position:relative;display:flex;align-items:center}
.si-icon{position:absolute;left:14px;font-size:15px;color:var(--text3);pointer-events:none;z-index:1}
.si{width:100%;padding:13px 14px 13px 42px;background:var(--deep);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;transition:all 0.2s}
.si:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,255,180,0.07)}
.si::placeholder{color:var(--text3)}
.sb{padding:13px 28px;border-radius:10px;border:none;cursor:pointer;font-family:var(--display);font-size:12px;font-weight:700;letter-spacing:1px;transition:all 0.2s;background:var(--cyan);color:var(--void);position:relative;overflow:hidden}
.sb:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,255,180,0.3)}
.sb:disabled{background:var(--card2);color:var(--text3);cursor:not-allowed}
.sb.sc2{background:transparent;border:1px solid var(--cyan);color:var(--cyan);animation:scp 1s ease-in-out infinite}
@keyframes scp{0%,100%{box-shadow:0 0 8px rgba(0,255,180,0.2)}50%{box-shadow:0 0 24px rgba(0,255,180,0.5)}}
.rc{margin-top:18px;border-radius:12px;border:1px solid var(--rc,var(--cyan));background:linear-gradient(135deg,var(--card2),var(--card));padding:22px;animation:rci 0.4s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden}
.rc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--rc,var(--cyan)),transparent)}
@keyframes rci{from{opacity:0;transform:translateY(10px) scale(0.98)}to{opacity:1;transform:none}}
.rt{display:flex;justify-content:space-between;align-items:flex-start}
.ru{font-family:var(--display);font-size:18px;color:var(--text);font-weight:700}
.rm{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.rp{padding:3px 9px;border-radius:5px;font-size:10px;background:var(--deep);border:1px solid var(--border);font-family:var(--mono);color:var(--text2)}
.sdisp{text-align:center;flex-shrink:0}
.sring{width:84px;height:84px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid var(--rc,var(--cyan));background:radial-gradient(circle,rgba(0,0,0,0.5),transparent);box-shadow:0 0 20px rgba(0,0,0,0.4),inset 0 0 20px rgba(0,0,0,0.2);position:relative}
.sring::before{content:'';position:absolute;inset:-5px;border-radius:50%;border:1px solid var(--rc,var(--cyan));opacity:0.25}
.snum{font-family:var(--display);font-size:22px;font-weight:900;line-height:1}
.slbl{font-size:7px;font-family:var(--mono);color:var(--text3);letter-spacing:1px;margin-top:2px}
.rbadge{display:inline-block;margin-top:5px;padding:3px 11px;border-radius:20px;font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:1px;border:1px solid var(--rc,var(--cyan));color:var(--rc,var(--cyan));background:rgba(0,0,0,0.3)}
.str{height:3px;background:var(--deep);border-radius:2px;margin-top:14px;overflow:hidden}
.stf{height:100%;border-radius:2px;transition:width 1s cubic-bezier(0.16,1,0.3,1)}
.et{margin-top:14px;padding:12px 16px;border-radius:8px;background:var(--red2);border:1px solid rgba(255,56,96,0.25);color:#ff8099;font-size:12px;font-family:var(--mono);display:flex;align-items:center;gap:8px}
.ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.acard{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden}
.acard::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--cac,var(--cyan));box-shadow:0 0 8px var(--cac,var(--cyan))}
.acard:hover{border-color:var(--cac,var(--cyan));transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.4)}
.au{font-family:var(--mono);font-size:11px;color:var(--text2);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.av{font-family:var(--display);font-size:30px;font-weight:900;line-height:1;margin-bottom:3px}
.al{font-size:9px;font-family:var(--mono);letter-spacing:1px}
.ab{height:2px;background:var(--deep);border-radius:1px;margin-top:10px;overflow:hidden}
.abf{height:100%;border-radius:1px}
.asrc{position:absolute;top:10px;right:12px;font-size:8px;font-family:var(--mono);color:var(--text3);letter-spacing:1px}
.kh{background:linear-gradient(135deg,var(--card2),var(--card));border:1px solid var(--border);border-radius:14px;padding:28px;margin-bottom:18px;position:relative;overflow:hidden}
.kh::before{content:'';position:absolute;top:-40%;right:-15%;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(0,255,180,0.06),transparent 70%);pointer-events:none}
.kht{font-family:var(--display);font-size:24px;font-weight:900;margin-bottom:6px}
.khs{font-size:13px;color:var(--text2);max-width:580px;line-height:1.6}
.ksg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}
.ks{background:var(--deep);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center}
.ksv{font-family:var(--display);font-size:22px;font-weight:700;color:var(--cyan)}
.ksl{font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:3px;letter-spacing:1px}
.fg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px}
.fc{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;display:flex;gap:12px;align-items:flex-start;transition:all 0.2s}
.fc:hover{border-color:var(--border2)}
.fn2{width:30px;height:30px;border-radius:7px;flex-shrink:0;background:var(--cyan3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:11px;font-weight:700;color:var(--cyan)}
.fname{font-size:12px;font-weight:600;color:var(--text);margin-bottom:3px;font-family:var(--mono)}
.fdesc{font-size:11px;color:var(--text3);line-height:1.5}
.fimp{margin-top:6px;height:3px;border-radius:2px;background:var(--deep)}
.fif{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--cyan),var(--blue))}
.rs{margin-top:18px}
.rt2{font-size:9px;letter-spacing:2px;color:var(--text3);font-family:var(--mono);margin-bottom:10px;text-transform:uppercase}
.rl{display:flex;flex-direction:column;gap:7px}
.ri{background:var(--deep);border:1px solid var(--border);border-radius:8px;padding:9px 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all 0.2s}
.ri:hover{border-color:var(--border2);background:var(--card)}
.ru2{font-family:var(--mono);font-size:11px;color:var(--text2)}
.rsc{font-family:var(--display);font-size:13px;font-weight:700}
.rlbl{font-size:9px;font-family:var(--mono);padding:2px 8px;border-radius:4px}
.lw{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:10px}
.ls{width:38px;height:38px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.lt{font-family:var(--mono);font-size:11px;color:var(--text3);letter-spacing:2px;animation:blink 1.5s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
.es{text-align:center;padding:40px;color:var(--text3)}
.ei{font-size:40px;margin-bottom:10px;opacity:0.25}
.et2{font-family:var(--mono);font-size:12px;letter-spacing:1px}
.ctt{background:var(--card2);border:1px solid var(--border2);border-radius:8px;padding:9px 13px;font-family:var(--mono)}
.ctl{font-size:10px;color:var(--text3);margin-bottom:3px}
.ctv{font-size:15px;font-weight:700;color:var(--cyan)}
`;

const getRisk = (s) => s >= 70 ? 'var(--red)' : s >= 40 ? 'var(--amber)' : 'var(--cyan)';
const getRiskLabel = (s) => s >= 70 ? 'HIGH RISK' : s >= 40 ? 'MED RISK' : 'LOW RISK';

const CT = ({ active, payload, label }) => active && payload?.length ? (
  <div className="ctt"><div className="ctl">{label}</div><div className="ctv">{payload[0].value}</div></div>
) : null;

const FEATURES = [
  { num: '01', name: 'follow_ratio', desc: 'Followers ÷ Following+1. Bots follow thousands but have few real followers back.', imp: 0.312 },
  { num: '02', name: 'age_score', desc: 'Inverse of account age in days. Freshly created accounts are highly suspicious.', imp: 0.198 },
  { num: '03', name: 'tweet_count_log', desc: 'Log-scaled posting volume. Both zero tweets and millions of tweets signal bots.', imp: 0.147 },
  { num: '04', name: 'engagement_ratio', desc: '(Followers + Listed) ÷ Tweets+1. Measures authentic reach per post.', imp: 0.112 },
  { num: '05', name: 'no_profile_pic', desc: 'Binary flag. Bots almost never set a custom profile picture.', imp: 0.089 },
  { num: '06', name: 'listed_count_log', desc: 'Added to curated lists by humans — a strong community trust indicator.', imp: 0.067 },
  { num: '07', name: 'is_default', desc: 'Default profile flag — the account was never customized after creation.', imp: 0.031 },
  { num: '08', name: 'low_followers', desc: 'Binary: <50 followers means the account rarely achieved organic growth.', imp: 0.024 },
  { num: '09', name: 'no_description', desc: 'Binary: humans write bios. Bots consistently skip the description field.', imp: 0.013 },
  { num: '10', name: 'is_verified_int', desc: 'Verified accounts are almost exclusively legitimate users. Definitive signal.', imp: 0.007 },
];
const ScanBlock = () => (
    <div className="sw">
      <div className="sir">
        <div className="siw">
          <span className="si-icon">⌕</span>
          <input ref={inputRef} className="si" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()} placeholder="Enter username or account ID..." />
        </div>
        <button className={`sb ${scanning ? 'sc2' : ''}`} onClick={handleScan} disabled={scanning || !username.trim()}>
          {scanning ? '◈ SCANNING...' : '▶ SCAN'}
        </button>
      </div>
      {error && <div className="et">⚠ {error}</div>}
      {result && (
        <div className="rc" style={{ '--rc': getRisk(result.threat_score) }}>
          <div className="rt">
            <div>
              <div className="ru">@{result.username}</div>
              <div className="rm">
                {[['FOLLOWERS', result.followers_count], ['FOLLOWING', result.following_count], ['TWEETS', result.tweet_count], ['AGE', result.account_age_days != null ? result.account_age_days + 'd' : 'N/A'], ['VERIFIED', result.is_verified ? 'YES' : 'NO']].map(([k, v]) => (
                  <span key={k} className="rp">{k}: <strong style={{ color: 'var(--text)' }}>{v ?? 'N/A'}</strong></span>
                ))}
              </div>
              <div className="rbadge">{getRiskLabel(result.threat_score)}</div>
            </div>
            <div className="sdisp">
              <div className="sring" style={{ '--rc': getRisk(result.threat_score) }}>
                <div className="snum" style={{ color: getRisk(result.threat_score) }}>{result.threat_score}</div>
                <div className="slbl">THREAT</div>
              </div>
            </div>
          </div>
          <div className="str"><div className="stf" style={{ width: result.threat_score + '%', background: getRisk(result.threat_score), boxShadow: `0 0 8px ${getRisk(result.threat_score)}` }} /></div>
        </div>
      )}
      {recentScans.length > 0 && (
        <div className="rs">
          <div className="rt2">◈ Recent Scans</div>
          <div className="rl">
            {recentScans.map((s, i) => (
              <div key={i} className="ri" onClick={() => { setUsername(s.username); setResult(s); }}>
                <span className="ru2">@{s.username}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="rlbl" style={{ background: `${getRisk(s.threat_score)}18`, color: getRisk(s.threat_score), border: `1px solid ${getRisk(s.threat_score)}33` }}>{getRiskLabel(s.threat_score)}</span>
                  <span className="rsc" style={{ color: getRisk(s.threat_score) }}>{s.threat_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const [time, setTime] = useState(new Date());
  const inputRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await axios.get(`${API}/health`);
      const [s, a] = await Promise.all([axios.get(`${API}/stats`), axios.get(`${API}/accounts`)]);
      setStats(s.data); setAccounts(a.data);
    } catch { setTimeout(loadData, 8000); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleScan = async () => {
    if (!username.trim()) return;
    setScanning(true); setError(''); setResult(null);
    try {
      const res = await axios.post(`${API}/predict`, { username: username.trim() });
      setResult(res.data);
      setRecentScans(prev => [res.data, ...prev.filter(r => r.username !== res.data.username)].slice(0, 5));
    } catch (e) { setError(e.response?.data?.error || 'Account not found in database'); }
    setScanning(false);
  };

  const pieData = stats ? [{ name: 'Bots', value: stats.total_bots }, { name: 'Legit', value: stats.total_accounts - stats.total_bots }] : [];
  const riskData = [
    { name: 'HIGH', value: accounts.filter(a => (a.threat_score || 0) >= 70).length, fill: 'var(--red)' },
    { name: 'MED', value: accounts.filter(a => (a.threat_score || 0) >= 40 && (a.threat_score || 0) < 70).length, fill: 'var(--amber)' },
    { name: 'LOW', value: accounts.filter(a => (a.threat_score || 0) < 40).length, fill: 'var(--cyan)' },
  ];
  const areaData = accounts.slice(0, 24).map((a, i) => ({ i: i + 1, score: a.threat_score || 0 }));

  

  const renderPage = () => {
    if (loading) return <div className="lw"><div className="ls" /><div className="lt">INITIALIZING THREAT MATRIX...</div></div>;

    if (page === 'dashboard') return (
      <>
        <div className="ph">
          <div className="pt">THREAT OVERVIEW <span className="pt-acc">LIVE</span></div>
          <div className="ps">// real-time social network threat intelligence</div>
        </div>
        <div className="sg">
          {[
            { lbl: 'TOTAL ACCOUNTS', val: stats?.total_accounts?.toLocaleString() ?? '—', sub: 'analyzed records', icon: '◎', ac: 'var(--cyan)', corner: 'DATASET' },
            { lbl: 'BOT ACCOUNTS', val: stats?.total_bots?.toLocaleString() ?? '—', sub: stats ? ((stats.total_bots / stats.total_accounts) * 100).toFixed(1) + '% of total' : '—', icon: '⚠', ac: 'var(--red)', corner: 'CONFIRMED' },
            { lbl: 'HIGH RISK', val: stats?.high_risk_count ?? '—', sub: 'score ≥ 70', icon: '◈', ac: 'var(--amber)', corner: 'SCORE ≥ 70' },
            { lbl: 'AVG THREAT', val: stats ? stats.avg_threat_score + '%' : '—', sub: 'mean score', icon: '≋', ac: 'var(--purple)', corner: 'XGBOOST' },
          ].map((c, i) => (
            <div key={i} className="sc" style={{ '--ac': c.ac }}>
              <div className="sc-icon">{c.icon}</div>
              <div className="sc-lbl">{c.lbl}</div>
              <div className="sc-val">{c.val}</div>
              <div className="sc-sub">{c.sub}</div>
              <div className="sc-corner">{c.corner}</div>
            </div>
          ))}
        </div>
        <div className="cr">
          <div className="cc">
            <div className="ct">BOT vs LEGIT</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={4}><Cell fill="var(--red)" /><Cell fill="var(--cyan)" /></Pie><Tooltip content={<CT />} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="cc">
            <div className="ct">RISK BREAKDOWN</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={riskData} barSize={26}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
                <YAxis hide /><Tooltip content={<CT />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>{riskData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="cc">
            <div className="ct">THREAT DISTRIBUTION — TOP 24</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={areaData}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.25} /><stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="i" hide /><YAxis domain={[0, 100]} hide /><Tooltip content={<CT />} />
                <Area type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={1.5} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ScanBlock
  username={username}
  setUsername={setUsername}
  scanning={scanning}
  handleScan={handleScan}
  error={error}
  result={result}
  recentScans={recentScans}
  inputRef={inputRef}
/>
        <div style={{ marginBottom: 20 }}>
          <div className="ct" style={{ marginBottom: 14 }}>FLAGGED ACCOUNTS — TOP THREATS</div>
          {accounts.length === 0 ? <div className="es"><div className="ei">◎</div><div className="et2">NO SCORED ACCOUNTS</div></div> : (
            <div className="ag">
              {accounts.slice(0, 12).map((acc, i) => (
                <div key={i} className="acard" style={{ '--cac': getRisk(acc.threat_score || 0) }} onClick={() => { setUsername(acc.username); setPage('scanner'); }}>
                  <div className="asrc">{acc.source?.toUpperCase()}</div>
                  <div className="au">@{acc.username}</div>
                  <div className="av" style={{ color: getRisk(acc.threat_score || 0) }}>{acc.threat_score ?? '—'}</div>
                  <div className="al" style={{ color: getRisk(acc.threat_score || 0) }}>{getRiskLabel(acc.threat_score || 0)}</div>
                  <div className="ab"><div className="abf" style={{ width: (acc.threat_score || 0) + '%', background: getRisk(acc.threat_score || 0) }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );

    if (page === 'scanner') return (
      <>
        <div className="ph">
          <div className="pt">THREAT SCANNER <span className="pt-acc">ML POWERED</span></div>
          <div className="ps">// xgboost classifier · 85%+ accuracy · real-time predictions</div>
        </div>
        <ScanBlock
  username={username}
  setUsername={setUsername}
  scanning={scanning}
  handleScan={handleScan}
  error={error}
  result={result}
  recentScans={recentScans}
  inputRef={inputRef}
/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="cc">
            <div className="ct">HOW SCORING WORKS</div>
            {[['0–39', 'LOW RISK', 'var(--cyan)', 'Likely a legitimate human account with normal behavioral patterns'],
              ['40–69', 'MED RISK', 'var(--amber)', 'Suspicious signals detected. Manual investigation recommended'],
              ['70–100', 'HIGH RISK', 'var(--red)', 'Strong bot indicators confirmed. Automated behavior detected']].map(([r, l, c, d]) => (
              <div key={r} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--display)', fontSize: 12, color: c, fontWeight: 700 }}>{r}</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: c, padding: '2px 7px', border: `1px solid ${c}44`, borderRadius: 4, background: `${c}11` }}>{l}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
          <div className="cc">
            <div className="ct">MODEL PERFORMANCE</div>
            {[['Accuracy', '85.7%', 0.857], ['Precision', '87.0%', 0.87], ['Recall', '84.0%', 0.84], ['F1-Score', '85.0%', 0.85], ['AUC-ROC', '93.1%', 0.931]].map(([k, v, p]) => (
              <div key={k} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{k}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--display)', color: 'var(--cyan)', fontWeight: 700 }}>{v}</span>
                </div>
                <div style={{ height: 3, background: 'var(--deep)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: p * 100 + '%', height: '100%', background: 'linear-gradient(90deg,var(--cyan),var(--blue))', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );

    if (page === 'accounts') return (
      <>
        <div className="ph">
          <div className="pt">ALL ACCOUNTS <span className="pt-acc">{accounts.length} RECORDS</span></div>
          <div className="ps">// all scored accounts ordered by threat level — click any card to scan</div>
        </div>
        {accounts.length === 0 ? <div className="es"><div className="ei">◎</div><div className="et2">NO SCORED ACCOUNTS FOUND</div></div> : (
          <div className="ag">
            {accounts.map((acc, i) => (
              <div key={i} className="acard" style={{ '--cac': getRisk(acc.threat_score || 0) }} onClick={() => { setUsername(acc.username); setPage('scanner'); }}>
                <div className="asrc">{acc.source?.toUpperCase()}</div>
                <div className="au">@{acc.username}</div>
                <div className="av" style={{ color: getRisk(acc.threat_score || 0) }}>{acc.threat_score ?? '—'}</div>
                <div className="al" style={{ color: getRisk(acc.threat_score || 0) }}>{getRiskLabel(acc.threat_score || 0)}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 5 }}>{acc.followers_count != null ? acc.followers_count + ' followers' : 'no metadata'}</div>
                <div className="ab"><div className="abf" style={{ width: (acc.threat_score || 0) + '%', background: getRisk(acc.threat_score || 0) }} /></div>
              </div>
            ))}
          </div>
        )}
      </>
    );

    if (page === 'analytics') return (
      <>
        <div className="ph">
          <div className="pt">ANALYTICS <span className="pt-acc">DEEP DIVE</span></div>
          <div className="ps">// comprehensive threat intelligence breakdown</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="cc">
            <div className="ct">BOT vs LEGIT SPLIT</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} dataKey="value" paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'var(--text3)', strokeWidth: 0.5 }}><Cell fill="var(--red)" /><Cell fill="var(--cyan)" /></Pie><Tooltip content={<CT />} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="cc">
            <div className="ct">RISK LEVEL DISTRIBUTION</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskData} barSize={38}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<CT />} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>{riskData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="cc" style={{ marginBottom: 12 }}>
          <div className="ct">THREAT SCORE TREND — TOP 24</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={areaData}>
              <defs><linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="i" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<CT />} />
              <Area type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={2} fill="url(#ag2)" dot={{ fill: 'var(--cyan)', r: 2, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="cc">
          <div className="ct">SUMMARY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
            {[['Dataset', stats?.total_accounts?.toLocaleString() ?? '—', 'accounts'], ['Bot Rate', stats ? ((stats.total_bots / stats.total_accounts) * 100).toFixed(1) + '%' : '—', 'of total'], ['High Risk', stats?.high_risk_count ?? '—', 'accounts'], ['Avg Score', stats?.avg_threat_score ?? '—', '/100'], ['Model', '85.7%', 'accuracy']].map(([l, v, s]) => (
              <div key={l} style={{ background: 'var(--deep)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 2, marginBottom: 5 }}>{l}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>{v}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );

    if (page === 'kaggle') return (
      <>
        <div className="ph">
          <div className="pt">KAGGLE DATASET <span className="pt-acc">DATA SOURCE</span></div>
          <div className="ps">// twitter bot detection dataset · 37,438 labeled accounts</div>
        </div>
        <div className="kh">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: 3, marginBottom: 7 }}>◈ TRAINING DATA</div>
              <div className="kht"><span style={{ color: 'var(--cyan)' }}>KAGGLE</span> BOT DETECTION DATASET</div>
              <div className="khs">Twitter/X bot detection dataset by David Martin Gutierrez. 37,438 labeled accounts form the foundation of the XGBoost threat classifier. Each account labeled as bot or human by researchers.</div>
            </div>
            <div style={{ padding: '7px 18px', background: 'var(--cyan3)', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', whiteSpace: 'nowrap', letterSpacing: 2 }}>KAGGLE.COM</div>
          </div>
          <div className="ksg">
            {[['37,438', 'TOTAL ACCOUNTS'], ['12,425', 'BOTS — 33.2%'], ['25,013', 'LEGIT — 66.8%']].map(([v, l]) => (
              <div key={l} className="ks"><div className="ksv">{v}</div><div className="ksl">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="ct" style={{ marginBottom: 14 }}>ENGINEERED FEATURES — XGBOOST INPUT VECTOR</div>
        <div className="fg">
          {FEATURES.map(f => (
            <div key={f.num} className="fc">
              <div className="fn2">{f.num}</div>
              <div style={{ flex: 1 }}>
                <div className="fname">{f.name}</div>
                <div className="fdesc">{f.desc}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div className="fimp" style={{ flex: 1 }}><div className="fif" style={{ width: f.imp * 320 + '%' }} /></div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--cyan)', whiteSpace: 'nowrap' }}>{(f.imp * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cc">
          <div className="ct">FEATURE IMPORTANCE RANKING</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[...FEATURES].sort((a, b) => b.imp - a.imp)} layout="vertical" barSize={10}>
              <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.7} /><stop offset="100%" stopColor="var(--blue)" /></linearGradient></defs>
              <XAxis type="number" hide domain={[0, 0.35]} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 10, fontFamily: 'var(--mono)' }} width={155} axisLine={false} tickLine={false} />
              <Tooltip content={<CT />} />
              <Bar dataKey="imp" radius={[0, 4, 4, 0]} fill="url(#bg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="grid-bg" />
      <div className="shell">
        <div className="topbar">
          <div><div className="logo-mark">THREATNET</div><div className="logo-sub">INTELLIGENCE PLATFORM</div></div>
          <div style={{ width: 1, height: 28, background: 'var(--border)', marginLeft: 6 }} />
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1 }}>X (TWITTER) · BOT DETECTION · ML CLASSIFIER</div>
          <div className="topbar-right">
            <div className="status-pill"><div className="status-dot" />{loading ? 'INITIALIZING' : 'SYSTEM ONLINE'}</div>
            <div className="time-disp">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        <div className="sidebar">
          {[{ id: 'dashboard', icon: '⊞' }, { id: 'scanner', icon: '⌕' }, { id: 'accounts', icon: '◉' }, { id: 'analytics', icon: '≋' }].map(n => (
            <div key={n.id} className={`nav-ic ${page === n.id ? 'act' : ''}`} onClick={() => setPage(n.id)} title={n.id.charAt(0).toUpperCase() + n.id.slice(1)}>{n.icon}</div>
          ))}
          <div className="ndiv" />
          <div className={`nav-ic ${page === 'kaggle' ? 'act' : ''}`} onClick={() => setPage('kaggle')} title="Kaggle Dataset">◈</div>
          <div style={{ marginTop: 'auto' }}><div className="ndiv" /><div className="nav-ic" onClick={loadData} title="Refresh">↻</div></div>
        </div>
        <main className="main"><div className="page">{renderPage()}</div></main>
      </div>
    </>
  );
}
