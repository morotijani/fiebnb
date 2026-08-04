import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ResendVerificationView = () => {
  const [method, setMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Front-end prototype logic
    navigate('/verify-otp', { state: { phone_number: method === 'phone' ? identifier : '0240000000' } });
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-resend/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>Didn't get a code?</h2>
          <p>Codes can take a minute to arrive, or land in spam. If it's been a while, we'll send a fresh one.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <Link to="/login" className="back-link"><ArrowLeft size={15} /> Back to log in</Link>

          <h1>Resend verification code</h1>
          <p className="sub">Enter the email or phone number you used to sign up and we'll send a new code.</p>

          <form onSubmit={handleSubmit}>
            <div className="method-toggle">
              <button 
                type="button" 
                className={method === 'email' ? 'active' : ''} 
                onClick={() => setMethod('email')}
              >Email</button>
              <button 
                type="button" 
                className={method === 'phone' ? 'active' : ''} 
                onClick={() => setMethod('phone')}
              >Phone number</button>
            </div>

            <div className="form-field">
              <label htmlFor="rv-id">{method === 'email' ? 'Email address' : 'Phone number'}</label>
              <input 
                id="rv-id" 
                type={method === 'email' ? 'email' : 'tel'} 
                placeholder={method === 'email' ? 'you@example.com' : '024 000 0000'} 
                required 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Resend code</button>
          </form>

          <p className="switch">Already verified? <Link to="/login">Log in</Link></p>
          <p className="auth-footer-note">Still nothing? <Link to="/support">Message us on WhatsApp</Link></p>
        </div>
      </main>
    </div>
  );
};

export default ResendVerificationView;
