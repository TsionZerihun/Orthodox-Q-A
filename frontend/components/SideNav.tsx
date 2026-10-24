'use client';
import {Icon} from '../lib/icons';
import type {DemoRole} from '../lib/demo/types';

type Topic={id:string;name:string};

type Props={
  open:boolean;
  screen:string;
  selectedTopic:string;
  topics:Topic[];
  labels:{home:string;topics:string};
  role:DemoRole;
  onHome:()=>void;
  onTopics:()=>void;
  onSaved:()=>void;
  onTopic:(id:string)=>void;
  onExplore:()=>void;
  onTeacher:()=>void;
  onModeration:()=>void;
  onAdmin:()=>void;
};

const topicIcons=['book','prayer','leaf','church'] as const;

export function SideNav(p:Props){
  const staff=p.role==='moderator'||p.role==='admin';
  const teacher=p.role==='teacher'||p.role==='admin';

  return (
    <aside className={'side-nav'+(p.open?' open':'')}>
      <nav>
        <button className={p.screen==='home'&&!p.selectedTopic?'selected':''} onClick={p.onHome}>
          <Icon name="home"/><span>{p.labels.home}</span>
        </button>
        <button className={p.screen==='topics'?'selected':''} onClick={p.onTopics}>
          <Icon name="topics"/><span>{p.labels.topics}</span>
        </button>
        <button className={p.screen==='saved'?'selected':''} onClick={p.onSaved}>
          <Icon name="save"/><span>Saved questions</span>
        </button>

        {(teacher||staff)&&(
          <>
            <hr/>
            <p className="eyebrow">{staff?'STAFF':'TEACHER'}</p>
            {teacher&&(
              <button className={p.screen==='teacher'?'selected':''} onClick={p.onTeacher}>
                <Icon name="check"/><span>Teacher workspace</span>
              </button>
            )}
            {staff&&(
              <button className={p.screen==='moderation'?'selected':''} onClick={p.onModeration}>
                <Icon name="bell"/><span>Moderation</span>
              </button>
            )}
            {p.role==='admin'&&(
              <button className={p.screen==='admin'?'selected':''} onClick={p.onAdmin}>
                <Icon name="compass"/><span>Administration</span>
              </button>
            )}
          </>
        )}

        <hr/>
        <p className="eyebrow">YOUR TOPICS</p>
        {['Scripture','Prayer','Fasting','Church history'].map((name,i)=>(
          <button
            key={name}
            className={p.topics.find(t=>t.name===name)?.id===p.selectedTopic?'selected':''}
            onClick={()=>p.onTopic(p.topics.find(t=>t.name===name)?.id||'')}
          >
            <Icon name={topicIcons[i]}/><span>{name}</span>
          </button>
        ))}
        <button onClick={p.onExplore}><Icon name="compass"/><span>Explore topics</span></button>
      </nav>
    </aside>
  );
}
