import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Users, Home, ClipboardList } from 'lucide-react';

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
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Properties', value: stats?.totalProperties || 0, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Pending Requests', value: stats?.pendingRequests || 0, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-1 text-sm">Welcome to the Fiebnb System Administration Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for more widgets */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
        <p>System activity charts and recent events will appear here.</p>
      </div>
    </div>
  );
}
