import React from 'react';
import MatIcon from '../components/common/MatIcon';

export default function MessagesView() {
  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Messages</h1>
          <p>Communicate directly with your tenants and prospective guests.</p>
        </div>
      </div>

      <div className="panel" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--fb-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--fb-primary)' }}>
          <MatIcon name="forum" size={32} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fb-text)', marginBottom: '8px' }}>No messages yet</h2>
        <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '420px', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
          When tenants send maintenance inquiries or message you about their lease agreements, their conversations will appear here.
        </p>
      </div>
    </>
  );
}
