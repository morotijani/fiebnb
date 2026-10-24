import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MatIcon from '../common/MatIcon';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';

function getTicketIcon(type) {
  const t = (type || '').toLowerCase();
  if (t === 'droplet' || t === 'plumbing') {
    return <MatIcon name="water_drop" size={20} style={{ color: '#0284C7' }} />;
  }
  if (t === 'zap' || t === 'electrical') {
    return <MatIcon name="bolt" size={20} style={{ color: '#D97706' }} />;
  }
  if (t === 'paint-roller' || t === 'paint') {
    return <MatIcon name="format_paint" size={20} style={{ color: '#7C3AED' }} />;
  }
  return <MatIcon name="build" size={20} style={{ color: 'var(--fb-primary)' }} />;
}

export default function ApartmentOverview() {
  const { user } = useAuth();
  const { openWalkInModal } = useDashboard();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['apartmentSummary'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-summary');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading apartment overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: '#E41E3F' }}>
        Error loading apartment dashboard data.
      </div>
    );
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p>Here's how your apartment portfolio is performing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openWalkInModal()}>
          <MatIcon name="add" size={18} /> Add a building
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="apartment" size={22} />
            </div>
            <span className="delta">{summary?.portfolioList?.length || 0} buildings</span>
          </div>
          <b>{summary?.totalUnits || 0}</b>
          <span>Total units</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="key" size={22} />
            </div>
            <span className="delta" style={{ background: 'var(--fb-hover)', color: 'var(--fb-text)' }}>
              Current
            </span>
          </div>
          <b>{summary?.totalUnits ? Math.round((summary.occupiedUnits / summary.totalUnits) * 100) : 0}%</b>
          <span>Occupied units</span>
        </div>
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
            <div className="ic" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              <MatIcon name="build" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              Action needed
            </span>
          </div>
          <b>{summary?.openMaintenanceTickets || 0}</b>
          <span>Open maintenance tickets</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Your buildings</h2>
          <button className="btn btn-outline btn-sm">Manage all</button>
        </div>
        {summary?.portfolioList?.length === 0 ? (
          <div style={{ color: 'var(--fb-text-secondary)', padding: '20px 0' }}>
            You haven't added any buildings yet.
          </div>
        ) : (
          <div className="portfolio-grid">
            {summary?.portfolioList?.map((bldg) => (
              <div className="portfolio-card" key={bldg.id}>
                <img src={bldg.image} alt={bldg.title} />
                <div className="body">
                  <h3>{bldg.title}</h3>
                  <p>{bldg.location} &middot; {bldg.units} units</p>
                  <div className="portfolio-meta">
                    <span>Occupancy<b>{bldg.occupancy}%</b></span>
                    <span>Monthly rent<b>GH₵{bldg.monthlyRent.toLocaleString()}</b></span>
                  </div>
                  <div className="occ-bar"><span style={{ width: `${bldg.occupancy}%` }}></span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><h2>Lease expirations</h2></div>
          <div className="timeline-list">
            {summary?.leaseExpirations?.map((lease) => (
              <div className="timeline-row" key={lease.id}>
                <div className="timeline-date">
                  <b>{lease.date}</b>
                  <span>{lease.month}</span>
                </div>
                <div className="timeline-body">
                  <b>{lease.unit}</b>
                  <p>{lease.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Maintenance queue</h2></div>
          {summary?.maintenanceQueue?.map((ticket) => (
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
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Rent roll</h2>
          <button className="btn btn-outline btn-sm">Download statement</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Unit</th>
              <th>Building</th>
              <th>Tenant</th>
              <th>Rent</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary?.rentRoll?.map((row) => (
              <tr key={row.id}>
                <td style={{ fontWeight: 600 }}>{row.unit}</td>
                <td>{row.building}</td>
                <td>{row.tenant}</td>
                <td style={{ fontWeight: 600 }}>{row.rent}</td>
                <td>
                  <span className={`status ${row.status}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
