'use client';

import { useState } from 'react';

type Hypothesis = {
  title: string;
  hypothesis: string;
  score: number;
  novelty: number;
  plausibility: number;
  falsifiability: number;
  impact: number;
  assassin: string;
  experiment: string;
};

type Result = {
  topic: string;
  mode: string;
  papers: { title: string; year?: number; doi?: string }[];
  hypotheses: Hypothesis[];
};

export default function Home() {
  const [topic, setTopic] = useState('solid-state lithium battery electrolytes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function discover() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Discovery failed');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Discovery failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Frontier Alpha · Scientific discovery engine</div>
        <h1>Find what science may be missing.</h1>
        <p>Frontier searches scientific literature, proposes falsifiable hypotheses, attacks them adversarially, and ranks the survivors by novelty, plausibility, impact, and testability.</p>
      </section>

      <section className="panel">
        <div className="search">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a research area…" />
          <button onClick={discover} disabled={loading || !topic.trim()}>{loading ? 'Investigating…' : 'Run discovery'}</button>
        </div>
        <div className="hint">Try: perovskite stability, sodium-ion cathodes, solid-state electrolytes, thermoelectrics</div>
        {error && <div className="status">{error}</div>}
      </section>

      {result && (
        <>
          <div className="sectionTitle">Ranked hypotheses · {result.mode}</div>
          <div className="grid">
            {result.hypotheses.map((h, i) => (
              <article className="card" key={i}>
                <div className="scoreRow">
                  <div>
                    <div className="eyebrow">Candidate {String(i + 1).padStart(2, '0')}</div>
                    <h3>{h.title}</h3>
                  </div>
                  <div><div className="score">{h.score}</div><div className="pill">Frontier score</div></div>
                </div>
                <p>{h.hypothesis}</p>
                <div className="sectionTitle">Assassin</div>
                <p>{h.assassin}</p>
                <div className="sectionTitle">Decisive experiment</div>
                <p>{h.experiment}</p>
                <div className="hint">Novelty {h.novelty} · Plausibility {h.plausibility} · Falsifiability {h.falsifiability} · Impact {h.impact}</div>
              </article>
            ))}
          </div>

          <div className="sectionTitle">Literature retrieved</div>
          <div className="papers">
            {result.papers.map((p, i) => (
              <div className="paper" key={i}><strong>{p.title}</strong><span>{p.year || 'Year unknown'}{p.doi ? ` · ${p.doi}` : ''}</span></div>
            ))}
          </div>
        </>
      )}

      <div className="warning">Frontier is a research prototype. A high score is not evidence that a hypothesis is true or genuinely novel. External literature review and experimental validation are required.</div>
    </main>
  );
}
