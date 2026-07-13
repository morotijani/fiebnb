import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './views/DashboardOverview';
import CalendarView from './views/CalendarView';
import RoomsView from './views/RoomsView';
import GuestsView from './views/GuestsView';
import SettingsView from './views/SettingsView';

// Admin Views
import AdminDashboard from './views/admin/AdminDashboard';
import OnboardingRequests from './views/admin/OnboardingRequests';
import AdminUsers from './views/admin/AdminUsers';
import AdminProperties from './views/admin/AdminProperties';

// Auth Views
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import OtpVerificationView from './views/auth/OtpVerificationView';
import GuestComingSoon from './views/auth/GuestComingSoon';
import OnboardingView from './views/auth/OnboardingView';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

// A component to protect routes that require authentication
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'GUEST') return <Navigate to="/guest" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />; // Fallback
  }

  return <Outlet />;
};

// A component to prevent authenticated users from viewing login/register
const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    if (user.role === 'GUEST') return <Navigate to="/guest" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              <Route path="/verify-otp" element={<OtpVerificationView />} />
            </Route>

            {/* Guest Restricted Route / Onboarding */}
            <Route path="/guest" element={
              <ProtectedRoute allowedRoles={['GUEST']} />
            }>
              <Route index element={<GuestComingSoon />} />
              <Route path="onboarding" element={<OnboardingView />} />
            </Route>

            {/* Protected Dashboard Routes (Hotel Managers, Admins, Homeowners, Receptionists) */}
            <Route element={<ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'HOMEOWNER', 'RECEPTIONIST', 'GUEST_HOUSE_ADMIN']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/rooms" element={<RoomsView />} />
                <Route path="/guests" element={<GuestsView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="*" element={
                  <div className="flex h-full items-center justify-center text-slate-500">
                    Page Under Construction
                  </div>
                } />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="requests" element={<OnboardingRequests />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="settings" element={<SettingsView />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
