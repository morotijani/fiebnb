import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

const ResetPasswordView = () => {
  const navigate = useNavigate();
  const [otpCodes, setOtpCodes] = useState(['', '', '', '', '', '']);
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtpCodes = [...otpCodes];
    newOtpCodes[index] = value;
    setOtpCodes(newOtpCodes);
    if (value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpCodes[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
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
            Set a new password for your account.
          </h1>
          <p className="auth-hero-sub">
            Enter the 6-digit verification code you received and choose a strong password to secure your account.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="password" size={20} />
              </div>
              <div className="auth-feature-text">
                Password Security
                <span>Use at least 8 characters with a mix of numbers and letters.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Style Auth Card */}
        <div className="auth-card-pane">
          <div className="auth-card-meta">
            
            <Link to="/forgot-password" className="auth-back-link">
              <MatIcon name="arrow_back" size={16} />
              <span>Back</span>
            </Link>

            <div className="auth-card-header">
              <h2>Reset Password</h2>
              <p>Enter the 6-digit code and create your new password.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-form-label" style={{ textAlign: 'center' }}>Verification Code</label>
                <div className="auth-otp-row">
                  {otpCodes.map((digit, i) => (
                    <input 
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text" 
                      inputMode="numeric" 
                      maxLength={1} 
                      required 
                      className="auth-otp-input"
                      value={digit}
                      onChange={e => handleInputChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                    />
                  ))}
                </div>
              </div>

              <div className="auth-row-between" style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '12.5px', color: '#65676B' }}>Didn't receive code?</span>
                <Link to="/resend-verification" style={{ fontSize: '12.5px', color: '#0866FF', fontWeight: 600, textDecoration: 'none' }}>
                  Resend it
                </Link>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="rp-pw1">New Password</label>
                <div className="auth-pw-wrap">
                  <input 
                    id="rp-pw1" 
                    type={showPw1 ? 'text' : 'password'} 
                    placeholder="Create new password" 
                    minLength="8" 
                    required 
                    className="auth-input-control"
                  />
                  <button 
                    type="button" 
                    className="auth-pw-btn" 
                    aria-label="Toggle password visibility" 
                    onClick={() => setShowPw1(!showPw1)}
                  >
                    <MatIcon name={showPw1 ? "visibility_off" : "visibility"} size={18} />
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="rp-pw2">Confirm New Password</label>
                <div className="auth-pw-wrap">
                  <input 
                    id="rp-pw2" 
                    type={showPw2 ? 'text' : 'password'} 
                    placeholder="Confirm new password" 
                    minLength="8" 
                    required 
                    className="auth-input-control"
                  />
                  <button 
                    type="button" 
                    className="auth-pw-btn" 
                    aria-label="Toggle password visibility" 
                    onClick={() => setShowPw2(!showPw2)}
                  >
                    <MatIcon name={showPw2 ? "visibility_off" : "visibility"} size={18} />
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn-primary" style={{ marginTop: '12px' }}>
                <span>Save New Password</span>
              </button>
            </form>

            <div className="auth-footer-sub">
              Return to <Link to="/login">Log in</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordView;
