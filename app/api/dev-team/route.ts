import { NextResponse } from 'next/server';
import { Sandbox } from '@vercel/sandbox';

export const maxDuration = 300;

type TeamMember = { role: string; mission: string; decision: string };
type GeneratedFile = { path: string; content: string; owner: string };
type PlannedCommand = { label: string; command: string; kind: 'install' | 'test' | 'build' | 'limit' | 'inspect' };
type DevPlan = {
  projectName: string;
  summary: string;
  scopeNote: string;
  runtime: 'node24' | 'python3.13';
  team: TeamMember[];
  architecture: string[];
  acceptanceCriteria: string[];
  files: GeneratedFile[];
  commands: PlannedCommand[];
};

type CommandResult = PlannedCommand & { exitCode: number; stdout: string; stderr: string; durationMs: number };

function outputText(data: any): string {
  return data?.output_text || data?.output?.flatMap((o: any) => o.content || []).find((c: any) => c.type === 'output_text')?.text || '';
}

function cleanJson(text: string) {
  return text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
}

function safePath(path: string) {
  return path.length <= 180 && /^[A-Za-z0-9._/-]+$/.test(path) && !path.startsWith('/') && !path.includes('..');
}

function trimOutput(value: string, max = 12000) {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}\n…[truncated]` : value;
}

async function generatePlan(ambition: string, previous?: any): Promise<DevPlan> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured.');

  const previousContext = previous ? `\nPrevious iteration and test evidence:\n${JSON.stringify(previous).slice(0, 22000)}` : '';
  const prompt = `You are Frontier Dev Team, an autonomous but skeptical software engineering team. The user's ambitious project is:\n\n${ambition}\n\nYour job is NOT to merely advise. Produce the smallest meaningful, testable vertical slice that advances the real project. Build something that can actually run inside a Vercel Sandbox today. For game/VR/Unity/Unreal ambitions, isolate a core subsystem that can be validated in Node/TypeScript or Python (for example persistent world simulation, NPC state/memory, networking model, economy simulation, procedural systems) and explicitly state what engine-specific integration remains uncompiled.\n\nCreate a realistic development team with Product Lead, Architect, primary implementation engineers, QA, Performance/Scale Engineer, and Tech Lead. Each role must make a concrete decision. Include tests and ONE limit/stress command that measures where the prototype begins to fail or degrade. Do not claim engine-specific code was compiled unless the chosen runtime actually supports it.\n\nUse runtime node24 unless Python is clearly superior. Keep the generated project small: maximum 12 files and roughly 70k characters total. Commands must be non-interactive and should finish within a few minutes. For Node, prefer npm and built-in node:test or lightweight dependencies. For Python, prefer stdlib/pytest.\n\nReturn ONLY valid JSON matching exactly:\n{"projectName":string,"summary":string,"scopeNote":string,"runtime":"node24"|"python3.13","team":[{"role":string,"mission":string,"decision":string}],"architecture":[string],"acceptanceCriteria":[string],"files":[{"path":string,"content":string,"owner":string}],"commands":[{"label":string,"command":string,"kind":"install"|"test"|"build"|"limit"|"inspect"}]}.\n\nRequirements: 5-7 team members, 3-7 architecture bullets, 3-6 acceptance criteria, at least one test command, at least one limit command, and all source/test files required for those commands.${previousContext}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5.6-terra', input: prompt }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Model planning failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const text = outputText(await response.json());
  if (!text) throw new Error('Model returned no development plan.');
  const plan = JSON.parse(cleanJson(text)) as DevPlan;

  plan.files = (plan.files || []).filter(f => safePath(f.path)).slice(0, 12);
  plan.commands = (plan.commands || []).slice(0, 7);
  if (!plan.files.length) throw new Error('The development team did not produce any valid files.');
  if (!plan.commands.some(c => c.kind === 'test')) throw new Error('The development plan did not include a test command.');
  if (!plan.commands.some(c => c.kind === 'limit')) throw new Error('The development plan did not include a limit test.');
  return plan;
}

async function executePlan(plan: DevPlan) {
  const sandbox = await Sandbox.create({
    runtime: plan.runtime,
    timeout: 300000,
    networkPolicy: 'allow-all',
  });

  const results: CommandResult[] = [];
  try {
    for (const file of plan.files) {
      if (!safePath(file.path)) continue;
      const slash = file.path.lastIndexOf('/');
      if (slash > 0) {
        const dir = file.path.slice(0, slash);
        const mkdir = await sandbox.runCommand(`mkdir -p '${dir}'`);
        if (mkdir.exitCode !== 0) throw new Error(`Could not create directory ${dir}: ${mkdir.stderr}`);
      }
      const encoded = Buffer.from(file.content, 'utf8').toString('base64');
      const write = await sandbox.runCommand(`printf '%s' '${encoded}' | base64 -d > '${file.path}'`);
      if (write.exitCode !== 0) throw new Error(`Could not write ${file.path}: ${write.stderr}`);
    }

    for (const cmd of plan.commands) {
      const started = Date.now();
      const result = await sandbox.runCommand(cmd.command);
      results.push({
        ...cmd,
        exitCode: result.exitCode,
        stdout: trimOutput(result.stdout),
        stderr: trimOutput(result.stderr),
        durationMs: Date.now() - started,
      });
    }

    const listing = await sandbox.runCommand("find . -maxdepth 3 -type f -not -path './node_modules/*' | sort | head -80");
    return {
      sandboxId: sandbox.sandboxId,
      filesWritten: plan.files.map(f => f.path),
      fileListing: trimOutput(listing.stdout, 6000),
      commands: results,
      testsPassed: results.filter(r => r.kind === 'test').every(r => r.exitCode === 0),
      buildsPassed: results.filter(r => r.kind === 'build').every(r => r.exitCode === 0),
      limitEvidence: results.filter(r => r.kind === 'limit'),
    };
  } finally {
    await sandbox.stop();
  }
}

export async function GET() {
  let sandbox: Sandbox | undefined;
  try {
    sandbox = await Sandbox.create({ runtime: 'node24', timeout: 60000 });
    const result = await sandbox.runCommand("node -e \"console.log('frontier-sandbox-ok')\"");
    return NextResponse.json({ ok: result.exitCode === 0, sandboxId: sandbox.sandboxId, stdout: result.stdout, stderr: result.stderr });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Sandbox self-test failed' }, { status: 500 });
  } finally {
    if (sandbox) await sandbox.stop().catch(() => undefined);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ambition = String(body.ambition || '').trim();
    if (!ambition) return NextResponse.json({ error: 'Tell the Dev Team what project to build.' }, { status: 400 });

    const plan = await generatePlan(ambition, body.previous);
    let execution: any;
    try {
      execution = await executePlan(plan);
    } catch (error) {
      execution = { error: error instanceof Error ? error.message : 'Sandbox execution failed', commands: [], testsPassed: false, buildsPassed: false, limitEvidence: [] };
    }

    return NextResponse.json({ ambition, createdAt: new Date().toISOString(), plan, execution });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dev Team failed' }, { status: 500 });
  }
}
