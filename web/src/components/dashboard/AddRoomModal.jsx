import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function AddRoomModal({ propertyId, properties, onClose }) {
  const queryClient = useQueryClient();
  const [roomNumber, setRoomNumber] = useState('');
  const [modalPropertyId, setModalPropertyId] = useState(propertyId);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [error, setError] = useState(null);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosClient.get('/categories');
      // Filter categories by the selected property
      return res.data.filter(c => c.property_id === modalPropertyId);
    },
    enabled: !!modalPropertyId
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post('/rooms', {
        property_id: modalPropertyId,
        room_number: roomNumber,
        category_id: categoryId,
        status
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room created successfully');
      queryClient.invalidateQueries(['rooms', propertyId]); // Invalidate original to refresh list if same
      if (modalPropertyId !== propertyId) {
        queryClient.invalidateQueries(['rooms', modalPropertyId]);
      }
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to create room';
      setError(msg);
      toast.error(msg);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomNumber) {
      setError('Room number is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal">
        {/* Header */}
        <div className="modal-head">
          <h2>Add New Room</h2>
          <button type="button" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form id="add-room-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{marginBottom:'16px', padding:'12px', background:'var(--brick-pale)', color:'var(--brick-deep)', borderRadius:'var(--r-md)', fontSize:'13.5px'}}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Room Number / Name</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="form-control"
                placeholder="e.g. 101, Suite A"
                required
              />
            </div>
            
            {properties && properties.length > 1 && (
              <div className="form-group">
                <label>Property</label>
                <select
                  value={modalPropertyId}
                  onChange={(e) => {
                    setModalPropertyId(e.target.value);
                    setCategoryId(''); // Reset category since property changed
                  }}
                  className="form-control"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid-2">
              {/* Category */}
              <div className="form-group" style={{marginBottom:0}}>
                <label>Room Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-control"
                  disabled={isLoadingCategories}
                >
                  <option value="">Select Category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} (₵{cat.price_per_night})</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group" style={{marginBottom:0}}>
                <label>Room Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Out of Order (Maintenance)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
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
              disabled={createMutation.isPending}
              className="btn btn-primary"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
