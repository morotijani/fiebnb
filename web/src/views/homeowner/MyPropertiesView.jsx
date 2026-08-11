import React from 'react';

export default function MyPropertiesView() {
  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>My properties</h1>
          <p>Manage your standalone long-term rental properties.</p>
        </div>
        <button className="btn btn-primary">Add a property</button>
      </div>
      <div className="panel">
        <p style={{color: 'var(--ink-soft)'}}>Property listing functionality coming soon...</p>
      </div>
    </div>
  );
}
