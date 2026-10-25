import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

export default function OnboardingView() {
  const { user, loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    property_type: 'HOMEOWNER',
    address: '',
    digital_address: '',
    base_price: ''
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axiosClient.post('/onboarding/submit', {
        title: formData.title,
        property_type: formData.property_type,
        address: formData.address,
        digital_address: formData.digital_address,
        base_price: parseFloat(formData.base_price || 0),
        document_urls: []
      });

      if (res.data.access_token) {
        loginWithTokens(res.data.access_token, res.data.refresh_token, res.data.user);
        toast.success(res.data.message);
        navigate('/success');
      } else {
        toast.success(res.data.message);
        navigate('/guest');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit onboarding');
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
            Let's set up your property listing.
          </h1>
          <p className="auth-hero-sub">
            Join thousands of Ghanaian property owners and managers earning with Fiebnb.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <MatIcon name="check_circle" size={20} />
              </div>
              <div className="auth-feature-text">
                Quick 3-Step Setup
                <span>Categorize your property, enter location, and set starting rental rates.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Style Auth Card */}
        <div className="auth-card-pane">
          <div className="auth-card-meta">
            
            <div className="auth-card-header">
              <h2>Property Setup</h2>
              <p>Step {step} of 3</p>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', background: '#E4E6EB', height: '6px', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
              <div style={{ background: '#0866FF', height: '100%', transition: 'all 0.3s ease', width: `${(step / 3) * 100}%` }}></div>
            </div>

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              
              {step === 1 && (
                <div>
                  <div className="auth-form-group">
                    <label className="auth-form-label">Property Classification</label>
                    <select 
                      required
                      value={formData.property_type}
                      onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                      className="auth-input-control"
                    >
                      <option value="HOMEOWNER">Homeowner (Long-term multi-year lease)</option>
                      <option value="APARTMENT">Apartment Complex (Multi-unit)</option>
                      <option value="HOTEL">Hotel / Resort (Multi-room)</option>
                      <option value="GUESTHOUSE">Guesthouse (Bed & Breakfast)</option>
                    </select>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Property Title / Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. Modern 3-Bedroom Villa in East Legon"
                      className="auth-input-control"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="auth-form-group">
                    <label className="auth-form-label">Street / Location Address</label>
                    <input 
                      type="text" 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="e.g. Lagos Avenue, East Legon, Accra"
                      className="auth-input-control"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Ghana Post Digital Address (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.digital_address}
                      onChange={(e) => setFormData({...formData, digital_address: e.target.value})}
                      placeholder="e.g. GA-123-4567"
                      className="auth-input-control"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="auth-form-group">
                    <label className="auth-form-label">
                      {['APARTMENT', 'HOMEOWNER'].includes(formData.property_type) 
                        ? 'Base Rent per Month (GH₵)' 
                        : 'Base Price per Night (GH₵)'}
                    </label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                      placeholder="e.g. 3500"
                      className="auth-input-control"
                    />
                    <p style={{ fontSize: '11.5px', color: '#65676B', marginTop: '6px' }}>
                      You can modify this anytime or customize rates per unit/room.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #E4E6EB' }}>
                {step > 1 ? (
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="auth-btn-secondary"
                    style={{ width: 'auto', padding: '0 20px' }}
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="auth-btn-primary"
                  style={{ width: 'auto', minWidth: '150px', padding: '0 24px' }}
                >
                  {step === 3 ? (isLoading ? 'Submitting...' : 'Complete Setup') : 'Continue'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
