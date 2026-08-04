import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

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
    if (value !== '' && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpCodes[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Front-end prototype logic
    navigate('/login');
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-reset/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>Almost there</h2>
          <p>Enter the code we sent you and choose a new password to get back into your account.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <Link to="/forgot-password" className="back-link"><ArrowLeft size={15} /> Back</Link>

          <h1>Reset your password</h1>
          <p className="sub">Enter the 6-digit code we sent, then set a new password.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Verification code</label>
              <div className="otp-row">
                {otpCodes.map((digit, i) => (
                  <input 
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text" 
                    inputMode="numeric" 
                    maxLength={1} 
                    required 
                    value={digit}
                    onChange={e => handleInputChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                  />
                ))}
              </div>
            </div>

            <div className="resend-row" style={{marginBottom: '20px'}}>
              <span>Didn't get a code?</span>
              <Link to="/resend-verification">Resend it</Link>
            </div>

            <div className="form-field">
              <label htmlFor="rp-pw1">New password</label>
              <div className="pw-field">
                <input 
                  id="rp-pw1" 
                  type={showPw1 ? 'text' : 'password'} 
                  placeholder="Create a new password" 
                  minLength="8" 
                  required 
                />
                <button type="button" className="pw-toggle" aria-label="Show password" onClick={() => setShowPw1(!showPw1)}>
                  {showPw1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="pw-hint">At least 8 characters, with one number.</p>
            </div>

            <div className="form-field">
              <label htmlFor="rp-pw2">Confirm new password</label>
              <div className="pw-field">
                <input 
                  id="rp-pw2" 
                  type={showPw2 ? 'text' : 'password'} 
                  placeholder="Re-enter your new password" 
                  minLength="8" 
                  required 
                />
                <button type="button" className="pw-toggle" aria-label="Show password" onClick={() => setShowPw2(!showPw2)}>
                  {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">Reset password</button>
          </form>

          <p className="switch">Remembered your password? <Link to="/login">Log in</Link></p>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordView;
