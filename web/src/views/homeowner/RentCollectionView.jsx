import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import MatIcon from '../../components/common/MatIcon';
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
  const allPayments = useMemo(() => {
    const list = [];
    leases.forEach((lease) => {
      if (lease.payments && lease.payments.length > 0) {
        lease.payments.forEach((p) => {
          list.push({
            ...p,
            lease,
            property: lease.property,
            tenant: lease.tenant_name || lease.tenant?.name || 'Tenant',
            tenant_phone: lease.tenant?.phone_number || ''
          });
        });
      } else {
        list.push({
          id: `lease-advance-${lease.id}`,
          isVirtual: true,
          lease_id: lease.id,
          amount: lease.advance_payment || (lease.rent_amount * (lease.duration_months || 12)),
          due_date: lease.start_date,
          status: 'PAID',
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
  const paidPayments = allPayments.filter((p) => p.status === 'PAID');
  const duePayments = allPayments.filter((p) => p.status === 'DUE');
  const overduePayments = allPayments.filter((p) => p.status === 'OVERDUE');

  const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = duePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  // Filtered
  const filtered = allPayments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (p.tenant || '').toLowerCase().includes(q) || (p.property?.title || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  return (
    <div>
      <div className="dash-topbar">
        <div>
          <h1>Rent collection</h1>
          <p>Track multi-year advance payments, due dates, and payment history.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="payments" size={22} />
            </div>
            <span className="delta">Collected</span>
          </div>
          <b>GH₵{totalCollected.toLocaleString()}</b>
          <span>Total rent collected</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              <MatIcon name="schedule" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              Pending
            </span>
          </div>
          <b>GH₵{totalDue.toLocaleString()}</b>
          <span>Rent payments due</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              <MatIcon name="warning" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              Attention
            </span>
          </div>
          <b>GH₵{totalOverdue.toLocaleString()}</b>
          <span>Overdue payments ({overduePayments.length})</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: 'var(--fb-hover)', color: 'var(--fb-primary)' }}>
              <MatIcon name="receipt_long" size={22} />
            </div>
            <span className="delta" style={{ background: 'var(--fb-hover)', color: 'var(--fb-text)' }}>
              Transactions
            </span>
          </div>
          <b>{allPayments.length}</b>
          <span>Total payment records</span>
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
              placeholder="Search by tenant name or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', borderRadius: '20px', height: '40px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PAID', 'DUE', 'OVERDUE'].map((st) => (
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
                {st === 'ALL' ? 'All Payments' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
            Loading payments...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#E41E3F' }}>
            Failed to load payment records.
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
              <MatIcon name="payments" size={28} />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fb-text)' }}>No payments found</h2>
            <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '420px', margin: '0 auto', fontSize: '14px' }}>
              {searchTerm ? 'No payments match your search filter.' : 'No payment records found for your properties yet.'}
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
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--fb-text-secondary)', fontWeight: '600' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--fb-text)' }}>{p.tenant}</div>
                      {p.tenant_phone && <div style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>{p.tenant_phone}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--fb-text)' }}>{p.property?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--fb-text-secondary)' }}>{p.property?.address || 'Accra'}</div>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--fb-text)' }}>
                      GH₵{p.amount?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '13.5px' }}>
                      {p.due_date ? format(new Date(p.due_date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ fontSize: '13.5px', color: 'var(--fb-text-secondary)' }}>
                      {p.paid_date ? format(new Date(p.paid_date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <span className={`status ${p.status === 'PAID' ? 'paid' : (p.status === 'OVERDUE' ? 'overdue' : 'due')}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {p.status !== 'PAID' && !p.isVirtual && (
                        <button
                          onClick={() => handleRecordPayment(p)}
                          className="btn btn-primary btn-sm"
                        >
                          Record Paid
                        </button>
                      )}
                      {p.status === 'PAID' && (
                        <span style={{ fontSize: '12.5px', color: 'var(--fb-success-text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MatIcon name="check_circle" size={16} /> Settled
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
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '460px' }}>
            <div className="modal-head">
              <h2>Record Received Payment</h2>
              <button onClick={() => setRecordingPayment(null)}>
                <MatIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={submitRecordPayment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--fb-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--fb-border)' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Tenant</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--fb-text)', marginTop: '2px' }}>{recordingPayment.tenant}</div>
                  
                  <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: '12px' }}>Amount Due</div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--fb-success-text)', marginTop: '2px' }}>
                    GH₵{recordingPayment.amount?.toLocaleString()}
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Received Date *</label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-foot">
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
