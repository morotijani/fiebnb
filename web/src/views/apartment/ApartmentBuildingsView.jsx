import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../../components/common/MatIcon';
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
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading buildings data...
      </div>
    );
  }

  if (error) {
    return <div className="panel" style={{ color: '#E41E3F', padding: '24px' }}>Failed to load buildings data.</div>;
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
            <MatIcon name="add" size={18} /> Add Building
          </button>
        )}
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Building Details</th>
                <th>Location</th>
                <th>Total Units</th>
                <th>Base Rent</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildings?.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
                    No buildings found.
                  </td>
                </tr>
              )}
              {buildings?.map(bldg => (
                <tr key={bldg.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {bldg.images && bldg.images[0] ? (
                        <img 
                          src={bldg.images[0].startsWith('http') ? bldg.images[0] : `http://localhost:3000/uploads/${bldg.images[0].replace(/^(\/?uploads\/|\/)/, '')}`} 
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--fb-border)' }} 
                          alt=""
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--fb-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fb-primary)' }}>
                          <MatIcon name="apartment" size={22} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>{bldg.title}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)' }}>{bldg.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{bldg.address || 'Unspecified'}</td>
                  <td>{bldg.rooms?.length || 0} units</td>
                  <td style={{ fontWeight: 600 }}>GH₵{bldg.base_price?.toLocaleString()}/mo</td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`status ${bldg.status === 'AVAILABLE' ? 'paid' : 'overdue'}`}>
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
                          backgroundColor: bldg.status === 'AVAILABLE' ? 'var(--fb-primary)' : '#CED0D4',
                          transition: '0.2s', borderRadius: '20px',
                          opacity: toggleStatusMutation.isLoading ? 0.5 : 1
                        }}>
                          <span style={{
                            position: 'absolute', height: '16px', width: '16px', left: '2px', bottom: '2px',
                            backgroundColor: 'white', transition: '0.2s', borderRadius: '50%',
                            transform: bldg.status === 'AVAILABLE' ? 'translateX(16px)' : 'translateX(0)'
                          }}></span>
                        </span>
                      </label>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => setEditingBuilding(bldg)}
                      className="btn btn-outline btn-sm" 
                    >
                      <MatIcon name="edit" size={15} /> Edit
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
