'use client';
import {Icon} from '../lib/icons';
import {sampleByTitle,sampleInsightQuestions} from '../lib/sampleHome';
import type {Question} from './QuestionCard';

type Props={
  questions:Question[];
  onOpen:(q:Question)=>void;
  onUnanswered:()=>void;
  cardMeta:(q:Question)=>{asker:string;when:string};
};

export function RightRail({questions,onOpen,onUnanswered,cardMeta}:Props){
  const live=questions.filter(q=>{
    const sample=sampleByTitle[q.title];
    const presentedAnswers=q.answer_count||sample?.answersLabel||0;
    return presentedAnswers===0;
  }).slice(0,2);
  const insights=live.length
    ?live.map(q=>{
      const {asker,when}=cardMeta(q);
      return {key:q.id,title:q.title,meta:`Asked by ${asker} · ${when}`,onClick:()=>onOpen(q)};
    })
    :sampleInsightQuestions.map((s,i)=>({
      key:`sample-${i}`,
      title:s.title,
      meta:`Asked by ${s.asker} · ${s.relative}`,
      onClick:onUnanswered,
    }));

  return (
    <aside className="right-rail">
      <section className="card">
        <h2>Questions need your insight</h2>
        {insights.map(item=>(
          <button className="insight" key={item.key} onClick={item.onClick}>
            {item.title}
            <small>{item.meta}</small>
          </button>
        ))}
        <button className="outline full" onClick={onUnanswered}>
          Explore unanswered <Icon name="arrow"/>
        </button>
      </section>
      <section className="card">
        <h2>Community principles</h2>
        {[
          ['user','Ask respectfully','Be kind and seek to understand.'],
          ['book','Support answers with references','Use Scripture, Church teaching, and trusted sources.'],
          ['compass','Welcome different backgrounds','All sincere questions are valued here.'],
        ].map(([i,t,b])=>(
          <div className="principle" key={t}>
            <Icon name={i}/>
            <div><strong>{t}</strong><p>{b}</p></div>
          </div>
        ))}
      </section>
    </aside>
  );
}
