<!DOCTYPE html>
<html lang="en">
  
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ReviewForge X — README</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060810;
    --surface: #0d1117;
    --surface2: #161b22;
    --surface3: #1c2330;
    --border: rgba(48, 255, 160, 0.15);
    --border2: rgba(255,255,255,0.06);
    --accent: #30ffa0;
    --accent2: #7c6aff;
    --accent3: #ff6a6a;
    --accent4: #ffc84a;
    --text: #e6edf3;
    --muted: #7d8590;
    --mono: 'Space Mono', monospace;
    --sans: 'Syne', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.7;
    overflow-x: hidden;
  }

  /* ── GRID BG ─────────────────────────────────────────── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(48,255,160,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(48,255,160,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── SCANLINE ─────────────────────────────────────────── */
  body::after {
    content: '';
    position: fixed;
    top: -100%;
    left: 0; right: 0;
    height: 60px;
    background: linear-gradient(transparent, rgba(48,255,160,0.04), transparent);
    animation: scan 8s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
  @keyframes scan { to { top: 200%; } }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem 6rem;
    position: relative;
    z-index: 1;
  }

  /* ── HERO ─────────────────────────────────────────────── */
  .hero {
    text-align: center;
    padding: 5rem 0 3rem;
    position: relative;
  }

  .logo-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    position: relative;
  }

  .logo-core {
    width: 60px; height: 60px;
    background: linear-gradient(135deg, #30ffa0 0%, #7c6aff 100%);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono);
    font-size: 22px; font-weight: 700; color: #060810;
    animation: pulse-core 3s ease-in-out infinite;
    position: relative; z-index: 2;
  }
  @keyframes pulse-core {
    0%,100% { box-shadow: 0 0 0 0 rgba(48,255,160,0.4); }
    50%      { box-shadow: 0 0 0 16px rgba(48,255,160,0); }
  }

  .logo-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid;
    animation: spin-ring linear infinite;
  }
  .logo-ring:nth-child(2) {
    width: 90px; height: 90px;
    border-color: rgba(48,255,160,0.3);
    animation-duration: 10s;
  }
  .logo-ring:nth-child(3) {
    width: 106px; height: 106px;
    border-color: rgba(124,106,255,0.2);
    animation-duration: 15s;
    animation-direction: reverse;
  }
  @keyframes spin-ring { to { transform: rotate(360deg); } }

  .hero-badge {
    display: inline-block;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--accent);
    border: 1px solid var(--border);
    background: rgba(48,255,160,0.06);
    padding: 4px 14px;
    border-radius: 999px;
    margin-bottom: 1rem;
    letter-spacing: 0.08em;
    animation: fade-in 0.6s ease both;
  }

  h1.title {
    font-size: clamp(2.4rem, 7vw, 4.2rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    animation: fade-up 0.7s ease both 0.1s;
  }

  .title-x {
    background: linear-gradient(135deg, #30ffa0 0%, #7c6aff 60%, #ff6a6a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    font-size: 1.15rem;
    color: var(--muted);
    margin-top: 0.75rem;
    animation: fade-up 0.7s ease both 0.2s;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 1.8rem;
    animation: fade-up 0.7s ease both 0.3s;
  }

  .badge {
    font-family: var(--mono);
    font-size: 11px;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .badge-green { background: rgba(48,255,160,0.1); border-color: rgba(48,255,160,0.3); color: #30ffa0; }
  .badge-purple { background: rgba(124,106,255,0.1); border-color: rgba(124,106,255,0.3); color: #a095ff; }
  .badge-red { background: rgba(255,106,106,0.1); border-color: rgba(255,106,106,0.3); color: #ff9090; }
  .badge-amber { background: rgba(255,200,74,0.1); border-color: rgba(255,200,74,0.3); color: #ffd060; }
  .badge-blue { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3); color: #7dd3fc; }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), rgba(124,106,255,0.5), transparent);
    margin: 3rem 0;
    animation: fade-in 1s ease both 0.4s;
  }

  /* ── SECTIONS ─────────────────────────────────────────── */
  .section {
    margin-bottom: 3rem;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .section.visible { opacity: 1; transform: translateY(0); }

  .section-label {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  h2 {
    font-size: 1.7rem;
    font-weight: 700;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }

  p { color: #b0bec5; margin-bottom: 0.75rem; }

  /* ── ABOUT CARD ───────────────────────────────────────── */
  .about-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .about-card::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(48,255,160,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── FEATURE GRID ─────────────────────────────────────── */
  .feat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 14px;
  }

  .feat-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 12px;
    padding: 1.25rem 1.4rem;
    transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .feat-card::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    background: linear-gradient(135deg, rgba(48,255,160,0.04) 0%, rgba(124,106,255,0.04) 100%);
    transition: opacity 0.3s ease;
  }
  .feat-card:hover { border-color: rgba(48,255,160,0.3); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(48,255,160,0.06); }
  .feat-card:hover::after { opacity: 1; }

  .feat-icon {
    font-size: 1.6rem;
    margin-bottom: 0.6rem;
    display: block;
  }

  .feat-num {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    position: absolute;
    top: 1rem; right: 1rem;
    letter-spacing: 0.06em;
  }

  .feat-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.3rem;
    color: var(--text);
  }

  .feat-desc {
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.5;
    margin: 0;
  }

  /* ── SCORE DISPLAY ────────────────────────────────────── */
  .score-showcase {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .verdict-badge {
    flex: 1; min-width: 120px;
    border-radius: 10px;
    padding: 1.2rem;
    text-align: center;
    border: 1px solid;
    position: relative;
    overflow: hidden;
  }
  .verdict-badge .v-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; margin-bottom: 4px; opacity: 0.7; }
  .verdict-badge .v-score { font-size: 2rem; font-weight: 800; font-family: var(--mono); }
  .verdict-badge .v-name { font-size: 0.75rem; font-weight: 700; margin-top: 2px; letter-spacing: 0.08em; }

  .v-elite { background: rgba(48,255,160,0.08); border-color: rgba(48,255,160,0.4); color: #30ffa0; }
  .v-healthy { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.4); color: #7dd3fc; }
  .v-watch { background: rgba(255,200,74,0.08); border-color: rgba(255,200,74,0.4); color: #ffd060; }
  .v-critical { background: rgba(255,106,106,0.08); border-color: rgba(255,106,106,0.4); color: #ff9090; }

  /* ── DNA BARS ─────────────────────────────────────────── */
  .dna-bars { display: flex; flex-direction: column; gap: 12px; }
  .dna-row { display: flex; align-items: center; gap: 12px; }
  .dna-label { font-family: var(--mono); font-size: 12px; color: var(--muted); width: 110px; flex-shrink: 0; }
  .dna-track { flex: 1; height: 8px; background: var(--surface3); border-radius: 999px; overflow: hidden; }
  .dna-fill {
    height: 100%;
    border-radius: 999px;
    animation: fill-bar 1.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes fill-bar { from { width: 0 !important; } }
  .dna-pct { font-family: var(--mono); font-size: 11px; width: 36px; text-align: right; }

  /* ── HOTSPOT ──────────────────────────────────────────── */
  .hotspot-list { display: flex; flex-direction: column; gap: 10px; }
  .hotspot-item {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-left: 3px solid;
    border-radius: 8px;
    padding: 0.9rem 1.1rem;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 0.25s;
  }
  .hotspot-item:hover { border-color: rgba(255,106,106,0.5); }
  .hotspot-path { font-family: var(--mono); font-size: 12px; flex: 1; }
  .hotspot-risk { font-family: var(--mono); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 5px; }
  .risk-crit { background: rgba(255,106,106,0.15); color: #ff9090; border-left-color: #ff6a6a; }
  .risk-high { background: rgba(255,200,74,0.15); color: #ffd060; border-left-color: #ffc84a; }
  .risk-med { background: rgba(56,189,248,0.15); color: #7dd3fc; border-left-color: #38bdf8; }

  /* ── API ROUTES ───────────────────────────────────────── */
  .api-table { width: 100%; border-collapse: collapse; }
  .api-table th {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
    color: var(--muted); text-align: left;
    padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border2);
  }
  .api-table td {
    font-family: var(--mono); font-size: 12px;
    padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.03);
    vertical-align: middle;
  }
  .api-table tr:hover td { background: rgba(255,255,255,0.02); }
  .method {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .m-post { background: rgba(48,255,160,0.15); color: #30ffa0; }
  .m-get { background: rgba(56,189,248,0.15); color: #7dd3fc; }

  /* ── ENV CARD ─────────────────────────────────────────── */
  .env-block {
    background: #0d1117;
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 1.3rem 1.5rem;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.9;
    position: relative;
  }
  .env-block::before {
    content: '.env.local';
    position: absolute;
    top: -1px; left: 16px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 0 0 6px 6px;
    font-size: 10px;
    color: var(--muted);
    padding: 1px 10px;
  }
  .env-key { color: #7dd3fc; }
  .env-val { color: #a095ff; }
  .env-com { color: var(--muted); }

  /* ── TECH STACK ───────────────────────────────────────── */
  .tech-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .tech-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    transition: border-color 0.25s, transform 0.25s;
    cursor: default;
  }
  .tech-pill:hover { border-color: rgba(124,106,255,0.4); transform: translateY(-2px); }
  .tech-dot { width: 7px; height: 7px; border-radius: 50%; }

  /* ── LLM PROVIDERS ────────────────────────────────────── */
  .provider-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .provider-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 12px;
    padding: 1.3rem;
    transition: border-color 0.3s;
  }
  .provider-card:hover { border-color: rgba(124,106,255,0.4); }
  .provider-name { font-weight: 700; font-size: 1rem; margin-bottom: 0.4rem; }
  .provider-detail { font-size: 0.82rem; color: var(--muted); margin: 0; }

  /* ── FOUNDER CARD ─────────────────────────────────────── */
  .founder-card {
    background: var(--surface);
    border: 1px solid;
    border-image: linear-gradient(135deg, rgba(48,255,160,0.4), rgba(124,106,255,0.4)) 1;
    border-radius: 16px;
    padding: 2.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .founder-card::before {
    content: '';
    position: absolute;
    bottom: -60px; left: 50%;
    transform: translateX(-50%);
    width: 320px; height: 160px;
    background: radial-gradient(ellipse, rgba(48,255,160,0.08), transparent 70%);
    pointer-events: none;
  }
  .founder-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #30ffa0 0%, #7c6aff 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 24px; font-weight: 700; color: #060810;
    margin: 0 auto 1rem;
    animation: pulse-core 4s ease-in-out infinite;
  }
  .founder-name {
    font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(90deg, #30ffa0, #a095ff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.2rem;
  }
  .founder-role { font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 0.08em; }
  .founder-quote {
    font-size: 0.92rem; color: #7d8590; margin: 1.2rem auto 0;
    max-width: 480px; line-height: 1.6;
    border-top: 1px solid var(--border2);
    padding-top: 1.2rem;
  }

  /* ── INSTALL BLOCK ────────────────────────────────────── */
  .install-steps { display: flex; flex-direction: column; gap: 12px; }
  .install-step {
    display: flex; gap: 14px; align-items: flex-start;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 10px; padding: 1rem 1.2rem;
  }
  .step-num {
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: #30ffa0; background: rgba(48,255,160,0.1);
    border: 1px solid rgba(48,255,160,0.3);
    border-radius: 6px; padding: 3px 8px;
    flex-shrink: 0; margin-top: 2px;
  }
  .step-body { flex: 1; }
  .step-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; }
  .step-code { font-family: var(--mono); font-size: 12px; color: var(--accent); background: rgba(48,255,160,0.05); border-radius: 4px; padding: 3px 7px; }

  /* ── FOOTER ───────────────────────────────────────────── */
  .footer {
    text-align: center;
    padding: 3rem 0 1rem;
    border-top: 1px solid var(--border2);
    margin-top: 4rem;
  }
  .footer-logo { font-family: var(--mono); font-size: 18px; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem; }
  .footer-copy { font-size: 13px; color: var(--muted); }

  /* ── ANIMATIONS ───────────────────────────────────────── */
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  /* ── LANGUAGE CHIPS ───────────────────────────────────── */
  .lang-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .lang-chip {
    font-family: var(--mono); font-size: 12px;
    padding: 5px 12px;
    border-radius: 6px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    color: var(--text);
    transition: border-color 0.2s;
  }
  .lang-chip:hover { border-color: rgba(124,106,255,0.4); }

  /* ── SURFACE CARD ─────────────────────────────────────── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 14px;
    padding: 1.6rem 1.8rem;
  }

  /* ── SIGNAL LIST ──────────────────────────────────────── */
  .signal-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .signal-item {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 9px;
    padding: 0.8rem 1rem;
    font-size: 0.88rem;
  }
  .signal-item span { font-family: var(--mono); font-size: 10px; color: var(--muted); display: block; margin-bottom: 2px; }

  @media (max-width: 600px) {
    .feat-grid, .signal-list, .provider-grid { grid-template-columns: 1fr; }
    .score-showcase { flex-direction: column; }
  }
</style>
</head>
<body>

<div class="container">

  <!-- ── HERO ── -->
  <header class="hero">
    <div class="logo-wrap">
      <div class="logo-ring"></div>
      <div class="logo-ring"></div>
      <div class="logo-core">RFX</div>
    </div>
    <div class="hero-badge">⚡ Next-Gen Code Intelligence</div>
    <h1 class="title">ReviewForge <span class="title-x">X</span></h1>
    <p class="tagline">Advanced GitHub code-review intelligence dashboard — powered by AI</p>
    <div class="badges">
      <span class="badge badge-green">Next.js 14</span>
      <span class="badge badge-purple">TypeScript</span>
      <span class="badge badge-blue">GitHub OAuth</span>
      <span class="badge badge-amber">OpenAI / OpenRouter</span>
      <span class="badge badge-red">PDF Export</span>
      <span class="badge badge-green">App Router</span>
    </div>
  </header>

  <div class="divider"></div>

  <!-- ── ABOUT ── -->
  <section class="section" id="about">
    <div class="section-label">01 — About</div>
    <h2>What is ReviewForge X?</h2>
    <div class="about-card">
      <p>ReviewForge X is a powerful GitHub code-review intelligence platform that analyzes repositories and pull requests in real time. It generates <strong style="color:#30ffa0">risk insights</strong>, highlights hotspot files, produces AI-assisted review comments, exports audit reports, tracks team code-health trends, and includes a multi-language "Fix Pasted Code" assistant.</p>
      <p>Built with Next.js App Router, it seamlessly integrates with the GitHub REST API, supports private repositories via OAuth, and connects to OpenAI or OpenRouter for LLM-enhanced review intelligence.</p>
      <p style="margin:0; font-family: var(--mono); font-size: 13px; color: #7d8590;">Core questions it answers:</p>
      <ul style="margin:0.6rem 0 0 1.2rem; color:#b0bec5; font-size:0.9rem; line-height:2;">
        <li>How risky is this repo or PR?</li>
        <li>Which files are the highest-risk hotspots?</li>
        <li>What review comments should we focus on first?</li>
        <li>How is code health trending over time?</li>
        <li>Can we auto-fix broken snippets quickly?</li>
      </ul>
    </div>
  </section>

  <!-- ── FEATURES ── -->
  <section class="section" id="features">
    <div class="section-label">02 — Features</div>
    <h2>Complete Feature Set</h2>
    <div class="feat-grid">
      <div class="feat-card">
        <span class="feat-icon">🔗</span>
        <span class="feat-num">#01</span>
        <div class="feat-title">Repo + PR URL Analysis</div>
        <p class="feat-desc">Accepts GitHub repo and PR URLs in one input. Auto-detects repo vs. PR mode. Analyzes metadata, commit activity, contributor concentration, and documentation signals.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🔀</span>
        <span class="feat-num">#02</span>
        <div class="feat-title">PR-Specific Analysis</div>
        <p class="feat-desc">Parses PR URLs directly. Fetches PR details, changed files, commits. Displays PR number, title, state, author, and base → head branch info.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">⚡</span>
        <span class="feat-num">#03</span>
        <div class="feat-title">Quantum Review Score</div>
        <p class="feat-desc">Computes a 0–100 score with verdict: Elite, Healthy, Watch, or Critical. Gives instant quality/risk snapshot for decision-making.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">📡</span>
        <span class="feat-num">#04</span>
        <div class="feat-title">Risk Signals Engine</div>
        <p class="feat-desc">Generates weighted risk indicators: Ownership Concentration, Volatility Pressure, Collaboration Fragility, Documentation Drift.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🧬</span>
        <span class="feat-num">#05</span>
        <div class="feat-title">Review DNA Visualization</div>
        <p class="feat-desc">Shows category health vectors for Complexity, Resilience, Collaboration, and Documentation as animated progress bars.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🔥</span>
        <span class="feat-num">#06</span>
        <div class="feat-title">Code Hotspot Detection</div>
        <p class="feat-desc">Identifies the riskiest files by change behavior. Ranks hotspots with a risk index and surfaces the highest-priority files for reviewers.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🤖</span>
        <span class="feat-num">#07</span>
        <div class="feat-title">AI Review Comments</div>
        <p class="feat-desc">Each hotspot gets structured AI review intelligence with severity (Low/Medium/High/Critical), headline, rationale, and actionable comments.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🔐</span>
        <span class="feat-num">#08</span>
        <div class="feat-title">GitHub OAuth Support</div>
        <p class="feat-desc">GitHub sign-in via NextAuth. Uses OAuth access tokens for API calls, enabling analysis of private repos and PRs with proper token scopes.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">📄</span>
        <span class="feat-num">#09</span>
        <div class="feat-title">Downloadable Audit Reports</div>
        <p class="feat-desc">Export analysis runs as JSON or PDF. Reports include score, signals, insights, hotspots, review comments, and strategic recommendations.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🕰️</span>
        <span class="feat-num">#10</span>
        <div class="feat-title">Persistent Analysis History</div>
        <p class="feat-desc">Stores analysis runs with IDs and timestamps. Persists enough metadata for export and trend analytics across sessions.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🏆</span>
        <span class="feat-num">#11</span>
        <div class="feat-title">Team Leaderboard + Health Trends</div>
        <p class="feat-desc">Dedicated /leaderboard page. Aggregates stored runs by team key, showing average score, run count, trend delta, and sparkline score bars.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🛠️</span>
        <span class="feat-num">#12</span>
        <div class="feat-title">Multi-Language Code Fixer</div>
        <p class="feat-desc">Fix pasted code in TS, JS, Python, C, C++, C#, Ruby, SQL, MySQL, PostgreSQL. Uses local diagnostics + LLM correction with graceful fallback.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🌐</span>
        <span class="feat-num">#13</span>
        <div class="feat-title">Multi-Provider LLM</div>
        <p class="feat-desc">Supports OpenAI and OpenRouter with provider auto-selection, key-pattern routing, and model configurability via environment variables.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🛡️</span>
        <span class="feat-num">#14</span>
        <div class="feat-title">Graceful Failure Handling</div>
        <p class="feat-desc">Handles missing credentials, provider failures, and invalid responses cleanly. Returns useful API errors and fallback UX instead of crashing.</p>
      </div>
      <div class="feat-card">
        <span class="feat-icon">✨</span>
        <span class="feat-num">#15</span>
        <div class="feat-title">Branded Animated UI</div>
        <p class="feat-desc">Dark GitHub-style visual theme with glass/neon card styling. Animated custom logo with glowing rings, pulse and spin effects, and cyber-style motion.</p>
      </div>
    </div>
  </section>

  <!-- ── SCORE SYSTEM ── -->
  <section class="section" id="scoring">
    <div class="section-label">03 — Quantum Score</div>
    <h2>Verdict System</h2>
    <div class="score-showcase">
      <div class="verdict-badge v-elite"><div class="v-label">SCORE</div><div class="v-score">90+</div><div class="v-name">ELITE</div></div>
      <div class="verdict-badge v-healthy"><div class="v-label">SCORE</div><div class="v-score">70+</div><div class="v-name">HEALTHY</div></div>
      <div class="verdict-badge v-watch"><div class="v-label">SCORE</div><div class="v-score">45+</div><div class="v-name">WATCH</div></div>
      <div class="verdict-badge v-critical"><div class="v-label">SCORE</div><div class="v-score">&lt;45</div><div class="v-name">CRITICAL</div></div>
    </div>

    <div style="margin-top: 1.8rem;">
      <p style="margin-bottom: 1rem; font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.08em;">REVIEW DNA VECTORS</p>
      <div class="dna-bars">
        <div class="dna-row">
          <div class="dna-label">Complexity</div>
          <div class="dna-track"><div class="dna-fill" style="width: 72%; background: linear-gradient(90deg, #30ffa0, #7c6aff);"></div></div>
          <div class="dna-pct" style="color:#30ffa0">72%</div>
        </div>
        <div class="dna-row">
          <div class="dna-label">Resilience</div>
          <div class="dna-track"><div class="dna-fill" style="width: 88%; background: linear-gradient(90deg, #7dd3fc, #30ffa0);"></div></div>
          <div class="dna-pct" style="color:#7dd3fc">88%</div>
        </div>
        <div class="dna-row">
          <div class="dna-label">Collaboration</div>
          <div class="dna-track"><div class="dna-fill" style="width: 55%; background: linear-gradient(90deg, #ffc84a, #ff6a6a);"></div></div>
          <div class="dna-pct" style="color:#ffd060">55%</div>
        </div>
        <div class="dna-row">
          <div class="dna-label">Documentation</div>
          <div class="dna-track"><div class="dna-fill" style="width: 40%; background: linear-gradient(90deg, #ff6a6a, #a095ff);"></div></div>
          <div class="dna-pct" style="color:#ff9090">40%</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── RISK SIGNALS ── -->
  <section class="section" id="signals">
    <div class="section-label">04 — Risk Engine</div>
    <h2>Risk Signals</h2>
    <div class="signal-list">
      <div class="signal-item"><span>SIGNAL #1</span>Ownership Concentration</div>
      <div class="signal-item"><span>SIGNAL #2</span>Volatility Pressure</div>
      <div class="signal-item"><span>SIGNAL #3</span>Collaboration Fragility</div>
      <div class="signal-item"><span>SIGNAL #4</span>Documentation Drift</div>
    </div>
  </section>

  <!-- ── HOTSPOTS ── -->
  <section class="section" id="hotspots">
    <div class="section-label">05 — Hotspot Detection</div>
    <h2>File Risk Ranking</h2>
    <div class="hotspot-list">
      <div class="hotspot-item risk-crit">
        <span style="font-size:1.1rem">🔴</span>
        <div class="hotspot-path">src/lib/auth/tokenValidator.ts</div>
        <div class="hotspot-risk" style="background:rgba(255,106,106,0.15);color:#ff9090">CRITICAL</div>
      </div>
      <div class="hotspot-item risk-high" style="border-left-color:#ffc84a">
        <span style="font-size:1.1rem">🟡</span>
        <div class="hotspot-path">src/api/analyze/route.ts</div>
        <div class="hotspot-risk" style="background:rgba(255,200,74,0.15);color:#ffd060">HIGH</div>
      </div>
      <div class="hotspot-item risk-med" style="border-left-color:#38bdf8">
        <span style="font-size:1.1rem">🔵</span>
        <div class="hotspot-path">components/ReviewDNA.tsx</div>
        <div class="hotspot-risk" style="background:rgba(56,189,248,0.15);color:#7dd3fc">MEDIUM</div>
      </div>
    </div>
    <p style="margin-top:1rem; font-size:0.84rem; color:var(--muted)">Each hotspot includes AI-generated review comments with severity, headline, rationale, and multiple actionable suggestions.</p>
  </section>

  <!-- ── CODE FIX ── -->
  <section class="section" id="codefix">
    <div class="section-label">06 — Code Fixer</div>
    <h2>Multi-Language Fix Assistant</h2>
    <p>Paste broken code and get instant LLM-corrected output. Local diagnostics run for TypeScript and JavaScript; all other languages route through the LLM provider.</p>
    <div class="lang-chips">
      <div class="lang-chip">TypeScript</div>
      <div class="lang-chip">JavaScript</div>
      <div class="lang-chip">Python</div>
      <div class="lang-chip">C</div>
      <div class="lang-chip">C++</div>
      <div class="lang-chip">C#</div>
      <div class="lang-chip">Ruby</div>
      <div class="lang-chip">SQL</div>
      <div class="lang-chip">MySQL</div>
      <div class="lang-chip">PostgreSQL</div>
    </div>
    <p style="margin-top:1rem; font-size:0.84rem; color:var(--muted)">If no LLM key or quota is available, a graceful fallback note is returned with available local diagnostics.</p>
  </section>

  <!-- ── API ROUTES ── -->
  <section class="section" id="api">
    <div class="section-label">07 — API</div>
    <h2>API Endpoints</h2>
    <div class="card">
      <table class="api-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Route</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method m-post">POST</span></td>
            <td>/api/analyze</td>
            <td style="color:var(--muted)">Analyze repo/PR URL → intelligence payload</td>
          </tr>
          <tr>
            <td><span class="method m-post">POST</span></td>
            <td>/api/fix-code</td>
            <td style="color:var(--muted)">Code correction with diagnostics + LLM</td>
          </tr>
          <tr>
            <td><span class="method m-get">GET</span></td>
            <td>/api/reports/export</td>
            <td style="color:var(--muted)">Download saved analysis as PDF or JSON</td>
          </tr>
          <tr>
            <td><span class="method m-get">GET</span></td>
            <td>/api/leaderboard</td>
            <td style="color:var(--muted)">Team ranking and trend data</td>
          </tr>
          <tr>
            <td><span class="method m-get">GET/POST</span></td>
            <td>/api/auth/[...nextauth]</td>
            <td style="color:var(--muted)">GitHub OAuth authentication</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ── LLM PROVIDERS ── -->
  <section class="section" id="llm">
    <div class="section-label">08 — LLM Providers</div>
    <h2>Multi-Provider Intelligence</h2>
    <div class="provider-grid">
      <div class="provider-card">
        <div class="provider-name" style="color:#30ffa0">OpenAI</div>
        <p class="provider-detail">Standard chat-completions API. Configured via OPENAI_API_KEY and OPENAI_MODEL. Acts as primary or fallback provider.</p>
      </div>
      <div class="provider-card">
        <div class="provider-name" style="color:#a095ff">OpenRouter</div>
        <p class="provider-detail">Route to 100+ models via unified endpoint. Keys prefixed with sk-or-v1- auto-route to OpenRouter. Supports custom model selection.</p>
      </div>
    </div>
  </section>

  <!-- ── ENV SETUP ── -->
  <section class="section" id="env">
    <div class="section-label">09 — Configuration</div>
    <h2>Environment Setup</h2>
    <div class="env-block">
      <div><span class="env-com"># GitHub OAuth</span></div>
      <div><span class="env-key">GITHUB_CLIENT_ID</span>=<span class="env-val">your_client_id</span></div>
      <div><span class="env-key">GITHUB_CLIENT_SECRET</span>=<span class="env-val">your_client_secret</span></div>
      <div><span class="env-key">NEXTAUTH_SECRET</span>=<span class="env-val">your_secret</span></div>
      <div><span class="env-key">GITHUB_TOKEN</span>=<span class="env-val">optional_pat</span></div>
      <div>&nbsp;</div>
      <div><span class="env-com"># LLM Providers</span></div>
      <div><span class="env-key">OPENROUTER_API_KEY</span>=<span class="env-val">sk-or-v1-...</span></div>
      <div><span class="env-key">OPENROUTER_MODEL</span>=<span class="env-val">openai/gpt-4o</span></div>
      <div><span class="env-key">OPENROUTER_SITE_URL</span>=<span class="env-val">https://yourapp.com</span></div>
      <div><span class="env-key">OPENROUTER_APP_NAME</span>=<span class="env-val">ReviewForge X</span></div>
      <div><span class="env-key">OPENAI_API_KEY</span>=<span class="env-val">sk-...</span></div>
      <div><span class="env-key">OPENAI_MODEL</span>=<span class="env-val">gpt-4o</span></div>
    </div>
  </section>

  <!-- ── INSTALL ── -->
  <section class="section" id="install">
    <div class="section-label">10 — Getting Started</div>
    <h2>Installation</h2>
    <div class="install-steps">
      <div class="install-step">
        <div class="step-num">01</div>
        <div class="step-body">
          <div class="step-title">Clone the repository</div>
          <code class="step-code">git clone https://github.com/your-org/reviewforge-x.git && cd reviewforge-x</code>
        </div>
      </div>
      <div class="install-step">
        <div class="step-num">02</div>
        <div class="step-body">
          <div class="step-title">Install dependencies</div>
          <code class="step-code">npm install</code>
        </div>
      </div>
      <div class="install-step">
        <div class="step-num">03</div>
        <div class="step-body">
          <div class="step-title">Configure environment</div>
          <code class="step-code">cp .env.example .env.local</code> — then fill in your keys
        </div>
      </div>
      <div class="install-step">
        <div class="step-num">04</div>
        <div class="step-body">
          <div class="step-title">Run development server</div>
          <code class="step-code">npm run dev</code> — open http://localhost:3000
        </div>
      </div>
      <div class="install-step">
        <div class="step-num">05</div>
        <div class="step-body">
          <div class="step-title">Build for production</div>
          <code class="step-code">npm run build && npm start</code>
        </div>
      </div>
    </div>
  </section>

  <!-- ── TECH STACK ── -->
  <section class="section" id="stack">
    <div class="section-label">11 — Tech Stack</div>
    <h2>Built With</h2>
    <div class="tech-grid">
      <div class="tech-pill"><span class="tech-dot" style="background:#30ffa0"></span>Next.js (App Router)</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#3178c6"></span>TypeScript</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#38bdf8"></span>Tailwind CSS</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#a095ff"></span>NextAuth.js</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#f0f0f0"></span>GitHub REST API</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#ff6a6a"></span>PDFKit</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#10a37f"></span>OpenAI SDK</div>
      <div class="tech-pill"><span class="tech-dot" style="background:#ffc84a"></span>OpenRouter</div>
    </div>
  </section>

  <!-- ── UI SECTIONS ── -->
  <section class="section" id="ui">
    <div class="section-label">12 — UI Overview</div>
    <h2>Interface Sections</h2>
    <div class="card">
      <ul style="list-style:none; display:flex; flex-direction:column; gap:10px;">
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Hero with branding + auth actions</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">URL analysis form (repo/PR mode)</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Score + verdict cards with animated meter</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Review DNA health bars</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Risk signal panel</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Hotspot files + AI review comments</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Strategic recommendation panel</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">PDF / JSON report download controls</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Multi-language code-fix panel</span></li>
        <li style="display:flex; gap:10px; align-items:flex-start;"><span style="color:#30ffa0; font-family:var(--mono); font-size:12px; flex-shrink:0;">→</span><span style="font-size:0.9rem; color:#b0bec5">Leaderboard + health trends page (/leaderboard)</span></li>
      </ul>
    </div>
  </section>

  <!-- ── FOUNDER ── -->
  <section class="section" id="founder">
    <div class="section-label">13 — Creator</div>
    <h2>Built By</h2>
    <div class="founder-card">
      <div class="founder-avatar">DP</div>
      <div class="founder-name">Darshan Paapani</div>
      <div class="founder-role">FOUNDER &amp; CREATOR — REVIEWFORGE X</div>
      <p class="founder-quote">
        "Code review shouldn't be a bottleneck — it should be a superpower. ReviewForge X was built to give every engineering team the intelligence they need to ship with confidence."
      </p>
    </div>
  </section>

  <!-- ── FOOTER ── -->
  <footer class="footer">
    <div class="footer-logo">ReviewForge X</div>
    <p class="footer-copy">Built by <strong style="color:#30ffa0">Darshan Paapani</strong> · MIT License · Open Source</p>
    <p style="margin-top:0.5rem; font-size:12px; color:var(--muted); font-family:var(--mono)">Next.js · TypeScript · GitHub REST API · OpenAI · OpenRouter</p>
  </footer>

</div>

<script>
  const sections = document.querySelectorAll('.section');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  sections.forEach(s => obs.observe(s));
</script>
</body>
</html>
