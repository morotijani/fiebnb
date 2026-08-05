import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { format } from 'date-fns';

export default function RecordPaymentModal({ payment, onClose }) {
  const queryClient = useQueryClient();
  const [paidDate, setPaidDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.put(`/rent-roll/payments/${payment.id}/pay`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries(['rentRoll']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ paid_date: paidDate });
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-head">
          <h2>Record Payment</h2>
          <button type="button" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '16px', color: 'var(--ink-soft)' }}>
            Mark this invoice of <strong>GH₵{payment.amount}</strong> as paid.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date Paid</label>
              <input 
                type="date" 
                value={paidDate} 
                onChange={(e) => setPaidDate(e.target.value)} 
                className="form-control"
                required
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
