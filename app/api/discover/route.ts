import { NextResponse } from 'next/server';

type Mission = {
  ambition: string;
  northStar: string;
  reality: string;
  mode: string;
  systems: { name: string; level: number; status: string; ceiling: string; route: string }[];
  bottlenecks: { title: string; why: string; attack: string }[];
  wildcards: { title: string; idea: string; payoff: string }[];
  prototype: { name: string; goal: string; build: string[]; success: string[] };
  roadmap: { phase: string; objective: string; unlock: string }[];
};

function vrMmoMission(ambition: string): Mission {
  return {
    ambition,
    northStar: 'A persistent VR world that feels less like a game and more like a second life.',
    reality: 'A convincing version is possible today if we stop assuming every player, NPC, and world process must be simulated at maximum detail at the same time. The frontier is not one magical breakthrough; it is intelligent distribution of simulation, AI, networking, and content generation.',
    mode: 'frontier analysis',
    systems: [
      { name:'Persistent world simulation', level:2, status:'Buildable with architectural invention', ceiling:'Large worlds exist, but most only simulate detail near active players.', route:'Use hierarchical simulation: coarse global state, regional simulation, and high-fidelity local bubbles that hand state between layers.' },
      { name:'Living AI population', level:3, status:'Experimental but practical in constrained form', ceiling:'LLM NPCs can converse, but cost, latency, consistency, and long-term memory limit thousands of autonomous agents.', route:'Give most NPCs cheap symbolic lives and goals; promote only nearby or important NPCs into richer agent cognition.' },
      { name:'Massive VR concurrency', level:3, status:'Requires aggressive abstraction', ceiling:'VR clients cannot render or synchronize thousands of detailed avatars in one space.', route:'Treat presence as levels of detail: full bodies nearby, simplified crowds farther away, aggregate populations beyond the local cell.' },
      { name:'Infinite content production', level:2, status:'Available through novel integration', ceiling:'Traditional MMO content needs huge art, writing, and level-design teams.', route:'Build authored rules and lore, then let procedural systems and generative tools create constrained variations rather than unconstrained content.' },
      { name:'Embodied social realism', level:3, status:'Hardware-limited', ceiling:'Current headsets approximate gaze, hands, voice, and body language but do not capture full human embodiment.', route:'Fuse eye/hand/head inference with procedural body animation and voice prosody to reconstruct more social signal than hardware directly captures.' },
      { name:'Full-dive feeling', level:5, status:'No known safe path to literal full dive', ceiling:'Consumer neural interfaces cannot write arbitrary high-bandwidth sensory experience into the brain.', route:'Approximate psychological presence first: continuity, memory, believable consequences, spatial audio, haptics, and persistent identity.' },
    ],
    bottlenecks: [
      { title:'Everything cannot be fully simulated', why:'Compute and networking explode when every entity receives equal fidelity.', attack:'Make fidelity elastic. Spend computation only where a human can observe the difference.' },
      { title:'AI characters become expensive and incoherent', why:'A persistent world may need tens of thousands of characters, each with memory and goals.', attack:'Separate life simulation from language generation. Run cheap state machines continuously and invoke deep AI only at meaningful moments.' },
      { title:'A small team cannot author MMO-scale content', why:'World building, quests, animation, dialogue, and QA normally require hundreds of people.', attack:'Author systems instead of content: economies, factions, needs, relationships, world rules, and generation constraints create reusable emergence.' },
      { title:'Latency breaks presence', why:'VR is unusually sensitive to network and inference delay.', attack:'Predict locally, reconcile remotely, cache likely NPC responses, and keep physical interaction authoritative near the player.' },
    ],
    wildcards: [
      { title:'NPC cognition on demand', idea:'NPCs live as tiny structured simulations until a player interacts with them. Their recent history is compiled into a richer temporary mind, then compressed back into durable memory afterward.', payoff:'A world can feel populated by thousands of lives without paying for thousands of full AI agents every second.' },
      { title:'Reality bubbles', idea:'Each player occupies a high-fidelity simulation bubble. Overlapping bubbles merge; distant regions remain summarized. Important events propagate through an event graph rather than frame-by-frame simulation.', payoff:'Potentially MMO-scale persistence with VR-scale local detail.' },
      { title:'Questless MMO', idea:'Remove most hand-authored quests. Factions, NPC needs, shortages, crime, construction, and politics generate requests that become player objectives naturally.', payoff:'Content can continue evolving after developers stop manually writing missions.' },
    ],
    prototype: {
      name:'One Living Town',
      goal:'Prove that 20–30 NPCs can appear to live persistent lives in a shared VR space even when nobody is watching them.',
      build:[
        'Create one compact town in Unity or Unreal with multiplayer VR movement.',
        'Give every NPC a job, home, needs, relationships, schedule, inventory, and compact memory state.',
        'Run low-cost background simulation when NPCs are unobserved.',
        'Promote nearby NPCs into conversational AI agents with access to their actual state and memories.',
        'Allow one economic shock or faction conflict to create unscripted player objectives.'
      ],
      success:[
        'Players can leave and return to find believable changes.',
        'NPCs remember consequential interactions.',
        'At least one useful mission emerges without a designer scripting that exact mission.',
        'The system remains affordable enough to run continuously.'
      ]
    },
    roadmap:[
      { phase:'Phase 1', objective:'One Living Town', unlock:'Validate persistence, memory, emergent objectives, and VR interaction.' },
      { phase:'Phase 2', objective:'Connected settlements', unlock:'Test regional simulation, trade, migration, factions, and world-state propagation.' },
      { phase:'Phase 3', objective:'100-player persistent shard', unlock:'Prove concurrency and reality-bubble networking architecture.' },
      { phase:'Phase 4', objective:'World-scale simulation', unlock:'Run large populations mostly as low-cost abstract state with local high-fidelity promotion.' },
      { phase:'Frontier', objective:'Second-life presence', unlock:'Push embodiment, haptics, AI continuity, and future interface hardware toward the psychological experience of another life.' },
    ]
  };
}

function genericMission(ambition: string): Mission {
  return {
    ambition,
    northStar: ambition.trim().replace(/[.!?]+$/, ''),
    reality: 'Frontier starts by preserving the ambitious version instead of shrinking it into a conventional product. The goal is to separate what can be assembled now from what requires novel integration, experimentation, genuine breakthroughs, or technology that does not yet have a known path.',
    mode: 'frontier analysis',
    systems:[
      {name:'Core capability',level:2,status:'Needs decomposition',ceiling:'Pieces of the desired capability likely exist, but not as one complete system.',route:'Identify the smallest set of existing technologies that reproduces the most important experience.'},
      {name:'Scale',level:3,status:'Likely experimental',ceiling:'Systems that work in demos often fail when users, data, compute, or physical constraints increase.',route:'Design a small architecture whose limiting resource can be measured, then attack that resource directly.'},
      {name:'Automation',level:2,status:'Strong current leverage',ceiling:'Human labor remains embedded in many supposedly automated workflows.',route:'Convert repeated human judgment into observable states, tools, checks, and agent actions.'},
      {name:'Missing technology',level:4,status:'Research target',ceiling:'At least one desired property may exceed current engineering limits.',route:'Define the missing capability quantitatively, then search for approximations that deliver the user-visible effect without requiring the literal breakthrough.'}
    ],
    bottlenecks:[
      {title:'The ambition is underspecified',why:'Big ideas hide multiple independent technical problems.',attack:'Turn the desired experience into measurable capabilities and constraints.'},
      {title:'Prototype versus reality gap',why:'A demonstration can avoid the hardest scale, reliability, cost, and safety constraints.',attack:'Design the first prototype specifically to expose the hardest assumption rather than merely look impressive.'},
      {title:'Conventional architecture bias',why:'Existing products encourage copying their assumptions.',attack:'Ask which assumptions disappear if the system is designed from the desired outcome backward.'}
    ],
    wildcards:[
      {title:'Approximate the impossible',idea:'Identify what humans actually perceive or value about the impossible capability and reproduce that effect with currently available technology.',payoff:'Can turn a Level 4 breakthrough dependency into a Level 2 integration problem.'},
      {title:'Elastic intelligence',idea:'Use expensive computation only when the system detects a moment where higher intelligence materially changes the outcome.',payoff:'Makes ambitious AI-heavy systems much cheaper to scale.'},
      {title:'Build the evaluator first',idea:'Create a test that can tell whether each experiment is genuinely closer to the north star before investing in the full product.',payoff:'Prevents impressive prototypes from drifting away from the original ambition.'}
    ],
    prototype:{name:'Frontier Proof 001',goal:'Test the single assumption most likely to make the ambition impossible.',build:['Write the north-star experience as five measurable outcomes.','Identify the outcome with the weakest existing technology.','Build the smallest isolated prototype of that capability.','Measure latency, cost, quality, reliability, and scale.','Use the failure data to design the next experiment.'],success:['The hardest assumption is tested rather than guessed.','At least one quantitative limit is established.','The next engineering move becomes clearer regardless of whether the prototype succeeds.']},
    roadmap:[
      {phase:'Now',objective:'Prove the hardest assumption',unlock:'Replace speculation with measurements.'},
      {phase:'Next',objective:'Integrate the minimum viable system',unlock:'Show the desired experience end to end.'},
      {phase:'Scale',objective:'Attack the dominant resource constraint',unlock:'Move from prototype physics/economics to product physics/economics.'},
      {phase:'Frontier',objective:'Research the remaining impossible pieces',unlock:'Turn unknowns into experiments and experiments into engineering.'}
    ]
  };
}

async function modelMission(ambition: string): Promise<Mission | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const prompt = `You are Frontier, an ambition-to-reality engineering system. A user says: "${ambition}"\n\nDo not shrink the ambition into a normal startup idea. Work backward from the ideal experience. Distinguish current technology from novel integration, experimental engineering, genuine breakthrough requirements, and speculation. Be technically grounded, skeptical, imaginative, and action-oriented. Return ONLY valid JSON matching this shape exactly: {"ambition":string,"northStar":string,"reality":string,"mode":"live reasoning","systems":[{"name":string,"level":1|2|3|4|5,"status":string,"ceiling":string,"route":string}],"bottlenecks":[{"title":string,"why":string,"attack":string}],"wildcards":[{"title":string,"idea":string,"payoff":string}],"prototype":{"name":string,"goal":string,"build":string[],"success":string[]},"roadmap":[{"phase":string,"objective":string,"unlock":string}]}. Give 5-7 systems, 3-5 bottlenecks, 3 unconventional routes, and 4-6 roadmap phases.`;
  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-5.6-terra',input:prompt})
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.output_text || data.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==='output_text')?.text;
    if (!text) return null;
    const clean = text.replace(/^```json\s*/,'').replace(/```$/,'').trim();
    return JSON.parse(clean) as Mission;
  } catch { return null; }
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const ambition = String(body.ambition || '').trim();
  if (!ambition) return NextResponse.json({error:'Tell Frontier what you want to make possible.'},{status:400});
  const live = await modelMission(ambition);
  if (live) return NextResponse.json(live);
  const lower = ambition.toLowerCase();
  const mission = /(vr|virtual reality|mmo|metaverse|full.?dive)/.test(lower) ? vrMmoMission(ambition) : genericMission(ambition);
  mission.mode = 'demo reasoning';
  return NextResponse.json(mission);
}
