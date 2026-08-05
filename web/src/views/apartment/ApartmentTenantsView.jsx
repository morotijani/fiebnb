import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { Users, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
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
      <div className="space-y-6 animate-pulse">
        <div className="dash-topbar">
          <div><div className="h-8 bg-slate-200 rounded w-1/4"></div></div>
        </div>
        <div className="panel h-64 bg-slate-200"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">Failed to load tenants data.</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Tenants</h1>
          <p>Manage tenant leases and contact information.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddTenant}>
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      <div className="panel">
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th style={{width: '40px'}}>#</th>
                <th>Tenant</th>
                <th>Unit & Building</th>
                <th>Lease Term</th>
                <th>Rent Amount</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
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
                  <td style={{color: 'var(--ink-soft)', fontWeight: '500'}}>{index + 1}</td>
                  <td>
                    <div style={{fontWeight: '600'}}>{lease.tenant_name || lease.tenant?.name || 'Unknown'}</div>
                    {lease.tenant?.email && <div style={{fontSize: '12px', color: 'var(--ink-soft)'}}>{lease.tenant.email}</div>}
                    {lease.tenant?.phone_number && <div style={{fontSize: '12px', color: 'var(--ink-soft)'}}>{lease.tenant.phone_number}</div>}
                  </td>
                  <td>
                    <div style={{fontWeight: '500'}}>Unit {lease.room?.room_number}</div>
                    <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>{lease.property?.title}</div>
                  </td>
                  <td>
                    <div style={{fontSize: '14px'}}>
                      {format(new Date(lease.start_date), 'MMM d, yyyy')} - {format(new Date(lease.end_date), 'MMM d, yyyy')}
                    </div>
                    {isExpiringSoon && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: '500' }}>
                        <AlertTriangle size={12} />
                        Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                      </div>
                    )}
                    {isExpired && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#991b1b', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: '500' }}>
                        <AlertTriangle size={12} />
                        Expired
                      </div>
                    )}
                  </td>
                  <td>GH₵{lease.rent_amount?.toLocaleString()}/mo</td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                      background: lease.status === 'ACTIVE' ? '#e6f7ec' : lease.status === 'ENDED' ? '#f1f3f5' : '#fee2e2',
                      color: lease.status === 'ACTIVE' ? '#0f7b40' : lease.status === 'ENDED' ? '#495057' : '#991b1b'
                    }}>
                      {lease.status}
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '6px', minHeight: '32px'}} 
                        title="Edit Tenant"
                        onClick={() => handleEditTenant(lease)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '6px', minHeight: '32px', color: 'var(--brick-deep)', borderColor: 'var(--brick-pale)'}} 
                        title="Delete Tenant"
                        onClick={() => handleDelete(lease.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} />
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
