import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { DashboardProvider } from '../../context/DashboardContext';
import WalkInModalWrapper from './WalkInModalWrapper';
import BookingDetailsSidebar from '../dashboard/BookingDetailsSidebar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNav onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {/* React Router will render the specific view here */}
            <Outlet />
          </main>
        </div>
      </div>
      <WalkInModalWrapper />
      <BookingDetailsSidebar />
    </DashboardProvider>
  );
}
