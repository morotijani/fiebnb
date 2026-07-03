import FrontDeskQueue from '../components/dashboard/FrontDeskQueue';

export default function DashboardOverview() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h2>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening at your property today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Today's Check-ins</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Available Rooms</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Today's Revenue</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₵4,250</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <p>No recent activity to display.</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Front Desk Queue</h3>
          <FrontDeskQueue />
        </div>
      </div>
    </div>
  );
}
