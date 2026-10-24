'use client';
import {FormEvent,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {Icon} from '../../lib/icons';
import {useDemo} from '../../lib/demo/store';

export default function TeacherPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [tab,setTab]=useState<'unanswered'|'mine'>('unanswered');
  const isTeacher=state.session.role==='teacher'||state.session.role==='admin';

  const unanswered=useMemo(()=>state.questions.filter(q=>!state.answers.some(a=>a.questionId===q.id)),[state]);
  const mine=useMemo(()=>state.answers.filter(a=>a.author.label===state.session.displayName||a.author.isTeacher&&isTeacher),[state,isTeacher]);

  function submitApp(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    demo.submitTeacherApplication({
      name:String(f.get('name')||''),
      role:String(f.get('role')||''),
      institution:String(f.get('institution')||''),
      note:String(f.get('note')||''),
    });
    e.currentTarget.reset();
  }

  return (
    <AppShell>
      <h1>Teacher workspace {isTeacher&&<span className="badge verified">Verified teacher</span>}</h1>
      <p className="subtitle">Answer unanswered questions. Applications are private until an administrator decides.</p>

      {!isTeacher?(
        <section className="card">
          <h2>Apply to be a verified teacher</h2>
          <p className="muted">Demo form — evidence files are not uploaded. Pending review is simulated.</p>
          {state.teacherApplications.some(a=>a.status==='pending'&&a.name===state.session.displayName)&&(
            <p className="notice soft">Pending review — your demo application is awaiting an administrator.</p>
          )}
          <form onSubmit={submitApp}>
            <label>Full name<input name="name" required defaultValue={state.session.displayName}/></label>
            <label>Teaching role
              <select name="role" required defaultValue="Priest">
                <option>Priest</option>
                <option>Teacher</option>
                <option>Deacon</option>
              </select>
            </label>
            <label>Church / Institution<input name="institution" required/></label>
            <label>Evidence / Supporting documents
              <input type="file" onChange={()=>demo.flash('File selection noted — upload is simulated only (Supabase Storage deferred).')}/>
            </label>
            <label>Private note<textarea name="note" rows={3}/></label>
            <button className="primary" disabled={!state.session.signedIn}>Submit application</button>
          </form>
          {!state.session.signedIn&&(
            <button className="outline" onClick={()=>router.push('/account?mode=login&next=/teacher')}>Sign in to apply</button>
          )}
          <p className="muted">To preview the teacher queue, set Demo role → Teacher in Settings.</p>
        </section>
      ):(
        <>
          <div className="tabs" role="tablist">
            <button role="tab" className={tab==='unanswered'?'active':''} aria-selected={tab==='unanswered'} onClick={()=>setTab('unanswered')}>Unanswered questions</button>
            <button role="tab" className={tab==='mine'?'active':''} aria-selected={tab==='mine'} onClick={()=>setTab('mine')}>My answers</button>
          </div>
          {tab==='unanswered'?unanswered.map(q=>(
            <article key={q.id} className="card">
              <h2>{q.title}</h2>
              <p className="excerpt">{q.body.slice(0,140)}…</p>
              <p className="muted">{state.topics.find(t=>t.id===q.topicIds[0])?.name} · {q.relative}</p>
              <button className="primary" onClick={()=>router.push(`/questions/${q.id}`)}><Icon name="reply"/>Answer</button>
            </article>
          )):mine.map(a=>{
            const q=state.questions.find(x=>x.id===a.questionId);
            return (
              <article key={a.id} className="card">
                <h2>{q?.title}</h2>
                <p className="excerpt">{a.body.slice(0,160)}…</p>
                <button className="outline" onClick={()=>router.push(`/questions/${a.questionId}`)}>Open</button>
              </article>
            );
          })}
          <aside className="card">
            <h2>Your profile</h2>
            <button className="quiet" onClick={()=>router.push('/profile/me')}>View profile →</button>
            <p><strong>{state.session.displayName||'Teacher'}</strong></p>
            <p className="muted">Verification status: Verified (demo role)</p>
          </aside>
        </>
      )}
    </AppShell>
  );
}
