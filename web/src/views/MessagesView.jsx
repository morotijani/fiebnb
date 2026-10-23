import React from 'react';
import { MessageCircle, Search } from 'lucide-react';

export default function MessagesView() {
  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>Messages</h1>
          <p>Communicate directly with your tenants and prospective guests.</p>
        </div>
      </div>

      <div className="panel" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <MessageCircle size={28} stroke="var(--brick-deep)" />
        </div>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>No messages yet</h2>
        <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', fontSize: '14px', lineHeight: '1.5' }}>
          When tenants send maintenance inquiries or message you about their lease agreements, their conversations will appear here.
        </p>
      </div>
    </div>
  );
}
