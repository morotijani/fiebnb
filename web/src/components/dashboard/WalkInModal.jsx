import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../common/MatIcon';

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

  const minCheckOutDate = new Date();
  minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
  const minDateString = minCheckOutDate.toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal">
        <div className="modal-head">
          <h2>New Walk-In Booking</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <MatIcon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {mutation.isError && (
              <div style={{marginBottom:'16px', padding:'12px', background:'var(--brick-pale)', color:'var(--brick-deep)', borderRadius:'var(--r-md)', fontSize:'13.5px'}}>
                {mutation.error?.response?.data?.error || mutation.error.message || 'Failed to create booking.'}
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Guest Name</label>
                <input 
                  type="text" 
                  required
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  required
                  className="form-control"
                  placeholder="+233..."
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Assign Room</label>
              <select 
                required
                className="form-control"
                value={formData.room_id}
                onChange={(e) => setFormData({...formData, room_id: e.target.value})}
              >
                <option value="" disabled>Select an available room</option>
                {loadingRooms ? (
                  <option disabled>Loading...</option>
                ) : (
                  rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - ₵{room.category?.price_per_night}/night
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group" style={{marginBottom:0}}>
                <label>Check-Out Date</label>
                <input 
                  type="date" 
                  required
                  min={minDateString}
                  className="form-control"
                  value={formData.check_out}
                  onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label>Payment Method</label>
                <select 
                  className="form-control"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card / POS</option>
                  <option value="MOMO">Mobile Money</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="btn btn-primary"
            >
              {mutation.isPending ? 'Confirming...' : 'Confirm Walk-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
