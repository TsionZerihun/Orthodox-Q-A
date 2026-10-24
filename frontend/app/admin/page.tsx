'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {useDemo} from '../../lib/demo/store';

export default function AdminPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [selected,setSelected]=useState(state.teacherApplications[0]?.id||'');
  const [note,setNote]=useState('');
  const current=state.teacherApplications.find(a=>a.id===selected)||state.teacherApplications[0];

  if(state.session.role!=='admin'){
    return (
      <AppShell showRail={false}>
        <h1>Administration</h1>
        <article className="card">
          <p>Admin demo role required. This screen does not grant production privileges.</p>
          <button className="outline" onClick={()=>router.push('/settings')}>Set demo role in Settings</button>
        </article>
      </AppShell>
    );
  }

  function addTopic(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    demo.addTopic(String(f.get('name')||''),String(f.get('description')||''));
    e.currentTarget.reset();
  }

  return (
    <AppShell showRail={false}>
      <h1>Administration <span className="badge">Admin only</span></h1>
      <p className="subtitle">Users, verification, topics, and activity — demo state only.</p>

      <div className="stat-grid">
        <article className="card stat"><strong>{state.teacherApplications.filter(a=>a.status==='pending'||a.status==='review').length}</strong><span>Pending teacher applications</span></article>
        <article className="card stat"><strong>{state.reports.filter(r=>r.status!=='resolved').length}</strong><span>Open reports</span></article>
        <article className="card stat"><strong>{state.topics.length}</strong><span>Active topics</span></article>
      </div>

      <div className="admin-split">
        <section>
          <h2>Teacher applications</h2>
          <div className="table card">
            <div className="table-row head"><span>Applicant</span><span>Role</span><span>Institution</span><span>Status</span><span>Submitted</span></div>
            {state.teacherApplications.map(a=>(
              <button key={a.id} className={'table-row'+(current?.id===a.id?' selected':'')} onClick={()=>setSelected(a.id)}>
                <span>{a.name}</span><span>{a.role}</span><span>{a.institution}</span>
                <span className="badge">{a.status}</span><span>{a.submittedAt}</span>
              </button>
            ))}
          </div>

          <h2>Topic management</h2>
          <form className="card inline-form" onSubmit={addTopic}>
            <input name="name" placeholder="Topic name" required/>
            <input name="description" placeholder="Description" required/>
            <button className="primary">+ Add topic</button>
          </form>
          <div className="table card">
            <div className="table-row head"><span>Name</span><span>Description</span><span>Questions</span><span>Status</span></div>
            {state.topics.map(t=>(
              <div key={t.id} className="table-row">
                <span>{t.name}</span><span>{t.description}</span><span>{t.questionCount}</span>
                <span className="badge">{t.archived?'Archived':'Active'}</span>
                {!t.archived&&(
                  <button type="button" className="quiet" onClick={()=>demo.archiveTopic(t.id)}>Archive</button>
                )}
              </div>
            ))}
          </div>

          <h2>Appeals (demo)</h2>
          {state.appeals.length===0?(
            <article className="card"><p>No appeals submitted.</p></article>
          ):state.appeals.map(a=>(
            <article key={a.id} className="card">
              <p><strong>{a.decisionType}</strong> · {a.status} · deadline {new Date(a.deadline).toLocaleDateString()}</p>
              <p>{a.explanation}</p>
              <p className="muted">Independent review required — original decision-maker cannot decide (demo).</p>
            </article>
          ))}
        </section>

        <aside>
          {current&&(
            <article className="card">
              <h2>Application details <span className="badge">Private</span></h2>
              <p><strong>{current.name}</strong> · {current.role}</p>
              <p className="muted">{current.institution}</p>
              <p className="muted">Evidence list is simulated (no files stored). Private evidence never appears on public pages.</p>
              <label>Reviewer decision
                <textarea value={note} onChange={e=>setNote(e.target.value)} required rows={3} placeholder="Required explanation"/>
              </label>
              <div className="actions wrap">
                <button className="primary" onClick={()=>demo.decideTeacherApp(current.id,'approved',note||'Approved in demo')}>Approve application</button>
                <button className="outline danger" onClick={()=>demo.decideTeacherApp(current.id,'declined',note||'Declined in demo')}>Decline</button>
                {(current.status==='approved')&&(
                  <button className="outline danger" onClick={()=>demo.decideTeacherApp(current.id,'revoked',note||'Revoked in demo')}>Revoke verification</button>
                )}
              </div>
            </article>
          )}
          <article className="card">
            <h2>Audit history</h2>
            <p className="muted">Moderation and staff-role changes (demo log).</p>
            <div className="table compact">
              {state.audit.map((row,i)=>(
                <div key={i} className="table-row">
                  <span>{row.user}</span><span>{row.action}</span><span>{row.details}</span><span>{row.date}</span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </AppShell>
  );
}
