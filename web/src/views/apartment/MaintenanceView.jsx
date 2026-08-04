import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { Wrench, Plus, Edit2, Trash2 } from 'lucide-react';
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
      <div className="space-y-6 animate-pulse">
        <div className="dash-topbar">
          <div><div className="h-8 bg-slate-200 rounded w-1/4"></div></div>
        </div>
        <div className="panel h-64 bg-slate-200"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">Failed to load maintenance data.</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Maintenance</h1>
          <p>Track and manage maintenance requests and repairs.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddTicket}>
          <Plus size={16} /> Log Issue
        </button>
      </div>

      <div className="panel">
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th style={{width: '40px'}}>#</th>
                <th>Issue</th>
                <th>Building & Unit</th>
                <th>Reported By</th>
                <th>Date Logged</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
                    No maintenance tickets found. Click "Log Issue" to create one.
                  </td>
                </tr>
              )}
              {tickets?.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td style={{color: 'var(--ink-soft)', fontWeight: '500'}}>{index + 1}</td>
                  <td>
                    <div style={{fontWeight: '600'}}>{ticket.title}</div>
                    <div style={{fontSize: '12px', color: 'var(--ink-soft)'}}>
                      <span style={{ fontWeight: 500, marginRight: '4px' }}>{ticket.type}</span> 
                      {ticket.description ? `- ${ticket.description.substring(0, 30)}${ticket.description.length > 30 ? '...' : ''}` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight: '500'}}>{ticket.property?.title}</div>
                    <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>
                      {ticket.room ? `Unit ${ticket.room.room_number}` : 'Common Area'}
                    </div>
                  </td>
                  <td>
                    <div style={{fontSize: '14px'}}>{ticket.reported_by?.name || 'Unknown'}</div>
                  </td>
                  <td>
                    <div style={{fontSize: '14px'}}>
                      {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                      background: ticket.status === 'RESOLVED' ? '#e6f7ec' : 
                                  ticket.status === 'IN_PROGRESS' ? '#e0e7ff' : 
                                  ticket.status === 'URGENT' ? '#fee2e2' : '#fef3c7',
                      color: ticket.status === 'RESOLVED' ? '#0f7b40' : 
                             ticket.status === 'IN_PROGRESS' ? '#3730a3' : 
                             ticket.status === 'URGENT' ? '#991b1b' : '#b45309'
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '6px', minHeight: '32px'}} 
                        title="Edit Ticket"
                        onClick={() => handleEditTicket(ticket)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '6px', minHeight: '32px', color: 'var(--brick-deep)', borderColor: 'var(--brick-pale)'}} 
                        title="Delete Ticket"
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} />
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
