import { Menu, Bell, Plus } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function TopNav({ onMenuToggle }) {
  const { openWalkInModal } = useDashboard();

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 md:px-6 z-10 shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuToggle}
          className="p-2 mr-2 text-slate-500 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 md:hidden">Fiebnb</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => openWalkInModal()}
          className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Walk-In</span>
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-700">Jane Doe</p>
            <p className="text-xs text-slate-500">Receptionist</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
            <span className="text-sm font-bold text-blue-700">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
