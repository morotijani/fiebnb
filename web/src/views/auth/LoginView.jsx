import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

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
            Manage properties, collect rent, and find verified stays across Ghana.
          </h1>
          <p className="auth-hero-sub">
            The all-in-one console for homeowners, apartment managers, and travelers.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="domain" size={20} />
              </div>
              <div className="auth-feature-text">
                Verified Landlords & Properties
                <span>Residential homes, serviced apartments, and guesthouses.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="payments" size={20} />
              </div>
              <div className="auth-feature-text">
                Automated Rent Roll & Advance Terms
                <span>Track 1-year and 2-year upfront advances with Mobile Money.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="verified_user" size={20} />
              </div>
              <div className="auth-feature-text">
                Direct Host Communication
                <span>Zero middlemen, instant maintenance tracking, and genuine security.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Style Auth Card */}
        <div className="auth-card-pane">
          <div className="auth-card-meta">
            
            <div className="auth-card-header">
              <h2>Log In</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div className="auth-alert-error">
                <MatIcon name="error" size={18} />
                <span>{error}</span>
              </div>
            )}

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
                <label className="auth-form-label" htmlFor="login-id">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input 
                  id="login-id" 
                  type={method === 'email' ? 'email' : 'tel'} 
                  placeholder={method === 'email' ? 'name@example.com' : '024 000 0000'} 
                  required 
                  className="auth-input-control"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
              </div>

              <div className="auth-form-group">
                <div className="auth-row-between">
                  <label className="auth-form-label" htmlFor="login-pw" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <div className="auth-pw-wrap">
                  <input 
                    id="login-pw" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password" 
                    required 
                    className="auth-input-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="auth-pw-btn" 
                    aria-label="Toggle password visibility" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <MatIcon name={showPassword ? "visibility_off" : "visibility"} size={18} />
                  </button>
                </div>
              </div>

              <label className="auth-check-row">
                <input type="checkbox" defaultChecked />
                <span>Keep me logged in on this device</span>
              </label>

              <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <MatIcon name="sync" size={18} />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </form>

            <div className="auth-divider-line">
              <div className="line"></div>
              <span>or</span>
              <div className="line"></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/register" className="auth-btn-create">
                Create new account
              </Link>
            </div>

            <div className="auth-footer-sub">
              By continuing you agree to Fiebnb's <Link to="/terms">Terms</Link> & <Link to="/privacy">Privacy Policy</Link>.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginView;
