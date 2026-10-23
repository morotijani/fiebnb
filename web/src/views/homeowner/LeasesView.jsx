import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Check,
  X,
  Eye,
  Trash2
} from 'lucide-react';
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
      toast.error(err.response?.data?.error || 'Failed to remove lease');
    }
  });

  // Metrics
  const activeLeases = leases.filter(l => l.status === 'ACTIVE');
  const pendingLeases = leases.filter(l => l.status === 'PENDING');
  const totalContractValue = activeLeases.reduce((sum, l) => {
    return sum + (l.advance_payment || (l.rent_amount * (l.duration_months || 12)));
  }, 0);
  const expiringSoonCount = activeLeases.filter(l => {
    const diff = differenceInDays(new Date(l.end_date), new Date());
    return diff <= 60 && diff >= 0;
  }).length;

  // Filtered
  const filtered = leases.filter(l => {
    const q = searchTerm.toLowerCase();
    const name = (l.tenant_name || l.tenant?.name || '').toLowerCase();
    const propTitle = (l.property?.title || '').toLowerCase();
    if (!name.includes(q) && !propTitle.includes(q)) return false;
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>Lease agreements</h1>
          <p>Manage residential lease agreements, advance contracts, and renewal cycles.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><FileText size={17} stroke="var(--forest-deep)" /></div>
            <span className="delta" style={{ background: '#E1EAE0', color: 'var(--forest-deep)' }}>Active</span>
          </div>
          <b>{activeLeases.length}</b>
          <span>Active lease contracts</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Clock size={17} stroke="var(--gold-deep)" /></div>
            <span className="delta" style={{ background: 'var(--gold-pale)', color: 'var(--gold-deep)' }}>Applications</span>
          </div>
          <b>{pendingLeases.length}</b>
          <span>Pending approval</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><AlertTriangle size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Next 60 days</span>
          </div>
          <b>{expiringSoonCount}</b>
          <span>Renewals due</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Building size={17} stroke="var(--forest-deep)" /></div>
            <span className="delta">Total Value</span>
          </div>
          <b>GH₵{totalContractValue.toLocaleString()}</b>
          <span>Active contract portfolio</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
            <input
              type="text"
              placeholder="Search by tenant name or property title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: filterStatus === st ? '1px solid var(--ink)' : '1px solid var(--line)',
                  background: filterStatus === st ? 'var(--ink)' : 'var(--white)',
                  color: filterStatus === st ? 'var(--white)' : 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading lease contracts...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
            Failed to load lease agreements.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--sand)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={28} stroke="var(--brick-deep)" />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>No lease agreements found</h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto', fontSize: '14px' }}>
              {searchTerm ? 'No lease agreements match your search.' : 'You do not have any lease agreements registered.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--paper-dim)' }}>
                  <th style={{ width: '40px', padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>#</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Tenant</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Property</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Duration &amp; Advance</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Monthly Rate</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Total Contract Value</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Lease Period</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--ink-soft)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lease, idx) => {
                  const durationYears = lease.duration_months ? Math.round(lease.duration_months / 12) : 1;
                  const totalContract = lease.advance_payment || (lease.rent_amount * (lease.duration_months || 12));

                  return (
                    <tr key={lease.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px', color: 'var(--ink-soft)', fontWeight: '600' }}>{idx + 1}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--ink)' }}>
                          {lease.tenant_name || lease.tenant?.name || 'Tenant'}
                        </div>
                        {lease.tenant?.phone_number && (
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{lease.tenant.phone_number}</div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{lease.property?.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{lease.property?.address || 'Accra'}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: 'var(--sand)',
                            color: 'var(--ink)'
                          }}
                        >
                          {durationYears} Year{durationYears > 1 ? 's' : ''} ({lease.duration_months || 12} mos)
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>
                        GH₵{lease.rent_amount?.toLocaleString()}/mo
                      </td>
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                        GH₵{totalContract.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>
                        {format(new Date(lease.start_date), 'MMM d, yyyy')} – {format(new Date(lease.end_date), 'MMM d, yyyy')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: lease.status === 'ACTIVE' ? '#E1EAE0' : (lease.status === 'PENDING' ? 'var(--gold-pale)' : '#F1F5F9'),
                            color: lease.status === 'ACTIVE' ? 'var(--forest-deep)' : (lease.status === 'PENDING' ? 'var(--gold-deep)' : '#64748B')
                          }}
                        >
                          {lease.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {lease.status === 'PENDING' && (
                            <button
                              onClick={() => approveMutation.mutate(lease.id)}
                              className="btn btn-primary btn-sm"
                              title="Approve & activate lease"
                              style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                            >
                              <Check size={14} /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => setViewingLease(lease)}
                            className="btn btn-outline btn-sm"
                            title="View agreement details"
                            style={{ padding: '6px 8px' }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to terminate this lease agreement?`)) {
                                deleteMutation.mutate(lease.id);
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            title="Terminate lease"
                            style={{ padding: '6px 8px', color: '#DC2626', borderColor: '#FCA5A5' }}
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
        )}
      </div>

      {/* View Agreement Details Modal */}
      {viewingLease && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                Lease Agreement Details
              </h2>
              <button onClick={() => setViewingLease(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--paper-dim)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{viewingLease.property?.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{viewingLease.property?.address}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Tenant Name</span>
                <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{viewingLease.tenant_name || viewingLease.tenant?.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Phone Contact</span>
                <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{viewingLease.tenant?.phone_number || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Advance Duration</span>
                <div style={{ fontWeight: 700, fontSize: '14.5px' }}>
                  {viewingLease.duration_months ? Math.round(viewingLease.duration_months / 12) : 1} Year ({viewingLease.duration_months || 12} Months)
                </div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Monthly Rate</span>
                <div style={{ fontWeight: 700, fontSize: '14.5px' }}>GH₵{viewingLease.rent_amount?.toLocaleString()}/mo</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Lease Start Date</span>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{format(new Date(viewingLease.start_date), 'MMMM d, yyyy')}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Lease End Date</span>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{format(new Date(viewingLease.end_date), 'MMMM d, yyyy')}</div>
              </div>
            </div>

            <div style={{ background: '#E1EAE0', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: 600, color: 'var(--forest-deep)' }}>Total Advance Contract Value:</span>
              <b style={{ fontSize: '18px', color: 'var(--forest-deep)' }}>
                GH₵{(viewingLease.advance_payment || (viewingLease.rent_amount * (viewingLease.duration_months || 12))).toLocaleString()}
              </b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
