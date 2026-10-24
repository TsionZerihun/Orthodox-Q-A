const paths:Record<string,string>={
  home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
  topics:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  save:'M6 3h12v19l-6-4-6 4z',
  book:'M12 6C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 2zm0 0v15',
  prayer:'m10 3-3 9-5 7 5 2 5-9V3m2 0 3 9 5 7-5 2-5-9V3',
  leaf:'M21 3C7 1 1 7 5 15c7 7 16-2 16-12ZM3 22 17 7',
  church:'M12 1v6m-3-3h6M3 22h18M5 22V12l7-6 7 6v10M10 22v-7h4v7',
  compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm5-17-3 9-9 3 3-9z',
  search:'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 6 6',
  bell:'M5 9a7 7 0 0 1 14 0v7l2 2H3l2-2Zm5 12h4',
  sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-7v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',
  moon:'M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z',
  plus:'M12 3v18M3 12h18',
  reply:'M4 18 2 22l7-3a9 9 0 1 0-5-1Z',
  up:'m3 10 9-8 9 8h-6v12H9V10z',
  arrow:'M3 12h18m-7-7 7 7-7 7',
  user:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 10a9 9 0 0 1 18 0',
  menu:'M3 6h18M3 12h18M3 18h18',
  check:'M4 12.5 9 17.5 20 6.5',
  chevron:'m7 10 5 5 5-5',
  helpful:'M12 21s-7-4.4-9.5-8.2C.7 9.8 2.2 6 5.5 6c1.8 0 3.2 1 3.9 2.1C10.2 7 11.6 6 13.4 6c3.3 0 4.8 3.8 3 6.8C19 16.6 12 21 12 21z',
};

export function Icon({name,className}:{name:string;className?:string}){
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={'icon'+(className?' '+className:'')}>
      <path d={paths[name]||paths.book}/>
    </svg>
  );
}

export function initials(label:string){
  return label.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';
}
