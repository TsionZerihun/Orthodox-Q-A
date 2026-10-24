'use client';
import {useMemo,useState,FormEvent} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {AppShell} from '../../../components/AppShell';
import {PostMenu} from '../../../components/PostMenu';
import {ImageLightbox} from '../../../components/ImageLightbox';
import {Icon,initials} from '../../../lib/icons';
import {useDemo} from '../../../lib/demo/store';

export default function QuestionDetailPage(){
  const {id}=useParams<{id:string}>();
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [teacherOnly,setTeacherOnly]=useState(false);
  const [sort,setSort]=useState<'helpful'|'newest'>('helpful');
  const [visible,setVisible]=useState(3);
  const [lightbox,setLightbox]=useState(false);
  const [commentFor,setCommentFor]=useState<string|null>(null);
  const [replyTo,setReplyTo]=useState<string|undefined>(undefined);
  const [expandedComments,setExpandedComments]=useState<Record<string,boolean>>({});
  const [editingQ,setEditingQ]=useState(false);
  const [editingAnswer,setEditingAnswer]=useState<string|null>(null);

  const question=state.questions.find(q=>q.id===id);
  const topic=question?state.topics.find(t=>t.id===question.topicIds[0]):undefined;

  const answers=useMemo(()=>{
    let list=state.answers.filter(a=>a.questionId===id);
    if(teacherOnly)list=list.filter(a=>a.author.isTeacher&&!a.author.isAnonymous);
    list=[...list].sort((a,b)=>sort==='helpful'?b.helpful-a.helpful:b.createdAt.localeCompare(a.createdAt));
    return list;
  },[state.answers,id,teacherOnly,sort]);

  if(!question){
    return (
      <AppShell showRail={false}>
        <button className="quiet back" onClick={()=>router.push('/')}>← Back to questions</button>
        <article className="card"><h1>Question not found</h1><p>This demo id is not in local state.</p></article>
      </AppShell>
    );
  }

  const isOwner=question.ownerKey===state.session.memberKey
    ||(!question.isAnonymous&&question.author.label===state.session.displayName);
  const canEdit=state.session.signedIn&&isOwner;
  const saved=state.savedQuestionIds.includes(question.id);
  const followed=state.followedQuestionIds.includes(question.id);
  const upvoted=state.upvotedQuestionIds.includes(question.id);
  const shown=answers.slice(0,visible);
  const followers=demo.followerCount(question.id);

  async function copyLink(){
    try{
      await navigator.clipboard.writeText(location.href);
      demo.flash('Link copied.');
    }catch{demo.flash('Could not copy link.');}
  }

  function submitAnswer(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!question)return;
    if(!state.session.signedIn){router.push('/account?mode=login&next=/questions/'+id);return;}
    if(!state.session.emailVerified){router.push('/account?mode=verify');return;}
    const body=String(new FormData(e.currentTarget).get('body')||'');
    if(body.trim().length<10){demo.flash('Answer must be at least 10 characters.');return;}
    const result=demo.postAnswer(question.id,body);
    if(typeof result==='string'){demo.flash(result);return;}
    e.currentTarget.reset();
  }

  function submitComment(e:FormEvent<HTMLFormElement>,answerId:string){
    e.preventDefault();
    const body=String(new FormData(e.currentTarget).get('body')||'');
    const err=demo.postComment(answerId,body,replyTo);
    if(err){demo.flash(err);return;}
    e.currentTarget.reset();
    setCommentFor(null);
    setReplyTo(undefined);
    setExpandedComments(c=>({...c,[answerId]:true}));
  }

  function saveQuestionEdit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!question)return;
    const f=new FormData(e.currentTarget);
    const err=demo.editQuestion(question.id,{
      title:String(f.get('title')||''),
      body:String(f.get('body')||''),
      topicIds:question.topicIds,
    });
    if(err){demo.flash(err);return;}
    setEditingQ(false);
  }

  return (
    <AppShell>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="quiet" onClick={()=>router.push('/')}>Home</button>
        <span>/</span>
        {topic&&<button type="button" className="quiet" onClick={()=>router.push(`/?topic=${topic.id}`)}>{topic.name}</button>}
        {topic&&<span>/</span>}
        <span className="muted truncate">{question.title}</span>
      </nav>

      <article className="card">
        <div className="tags"><span>{topic?.name||'Topic'}</span>{question.edited&&<span className="badge">Edited</span>}</div>
        {editingQ?(
          <form onSubmit={saveQuestionEdit}>
            <label>Title<input name="title" defaultValue={question.title} required minLength={10} maxLength={200}/></label>
            <label>Details<textarea name="body" defaultValue={question.body} maxLength={10000}/></label>
            <p className="muted">Anonymity is locked after publication and cannot be changed.</p>
            <div className="actions">
              <button className="primary">Save edits</button>
              <button type="button" className="outline" onClick={()=>setEditingQ(false)}>Cancel</button>
            </div>
          </form>
        ):(
          <>
            <h1 className="question-title">{question.title}</h1>
            <p className="meta">Asked by {question.author.label} · {question.relative} · {question.views} views · {followers} follower{followers===1?'':'s'}</p>
            <p className="body-text">{question.body}</p>
          </>
        )}
        <div className="actions" style={{marginTop:14}}>
          <button type="button" className={'vote-q'+(upvoted?' active':'')} onClick={()=>{
            const err=demo.toggleUpvoteQuestion(question.id);
            if(err)demo.flash(err);
          }}>
            <Icon name="up"/><span>{question.upvotes} Upvote</span>
          </button>
          <button type="button" className={followed?'primary':'outline'} onClick={()=>{
            if(!state.session.signedIn){router.push('/account?mode=login&next=/questions/'+id);return;}
            demo.toggleFollowQuestion(question.id);
          }}><Icon name="bell"/><span>{followed?'Following':'Follow'}</span></button>
          <button type="button" className={'push'+(saved?' active':'')} onClick={()=>{
            if(!state.session.signedIn){router.push('/account?mode=login&next=/questions/'+id);return;}
            demo.toggleSaveQuestion(question.id);
          }}><Icon name="save"/><span>Save</span></button>
          <button type="button" onClick={copyLink}><Icon name="reply"/><span>Share</span></button>
          <PostMenu
            canEdit={canEdit}
            onEdit={()=>setEditingQ(true)}
            onReport={()=>demo.reportContent(question.title)}
            onCopyLink={copyLink}
          />
        </div>
      </article>

      <div className="answer-heading">
        <h2>{answers.length} answers</h2>
        <div className="answer-filters">
          <div className="tabs compact" role="tablist">
            <button role="tab" aria-selected={!teacherOnly} className={!teacherOnly?'active':''} onClick={()=>setTeacherOnly(false)}>All answers</button>
            <button role="tab" aria-selected={teacherOnly} className={teacherOnly?'active':''} onClick={()=>setTeacherOnly(true)}>Verified teachers</button>
          </div>
          <label className="sort-label">Sort
            <select value={sort} onChange={e=>setSort(e.target.value as 'helpful'|'newest')}>
              <option value="helpful">Most helpful</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      </div>

      {shown.map(a=>{
        const helpfulOn=state.helpfulAnswerIds.includes(a.id);
        const openComments=expandedComments[a.id]??a.comments.length>0;
        const isAccepted=question.acceptedAnswerId===a.id;
        const canEditAnswer=a.ownerKey===state.session.memberKey||a.author.label===state.session.displayName;
        return (
          <article className="card" key={a.id}>
            <div className="author">
              {a.author.avatar
                ?<img className="avatar photo" src={a.author.avatar} alt="" width={36} height={36}/>
                :<span className="avatar mono" aria-hidden="true">{initials(a.author.label)}</span>}
              <strong>{a.author.label}</strong>
              {a.author.isTeacher&&!a.author.isAnonymous&&<span className="badge verified"><Icon name="check" className="badge-icon"/>Verified teacher</span>}
              {a.author.isQuestionAuthor&&<span className="badge">Author</span>}
              {a.edited&&<span className="badge">Edited</span>}
              {isAccepted&&<span className="badge verified" title="Selected by the asker — not official Church approval">Accepted</span>}
            </div>
            {editingAnswer===a.id?(
              <form onSubmit={e=>{
                e.preventDefault();
                const body=String(new FormData(e.currentTarget).get('body')||'');
                const err=demo.editAnswer(a.id,body);
                if(err){demo.flash(err);return;}
                setEditingAnswer(null);
              }}>
                <label>Answer<textarea name="body" defaultValue={a.body} required minLength={10} maxLength={20000}/></label>
                <button className="primary">Save</button>
              </form>
            ):(
              <p className="body-text">{a.body}</p>
            )}
            {a.references&&a.references.length>0&&(
              <p className="refs">References: {a.references.join('; ')}</p>
            )}
            <div className="actions">
              <button type="button" className={'helpful-btn'+(helpfulOn?' active':'')} onClick={()=>{
                const err=demo.toggleHelpfulAnswer(a.id);
                if(err)demo.flash(err);
              }}>
                <Icon name="helpful"/><span>Helpful {a.helpful}</span>
              </button>
              <button type="button" onClick={()=>{setCommentFor(commentFor===a.id?null:a.id);setReplyTo(undefined);}}>
                <Icon name="reply"/><span>Clarify ({a.comments.length})</span>
              </button>
              {isOwner&&!canEditAnswer&&(
                <button type="button" className="outline" onClick={()=>{
                  const err=demo.acceptAnswer(question.id,a.id);
                  if(err)demo.flash(err);
                }}>{isAccepted?'Accepted':'Accept answer'}</button>
              )}
              <PostMenu
                canEdit={!!canEditAnswer}
                onEdit={()=>setEditingAnswer(a.id)}
                onReport={()=>demo.reportContent('answer '+a.id)}
                onCopyLink={copyLink}
              />
            </div>
            {a.comments.length>0&&(
              <button type="button" className="quiet" onClick={()=>setExpandedComments(c=>({...c,[a.id]:!openComments}))}>
                {openComments?'Hide comments':'Show comments'}
              </button>
            )}
            {openComments&&a.comments.map(c=>(
              <div key={c.id} className={'comment'+(c.replyTo?' reply':'')}>
                <strong>{c.author.label}</strong>
                {c.author.isQuestionAuthor&&<span className="badge">Author</span>}
                <p>{c.body}</p>
                {!c.replyTo&&(
                  <button type="button" className="quiet" onClick={()=>{setCommentFor(a.id);setReplyTo(c.id);}}>Reply</button>
                )}
              </div>
            ))}
            {commentFor===a.id&&(
              <form className="comment-form" onSubmit={e=>submitComment(e,a.id)}>
                <label>{replyTo?'Reply (one level max)':'Comment'}
                  <textarea name="body" required minLength={1} maxLength={2000} placeholder={replyTo?'Write a reply…':'Clarify this answer…'}/>
                </label>
                <button className="primary">Post</button>
              </form>
            )}
          </article>
        );
      })}

      {answers.length>visible&&(
        <button className="outline full" onClick={()=>setVisible(v=>Math.min(v+3,answers.length))}>
          Show more answers ({visible} of {answers.length})
        </button>
      )}

      <form className="card" onSubmit={submitAnswer}>
        <h2>Your answer</h2>
        <label>Answer<textarea name="body" required minLength={10} maxLength={20000} placeholder="Share a thoughtful answer…"/></label>
        <p className="muted">Demo composer — rich text / uploads are simulated only.</p>
        <button className="primary">Post answer</button>
      </form>

      {question.image&&(
        <aside className="detail-side-note card">
          <h2>Attached image</h2>
          <button type="button" className="media" onClick={()=>setLightbox(true)}>
            <img src={question.image.src} alt={question.image.alt}/>
          </button>
          <button className="outline" onClick={()=>setLightbox(true)}>Expand</button>
          <p className="muted">{question.image.caption||'Image description available.'}</p>
        </aside>
      )}

      <ImageLightbox
        open={lightbox}
        src={question.image?.src||''}
        alt={question.image?.alt||''}
        caption={question.image?.caption}
        onClose={()=>setLightbox(false)}
      />
    </AppShell>
  );
}
