import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import MatIcon from '../common/MatIcon';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isApartment = user?.role === 'APARTMENT_ADMIN';
  const isHomeowner = user?.role === 'HOMEOWNER';

  if (isHomeowner) {
    return (
      <aside className="dash-side">
        <Link to="/" className="logo">
          <span className="mark">
            <MatIcon name="home_work" size={20} />
          </span>
          Fiebnb
        </Link>

        <nav className="dash-nav">
          <div className="grp-label">Manage</div>
          <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="dashboard" size={20} /> Overview
          </NavLink>
          <NavLink to="/dashboard/my-properties" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="home" size={20} /> My properties
          </NavLink>
          <NavLink to="/dashboard/tenants" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="group" size={20} /> Tenants
          </NavLink>
          <NavLink to="/dashboard/leases" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="description" size={20} /> Lease agreements
          </NavLink>

          <div className="grp-label">Money</div>
          <NavLink to="/dashboard/rent-collection" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="payments" size={20} /> Rent collection
          </NavLink>
          <NavLink to="/dashboard/maintenance" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="build" size={20} /> Maintenance
          </NavLink>

          <div className="grp-label">Account</div>
          <NavLink to="/dashboard/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="chat" size={20} /> Messages
          </NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="settings" size={20} /> Settings
          </NavLink>

          <button onClick={logout} className="dash-nav-btn" title="Sign out">
            <MatIcon name="logout" size={20} /> Sign out
          </button>
        </nav>

        <div className="bottom">
          <Link to="/guest" className="switch-guest">
            <MatIcon name="swap_horiz" size={18} /> Switch to guest mode
          </Link>
        </div>
      </aside>
    );
  }

  if (isApartment) {
    return (
      <aside className="dash-side">
        <Link to="/" className="logo">
          <span className="mark">
            <MatIcon name="apartment" size={20} />
          </span>
          Fiebnb
        </Link>

        <nav className="dash-nav">
          <div className="grp-label">Manage</div>
          <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="dashboard" size={20} /> Overview
          </NavLink>
          <NavLink to="/dashboard/buildings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="apartment" size={20} /> Buildings
          </NavLink>
          <NavLink to="/dashboard/units" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="meeting_room" size={20} /> Units
          </NavLink>
          <NavLink to="/dashboard/tenants" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="group" size={20} /> Tenants
          </NavLink>

          <div className="grp-label">Operations</div>
          <NavLink to="/dashboard/maintenance" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="build" size={20} /> Maintenance
          </NavLink>
          <NavLink to="/dashboard/rent-roll" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="receipt_long" size={20} /> Rent roll
          </NavLink>

          <div className="grp-label">Account</div>
          <NavLink to="/dashboard/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="chat" size={20} /> Messages
          </NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="settings" size={20} /> Settings
          </NavLink>

          <button onClick={logout} className="dash-nav-btn" title="Sign out">
            <MatIcon name="logout" size={20} /> Sign out
          </button>
        </nav>

        <div className="bottom">
          <Link to="/guest" className="switch-guest">
            <MatIcon name="swap_horiz" size={18} /> Switch to guest mode
          </Link>
        </div>
      </aside>
    );
  }

  // Default for Hotel Managers, Guesthouse Admins, General Admins
  return (
    <aside className="dash-side">
      <Link to="/" className="logo">
        <span className="mark">
          <MatIcon name="hotel" size={20} />
        </span>
        Fiebnb
      </Link>

      <nav className="dash-nav">
        <div className="grp-label">Manage</div>
        <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="dashboard" size={20} /> Overview
        </NavLink>
        <NavLink to="/dashboard/rooms" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="bed" size={20} /> My listings
        </NavLink>
        <NavLink to="/dashboard/calendar" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="calendar_month" size={20} /> Calendar
        </NavLink>
        <NavLink to="/dashboard/guests" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="inbox" size={20} /> Booking requests
        </NavLink>

        <div className="grp-label">Grow</div>
        <NavLink to="/dashboard/payouts" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="account_balance_wallet" size={20} /> Payouts
        </NavLink>
        <NavLink to="/dashboard/insights" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="bar_chart" size={20} /> Insights
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/dashboard/properties" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MatIcon name="domain" size={20} /> Properties
          </NavLink>
        )}
        <NavLink to="/dashboard/staff" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="badge" size={20} /> Staff
        </NavLink>
        <NavLink to="/dashboard/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="chat" size={20} /> Messages
        </NavLink>

        <div className="grp-label">Account</div>
        <NavLink to="/dashboard/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="settings" size={20} /> Settings
        </NavLink>
        <NavLink to="/dashboard/support" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MatIcon name="help" size={20} /> Support
        </NavLink>
        <button onClick={logout} className="dash-nav-btn" title="Sign out">
          <MatIcon name="logout" size={20} /> Sign out
        </button>
      </nav>

      <div className="bottom">
        <Link to="/guest" className="switch-guest">
          <MatIcon name="swap_horiz" size={18} /> Switch to guest mode
        </Link>
      </div>
    </aside>
  );
}
