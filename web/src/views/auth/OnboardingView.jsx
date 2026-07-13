import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        navigate('/');
      } else {
        // Pending admin approval
        toast.success(res.data.message);
        navigate('/guest'); // Or some pending view
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Let's setup your property</h2>
        <p className="text-sm text-slate-500 text-center mb-8">Step {step} of 3</p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What kind of property is this?</label>
                <select 
                  required
                  value={formData.property_type}
                  onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="HOTEL">Hotel (Multi-room)</option>
                  <option value="GUESTHOUSE">Guesthouse (Multi-room)</option>
                  <option value="APARTMENT">Apartment (Single unit)</option>
                  <option value="HOMEOWNER">Homeowner (Long term rent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Name / Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Sunset Paradise Resort"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Address</label>
                <input 
                  type="text" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g. 123 Beach Road, Accra"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Digital Address (Optional)</label>
                <input 
                  type="text" 
                  value={formData.digital_address}
                  onChange={(e) => setFormData({...formData, digital_address: e.target.value})}
                  placeholder="e.g. GA-123-4567"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price per Night (₵)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                  placeholder="e.g. 150"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">This can be changed later or overridden per room category.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {step === 3 ? (isLoading ? 'Submitting...' : 'Complete') : 'Next Step'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
