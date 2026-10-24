'use client';
import {Suspense,useMemo} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {AppShell} from '../components/AppShell';
import {QuestionCard,type Question} from '../components/QuestionCard';
import {useDemo} from '../lib/demo/store';
import {sampleByTitle} from '../lib/sampleHome';

type Feed='trending'|'latest'|'unanswered'|'following';

function HomeInner(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const params=useSearchParams();
  const feed=(params.get('feed') as Feed)||'trending';
  const topic=params.get('topic')||'';

  const labels=state.session.language==='am'
    ?{title:'ጠይቅ። ተማር። እደግ።'}
    :{title:'Ask. Learn. Grow.'};

  const questions=useMemo(()=>{
    let list=[...state.questions];
    if(topic)list=list.filter(q=>q.topicIds.includes(topic));
    if(feed==='unanswered'){
      list=list.filter(q=>state.answers.filter(a=>a.questionId===q.id).length===0);
    }
    if(feed==='following'){
      list=list.filter(q=>state.followedQuestionIds.includes(q.id)||q.topicIds.some(id=>state.followedTopicIds.includes(id)));
    }
    if(feed==='trending'){
      const order=['How can I build a daily prayer habit?','What does this church artwork represent?','Where should I begin reading the Bible?'];
      list.sort((a,b)=>{
        const aa=order.indexOf(a.title); const bb=order.indexOf(b.title);
        return (aa===-1?999:aa)-(bb===-1?999:bb);
      });
    }else if(feed==='latest'){
      list.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  },[state,feed,topic]);

  function toCard(q:typeof state.questions[0]):Question{
    return {
      id:q.id,
      title:q.title,
      body:q.body,
      is_anonymous:q.isAnonymous,
      author:{label:q.author.label},
      topics:q.topicIds.map(id=>{
        const t=state.topics.find(x=>x.id===id);
        return {id,name:t?.name||id};
      }),
      answer_count:state.answers.filter(a=>a.questionId===q.id).length,
      created_at:q.createdAt,
    };
  }

  function setFeed(next:Feed){
    const sp=new URLSearchParams(params.toString());
    sp.set('feed',next);
    router.push('/?'+sp.toString());
  }

  return (
    <>
      <h1>{labels.title}</h1>
      <p className="subtitle">A community rooted in faith. Everyone is welcome to ask.</p>
      <div className="tabs" role="tablist" aria-label="Feed">
        {(['trending','latest','unanswered','following'] as const).map(t=>(
          <button
            key={t}
            role="tab"
            aria-selected={feed===t}
            className={feed===t?'active':''}
            onClick={()=>setFeed(t)}
          >{t[0].toUpperCase()+t.slice(1)}</button>
        ))}
      </div>
      {topic&&(
        <button className="outline clear-topic" onClick={()=>{
          const sp=new URLSearchParams(params.toString());
          sp.delete('topic');
          router.push('/?'+sp.toString());
        }}>Clear topic filter ×</button>
      )}
      {feed==='following'&&questions.length===0&&(
        <article className="card">
          <h2>Follow topics or questions to build this feed</h2>
          <p>In demo mode, follow a topic on the Topics page or follow a question from its detail view.</p>
        </article>
      )}
      {questions.length===0&&feed!=='following'?(
        <article className="card">
          <h2>A thoughtful question starts a conversation.</h2>
          <p>No questions match yet.</p>
        </article>
      ):questions.map(q=>{
        const card=toCard(q);
        const sample=sampleByTitle[q.title];
        return (
          <QuestionCard
            key={q.id}
            question={card}
            sample={sample?{
              ...sample,
              votes:q.upvotes,
              answersLabel:card.answer_count||sample.answersLabel,
              asker:q.author.label,
              relative:q.relative,
              image:q.image||sample.image,
            }:{
              asker:q.author.label,
              relative:q.relative,
              votes:q.upvotes,
              answersLabel:card.answer_count,
              topicLabel:card.topics[0]?.name,
              image:q.image,
            }}
            onOpen={()=>router.push(`/questions/${q.id}`)}
            onNotBuilt={()=>{}}
            onUpvote={()=>demo.toggleUpvoteQuestion(q.id)}
            onSave={()=>demo.toggleSaveQuestion(q.id)}
            saved={state.savedQuestionIds.includes(q.id)}
            upvoted={state.upvotedQuestionIds.includes(q.id)}
            canEdit={state.session.signedIn&&!q.isAnonymous&&q.author.label===state.session.displayName}
            onEdit={()=>demo.flash('Edit opens in demo as a status only — inline editor not yet on the list card.')}
            onReport={()=>demo.reportContent(q.title)}
            onCopyLink={async()=>{
              try{
                await navigator.clipboard.writeText(`${location.origin}/questions/${q.id}`);
                demo.flash('Link copied.');
              }catch{
                demo.flash('Could not copy link.');
              }
            }}
          />
        );
      })}
    </>
  );
}

export default function HomePage(){
  return (
    <AppShell>
      <Suspense fallback={<p role="status">Loading questions…</p>}>
        <HomeInner/>
      </Suspense>
    </AppShell>
  );
}
