import DashboardLayout from '@/components/DashboardLayout';
import CalendarGrid from '@/components/CalendarGrid';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room Availability</h1>
        <p className="text-gray-500 mt-1">Manage walk-ins and app bookings for the current week.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Rooms</div>
          <div className="text-3xl font-bold text-gray-900">12</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Available Today</div>
          <div className="text-3xl font-bold text-green-600">5</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Walk-ins This Week</div>
          <div className="text-3xl font-bold text-amber-600">8</div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <CalendarGrid />
    </DashboardLayout>
  );
}
