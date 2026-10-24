'use client';
import {useMemo,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {AppShell} from '../../../components/AppShell';
import {Icon,initials} from '../../../lib/icons';
import {useDemo} from '../../../lib/demo/store';

export default function ProfilePage(){
  const {id}=useParams<{id:string}>();
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [tab,setTab]=useState<'answers'|'questions'>('answers');

  const profile=useMemo(()=>{
    if(id==='me'||id===state.session.displayName){
      return {
        id:'me',
        label:state.session.displayName||'Member',
        isTeacher:state.session.role==='teacher'||state.session.role==='admin',
        title:state.session.role==='teacher'?'Teacher':'Member',
        church:'',
        bio:state.session.bio||'No biography yet.',
        joined:'Joined recently (demo)',
        avatar:'/assets/sample-user-avatar.png',
      };
    }
    const fromAnswer=state.answers.find(a=>a.author.id===id||a.author.label===decodeURIComponent(id));
    if(fromAnswer)return {...fromAnswer.author,bio:fromAnswer.author.bio||'Teacher profile (demo).',joined:fromAnswer.author.joined||'Joined 2022'};
    const fromQ=state.questions.find(q=>q.author.id===id||q.author.label===decodeURIComponent(id));
    if(fromQ)return {...fromQ.author,bio:'Member profile (demo).',joined:'Joined 2023'};
    return null;
  },[id,state]);

  const answers=state.answers.filter(a=>a.author.label===profile?.label);
  const questions=state.questions.filter(q=>q.author.label===profile?.label&&!q.isAnonymous);

  if(!profile){
    return <AppShell showRail={false}><article className="card"><h1>Profile not found</h1></article></AppShell>;
  }

  return (
    <AppShell>
      <article className="card profile-hero">
        {profile.avatar
          ?<img className="avatar photo large" src={profile.avatar} alt="" width={72} height={72}/>
          :<span className="avatar mono large">{initials(profile.label)}</span>}
        <div>
          <h1>{profile.label} {profile.isTeacher&&<Icon name="check" className="preview-check"/>}</h1>
          {profile.isTeacher&&<p className="badge verified inline">Verified teacher</p>}
          {profile.title&&<p className="meta">{profile.title}{profile.church?` · ${profile.church}`:''}</p>}
          <p className="body-text">{profile.bio}</p>
          <p className="muted">{profile.joined}</p>
          <p className="muted">Email is private and never shown on public profiles.</p>
          {profile.id==='me'&&(
            <button className="outline" onClick={()=>router.push('/settings')}>Edit profile</button>
          )}
        </div>
      </article>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab==='answers'} className={tab==='answers'?'active':''} onClick={()=>setTab('answers')}>Answers ({answers.length})</button>
        <button role="tab" aria-selected={tab==='questions'} className={tab==='questions'?'active':''} onClick={()=>setTab('questions')}>Questions ({questions.length})</button>
      </div>

      {tab==='answers'?answers.map(a=>{
        const q=state.questions.find(x=>x.id===a.questionId);
        return (
          <article key={a.id} className="card">
            <div className="tags"><span>{state.topics.find(t=>t.id===q?.topicIds[0])?.name||'Topic'}</span></div>
            <h2><button type="button" onClick={()=>router.push(`/questions/${a.questionId}`)}>{q?.title||'Question'}</button></h2>
            <p className="excerpt">{a.body.slice(0,180)}…</p>
            <p className="muted">Answered · Helpful {a.helpful}</p>
          </article>
        );
      }):questions.map(q=>(
        <article key={q.id} className="card">
          <h2><button type="button" onClick={()=>router.push(`/questions/${q.id}`)}>{q.title}</button></h2>
          <p className="muted">{q.relative} · {q.upvotes} upvotes</p>
        </article>
      ))}

      {profile.isTeacher&&(
        <aside className="card rail-note">
          <h2>Verified teacher</h2>
          <p>This badge indicates an administrator-approved teaching role in the demo. It is not automatic Church endorsement.</p>
        </aside>
      )}
    </AppShell>
  );
}
