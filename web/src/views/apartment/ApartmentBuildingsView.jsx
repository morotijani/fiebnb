import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Building2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import EditPropertyModal from '../../components/dashboard/EditPropertyModal';

export default function ApartmentBuildingsView() {
  const queryClient = useQueryClient();
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: buildings, isLoading, error } = useQuery({
    queryKey: ['apartmentBuildings'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-buildings');
      return res.data;
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosClient.put(`/properties/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['apartmentBuildings']);
    }
  });

  const handleToggleStatus = (bldg) => {
    const newStatus = bldg.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    toggleStatusMutation.mutate({ id: bldg.id, status: newStatus });
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

  if (error) {
    return <div className="text-red-500 p-8">Failed to load buildings data.</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Buildings</h1>
          <p>Manage your properties and building locations.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            <Building2 size={16} /> Add Building
          </button>
        )}
      </div>

      <div className="panel">
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Building Details</th>
                <th>Location</th>
                <th>Total Units</th>
                <th>Base Rent</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildings?.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
                    No buildings found.
                  </td>
                </tr>
              )}
              {buildings?.map(bldg => (
                <tr key={bldg.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      {bldg.images && bldg.images[0] ? (
                        <img 
                          src={bldg.images[0].startsWith('http') ? bldg.images[0] : `http://localhost:3000/uploads/${bldg.images[0].replace(/^(\/?uploads\/|\/)/, '')}`} 
                          style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} 
                        />
                      ) : (
                        <div style={{width: '40px', height: '40px', borderRadius: '4px', background: 'var(--paper-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)'}}>
                          <Building2 size={20} />
                        </div>
                      )}
                      <div>
                        <div style={{fontWeight: '600'}}>{bldg.title}</div>
                        <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>{bldg.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{bldg.address || 'Unspecified'}</td>
                  <td>{bldg.rooms?.length || 0} units</td>
                  <td>₵{bldg.base_price?.toLocaleString()}/mo</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                      background: bldg.status === 'AVAILABLE' ? '#e6f7ec' : '#feeceb',
                      color: bldg.status === 'AVAILABLE' ? '#0f7b40' : '#b22a2a',
                    }}>
                      {bldg.status === 'AVAILABLE' ? 'Active' : 'Inactive'}
                    </span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={bldg.status === 'AVAILABLE'}
                        onChange={() => handleToggleStatus(bldg)}
                        disabled={toggleStatusMutation.isLoading}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: bldg.status === 'AVAILABLE' ? '#0f7b40' : '#d1d5db',
                        transition: '0.3s', borderRadius: '20px',
                        opacity: toggleStatusMutation.isLoading ? 0.5 : 1
                      }}>
                        <span style={{
                          position: 'absolute', height: '16px', width: '16px', left: '2px', bottom: '2px',
                          backgroundColor: 'white', transition: '0.3s', borderRadius: '50%',
                          transform: bldg.status === 'AVAILABLE' ? 'translateX(16px)' : 'translateX(0)'
                        }}></span>
                      </span>
                    </label>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button 
                      onClick={() => setEditingBuilding(bldg)}
                      className="btn btn-outline" 
                      style={{padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <EditPropertyModal 
          property={{}} 
          defaultPropertyType="APARTMENT"
          onClose={() => {
            setIsAdding(false);
            queryClient.invalidateQueries(['apartmentBuildings']);
          }} 
        />
      )}
      
      {editingBuilding && (
        <EditPropertyModal 
          property={editingBuilding} 
          defaultPropertyType="APARTMENT"
          onClose={() => {
            setEditingBuilding(null);
            queryClient.invalidateQueries(['apartmentBuildings']);
          }} 
        />
      )}
    </>
  );
}
