import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../../context/DashboardContext';
import { format } from 'date-fns';
import axiosClient from '../../api/axiosClient';

export default function BookingDetailsSidebar() {
  const { isBookingSidebarOpen, selectedBookingId, closeBookingSidebar } = useDashboard();
  const queryClient = useQueryClient();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['bookingDetails', selectedBookingId],
    queryFn: async () => {
      if (!selectedBookingId) return null;
      const res = await axiosClient.get(`/bookings/${selectedBookingId}`);
      return res.data;
    },
    enabled: !!selectedBookingId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await axiosClient.put(`/bookings/${selectedBookingId}/status`, { status: newStatus });
      return res.data;
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
      <div 
        className={`side-modal-overlay ${isBookingSidebarOpen ? 'open' : ''}`}
        onClick={closeBookingSidebar}
      />

      {/* Sidebar Panel */}
      <div className={`side-modal ${isBookingSidebarOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="side-modal-head">
          <h2>Booking Details</h2>
          <button onClick={closeBookingSidebar}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="side-modal-body">
          {isLoading ? (
            <div style={{color:'var(--ink-soft)'}}>Loading details...</div>
          ) : error ? (
            <div style={{color:'var(--brick-deep)'}}>Error loading booking details.</div>
          ) : booking ? (
            <div>
              
              {/* Status Badge */}
              <div className="detail-row" style={{borderBottom:'1px solid var(--line)', paddingBottom:'16px'}}>
                <span className="label">Status</span>
                <span className={`status ${
                  booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'live' :
                  booking.status === 'PENDING' ? 'pending' : 'paused'
                }`}>
                  {booking.status}
                </span>
              </div>

              {/* Guest Info */}
              <div className="detail-block">
                <h3>Guest</h3>
                <p className="main">{booking.guest?.name || 'Walk-in Guest'}</p>
                {booking.guest?.phone && <p className="sub">{booking.guest.phone}</p>}
                {booking.guest?.email && <p className="sub">{booking.guest.email}</p>}
              </div>

              {/* Room & Dates */}
              <div className="detail-block">
                <h3>Room</h3>
                <p className="main" style={{marginBottom:'16px'}}>{booking.room?.room_number || 'TBD'}</p>
                
                <div className="grid-2">
                  <div>
                    <h3>Check-In</h3>
                    <p className="main">{format(new Date(booking.check_in), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <h3>Check-Out</h3>
                    <p className="main">{format(new Date(booking.check_out), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="detail-block" style={{marginBottom:0}}>
                <h3>Payment Details</h3>
                <div className="detail-row" style={{marginBottom:'8px'}}>
                  <span className="label" style={{color:'var(--ink)', fontSize:'14px'}}>Total Amount</span>
                  <span className="val" style={{fontSize:'18px'}}>₵{booking.total_amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label" style={{textTransform:'none', letterSpacing:0}}>Method</span>
                  <span className="val" style={{fontSize:'13px'}}>{booking.payment_method || 'N/A'}</span>
                </div>
              </div>

            </div>
          ) : (
            <div style={{color:'var(--ink-soft)', fontSize:'14px'}}>Select a booking to view details.</div>
          )}
        </div>

        {/* Footer Actions */}
        {booking && (
          <div className="side-modal-foot">
            {booking.status === 'PENDING' && (
              <>
                <button 
                  onClick={() => handleStatusUpdate('CONFIRMED')}
                  className="btn btn-primary" style={{width:'100%', marginBottom:'8px'}}
                >
                  Confirm Booking
                </button>
                <button 
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="btn btn-outline" style={{width:'100%', borderColor:'var(--brick-pale)', color:'var(--brick-deep)'}}
                >
                  Cancel Booking
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <div style={{display:'flex', gap:'8px'}}>
                <button 
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  className="btn btn-primary" style={{flex:1}}
                >
                  Check Out
                </button>
              </div>
            )}

            {booking.status === 'BLOCKED' && (
              <button 
                onClick={() => handleStatusUpdate('CANCELLED')}
                className="btn btn-outline" style={{width:'100%'}}
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
