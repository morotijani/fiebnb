import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Wallet, ChevronDown, ChevronUp, CheckCircle, FileText, AlertCircle } from 'lucide-react';
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
      <div className="space-y-6 animate-pulse">
        <div className="dash-topbar">
          <div><div className="h-8 bg-slate-200 rounded w-1/4"></div></div>
        </div>
        <div className="panel h-64 bg-slate-200"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">Failed to load rent roll data.</div>;
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
        // Simple overdue check
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

      <div className="metric-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--cloud)' }}>
          <div style={{ color: 'var(--ink-soft)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Expected Rent</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--ink)' }}>GH₵{totalExpected.toLocaleString()}</div>
        </div>
        <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--cloud)' }}>
          <div style={{ color: 'var(--ink-soft)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Collected</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f7b40' }}>GH₵{totalCollected.toLocaleString()}</div>
        </div>
        <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--cloud)' }}>
          <div style={{ color: 'var(--ink-soft)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Overdue</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b' }}>GH₵{totalOverdue.toLocaleString()}</div>
        </div>
      </div>

      <div className="panel">
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th style={{width: '40px'}}></th>
                <th>Tenant</th>
                <th>Building & Unit</th>
                <th>Lease Term</th>
                <th>Rent/Month</th>
                <th>Financial Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leases?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
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
                    <tr style={{ background: isExpanded ? '#f8fafc' : 'transparent', cursor: 'pointer' }} onClick={() => toggleRow(lease.id)}>
                      <td style={{ color: 'var(--ink-soft)' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td>
                        <div style={{fontWeight: '600'}}>{lease.tenant_name || 'Unknown'}</div>
                      </td>
                      <td>
                        <div style={{fontWeight: '500'}}>{lease.property?.title}</div>
                        <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>
                          Unit {lease.room?.room_number}
                        </div>
                      </td>
                      <td>
                        <div style={{fontSize: '14px'}}>
                          {format(new Date(lease.start_date), 'MMM d, yyyy')} - {format(new Date(lease.end_date), 'MMM d, yyyy')}
                        </div>
                        <span style={{
                          display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500',
                          background: lease.status === 'ACTIVE' ? '#e6f7ec' : '#f1f3f5',
                          color: lease.status === 'ACTIVE' ? '#0f7b40' : '#495057',
                          marginTop: '4px'
                        }}>
                          {lease.status}
                        </span>
                      </td>
                      <td>
                        <div style={{fontWeight: '500'}}>GH₵{lease.rent_amount}</div>
                      </td>
                      <td>
                        {!hasPayments ? (
                          <span style={{color: 'var(--ink-soft)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <AlertCircle size={14} /> Uninvoiced
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: totalLeasePaid >= totalLeaseExpected ? '#0f7b40' : 'var(--ink)'}}>
                              GH₵{totalLeasePaid} / GH₵{totalLeaseExpected} Paid
                            </div>
                            <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: '#0f7b40', 
                                width: `${totalLeaseExpected > 0 ? (totalLeasePaid / totalLeaseExpected) * 100 : 0}%` 
                              }}></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{textAlign: 'right'}} onClick={(e) => e.stopPropagation()}>
                        {!hasPayments && (
                          <button 
                            className="btn btn-outline" 
                            style={{padding: '6px 12px', fontSize: '13px'}}
                            onClick={() => setGenerateModalLease(lease)}
                          >
                            <FileText size={14} style={{marginRight: '6px'}} /> 
                            Generate Invoices
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Payment Ledger */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" style={{ padding: '0', borderBottom: 'none' }}>
                          <div style={{ background: '#f8fafc', padding: '20px 40px', borderBottom: '1px solid var(--cloud)' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--ink-soft)' }}>Payment Ledger</h4>
                            
                            {!hasPayments ? (
                              <div style={{ padding: '20px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px dashed var(--cloud)' }}>
                                <p style={{ color: 'var(--ink-soft)', marginBottom: '12px' }}>No payment schedules generated for this lease.</p>
                                <button className="btn btn-primary" onClick={() => setGenerateModalLease(lease)}>Generate Invoices</button>
                              </div>
                            ) : (
                              <table style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--cloud)' }}>
                                <thead>
                                  <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--ink-soft)' }}>Amount</th>
                                    <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--ink-soft)' }}>Due Date</th>
                                    <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--ink-soft)' }}>Status</th>
                                    <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--ink-soft)' }}>Date Paid</th>
                                    <th style={{ padding: '10px 16px', fontSize: '12px', textAlign: 'right' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lease.payments.map((payment, idx) => (
                                    <tr key={payment.id} style={{ borderTop: idx > 0 ? '1px solid var(--cloud)' : 'none' }}>
                                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>GH₵{payment.amount}</td>
                                      <td style={{ padding: '12px 16px' }}>{format(new Date(payment.due_date), 'MMM d, yyyy')}</td>
                                      <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                          display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                                          background: payment.status === 'PAID' ? '#e6f7ec' : 
                                                      (new Date(payment.due_date) < new Date() && payment.status !== 'PAID') ? '#fee2e2' : '#fef3c7',
                                          color: payment.status === 'PAID' ? '#0f7b40' : 
                                                 (new Date(payment.due_date) < new Date() && payment.status !== 'PAID') ? '#991b1b' : '#b45309'
                                        }}>
                                          {payment.status === 'PAID' ? 'PAID' : (new Date(payment.due_date) < new Date() ? 'OVERDUE' : 'DUE')}
                                        </span>
                                      </td>
                                      <td style={{ padding: '12px 16px', color: 'var(--ink-soft)' }}>
                                        {payment.paid_date ? format(new Date(payment.paid_date), 'MMM d, yyyy') : '-'}
                                      </td>
                                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        {payment.status !== 'PAID' ? (
                                          <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'auto' }}
                                            onClick={() => setRecordPaymentModalPayment(payment)}
                                          >
                                            <CheckCircle size={14} style={{ marginRight: '4px' }} /> Record Payment
                                          </button>
                                        ) : (
                                          <span style={{ color: '#0f7b40', fontSize: '13px', fontWeight: '500' }}>Completed</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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
