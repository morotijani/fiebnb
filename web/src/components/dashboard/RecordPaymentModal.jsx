import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { format } from 'date-fns';
import MatIcon from '../common/MatIcon';

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
          <button type="button" onClick={onClose} aria-label="Close">
            <MatIcon name="close" size={20} />
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
