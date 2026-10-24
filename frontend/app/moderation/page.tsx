'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {useDemo} from '../../lib/demo/store';

export default function ModerationPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const staff=state.session.role==='moderator'||state.session.role==='admin';
  const [status,setStatus]=useState<'open'|'review'|'resolved'>('open');
  const [selected,setSelected]=useState(state.reports[0]?.id||'');

  const list=useMemo(()=>state.reports.filter(r=>r.status===status),[state.reports,status]);
  const current=state.reports.find(r=>r.id===selected)||list[0];

  if(!staff){
    return (
      <AppShell showRail={false}>
        <h1>Moderation</h1>
        <article className="card">
          <p>Moderator or admin demo role required. Production permissions are separate.</p>
          <button className="outline" onClick={()=>router.push('/settings')}>Open settings to set demo role</button>
        </article>
      </AppShell>
    );
  }

  return (
    <AppShell showRail={false}>
      <h1>Moderation</h1>
      <p className="subtitle">Review reported content and keep the space respectful. Actions update demo state only.</p>
      <div className="tabs" role="tablist">
        <button className={status==='open'?'active':''} onClick={()=>setStatus('open')}>Open reports ({state.reports.filter(r=>r.status==='open').length})</button>
        <button className={status==='review'?'active':''} onClick={()=>setStatus('review')}>Under review ({state.reports.filter(r=>r.status==='review').length})</button>
        <button className={status==='resolved'?'active':''} onClick={()=>setStatus('resolved')}>Resolved ({state.reports.filter(r=>r.status==='resolved').length})</button>
      </div>

      <div className="mod-split">
        <div className="mod-list">
          {list.length===0&&<article className="card"><p>No reports in this status.</p></article>}
          {list.map(r=>(
            <button
              key={r.id}
              className={'card mod-item'+(current?.id===r.id?' selected':'')}
              onClick={()=>setSelected(r.id)}
            >
              <strong>{r.contentType}</strong>
              <p>{r.snippet}</p>
              <span className="muted">{r.reason} · {r.createdAt} · {r.reports} reports</span>
            </button>
          ))}
        </div>
        {current&&(
          <article className="card mod-detail">
            <h2>Reported {current.contentType.toLowerCase()} <span className="badge">{current.status}</span></h2>
            <p className="body-text">{current.snippet}</p>
            <p className="meta">Author (moderator view): {current.authorLabel}</p>
            <h3>Report details</h3>
            <ul className="detail-list">
              <li>Reason: {current.reason}</li>
              <li>Reports: {current.reports}</li>
              <li>Submitted: {current.createdAt}</li>
              {current.questionId&&<li>Question id: {current.questionId}</li>}
            </ul>
            <div className="actions wrap">
              <button className="outline" onClick={()=>demo.resolveReport(current.id,'Dismiss report')}>Dismiss report</button>
              <button className="outline" onClick={()=>demo.resolveReport(current.id,'Warn user')}>Warn user</button>
              <button className="outline" onClick={()=>{
                const days=state.session.role==='moderator'?7:30;
                if(state.session.role==='moderator'){
                  demo.flash('Moderator suspension capped at 7 days (demo). Longer suspensions require an administrator.');
                }
                demo.resolveReport(current.id,`Suspend user (${days} days)`);
              }}>Suspend user{state.session.role==='moderator'?' (≤7 days)':''}</button>
              <button className="outline danger" onClick={()=>demo.resolveReport(current.id,'Remove content')}>Remove content</button>
              <button className="outline" onClick={()=>demo.resolveReport(current.id,'Restore content')}>Restore content</button>
            </div>
            <p className="muted">Demo ACL only. Moderators cannot moderate staff accounts or exceed the 7-day suspend limit (DB v2).</p>
            {current.questionId&&(
              <button className="quiet" onClick={()=>router.push(`/questions/${current.questionId}`)}>Open content →</button>
            )}
          </article>
        )}
      </div>
    </AppShell>
  );
}
