'use client';
import {useEffect,useMemo,useState,type ReactNode,FormEvent} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {SiteHeader} from './SiteHeader';
import {SideNav} from './SideNav';
import {RightRail} from './RightRail';
import {AskDialog} from './AskDialog';
import {Icon} from '../lib/icons';
import {useDemo} from '../lib/demo/store';
import type {Question} from './QuestionCard';

type Props={
  children:ReactNode;
  showRail?:boolean;
  bare?:boolean;
};

export function AppShell({children,showRail=true,bare=false}:Props){
  const pathname=usePathname();
  const router=useRouter();
  const demo=useDemo();
  const {state,flash,statusHint,clearHint}=demo;
  const [menu,setMenu]=useState(false);
  const [query,setQuery]=useState('');
  const [askOpen,setAskOpen]=useState(false);
  const [dark,setDark]=useState(false);

  useEffect(()=>{
    const stored=localStorage.getItem('qa-theme');
    const preferDark=stored==='dark'||(stored==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(preferDark||state.session.theme==='dark');
  },[state.session.theme]);

  useEffect(()=>{
    document.documentElement.dataset.theme=dark?'dark':'light';
    localStorage.setItem('qa-theme',dark?'dark':'light');
  },[dark]);

  useEffect(()=>{
    document.documentElement.lang=state.session.language;
  },[state.session.language]);

  const labels=state.session.language==='am'
    ?{home:'መነሻ',topics:'ርዕሶች',ask:'ጥያቄ ይጠይቁ',title:'ጠይቅ። ተማር። እደግ።'}
    :{home:'Home',topics:'Topics',ask:'Ask a question',title:'Ask. Learn. Grow.'};

  const screen=useMemo(()=>{
    if(pathname.startsWith('/topics'))return 'topics';
    if(pathname.startsWith('/saved'))return 'saved';
    if(pathname.startsWith('/settings'))return 'settings';
    if(pathname.startsWith('/teacher'))return 'teacher';
    if(pathname.startsWith('/moderation'))return 'moderation';
    if(pathname.startsWith('/admin'))return 'admin';
    if(pathname.startsWith('/notifications'))return 'notifications';
    if(pathname.startsWith('/questions'))return 'question';
    if(pathname.startsWith('/profile'))return 'profile';
    if(pathname.startsWith('/search'))return 'search';
    return 'home';
  },[pathname]);

  const selectedTopic=useMemo(()=>{
    const m=pathname.match(/topic=([^&]+)/);
    return m?.[1]||'';
  },[pathname]);

  const topics=state.topics.map(t=>({id:t.id,name:t.name}));

  const railQuestions:Question[]=state.questions.map(q=>({
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
  }));

  function requireParticipate(){
    if(!state.session.signedIn){
      router.push('/account?mode=login&next='+encodeURIComponent(pathname));
      flash('Sign in to continue (local demo).');
      return false;
    }
    if(!state.session.emailVerified){
      router.push('/account?mode=verify');
      flash('Verify your email before participating (demo).');
      return false;
    }
    return true;
  }

  function onAsk(){
    if(!requireParticipate())return;
    setAskOpen(true);
  }

  function onSearchSubmit(e:FormEvent){
    e.preventDefault();
    const q=query.trim();
    router.push(q?`/search?q=${encodeURIComponent(q)}`:'/search');
    setMenu(false);
  }

  if(bare){
    return <>
      {children}
      {statusHint&&(
        <div className="notice toast" role="status">
          {statusHint}
          <button className="quiet" aria-label="Dismiss" onClick={clearHint}>×</button>
        </div>
      )}
    </>;
  }

  return <>
    <a className="skip" href="#main">Skip to content</a>
    <div className="demo-banner" role="note">{state.banner}</div>
    <SiteHeader
      language={state.session.language}
      dark={dark}
      signedIn={state.session.signedIn}
      askLabel={labels.ask}
      query={query}
      onQuery={setQuery}
      onSearchSubmit={onSearchSubmit}
      onHome={()=>{router.push('/');setMenu(false);}}
      onMenu={()=>setMenu(m=>!m)}
      onAsk={onAsk}
      onNotifications={()=>router.push('/notifications')}
      onToggleTheme={()=>setDark(d=>!d)}
      onToggleLanguage={()=>demo.updateSession({language:state.session.language==='en'?'am':'en'})}
      onAccount={()=>{
        if(state.session.signedIn)router.push('/settings');
        else router.push('/account?mode=login');
      }}
    />

    <div className="layout">
      <SideNav
        open={menu}
        screen={screen}
        selectedTopic={selectedTopic}
        topics={topics}
        labels={labels}
        role={state.session.role}
        onHome={()=>{router.push('/');setMenu(false);}}
        onTopics={()=>{router.push('/topics');setMenu(false);}}
        onSaved={()=>{router.push('/saved');setMenu(false);}}
        onTopic={id=>{router.push(id?`/?topic=${id}`:'/');setMenu(false);}}
        onExplore={()=>{router.push('/topics');setMenu(false);}}
        onTeacher={()=>{router.push('/teacher');setMenu(false);}}
        onModeration={()=>{router.push('/moderation');setMenu(false);}}
        onAdmin={()=>{router.push('/admin');setMenu(false);}}
      />

      <main id="main">{children}</main>

      {showRail&&(
        <RightRail
          questions={railQuestions}
          onOpen={q=>router.push(`/questions/${q.id}`)}
          onUnanswered={()=>router.push('/?feed=unanswered')}
          cardMeta={q=>{
            const dq=state.questions.find(x=>x.id===q.id);
            return {
              asker:dq?.author.label||q.author.label,
              when:dq?.relative||new Date(q.created_at).toLocaleDateString(),
            };
          }}
        />
      )}
    </div>

    <button className="mobile-ask primary" onClick={onAsk}>
      <Icon name="plus"/>{labels.ask}
    </button>

    {statusHint&&(
      <div className="notice toast" role="status">
        {statusHint}
        <button className="quiet" aria-label="Dismiss" onClick={clearHint}>×</button>
      </div>
    )}

    <AskDialog
      open={askOpen}
      topics={state.topics}
      onClose={()=>setAskOpen(false)}
      onSubmit={input=>{
        const q=demo.postQuestion(input);
        setAskOpen(false);
        if(typeof q==='string'){demo.flash(q);return;}
        router.push(`/questions/${q.id}`);
      }}
    />
  </>;
}
