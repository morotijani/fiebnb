import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const fetchAvailableRooms = async () => {
  const res = await axiosClient.get('/bookings/available-rooms');
  return res.data;
};

const submitWalkIn = async (payload) => {
  const res = await axiosClient.post('/bookings/walk-in', payload);
  return res.data;
};

export default function WalkInModal({ isOpen, onClose, initialData }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    guest_name: '',
    phone_number: '',
    room_id: '',
    check_out: '',
    payment_method: 'CASH'
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(prev => ({
          ...prev,
          room_id: initialData.roomId || '',
          check_out: initialData.date || ''
        }));
      } else {
        // Reset if no initial data
        setFormData({ guest_name: '', phone_number: '', room_id: '', check_out: '', payment_method: 'CASH' });
      }
    }
  }, [isOpen, initialData]);

  // Query available rooms
  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['availableRooms'],
    queryFn: fetchAvailableRooms,
    enabled: isOpen,
    initialData: [] // To prevent undefined issues
  });

  // Mutation for creating booking
  const mutation = useMutation({
    mutationFn: submitWalkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
      onClose();
      // Reset form
      setFormData({ guest_name: '', phone_number: '', room_id: '', check_out: '', payment_method: 'CASH' });
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">New Walk-In Booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Guest Name</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="John Doe"
                value={formData.guest_name}
                onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="tel" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="+233..."
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Assign Room</label>
            <select 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
              value={formData.room_id}
              onChange={(e) => setFormData({...formData, room_id: e.target.value})}
            >
              <option value="" disabled>Select an available room</option>
              {loadingRooms ? (
                <option disabled>Loading...</option>
              ) : (
                rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    Room {room.room_number} - ₵{room.price_per_night}/night
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Check-Out Date</label>
              <input 
                type="date" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                value={formData.check_out}
                onChange={(e) => setFormData({...formData, check_out: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Payment Method</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                value={formData.payment_method}
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
              >
                <option value="CASH">Cash</option>
                <option value="POS">Card (POS)</option>
                <option value="MOMO">Mobile Money</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {mutation.isPending ? 'Processing...' : 'Confirm Walk-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
