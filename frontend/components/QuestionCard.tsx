'use client';
import {Icon,initials} from '../lib/icons';
import type {SampleCard} from '../lib/sampleHome';
import {PostMenu} from './PostMenu';

export type Question={
  id:string;
  title:string;
  body:string;
  is_anonymous:boolean;
  author:{label:string};
  topics:{id:string;name:string}[];
  answer_count:number;
  created_at:string;
};

type Props={
  question:Question;
  sample?:SampleCard;
  onOpen:()=>void;
  onNotBuilt:()=>void;
  onUpvote?:()=>void;
  onSave?:()=>void;
  saved?:boolean;
  upvoted?:boolean;
  canEdit?:boolean;
  onEdit?:()=>void;
  onReport?:()=>void;
  onCopyLink?:()=>void;
};

export function QuestionCard({
  question:q,sample,onOpen,onNotBuilt,
  onUpvote,onSave,saved,upvoted,canEdit=false,onEdit,onReport,onCopyLink,
}:Props){
  const asker=sample?.asker||(q.is_anonymous?'Anonymous':q.author.label);
  const when=sample?.relative||new Date(q.created_at).toLocaleDateString();
  const answerCount=q.answer_count||sample?.answersLabel||0;
  const tag=sample?.topicLabel||q.topics[0]?.name||'Topic';

  return (
    <article className={'card question-card'+(sample?.image?' has-media':'')}>
      <div className="question-main">
        <div className="tags"><span>{tag}</span></div>
        <h2><button type="button" onClick={onOpen}>{q.title}</button></h2>
        <p className="meta">Asked by {asker} · {when}</p>
        {q.body&&!sample?.preview&&<p className="excerpt">{q.body}</p>}
        {sample?.preview&&(
          <div className="answer-preview">
            {sample.preview.avatar
              ? <img className="avatar photo" src={sample.preview.avatar} alt="" width={36} height={36}/>
              : <span className="avatar mono" aria-hidden="true">{initials(sample.preview.name)}</span>}
            <div className="preview-body">
              <div className="preview-head">
                <strong>{sample.preview.name}</strong>
                <Icon name="check" className="preview-check"/>
                <span className="badge verified">{sample.preview.badge}</span>
              </div>
              <p className="preview-snippet">{sample.preview.snippet}</p>
              <button type="button" className="read-answer" onClick={onOpen}>Read answer →</button>
            </div>
          </div>
        )}
        <div className="actions">
          <button
            type="button"
            className={'vote-q'+(upvoted?' active':'')}
            onClick={onUpvote||onNotBuilt}
            title="Question upvote"
          >
            <Icon name="up"/><span>{sample?.votes??0}</span>
          </button>
          <button type="button" onClick={onOpen} aria-label={`Open discussion, ${answerCount} answers`}>
            <Icon name="reply"/><span>{answerCount} answers</span>
          </button>
          <button type="button" className={'push'+(saved?' active':'')} onClick={onSave||onNotBuilt}>
            <Icon name="save"/><span>Save</span>
          </button>
          <PostMenu
            canEdit={canEdit}
            onEdit={onEdit||onNotBuilt}
            onReport={onReport||onNotBuilt}
            onCopyLink={onCopyLink||onNotBuilt}
          />
        </div>
      </div>
      {sample?.image&&(
        <button type="button" className="media" onClick={onOpen} aria-label={sample.image.alt}>
          <img src={sample.image.src} alt={sample.image.alt}/>
        </button>
      )}
    </article>
  );
}
