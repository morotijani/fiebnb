import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

const ForgotPasswordView = () => {
  const [method, setMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/reset-password');
  };

  return (
    <div className="auth-split-root">
      <div className="auth-split-container">
        
        {/* Left Column: Brand & Value Proposition */}
        <div className="auth-hero-pane">
          <Link to="/" className="auth-brand-logo">
            <img 
              src="/logo_horizontal.png" 
              alt="Fiebnb" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} 
            />
            <div style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0866FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MatIcon name="home_work" size={22} />
              </span>
              <span className="brand-text">Fiebnb</span>
            </div>
          </Link>

          <h1 className="auth-hero-headline">
            Recover access to your properties and bookings.
          </h1>
          <p className="auth-hero-sub">
            Tell us how to reach you and we'll send a secure one-time verification code to reset your password.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="lock_reset" size={20} />
              </div>
              <div className="auth-feature-text">
                Instant Recovery
                <span>Receive code via SMS or email within seconds.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="security" size={20} />
              </div>
              <div className="auth-feature-text">
                Account Protection
                <span>Your rental contracts and account data stay fully encrypted.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Style Auth Card */}
        <div className="auth-card-pane">
          <div className="auth-card-meta">
            
            <Link to="/login" className="auth-back-link">
              <MatIcon name="arrow_back" size={16} />
              <span>Back to log in</span>
            </Link>

            <div className="auth-card-header">
              <h2>Forgot Password?</h2>
              <p>Enter the email or phone number linked to your Fiebnb account.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-method-capsule">
                <button 
                  type="button" 
                  className={method === 'email' ? 'active' : ''} 
                  onClick={() => setMethod('email')}
                >
                  Email Address
                </button>
                <button 
                  type="button" 
                  className={method === 'phone' ? 'active' : ''} 
                  onClick={() => setMethod('phone')}
                >
                  Phone Number
                </button>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="fp-id">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input 
                  id="fp-id" 
                  type={method === 'email' ? 'email' : 'tel'} 
                  placeholder={method === 'email' ? 'you@example.com' : '024 000 0000'} 
                  required 
                  className="auth-input-control"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-btn-primary" style={{ marginTop: '8px' }}>
                <span>Send Reset Code</span>
              </button>
            </form>

            <div className="auth-divider-line">
              <div className="line"></div>
              <span>or</span>
              <div className="line"></div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#65676B' }}>
                Remembered your password?{' '}
                <Link to="/login" style={{ color: '#0866FF', fontWeight: 600, textDecoration: 'none' }}>
                  Log in
                </Link>
              </span>
            </div>

            <div className="auth-footer-sub">
              Need assistance? <Link to="/support">Contact support</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordView;
