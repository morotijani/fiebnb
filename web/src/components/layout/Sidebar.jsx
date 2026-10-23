import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  Inbox,
  Wallet,
  BarChart3,
  MessageCircle,
  Settings,
  CircleHelp,
  Repeat,
  LogOut,
  Building,
  Building2,
  DoorOpen,
  Users,
  Wrench,
  FileText,
  Banknote,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isApartment = user?.role === 'APARTMENT_ADMIN';
  const isHomeowner = user?.role === 'HOMEOWNER';
  const location = useLocation();

  if (isHomeowner) {
    return (
      <aside className="dash-side">
        <Link to="/" className="logo">
          <span className="mark"><span className="weave-strip"><span></span><span></span><span></span><span></span></span></span>
          Fiebnb
        </Link>

        <nav className="dash-nav">
          <div className="grp-label">Manage</div>
          <NavLink to="/dashboard" end className={({isActive}) => isActive ? "active" : ""}>
            <LayoutDashboard /> Overview
          </NavLink>
          <NavLink to="/dashboard/my-properties" className={({isActive}) => isActive ? "active" : ""}>
            <Home /> My properties
          </NavLink>
          <NavLink to="/dashboard/tenants" className={({isActive}) => isActive ? "active" : ""}>
            <Users /> Tenants
          </NavLink>
          <NavLink to="/dashboard/leases" className={({isActive}) => isActive ? "active" : ""}>
            <FileText /> Lease agreements
          </NavLink>

          <div className="grp-label">Money</div>
          <NavLink to="/dashboard/rent-collection" className={({isActive}) => isActive ? "active" : ""}>
            <Banknote /> Rent collection
          </NavLink>
          <NavLink to="/dashboard/maintenance" className={({isActive}) => isActive ? "active" : ""}>
            <Wrench /> Maintenance
          </NavLink>

          <div className="grp-label">Account</div>
          <NavLink to="/dashboard/messages" className={({isActive}) => isActive ? "active" : ""}>
            <MessageCircle /> Messages
          </NavLink>
          <NavLink to="/dashboard/settings" className={({isActive}) => isActive ? "active" : ""}>
            <Settings /> Settings
          </NavLink>

          <button onClick={logout} style={{background:'none', border:'none', cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit'}} className="dash-nav-btn">
            <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'12px', fontSize:'14.5px', color:'rgba(250,246,239,0.72)', fontWeight:'500', marginBottom:'2px'}}>
              <LogOut size={17} /> Sign out
            </div>
          </button>
        </nav>

        <div className="bottom">
          <Link to="/guest" className="switch-guest">
            <Repeat style={{width:'15px',height:'15px'}} /> Switch to guest mode
          </Link>
        </div>
      </aside>
    );
  }

  if (isApartment) {
    return (
      <aside className="dash-side">
        <Link to="/" className="logo">
          <span className="mark"><span className="weave-strip"><span></span><span></span><span></span><span></span></span></span>
          Fiebnb
        </Link>

        <nav className="dash-nav">
          <div className="grp-label">Manage</div>
          <NavLink to="/dashboard" end className={({isActive}) => isActive ? "active" : ""}>
            <LayoutDashboard /> Overview
          </NavLink>
          <NavLink to="/dashboard/buildings" className={({isActive}) => isActive ? "active" : ""}>
            <Building2 /> Buildings
          </NavLink>
          <NavLink to="/dashboard/units" className={({isActive}) => isActive ? "active" : ""}>
            <DoorOpen /> Units
          </NavLink>
          <NavLink to="/dashboard/tenants" className={({isActive}) => isActive ? "active" : ""}>
            <Users /> Tenants
          </NavLink>

          <div className="grp-label">Operations</div>
          <NavLink to="/dashboard/maintenance" className={({isActive}) => isActive ? "active" : ""}>
            <Wrench /> Maintenance
          </NavLink>
          <NavLink to="/dashboard/rent-roll" className={({isActive}) => isActive ? "active" : ""}>
            <Receipt /> Rent roll
          </NavLink>

          <div className="grp-label">Account</div>
          <NavLink to="/dashboard/messages" className={({isActive}) => isActive ? "active" : ""}>
            <MessageCircle /> Messages
          </NavLink>
          <NavLink to="/dashboard/settings" className={({isActive}) => isActive ? "active" : ""}>
            <Settings /> Settings
          </NavLink>

          <button onClick={logout} style={{background:'none', border:'none', cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit'}} className="dash-nav-btn">
            <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'12px', fontSize:'14.5px', color:'rgba(250,246,239,0.72)', fontWeight:'500', marginBottom:'2px'}}>
              <LogOut size={17} /> Sign out
            </div>
          </button>
        </nav>

        <div className="bottom">
          <Link to="/guest" className="switch-guest">
            <Repeat style={{width:'15px',height:'15px'}} /> Switch to guest mode
          </Link>
        </div>
      </aside>
    );
  }

  // Default for Hotel Managers, Guesthouse Admins, General Admins
  return (
    <aside className="dash-side">
      <Link to="/" className="logo">
        <span className="mark"><span className="weave-strip"><span></span><span></span><span></span><span></span></span></span>
        Fiebnb
      </Link>

      <nav className="dash-nav">
        <div className="grp-label">Manage</div>
        <NavLink to="/dashboard" end className={({isActive}) => isActive ? "active" : ""}>
          <LayoutDashboard /> Overview
        </NavLink>
        <NavLink to="/dashboard/rooms" className={({isActive}) => isActive ? "active" : ""}>
          <Home /> My listings
        </NavLink>
        <NavLink to="/dashboard/calendar" className={({isActive}) => isActive ? "active" : ""}>
          <CalendarDays /> Calendar
        </NavLink>
        <NavLink to="/dashboard/guests" className={({isActive}) => isActive ? "active" : ""}>
          <Inbox /> Booking requests
        </NavLink>

        <div className="grp-label">Grow</div>
        <NavLink to="/dashboard/payouts" className={({isActive}) => isActive ? "active" : ""}>
          <Wallet /> Payouts
        </NavLink>
        <NavLink to="/dashboard/insights" className={({isActive}) => isActive ? "active" : ""}>
          <BarChart3 /> Insights
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/dashboard/properties" className={({isActive}) => isActive ? "active" : ""}>
            <Building /> Properties
          </NavLink>
        )}
        <NavLink to="/dashboard/staff" className={({isActive}) => isActive ? "active" : ""}>
          <Users /> Staff
        </NavLink>
        <NavLink to="/dashboard/messages" className={({isActive}) => isActive ? "active" : ""}>
          <MessageCircle /> Messages
        </NavLink>

        <div className="grp-label">Account</div>
        <NavLink to="/dashboard/settings" className={({isActive}) => isActive ? "active" : ""}>
          <Settings /> Settings
        </NavLink>
        <NavLink to="/dashboard/support" className={({isActive}) => isActive ? "active" : ""}>
          <CircleHelp /> Support
        </NavLink>
        <button onClick={logout} style={{background:'none', border:'none', cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit'}} className="dash-nav-btn">
          <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'12px', fontSize:'14.5px', color:'rgba(250,246,239,0.72)', fontWeight:'500', marginBottom:'2px'}}>
            <LogOut size={17} /> Sign out
          </div>
        </button>
      </nav>

      <div className="bottom">
        <Link to="/guest" className="switch-guest">
          <Repeat style={{width:'15px',height:'15px'}} /> Switch to guest mode
        </Link>
      </div>
    </aside>
  );
}
