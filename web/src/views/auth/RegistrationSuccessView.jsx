import React from 'react';
import { Link } from 'react-router-dom';

export default function RegistrationSuccessView() {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-success/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>You're all set!</h2>
          <p>Welcome to the Fiebnb family. We are thrilled to have you onboard.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card" style={{maxWidth: '450px', textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '24px'}}>
            <div style={{width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span className="material-symbols-outlined" style={{fontSize: '32px'}}>check_circle</span>
            </div>
          </div>
          
          <h1 style={{marginBottom: '12px'}}>Registration Successful!</h1>
          <p className="sub" style={{marginBottom: '32px'}}>Your property has been successfully set up and your account is ready. You can now start managing your property from the dashboard.</p>

          <Link to="/" className="btn btn-primary" style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
