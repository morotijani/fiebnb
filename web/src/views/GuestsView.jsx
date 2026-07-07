import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function GuestsView() {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      const res = await axiosClient.get('/bookings/all');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-white rounded-xl border border-red-200 shadow-sm">
        Error loading guests list. Ensure the backend is running.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'CONFIRMED': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">CONFIRMED</span>;
      case 'PENDING': return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">PENDING</span>;
      case 'COMPLETED': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">COMPLETED</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">CANCELLED</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Guests & Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all your incoming, current, and past guests.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4">Guest Info</th>
                <th className="p-4">Property / Room</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              )}
              {bookings?.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">
                      {booking.guest ? booking.guest.name : 'Walk-In Guest'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {booking.guest ? booking.guest.phone_number : 'N/A'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-800 text-sm">{booking.property?.title || 'Unknown Property'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Room {booking.room?.room_number || 'Unassigned'}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(booking.check_in).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(booking.check_out).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="p-4 text-right font-medium text-slate-800">
                    ${booking.total_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
