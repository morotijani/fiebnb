import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboard } from '../../context/DashboardContext';
import axiosClient from '../../api/axiosClient';

const fetchTodayBookings = async () => {
  const res = await axiosClient.get('/bookings/today');
  return res.data;
};

export default function FrontDeskQueue() {
  const { openBookingSidebar } = useDashboard();
  const [activeTab, setActiveTab] = useState('arrivals');

  const { data, isLoading, error } = useQuery({
    queryKey: ['todayBookings'],
    queryFn: fetchTodayBookings
  });

  if (isLoading) return <div style={{padding:'24px', color:'var(--ink-soft)'}}>Loading front desk queue...</div>;
  if (error) return <div style={{padding:'24px', color:'var(--brick-deep)'}}>Error loading queue. Is the API running?</div>;

  const bookings = data?.[activeTab] || [];

  return (
    <div className="queue-panel">
      {/* Tabs */}
      <div className="queue-tabs">
        {['arrivals', 'departures', 'inHouse'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`queue-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.replace(/([A-Z])/g, ' $1').trim()}
            <span className="queue-badge">
              {data?.[tab]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="queue-list">
        {bookings.length === 0 ? (
          <div style={{textAlign:'center', padding:'40px 0', color:'var(--ink-soft)', fontSize:'14px'}}>
            No {activeTab.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} for today.
          </div>
        ) : (
          bookings.map((booking) => (
            <div 
              key={booking.id} 
              onClick={() => openBookingSidebar(booking.id)}
              className="queue-card"
            >
              <div>
                <b>{booking.guest?.name || 'Walk-in Guest'}</b>
                <span className="room">Room {booking.room?.room_number || 'TBD'}</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <span className={`status ${
                  booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'live' :
                  booking.status === 'PENDING' ? 'pending' : 'paused'
                }`}>
                  {booking.status}
                </span>
                {activeTab === 'arrivals' && (
                  <span style={{fontSize:'12px', fontWeight:'600', color:'var(--brand)', opacity:0.8}}>
                    Details &rarr;
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
