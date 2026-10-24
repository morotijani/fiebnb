import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { format } from 'date-fns';
import MatIcon from '../components/common/MatIcon';

export default function StaffView() {
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone_number: '', role: 'RECEPTIONIST' });

  const { data: properties, isLoading: isLoadingProps } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  React.useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff', selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await axiosClient.get(`/properties/${selectedPropertyId}/staff`);
      return res.data;
    },
    enabled: !!selectedPropertyId
  });

  const addStaffMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post(`/properties/${selectedPropertyId}/staff`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff', selectedPropertyId]);
      setIsAdding(false);
      setNewStaff({ name: '', phone_number: '', role: 'RECEPTIONIST' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to add staff');
    }
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (staffId) => {
      await axiosClient.delete(`/properties/${selectedPropertyId}/staff/${staffId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff', selectedPropertyId]);
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to remove staff');
    }
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addStaffMutation.mutate(newStaff);
  };

  if (isLoadingProps) {
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
          <h1>Manage Staff</h1>
          <p>Add or remove receptionists and managers for your properties.</p>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          {properties && properties.length > 0 && (
            <select
              className="form-control"
              style={{minWidth: '200px'}}
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}

          {!isAdding && selectedPropertyId && (
            <button 
              onClick={() => setIsAdding(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <MatIcon name="person_add" size={18} />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      <div className="panel">
        {isAdding && (
          <form onSubmit={handleAddSubmit} style={{marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--line)'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>New Staff Details</h3>
            <p style={{fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px'}}>
              The user will be able to log in using their phone number and the default password: <b style={{color: 'var(--ink)'}}>123456</b>.
            </p>
            
            <div style={{display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Role</label>
                <select 
                  value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                  className="form-control"
                >
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="HOTEL_MANAGER">Admin (Manager)</option>
                </select>
              </div>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" required
                  value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  className="form-control"
                />
              </div>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" required placeholder="e.g. 0541234567"
                  value={newStaff.phone_number} onChange={e => setNewStaff({...newStaff, phone_number: e.target.value})}
                  className="form-control"
                />
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '12px'}}>
              <button type="submit" disabled={addStaffMutation.isLoading} className="btn btn-primary">
                {addStaffMutation.isLoading ? 'Saving...' : 'Save Staff'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoadingStaff ? (
          <div className="h-40 bg-slate-100 rounded-lg animate-pulse" style={{marginTop: isAdding ? '0' : '24px'}}></div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Added On</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!staff || staff.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
                      No staff added to this property yet.
                    </td>
                  </tr>
                )}
                {staff?.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', 
                          background: 'var(--paper-dim)', color: 'var(--ink)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 'bold', fontSize: '14px'
                        }}>
                          {s.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight: 600, color: 'var(--ink)', fontSize: '14.5px'}}>{s.user.name}</div>
                          <div style={{fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px'}}>{s.user.phone_number}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status pending" style={{background: 'var(--paper-dim)', color: 'var(--ink)'}}>
                        {s.user.role === 'HOTEL_MANAGER' ? 'Manager' : 'Receptionist'}
                      </span>
                    </td>
                    <td style={{fontSize: '13.5px', color: 'var(--ink-soft)'}}>
                      {s.createdAt ? format(new Date(s.createdAt), 'MMM d, yyyy') : 'Unknown'}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this staff member?')) {
                            removeStaffMutation.mutate(s.user.id);
                          }
                        }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', 
                          color: 'var(--brick-deep)', padding: '6px'
                        }}
                        title="Remove Staff"
                      >
                        <MatIcon name="delete" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
