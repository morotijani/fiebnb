import React from 'react';
import MatIcon from '../common/MatIcon';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';

export default function TopNav({ onMenuToggle }) {
  const { openWalkInModal } = useDashboard();
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-[#E4E6EB] md:px-6 z-10 shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuToggle}
          className="p-2 mr-2 text-slate-500 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0866FF] md:hidden"
        >
          <MatIcon name="menu" size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 md:hidden">Fiebnb</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => openWalkInModal()}
          className="hidden md:flex items-center space-x-2 bg-[#0866FF] hover:bg-[#0756D6] text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <MatIcon name="add" size={16} />
          <span>Walk-In</span>
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
          <MatIcon name="notifications" size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()?.replace('_', ' ') || 'Staff'}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#E7F3FF] flex items-center justify-center border border-[#D0E5FF] shadow-sm">
            <span className="text-sm font-bold text-[#0866FF]">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
