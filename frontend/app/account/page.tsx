'use client';
import {FormEvent,Suspense,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {AppShell} from '../../components/AppShell';
import {useDemo} from '../../lib/demo/store';

function AccountInner(){
  const demo=useDemo();
  const router=useRouter();
  const params=useSearchParams();
  const mode=(params.get('mode') as 'login'|'signup'|'verify'|'reset'|'expired')||'login';
  const next=params.get('next')||'/';
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [resendNote,setResendNote]=useState('');

  function setMode(m:string){
    router.replace(`/account?mode=${m}${next&&next!=='/'?`&next=${encodeURIComponent(next)}`:''}`);
    setError('');setSuccess('');setResendNote('');
  }

  function onSubmit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError('');setSuccess('');
    const f=new FormData(e.currentTarget);
    const email=String(f.get('email')||'');
    const password=String(f.get('password')||'');
    if(mode==='reset'){
      setSuccess(demo.requestResetDemo(email));
      return;
    }
    if(mode==='signup'){
      const err=demo.signUpDemo(String(f.get('name')||''),email,password);
      if(err){setError(err);return;}
      if(!(f.get('terms')==='on')){setError('Accept Terms and Privacy to continue.');return;}
      setMode('verify');
      return;
    }
    const err=demo.signInDemo(email,password);
    if(err){setError(err);return;}
    router.push(next);
  }

  return (
    <AppShell bare>
      <main className="account-page">
        <div className="account-card card">
          <div className="account-parchment" aria-hidden="true"/>
          <img className="auth-logo" src="/assets/logo.svg" alt="Open Bible logo"/>
          <p className="brand-center">Orthodox Q&A</p>
          <p className="eyebrow center">QUESTIONS – ANSWERS – TOGETHER IN FAITH</p>

          {mode==='expired'?(
            <>
              <h1>Verification link expired</h1>
              <p>This simulated verification link is no longer valid. Request a new one — no real email is sent in local demo.</p>
              <button className="primary full" onClick={()=>{
                setResendNote(demo.resendVerificationDemo());
                setMode('verify');
              }}>Resend verification link (demo)</button>
              <button className="quiet" onClick={()=>setMode('login')}>Return to sign in</button>
            </>
          ):mode==='verify'?(
            <>
              <h1>Check your inbox</h1>
              <p>We would email <strong>{demo.state.session.email||'your address'}</strong> a verification link. In local demo, no email is sent.</p>
              <p className="notice soft">The link would expire in 24 hours. (Simulated.) Try the expired-link path via <button type="button" className="quiet" onClick={()=>setMode('expired')}>expired link</button>.</p>
              {resendNote&&<p className="form-success" role="status">{resendNote}</p>}
              <button className="outline full" onClick={()=>setResendNote(demo.resendVerificationDemo())}>Resend verification email (demo)</button>
              <button className="primary full" onClick={()=>{demo.verifyDemo();router.push(next);}}>Mark email verified (demo)</button>
              <button className="quiet" onClick={()=>setMode('login')}>Return to sign in</button>
              <button className="quiet" onClick={()=>{
                demo.flash('Change email is simulated only — no message leaves this device.');
                setSuccess('Email-change outcome simulated. Confirm the new address before the private forum copy would update (demo).');
              }}>Change email address (simulated)</button>
              {success&&<p className="form-success" role="status">{success}</p>}
            </>
          ):(
            <form onSubmit={onSubmit}>
              <h1>
                {mode==='signup'?'Create your account':mode==='reset'?'Reset your password':'Welcome back'}
              </h1>
              <p className="muted">A place to ask, learn, and grow in faith. Local demo — not production authentication.</p>
              {error&&<p className="form-error" role="alert">{error}</p>}
              {success&&<p className="form-success" role="status">{success}</p>}
              {mode==='signup'&&(
                <label>Display name<input name="name" required minLength={2} maxLength={50} placeholder="Visible to members"/></label>
              )}
              <label>Email address<input name="email" type="email" required autoComplete="email"/></label>
              {mode!=='reset'&&(
                <label>Password
                  <span className="password-field">
                    <input name="password" type={showPass?'text':'password'} required minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'}/>
                    <button type="button" className="quiet" onClick={()=>setShowPass(s=>!s)} aria-label="Toggle password visibility">{showPass?'Hide':'Show'}</button>
                  </span>
                </label>
              )}
              {mode==='signup'&&(
                <>
                  <p className="muted">Use 8+ characters. Demo does not enforce additional complexity.</p>
                  <label className="check"><input type="checkbox" name="terms"/>I agree to Terms and Privacy (demo acknowledgment)</label>
                </>
              )}
              <button className="primary full">
                {mode==='signup'?'Create account':mode==='reset'?'Send reset link':'Sign in'}
              </button>
              <div className="auth-links">
                {mode==='login'&&<>
                  <button type="button" className="quiet" onClick={()=>setMode('signup')}>Create an account</button>
                  <button type="button" className="quiet" onClick={()=>setMode('reset')}>Forgot password?</button>
                </>}
                {mode==='signup'&&<button type="button" className="quiet" onClick={()=>setMode('login')}>Already a member? Sign in</button>}
                {mode==='reset'&&<button type="button" className="quiet" onClick={()=>setMode('login')}>Back to sign in</button>}
              </div>
            </form>
          )}
          <p className="muted center"><a href="/">Return to forum →</a></p>
        </div>
      </main>
    </AppShell>
  );
}

export default function AccountPage(){
  return (
    <Suspense fallback={<main className="account-page"><p>Loading…</p></main>}>
      <AccountInner/>
    </Suspense>
  );
}
