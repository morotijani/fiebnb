import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPasswordView = () => {
  const [method, setMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Front-end prototype logic
    navigate('/reset-password');
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-forgot/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>It happens to everyone</h2>
          <p>Tell us how to reach you and we'll send a code to get you straight back into your account.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <Link to="/login" className="back-link"><ArrowLeft size={15} /> Back to log in</Link>

          <h1>Forgot your password?</h1>
          <p className="sub">Enter the email or phone number linked to your account and we'll send a reset code.</p>

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
              <label htmlFor="fp-id">{method === 'email' ? 'Email address' : 'Phone number'}</label>
              <input 
                id="fp-id" 
                type={method === 'email' ? 'email' : 'tel'} 
                placeholder={method === 'email' ? 'you@example.com' : '024 000 0000'} 
                required 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Send reset code</button>
          </form>

          <p className="switch">Remembered it after all? <Link to="/login">Log in</Link></p>
          <p className="auth-footer-note">Need more help? <Link to="/support">Contact support</Link></p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordView;
