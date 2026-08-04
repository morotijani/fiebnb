import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DashboardProvider } from '../../context/DashboardContext';
import WalkInModalWrapper from './WalkInModalWrapper';
import BookingDetailsSidebar from '../dashboard/BookingDetailsSidebar';
import './DashboardLayout.css';

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <div className="dash">
        <Sidebar />
        
        <main className="dash-main">
          {/* React Router will render the specific view here */}
          <Outlet />
        </main>
      </div>
      <WalkInModalWrapper />
      <BookingDetailsSidebar />
    </DashboardProvider>
  );
}
