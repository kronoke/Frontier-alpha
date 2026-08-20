# Frontier Alpha

Frontier is an experimental AI-assisted scientific discovery system. The current alpha focuses on literature-grounded hypothesis generation, adversarial criticism, falsifiability, and experimental design.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create `.env.local` locally, or add the same values in Vercel Project Settings → Environment Variables.

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
OPENALEX_API_KEY=
MATERIALS_PROJECT_API_KEY=
```

No secrets should be committed to GitHub.

## Current pipeline

1. Cartographer — retrieves relevant literature.
2. Gap Hunter — identifies contradictions, weakly explored intersections, and missing tests.
3. Theorist — proposes testable hypotheses.
4. Assassin — tries to falsify each hypothesis.
5. Experimentalist — proposes a decisive test.
6. Judge — ranks candidates by novelty, plausibility, falsifiability, impact, and testability.

## Status

Frontier Alpha is a research prototype. A high Frontier score is not proof of novelty or truth; hypotheses still require external validation.
