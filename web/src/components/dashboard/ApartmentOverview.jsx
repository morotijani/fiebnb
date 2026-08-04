import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DoorOpen, KeyRound, Banknote, Wrench, Plus, Droplet, Zap, PaintRoller } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';

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
      <div className="space-y-6 animate-pulse">
        <div className="dash-topbar">
          <div>
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="stat-grid">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{color: 'var(--brick-deep)', borderColor: 'var(--brick-pale)'}}>
        Error loading apartment dashboard data. Ensure the backend is running.
      </div>
    );
  }

  // Map icon names to components
  const IconMap = {
    'droplet': <Droplet size={18} stroke="var(--ink)" />,
    'zap': <Zap size={18} stroke="var(--ink)" />,
    'paint-roller': <PaintRoller size={18} stroke="var(--ink)" />
  };

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p>Here's how your apartment portfolio is performing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openWalkInModal()}><Plus size={16} /> Add a building</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic"><DoorOpen size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">{summary?.portfolioList?.length || 0} buildings</span>
          </div>
          <b>{summary?.totalUnits || 0}</b>
          <span>Total units</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><KeyRound size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta" style={{background: 'var(--sand)', color: 'var(--ink)'}}>Current</span>
          </div>
          <b>{summary?.totalUnits ? Math.round((summary.occupiedUnits / summary.totalUnits) * 100) : 0}%</b>
          <span>Occupied units</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Banknote size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">This month</span>
          </div>
          <b>₵{(summary?.rentCollected || 0).toLocaleString()}</b>
          <span>Rent collected</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Wrench size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta" style={{background: '#FEE2E2', color: '#991B1B'}}>Action needed</span>
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
          <div style={{color: 'var(--ink-soft)', padding: '20px 0'}}>You haven't added any buildings yet.</div>
        ) : (
          <div className="portfolio-grid">
            {summary?.portfolioList?.map(bldg => (
              <div className="portfolio-card" key={bldg.id}>
                <img src={bldg.image} alt={bldg.title} />
                <div className="body">
                  <h3>{bldg.title}</h3>
                  <p>{bldg.location} &middot; {bldg.units} units</p>
                  <div className="portfolio-meta">
                    <span>Occupancy<b>{bldg.occupancy}%</b></span>
                    <span>Monthly rent<b>₵{bldg.monthlyRent.toLocaleString()}</b></span>
                  </div>
                  <div className="occ-bar"><span style={{width: `${bldg.occupancy}%`}}></span></div>
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
            {summary?.leaseExpirations?.map(lease => (
              <div className="timeline-row" key={lease.id}>
                <div className="timeline-date"><b>{lease.date}</b><span>{lease.month}</span></div>
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
          {summary?.maintenanceQueue?.map(ticket => (
            <div className="ticket-row" key={ticket.id}>
              <div className="ic">{IconMap[ticket.type] || <Wrench size={18} stroke="var(--ink)" />}</div>
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
            {summary?.rentRoll?.map(row => (
              <tr key={row.id}>
                <td>{row.unit}</td>
                <td>{row.building}</td>
                <td>{row.tenant}</td>
                <td>{row.rent}</td>
                <td><span className={`status ${row.status}`}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
