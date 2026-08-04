import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

export default function OnboardingView() {
  const { user, loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    property_type: 'HOTEL',
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
        document_urls: [] // Assuming documents are added later or optional for now
      });

      if (res.data.access_token) {
        // Instant upgrade
        loginWithTokens(res.data.access_token, res.data.refresh_token, res.data.user);
        toast.success(res.data.message);
        navigate('/success');
      } else {
        // Pending admin approval
        toast.success(res.data.message);
        navigate('/guest'); // Or some pending view
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <img className="bg" src="https://picsum.photos/seed/fiebnb-auth-onboarding/900/1200" alt="Background" />
        <div className="veil"></div>
        <div className="content top-logo">
          <Link to="/"><img src="/assets/fiebnb-logo-horizontal-reversed.svg" alt="Fiebnb" style={{height: '34px'}} /></Link>
        </div>
        <div className="content bottom">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <h2>Let's setup your property</h2>
          <p>Join thousands of hosts earning with Fiebnb. Set up your property in just a few steps.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card" style={{maxWidth: '500px'}}>
          <Link to="/" className="mobile-logo"><img src="/assets/fiebnb-logo-horizontal.svg" alt="Fiebnb" /></Link>

          <h1>Property Setup</h1>
          <p className="sub">Step {step} of 3</p>

          {/* Progress Bar */}
          <div style={{width: '100%', background: 'var(--slate-soft)', height: '6px', borderRadius: '3px', marginBottom: '30px', overflow: 'hidden'}}>
            <div style={{background: 'var(--brand)', height: '100%', transition: 'all 0.3s ease', width: `${(step / 3) * 100}%`}}></div>
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            
            {step === 1 && (
              <div style={{animation: 'fadeIn 0.3s ease'}}>
                <div style={{marginBottom: '20px'}}>
                  <label className="form-label">What kind of property is this?</label>
                  <select 
                    required
                    value={formData.property_type}
                    onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                    className="form-control"
                  >
                    <option value="HOTEL">Hotel (Multi-room)</option>
                    <option value="GUESTHOUSE">Guesthouse (Multi-room)</option>
                    <option value="APARTMENT">Apartment (Single unit)</option>
                    <option value="HOMEOWNER">Homeowner (Long term rent)</option>
                  </select>
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label className="form-label">Property Name / Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Sunset Paradise Resort"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{animation: 'fadeIn 0.3s ease'}}>
                <div style={{marginBottom: '20px'}}>
                  <label className="form-label">Location Address</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="e.g. 123 Beach Road, Accra"
                    className="form-control"
                  />
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label className="form-label">Digital Address (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.digital_address}
                    onChange={(e) => setFormData({...formData, digital_address: e.target.value})}
                    placeholder="e.g. GA-123-4567"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{animation: 'fadeIn 0.3s ease'}}>
                <div style={{marginBottom: '20px'}}>
                  <label className="form-label">
                    {['APARTMENT', 'HOMEOWNER'].includes(formData.property_type) 
                      ? 'Base Price per month (₵)' 
                      : 'Base Price per Night (₵)'}
                  </label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                    placeholder="e.g. 150"
                    className="form-control"
                  />
                  <p style={{fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px'}}>This can be changed later or overridden per room category.</p>
                </div>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--line)'}}>
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="btn btn-outline"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-primary"
                style={{minWidth: '120px'}}
              >
                {step === 3 ? (isLoading ? 'Submitting...' : 'Complete Setup') : 'Next Step'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
