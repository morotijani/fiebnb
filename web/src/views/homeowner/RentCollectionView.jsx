import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Banknote,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  X
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function RentCollectionView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [recordingPayment, setRecordingPayment] = useState(null);
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch rent roll (leases with payments)
  const { data: leases = [], isLoading, error } = useQuery({
    queryKey: ['homeownerRentRoll'],
    queryFn: async () => {
      const res = await axiosClient.get('/rent-roll');
      return res.data;
    }
  });

  // Flatten payments with lease context
  const allPayments = React.useMemo(() => {
    const list = [];
    leases.forEach(lease => {
      if (lease.payments && lease.payments.length > 0) {
        lease.payments.forEach(p => {
          list.push({
            ...p,
            lease,
            property: lease.property,
            tenant: lease.tenant_name || lease.tenant?.name || 'Tenant',
            tenant_phone: lease.tenant?.phone_number || ''
          });
        });
      } else {
        // If lease has no generated payment records yet, present the upfront lease payment
        list.push({
          id: `lease-advance-${lease.id}`,
          isVirtual: true,
          lease_id: lease.id,
          amount: lease.advance_payment || (lease.rent_amount * (lease.duration_months || 12)),
          due_date: lease.start_date,
          status: 'PAID', // Upfront paid at lease start
          paid_date: lease.start_date,
          lease,
          property: lease.property,
          tenant: lease.tenant_name || lease.tenant?.name || 'Tenant',
          tenant_phone: lease.tenant?.phone_number || ''
        });
      }
    });
    return list.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
  }, [leases]);

  // Mark payment as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async ({ paymentId, paidDate }) => {
      return axiosClient.post(`/rent-roll/payments/${paymentId}/pay`, { paid_date: paidDate });
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      queryClient.invalidateQueries(['homeownerRentRoll']);
      queryClient.invalidateQueries(['homeownerSummary']);
      setRecordingPayment(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    }
  });

  const handleRecordPayment = (payment) => {
    setRecordingPayment(payment);
    setPaidDate(new Date().toISOString().split('T')[0]);
  };

  const submitRecordPayment = (e) => {
    e.preventDefault();
    if (!recordingPayment) return;
    markPaidMutation.mutate({
      paymentId: recordingPayment.id,
      paidDate
    });
  };

  // Metrics
  const paidPayments = allPayments.filter(p => p.status === 'PAID');
  const duePayments = allPayments.filter(p => p.status === 'DUE');
  const overduePayments = allPayments.filter(p => p.status === 'OVERDUE');

  const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = duePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  // Filtered
  const filtered = allPayments.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (p.tenant || '').toLowerCase().includes(q) || (p.property?.title || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>Rent collection</h1>
          <p>Track multi-year advance payments, due dates, and payment history.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Banknote size={17} stroke="var(--forest-deep)" /></div>
            <span className="delta" style={{ background: '#E1EAE0', color: 'var(--forest-deep)' }}>Collected</span>
          </div>
          <b>GH₵{totalCollected.toLocaleString()}</b>
          <span>Total rent collected</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Clock size={17} stroke="var(--gold-deep)" /></div>
            <span className="delta" style={{ background: 'var(--gold-pale)', color: 'var(--gold-deep)' }}>Pending</span>
          </div>
          <b>GH₵{totalDue.toLocaleString()}</b>
          <span>Rent payments due</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><AlertTriangle size={17} stroke="#DC2626" /></div>
            <span className="delta" style={{ background: '#FEE2E2', color: '#DC2626' }}>Attention</span>
          </div>
          <b>GH₵{totalOverdue.toLocaleString()}</b>
          <span>Overdue payments ({overduePayments.length})</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Calendar size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Transactions</span>
          </div>
          <b>{allPayments.length}</b>
          <span>Total payment records</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
            <input
              type="text"
              placeholder="Search by tenant name or property..."
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
            {['ALL', 'PAID', 'DUE', 'OVERDUE'].map(st => (
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
                {st === 'ALL' ? 'All Payments' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading payments...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
            Failed to load payment records.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--sand)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={28} stroke="var(--brick-deep)" />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>No payments found</h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto', fontSize: '14px' }}>
              {searchTerm ? 'No payments match your search filter.' : 'No payment records found for your properties yet.'}
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
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Amount</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Due Date</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Paid Date</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--ink-soft)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '16px', color: 'var(--ink-soft)', fontWeight: '600' }}>{idx + 1}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{p.tenant}</div>
                      {p.tenant_phone && <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{p.tenant_phone}</div>}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{p.property?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{p.property?.address || 'Accra'}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 800, fontSize: '15px', color: 'var(--ink)' }}>
                      GH₵{p.amount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13.5px' }}>
                      {p.due_date ? format(new Date(p.due_date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
                      {p.paid_date ? format(new Date(p.paid_date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: p.status === 'PAID' ? '#E1EAE0' : (p.status === 'OVERDUE' ? '#FEE2E2' : 'var(--gold-pale)'),
                          color: p.status === 'PAID' ? 'var(--forest-deep)' : (p.status === 'OVERDUE' ? '#DC2626' : 'var(--gold-deep)')
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {p.status !== 'PAID' && !p.isVirtual && (
                        <button
                          onClick={() => handleRecordPayment(p)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Record Paid
                        </button>
                      )}
                      {p.status === 'PAID' && (
                        <span style={{ fontSize: '12px', color: 'var(--forest-deep)', fontWeight: 600 }}>
                          ✓ Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {recordingPayment && (
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
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Record Received Payment
              </h2>
              <button onClick={() => setRecordingPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRecordPayment}>
              <div style={{ background: 'var(--paper-dim)', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Tenant:</div>
                <div style={{ fontWeight: 700, fontSize: '14.5px' }}>{recordingPayment.tenant}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '8px' }}>Amount:</div>
                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--forest-deep)' }}>
                  GH₵{recordingPayment.amount?.toLocaleString()}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Payment Received Date
                </label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRecordingPayment(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={markPaidMutation.isPending} className="btn btn-primary">
                  {markPaidMutation.isPending ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
