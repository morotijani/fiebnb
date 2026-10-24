import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../../components/common/MatIcon';

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/stats');
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load statistics</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: 'group', color: '#0866FF', bg: '#E7F3FF' },
    { label: 'Total Properties', value: stats?.totalProperties || 0, icon: 'home', color: '#31A24C', bg: '#E7F8ED' },
    { label: 'Pending Requests', value: stats?.pendingRequests || 0, icon: 'assignment', color: '#F7B125', bg: '#FFF4E5' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="dash-topbar" style={{ marginBottom: '24px' }}>
        <div>
          <h1>System Overview</h1>
          <p>Welcome to the Fiebnb System Administration Dashboard.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="lbl">{stat.label}</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MatIcon name={stat.icon} size={22} />
              </div>
            </div>
            <div className="val">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Placeholder for more widgets */}
      <div className="panel" style={{ minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fb-text-secondary)', textAlign: 'center' }}>
        <p>System activity charts and recent events will appear here.</p>
      </div>
    </div>
  );
}
