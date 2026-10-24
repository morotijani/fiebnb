import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../../components/common/MatIcon';
import { format, differenceInDays } from 'date-fns';
import EditTenantModal from '../../components/dashboard/EditTenantModal';

export default function ApartmentTenantsView() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const { data: tenants, isLoading, error } = useQuery({
    queryKey: ['apartmentTenants'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-tenants');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/leases/${id}`);
    },
    onSuccess: () => {
      toast.success('Tenant lease deleted successfully');
      queryClient.invalidateQueries(['apartmentTenants']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete tenant');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tenant record? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddTenant = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading tenants data...
      </div>
    );
  }

  if (error) {
    return <div className="panel" style={{ color: '#E41E3F', padding: '24px' }}>Failed to load tenants data.</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Tenants</h1>
          <p>Manage tenant leases and contact information.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddTenant}>
          <MatIcon name="person_add" size={18} /> Add Tenant
        </button>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Tenant</th>
                <th>Unit & Building</th>
                <th>Lease Term</th>
                <th>Rent Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
                    No tenants found. Click "Add Tenant" to onboard someone.
                  </td>
                </tr>
              )}
              {tenants?.map((lease, index) => {
                const daysUntilExpiry = differenceInDays(new Date(lease.end_date), new Date());
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && lease.status === 'ACTIVE';
                const isExpired = daysUntilExpiry < 0 && lease.status === 'ACTIVE';

                return (
                  <tr key={lease.id}>
                    <td style={{ color: 'var(--fb-text-secondary)', fontWeight: '600' }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>{lease.tenant_name || lease.tenant?.name || 'Unknown'}</div>
                      {lease.tenant?.email && <div style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>{lease.tenant.email}</div>}
                      {lease.tenant?.phone_number && <div style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>{lease.tenant.phone_number}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>Unit {lease.room?.room_number}</div>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text-secondary)' }}>{lease.property?.title}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px' }}>
                        {format(new Date(lease.start_date), 'MMM d, yyyy')} - {format(new Date(lease.end_date), 'MMM d, yyyy')}
                      </div>
                      {isExpiringSoon && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B25E00', background: '#FFF4E5', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                          <MatIcon name="warning" size={13} />
                          Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                        </div>
                      )}
                      {isExpired && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#E41E3F', background: '#FFEBEA', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                          <MatIcon name="warning" size={13} />
                          Expired
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>GH₵{lease.rent_amount?.toLocaleString()}/mo</td>
                    <td>
                      <span className={`status ${lease.status === 'ACTIVE' ? 'paid' : (lease.status === 'ENDED' ? 'vacant' : 'overdue')}`}>
                        {lease.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-outline btn-sm" 
                          style={{ padding: '6px 8px' }} 
                          title="Edit Tenant"
                          onClick={() => handleEditTenant(lease)}
                        >
                          <MatIcon name="edit" size={15} />
                        </button>
                        <button 
                          className="btn btn-outline btn-sm" 
                          style={{ padding: '6px 8px', color: '#E41E3F', borderColor: '#FCA5A5' }} 
                          title="Delete Tenant"
                          onClick={() => handleDelete(lease.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <MatIcon name="delete" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EditTenantModal 
          tenant={editingTenant} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
