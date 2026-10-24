'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {createSeedState,DEMO_BANNER} from './seed';
import type {
  DemoAccountStatus,DemoAnswer,DemoAppeal,DemoQuestion,DemoRole,DemoSession,DemoState,DemoTeacherApplication,
} from './types';

const STORAGE_KEY='orthodox-qa-demo-v2';

type DemoContextValue={
  state:DemoState;
  flash:(msg:string)=>void;
  statusHint:string;
  clearHint:()=>void;
  resetDemo:()=>void;
  canParticipate:()=>string|null;
  updateSession:(patch:Partial<DemoSession>)=>void;
  signInDemo:(email:string,password:string)=>string|null;
  signUpDemo:(name:string,email:string,password:string)=>string|null;
  requestResetDemo:(email:string)=>string;
  resendVerificationDemo:()=>string;
  verifyDemo:()=>void;
  signOutDemo:()=>void;
  setRole:(role:DemoRole)=>void;
  setAccountStatus:(status:DemoAccountStatus)=>void;
  requestAccountDeletion:()=>void;
  toggleFollowTopic:(topicId:string)=>void;
  toggleSaveQuestion:(questionId:string)=>void;
  toggleFollowQuestion:(questionId:string)=>void;
  toggleUpvoteQuestion:(questionId:string)=>string|null;
  toggleHelpfulAnswer:(answerId:string)=>string|null;
  postQuestion:(input:{title:string;body:string;topicIds:string[];anonymous:boolean})=>DemoQuestion|string;
  editQuestion:(questionId:string,patch:{title:string;body:string;topicIds:string[]})=>string|null;
  postAnswer:(questionId:string,body:string,references?:string[])=>DemoAnswer|string;
  editAnswer:(answerId:string,body:string)=>string|null;
  acceptAnswer:(questionId:string,answerId:string)=>string|null;
  clearAcceptedAnswer:(questionId:string)=>void;
  postComment:(answerId:string,body:string,replyTo?:string)=>string|null;
  reportContent:(label:string)=>void;
  markNotificationRead:(id:string)=>void;
  markAllNotificationsRead:()=>void;
  submitTeacherApplication:(app:Omit<DemoTeacherApplication,'id'|'status'|'submittedAt'>)=>void;
  resolveReport:(id:string,action:string)=>void;
  decideTeacherApp:(id:string,decision:'approved'|'declined'|'revoked',note:string)=>void;
  addTopic:(name:string,description:string)=>void;
  archiveTopic:(topicId:string)=>void;
  submitAppeal:(input:{decisionType:'moderation'|'teacher';decisionId:string;explanation:string})=>string|null;
  similarQuestions:(title:string)=>DemoQuestion[];
  validateImageFile:(file:File,purpose:'question'|'answer'|'profile'|'evidence')=>string|null;
  followerCount:(questionId:string)=>number;
};

const DemoContext=createContext<DemoContextValue|null>(null);

function loadState():DemoState{
  if(typeof window==='undefined')return createSeedState();
  try{
    const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('orthodox-qa-demo-v1');
    if(!raw)return createSeedState();
    const parsed=JSON.parse(raw) as Partial<DemoState>;
    const seed=createSeedState();
    return {
      ...seed,
      ...parsed,
      session:{...seed.session,...(parsed.session||{})},
      banner:DEMO_BANNER,
      demoRoleSwitchEnabled:true,
      appeals:parsed.appeals||[],
    };
  }catch{
    return createSeedState();
  }
}

function uid(prefix:string){
  return `${prefix}-${Math.random().toString(36).slice(2,9)}`;
}

export function DemoProvider({children}:{children:ReactNode}){
  const [state,setState]=useState<DemoState>(createSeedState);
  const [hydrated,setHydrated]=useState(false);
  const [statusHint,setStatusHint]=useState('');

  useEffect(()=>{
    setState(loadState());
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated)return;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  },[state,hydrated]);

  useEffect(()=>{
    if(!statusHint)return;
    const t=setTimeout(()=>setStatusHint(''),3200);
    return()=>clearTimeout(t);
  },[statusHint]);

  const flash=useCallback((msg:string)=>setStatusHint(msg),[]);
  const clearHint=useCallback(()=>setStatusHint(''),[]);

  const updateSession=useCallback((patch:Partial<DemoSession>)=>{
    setState(s=>({...s,session:{...s.session,...patch}}));
  },[]);

  const value=useMemo<DemoContextValue>(()=>{
    const canParticipate=()=>{
      if(!state.session.signedIn)return 'Sign in to continue (local demo).';
      if(!state.session.emailVerified)return 'Verify your email before participating (demo).';
      if(state.session.accountStatus==='suspended')return 'Account suspended (demo). You can still open notices and appeals.';
      if(state.session.accountStatus==='deactivated')return 'Account deactivated (demo).';
      if(state.session.accountStatus==='deletion_pending')return 'Account deletion pending (demo). New posts are blocked.';
      return null;
    };

    return {
    state,
    flash,
    statusHint,
    clearHint,
    canParticipate,
    resetDemo(){
      const next=createSeedState();
      setState(next);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('orthodox-qa-demo-v1');
      flash('Demo state reset to seed data.');
    },
    updateSession,
    signInDemo(email,password){
      if(!email.includes('@')||password.length<8)return 'Enter a valid email and password (8+ characters).';
      if(password==='wrongpass')return 'Incorrect password. Please try again.';
      setState(s=>({
        ...s,
        session:{
          ...s.session,
          signedIn:true,
          email,
          displayName:s.session.displayName||email.split('@')[0],
          emailVerified:true,
          role:s.session.role==='guest'?'member':s.session.role,
          accountStatus:s.session.accountStatus==='active'?s.session.accountStatus:'active',
          memberKey:s.session.memberKey||uid('member'),
        },
      }));
      flash('Signed in (local demo). No real authentication occurred.');
      return null;
    },
    signUpDemo(name,email,password){
      if(name.trim().length<2)return 'Display name must be at least 2 characters.';
      if(!email.includes('@'))return 'Enter a valid email.';
      if(password.length<8)return 'Password must be at least 8 characters.';
      setState(s=>({
        ...s,
        session:{
          ...s.session,
          signedIn:true,
          email,
          displayName:name.trim(),
          emailVerified:false,
          role:'member',
          accountStatus:'active',
          memberKey:uid('member'),
        },
      }));
      flash('Account created in local demo. Verification is simulated — no email was sent.');
      return null;
    },
    requestResetDemo(email){
      flash(`If an account exists for ${email || 'that address'}, a reset link would be emailed (simulated).`);
      return 'If an account exists for that email, you would receive a password reset link shortly. (Demo — no email sent.)';
    },
    resendVerificationDemo(){
      if(!state.session.email)return 'No email on the demo session.';
      flash('Verification email resent (simulated). No message left this device.');
      return 'Resend simulated. Wait before requesting again in a real system.';
    },
    verifyDemo(){
      setState(s=>({...s,session:{...s.session,emailVerified:true}}));
      flash('Email marked verified in local demo.');
    },
    signOutDemo(){
      setState(s=>({
        ...s,
        session:{
          ...s.session,
          signedIn:false,
          email:'',
          emailVerified:false,
          role:'guest',
          displayName:'',
          memberKey:'',
          accountStatus:'active',
        },
      }));
      flash('Signed out of local demo session.');
    },
    setRole(role){
      setState(s=>({...s,session:{...s.session,role,signedIn:role!=='guest'}}));
      flash(`Demo role set to ${role}. Development-only — not a production authorization mechanism.`);
    },
    setAccountStatus(status){
      setState(s=>({...s,session:{...s.session,accountStatus:status}}));
      flash(`Demo account status → ${status}.`);
    },
    requestAccountDeletion(){
      setState(s=>({
        ...s,
        session:{...s.session,accountStatus:'deletion_pending',deletionExplained:true},
        notifications:[{
          id:uid('n'),
          title:'Account deletion requested (demo)',
          body:'Published posts and their images remain detached. Profile photo, private evidence, votes, and email are removed from the demo account view. A new account cannot reclaim posts via email.',
          createdAt:new Date().toISOString(),
          read:false,
          important:true,
          href:'/settings',
        },...s.notifications],
      }));
      flash('Deletion requested (demo). Posts stay; private data removed from demo session.');
    },
    toggleFollowTopic(topicId){
      const block=canParticipate();
      if(block){flash(block);return;}
      setState(s=>{
        const has=s.followedTopicIds.includes(topicId);
        return {
          ...s,
          followedTopicIds:has
            ?s.followedTopicIds.filter(id=>id!==topicId)
            :[...s.followedTopicIds,topicId],
        };
      });
      flash('Topic follow updated (demo).');
    },
    toggleSaveQuestion(questionId){
      const block=canParticipate();
      if(block){flash(block);return;}
      setState(s=>{
        const has=s.savedQuestionIds.includes(questionId);
        return {
          ...s,
          savedQuestionIds:has
            ?s.savedQuestionIds.filter(id=>id!==questionId)
            :[...s.savedQuestionIds,questionId],
        };
      });
      flash('Saved list updated (demo).');
    },
    toggleFollowQuestion(questionId){
      const block=canParticipate();
      if(block){flash(block);return;}
      setState(s=>{
        const has=s.followedQuestionIds.includes(questionId);
        return {
          ...s,
          followedQuestionIds:has
            ?s.followedQuestionIds.filter(id=>id!==questionId)
            :[...s.followedQuestionIds,questionId],
        };
      });
      flash('Question follow updated (demo).');
    },
    toggleUpvoteQuestion(questionId){
      const block=canParticipate();
      if(block)return block;
      const q=state.questions.find(x=>x.id===questionId);
      if(q&&(q.ownerKey===state.session.memberKey||(!q.isAnonymous&&q.author.label===state.session.displayName))){
        return 'Self-vote is not allowed (demo).';
      }
      setState(s=>{
        const has=s.upvotedQuestionIds.includes(questionId);
        return {
          ...s,
          upvotedQuestionIds:has
            ?s.upvotedQuestionIds.filter(id=>id!==questionId)
            :[...s.upvotedQuestionIds,questionId],
          questions:s.questions.map(row=>row.id===questionId
            ?{...row,upvotes:row.upvotes+(has?-1:1)}
            :row),
        };
      });
      return null;
    },
    toggleHelpfulAnswer(answerId){
      const block=canParticipate();
      if(block)return block;
      const a=state.answers.find(x=>x.id===answerId);
      if(a&&(a.ownerKey===state.session.memberKey||a.author.label===state.session.displayName)){
        return 'Self-vote is not allowed on your own answer (demo).';
      }
      setState(s=>{
        const has=s.helpfulAnswerIds.includes(answerId);
        return {
          ...s,
          helpfulAnswerIds:has
            ?s.helpfulAnswerIds.filter(id=>id!==answerId)
            :[...s.helpfulAnswerIds,answerId],
          answers:s.answers.map(row=>row.id===answerId
            ?{...row,helpful:row.helpful+(has?-1:1)}
            :row),
        };
      });
      return null;
    },
    postQuestion({title,body,topicIds,anonymous}){
      const block=canParticipate();
      if(block)return block;
      if(title.trim().length<10||title.trim().length>200)return 'Title must be 10–200 characters.';
      if(body.length>10000)return 'Details max 10,000 characters.';
      if(topicIds.length<1||topicIds.length>3)return 'Choose 1–3 active topics.';
      if(topicIds.some(id=>state.topics.find(t=>t.id===id)?.archived))return 'Archived topics cannot be newly selected.';
      const ownerKey=state.session.memberKey||uid('member');
      const q:DemoQuestion={
        id:uid('q'),
        title:title.trim(),
        body:body.trim(),
        topicIds,
        author:anonymous
          ?{id:uid('anon'),label:'Anonymous',isAnonymous:true}
          :{id:ownerKey,label:state.session.displayName||'Member'},
        createdAt:new Date().toISOString(),
        relative:'Just now',
        upvotes:0,
        views:1,
        isAnonymous:anonymous,
        ownerKey,
        acceptedAnswerId:null,
        status:'published',
      };
      setState(s=>({
        ...s,
        session:{...s.session,memberKey:ownerKey},
        questions:[q,...s.questions],
        followedQuestionIds:[...new Set([...s.followedQuestionIds,q.id])],
      }));
      flash(anonymous
        ?'Question published anonymously (demo). Public pages show Anonymous only.'
        :'Question published (demo). You automatically follow it.');
      return q;
    },
    editQuestion(questionId,patch){
      const block=canParticipate();
      if(block)return block;
      const q=state.questions.find(x=>x.id===questionId);
      if(!q)return 'Question not found.';
      if(q.ownerKey!==state.session.memberKey&&q.author.label!==state.session.displayName)return 'Only the owner can edit.';
      if(patch.topicIds.length<1||patch.topicIds.length>3)return 'Keep 1–3 topics when editing.';
      // anonymity locked — ignore any attempt
      setState(s=>({
        ...s,
        questions:s.questions.map(row=>row.id===questionId
          ?{...row,title:patch.title.trim(),body:patch.body.trim(),topicIds:patch.topicIds,edited:true}
          :row),
      }));
      flash('Question updated (demo). Edited label applied. Anonymity remains locked.');
      return null;
    },
    postAnswer(questionId,body,references=[]){
      const block=canParticipate();
      if(block)return block;
      if(body.trim().length<10)return 'Answer must be at least 10 characters.';
      const question=state.questions.find(q=>q.id===questionId);
      if(!question||question.status==='removed'||question.status==='deleted')return 'Cannot answer a removed or deleted question.';
      const ownerKey=state.session.memberKey||uid('member');
      const isOwner=question.ownerKey===ownerKey;
      const inheritsAnon=question.isAnonymous&&isOwner;
      const a:DemoAnswer={
        id:uid('a'),
        questionId,
        body:body.trim(),
        author:{
          id:inheritsAnon?question.author.id:ownerKey,
          label:inheritsAnon?'Anonymous':(state.session.displayName||'Member'),
          isAnonymous:inheritsAnon,
          isQuestionAuthor:isOwner,
          // anonymous self-answers never expose teacher status publicly
          isTeacher:!inheritsAnon&&(state.session.role==='teacher'||state.session.role==='admin'),
        },
        createdAt:new Date().toISOString(),
        helpful:0,
        references:references.filter(Boolean),
        comments:[],
        ownerKey,
      };
      setState(s=>{
        const followers=s.followedQuestionIds.filter(id=>id===questionId);
        const notifyOthers=followers.length>0&&s.session.notifyAnswers;
        const notes=notifyOthers?[{
          id:uid('n'),
          title:'New answer on a followed question',
          body:`Someone answered “${question.title}”.${question.isAnonymous?'':''}`,
          createdAt:new Date().toISOString(),
          read:false,
          href:`/questions/${questionId}`,
        }]:[];
        // Poster does not receive their own new-answer notification in this demo mailbox
        return {
          ...s,
          session:{...s.session,memberKey:ownerKey},
          answers:[...s.answers,a],
          notifications:[...notes,...s.notifications],
        };
      });
      flash('Answer posted (demo).');
      return a;
    },
    editAnswer(answerId,body){
      const block=canParticipate();
      if(block)return block;
      const a=state.answers.find(x=>x.id===answerId);
      if(!a)return 'Answer not found.';
      if(a.ownerKey!==state.session.memberKey&&a.author.label!==state.session.displayName)return 'Only the owner can edit.';
      if(body.trim().length<10)return 'Answer must be at least 10 characters.';
      setState(s=>({
        ...s,
        answers:s.answers.map(row=>row.id===answerId?{...row,body:body.trim(),edited:true}:row),
      }));
      flash('Answer updated (demo). Edited label applied.');
      return null;
    },
    acceptAnswer(questionId,answerId){
      const block=canParticipate();
      if(block)return block;
      const q=state.questions.find(x=>x.id===questionId);
      const a=state.answers.find(x=>x.id===answerId);
      if(!q||!a||a.questionId!==questionId)return 'Answer must belong to this question.';
      if(q.ownerKey!==state.session.memberKey&&q.author.label!==state.session.displayName)return 'Only the question author can accept an answer.';
      if(a.ownerKey===state.session.memberKey||a.author.label===state.session.displayName)return 'You cannot accept your own answer (demo).';
      setState(s=>({
        ...s,
        questions:s.questions.map(row=>row.id===questionId?{...row,acceptedAnswerId:answerId}:row),
      }));
      flash('Answer marked as accepted by the asker (demo). This is not official Church approval.');
      return null;
    },
    clearAcceptedAnswer(questionId){
      setState(s=>({
        ...s,
        questions:s.questions.map(row=>row.id===questionId?{...row,acceptedAnswerId:null}:row),
      }));
      flash('Accepted answer cleared (demo).');
    },
    postComment(answerId,body,replyTo){
      const block=canParticipate();
      if(block)return block;
      if(body.trim().length<1||body.trim().length>2000)return 'Comment must be 1–2000 characters.';
      const answer=state.answers.find(a=>a.id===answerId);
      if(!answer)return 'Answer not found.';
      if(replyTo){
        const parent=answer.comments.find(c=>c.id===replyTo);
        if(!parent)return 'Parent comment not found.';
        if(parent.replyTo)return 'Only one reply level is allowed (demo).';
      }
      const question=state.questions.find(q=>q.id===answer.questionId);
      const isOwner=!!question&&question.ownerKey===state.session.memberKey;
      const inheritsAnon=!!question?.isAnonymous&&isOwner;
      setState(s=>({
        ...s,
        answers:s.answers.map(a=>{
          if(a.id!==answerId)return a;
          return {
            ...a,
            comments:[...a.comments,{
              id:uid('c'),
              body:body.trim(),
              author:{
                id:inheritsAnon?(question?.author.id||'anon'):(s.session.memberKey||'me'),
                label:inheritsAnon?'Anonymous':(s.session.displayName||'Member'),
                isAnonymous:inheritsAnon,
                isQuestionAuthor:isOwner,
              },
              createdAt:new Date().toISOString(),
              replyTo,
            }],
          };
        }),
      }));
      flash(replyTo?'Reply posted (demo).':'Comment posted (demo).');
      return null;
    },
    reportContent(label){
      const block=canParticipate();
      if(block){flash(block);return;}
      flash(`Report submitted for review (demo): ${label}. No staff were notified.`);
    },
    markNotificationRead(id){
      setState(s=>({
        ...s,
        notifications:s.notifications.map(n=>n.id===id?{...n,read:true}:n),
      }));
    },
    markAllNotificationsRead(){
      setState(s=>({
        ...s,
        notifications:s.notifications.map(n=>n.important?n:{...n,read:true}),
      }));
      flash('Optional notifications marked read (demo). Essential notices stay visible.');
    },
    submitTeacherApplication(app){
      const block=canParticipate();
      if(block){flash(block);return;}
      if(state.teacherApplications.some(a=>a.status==='pending'&&a.name===state.session.displayName)){
        flash('Only one pending application is allowed (demo).');
        return;
      }
      const row:DemoTeacherApplication={
        ...app,
        id:uid('ta'),
        status:'pending',
        submittedAt:new Date().toLocaleDateString(),
        evidenceNote:app.evidenceNote||'Demo evidence selection only — files not uploaded.',
      };
      setState(s=>({...s,teacherApplications:[row,...s.teacherApplications]}));
      flash('Teacher application submitted (demo). Pending review — evidence stays private.');
    },
    resolveReport(id,action){
      setState(s=>({
        ...s,
        reports:s.reports.map(r=>r.id===id?{...r,status:'resolved'}:r),
        audit:[{user:s.session.displayName||'Staff',action,details:id,date:new Date().toLocaleDateString()},...s.audit],
        notifications:action.includes('Suspend')||action.includes('Remove')?[{
          id:uid('n'),
          title:'Moderation decision (demo)',
          body:`${action}. You may appeal within 30 days of notice availability (demo).`,
          createdAt:new Date().toISOString(),
          read:false,
          important:true,
          href:'/notifications',
        },...s.notifications]:s.notifications,
      }));
      flash(`Moderation action recorded (demo): ${action}.`);
    },
    decideTeacherApp(id,decision,note){
      setState(s=>({
        ...s,
        teacherApplications:s.teacherApplications.map(a=>a.id===id?{...a,status:decision,note}:a),
        audit:[{user:s.session.displayName||'Admin',action:`Teacher ${decision}`,details:id,date:new Date().toLocaleDateString()},...s.audit],
        notifications:[{
          id:uid('n'),
          title:`Teacher application ${decision} (demo)`,
          body:note||`Application ${decision}. Appeal eligible within 30 days if rejected/revoked (demo).`,
          createdAt:new Date().toISOString(),
          read:false,
          important:true,
          href:'/teacher',
        },...s.notifications],
      }));
      flash(`Teacher application ${decision} (demo).`);
    },
    addTopic(name,description){
      const id=uid('t');
      setState(s=>({
        ...s,
        topics:[...s.topics,{id,slug:name.toLowerCase().replace(/\s+/g,'-'),name,description,questionCount:0}],
      }));
      flash('Topic added (demo).');
    },
    archiveTopic(topicId){
      setState(s=>({
        ...s,
        topics:s.topics.map(t=>t.id===topicId?{...t,archived:true}:t),
      }));
      flash('Topic archived (demo). Existing questions keep the topic; new selections blocked.');
    },
    submitAppeal({decisionType,decisionId,explanation}){
      if(!state.session.signedIn)return 'Sign in required (including suspended demo accounts).';
      if(explanation.trim().length<10)return 'Explain your appeal (at least 10 characters).';
      if(state.appeals.some(a=>a.decisionId===decisionId))return 'Only one appeal per decision (demo).';
      const deadline=new Date();
      deadline.setDate(deadline.getDate()+30);
      const appeal:DemoAppeal={
        id:uid('ap'),
        decisionType,
        decisionId,
        explanation:explanation.trim(),
        status:'pending',
        createdAt:new Date().toISOString(),
        deadline:deadline.toISOString(),
      };
      setState(s=>({...s,appeals:[appeal,...s.appeals]}));
      flash('Appeal submitted (demo). Independent review required — original decision-maker cannot decide.');
      return null;
    },
    similarQuestions(title){
      const needle=title.trim().toLowerCase();
      if(needle.length<4)return [];
      const words=needle.split(/\s+/).filter(w=>w.length>3);
      return state.questions
        .filter(q=>{
          if(q.status==='deleted')return false;
          const t=q.title.toLowerCase();
          return t.includes(needle.slice(0,Math.min(12,needle.length)))||words.some(w=>t.includes(w));
        })
        .slice(0,5);
    },
    validateImageFile(file,purpose){
      const typeOk=['image/jpeg','image/png','image/webp'].includes(file.type)||(purpose==='evidence'&&file.type==='application/pdf');
      if(!typeOk)return 'Format not allowed. Use JPG/PNG/WebP'+(purpose==='evidence'?' or PDF':'')+'.';
      const max=purpose==='profile'?2:purpose==='evidence'?10:5;
      if(file.size>max*1024*1024)return `Max ${max} MB in demo validation (not uploaded).`;
      return null;
    },
    followerCount(questionId){
      return state.followedQuestionIds.filter(id=>id===questionId).length;
    },
  };
  },[state,flash,clearHint,updateSession,statusHint]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(){
  const ctx=useContext(DemoContext);
  if(!ctx)throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
