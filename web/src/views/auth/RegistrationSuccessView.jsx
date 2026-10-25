import React from 'react';
import { Link } from 'react-router-dom';
import MatIcon from '../../components/common/MatIcon';
import './AuthPages.css';

export default function RegistrationSuccessView() {
  return (
    <div className="auth-split-root">
      <div className="auth-split-container" style={{ gridTemplateColumns: '1fr', maxWidth: '520px' }}>
        <div className="auth-card-pane">
          <div className="auth-card-meta" style={{ textAlign: 'center', padding: '40px 32px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E7F8ED', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MatIcon name="check_circle" size={36} />
              </div>
            </div>
            
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#050505', marginBottom: '10px' }}>
              Registration Successful!
            </h1>
            <p style={{ fontSize: '14.5px', color: '#65676B', lineHeight: '1.55', marginBottom: '28px' }}>
              Your account has been successfully verified. You can now start managing your properties, leases, and bookings from the console.
            </p>

            <Link to="/dashboard" className="auth-btn-primary" style={{ width: '100%' }}>
              <span>Go to Dashboard</span>
              <MatIcon name="arrow_forward" size={18} />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
