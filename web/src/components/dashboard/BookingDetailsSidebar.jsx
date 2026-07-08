import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../../context/DashboardContext';
import { format } from 'date-fns';

export default function BookingDetailsSidebar() {
  const { isBookingSidebarOpen, selectedBookingId, closeBookingSidebar } = useDashboard();
  const queryClient = useQueryClient();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['bookingDetails', selectedBookingId],
    queryFn: async () => {
      if (!selectedBookingId) return null;
      const res = await fetch(`http://localhost:3000/api/bookings/${selectedBookingId}`, {
        headers: { Authorization: 'Bearer dummy-token' }
      });
      if (!res.ok) throw new Error('Failed to fetch booking details');
      return await res.json();
    },
    enabled: !!selectedBookingId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await fetch(`http://localhost:3000/api/bookings/${selectedBookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dummy-token'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh the sidebar and the timelines/queues
      queryClient.invalidateQueries(['bookingDetails', selectedBookingId]);
      queryClient.invalidateQueries(['timeline']);
      queryClient.invalidateQueries(['todayBookings']);
    }
  });

  const handleStatusUpdate = (newStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <>
      {/* Backdrop */}
      {isBookingSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeBookingSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isBookingSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Booking Details</h2>
          <button 
            onClick={closeBookingSidebar}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-100 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg border border-red-100">
              Error loading booking details.
            </div>
          ) : booking ? (
            <div className="space-y-6">
              
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                  booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {booking.status}
                </span>
              </div>

              {/* Guest Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Guest</h3>
                <p className="text-lg font-bold text-slate-800">{booking.guest?.name || 'Walk-in Guest'}</p>
                {booking.guest?.phone && <p className="text-sm text-slate-600 mt-1">{booking.guest.phone}</p>}
                {booking.guest?.email && <p className="text-sm text-slate-600 mt-1">{booking.guest.email}</p>}
              </div>

              {/* Room & Dates */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Room</h3>
                  <p className="text-base font-medium text-slate-800">{booking.room?.room_number || 'TBD'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Check-In</h3>
                    <p className="text-base font-medium text-slate-800">{format(new Date(booking.check_in), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Check-Out</h3>
                    <p className="text-base font-medium text-slate-800">{format(new Date(booking.check_out), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Details</h3>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="text-lg font-bold text-slate-800">₵{booking.total_amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Method</span>
                  <span className="text-sm font-medium text-slate-700">{booking.payment_method || 'N/A'}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-slate-500 text-sm">Select a booking to view details.</div>
          )}
        </div>

        {/* Footer Actions */}
        {booking && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
            {booking.status === 'PENDING' && (
              <>
                <button 
                  onClick={() => handleStatusUpdate('CONFIRMED')}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Confirm Booking
                </button>
                <button 
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Cancel Booking
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <button 
                onClick={() => handleStatusUpdate('COMPLETED')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                Complete / Check-Out
              </button>
            )}

            {booking.status === 'BLOCKED' && (
              <button 
                onClick={() => handleStatusUpdate('CANCELLED')}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                Release Block
              </button>
            )}
            
            {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
              <div className="text-center text-sm font-medium text-slate-500">
                This booking is {booking.status.toLowerCase()}.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
