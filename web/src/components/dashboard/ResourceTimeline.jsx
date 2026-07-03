import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, addDays, format, differenceInDays, startOfDay } from 'date-fns';
import { useDashboard } from '../../context/DashboardContext';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const fetchTimelineData = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/bookings/timeline', {
      headers: { Authorization: 'Bearer dummy-token' }
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Timeline API fetch failed, falling back to mock data:', error);
    // Mock data fallback if backend is down
    const today = new Date();
    today.setHours(0,0,0,0);
    const createDate = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString(); };
    return {
      rooms: [
        { id: 'r1', room_number: '101 - Deluxe', price_per_night: 150 },
        { id: 'r2', room_number: '102 - Standard', price_per_night: 100 },
        { id: 'r3', room_number: '105 - Suite', price_per_night: 200 },
      ],
      bookings: [
        { id: 'b1', room_id: 'r1', guest_name: 'Alice Smith', check_in: createDate(0), check_out: createDate(3), status: 'CONFIRMED' },
        { id: 'b2', room_id: 'r2', guest_name: 'Maintenance', check_in: createDate(1), check_out: createDate(5), status: 'BLOCKED' },
      ]
    };
  }
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

  if (isLoading) return <div className="p-6 text-slate-500 animate-pulse bg-white rounded-xl border border-slate-200">Loading master timeline...</div>;
  if (error) return <div className="p-6 text-red-500 bg-white rounded-xl border border-red-200">Error loading timeline.</div>;

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
    
    let colorClass = 'bg-slate-400 border-slate-500 text-white';
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      colorClass = 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200';
    } else if (booking.status === 'PENDING') {
      colorClass = 'bg-amber-300 border-amber-400 text-amber-900 shadow-amber-100';
    }

    return {
      style: { gridColumnStart: startCol, gridColumnEnd: `span ${span}`, gridRow: rowIndex },
      className: `relative mx-1 my-1 p-2 rounded border shadow-sm flex items-center overflow-hidden cursor-pointer hover:brightness-110 transition-all ${colorClass}`
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="overflow-x-auto flex-1 custom-scrollbar relative">
        <div 
          className="grid min-w-max" 
          style={{ gridTemplateColumns: `200px repeat(${days.length}, minmax(48px, 1fr))` }}
        >
          {/* --- HEADER ROW --- */}
          {/* Sticky Room Label Header */}
          <div 
            className="sticky left-0 bg-slate-50 border-b border-r border-slate-200 z-30 flex items-center px-4 py-3 font-bold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            Rooms
          </div>
          
          {/* Day Headers */}
          {days.map((day, idx) => (
            <div 
              key={`header-${idx}`} 
              className="border-b border-r border-slate-100 bg-slate-50 text-center py-2 flex flex-col justify-center sticky top-0 z-20"
              style={{ gridColumn: idx + 2, gridRow: 1 }}
            >
              <span className="text-xs font-semibold text-slate-500 uppercase">{format(day, 'EEE')}</span>
              <span className={`text-sm font-bold ${idx === 0 ? 'text-blue-600' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </span>
            </div>
          ))}

          {/* --- BODY ROWS --- */}
          {rooms.map((room, roomIdx) => {
            const rowIndex = roomIdx + 2; // Row 1 is header

            return (
              <div key={room.id} className="contents group">
                {/* Sticky Left Room Name */}
                <div 
                  className="sticky left-0 bg-white group-hover:bg-slate-50 border-b border-r border-slate-200 z-10 flex items-center px-4 py-3 text-sm font-medium text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors"
                  style={{ gridColumn: 1, gridRow: rowIndex }}
                >
                  {room.room_number}
                </div>
                
                {/* Background Empty Cells for Clicking */}
                {days.map((day, dayIdx) => (
                  <div 
                    key={`cell-${room.id}-${dayIdx}`} 
                    className="border-b border-r border-slate-100 bg-white group-hover:bg-slate-50 cursor-crosshair transition-colors hover:bg-blue-50"
                    style={{ gridColumn: dayIdx + 2, gridRow: rowIndex }}
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
                      className={`${layout.className} z-10`}
                      onClick={() => openBookingSidebar(booking.id)}
                    >
                      <span className="truncate text-xs font-semibold">{booking.guest_name}</span>
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
