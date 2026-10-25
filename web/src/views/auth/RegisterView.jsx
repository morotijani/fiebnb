import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

const RegisterView = () => {
  const [accountType, setAccountType] = useState('GUEST'); // GUEST or HOMEOWNER
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
            Join Ghana's modern real estate and verified hospitality community.
          </h1>
          <p className="auth-hero-sub">
            Whether you are listing residential homes, managing apartment complexes, or booking your next stay.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="real_estate_agent" size={20} />
              </div>
              <div className="auth-feature-text">
                Homeowners & Landlords
                <span>Post long-term listings, set 1-2 year advance terms, and track rent collection.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="apartment" size={20} />
              </div>
              <div className="auth-feature-text">
                Apartment Complexes & Hotels
                <span>Manage multiple units, maintenance tickets, staff access, and front-desk check-ins.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="security" size={20} />
              </div>
              <div className="auth-feature-text">
                Verified Direct Booking
                <span>Transparent agreements, direct communication, and no hidden agent fees.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Style Auth Card */}
        <div className="auth-card-pane">
          <div className="auth-card-meta">
            
            <div className="auth-card-header">
              <h2>Create an Account</h2>
              <p>It's quick and easy to get started with Fiebnb.</p>
            </div>

            {error && (
              <div className="auth-alert-error">
                <MatIcon name="error" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Account Type Selection */}
              <label className="auth-form-label">I want to:</label>
              <div className="auth-role-grid">
                <div 
                  className={`auth-role-card ${accountType === 'GUEST' ? 'active' : ''}`}
                  onClick={() => setAccountType('GUEST')}
                >
                  <div className="role-icon-box">
                    <MatIcon name="luggage" size={18} />
                  </div>
                  <h4>Book Stays</h4>
                  <p>Hotels & rentals</p>
                </div>

                <div 
                  className={`auth-role-card ${accountType === 'HOMEOWNER' ? 'active' : ''}`}
                  onClick={() => setAccountType('HOMEOWNER')}
                >
                  <div className="role-icon-box">
                    <MatIcon name="real_estate_agent" size={18} />
                  </div>
                  <h4>List & Manage</h4>
                  <p>Homes & apartments</p>
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="e.g. Kwesi Mensah" 
                  required 
                  className="auth-input-control"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  className="auth-input-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="phone_number">Phone Number</label>
                <input 
                  id="phone_number" 
                  name="phone_number" 
                  type="tel" 
                  placeholder="024 000 0000" 
                  required 
                  className="auth-input-control"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="password">Password</label>
                <div className="auth-pw-wrap">
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Create a strong password" 
                    minLength="8" 
                    required 
                    className="auth-input-control"
                    value={formData.password}
                    onChange={handleChange}
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
                <div style={{ fontSize: '11.5px', color: '#65676B', marginTop: '4px' }}>
                  At least 8 characters with letters & numbers.
                </div>
              </div>

              <label className="auth-check-row">
                <input type="checkbox" required />
                <span>I agree to Fiebnb's <Link to="/terms" style={{ color: '#0866FF', fontWeight: 600 }}>Terms</Link> and <Link to="/privacy" style={{ color: '#0866FF', fontWeight: 600 }}>Privacy Policy</Link></span>
              </label>

              <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <MatIcon name="sync" size={18} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="auth-divider-line">
              <div className="line"></div>
              <span>already registered?</span>
              <div className="line"></div>
            </div>

            <Link to="/login" className="auth-btn-secondary">
              Log in to existing account
            </Link>

            <div className="auth-footer-sub">
              We'll send an OTP code to confirm your phone number.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterView;
