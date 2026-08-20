import { NextResponse } from 'next/server';

type Paper = { title: string; year?: number; doi?: string };

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

async function getOpenAlexPapers(topic: string): Promise<Paper[]> {
  const params = new URLSearchParams({ search: topic, per_page: '8' });
  const key = process.env.OPENALEX_API_KEY;
  if (key) params.set('api_key', key);
  const res = await fetch(`https://api.openalex.org/works?${params.toString()}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((w: any) => ({
    title: w.display_name || 'Untitled work',
    year: w.publication_year,
    doi: w.doi,
  }));
}

function demoHypotheses(topic: string): Hypothesis[] {
  return [
    {
      title: 'Coupled-property interaction may be under-tested',
      hypothesis: `In ${topic}, two properties commonly optimized independently may exhibit a nonlinear interaction that creates a performance regime not captured by single-variable screening.`,
      score: 82,
      novelty: 84,
      plausibility: 78,
      falsifiability: 91,
      impact: 76,
      assassin: 'The apparent interaction may be a proxy for a known structural or processing variable. A matched-control analysis could collapse the effect.',
      experiment: 'Construct a factorial dataset varying both candidate properties independently while holding the likely confounders fixed; test for a statistically significant interaction term and out-of-distribution performance.',
    },
    {
      title: 'Published consensus may hide a boundary-condition failure',
      hypothesis: `A widely repeated mechanism in ${topic} may only hold inside a narrower temperature, composition, or processing window than the literature usually states.`,
      score: 77,
      novelty: 79,
      plausibility: 75,
      falsifiability: 88,
      impact: 72,
      assassin: 'The boundary effect could already be explained by phase transitions or measurement artifacts rather than a failure of the accepted mechanism.',
      experiment: 'Replicate the canonical measurement across a deliberately widened condition grid, using blinded replication and orthogonal measurement methods near the predicted boundary.',
    },
    {
      title: 'Negative-result blind spot',
      hypothesis: `The apparent design rules in ${topic} may be biased by missing negative results, causing the field to overestimate one favored mechanism and overlook a viable alternative region of parameter space.`,
      score: 73,
      novelty: 81,
      plausibility: 69,
      falsifiability: 82,
      impact: 70,
      assassin: 'The proposed publication-bias effect may be too weak to change the practical ranking of candidate mechanisms.',
      experiment: 'Reconstruct a preregistered candidate set from historical search spaces, include known failures where available, then compare performance of the accepted rule against an unbiased baseline model.',
    },
  ];
}

async function generateWithOpenAI(topic: string, papers: Paper[]): Promise<Hypothesis[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-5.6';
  const prompt = `You are Frontier, a skeptical scientific hypothesis engine. Topic: ${topic}.\nLiterature titles:\n${papers.map((p, i) => `${i + 1}. ${p.title}`).join('\n')}\n\nReturn ONLY valid JSON: an array of exactly 3 objects with keys title, hypothesis, score, novelty, plausibility, falsifiability, impact, assassin, experiment. Scores are integers 0-100. Do not claim a hypothesis is novel or true; phrase it as a candidate worth testing. The assassin must identify the strongest alternative explanation. The experiment must be concrete and falsifiable.`;
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, input: prompt }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.output_text || data.output?.flatMap((o: any) => o.content || []).map((c: any) => c.text || '').join('') || '';
  try {
    const parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = String(body.topic || '').trim();
    if (!topic) return NextResponse.json({ error: 'A research topic is required.' }, { status: 400 });

    const papers = await getOpenAlexPapers(topic);
    const generated = await generateWithOpenAI(topic, papers);
    const hypotheses = generated || demoHypotheses(topic);

    return NextResponse.json({
      topic,
      mode: generated ? 'live reasoning' : 'literature + demo reasoning',
      papers,
      hypotheses,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Frontier could not complete this discovery run.' }, { status: 500 });
  }
}
