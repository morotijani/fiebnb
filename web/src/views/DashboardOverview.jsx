import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ArrowUpRight, ArrowDownRight, TrendingUp, Users, Wallet } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import FrontDeskQueue from '../components/dashboard/FrontDeskQueue';
import ApartmentOverview from '../components/dashboard/ApartmentOverview';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { openBookingSidebar, openWalkInModal } = useDashboard();

  if (user?.role === 'HOMEOWNER') {
    return <ApartmentOverview />;
  }

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/summary');
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
        Error loading dashboard data. Ensure the backend is running.
      </div>
    );
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Welcome back, Host</h1>
          <p>Here's what's happening with your properties today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openWalkInModal()}>+ New reservation</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Wallet size={17} stroke="var(--brick-deep)" /></div>
            {summary?.revenueGrowth !== undefined && (
              <div className="delta" style={{
                color: summary.revenueGrowth >= 0 ? 'var(--forest-deep)' : 'var(--brick-deep)', 
                background: summary.revenueGrowth >= 0 ? '#E1EAE0' : 'var(--brick-pale)'
              }}>
                {summary.revenueGrowth >= 0 ? (
                  <ArrowUpRight size={12} style={{display:'inline', marginBottom:'2px'}}/>
                ) : (
                  <ArrowDownRight size={12} style={{display:'inline', marginBottom:'2px'}}/>
                )}
                {' '}{Math.abs(summary.revenueGrowth).toFixed(0)}%
              </div>
            )}
          </div>
          <b>₵{(summary?.todaysRevenue || 0).toLocaleString()}</b>
          <span>Earnings today</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><CalendarDays size={17} stroke="var(--brick-deep)" /></div>
          </div>
          <b>{summary?.checkInsToday || 0}</b>
          <span>Check-ins today</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><TrendingUp size={17} stroke="var(--brick-deep)" /></div>
          </div>
          <b>86%</b>
          <span>Occupancy rate</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Users size={17} stroke="var(--brick-deep)" /></div>
          </div>
          <b>{summary?.availableRooms || 0}</b>
          <span>Available rooms</span>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Current & Upcoming Guests</h2>
            <a href="dashboard/calendar" style={{fontSize: '13px', fontWeight: '600', color: 'var(--ink)'}}>View calendar</a>
          </div>
          
          {summary?.recentActivity?.length === 0 ? (
             <div style={{color: 'var(--ink-soft)', padding: '20px 0'}}>No guests currently.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Date & Time</th>
                  <th>Property / Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentActivity?.slice(0, 3).map(activity => (
                  <tr key={activity.id} onClick={() => openBookingSidebar(activity.id)} style={{cursor: 'pointer'}} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <div>
                        <b>{activity.guest_name}</b>
                        <span style={{display: 'block', fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px'}}>{activity.action}</span>
                      </div>
                    </td>
                    <td>
                      <b style={{fontSize:'14.5px'}}>{new Date(activity.timestamp).toLocaleDateString()}</b><br/>
                      <span style={{fontSize:'12.5px', color:'var(--ink-soft)'}}>
                        {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td>
                      <b style={{fontSize:'14.5px'}}>{activity.property_name}</b><br/>
                      <span style={{fontSize:'12.5px', color:'var(--ink-soft)'}}>Room {activity.room_number || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span className={`status ${activity.status === 'CONFIRMED' ? 'live' : 'pending'}`}>
                        {activity.status === 'CONFIRMED' ? 'Hosting' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          {user?.role === 'HOTEL_MANAGER' || user?.role === 'GUESTHOUSE_MANAGER' ? (
            <>
              <div className="panel-head">
                <h2>Front Desk Queue</h2>
              </div>
              <FrontDeskQueue />
            </>
          ) : (
            <>
              <div className="panel-head">
                <h2>Requests</h2>
              </div>
              {/* Mocked requests for layout */}
              <div className="req-card">
                <img src="https://picsum.photos/seed/r1/100/100" alt="" />
                <div className="info">
                  <b>Kofi Asante</b>
                  <span>Requested 3 nights · East Legon</span>
                </div>
              </div>
              <div className="req-card">
                <img src="https://picsum.photos/seed/r2/100/100" alt="" />
                <div className="info">
                  <b>Ama Mensah</b>
                  <span>Requested 1 month · Kumasi</span>
                </div>
              </div>
              <a href="#" className="btn btn-outline btn-block" style={{marginTop:'18px'}}>View all requests</a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
