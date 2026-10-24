'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {Icon} from '../../lib/icons';
import {useDemo} from '../../lib/demo/store';

const iconCycle=['book','prayer','leaf','church','compass','topics'] as const;

export default function TopicsPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [q,setQ]=useState('');
  const [active,setActive]=useState(state.followedTopicIds[0]||state.topics[0]?.id||'');

  const topics=useMemo(()=>{
    const needle=q.trim().toLowerCase();
    if(!needle)return state.topics;
    return state.topics.filter(t=>t.name.toLowerCase().includes(needle)||t.description.toLowerCase().includes(needle));
  },[state.topics,q]);

  const activeTopic=state.topics.find(t=>t.id===active);
  const recent=state.questions.filter(qu=>qu.topicIds.includes(active)).slice(0,5);

  return (
    <AppShell showRail={false}>
      <h1>Explore topics</h1>
      <p className="subtitle">Browse conversations by subject. Follow topics you care about.</p>
      <label className="search page-search">
        <Icon name="search"/>
        <input
          aria-label="Search topics"
          placeholder="Search topics…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
      </label>

      <div className="topic-grid">
        {topics.map((t,i)=>(
          <article
            key={t.id}
            className={'card topic-card'+(active===t.id?' selected':'')+(state.followedTopicIds.includes(t.id)?' following':'')}
          >
            <button type="button" className="topic-card-main" onClick={()=>setActive(t.id)}>
              <Icon name={iconCycle[i%iconCycle.length]}/>
              <h2>{t.name}</h2>
              <p>{t.description}</p>
              <span className="muted">{t.questionCount} questions</span>
            </button>
            <button
              type="button"
              className={state.followedTopicIds.includes(t.id)?'primary':'outline'}
              onClick={()=>{
                if(!state.session.signedIn){router.push('/account?mode=login&next=/topics');return;}
                demo.toggleFollowTopic(t.id);
              }}
            >{state.followedTopicIds.includes(t.id)?'Following':'Follow'}</button>
          </article>
        ))}
      </div>

      {activeTopic&&(
        <section className="topic-recent">
          <div className="section-head">
            <h2>Questions in {activeTopic.name}</h2>
            <button className="quiet" onClick={()=>router.push(`/?topic=${activeTopic.id}`)}>View all questions →</button>
          </div>
          <p className="muted">Recent questions about {activeTopic.name.toLowerCase()}…</p>
          {recent.length===0?(
            <article className="card"><p>No questions in this topic yet.</p></article>
          ):recent.map(qu=>(
            <button key={qu.id} className="card insight-row" onClick={()=>router.push(`/questions/${qu.id}`)}>
              <strong>{qu.title}</strong>
              <small>{qu.body.slice(0,120)}…</small>
              <span className="muted">{state.answers.filter(a=>a.questionId===qu.id).length} answers · {qu.relative}</span>
            </button>
          ))}
        </section>
      )}
      <p className="muted gap-note">Visual gap: topic card illustrations from `02_Topics.png` are not in shared assets; line icons are used instead.</p>
    </AppShell>
  );
}
