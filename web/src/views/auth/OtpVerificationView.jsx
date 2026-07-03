import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OtpVerificationView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  
  const phone_number = location.state?.phone_number;

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Timer logic for Resend Cooldown
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  // Prevent direct access to this page
  if (!phone_number) {
    return <Navigate to="/register" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (otpCode.length !== 6) {
      setError('OTP must be exactly 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      const user = await verifyOtp(phone_number, otpCode);
      if (user.role === 'GUEST') {
        navigate('/guest');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Verification failed.');
      // If 3 strikes are hit, we might want to redirect them to register or wait, but the message itself will inform them.
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-blue-600 text-2xl">sms</span>
            </div>
          </div>
          
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Verify your phone
          </h2>
          <p className="text-center text-sm text-slate-500 mb-8">
            We've sent a 6-digit code to <span className="font-semibold text-slate-700">{phone_number}</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-pulse">
              <span className="material-symbols-outlined text-red-500 text-xl shrink-0">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-green-500 text-xl shrink-0">check_circle</span>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="otpCode" className="sr-only">OTP Code</label>
              <input
                type="text"
                id="otpCode"
                maxLength="6"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
                className="block w-full text-center tracking-[0.5em] text-3xl font-mono py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900 bg-slate-50 focus:bg-white placeholder:text-slate-300"
                placeholder="------"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Verifying...
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>
        </div>
        
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center flex flex-col items-center justify-center">
          <p className="text-sm text-slate-600 mb-3">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={timeLeft > 0}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 disabled:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationView;
