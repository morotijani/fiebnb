import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import MatIcon from '../../components/common/MatIcon';
import axiosClient from '../../api/axiosClient';

export default function LeasesView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewingLease, setViewingLease] = useState(null);

  // Fetch homeowner leases
  const { data: leases = [], isLoading, error } = useQuery({
    queryKey: ['homeownerLeases'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-tenants');
      return res.data;
    }
  });

  // Approve pending lease mutation
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.put(`/leases/${id}`, { status: 'ACTIVE' });
    },
    onSuccess: () => {
      toast.success('Lease agreement approved & activated!');
      queryClient.invalidateQueries(['homeownerLeases']);
      queryClient.invalidateQueries(['homeownerTenants']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to approve lease');
    }
  });

  // Delete lease mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.delete(`/leases/${id}`);
    },
    onSuccess: () => {
      toast.success('Lease agreement terminated');
      queryClient.invalidateQueries(['homeownerLeases']);
      queryClient.invalidateQueries(['homeownerTenants']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to terminate lease');
    }
  });

  // Metrics
  const activeLeases = leases.filter((l) => l.status === 'ACTIVE');
  const pendingLeases = leases.filter((l) => l.status === 'PENDING');
  const expiringSoonCount = activeLeases.filter((l) => {
    const diff = differenceInDays(new Date(l.end_date), new Date());
    return diff <= 60 && diff >= 0;
  }).length;
  const totalContractValue = activeLeases.reduce(
    (acc, l) => acc + (l.advance_payment || (l.rent_amount * (l.duration_months || 12))),
    0
  );

  // Filtered
  const filtered = leases.filter((l) => {
    const q = searchTerm.toLowerCase();
    const name = (l.tenant_name || l.tenant?.name || '').toLowerCase();
    const propTitle = (l.property?.title || '').toLowerCase();
    if (!name.includes(q) && !propTitle.includes(q)) return false;
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  return (
    <div>
      <div className="dash-topbar">
        <div>
          <h1>Lease agreements</h1>
          <p>Manage residential lease agreements, advance contracts, and renewal cycles.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="description" size={22} />
            </div>
            <span className="delta">Active</span>
          </div>
          <b>{activeLeases.length}</b>
          <span>Active lease contracts</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              <MatIcon name="schedule" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              Applications
            </span>
          </div>
          <b>{pendingLeases.length}</b>
          <span>Pending approval</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              <MatIcon name="warning" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              Next 60 days
            </span>
          </div>
          <b>{expiringSoonCount}</b>
          <span>Renewals due</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: 'var(--fb-hover)', color: 'var(--fb-primary)' }}>
              <MatIcon name="domain" size={22} />
            </div>
            <span className="delta">Total Value</span>
          </div>
          <b>GH₵{totalContractValue.toLocaleString()}</b>
          <span>Active contract portfolio</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <MatIcon
              name="search"
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search by tenant name or property title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', borderRadius: '20px', height: '40px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: filterStatus === st ? '1px solid var(--fb-primary)' : '1px solid var(--fb-border)',
                  background: filterStatus === st ? 'var(--fb-primary-tint)' : '#FFFFFF',
                  color: filterStatus === st ? 'var(--fb-primary)' : 'var(--fb-text)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'ALL' ? 'All Leases' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leases Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
            Loading lease contracts...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#E41E3F' }}>
            Failed to load lease agreements.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--fb-hover)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fb-primary)'
              }}
            >
              <MatIcon name="description" size={28} />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fb-text)' }}>No lease agreements found</h2>
            <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '420px', margin: '0 auto', fontSize: '14px' }}>
              {searchTerm ? 'No lease agreements match your search.' : 'You do not have any lease agreements registered.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Duration &amp; Advance</th>
                  <th>Monthly Rate</th>
                  <th>Total Contract Value</th>
                  <th>Lease Period</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lease, idx) => {
                  const durationYears = lease.duration_months ? Math.round(lease.duration_months / 12) : 1;
                  const totalContract = lease.advance_payment || (lease.rent_amount * (lease.duration_months || 12));

                  return (
                    <tr key={lease.id}>
                      <td style={{ color: 'var(--fb-text-secondary)', fontWeight: '600' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--fb-text)' }}>
                          {lease.tenant_name || lease.tenant?.name || 'Tenant'}
                        </div>
                        {lease.tenant?.phone_number && (
                          <div style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>
                            {lease.tenant.phone_number}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--fb-text)' }}>{lease.property?.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>{lease.property?.address || 'Accra'}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: 'var(--fb-bg)',
                            color: 'var(--fb-text)'
                          }}
                        >
                          {durationYears} Year{durationYears > 1 ? 's' : ''} ({lease.duration_months || 12} mos)
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        GH₵{lease.rent_amount?.toLocaleString()}/mo
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--fb-success-text)' }}>
                        GH₵{totalContract.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {format(new Date(lease.start_date), 'MMM d, yyyy')} – {format(new Date(lease.end_date), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <span className={`status ${lease.status === 'ACTIVE' ? 'paid' : (lease.status === 'PENDING' ? 'due' : 'vacant')}`}>
                          {lease.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {lease.status === 'PENDING' && (
                            <button
                              onClick={() => approveMutation.mutate(lease.id)}
                              className="btn btn-primary btn-sm"
                              title="Approve & activate lease"
                            >
                              <MatIcon name="check" size={15} /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => setViewingLease(lease)}
                            className="btn btn-outline btn-sm"
                            title="View agreement details"
                            style={{ padding: '6px 8px' }}
                          >
                            <MatIcon name="visibility" size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to terminate this lease agreement?')) {
                                deleteMutation.mutate(lease.id);
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            title="Terminate lease"
                            style={{ padding: '6px 8px', color: '#E41E3F', borderColor: '#FCA5A5' }}
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
        )}
      </div>

      {/* View Agreement Details Modal */}
      {viewingLease && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-head">
              <h2>Lease Agreement Details</h2>
              <button onClick={() => setViewingLease(null)}>
                <MatIcon name="close" size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--fb-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--fb-border)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--fb-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Property
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px', color: 'var(--fb-text)' }}>
                  {viewingLease.property?.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--fb-text-secondary)' }}>
                  {viewingLease.property?.address}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', fontWeight: 600 }}>Tenant Name</span>
                  <div style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--fb-text)', marginTop: '2px' }}>
                    {viewingLease.tenant_name || viewingLease.tenant?.name}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', fontWeight: 600 }}>Phone Contact</span>
                  <div style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--fb-text)', marginTop: '2px' }}>
                    {viewingLease.tenant?.phone_number || '—'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', fontWeight: 600 }}>Advance Duration</span>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--fb-text)', marginTop: '2px' }}>
                    {viewingLease.duration_months ? Math.round(viewingLease.duration_months / 12) : 1} Year ({viewingLease.duration_months || 12} Months)
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', fontWeight: 600 }}>Monthly Rate</span>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--fb-text)', marginTop: '2px' }}>
                    GH₵{viewingLease.rent_amount?.toLocaleString()}/mo
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', fontWeight: 600 }}>Lease Start Date</span>
                  <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--fb-text)', marginTop: '2px' }}>
                    {format(new Date(viewingLease.start_date), 'MMMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--fb-text-secondary)', fontWeight: 600 }}>Lease End Date</span>
                  <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--fb-text)', marginTop: '2px' }}>
                    {format(new Date(viewingLease.end_date), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--fb-success-bg)',
                  padding: '14px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--fb-success-text)' }}>Total Advance Contract Value:</span>
                <b style={{ fontSize: '18px', color: 'var(--fb-success-text)' }}>
                  GH₵{(viewingLease.advance_payment || (viewingLease.rent_amount * (viewingLease.duration_months || 12))).toLocaleString()}
                </b>
              </div>
            </div>

            <div className="modal-foot">
              <button onClick={() => setViewingLease(null)} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
