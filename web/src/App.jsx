import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './views/DashboardOverview';
import CalendarView from './views/CalendarView';
import RoomsView from './views/RoomsView';
import GuestsView from './views/GuestsView';
import SettingsView from './views/SettingsView';
import PropertiesView from './views/PropertiesView';
import StaffView from './views/StaffView';
import MessagesView from './views/MessagesView';

// Admin Views
import AdminDashboard from './views/admin/AdminDashboard';
import OnboardingRequests from './views/admin/OnboardingRequests';
import AdminUsers from './views/admin/AdminUsers';
import AdminProperties from './views/admin/AdminProperties';

// Apartment & Tenant Views
import ApartmentBuildingsView from './views/apartment/ApartmentBuildingsView';
import ApartmentUnitsView from './views/apartment/ApartmentUnitsView';
import TenantsView from './views/TenantsView';
import RentRollView from './views/apartment/RentRollView';
import MaintenanceView from './views/apartment/MaintenanceView';
import HomeownerMyPropertiesView from './views/homeowner/MyPropertiesView';
import HomeownerRentCollectionView from './views/homeowner/RentCollectionView';
import HomeownerLeasesView from './views/homeowner/LeasesView';

// Auth Views
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import OtpVerificationView from './views/auth/OtpVerificationView';
import ForgotPasswordView from './views/auth/ForgotPasswordView';
import ResetPasswordView from './views/auth/ResetPasswordView';
import ResendVerificationView from './views/auth/ResendVerificationView';
import GuestComingSoon from './views/auth/GuestComingSoon';
import OnboardingView from './views/auth/OnboardingView';
import RegistrationSuccessView from './views/auth/RegistrationSuccessView';

// Website views
import WebsiteLayout from './components/website/WebsiteLayout';
import LandingView from './views/website/LandingView';
import AboutView from './views/website/AboutView';
import ContactView from './views/website/ContactView';
import BrowseView from './views/website/BrowseView';
import ListingView from './views/website/ListingView';
import CareersView from './views/website/CareersView';
import TrustSafetyView from './views/website/TrustSafetyView';
import CancellationOptionsView from './views/website/CancellationOptionsView';
import HostProtectionView from './views/website/HostProtectionView';
import HowBookingWorksView from './views/website/HowBookingWorksView';
import PricingPayoutsView from './views/website/PricingPayoutsView';
import SupportView from './views/website/SupportView';

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
  const location = useLocation();

  if (isLoading) return null;

  if (user) {
    if (location.state?.isNewRegistration && user.role === 'HOMEOWNER') {
      return <Navigate to="/onboarding" replace />;
    }
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
              <Route path="/forgot-password" element={<ForgotPasswordView />} />
              <Route path="/reset-password" element={<ResetPasswordView />} />
              <Route path="/resend-verification" element={<ResendVerificationView />} />
            </Route>

            {/* Guest Restricted Route */}
            <Route path="/guest" element={
              <ProtectedRoute allowedRoles={['GUEST']} />
            }>
              <Route index element={<GuestComingSoon />} />
            </Route>

            {/* Common Onboarding Route for GUESTs upgrading or new HOMEOWNERs */}
            <Route path="/onboarding" element={
              <ProtectedRoute allowedRoles={['GUEST', 'HOMEOWNER']} />
            }>
              <Route index element={<OnboardingView />} />
            </Route>

            <Route path="/success" element={
              <ProtectedRoute allowedRoles={['HOMEOWNER', 'HOTEL_MANAGER', 'GUEST_HOUSE_ADMIN']} />
            }>
              <Route index element={<RegistrationSuccessView />} />
            </Route>

            {/* Public Website Routes */}
            <Route element={<WebsiteLayout />}>
              <Route path="/" element={<LandingView />} />
              <Route path="/browse" element={<BrowseView />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/contact" element={<ContactView />} />
              <Route path="/listing/:id" element={<ListingView />} />
              <Route path="/careers" element={<CareersView />} />
              <Route path="/trust-safety" element={<TrustSafetyView />} />
              <Route path="/cancellation-options" element={<CancellationOptionsView />} />
              <Route path="/host-protection" element={<HostProtectionView />} />
              <Route path="/how-booking-works" element={<HowBookingWorksView />} />
              <Route path="/pricing-payouts" element={<PricingPayoutsView />} />
              <Route path="/support" element={<SupportView />} />
            </Route>

            {/* Protected Dashboard Routes (Hotel Managers, Admins, Homeowners, Receptionists) */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'HOMEOWNER', 'APARTMENT_ADMIN', 'RECEPTIONIST', 'GUEST_HOUSE_ADMIN']} />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="rooms" element={<RoomsView />} />
                <Route path="guests" element={<GuestsView />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="properties" element={<PropertiesView />} />
                <Route path="staff" element={<StaffView />} />
                <Route path="messages" element={<MessagesView />} />
                <Route path="buildings" element={<ApartmentBuildingsView />} />
                <Route path="units" element={<ApartmentUnitsView />} />
                <Route path="tenants" element={<TenantsView />} />
                <Route path="maintenance" element={<MaintenanceView />} />
                <Route path="rent-roll" element={<RentRollView />} />
                
                {/* Homeowner Routes */}
                <Route path="my-properties" element={<HomeownerMyPropertiesView />} />
                <Route path="rent-collection" element={<HomeownerRentCollectionView />} />
                <Route path="leases" element={<HomeownerLeasesView />} />
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
