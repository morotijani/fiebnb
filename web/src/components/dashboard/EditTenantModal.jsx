import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { format } from 'date-fns';
import MatIcon from '../common/MatIcon';

export default function EditTenantModal({ tenant, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!tenant;

  const [formData, setFormData] = useState({
    property_id: tenant?.property_id || '',
    room_id: tenant?.room_id || '',
    tenant_name: tenant?.tenant_name || tenant?.tenant?.name || '',
    tenant_email: tenant?.tenant?.email || '',
    tenant_phone: tenant?.tenant?.phone_number || '',
    start_date: tenant?.start_date ? format(new Date(tenant.start_date), 'yyyy-MM-dd') : '',
    end_date: tenant?.end_date ? format(new Date(tenant.end_date), 'yyyy-MM-dd') : '',
    rent_amount: tenant?.rent_amount || '',
    status: tenant?.status || 'ACTIVE'
  });

  const { data: unitsData, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['apartmentUnits'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-units');
      return res.data;
    }
  });

  // Extract unique properties from the units data
  const properties = unitsData ? [...new Map(unitsData.map(unit => [unit.property.id, unit.property])).values()] : [];
  
  // Filter units based on selected property and availability
  const availableUnits = unitsData?.filter(u => {
    if (u.property_id !== formData.property_id) return false;
    
    // If editing, always include the tenant's current unit
    if (isEditing && u.id === tenant.room_id) return true;
    
    // Otherwise, only include units that are not currently occupied
    return !u.leases || u.leases.length === 0;
  }) || [];

  const handlePropertyChange = (e) => {
    setFormData({ ...formData, property_id: e.target.value, room_id: '', rent_amount: '' });
  };

  const handleUnitChange = (e) => {
    const roomId = e.target.value;
    const selectedUnit = availableUnits.find(u => u.id === roomId);
    let rent = '';
    
    if (selectedUnit) {
      if (selectedUnit.custom_price) {
        rent = selectedUnit.custom_price;
      } else if (selectedUnit.category?.price_per_night) {
        rent = selectedUnit.category.price_per_night;
      } else {
        rent = selectedUnit.property.base_price;
      }
    }
    
    setFormData({ ...formData, room_id: roomId, rent_amount: rent });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        const res = await axiosClient.put(`/leases/${tenant.id}`, data);
        return res.data;
      } else {
        const res = await axiosClient.post('/leases', data);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(`Tenant ${isEditing ? 'updated' : 'added'} successfully`);
      queryClient.invalidateQueries(['apartmentTenants']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} tenant`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.property_id || !formData.room_id || !formData.tenant_name || !formData.start_date || !formData.end_date || !formData.rent_amount) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (!isEditing && !formData.tenant_phone) {
      toast.error('Tenant phone number is required to create a temporary account');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-head">
          <h2>{isEditing ? 'Edit Tenant Lease' : 'Add New Tenant'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <MatIcon name="close" size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Building / Property *</label>
                <select 
                  name="property_id" 
                  value={formData.property_id} 
                  onChange={handlePropertyChange} 
                  className="form-control"
                  disabled={isLoadingUnits}
                  required
                >
                  <option value="">Select Building</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Unit *</label>
                <select 
                  name="room_id" 
                  value={formData.room_id} 
                  onChange={handleUnitChange} 
                  className="form-control"
                  disabled={!formData.property_id}
                  required
                >
                  <option value="">Select Unit</option>
                  {availableUnits.map(u => (
                    <option key={u.id} value={u.id}>Unit {u.room_number}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--paper-dim)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Tenant Information</h3>
              <div className="form-group">
                <label>Tenant Name *</label>
                <input type="text" name="tenant_name" value={formData.tenant_name} onChange={handleChange} className="form-control" required />
              </div>
              {!isEditing && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Phone Number *</label>
                    <input type="tel" name="tenant_phone" value={formData.tenant_phone} onChange={handleChange} className="form-control" placeholder="Required for account creation" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Email Address</label>
                    <input type="email" name="tenant_email" value={formData.tenant_email} onChange={handleChange} className="form-control" placeholder="Optional" />
                  </div>
                </div>
              )}
              {!isEditing && (
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '-8px', marginBottom: '8px' }}>
                  A temporary account will be created if the tenant does not exist. Default password: <strong>Password123!</strong>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', background: 'var(--paper-dim)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Lease Details</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date *</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date *</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="form-control" required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Rent Amount (GH₵ / mo) *</label>
                  <input type="number" name="rent_amount" value={formData.rent_amount} onChange={handleChange} className="form-control" required />
                </div>
                {isEditing && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Lease Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                      <option value="ACTIVE">Active</option>
                      <option value="ENDED">Ended</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : isEditing ? 'Update Tenant' : 'Add Tenant'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
