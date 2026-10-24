'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {useDemo} from '../../lib/demo/store';

export default function NotificationsPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [appealOpen,setAppealOpen]=useState(false);
  const [appealDecisionId,setAppealDecisionId]=useState('');

  if(!state.session.signedIn){
    return (
      <AppShell showRail={false}>
        <h1>Notifications</h1>
        <article className="card">
          <p>Sign in to view your inbox. Suspended demo accounts may still open notices and appeals.</p>
          <button className="primary" onClick={()=>router.push('/account?mode=login&next=/notifications')}>Sign in</button>
        </article>
      </AppShell>
    );
  }

  function submitAppeal(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const err=demo.submitAppeal({
      decisionType:String(f.get('type')||'moderation') as 'moderation'|'teacher',
      decisionId:String(f.get('decisionId')||appealDecisionId||'demo-decision'),
      explanation:String(f.get('explanation')||''),
    });
    if(err){demo.flash(err);return;}
    setAppealOpen(false);
    e.currentTarget.reset();
  }

  return (
    <AppShell showRail={false}>
      <div className="section-head">
        <h1>Notifications</h1>
        <button className="outline" onClick={()=>demo.markAllNotificationsRead()}>Mark all read</button>
      </div>
      <p className="subtitle">No dedicated approved mock for this page — layout follows product requirements and settings patterns. Visual gap recorded separately from functional completion.</p>
      <p className="muted">Unread: {state.notifications.filter(n=>!n.read).length} · Account status: {state.session.accountStatus}</p>

      {state.notifications.length===0?(
        <article className="card"><p>No notifications yet.</p></article>
      ):state.notifications.map(n=>(
        <article key={n.id} className={'card notice-row'+(n.read?'':' unread')+(n.important?' important':'')}>
          <div>
            <h2>{n.title}</h2>
            <p>{n.body}</p>
            <p className="muted">{new Date(n.createdAt).toLocaleString()}{n.important?' · Essential (cannot be disabled)':''}</p>
          </div>
          <div className="actions">
            {!n.read&&!n.important&&(
              <button className="outline" onClick={()=>demo.markNotificationRead(n.id)}>Mark read</button>
            )}
            {n.important&&(
              <button className="outline" onClick={()=>{setAppealDecisionId(n.id);setAppealOpen(true);}}>Appeal (30 days)</button>
            )}
            {n.href&&<button className="primary" onClick={()=>router.push(n.href!)}>Open</button>}
          </div>
        </article>
      ))}

      {appealOpen&&(
        <form className="card" onSubmit={submitAppeal}>
          <h2>Submit appeal</h2>
          <p className="muted">One appeal per decision. Deadline is 30 days after notice availability (demo). Independent review only.</p>
          <label>Decision type
            <select name="type" defaultValue="moderation">
              <option value="moderation">Moderation</option>
              <option value="teacher">Teacher verification</option>
            </select>
          </label>
          <input type="hidden" name="decisionId" value={appealDecisionId}/>
          <label>Explanation<textarea name="explanation" required minLength={10} maxLength={2000} rows={4}/></label>
          <div className="actions">
            <button className="primary">Submit appeal</button>
            <button type="button" className="outline" onClick={()=>setAppealOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      {state.appeals.length>0&&(
        <>
          <h2>Your appeals</h2>
          {state.appeals.map(a=>(
            <article key={a.id} className="card">
              <p><strong>{a.decisionType}</strong> · {a.status}</p>
              <p>{a.explanation}</p>
              <p className="muted">Deadline {new Date(a.deadline).toLocaleDateString()}</p>
            </article>
          ))}
        </>
      )}
    </AppShell>
  );
}
