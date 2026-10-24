'use client';
import {useEffect,useId,useRef,useState} from 'react';

type Props={
  canEdit?:boolean;
  onEdit:()=>void;
  onReport:()=>void;
  onCopyLink:()=>void;
};

/** Discreet post actions: edit own, report, copy/share link. Keyboard-accessible. */
export function PostMenu({canEdit=false,onEdit,onReport,onCopyLink}:Props){
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const menuId=useId();

  useEffect(()=>{
    if(!open) return;
    const onDoc=(e:MouseEvent)=>{
      if(!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){setOpen(false);}
    };
    document.addEventListener('mousedown',onDoc);
    document.addEventListener('keydown',onKey);
    return ()=>{
      document.removeEventListener('mousedown',onDoc);
      document.removeEventListener('keydown',onKey);
    };
  },[open]);

  function run(fn:()=>void){
    setOpen(false);
    fn();
  }

  return (
    <div className="post-menu" ref={root}>
      <button
        type="button"
        className="post-menu-trigger"
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={()=>setOpen(v=>!v)}
      >
        <span aria-hidden="true">•••</span>
      </button>
      {open&&(
        <ul id={menuId} role="menu" className="post-menu-list">
          {canEdit&&(
            <li role="none">
              <button type="button" role="menuitem" onClick={()=>run(onEdit)}>Edit</button>
            </li>
          )}
          <li role="none">
            <button type="button" role="menuitem" onClick={()=>run(onCopyLink)}>Copy link</button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" onClick={()=>run(onReport)}>Report</button>
          </li>
        </ul>
      )}
    </div>
  );
}
