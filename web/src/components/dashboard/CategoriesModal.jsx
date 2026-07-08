import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export default function CategoriesModal({ propertyId, onClose }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosClient.get('/categories');
      return res.data.filter(c => c.property_id === propertyId);
    },
    enabled: !!propertyId
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post('/categories', {
        property_id: propertyId,
        name,
        price_per_night: price
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setName('');
      setPrice('');
      setError(null);
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to add category')
  });

  const updateMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosClient.put(`/categories/${id}`, { name, price_per_night: price });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['rooms']);
      setEditingId(null);
      setName('');
      setPrice('');
      setError(null);
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to update category')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setError(null);
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to delete category')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Name and price are required');
      return;
    }
    if (editingId) {
      updateMutation.mutate(editingId);
    } else {
      addMutation.mutate();
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setPrice(cat.price_per_night.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Manage Room Categories</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deluxe Suite"
                className="block w-full rounded-lg border-slate-300 border focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Nightly Rate (₵)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
                className="block w-full rounded-lg border-slate-300 border focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Save' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Existing Categories</h3>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : categories?.length === 0 ? (
              <p className="text-sm text-slate-500">No categories found.</p>
            ) : (
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-medium text-slate-800">{cat.name}</div>
                      <div className="text-sm text-slate-500">₵{cat.price_per_night} / night</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(cat.id)}
                        disabled={deleteMutation.isPending}
                        className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
