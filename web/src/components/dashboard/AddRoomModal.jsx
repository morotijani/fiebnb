import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export default function AddRoomModal({ propertyId, onClose }) {
  const queryClient = useQueryClient();
  const [roomNumber, setRoomNumber] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [error, setError] = useState(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post('/rooms', {
        property_id: propertyId,
        room_number: roomNumber,
        price_per_night: price,
        status
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms', propertyId]);
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomNumber) {
      setError('Room number is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Add New Room</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form id="add-room-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room Number / Name</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                placeholder="e.g. 101, Suite A"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Night (₵)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">₵</span>
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                    placeholder="150"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Out of Order (Maintenance)</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-room-form"
            disabled={createMutation.isPending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center shadow-sm"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
