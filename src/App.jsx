import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Search, Eraser, Activity, BookOpen, Zap, Crosshair } from 'lucide-react';

const LOADING_LINES = [
  'parsing signal vector',
  'indexing semantic anchors',
  'cross-referencing cultural graph',
  'compiling narrative topology',
  'rendering mindmap',
];

const TAGLINES = [
  "Built by a trader, for traders. Who has time to read walls of text when the chart is moving? Paste anything — NarraScan gets you the narrative in seconds.",
  "If you can copy text, you can research any coin.",
  "Built for traders who move fast and can't afford to miss the narrative.",
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function runAnalysisBackend(text) {
  const res = await fetch(`${API_URL}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text.slice(0, 4000) }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.detail || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const raw = data.result;

  try {
    const m = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(m ? m[0] : raw);
  } catch {
    return {
      tldr: { headline: "Analysis complete", detail: raw.slice(0, 200), verdict: "NARRATIVE" },
      narrative: [raw.slice(0, 100)],
      background: ["See detail above"],
    };
  }
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@600;700;800&display=swap');

.ns-root,
.ns-root * { box-sizing: border-box; }

.ns-root {
  --bg:        #060a0f;
  --bg-1:      #0a1118;
  --bg-2:      #0e1722;
  --bg-3:      #13202c;
  --line:      rgba(0, 217, 126, 0.10);
  --line-2:    rgba(0, 217, 126, 0.22);
  --line-3:    rgba(0, 217, 126, 0.45);
  --accent:    #00d97e;
  --accent-d:  #009a5a;
  --glow:      rgba(0, 217, 126, 0.30);
  --glow-soft: rgba(0, 217, 126, 0.10);
  --text:      #e6f4ec;
  --text-2:    #97a8a1;
  --text-3:    #56655e;

  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.ns-root::before {
  content: '';
  position: fixed; inset: 0;
  background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,217,126,.012) 2px 3px);
  pointer-events: none; z-index: 0;
}
.ns-root::after {
  content: '';
  position: fixed; inset: 0;
  background:
    radial-gradient(60% 50% at 12% 0%,  rgba(0,217,126,.10), transparent 70%),
    radial-gradient(50% 40% at 92% 8%,  rgba(0,217,126,.05), transparent 70%),
    radial-gradient(80% 60% at 50% 110%, rgba(0,217,126,.06), transparent 70%);
  pointer-events: none; z-index: 0;
}
.ns-grid {
  position: fixed; inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 0%, transparent 80%);
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 0%, transparent 80%);
  pointer-events: none; z-index: 1;
}
.ns-scanline {
  position: fixed; inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,217,126,.05) 50%, transparent 100%);
  height: 240px;
  animation: nsScan 8s linear infinite;
  pointer-events: none; z-index: 1; opacity: .55;
}
@keyframes nsScan {
  0%   { transform: translateY(-30vh); }
  100% { transform: translateY(120vh); }
}

.ns-shell {
  position: relative; z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 22px 32px 80px;
}
@media (max-width: 720px) {
  .ns-shell { padding: 18px 18px 60px; }
}

.ns-topbar {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--line-2);
  padding-bottom: 12px;
  font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--text-2);
  gap: 16px; flex-wrap: wrap;
}
.ns-brand { display: flex; align-items: center; gap: 12px; }
.ns-brand-mark {
  width: 9px; height: 9px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent), 0 0 18px var(--glow);
  animation: nsPulse 2.4s ease-in-out infinite;
}
@keyframes nsPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .55; transform: scale(.82); }
}
.ns-brand-name {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: 13px; letter-spacing: .22em; color: var(--text);
}
.ns-brand-version { color: var(--text-3); }
.ns-statusrow { display: flex; gap: 22px; flex-wrap: wrap; }
.ns-statusrow span b { color: var(--accent); font-weight: 700; }

.ns-hero { padding: 56px 0 28px; }
.ns-hero-tag {
  display: flex; align-items: center; gap: 12px;
  font-size: 10px; letter-spacing: .32em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 18px;
}
.ns-hero-tag .line { flex: 1; max-width: 220px; height: 1px; background: var(--accent); opacity: .6; }
.ns-hero-title {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(46px, 9.4vw, 104px);
  line-height: .9; letter-spacing: -.045em;
  margin: 0 0 18px; color: var(--text);
}
.ns-hero-title em {
  font-style: normal; color: var(--accent);
  text-shadow: 0 0 22px var(--glow);
}
.ns-hero-sub {
  max-width: 620px;
  font-size: 13px; line-height: 1.75; color: var(--text-2);
}
.ns-hero-sub b { color: var(--text); font-weight: 500; }

.ns-tagline-slot {
  margin-top: 22px;
  min-height: 38px;
  max-width: 620px;
  position: relative;
}
.ns-tagline {
  position: absolute; inset: 0;
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 12px; line-height: 1.55; letter-spacing: .015em;
  color: var(--text-2);
  font-style: italic;
  opacity: 0;
  animation: nsTaglineCycle 6500ms ease-in-out forwards;
}
.ns-tagline .arrow {
  color: var(--accent);
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0;
  text-shadow: 0 0 10px var(--glow);
  flex: 0 0 auto;
}
@keyframes nsTaglineCycle {
  0%   { opacity: 0; transform: translateY(4px); }
  8%   { opacity: 1; transform: translateY(0); }
  92%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
}

.ns-panel {
  position: relative;
  margin-top: 36px;
  background: linear-gradient(180deg, var(--bg-1) 0%, var(--bg) 100%);
  border: 1px solid var(--line-2);
  transition: border-color .25s ease, box-shadow .25s ease;
}
.ns-panel.is-focus {
  border-color: var(--line-3);
  box-shadow: 0 0 0 1px var(--glow-soft), 0 0 60px -20px var(--glow);
}
.ns-bracket { position: absolute; width: 14px; height: 14px; border: 1px solid var(--accent); pointer-events: none; }
.ns-bracket.tl { top: -1px; left: -1px;  border-right: 0; border-bottom: 0; }
.ns-bracket.tr { top: -1px; right: -1px; border-left: 0;  border-bottom: 0; }
.ns-bracket.bl { bottom: -1px; left: -1px;  border-right: 0; border-top: 0; }
.ns-bracket.br { bottom: -1px; right: -1px; border-left: 0;  border-top: 0; }

.ns-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 18px;
  border-bottom: 1px solid var(--line);
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
  color: var(--text-2);
}
.ns-panel-head .left { display: flex; align-items: center; gap: 10px; }
.ns-panel-head .live {
  color: var(--accent); display: flex; align-items: center; gap: 8px;
}
.ns-panel-head .live::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 8px var(--accent);
  animation: nsPulse 1.6s ease-in-out infinite;
}

.ns-textarea {
  width: 100%;
  min-height: 220px;
  background: transparent;
  border: 0;
  padding: 22px 24px;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; line-height: 1.7;
  resize: vertical;
  outline: none;
  caret-color: var(--accent);
}
.ns-textarea::placeholder { color: rgba(0, 217, 126, 0.45); }
.ns-textarea::selection { background: var(--accent); color: var(--bg); }

.ns-actions {
  display: flex; gap: 12px;
  margin-top: 18px;
  align-items: stretch;
  flex-wrap: wrap;
}
.ns-btn {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700; font-size: 12.5px; letter-spacing: .22em; text-transform: uppercase;
  padding: 17px 26px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  display: inline-flex; align-items: center; gap: 12px; justify-content: center;
  transition: all 200ms ease;
  position: relative; overflow: hidden;
  user-select: none;
}
.ns-btn-primary {
  background: var(--accent);
  color: var(--bg);
  flex: 1; min-width: 220px;
  box-shadow: 0 0 0 0 var(--glow);
}
.ns-btn-primary::before {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.07) 8px 9px);
  pointer-events: none;
}
.ns-btn-primary:hover:not(:disabled) {
  box-shadow: 0 0 36px var(--glow), inset 0 0 22px rgba(0,0,0,.15);
  transform: translateY(-1px);
}
.ns-btn-primary:disabled {
  opacity: .45; cursor: not-allowed;
  background: transparent; color: var(--accent);
}
.ns-btn-ghost:hover {
  background: rgba(0, 217, 126, 0.06);
  box-shadow: inset 0 0 20px var(--glow-soft);
}

.ns-loading {
  margin-top: 22px;
  font-size: 12px;
  color: var(--accent);
  display: flex; align-items: center; gap: 12px;
  letter-spacing: .12em; text-transform: uppercase;
  min-height: 18px;
}
.ns-loading-bar {
  flex: 1; max-width: 320px; height: 1px; background: var(--line-2);
  position: relative; overflow: hidden;
}
.ns-loading-bar::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  width: 50%;
  animation: nsScanLine 1.4s linear infinite;
}
@keyframes nsScanLine {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(220%); }
}
.ns-blink { animation: nsBlink .9s steps(2) infinite; }
@keyframes nsBlink {
  0%, 50%   { opacity: 1; }
  51%, 100% { opacity: .25; }
}

.ns-error {
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px solid rgba(255,80,80,.3);
  background: rgba(255,80,80,.06);
  color: #ff7788;
  font-size: 12px;
  letter-spacing: .05em;
}

.ns-results { margin-top: 56px; animation: nsFade .6s ease backwards; }
@keyframes nsFade { from { opacity: 0; } to { opacity: 1; } }

.ns-results-bar {
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid var(--line-2);
  border-bottom: 1px solid var(--line-2);
  padding: 12px 4px;
  margin-bottom: 36px;
  font-size: 10.5px; letter-spacing: .22em; text-transform: uppercase;
  color: var(--text-2);
  gap: 16px; flex-wrap: wrap;
}
.ns-results-bar b { color: var(--accent); font-weight: 700; }
.ns-results-bar .verdict {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 4px 10px; border: 1px solid var(--accent);
  color: var(--accent); background: var(--glow-soft);
}
.ns-results-bar .verdict::before {
  content: ''; width: 6px; height: 6px;
  background: var(--accent); border-radius: 50%;
  box-shadow: 0 0 8px var(--accent);
}

.ns-mindmap {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.45fr 1fr;
  gap: 36px;
  align-items: stretch;
}
@media (max-width: 920px) {
  .ns-mindmap { grid-template-columns: 1fr; gap: 16px; }
}
.ns-svg-layer {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
  overflow: visible;
}
.ns-svg-layer .conn {
  fill: none; stroke: var(--accent); stroke-width: 1.1;
  stroke-dasharray: 5 6; opacity: .55;
  animation: nsDash 24s linear infinite;
}
.ns-svg-layer .conn-glow {
  fill: none; stroke: var(--accent); stroke-width: 6;
  opacity: .07; filter: blur(4px);
}
@keyframes nsDash {
  to { stroke-dashoffset: -1000; }
}

.ns-node {
  position: relative; z-index: 1;
  background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
  border: 1px solid var(--line-2);
  padding: 18px 20px 20px;
  display: flex; flex-direction: column; gap: 14px;
  animation: nsRise .6s cubic-bezier(.16,1,.3,1) backwards;
}
.ns-node:hover { border-color: var(--line-3); }
.ns-node-narrative   { grid-column: 1; animation-delay: 100ms; }
.ns-node-tldr        { grid-column: 2; animation-delay: 0ms;   }
.ns-node-background  { grid-column: 3; animation-delay: 160ms; }
@media (max-width: 920px) {
  .ns-node-narrative,
  .ns-node-tldr,
  .ns-node-background { grid-column: 1; }
}
@keyframes nsRise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ns-node-tldr {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0,217,126,.16), transparent 60%),
    linear-gradient(180deg, var(--bg-3) 0%, var(--bg-1) 100%);
  border-color: var(--line-3);
  padding: 22px 24px 26px;
  box-shadow: 0 0 90px -22px var(--glow), inset 0 0 60px -28px var(--glow);
}

.ns-node-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}
.ns-node-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
  color: var(--text-2);
}
.ns-node-label .ico {
  width: 24px; height: 24px;
  display: grid; place-items: center;
  background: rgba(0, 217, 126, .08);
  border: 1px solid var(--line-2);
  color: var(--accent);
}
.ns-node-id { font-size: 10px; letter-spacing: .2em; color: var(--text-3); }
.ns-node-tldr .ns-node-label { color: var(--accent); }
.ns-node-tldr .ns-node-label .ico {
  background: rgba(0, 217, 126, .14);
  border-color: var(--line-3);
}

.ns-tldr-headline {
  font-family: 'Syne', sans-serif; font-weight: 700;
  font-size: clamp(18px, 2.1vw, 22px); line-height: 1.4;
  letter-spacing: -.012em; color: var(--text); margin: 0;
}
.ns-tldr-headline .punch { color: var(--accent); text-shadow: 0 0 14px var(--glow); }
.ns-tldr-detail { font-size: 12.5px; line-height: 1.7; color: var(--text-2); margin: 0; }

.ns-bullets {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.ns-bullets li {
  font-size: 12.5px; line-height: 1.6;
  color: var(--text);
  display: flex; gap: 10px;
  position: relative;
}
.ns-bullets li::before {
  content: 'u25ba';
  color: var(--accent);
  font-size: 8px;
  flex: 0 0 auto;
  margin-top: 6px;
  opacity: .75;
}
.ns-bullets li::after {
  content: ''; position: absolute; left: 14px; right: 0; bottom: -5px; height: 1px;
  background: linear-gradient(90deg, var(--line) 0%, transparent 60%);
}
.ns-bullets li:last-child::after { display: none; }

.ns-foot {
  margin-top: 64px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-between;
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
  color: var(--text-3);
  gap: 16px; flex-wrap: wrap;
}
.ns-foot .dot { color: var(--accent); }

.ns-boot { animation: nsFade .9s ease backwards; }

@media (max-width: 720px) {
  .ns-hero { padding: 28px 0 18px; }
  .ns-results { margin-top: 36px; }
  .ns-btn { padding: 14px 20px; }
  .ns-btn-primary { min-width: 0; }
}
`;

export default function NarraScan() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTaglineIndex((i) => (i + 1) % TAGLINES.length), 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_LINES.length), 350);
    return () => clearInterval(id);
  }, [loading]);

  const handleResearch = useCallback(async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const r = await runAnalysisBackend(input);
      setResult(r);
    } catch (e) {
      setError('Error: ' + (e.message || 'Unknown error.'));
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleClear = useCallback(() => {
    setInput('');
    setResult(null);
    setError('');
  }, []);

  const ts = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <div className="ns-root">
      <div className="ns-grid" aria-hidden />
      <div className="ns-scanline" aria-hidden />

      <div className="ns-shell ns-boot">
        <div className="ns-topbar">
          <div className="ns-brand">
            <span className="ns-brand-mark" />
            <span className="ns-brand-name">NARRASCAN</span>
            <span className="ns-brand-version">// v1.0</span>
          </div>
          <div className="ns-statusrow">
            <span>node <b>online</b></span>
            <span>model <b>claude sonnet</b></span>
            <span>{ts}</span>
          </div>
        </div>

        <header className="ns-hero">
          <div className="ns-hero-tag">
            <Crosshair size={12} strokeWidth={1.6} />
            <span>narrative · cartography</span>
            <span className="line" />
          </div>
          <h1 className="ns-hero-title">
            Map the <em>meme</em>.<br />
            Read the room.
          </h1>
          <p className="ns-hero-sub">
            See a coin you don&apos;t understand? Paste the text. NarraScan <b>finds out the narrative</b> instantly.
          </p>
          <div className="ns-tagline-slot" aria-live="polite">
            <p className="ns-tagline" key={taglineIndex}>
              <span className="arrow">›</span>
              <span>{TAGLINES[taglineIndex]}</span>
            </p>
          </div>
        </header>

        <div className={`ns-panel ${focused ? 'is-focus' : ''}`}>
          <span className="ns-bracket tl" />
          <span className="ns-bracket tr" />
          <span className="ns-bracket bl" />
          <span className="ns-bracket br" />
          <div className="ns-panel-head">
            <div className="left"><span>input · raw signal</span></div>
            <span className="live">awaiting payload</span>
          </div>
          <textarea
            className="ns-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={'// paste a tweet thread, telegram dump, article, news clip…\n// example: $BONK is back in flow on SOL, replays of the original launch chart…'}
            spellCheck={false}
          />
        </div>

        <div className="ns-actions">
          <button className="ns-btn ns-btn-primary" onClick={handleResearch} disabled={!input.trim() || loading}>
            <Search size={14} strokeWidth={2.4} />
            {loading ? 'analyzing…' : 'research'}
          </button>
          <button className="ns-btn ns-btn-ghost" onClick={handleClear} disabled={loading}>
            <Eraser size={14} strokeWidth={2.2} />
            clr
          </button>
        </div>

        {loading && (
          <div className="ns-loading">
            <span className="ns-blink">»</span>
            <span>{LOADING_LINES[loadingStep]}</span>
            <span className="ns-loading-bar" />
          </div>
        )}

        {error && <div className="ns-error">{error}</div>}

        {result && <ResultMindmap data={result} ts={ts} />}

        <div className="ns-foot">
          <span><span className="dot">●</span> narrascan</span>
          <span>no financial advice · research only</span>
          <span>↳ powered by claude api</span>
        </div>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function ResultMindmap({ data, ts }) {
  const wrapRef = useRef(null);
  const tldrRef = useRef(null);
  const narrRef = useRef(null);
  const backRef = useRef(null);
  const [paths, setPaths] = useState([]);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const c = tldrRef.current;
    if (!wrap || !c) return;
    const wb = wrap.getBoundingClientRect();
    const cb = c.getBoundingClientRect();
    const cy = cb.top + cb.height / 2 - wb.top;

    const computePath = (el, side) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2 - wb.left;
      const ey = r.top + r.height / 2 - wb.top;
      const ax = side === 'left' ? cb.left - wb.left : cb.right - wb.left;
      const ay = cy;
      const mx = (ax + ex) / 2;
      return `M ${ax} ${ay} C ${mx} ${ay} ${mx} ${ey} ${ex} ${ey}`;
    };

    const newPaths = [
      computePath(narrRef.current, 'left'),
      computePath(backRef.current, 'right'),
    ].filter(Boolean);
    setPaths(newPaths);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    const t1 = setTimeout(measure, 80);
    const t2 = setTimeout(measure, 320);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(t1); clearTimeout(t2);
    };
  }, [measure, data]);

  return (
    <section className="ns-results">
      <div className="ns-results-bar">
        <span>analysis · <b>complete</b> · {ts}</span>
        <span className="verdict">{data.tldr?.verdict ?? 'NARRATIVE'}</span>
      </div>

      <div className="ns-mindmap" ref={wrapRef}>
        <svg className="ns-svg-layer" aria-hidden>
          {paths.map((d, i) => (
            <g key={i}>
              <path d={d} className="conn-glow" />
              <path d={d} className="conn" />
            </g>
          ))}
        </svg>

        <article className="ns-node ns-node-narrative" ref={narrRef}>
          <span className="ns-bracket tl" /><span className="ns-bracket tr" />
          <span className="ns-bracket bl" /><span className="ns-bracket br" />
          <div className="ns-node-head">
            <div className="ns-node-label">
              <span className="ico"><Activity size={12} strokeWidth={2} /></span>
              narrative · context
            </div>
            <span className="ns-node-id">// 01</span>
          </div>
          <ul className="ns-bullets">
            {(data.narrative || []).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </article>

        <article className="ns-node ns-node-tldr" ref={tldrRef}>
          <span className="ns-bracket tl" /><span className="ns-bracket tr" />
          <span className="ns-bracket bl" /><span className="ns-bracket br" />
          <div className="ns-node-head">
            <div className="ns-node-label">
              <span className="ico"><Zap size={12} strokeWidth={2.4} /></span>
              summary · key insight
            </div>
            <span className="ns-node-id">// 00</span>
          </div>
          <p className="ns-tldr-headline">
            <span className="punch">»</span> {data.tldr?.headline}
          </p>
          <p className="ns-tldr-detail">{data.tldr?.detail}</p>
        </article>

        <article className="ns-node ns-node-background" ref={backRef}>
          <span className="ns-bracket tl" /><span className="ns-bracket tr" />
          <span className="ns-bracket bl" /><span className="ns-bracket br" />
          <div className="ns-node-head">
            <div className="ns-node-label">
              <span className="ico"><BookOpen size={12} strokeWidth={2} /></span>
              background · reference
            </div>
            <span className="ns-node-id">// 02</span>
          </div>
          <ul className="ns-bullets">
            {(data.background || []).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </article>
      </div>
    </section>
  );
}
