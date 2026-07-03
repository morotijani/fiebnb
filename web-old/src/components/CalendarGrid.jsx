"use client";
import React, { useState } from 'react';
import BlockRoomModal from './BlockRoomModal';

const dates = ['Mon, 12th', 'Tue, 13th', 'Wed, 14th', 'Thu, 15th', 'Fri, 16th', 'Sat, 17th', 'Sun, 18th'];
const rooms = [
  { id: '101', type: 'Single Room' },
  { id: '102', type: 'Double Room' },
  { id: '201', type: 'Suite' },
  { id: '202', type: 'Suite' },
];

const mockBookings = [
  { roomId: '101', dateIndex: 0, length: 2, source: 'APP', guest: 'John Doe' },
  { roomId: '102', dateIndex: 3, length: 3, source: 'WALK_IN', guest: 'Walk-in (Cash)' },
  { roomId: '201', dateIndex: 1, length: 1, source: 'APP', guest: 'Ama Serwaa' },
];

export default function CalendarGrid() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookings, setBookings] = useState(mockBookings);

  const handleSlotClick = (roomId, dateIndex) => {
    // Check if slot is already booked
    const isBooked = bookings.some(b => b.roomId === roomId && dateIndex >= b.dateIndex && dateIndex < b.dateIndex + b.length);
    if (!isBooked) {
      setSelectedSlot({ roomId, dateIndex });
      setModalOpen(true);
    }
  };

  const handleBlockRoom = (details) => {
    setBookings([...bookings, {
      roomId: selectedSlot.roomId,
      dateIndex: selectedSlot.dateIndex,
      length: parseInt(details.nights) || 1,
      source: 'WALK_IN',
      guest: details.guestName || 'Walk-in'
    }]);
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="w-48 p-4 bg-gray-50 border-b border-r border-gray-200 text-left font-semibold text-gray-700">Rooms</th>
              {dates.map((date, i) => (
                <th key={i} className="p-4 bg-gray-50 border-b border-r border-gray-200 text-center font-medium text-gray-600 min-w-[120px]">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="p-4 border-b border-r border-gray-200 bg-gray-50/50">
                  <div className="font-semibold text-gray-800">Room {room.id}</div>
                  <div className="text-xs text-gray-500">{room.type}</div>
                </td>
                {dates.map((_, colIndex) => {
                  // Find if a booking starts here
                  const booking = bookings.find(b => b.roomId === room.id && b.dateIndex === colIndex);
                  // Find if a booking spans across this cell
                  const isSpanned = bookings.some(b => b.roomId === room.id && colIndex > b.dateIndex && colIndex < b.dateIndex + b.length);

                  if (isSpanned) return null; // Skip rendering cell, it's covered by colSpan

                  if (booking) {
                    return (
                      <td key={colIndex} colSpan={booking.length} className="p-2 border-b border-r border-gray-200 relative min-w-[120px]">
                        <div className={`h-full min-h-[64px] rounded-md p-2 shadow-sm border flex flex-col justify-center ${
                          booking.source === 'APP' 
                            ? 'bg-blue-50 border-blue-200 text-blue-800' 
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          <div className="text-sm font-semibold truncate">{booking.guest}</div>
                          <div className="text-xs mt-1 flex items-center justify-between">
                            <span className="opacity-80 font-medium flex items-center gap-1">
                              {booking.source === 'APP' ? (
                                <><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> App</>
                              ) : (
                                <><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Walk-in</>
                              )}
                            </span>
                            {booking.length > 1 && <span className="font-medium bg-white/50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{booking.length} nights</span>}
                          </div>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td 
                      key={colIndex} 
                      onClick={() => handleSlotClick(room.id, colIndex)}
                      className="p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-blue-50/50 transition-colors group relative min-w-[120px]"
                    >
                      <div className="h-full w-full min-h-[64px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-blue-600 text-xs font-medium bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 shadow-sm">+ Block</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <BlockRoomModal 
          slot={selectedSlot} 
          onClose={() => setModalOpen(false)} 
          onConfirm={handleBlockRoom}
          dateLabel={dates[selectedSlot.dateIndex]}
        />
      )}
    </div>
  );
}
