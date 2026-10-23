import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Banknote, KeyRound, CalendarClock, Wrench, Droplet, Zap, Wind, DoorClosed, Paintbrush, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const IconMap = {
  plumbing: <Droplet size={18} stroke="var(--ink)" />,
  droplet: <Droplet size={18} stroke="var(--ink)" />,
  electrical: <Zap size={18} stroke="var(--ink)" />,
  zap: <Zap size={18} stroke="var(--ink)" />,
  appliance: <Wind size={18} stroke="var(--ink)" />,
  wind: <Wind size={18} stroke="var(--ink)" />,
  general: <DoorClosed size={18} stroke="var(--ink)" />,
  'paint-roller': <Paintbrush size={18} stroke="var(--ink)" />,
  paint: <Paintbrush size={18} stroke="var(--ink)" />
};

export default function HomeownerOverview() {
  const { user } = useAuth();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['homeownerSummary'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/homeowner-summary');
      return res.data;
    }
  });

  if (isLoading) return <div className="dash-main">Loading dashboard...</div>;
  if (error) return <div className="dash-main text-red-500">Failed to load dashboard data</div>;

  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p>Here's how your rental properties are performing.</p>
        </div>
        <Link to="/dashboard/my-properties" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Plus size={16} />
          Add a property
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Banknote size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">This month</span>
          </div>
          <b>GH₵{(summary?.rentCollected || 0).toLocaleString()}</b>
          <span>Rent collected</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><KeyRound size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">{summary?.occupancyRate || 0}%</span>
          </div>
          <b>{summary?.occupiedUnits || 0} / {summary?.totalUnits || 0}</b>
          <span>Units occupied</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><CalendarClock size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Next 60 days</span>
          </div>
          <b>{summary?.leaseRenewalsCount || 0}</b>
          <span>Lease renewals coming up</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Wrench size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">{summary?.urgentMaintenanceCount || 0} urgent</span>
          </div>
          <b>{summary?.openMaintenanceCount || 0}</b>
          <span>Open maintenance requests</span>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Your properties</h2>
            <Link to="/dashboard/my-properties" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
              Manage all
            </Link>
          </div>
          {summary?.portfolioList?.length === 0 ? (
            <div style={{color: 'var(--ink-soft)', padding: '20px 0'}}>You haven't added any properties yet.</div>
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
                {summary?.portfolioList?.map(prop => (
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
                    <td>{prop.rent}</td>
                    <td>
                      <span className={`status ${prop.status}`}>
                        {prop.statusLabel || (prop.status.charAt(0).toUpperCase() + prop.status.slice(1))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Lease renewals</h2></div>
          <div className="timeline-list">
            {summary?.leaseExpirations?.length === 0 ? (
              <div style={{color: 'var(--ink-soft)', padding: '10px 0'}}>No upcoming renewals.</div>
            ) : (
              summary?.leaseExpirations?.map(lease => (
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
          <Link to="/dashboard/maintenance" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
            View all
          </Link>
        </div>
        {summary?.maintenanceQueue?.length === 0 ? (
          <div style={{color: 'var(--ink-soft)', padding: '10px 0'}}>No open maintenance requests.</div>
        ) : (
          summary?.maintenanceQueue?.map(ticket => (
            <div className="ticket-row" key={ticket.id}>
              <div className="ic">
                {IconMap[ticket.type] || <Wrench size={18} stroke="var(--ink)" />}
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
