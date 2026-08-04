import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function EditTicketModal({ ticket, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!ticket;

  const [formData, setFormData] = useState({
    property_id: ticket?.property_id || '',
    room_id: ticket?.room_id || '',
    title: ticket?.title || '',
    description: ticket?.description || '',
    type: ticket?.type || 'General',
    status: ticket?.status || 'SCHEDULED'
  });

  const { data: unitsData, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['apartmentUnits'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-units');
      return res.data;
    }
  });

  const properties = unitsData ? [...new Map(unitsData.map(unit => [unit.property.id, unit.property])).values()] : [];
  const availableUnits = unitsData?.filter(u => u.property_id === formData.property_id) || [];

  const handlePropertyChange = (e) => {
    setFormData({ ...formData, property_id: e.target.value, room_id: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        const res = await axiosClient.put(`/maintenance/${ticket.id}`, data);
        return res.data;
      } else {
        const res = await axiosClient.post('/maintenance', data);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(`Maintenance ticket ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['maintenanceTickets']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} ticket`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.property_id || !formData.title) {
      toast.error('Building and Title are required');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-head">
          <h2>{isEditing ? 'Edit Maintenance Ticket' : 'Log Maintenance Issue'}</h2>
          <button type="button" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="form-group">
              <label>Issue Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Leaking Faucet" />
            </div>

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
                <label>Unit (Optional)</label>
                <select 
                  name="room_id" 
                  value={formData.room_id} 
                  onChange={handleChange} 
                  className="form-control"
                  disabled={!formData.property_id}
                >
                  <option value="">None / Common Area</option>
                  {availableUnits.map(u => (
                    <option key={u.id} value={u.id}>Unit {u.room_number}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                  <option value="General">General</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Appliance">Appliance</option>
                  <option value="HVAC">HVAC</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="form-control" 
                rows="4"
                placeholder="Details about the issue..."
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : isEditing ? 'Update Ticket' : 'Log Issue'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
