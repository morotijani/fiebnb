import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import FrontDeskQueue from '../components/dashboard/FrontDeskQueue';

export default function DashboardOverview() {
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
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-white rounded-xl border border-red-200 shadow-sm">
        Error loading dashboard data. Ensure the backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h2>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening at your property today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Today's Check-ins</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{summary?.checkInsToday || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Available Rooms</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{summary?.availableRooms || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Today's Revenue</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₵{summary?.todaysRevenue?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          
          {summary?.recentActivity?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <p>No recent activity to display.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 mr-3 ${
                    activity.status === 'CONFIRMED' ? 'bg-emerald-500' : 
                    activity.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {activity.guest_name} <span className="text-slate-500 font-normal">— {activity.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activity.property_name} • Room {activity.room_number || 'Unassigned'} • {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Front Desk Queue</h3>
          <FrontDeskQueue />
        </div>
      </div>
    </div>
  );
}
