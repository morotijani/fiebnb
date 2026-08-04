import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OtpVerificationView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  
  const phone_number = location.state?.phone_number;
  const isNewRegistration = location.state?.isNewRegistration;

  const [otpCodes, setOtpCodes] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  if (!phone_number) {
    return <Navigate to="/register" replace />;
  }

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpCodes = [...otpCodes];
    newOtpCodes[index] = value;
    setOtpCodes(newOtpCodes);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpCodes[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtpCodes = [...otpCodes];
      for (let i = 0; i < pastedData.length; i++) {
        newOtpCodes[i] = pastedData[i];
      }
      setOtpCodes(newOtpCodes);
      if (pastedData.length < 6) {
        inputRefs.current[pastedData.length].focus();
      } else {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const otpCode = otpCodes.join('');
    if (otpCode.length !== 6) {
      setError('OTP must be exactly 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      const user = await verifyOtp(phone_number, otpCode);
      if (isNewRegistration && user.role === 'HOMEOWNER') {
        navigate('/onboarding');
      } else if (user.role === 'GUEST') {
        navigate('/guest');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    try {
      await resendOtp(phone_number);
      setSuccess('A new OTP has been sent to your phone number.');
      setTimeLeft(60); // Reset cooldown
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to resend OTP.');
    }
  };

  const maskPhone = (phone) => {
    if (!phone || phone.length < 5) return phone;
    return phone.slice(0, 3) + '***' + phone.slice(-2);
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-verify/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>One last step</h2>
          <p>Verifying your account helps keep every stay, host and guest on Fiebnb trustworthy.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <h1>Verify your account</h1>
          <p className="sub">Enter the 6-digit code we sent to activate your account.</p>

          <div className="contact-target">
            <MailCheck size={18} stroke="var(--brick-deep)" />
            <span>Sent to <b>{maskPhone(phone_number)}</b> · <Link to="/register" style={{color: 'var(--brick)', fontWeight: '600'}}>not you?</Link></span>
          </div>

          {error && (
            <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fca5a5'}}>
              {error}
            </div>
          )}

          {success && (
            <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #86efac'}}>
              {success}
            </div>
          )}

          <form onSubmit={handleVerify}>
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
                    onPaste={i === 0 ? handlePaste : undefined}
                  />
                ))}
              </div>
            </div>

            <div className="resend-row" style={{marginBottom: '20px'}}>
              <span>Didn't get a code?</span>
              {timeLeft > 0 ? (
                <span style={{color: 'var(--ink-soft)'}}>Resend in {timeLeft}s</span>
              ) : (
                <button type="button" onClick={handleResend} style={{background: 'none', border: 'none', color: 'var(--brick)', fontWeight: '600', cursor: 'pointer', padding: 0}}>Resend it</button>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify account'}
            </button>
          </form>

          <p className="auth-footer-note">Wrong email or phone? <Link to="/register">Go back and edit it</Link></p>
        </div>
      </main>
    </div>
  );
};

export default OtpVerificationView;
