import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

const ResendVerificationView = () => {
  const [method, setMethod] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/verify-otp', { state: { phone_number: identifier } });
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
            Need a fresh verification code?
          </h1>
          <p className="auth-hero-sub">
            Codes can occasionally take a moment to deliver via SMS. Enter your phone number and we'll dispatch a new code immediately.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="send_to_mobile" size={20} />
              </div>
              <div className="auth-feature-text">
                Direct SMS Dispatch
                <span>High-deliverability network across MTN, Telecel, and AT Ghana.</span>
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
              <h2>Resend Code</h2>
              <p>Enter the phone number you registered with.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="rv-id">Phone Number</label>
                <input 
                  id="rv-id" 
                  type="tel" 
                  placeholder="024 000 0000" 
                  required 
                  className="auth-input-control"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-btn-primary" style={{ marginTop: '12px' }}>
                <span>Send Fresh Code</span>
              </button>
            </form>

            <div className="auth-divider-line">
              <div className="line"></div>
              <span>or</span>
              <div className="line"></div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#65676B' }}>
                Already verified?{' '}
                <Link to="/login" style={{ color: '#0866FF', fontWeight: 600, textDecoration: 'none' }}>
                  Log in
                </Link>
              </span>
            </div>

            <div className="auth-footer-sub">
              Still having issues? <Link to="/support">Contact support via WhatsApp</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResendVerificationView;
