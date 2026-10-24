'use client';
import {useEffect} from 'react';

type Props={
  open:boolean;
  src:string;
  alt:string;
  caption?:string;
  onClose:()=>void;
};

export function ImageLightbox({open,src,alt,caption,onClose}:Props){
  useEffect(()=>{
    if(!open)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[open,onClose]);

  if(!open)return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Expanded image" onClick={onClose}>
      <div className="lightbox-panel" onClick={e=>e.stopPropagation()}>
        <button className="close quiet" aria-label="Close" onClick={onClose}>×</button>
        <img src={src} alt={alt}/>
        <p>{caption||alt}</p>
      </div>
    </div>
  );
}
