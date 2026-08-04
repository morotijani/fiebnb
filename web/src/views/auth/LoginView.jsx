import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginView = () => {
  const [method, setMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(identifier, password);
      if (user.role === 'GUEST') {
        navigate('/guest');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-login/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>Welcome back to Fiebnb</h2>
          <p>Pick up right where you left off — your saved stays, messages and upcoming bookings are all here.</p>
          <div className="quote">
            <p>"Booked a guesthouse in Kumasi the night before a wedding. Felt safer than any hotel app I've used."</p>
            <span>Nana Ama O. · Guest, Kumasi</span>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <h1>Log in</h1>
          <p className="sub">New to Fiebnb? <Link to="/register">Create an account</Link></p>

          {error && (
            <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fca5a5'}}>
              {error}
            </div>
          )}

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
              <label htmlFor="login-id">{method === 'email' ? 'Email address' : 'Phone number'}</label>
              <input 
                id="login-id" 
                type={method === 'email' ? 'email' : 'tel'} 
                placeholder={method === 'email' ? 'you@example.com' : '024 000 0000'} 
                required 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
            </div>

            <div className="form-field">
              <div className="field-row-between">
                <label htmlFor="login-pw">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="pw-field">
                <input 
                  id="login-pw" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="pw-toggle" aria-label="Show password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="check-row" style={{marginTop: '2px'}}>
              <input type="checkbox" defaultChecked />
              <span>Keep me logged in on this device</span>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="divider-row"><div className="line"></div><span>or</span><div className="line"></div></div>
          <button type="button" className="btn btn-outline btn-block" onClick={() => alert("Google sign-in isn't wired up yet.")}>
            <Globe size={17} /> Continue with Google
          </button>

          <p className="switch">Just signed up? <Link to="/verify-otp">Verify your account</Link></p>
          <p className="auth-footer-note">By continuing you agree to Fiebnb's <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
        </div>
      </main>
    </div>
  );
};

export default LoginView;
