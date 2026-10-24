import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../../components/common/MatIcon';
import { format } from 'date-fns';
import EditTicketModal from '../../components/dashboard/EditTicketModal';

export default function MaintenanceView() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['maintenanceTickets'],
    queryFn: async () => {
      const res = await axiosClient.get('/maintenance');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/maintenance/${id}`);
    },
    onSuccess: () => {
      toast.success('Maintenance ticket deleted successfully');
      queryClient.invalidateQueries(['maintenanceTickets']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete ticket');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance ticket? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading maintenance data...
      </div>
    );
  }

  if (error) {
    return <div className="panel" style={{ color: '#E41E3F', padding: '24px' }}>Failed to load maintenance data.</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Maintenance</h1>
          <p>Track and manage maintenance requests and repairs across apartment buildings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddTicket}>
          <MatIcon name="add" size={18} /> Log Issue
        </button>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Issue</th>
                <th>Building & Unit</th>
                <th>Reported By</th>
                <th>Date Logged</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
                    No maintenance tickets found. Click "Log Issue" to create one.
                  </td>
                </tr>
              )}
              {tickets?.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td style={{ color: 'var(--fb-text-secondary)', fontWeight: '600' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>{ticket.title}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)' }}>
                      <span style={{ fontWeight: 600, marginRight: '4px' }}>{ticket.type}</span> 
                      {ticket.description ? `- ${ticket.description.substring(0, 30)}${ticket.description.length > 30 ? '...' : ''}` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>{ticket.property?.title}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)' }}>
                      {ticket.room ? `Unit ${ticket.room.room_number}` : 'Common Area'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13.5px' }}>{ticket.reported_by?.name || 'Unknown'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13.5px' }}>
                      {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td>
                    <span className={`status ${
                      ticket.status === 'RESOLVED'
                        ? 'paid'
                        : ticket.status === 'IN_PROGRESS'
                        ? 'due'
                        : ticket.status === 'URGENT'
                        ? 'overdue'
                        : 'vacant'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ padding: '6px 8px' }} 
                        title="Edit Ticket"
                        onClick={() => handleEditTicket(ticket)}
                      >
                        <MatIcon name="edit" size={15} />
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ padding: '6px 8px', color: '#E41E3F', borderColor: '#FCA5A5' }} 
                        title="Delete Ticket"
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <MatIcon name="delete" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EditTicketModal 
          ticket={editingTicket} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
