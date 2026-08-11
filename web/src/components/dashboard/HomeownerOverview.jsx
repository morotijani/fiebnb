import React from 'react';

export default function HomeownerOverview() {
  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>Welcome back</h1>
          <p>Here's how your rental properties are performing.</p>
        </div>
        <button className="btn btn-primary">Add a property</button>
      </div>
      <div className="panel">
        <p style={{color: 'var(--ink-soft)'}}>Homeowner dashboard functionality coming soon...</p>
      </div>
    </div>
  );
}
