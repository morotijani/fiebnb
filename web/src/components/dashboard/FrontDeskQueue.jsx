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


  if (isLoading) return <div className="p-6 text-slate-500 animate-pulse bg-white rounded-xl border border-slate-200">Loading front desk queue...</div>;
  if (error) return <div className="p-6 text-red-500 bg-white rounded-xl border border-red-200">Error loading queue. Is the API running?</div>;

  const bookings = data?.[activeTab] || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        {['arrivals', 'departures', 'inHouse'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium text-center capitalize transition-colors relative ${
              activeTab === tab 
                ? 'text-blue-600 bg-white' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.replace(/([A-Z])/g, ' $1').trim()}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
              {data?.[tab]?.length || 0}
            </span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No {activeTab.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} for today.</div>
        ) : (
          bookings.map((booking) => (
            <div 
              key={booking.id} 
              onClick={() => openBookingSidebar(booking.id)}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-semibold text-slate-800">{booking.guest?.name || 'Walk-in Guest'}</h4>
                <p className="text-sm text-slate-500 mt-0.5">Room <span className="font-medium text-slate-700">{booking.room?.room_number || 'TBD'}</span></p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {booking.status}
                </span>
                
                {activeTab === 'arrivals' && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 text-sm font-medium">
                    View Details &rarr;
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
