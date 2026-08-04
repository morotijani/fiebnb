import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, addDays, format, differenceInDays, startOfDay } from 'date-fns';
import { useDashboard } from '../../context/DashboardContext';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import axiosClient from '../../api/axiosClient';

const fetchTimelineData = async () => {
  const res = await axiosClient.get('/bookings/timeline');
  return res.data;
};

export default function ResourceTimeline() {
  const { openWalkInModal, openBookingSidebar } = useDashboard();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Connect to backend Socket.io
    const socket = io('http://localhost:3000');
    
    socket.on('bookingCreated', (data) => {
      console.log('Real-time booking created:', data);
      // Invalidate the timeline query to instantly pull the new block
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      // Also invalidate todayBookings for the Action Queue
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
    });

    return () => socket.disconnect();
  }, [queryClient]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['timeline'],
    queryFn: fetchTimelineData
  });

  if (isLoading) return <div className="panel" style={{padding:'24px', color:'var(--ink-soft)'}}>Loading master timeline...</div>;
  if (error) return <div className="panel" style={{padding:'24px', color:'var(--brick-deep)'}}>Error loading timeline.</div>;

  const { rooms = [], bookings = [] } = data || {};

  const today = startOfDay(new Date());
  const endDate = addDays(today, 29); // 30-day window
  
  const days = eachDayOfInterval({ start: today, end: endDate });

  const getBookingLayout = (booking, rowIndex) => {
    const bStart = startOfDay(new Date(booking.check_in));
    const bEnd = startOfDay(new Date(booking.check_out));
    
    // Do not render if completely outside the 30-day window
    if (bEnd <= today || bStart > endDate) return null;

    // Clamp dates to fit within the visible grid window
    const effectiveStart = bStart < today ? today : bStart;
    const effectiveEnd = bEnd > endDate ? endDate : bEnd;

    // Grid logic: Col 1 = Header, Col 2 = Day 1 (today)
    const startCol = differenceInDays(effectiveStart, today) + 2; 
    let span = differenceInDays(effectiveEnd, effectiveStart);
    if (span === 0) span = 1; // Minimum 1 day block
    
    let colorStyle = { background: 'var(--sand)', border: '1px solid var(--line-dark)', color: 'var(--ink)' };
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      colorStyle = { background: '#E1EAE0', border: '1px solid #C5D4C3', color: 'var(--forest-deep)' };
    } else if (booking.status === 'PENDING') {
      colorStyle = { background: 'var(--gold-pale)', border: '1px solid #E5D0A1', color: 'var(--gold-deep)' };
    } else if (booking.status === 'CANCELLED') {
      colorStyle = { background: 'var(--brick-pale)', border: '1px solid #FBCFE8', color: 'var(--brick-deep)' };
    }

    return {
      style: { gridColumnStart: startCol, gridColumnEnd: `span ${span}`, gridRow: rowIndex, ...colorStyle, display: 'flex', alignItems: 'center', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', padding: '0 12px', borderRadius: '8px', margin: '4px', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    };
  };

  return (
    <div className="panel" style={{height:'600px', display:'flex', flexDirection:'column', padding:0, overflow:'hidden', marginBottom: 0, width: '100%', minWidth: 0}}>
      <div style={{overflowX:'auto', flex:1, position:'relative'}} className="custom-scrollbar">
        <div 
          style={{ display: 'grid', minWidth: 'max-content', gridTemplateColumns: `200px repeat(${days.length}, minmax(48px, 1fr))` }}
        >
          {/* --- HEADER ROW --- */}
          {/* Sticky Room Label Header */}
          <div 
            style={{ gridColumn: 1, gridRow: 1, position: 'sticky', left: 0, background: 'var(--paper-dim)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', zIndex: 30, display: 'flex', alignItems: 'center', padding: '12px 16px', fontWeight: 700, color: 'var(--ink)', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)' }}
          >
            Rooms
          </div>
          
          {/* Day Headers */}
          {days.map((day, idx) => (
            <div 
              key={`header-${idx}`} 
              style={{ gridColumn: idx + 2, gridRow: 1, borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', background: 'var(--paper-dim)', textAlign: 'center', padding: '8px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 20 }}
            >
              <span style={{fontSize:'11px', fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase'}}>{format(day, 'EEE')}</span>
              <span style={{fontSize:'14px', fontWeight:700, color: idx === 0 ? 'var(--brand)' : 'var(--ink)'}}>
                {format(day, 'd')}
              </span>
            </div>
          ))}

          {/* --- BODY ROWS --- */}
          {rooms.map((room, roomIdx) => {
            const rowIndex = roomIdx + 2; // Row 1 is header

            return (
              <div key={room.id} style={{display:'contents'}} className="timeline-row">
                {/* Sticky Left Room Name */}
                <div 
                  className="timeline-room-label"
                  style={{ gridColumn: 1, gridRow: rowIndex, position: 'sticky', left: 0, background: 'var(--white)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 16px', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)', transition: 'background 0.2s' }}
                >
                  <span style={{fontWeight:700, color:'var(--ink)', fontSize:'14px'}}>{room.room_number}</span>
                  <span style={{fontSize:'12px', color:'var(--ink-soft)', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={room.category?.name || 'Uncategorized'}>
                    {room.category?.name || 'Uncategorized'}
                  </span>
                </div>
                
                {/* Background Empty Cells for Clicking */}
                {days.map((day, dayIdx) => (
                  <div 
                    key={`cell-${room.id}-${dayIdx}`} 
                    className="timeline-cell"
                    style={{ gridColumn: dayIdx + 2, gridRow: rowIndex, borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', background: 'var(--white)', cursor: 'crosshair', transition: 'background 0.2s' }}
                    onClick={() => openWalkInModal({ roomId: room.id, date: format(day, 'yyyy-MM-dd') })}
                  />
                ))}

                {/* Booking Overlays */}
                {bookings.filter(b => b.room_id === room.id).map(booking => {
                  const layout = getBookingLayout(booking, rowIndex);
                  if (!layout) return null;

                  return (
                    <div 
                      key={booking.id}
                      style={layout.style}
                      className="timeline-booking"
                      onClick={() => openBookingSidebar(booking.id)}
                      onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                    >
                      <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:'13px', fontWeight:500}}>{booking.guest_name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
