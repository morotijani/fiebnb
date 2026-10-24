import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MatIcon from '../components/common/MatIcon';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import FrontDeskQueue from '../components/dashboard/FrontDeskQueue';
import ApartmentOverview from '../components/dashboard/ApartmentOverview';
import HomeownerOverview from '../components/dashboard/HomeownerOverview';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { openBookingSidebar, openWalkInModal } = useDashboard();

  if (user?.role === 'APARTMENT_ADMIN') {
    return <ApartmentOverview />;
  }

  if (user?.role === 'HOMEOWNER') {
    return <HomeownerOverview />;
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
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ color: '#E41E3F', padding: '24px' }}>
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
        <button className="btn btn-primary" onClick={() => openWalkInModal()}>
          <MatIcon name="add" size={18} /> New reservation
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="payments" size={22} />
            </div>
            {summary?.revenueGrowth !== undefined && (
              <div
                className="delta"
                style={{
                  color: summary.revenueGrowth >= 0 ? 'var(--fb-success-text)' : 'var(--fb-danger-text)',
                  background: summary.revenueGrowth >= 0 ? 'var(--fb-success-bg)' : 'var(--fb-danger-bg)'
                }}
              >
                <MatIcon
                  name={summary.revenueGrowth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                  size={13}
                  style={{ marginRight: '2px' }}
                />
                {Math.abs(summary.revenueGrowth).toFixed(0)}%
              </div>
            )}
          </div>
          <b>GH₵{(summary?.todaysRevenue || 0).toLocaleString()}</b>
          <span>Earnings today</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="calendar_month" size={22} />
            </div>
            <span className="delta">Today</span>
          </div>
          <b>{summary?.checkInsToday || 0}</b>
          <span>Check-ins today</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="trending_up" size={22} />
            </div>
            <span className="delta">Occupancy</span>
          </div>
          <b>86%</b>
          <span>Occupancy rate</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="group" size={22} />
            </div>
            <span className="delta">Capacity</span>
          </div>
          <b>{summary?.availableRooms || 0}</b>
          <span>Available rooms</span>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Current &amp; Upcoming Guests</h2>
            <a href="dashboard/calendar" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fb-primary)' }}>
              View calendar
            </a>
          </div>
          
          {summary?.recentActivity?.length === 0 ? (
            <div style={{ color: 'var(--fb-text-secondary)', padding: '20px 0' }}>No guests currently.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Date &amp; Time</th>
                  <th>Property / Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentActivity?.slice(0, 5).map((activity) => (
                  <tr
                    key={activity.id}
                    onClick={() => openBookingSidebar(activity.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div>
                        <b>{activity.guest_name}</b>
                        <span style={{ display: 'block', fontSize: '12.5px', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>
                          {activity.action}
                        </span>
                      </div>
                    </td>
                    <td>
                      <b style={{ fontSize: '14px' }}>{new Date(activity.timestamp).toLocaleDateString()}</b>
                      <br />
                      <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <b style={{ fontSize: '14px' }}>{activity.property_name}</b>
                      <br />
                      <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>
                        Room {activity.room_number || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${activity.status === 'CONFIRMED' ? 'paid' : 'due'}`}>
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
                <h2>Booking Requests</h2>
              </div>
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
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>
                View all requests
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
