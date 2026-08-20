'use client';

import { useState } from 'react';

type System = {
  name: string;
  level: number;
  status: string;
  ceiling: string;
  route: string;
};

type Result = {
  ambition: string;
  northStar: string;
  reality: string;
  mode: string;
  systems: System[];
  bottlenecks: { title: string; why: string; attack: string }[];
  wildcards: { title: string; idea: string; payoff: string }[];
  prototype: { name: string; goal: string; build: string[]; success: string[] };
  roadmap: { phase: string; objective: string; unlock: string }[];
};

const examples = [
  'Build a VR MMO that feels like another life',
  'Create an Iron Man-style augmented reality HUD',
  'Let one person operate a billion-dollar company with AI',
  'Build a game where every NPC has a persistent life',
];

function levelLabel(level: number) {
  return ['','Available now','Novel integration','Experimental','Breakthrough','Speculative'][level] || 'Unknown';
}

export default function Home() {
  const [ambition, setAmbition] = useState('Build a VR MMO that feels like another life');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function explore() {
    if (!ambition.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/discover', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ambition }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Frontier could not analyze this ambition.');
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed'); }
    finally { setLoading(false); }
  }

  return (
    <main className="shell">
      <nav><div className="brand"><span className="mark">F</span> FRONTIER</div><div className="alpha">ALPHA 0.2</div></nav>
      <section className="hero">
        <div className="eyebrow">Ambition → reality</div>
        <h1>What do you want to <em>make possible?</em></h1>
        <p>Don’t make the idea realistic. Give Frontier the version you actually want. It will work backward from the edge of what humans can do until there is something we can build today.</p>
      </section>

      <section className="command">
        <textarea value={ambition} onChange={e=>setAmbition(e.target.value)} placeholder="I want to…" rows={3}/>
        <div className="commandFooter"><span>Think bigger than a normal product brief.</span><button onClick={explore} disabled={loading || !ambition.trim()}>{loading ? 'Mapping the frontier…' : 'Push the frontier →'}</button></div>
      </section>

      <div className="examples">{examples.map(x=><button key={x} onClick={()=>setAmbition(x)}>{x}</button>)}</div>
      {error && <div className="error">{error}</div>}

      {result && <section className="results">
        <div className="missionHeader"><div><div className="eyebrow">Mission brief · {result.mode}</div><h2>{result.northStar}</h2></div><div className="statusDot">ACTIVE</div></div>
        <div className="reality"><span>Current reality</span><p>{result.reality}</p></div>

        <div className="sectionHead"><span>01</span><h3>The systems that must exist</h3></div>
        <div className="systemGrid">{result.systems.map((s,i)=><article className="system" key={i}>
          <div className="systemTop"><h4>{s.name}</h4><span className={`level l${s.level}`}>L{s.level} · {levelLabel(s.level)}</span></div>
          <p><b>Human ceiling:</b> {s.ceiling}</p><p><b>Frontier route:</b> {s.route}</p><div className="systemStatus">{s.status}</div>
        </article>)}</div>

        <div className="sectionHead"><span>02</span><h3>Attack the bottlenecks</h3></div>
        <div className="rows">{result.bottlenecks.map((b,i)=><article className="row" key={i}><div className="number">0{i+1}</div><div><h4>{b.title}</h4><p>{b.why}</p><div className="attack">↳ {b.attack}</div></div></article>)}</div>

        <div className="sectionHead"><span>03</span><h3>Unconventional routes</h3></div>
        <div className="wildGrid">{result.wildcards.map((w,i)=><article className="wild" key={i}><div className="eyebrow">Wildcard {String(i+1).padStart(2,'0')}</div><h4>{w.title}</h4><p>{w.idea}</p><strong>{w.payoff}</strong></article>)}</div>

        <div className="sectionHead"><span>04</span><h3>Build this first</h3></div>
        <article className="prototype"><div><div className="eyebrow">Frontier prototype</div><h3>{result.prototype.name}</h3><p>{result.prototype.goal}</p></div><div><h5>BUILD</h5><ol>{result.prototype.build.map(x=><li key={x}>{x}</li>)}</ol></div><div><h5>SUCCESS MEANS</h5><ul>{result.prototype.success.map(x=><li key={x}>{x}</li>)}</ul></div></article>

        <div className="sectionHead"><span>05</span><h3>Path toward the impossible version</h3></div>
        <div className="roadmap">{result.roadmap.map((r,i)=><div className="road" key={i}><div className="roadPhase">{r.phase}</div><div><strong>{r.objective}</strong><p>{r.unlock}</p></div></div>)}</div>
      </section>}

      <footer>Frontier does not assume ambitious ideas are achievable. It separates current capability, plausible engineering, required breakthroughs, and speculation so each claim can be tested instead of hand-waved.</footer>
    </main>
  );
}
