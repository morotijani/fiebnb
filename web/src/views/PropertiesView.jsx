import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { format } from 'date-fns';
import EditPropertyModal from '../components/dashboard/EditPropertyModal';
import MatIcon from '../components/common/MatIcon';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url}`;
};

export default function PropertiesView() {
  const queryClient = useQueryClient();
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [newProp, setNewProp] = useState({ title: '', base_price: '', property_type: 'HOTEL' });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post('/properties', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
      setIsAdding(false);
      setNewProp({ title: '', base_price: '', property_type: 'HOTEL' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to add property');
    }
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...newProp,
      base_price: parseFloat(newProp.base_price) || 0
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="dash-topbar">
          <div><div className="h-8 bg-slate-200 rounded w-1/4"></div></div>
        </div>
        <div className="panel h-64 bg-slate-200"></div>
      </div>
    );
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Managed Properties</h1>
          <p>View and manage the properties you own or manage.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MatIcon name="add" size={18} />
            <span>Add Property</span>
          </button>
        )}
      </div>

      <div className="panel">
        {isAdding && (
          <form onSubmit={handleAddSubmit} style={{marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--line)'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>New Property Details</h3>
            <div style={{display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Property Name</label>
                <input 
                  type="text" required
                  value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})}
                  className="form-control"
                />
              </div>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Base Price / Night (Default)</label>
                <input 
                  type="number" required min="0" step="0.01"
                  value={newProp.base_price} onChange={e => setNewProp({...newProp, base_price: e.target.value})}
                  className="form-control"
                />
              </div>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Property Type</label>
                <select 
                  value={newProp.property_type} 
                  onChange={e => setNewProp({...newProp, property_type: e.target.value})}
                  className="form-control"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="GUESTHOUSE">Guesthouse</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOMEOWNER">Homeowner (Long term)</option>
                </select>
              </div>
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary">
                {createMutation.isLoading ? 'Saving...' : 'Save Property'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Property Details</th>
                <th>Type</th>
                <th>Base Price</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties?.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
                    No properties configured yet.
                  </td>
                </tr>
              )}
              {properties?.map(prop => (
                <tr key={prop.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '8px', 
                        background: 'var(--paper-dim)', overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {prop.images && prop.images.length > 0 ? (
                          <img src={getImageUrl(prop.images[0])} alt={prop.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          <span style={{color: 'var(--ink-soft)', fontSize: '10px', textAlign: 'center'}}>No Image</span>
                        )}
                      </div>
                      <div>
                        <div style={{fontWeight: 600, color: 'var(--ink)', fontSize: '14.5px'}}>{prop.title}</div>
                        <div style={{fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px'}}>
                          {prop.address ? prop.address : 'No address set'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{fontSize: '13.5px'}}>{prop.property_type}</span>
                  </td>
                  <td>
                    <span style={{fontWeight: 600}}>GH₵ {Number(prop.base_price || 0).toLocaleString()}</span>
                  </td>
                  <td style={{fontSize: '13.5px', color: 'var(--ink-soft)'}}>
                    {prop.createdAt ? format(new Date(prop.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </td>
                  <td>
                    <span className={`status ${prop.status === 'AVAILABLE' ? 'live' : 'paused'}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button 
                      onClick={() => setEditingProperty(prop)}
                      className="btn btn-outline"
                      style={{padding: '6px 12px', fontSize: '13px'}}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProperty && (
        <EditPropertyModal 
          property={editingProperty} 
          onClose={() => setEditingProperty(null)} 
        />
      )}
    </>
  );
}
