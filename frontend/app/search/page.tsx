'use client';
import {useMemo,useState,Suspense} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {Icon} from '../../lib/icons';
import {useDemo} from '../../lib/demo/store';

function SearchInner(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const params=useSearchParams();
  const q=params.get('q')||'';
  const [topic,setTopic]=useState('all');
  const [answered,setAnswered]=useState('any');
  const [sort,setSort]=useState('relevance');
  const [page,setPage]=useState(1);
  const pageSize=4;

  const results=useMemo(()=>{
    const needle=q.trim().toLowerCase();
    let list=state.questions.filter(qu=>{
      if(!needle)return true;
      return qu.title.toLowerCase().includes(needle)||qu.body.toLowerCase().includes(needle);
    });
    if(topic!=='all')list=list.filter(qu=>qu.topicIds.includes(topic));
    if(answered==='answered')list=list.filter(qu=>state.answers.some(a=>a.questionId===qu.id));
    if(answered==='unanswered')list=list.filter(qu=>!state.answers.some(a=>a.questionId===qu.id));
    if(sort==='newest')list=[...list].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    if(sort==='votes')list=[...list].sort((a,b)=>b.upvotes-a.upvotes);
    return list;
  },[state,q,topic,answered,sort]);

  const pages=Math.max(1,Math.ceil(results.length/pageSize));
  const slice=results.slice((page-1)*pageSize,page*pageSize);

  function highlight(text:string){
    if(!q.trim())return text;
    const parts=text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'ig'));
    return parts.map((p,i)=>p.toLowerCase()===q.toLowerCase()?<mark key={i}>{p}</mark>:p);
  }

  function clearFilters(){
    setTopic('all');setAnswered('any');setSort('relevance');setPage(1);
    router.push('/search');
  }

  return (
    <AppShell>
      <h1>Search results</h1>
      <p className="subtitle">{results.length} matching questions{q?` for “${q}”`:''}. Refine with filters below.</p>

      <div className="filter-bar">
        <label>Topic
          <select value={topic} onChange={e=>{setTopic(e.target.value);setPage(1);}}>
            <option value="all">All topics</option>
            {state.topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label>Answered status
          <select value={answered} onChange={e=>{setAnswered(e.target.value);setPage(1);}}>
            <option value="any">Any</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </label>
        <label>Sort by
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="votes">Most upvoted</option>
          </select>
        </label>
        <button type="button" className="quiet" onClick={clearFilters}>Clear filters</button>
      </div>

      {slice.length===0?(
        <article className="card empty-state">
          <Icon name="search"/>
          <h2>No results found</h2>
          <p>Try different keywords or clear filters.</p>
          <button className="outline" onClick={clearFilters}>Clear filters</button>
        </article>
      ):slice.map(qu=>{
        const topicName=state.topics.find(t=>t.id===qu.topicIds[0])?.name||'Topic';
        const answers=state.answers.filter(a=>a.questionId===qu.id).length;
        return (
          <article key={qu.id} className="card search-result">
            <h2><button type="button" onClick={()=>router.push(`/questions/${qu.id}`)}>{highlight(qu.title)}</button></h2>
            <p className="excerpt">{highlight(qu.body.slice(0,160))}…</p>
            <div className="meta-row">
              <span className="tags"><span>{topicName}</span></span>
              <span className="muted">{answers} answers · {new Date(qu.createdAt).toLocaleDateString()}</span>
            </div>
          </article>
        );
      })}

      {results.length>pageSize&&(
        <nav className="pagination" aria-label="Search pages">
          <button className="outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button>
          {Array.from({length:pages},(_,i)=>i+1).map(n=>(
            <button key={n} className={n===page?'primary':'outline'} onClick={()=>setPage(n)}>{n}</button>
          ))}
          <button className="outline" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </nav>
      )}
    </AppShell>
  );
}

export default function SearchPage(){
  return (
    <Suspense fallback={<AppShell><p role="status">Loading search…</p></AppShell>}>
      <SearchInner/>
    </Suspense>
  );
}
