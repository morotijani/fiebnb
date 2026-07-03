"use client";
import React, { useState } from 'react';

const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function BlockRoomModal({ slot, onClose, onConfirm, dateLabel }) {
  const [guestName, setGuestName] = useState('');
  const [nights, setNights] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ guestName, nights });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">Block Room {slot.roomId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-200">
            <IconX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium">
                {dateLabel}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Guest Name (Optional)</label>
              <input 
                type="text" 
                autoFocus
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. Walk-in Customer"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Nights</label>
              <input 
                type="number" 
                min="1"
                max="14"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Block Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
