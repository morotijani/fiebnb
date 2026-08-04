import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
      toast.success('Category added successfully');
      queryClient.invalidateQueries(['categories']);
      setName('');
      setPrice('');
      setError(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to add category';
      setError(msg);
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosClient.put(`/categories/${id}`, { name, price_per_night: price });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['rooms']);
      setEditingId(null);
      setName('');
      setPrice('');
      setError(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to update category';
      setError(msg);
      toast.error(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries(['categories']);
      setError(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to delete category';
      setError(msg);
      toast.error(msg);
    }
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
    <div className="modal-overlay open">
      <div className="modal" style={{maxWidth: '600px'}}>
        <div className="modal-head">
          <h2>Manage Room Categories</h2>
          <button type="button" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{marginBottom:'16px', padding:'12px', background:'var(--brick-pale)', color:'var(--brick-deep)', borderRadius:'var(--r-md)', fontSize:'13.5px'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display:'flex', gap:'12px', alignItems:'flex-end', background:'var(--paper-dim)', padding:'16px', borderRadius:'var(--r-md)', border:'1px solid var(--line)', marginBottom:'24px'}}>
            <div className="form-group" style={{flex: 1, marginBottom: 0}}>
              <label>Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deluxe Suite"
                className="form-control"
              />
            </div>
            <div className="form-group" style={{flex: 1, marginBottom: 0}}>
              <label>Nightly Rate (₵)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
                className="form-control"
              />
            </div>
            <div style={{display:'flex', gap:'8px'}}>
              <button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="btn btn-primary"
              >
                {editingId ? 'Save' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div>
            <h3 style={{fontSize:'16px', fontWeight:700, margin:'0 0 16px 0', color:'var(--ink)'}}>Existing Categories</h3>
            {isLoading ? (
              <p style={{color:'var(--ink-soft)'}}>Loading...</p>
            ) : categories?.length === 0 ? (
              <p style={{color:'var(--ink-soft)'}}>No categories found.</p>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {categories.map(cat => (
                  <div key={cat.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', border:'1px solid var(--line)', borderRadius:'var(--r-md)'}}>
                    <div>
                      <div style={{fontWeight:600, color:'var(--ink)'}}>{cat.name}</div>
                      <div style={{fontSize:'13px', color:'var(--ink-soft)'}}>₵{cat.price_per_night} / night</div>
                    </div>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="btn btn-outline" style={{padding:'6px 12px', fontSize:'13px'}}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(cat.id)}
                        disabled={deleteMutation.isPending}
                        className="btn btn-outline" style={{padding:'6px 12px', fontSize:'13px', color:'var(--brick-deep)', borderColor:'var(--brick-pale)'}}
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
