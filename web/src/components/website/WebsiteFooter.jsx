import React from 'react';
import { Link } from 'react-router-dom';

const WebsiteFooter = () => {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ color: 'var(--white)' }}>
              <span className="mark">
                <span className="weave-strip">
                  <span></span><span></span><span></span><span></span>
                </span>
              </span>
              Fiebnb
            </Link>
            <p>Ghana's marketplace for hotels, guesthouses and long-term rentals — built for how Ghanaians and visitors actually find a place to stay.</p>
          </div>
          <div>
            <h4>Guests</h4>
            <Link to="/browse">Browse stays</Link>
            <Link to="/how-booking-works">How booking works</Link>
            <Link to="/trust-safety">Trust & safety</Link>
            <Link to="/cancellation-options">Cancellation options</Link>
          </div>
          <div>
            <h4>Hosts</h4>
            <Link to="/register">List your property</Link>
            <Link to="/dashboard">Host dashboard</Link>
            <Link to="/pricing-payouts">Pricing & payouts</Link>
            <Link to="/host-protection">Host protection</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About Fiebnb</Link>
            <Link to="/careers">Careers</Link>
            <a href="#">Support (WhatsApp)</a>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Fiebnb Ghana. All rights reserved.</span>
          <span>Accra · Kumasi · Takoradi · Cape Coast · Tamale</span>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;
