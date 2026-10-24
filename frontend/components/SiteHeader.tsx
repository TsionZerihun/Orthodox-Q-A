'use client';
import {FormEvent} from 'react';
import {Icon} from '../lib/icons';

type Props={
  language:string;
  dark:boolean;
  signedIn:boolean;
  askLabel:string;
  query:string;
  onQuery:(v:string)=>void;
  onSearchSubmit:(e:FormEvent)=>void;
  onHome:()=>void;
  onMenu:()=>void;
  onAsk:()=>void;
  onNotifications:()=>void;
  onToggleTheme:()=>void;
  onToggleLanguage:()=>void;
  onAccount:()=>void;
};

export function SiteHeader(p:Props){
  return (
    <header className="site-header">
      <div className="parchment-corner" aria-hidden="true"/>
      <button className="mobile-menu quiet" aria-label="Toggle navigation" onClick={p.onMenu}><Icon name="menu"/></button>
      <button className="brand" onClick={p.onHome}>
        <img src="/assets/logo.svg" alt="Open Bible with a small cross" width={40} height={29}/>
        <span>Orthodox Q&A</span>
      </button>
      <form className="search" onSubmit={p.onSearchSubmit}>
        <Icon name="search"/>
        <input
          aria-label="Search questions and topics"
          placeholder="Search questions and topics"
          value={p.query}
          onChange={e=>p.onQuery(e.target.value)}
        />
      </form>
      <button className="primary ask" onClick={p.onAsk}><Icon name="plus"/>{p.askLabel}</button>
      <button className="quiet" aria-label="Notifications" onClick={p.onNotifications}><Icon name="bell"/></button>
      <button className="quiet" aria-label={p.dark?'Use light theme':'Use dark theme'} onClick={p.onToggleTheme}>
        <Icon name={p.dark?'moon':'sun'}/>
      </button>
      <button className="lang" onClick={p.onToggleLanguage} aria-label="Switch interface language">
        {p.language==='en'?'EN / አማ':'አማ / EN'}
      </button>
      <button className="account-menu" aria-label={p.signedIn?'Account settings':'Sign in'} onClick={p.onAccount}>
        <img className="avatar photo header-avatar" src="/assets/sample-user-avatar.png" alt="" width={28} height={28}/>
        <Icon name="chevron" className="chevron"/>
      </button>
    </header>
  );
}
