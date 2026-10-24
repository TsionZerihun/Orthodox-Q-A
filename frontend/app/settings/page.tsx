'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {useDemo} from '../../lib/demo/store';
import type {DemoRole} from '../../lib/demo/types';

export default function SettingsPage(){
  const demo=useDemo();
  const {state}=demo;
  const router=useRouter();
  const [tab,setTab]=useState<'profile'|'language'|'security'|'notifications'>('profile');
  const [name,setName]=useState(state.session.displayName);
  const [bio,setBio]=useState(state.session.bio);

  if(!state.session.signedIn){
    return (
      <AppShell showRail={false}>
        <h1>Account settings</h1>
        <article className="card">
          <p>Sign in to manage your profile and preferences.</p>
          <button className="primary" onClick={()=>router.push('/account?mode=login&next=/settings')}>Sign in</button>
        </article>
      </AppShell>
    );
  }

  function saveProfile(e:FormEvent){
    e.preventDefault();
    if(name.trim().length<2){demo.flash('Display name must be at least 2 characters.');return;}
    if(bio.length>500){demo.flash('Biography max 500 characters.');return;}
    demo.updateSession({displayName:name.trim(),bio});
    demo.flash('Your profile has been updated (demo — not persisted to a server).');
  }

  return (
    <AppShell showRail={false}>
      <h1>Account settings</h1>
      <p className="subtitle">Manage profile, language, appearance, and security. Demo changes stay in this browser.</p>

      <div className="tabs" role="tablist">
        {([
          ['profile','Profile'],
          ['language','Language & appearance'],
          ['security','Security'],
          ['notifications','Notifications'],
        ] as const).map(([id,label])=>(
          <button key={id} role="tab" aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab==='profile'&&(
        <div className="settings-grid">
          <form className="card" onSubmit={saveProfile}>
            <h2>Profile information</h2>
            <div className="avatar-upload">
              <img className="avatar photo large" src="/assets/sample-user-avatar.png" alt=""/>
              <p className="muted">Click to upload is simulated. JPG, PNG or WebP. Max 2 MB. (No file is uploaded in demo.)</p>
              <button type="button" className="outline" onClick={()=>demo.flash('Avatar upload simulated — Supabase Storage is deferred.')}>Choose photo</button>
            </div>
            <label>Display name<input value={name} onChange={e=>setName(e.target.value)} maxLength={50} required/></label>
            <label>Biography<textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={500} rows={4}/></label>
            <p className="muted">{bio.length}/500</p>
            <div className="actions">
              <button className="primary">Save changes</button>
              <button type="button" className="outline" onClick={()=>{setName(state.session.displayName);setBio(state.session.bio);}}>Cancel</button>
            </div>
          </form>
          <article className="card">
            <h2>Profile preview</h2>
            <img className="avatar photo" src="/assets/sample-user-avatar.png" alt="" width={48} height={48}/>
            <strong>{name||'Display name'}</strong>
            <p className="muted">Member since demo session</p>
            <p>{bio||'No biography yet.'}</p>
            <p className="muted">
              {state.questions.filter(q=>q.author.label===state.session.displayName).length} Questions ·{' '}
              {state.answers.filter(a=>a.author.label===state.session.displayName).length} Answers ·{' '}
              {state.savedQuestionIds.length} Saved
            </p>
            <button className="outline" onClick={()=>router.push('/profile/me')}>View public profile</button>
          </article>
        </div>
      )}

      {tab==='language'&&(
        <article className="card">
          <h2>Language preference</h2>
          <label className="check"><input type="radio" checked={state.session.language==='en'} onChange={()=>demo.updateSession({language:'en'})}/>English</label>
          <label className="check"><input type="radio" checked={state.session.language==='am'} onChange={()=>demo.updateSession({language:'am'})}/>Amharic (partial UI)</label>
          <h2>Theme</h2>
          {(['light','dark','system'] as const).map(t=>(
            <label className="check" key={t}>
              <input type="radio" checked={state.session.theme===t} onChange={()=>{
                demo.updateSession({theme:t});
                if(t!=='system')document.documentElement.dataset.theme=t;
              }}/>{t[0].toUpperCase()+t.slice(1)}
            </label>
          ))}
        </article>
      )}

      {tab==='security'&&(
        <article className="card">
          <h2>Security</h2>
          <p>Password changes require Supabase Auth. In demo you can only sign out of the local session.</p>
          <button className="outline" onClick={()=>demo.flash('Change password requires configured Supabase (deferred).')}>Change password</button>
          <button className="outline danger" onClick={()=>{demo.signOutDemo();router.push('/');}}>Log out</button>

          <h2>Account status (demo)</h2>
          <p className="muted">Current: <strong>{state.session.accountStatus}</strong>. Reflects UI restrictions only — not production enforcement.</p>
          <label>Simulate status
            <select
              value={state.session.accountStatus}
              onChange={e=>demo.setAccountStatus(e.target.value as typeof state.session.accountStatus)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
              <option value="deletion_pending">Deletion pending</option>
            </select>
          </label>

          <h2>Delete account</h2>
          <p className="notice soft">
            Before confirming: published questions, answers, and their images remain visible but detach from your account
            (named authors become “Deleted member”; anonymous stay “Anonymous”). Profile photo, private teacher evidence,
            votes, email, and personal associations are removed. A new signup cannot reclaim posts via matching email.
            (Demo explanation only — no server erasure.)
          </p>
          <button
            className="outline danger"
            onClick={()=>{
              if(window.confirm('Confirm account deletion (demo)? Posts/images stay detached; private data is cleared from this demo session.')){
                demo.requestAccountDeletion();
              }
            }}
          >
            Request account deletion (demo)
          </button>

          <h2>Demo role (local only)</h2>
          <p className="muted">Use this to preview staff screens. It does not grant production permissions and must never become a production authorization mechanism.</p>
          <label>Role
            <select
              value={state.session.role}
              onChange={e=>demo.setRole(e.target.value as DemoRole)}
            >
              <option value="member">Member</option>
              <option value="teacher">Teacher</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="button" className="quiet" onClick={()=>demo.resetDemo()}>Reset all demo data</button>
        </article>
      )}

      {tab==='notifications'&&(
        <article className="card">
          <h2>Notifications</h2>
          <label className="check switch">
            <input type="checkbox" checked={state.session.notifyAnswers} onChange={e=>demo.updateSession({notifyAnswers:e.target.checked})}/>
            New answers on your questions
          </label>
          <label className="check switch">
            <input type="checkbox" checked={state.session.notifyReplies} onChange={e=>demo.updateSession({notifyReplies:e.target.checked})}/>
            Replies to your comments
          </label>
          <label className="check switch">
            <input type="checkbox" checked={state.session.notifyVerification} onChange={e=>demo.updateSession({notifyVerification:e.target.checked})}/>
            Verification updates
          </label>
          <label className="check switch">
            <input type="checkbox" checked disabled/>
            Essential notices (always on)
          </label>
          <button className="primary" onClick={()=>demo.flash('Notification preferences saved (demo).')}>Save preferences</button>
        </article>
      )}
    </AppShell>
  );
}
