import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../../components/common/MatIcon';
import { format } from 'date-fns';
import GeneratePaymentsModal from '../../components/dashboard/GeneratePaymentsModal';
import RecordPaymentModal from '../../components/dashboard/RecordPaymentModal';

export default function RentRollView() {
  const [expandedLeaseId, setExpandedLeaseId] = useState(null);
  const [generateModalLease, setGenerateModalLease] = useState(null);
  const [recordPaymentModalPayment, setRecordPaymentModalPayment] = useState(null);

  const { data: leases, isLoading, error } = useQuery({
    queryKey: ['rentRoll'],
    queryFn: async () => {
      const res = await axiosClient.get('/rent-roll');
      return res.data;
    }
  });

  const toggleRow = (id) => {
    setExpandedLeaseId(expandedLeaseId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading rent roll data...
      </div>
    );
  }

  if (error) {
    return <div className="panel" style={{ color: '#E41E3F', padding: '24px' }}>Failed to load rent roll data.</div>;
  }

  // Calculate Metrics
  let totalExpected = 0;
  let totalCollected = 0;
  let totalOverdue = 0;

  leases?.forEach(lease => {
    lease.payments?.forEach(payment => {
      totalExpected += payment.amount;
      if (payment.status === 'PAID') {
        totalCollected += payment.amount;
      } else {
        const isOverdue = new Date(payment.due_date) < new Date();
        if (isOverdue) totalOverdue += payment.amount;
      }
    });
  });

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Rent Roll</h1>
          <p>Track lease standings and manage tenant payments.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="receipt_long" size={22} />
            </div>
            <span className="delta" style={{ background: 'var(--fb-hover)', color: 'var(--fb-text)' }}>Portfolio</span>
          </div>
          <b>GH₵{totalExpected.toLocaleString()}</b>
          <span>Total expected rent</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              <MatIcon name="payments" size={22} />
            </div>
            <span className="delta">Collected</span>
          </div>
          <b>GH₵{totalCollected.toLocaleString()}</b>
          <span>Total collected rent</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              <MatIcon name="warning" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFEBEA', color: '#E41E3F' }}>Attention</span>
          </div>
          <b style={{ color: totalOverdue > 0 ? '#E41E3F' : 'inherit' }}>GH₵{totalOverdue.toLocaleString()}</b>
          <span>Total overdue rent</span>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Tenant</th>
                <th>Building & Unit</th>
                <th>Lease Term</th>
                <th>Rent/Month</th>
                <th>Financial Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leases?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
                    No active leases found.
                  </td>
                </tr>
              )}
              {leases?.map(lease => {
                const totalLeaseExpected = lease.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                const totalLeasePaid = lease.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0;
                const hasPayments = lease.payments?.length > 0;
                const isExpanded = expandedLeaseId === lease.id;

                return (
                  <React.Fragment key={lease.id}>
                    <tr style={{ background: isExpanded ? 'var(--fb-hover)' : 'transparent', cursor: 'pointer' }} onClick={() => toggleRow(lease.id)}>
                      <td style={{ color: 'var(--fb-text-secondary)' }}>
                        <MatIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={20} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>{lease.tenant_name || 'Unknown'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>{lease.property?.title}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)' }}>
                          Unit {lease.room?.room_number}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13.5px' }}>
                          {format(new Date(lease.start_date), 'MMM d, yyyy')} - {format(new Date(lease.end_date), 'MMM d, yyyy')}
                        </div>
                        <span className={`status ${lease.status === 'ACTIVE' ? 'paid' : 'vacant'}`} style={{ marginTop: '4px' }}>
                          {lease.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>GH₵{lease.rent_amount?.toLocaleString()}</div>
                      </td>
                      <td>
                        {!hasPayments ? (
                          <span style={{ color: 'var(--fb-text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MatIcon name="warning" size={15} /> Uninvoiced
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: totalLeasePaid >= totalLeaseExpected ? 'var(--fb-success-text)' : 'var(--fb-text)' }}>
                              GH₵{totalLeasePaid.toLocaleString()} / GH₵{totalLeaseExpected.toLocaleString()}
                            </div>
                            <div style={{ width: '100px', height: '6px', background: 'var(--fb-border)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: 'var(--fb-success-text)', 
                                width: `${totalLeaseExpected > 0 ? (totalLeasePaid / totalLeaseExpected) * 100 : 0}%` 
                              }}></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        {!hasPayments && (
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => setGenerateModalLease(lease)}
                          >
                            <MatIcon name="description" size={15} /> Generate Invoices
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Payment Ledger */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" style={{ padding: '0', borderBottom: 'none' }}>
                          <div style={{ background: 'var(--fb-bg)', padding: '20px 32px', borderBottom: '1px solid var(--fb-border)' }}>
                            <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '12px', color: 'var(--fb-text)' }}>Payment Ledger</h4>
                            
                            {!hasPayments ? (
                              <div style={{ padding: '20px', textAlign: 'center', background: '#fff', borderRadius: '10px', border: '1px dashed var(--fb-border)' }}>
                                <p style={{ color: 'var(--fb-text-secondary)', marginBottom: '12px' }}>No payment schedules generated for this lease.</p>
                                <button className="btn btn-primary" onClick={() => setGenerateModalLease(lease)}>Generate Invoices</button>
                              </div>
                            ) : (
                              <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--fb-border)' }}>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Amount</th>
                                      <th>Due Date</th>
                                      <th>Status</th>
                                      <th>Date Paid</th>
                                      <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {lease.payments.map((payment) => (
                                      <tr key={payment.id}>
                                        <td style={{ fontWeight: 600 }}>GH₵{payment.amount?.toLocaleString()}</td>
                                        <td>{format(new Date(payment.due_date), 'MMM d, yyyy')}</td>
                                        <td>
                                          <span className={`status ${payment.status === 'PAID' ? 'paid' : (new Date(payment.due_date) < new Date() ? 'overdue' : 'due')}`}>
                                            {payment.status === 'PAID' ? 'PAID' : (new Date(payment.due_date) < new Date() ? 'OVERDUE' : 'DUE')}
                                          </span>
                                        </td>
                                        <td style={{ color: 'var(--fb-text-secondary)' }}>
                                          {payment.paid_date ? format(new Date(payment.paid_date), 'MMM d, yyyy') : '—'}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                          {payment.status !== 'PAID' ? (
                                            <button 
                                              className="btn btn-outline btn-sm" 
                                              onClick={() => setRecordPaymentModalPayment(payment)}
                                            >
                                              <MatIcon name="check_circle" size={14} /> Record Payment
                                            </button>
                                          ) : (
                                            <span style={{ color: 'var(--fb-success-text)', fontSize: '13px', fontWeight: 600 }}>Completed</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {generateModalLease && (
        <GeneratePaymentsModal 
          lease={generateModalLease} 
          onClose={() => setGenerateModalLease(null)} 
        />
      )}

      {recordPaymentModalPayment && (
        <RecordPaymentModal 
          payment={recordPaymentModalPayment} 
          onClose={() => setRecordPaymentModalPayment(null)} 
        />
      )}
    </>
  );
}
