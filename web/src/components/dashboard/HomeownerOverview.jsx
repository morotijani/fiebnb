import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MatIcon from '../common/MatIcon';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

function getTicketIcon(type) {
  const t = (type || '').toLowerCase();
  if (t === 'plumbing' || t === 'droplet') {
    return <MatIcon name="water_drop" size={20} style={{ color: '#0284C7' }} />;
  }
  if (t === 'electrical' || t === 'zap') {
    return <MatIcon name="bolt" size={20} style={{ color: '#D97706' }} />;
  }
  if (t === 'appliance' || t === 'wind' || t === 'ac') {
    return <MatIcon name="ac_unit" size={20} style={{ color: '#0D9488' }} />;
  }
  if (t === 'door-closed' || t === 'structural' || t === 'security') {
    return <MatIcon name="door_front" size={20} style={{ color: '#475569' }} />;
  }
  return <MatIcon name="build" size={20} style={{ color: 'var(--fb-primary)' }} />;
}

export default function HomeownerOverview() {
  const { user } = useAuth();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['homeownerSummary'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/homeowner-summary');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading dashboard overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: '#E41E3F' }}>
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div>
      <div className="dash-topbar">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p>Here's how your rental properties are performing.</p>
        </div>
        <Link to="/dashboard/my-properties" className="btn btn-primary">
          <MatIcon name="add" size={18} />
          Add a property
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="payments" size={22} />
            </div>
            <span className="delta">This month</span>
          </div>
          <b>GH₵{(summary?.rentCollected || 0).toLocaleString()}</b>
          <span>Rent collected</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="key" size={22} />
            </div>
            <span className="delta">{summary?.occupancyRate || 0}%</span>
          </div>
          <b>{summary?.occupiedUnits || 0} / {summary?.totalUnits || 0}</b>
          <span>Units occupied</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="event_repeat" size={22} />
            </div>
            <span className="delta">Next 60 days</span>
          </div>
          <b>{summary?.leaseRenewalsCount || 0}</b>
          <span>Lease renewals coming up</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="build" size={22} />
            </div>
            <span
              className="delta"
              style={{
                background: summary?.urgentMaintenanceCount > 0 ? '#FFEBEA' : '#E7F8ED',
                color: summary?.urgentMaintenanceCount > 0 ? '#E41E3F' : '#0F7B40'
              }}
            >
              {summary?.urgentMaintenanceCount || 0} urgent
            </span>
          </div>
          <b style={{ color: summary?.urgentMaintenanceCount > 0 ? '#E41E3F' : 'inherit' }}>
            {summary?.openMaintenanceCount || 0}
          </b>
          <span>Open maintenance requests</span>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Your properties</h2>
            <Link to="/dashboard/my-properties" className="btn btn-outline btn-sm">
              Manage all
            </Link>
          </div>
          {summary?.portfolioList?.length === 0 ? (
            <div style={{ color: 'var(--fb-text-secondary)', padding: '20px 0' }}>
              You haven't added any properties yet.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Rent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.portfolioList?.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <div className="li-row">
                        <img src={prop.image} alt={prop.title} />
                        <div>
                          <b>{prop.title}</b>
                          <span>{prop.location}</span>
                        </div>
                      </div>
                    </td>
                    <td>{prop.tenant}</td>
                    <td style={{ fontWeight: 600 }}>{prop.rent}</td>
                    <td>
                      <span className={`status ${prop.status}`}>
                        {prop.statusLabel || prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Lease renewals</h2>
          </div>
          <div className="timeline-list">
            {summary?.leaseExpirations?.length === 0 ? (
              <div style={{ color: 'var(--fb-text-secondary)', padding: '10px 0' }}>No upcoming renewals.</div>
            ) : (
              summary?.leaseExpirations?.map((lease) => (
                <div className="timeline-row" key={lease.id}>
                  <div className="timeline-date">
                    <b>{lease.date}</b>
                    <span>{lease.month}</span>
                  </div>
                  <div className="timeline-body">
                    <b>{lease.tenant}</b>
                    <p>{lease.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Maintenance requests</h2>
          <Link to="/dashboard/maintenance" className="btn btn-outline btn-sm">
            View all
          </Link>
        </div>
        {summary?.maintenanceQueue?.length === 0 ? (
          <div style={{ color: 'var(--fb-text-secondary)', padding: '10px 0' }}>No open maintenance requests.</div>
        ) : (
          summary?.maintenanceQueue?.map((ticket) => (
            <div className="ticket-row" key={ticket.id}>
              <div className="ic">
                {getTicketIcon(ticket.type)}
              </div>
              <div className="info">
                <b>{ticket.title}</b>
                <span>{ticket.location}</span>
              </div>
              <span className={`status ${ticket.status}`}>
                {ticket.status === 'urgent' ? 'Urgent' : ticket.status === 'due' ? 'In progress' : 'Scheduled'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
