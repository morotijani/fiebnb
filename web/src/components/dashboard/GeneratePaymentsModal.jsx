import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../common/MatIcon';

export default function GeneratePaymentsModal({ lease, onClose }) {
  const queryClient = useQueryClient();
  const [frequency, setFrequency] = useState('UPFRONT');

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post(`/rent-roll/${lease.id}/generate`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment schedule generated successfully');
      queryClient.invalidateQueries(['rentRoll']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to generate payments');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ frequency });
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-head">
          <h2>Generate Invoices</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <MatIcon name="close" size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '16px', color: 'var(--ink-soft)' }}>
            Generate the payment schedule for <strong>{lease.tenant_name || 'Tenant'}</strong>'s lease 
            in Unit {lease.room?.room_number || 'N/A'}.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Frequency</label>
              <select 
                value={frequency} 
                onChange={(e) => setFrequency(e.target.value)} 
                className="form-control"
              >
                <option value="UPFRONT">Upfront (Pay all months at once)</option>
                <option value="MONTHLY">Monthly (Pay month-by-month)</option>
              </select>
            </div>

            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Generating...' : 'Generate Invoices'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
