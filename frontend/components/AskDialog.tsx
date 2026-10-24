'use client';
import {useEffect,useRef,useState,FormEvent} from 'react';
import type {DemoQuestion,DemoTopic} from '../lib/demo/types';
import {useDemo} from '../lib/demo/store';

type Props={
  open:boolean;
  topics:DemoTopic[];
  onClose:()=>void;
  onSubmit:(input:{title:string;body:string;topicIds:string[];anonymous:boolean})=>void;
};

export function AskDialog({open,topics,onClose,onSubmit}:Props){
  const dialog=useRef<HTMLDialogElement>(null);
  const demo=useDemo();
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [title,setTitle]=useState('');
  const [similar,setSimilar]=useState<DemoQuestion[]>([]);
  const [imageNote,setImageNote]=useState('');

  useEffect(()=>{
    if(open)dialog.current?.showModal();
    else dialog.current?.close();
  },[open]);

  useEffect(()=>{
    setSimilar(demo.similarQuestions(title));
  },[title,demo]);

  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError('');
    const f=new FormData(e.currentTarget);
    const nextTitle=String(f.get('title')||'').trim();
    const body=String(f.get('body')||'').trim();
    const topicIds=f.getAll('topics').map(String);
    if(nextTitle.length<10){setError('Title must be at least 10 characters.');return;}
    if(topicIds.length<1||topicIds.length>3){setError('Choose 1–3 topics.');return;}
    setBusy(true);
    onSubmit({
      title:nextTitle,
      body,
      topicIds,
      anonymous:f.get('identity')==='anonymous',
    });
    setBusy(false);
    setTitle('');
    setImageNote('');
    e.currentTarget.reset();
  }

  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClick={e=>{if(e.target===dialog.current)onClose();}}
    >
      <button className="close quiet" aria-label="Close dialog" onClick={onClose}>×</button>
      <form onSubmit={submit}>
        <h1>Ask a question</h1>
        <p className="muted">Local demo — posts into browser demo state only. Anonymity cannot be changed after publishing.</p>
        {error&&<p className="form-error" role="alert">{error}</p>}
        <label>Question title
          <input
            name="title"
            required
            minLength={10}
            maxLength={200}
            value={title}
            onChange={e=>setTitle(e.target.value)}
          />
        </label>
        {similar.length>0&&(
          <div className="similar-box" role="region" aria-label="Similar questions">
            <p className="muted">Similar questions</p>
            <ul>
              {similar.map(q=>(
                <li key={q.id}><a href={`/questions/${q.id}`}>{q.title}</a></li>
              ))}
            </ul>
          </div>
        )}
        <label>Details<textarea name="body" maxLength={10000}/></label>
        <fieldset>
          <legend>Choose 1–3 topics</legend>
          {topics.filter(t=>!t.archived).map(t=>(
            <label className="check" key={t.id}>
              <input type="checkbox" name="topics" value={t.id}/>{t.name}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Posting identity</legend>
          <label className="check"><input type="radio" name="identity" value="named" defaultChecked/>Post with my name</label>
          <label className="check"><input type="radio" name="identity" value="anonymous"/>Post anonymously</label>
        </fieldset>
        <label>Optional images (demo validation only)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={e=>{
              const files=[...e.target.files||[]];
              if(files.length>5){setImageNote('Max 5 images per question (demo).');return;}
              for(const file of files){
                const err=demo.validateImageFile(file,'question');
                if(err){setImageNote(err);return;}
              }
              setImageNote(files.length?`${files.length} file(s) validated — not uploaded (Storage deferred).`:'');
            }}
          />
        </label>
        {imageNote&&<p className="muted">{imageNote}</p>}
        <button disabled={busy} className="primary">{busy?'Publishing…':'Publish question'}</button>
      </form>
    </dialog>
  );
}
