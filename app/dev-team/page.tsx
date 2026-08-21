'use client';

import { useEffect, useMemo, useState } from 'react';

type TeamMember={role:string;mission:string;decision:string};
type GeneratedFile={path:string;content:string;owner:string};
type PlannedCommand={label:string;command:string;kind:'install'|'test'|'build'|'limit'|'inspect'};
type CommandResult=PlannedCommand&{exitCode:number;stdout:string;stderr:string;durationMs:number};
type DevRun={
  ambition:string;
  createdAt:string;
  plan:{projectName:string;summary:string;scopeNote:string;runtime:string;team:TeamMember[];architecture:string[];acceptanceCriteria:string[];files:GeneratedFile[];commands:PlannedCommand[]};
  execution:{sandboxId?:string;filesWritten?:string[];fileListing?:string;commands:CommandResult[];testsPassed:boolean;buildsPassed:boolean;limitEvidence:CommandResult[];error?:string};
};

const STORAGE='frontier.dev-runs.v1';
const stages=['Product Lead is defining the vertical slice…','Architect is choosing the smallest testable system…','Engineers are writing the first implementation…','QA is creating and running tests…','Performance is probing the failure limit…','Tech Lead is reviewing the evidence…'];

function readRuns():DevRun[]{try{return JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{return[]}}
function saveRun(run:DevRun){const next=[run,...readRuns()].slice(0,20);localStorage.setItem(STORAGE,JSON.stringify(next));return next}
function commandState(r:CommandResult){return r.exitCode===0?'PASS':'FAIL'}

export default function DevTeamPage(){
  const[ambition,setAmbition]=useState('');
  const[loading,setLoading]=useState(false);
  const[stage,setStage]=useState(0);
  const[run,setRun]=useState<DevRun|null>(null);
  const[error,setError]=useState('');
  const[runs,setRuns]=useState<DevRun[]>([]);
  const[selectedFile,setSelectedFile]=useState(0);
  const[showHistory,setShowHistory]=useState(false);

  useEffect(()=>{
    setRuns(readRuns());
    const params=new URLSearchParams(window.location.search);
    const fromUrl=params.get('ambition');
    if(fromUrl){setAmbition(fromUrl);return}
    try{
      const projects=JSON.parse(localStorage.getItem('frontier.projects.v1')||'[]');
      if(projects?.[0]?.ambition)setAmbition(projects[0].ambition);
    }catch{}
  },[]);

  useEffect(()=>{if(!loading)return;setStage(0);const id=setInterval(()=>setStage(s=>Math.min(s+1,stages.length-1)),8000);return()=>clearInterval(id)},[loading]);

  async function launch(previous?:DevRun){
    if(!ambition.trim())return;
    setLoading(true);setError('');
    try{
      const res=await fetch('/api/dev-team',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ambition,previous:previous?{plan:previous.plan,execution:previous.execution}:undefined})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Dev Team failed');
      setRun(data);setSelectedFile(0);setRuns(saveRun(data));
    }catch(e){setError(e instanceof Error?e.message:'Dev Team failed')}
    finally{setLoading(false)}
  }

  function exportRun(){if(!run)return;const blob=new Blob([JSON.stringify(run,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`frontier-dev-${run.plan.projectName.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}.json`;a.click();URL.revokeObjectURL(url)}
  const testCommands=useMemo(()=>run?.execution?.commands?.filter(c=>c.kind==='test')||[],[run]);
  const limitCommands=useMemo(()=>run?.execution?.commands?.filter(c=>c.kind==='limit')||[],[run]);

  return <main className="devShell">
    <nav className="devNav"><a className="brandLink" href="/"><span className="mark">F</span> FRONTIER</a><div className="devNavRight"><button className="ghostBtn" onClick={()=>setShowHistory(!showHistory)}>Dev runs ({runs.length})</button><span className="alpha">ALPHA 0.5 · DEV TEAM</span></div></nav>

    {showHistory&&<section className="savedPanel"><div className="savedHead"><div><div className="eyebrow">Engineering history</div><h3>Previous development runs</h3></div><button className="ghostBtn" onClick={()=>setShowHistory(false)}>Close</button></div>{runs.length===0?<p className="muted">No development runs yet.</p>:<div className="savedList">{runs.map((r,i)=><button className="savedMain devHistory" key={i} onClick={()=>{setRun(r);setAmbition(r.ambition);setShowHistory(false)}}><strong>{r.plan.projectName}</strong><span>{new Date(r.createdAt).toLocaleString()} · tests {r.execution.testsPassed?'passed':'failed'}</span></button>)}</div>}</section>}

    <section className="devHero"><div className="eyebrow">Frontier engineering organization</div><h1>Give the project to a <em>development team.</em></h1><p>Frontier creates a testable vertical slice, assigns engineering roles, writes the code, executes it inside an isolated Vercel microVM, runs tests, probes a limit, and reports the evidence.</p></section>

    <section className="command devCommand"><textarea rows={4} value={ambition} onChange={e=>setAmbition(e.target.value)} placeholder="What should the team build?"/><div className="commandFooter"><span>{loading?stages[stage]:'The team will build the smallest real piece that advances the full ambition.'}</span><button onClick={()=>launch()} disabled={loading||!ambition.trim()}>{loading?'Team working…':'Assemble Dev Team →'}</button></div>{loading&&<div className="progress"><span style={{width:`${((stage+1)/stages.length)*100}%`}}/></div>}</section>
    {error&&<div className="error">{error}</div>}

    {run&&<section className="devResults">
      <div className="devResultHead"><div><div className="eyebrow">Engineering run</div><h2>{run.plan.projectName}</h2><p>{run.plan.summary}</p></div><div className="devHeadActions"><span className={`runBadge ${run.execution.testsPassed?'ok':'bad'}`}>{run.execution.testsPassed?'TESTS PASS':'TESTS NEED WORK'}</span><button className="ghostBtn" onClick={exportRun}>Export run</button></div></div>

      <div className="scopeNote"><strong>What the team actually tested</strong><p>{run.plan.scopeNote}</p></div>

      <div className="sectionHead"><span>01</span><h3>Your development team</h3></div>
      <div className="teamGrid">{run.plan.team.map((m,i)=><article className="teamCard" key={i}><div className="roleNum">{String(i+1).padStart(2,'0')}</div><h4>{m.role}</h4><p>{m.mission}</p><div className="teamDecision"><span>DECISION</span>{m.decision}</div></article>)}</div>

      <div className="sectionHead"><span>02</span><h3>Architecture chosen</h3></div>
      <div className="architectureList">{run.plan.architecture.map((x,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></div>)}</div>

      <div className="sectionHead"><span>03</span><h3>Code the team produced</h3></div>
      <div className="codeWorkspace"><aside>{run.plan.files.map((f,i)=><button className={selectedFile===i?'selected':''} key={f.path} onClick={()=>setSelectedFile(i)}><strong>{f.path}</strong><span>{f.owner}</span></button>)}</aside><article className="codePane"><div className="codeHead"><span>{run.plan.files[selectedFile]?.path}</span><b>{run.plan.files[selectedFile]?.owner}</b></div><pre><code>{run.plan.files[selectedFile]?.content}</code></pre></article></div>

      <div className="sectionHead"><span>04</span><h3>What actually ran</h3></div>
      {run.execution.error&&<div className="error"><strong>Sandbox execution problem:</strong> {run.execution.error}</div>}
      <div className="commandRuns">{(run.execution.commands||[]).map((c,i)=><article className="commandRun" key={i}><div className="commandRunHead"><div><span className={`cmdKind ${c.kind}`}>{c.kind}</span><strong>{c.label}</strong></div><b className={c.exitCode===0?'pass':'fail'}>{commandState(c)} · {c.durationMs}ms</b></div><code>$ {c.command}</code>{c.stdout&&<pre className="terminal">{c.stdout}</pre>}{c.stderr&&<pre className="terminal stderr">{c.stderr}</pre>}</article>)}</div>

      <div className="evidenceGrid"><article><div className="eyebrow">QA verdict</div><h3>{testCommands.every(c=>c.exitCode===0)&&testCommands.length?'The slice passed its tests.':'The team found failures.'}</h3><p>{testCommands.length?`${testCommands.filter(c=>c.exitCode===0).length}/${testCommands.length} test commands exited successfully.`:'No test evidence was returned.'}</p></article><article><div className="eyebrow">Limit evidence</div><h3>{limitCommands.length?'A boundary was probed.':'No boundary measurement yet.'}</h3><p>{limitCommands.length?`The performance engineer ran ${limitCommands.length} limit/stress command${limitCommands.length>1?'s':''}. Open the command output above for the measured ceiling.`:'Run another iteration and require a measurable stress test.'}</p></article></div>

      <div className="sectionHead"><span>05</span><h3>Definition of done</h3></div>
      <ul className="criteria">{run.plan.acceptanceCriteria.map(x=><li key={x}>{x}</li>)}</ul>

      <div className="iterationCard"><div><div className="eyebrow">Tech Lead</div><h3>{run.execution.testsPassed?'The team can advance the prototype.':'The team should revise before advancing.'}</h3><p>Another iteration feeds the previous code and command evidence back to the team so it can change the implementation based on what actually failed.</p></div><button className="primary" onClick={()=>launch(run)} disabled={loading}>{loading?'Revising…':'Run another iteration →'}</button></div>
    </section>}

    <footer className="devFooter">Generated code runs in an isolated Vercel Sandbox. Frontier only labels commands as passing when the real process exits successfully; unsupported external toolchains must be reported as untested rather than simulated.</footer>
  </main>
}
