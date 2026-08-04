import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Users, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function ApartmentTenantsView() {
  const { data: tenants, isLoading, error } = useQuery({
    queryKey: ['apartmentTenants'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-tenants');
      return res.data;
    }
  });

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
        <button className="btn btn-primary">
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      <div className="panel">
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit & Building</th>
                <th>Lease Term</th>
                <th>Rent Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
                    No tenants found.
                  </td>
                </tr>
              )}
              {tenants?.map(lease => (
                <tr key={lease.id}>
                  <td>
                    <div style={{fontWeight: '600'}}>{lease.tenant_name || lease.tenant?.name || 'Unknown'}</div>
                  </td>
                  <td>
                    <div style={{fontWeight: '500'}}>Unit {lease.room?.room_number}</div>
                    <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>{lease.property?.title}</div>
                  </td>
                  <td>
                    <div style={{fontSize: '14px'}}>
                      {format(new Date(lease.start_date), 'MMM d, yyyy')} - {format(new Date(lease.end_date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td>₵{lease.rent_amount?.toLocaleString()}/mo</td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                      background: lease.status === 'ACTIVE' ? '#e6f7ec' : '#f1f3f5',
                      color: lease.status === 'ACTIVE' ? '#0f7b40' : '#495057'
                    }}>
                      {lease.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
