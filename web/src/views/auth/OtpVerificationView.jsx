import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

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
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpCodes[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
        inputRefs.current[pastedData.length]?.focus();
      } else {
        inputRefs.current[5]?.focus();
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
      setSuccess('Verification code resent successfully.');
      setTimeLeft(60);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to resend code.');
    }
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + ' ••• ••• ' + phone.slice(-2);
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
            One quick step to verify your account.
          </h1>
          <p className="auth-hero-sub">
            Verifying your phone number keeps every landlord, tenant, and guest on Fiebnb authentic and trustworthy.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="verified" size={20} />
              </div>
              <div className="auth-feature-text">
                Fraud Prevention
                <span>Protects you from fake agents and unauthorized bookings.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Style Auth Card */}
        <div className="auth-card-pane">
          <div className="auth-card-meta">
            
            <div className="auth-card-header">
              <h2>Verify Phone Number</h2>
              <p>Enter the 6-digit code we sent to your device.</p>
            </div>

            <div className="auth-target-badge">
              <MatIcon name="mark_email_read" size={20} color="#0866FF" />
              <span>
                Sent to <b>{maskPhone(phone_number)}</b> ·{' '}
                <Link to="/register" style={{ color: '#0866FF', fontWeight: 600, textDecoration: 'none' }}>
                  change?
                </Link>
              </span>
            </div>

            {error && (
              <div className="auth-alert-error">
                <MatIcon name="error" size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert-success">
                <MatIcon name="check_circle" size={18} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="auth-form-group">
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
                      onPaste={i === 0 ? handlePaste : undefined}
                    />
                  ))}
                </div>
              </div>

              <div className="auth-row-between" style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: '#65676B' }}>Didn't receive a code?</span>
                {timeLeft > 0 ? (
                  <span style={{ fontSize: '13px', color: '#8A8D91', fontWeight: 500 }}>
                    Resend in {timeLeft}s
                  </span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResend} 
                    style={{ background: 'none', border: 'none', color: '#0866FF', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '13px', fontFamily: 'inherit' }}
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <MatIcon name="sync" size={18} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Proceed</span>
                )}
              </button>
            </form>

            <div className="auth-footer-sub">
              Need help? <Link to="/support">Contact Fiebnb Support</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OtpVerificationView;
