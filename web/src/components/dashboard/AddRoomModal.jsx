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
            
            {properties && properties.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select
                  value={modalPropertyId}
                  onChange={(e) => {
                    setModalPropertyId(e.target.value);
                    setCategoryId(''); // Reset category since property changed
                  }}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  disabled={isLoadingCategories}
                >
                  <option value="">Select Category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} (₵{cat.price_per_night})</option>
                  ))}
                </select>
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
