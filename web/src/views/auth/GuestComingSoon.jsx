import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GuestComingSoon = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-10">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-blue-600 text-3xl">build</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
          Guest Web Dashboard
        </h2>
        <h3 className="text-xl font-medium text-blue-600 mb-4">
          Coming Soon
        </h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We're currently building out the web experience for our guests. 
          Please use the Fiebnb Mobile App to manage your bookings and profile for now.
        </p>

        <div className="bg-blue-50 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800 mb-3">Want to list your property on Fiebnb?</p>
          <button
            onClick={() => navigate('/guest/onboarding')}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add_home</span>
            Setup Your Property
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default GuestComingSoon;
