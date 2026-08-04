import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WebsiteNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <div className="nav-row">
        <Link to="/" className="logo">
          <span className="mark">
            <span className="weave-strip">
              <span></span><span></span><span></span><span></span>
            </span>
          </span>
          Fiebnb
        </Link>
        <div className="nav-links">
          <Link to="/browse" className="active">Stays</Link>
          <Link to="/browse?type=hotel">Hotels</Link>
          <Link to="/browse?type=long-term">Long-term rentals</Link>
          <Link to={user ? "/dashboard" : "/register"}>Become a host</Link>
        </div>
        <div className="nav-actions">
          <Link to={user ? "/dashboard" : "/register"} className="btn btn-ghost btn-sm">List your property</Link>
          <button className="icon-btn" aria-label="Search" onClick={() => navigate('/browse')}>
            <Search size={17} />
          </button>
          <button className="icon-btn" aria-label="Account" onClick={() => navigate(user ? '/dashboard' : '/login')}>
            <User size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default WebsiteNavbar;
