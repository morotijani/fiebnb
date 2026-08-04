import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Home, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterView = () => {
  const [accountType, setAccountType] = useState('GUEST'); // GUEST or HOMEOWNER
  const [method, setMethod] = useState('email');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        role: accountType
      };

      // If method is email, we might not have a phone number, but backend requires it. 
      // For this UI to work as-is, we must enforce a phone number or default it if email is used.
      // Wait, the new UI in signup.html toggle between email AND phone. But the DB requires both.
      // I'll combine the field logically: if they enter email, we still need a phone, but the UI only shows one?
      // Ah, the UI had "Full name", then a method toggle for Email / Phone.
      // If we strictly follow the new UI, they only enter one. 
      // Let's modify the new UI slightly to ask for both, because backend requires both.
      
      await register(payload);
      navigate('/verify-otp', { state: { phone_number: formData.phone_number, isNewRegistration: true } });
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].message);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-signup/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>Join Fiebnb</h2>
          <p>Create an account to book verified stays across Ghana, or list your own property and start earning.</p>
          <div className="quote">
            <p>"Moved to Accra for work and found a 6-month furnished flat in two days. No agent fees, no drama."</p>
            <span>Kwabena T. · Long-term tenant</span>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <h1>Create your account</h1>
          <p className="sub">Already on Fiebnb? <Link to="/login">Log in</Link></p>

          {error && (
            <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fca5a5'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="type-select">
              <label className={`type-card ${accountType === 'GUEST' ? 'selected' : ''}`} onClick={() => setAccountType('GUEST')}>
                <input type="radio" name="accountType" value="GUEST" checked={accountType === 'GUEST'} readOnly />
                <Briefcase size={24} strokeWidth={1.5} />
                <h4>I'm booking a stay</h4>
                <p>Find hotels, guesthouses & rentals</p>
              </label>
              <label className={`type-card ${accountType === 'HOMEOWNER' ? 'selected' : ''}`} onClick={() => setAccountType('HOMEOWNER')}>
                <input type="radio" name="accountType" value="HOMEOWNER" checked={accountType === 'HOMEOWNER'} readOnly />
                <Home size={24} strokeWidth={1.5} />
                <h4>I'm listing a property</h4>
                <p>Earn as a host or landlord</p>
              </label>
            </div>

            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                placeholder="Ama Owusu" 
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Changed from the static HTML method-toggle to ensure both email and phone are collected */}
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone_number">Phone number</label>
              <input 
                id="phone_number" 
                name="phone_number" 
                type="tel" 
                placeholder="024 000 0000" 
                required 
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="pw-field">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Create a password" 
                  minLength="8" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="pw-toggle" aria-label="Show password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="pw-hint">At least 8 characters, with one number.</p>
            </div>

            <label className="check-row">
              <input type="checkbox" required />
              <span>I agree to Fiebnb's <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="divider-row"><div className="line"></div><span>or</span><div className="line"></div></div>
          <button type="button" className="btn btn-outline btn-block" onClick={() => alert("Google sign-up isn't wired up yet.")}>
            <Globe size={17} /> Continue with Google
          </button>

          <p className="auth-footer-note">We'll send a verification code to confirm your account.</p>
        </div>
      </main>
    </div>
  );
};

export default RegisterView;
