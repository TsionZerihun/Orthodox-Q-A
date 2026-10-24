'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {Icon} from '../../lib/icons';
import {useDemo} from '../../lib/demo/store';

export default function SavedPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [q,setQ]=useState('');
  const [topic,setTopic]=useState('all');

  if(!state.session.signedIn){
    return (
      <AppShell showRail={false}>
        <h1>Saved questions</h1>
        <article className="card">
          <p>Sign in to view your private saved list.</p>
          <button className="primary" onClick={()=>router.push('/account?mode=login&next=/saved')}>Sign in</button>
        </article>
      </AppShell>
    );
  }

  const saved=useMemo(()=>{
    let list=state.questions.filter(qu=>state.savedQuestionIds.includes(qu.id));
    const needle=q.trim().toLowerCase();
    if(needle)list=list.filter(qu=>qu.title.toLowerCase().includes(needle)||qu.body.toLowerCase().includes(needle));
    if(topic!=='all')list=list.filter(qu=>qu.topicIds.includes(topic));
    return list;
  },[state,q,topic]);

  return (
    <AppShell showRail={false}>
      <h1>Saved questions</h1>
      <p className="subtitle">Only you can see this list.</p>
      <div className="filter-bar">
        <label className="search page-search">
          <Icon name="search"/>
          <input placeholder="Search your saved questions…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search saved"/>
        </label>
        <label>Topic
          <select value={topic} onChange={e=>setTopic(e.target.value)}>
            <option value="all">All topics</option>
            {state.topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {saved.length===0?(
        <article className="card empty-state dashed">
          <h2>Nothing saved yet</h2>
          <p>Save questions from the feed or question page to find them here.</p>
          <button className="outline" onClick={()=>router.push('/')}>Browse questions →</button>
        </article>
      ):saved.map(qu=>(
        <article key={qu.id} className="card saved-card">
          <h2>{qu.title}</h2>
          <div className="tags">{qu.topicIds.map(id=>{
            const t=state.topics.find(x=>x.id===id);
            return <span key={id}>{t?.name||id}</span>;
          })}</div>
          <p className="muted">{state.answers.filter(a=>a.questionId===qu.id).length} answers · Saved in demo</p>
          <p className="excerpt">{qu.body.slice(0,140)}…</p>
          {qu.image&&<img className="saved-thumb" src={qu.image.src} alt={qu.image.alt}/>}
          <div className="actions">
            <button type="button" className="push active" onClick={()=>demo.toggleSaveQuestion(qu.id)}><Icon name="save"/><span>Saved</span></button>
            <button type="button" className="outline" onClick={()=>router.push(`/questions/${qu.id}`)}>Open question →</button>
          </div>
        </article>
      ))}
    </AppShell>
  );
}
