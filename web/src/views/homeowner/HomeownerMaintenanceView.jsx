import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import MatIcon from '../../components/common/MatIcon';
import axiosClient from '../../api/axiosClient';

const CATEGORY_OPTIONS = [
  { value: 'droplet', label: 'Plumbing (Pipes, Taps, Drainage)', icon: 'water_drop', color: '#0284C7', bg: '#E0F2FE' },
  { value: 'zap', label: 'Electrical & Power (Wiring, Generator)', icon: 'bolt', color: '#D97706', bg: '#FEF3C7' },
  { value: 'wind', label: 'Appliance / AC (Air Conditioning, Fans)', icon: 'ac_unit', color: '#0D9488', bg: '#CCFBF1' },
  { value: 'door-closed', label: 'Security & Structural (Locks, Doors, Roof)', icon: 'door_front', color: '#475569', bg: '#F1F5F9' },
  { value: 'general', label: 'General Repairs & Servicing', icon: 'build', color: 'var(--fb-primary)', bg: '#E7F3FF' }
];

function getCategoryMeta(type) {
  const t = (type || '').toLowerCase();
  if (t === 'droplet' || t === 'plumbing') {
    return {
      label: 'Plumbing',
      icon: 'water_drop',
      color: '#0284C7',
      bg: '#E0F2FE'
    };
  }
  if (t === 'zap' || t === 'electrical') {
    return {
      label: 'Electrical',
      icon: 'bolt',
      color: '#D97706',
      bg: '#FEF3C7'
    };
  }
  if (t === 'wind' || t === 'appliance' || t === 'hvac' || t === 'ac') {
    return {
      label: 'Appliance / AC',
      icon: 'ac_unit',
      color: '#0D9488',
      bg: '#CCFBF1'
    };
  }
  if (t === 'door-closed' || t === 'structural' || t === 'security' || t === 'lock') {
    return {
      label: 'Security & Structural',
      icon: 'door_front',
      color: '#475569',
      bg: '#F1F5F9'
    };
  }
  return {
    label: 'General',
    icon: 'build',
    color: 'var(--fb-primary)',
    bg: '#E7F3FF'
  };
}

export default function HomeownerMaintenanceView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    property_id: '',
    title: '',
    description: '',
    type: 'droplet',
    status: 'SCHEDULED'
  });

  // Fetch tickets
  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['maintenanceTickets'],
    queryFn: async () => {
      const res = await axiosClient.get('/maintenance');
      return res.data;
    }
  });

  // Fetch homeowner properties
  const { data: properties = [] } = useQuery({
    queryKey: ['homeownerProperties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  // Summary Metrics
  const metrics = useMemo(() => {
    let openCount = 0;
    let urgentCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;

    tickets.forEach(t => {
      if (t.status === 'RESOLVED') {
        resolvedCount++;
      } else {
        openCount++;
        if (t.status === 'URGENT') urgentCount++;
        if (t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED') inProgressCount++;
      }
    });

    return { openCount, urgentCount, inProgressCount, resolvedCount };
  }, [tickets]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingTicket) {
        return axiosClient.put(`/maintenance/${editingTicket.id}`, payload);
      }
      return axiosClient.post('/maintenance', payload);
    },
    onSuccess: () => {
      toast.success(editingTicket ? 'Maintenance ticket updated' : 'Maintenance issue logged');
      queryClient.invalidateQueries(['maintenanceTickets']);
      queryClient.invalidateQueries(['homeownerSummary']);
      setIsModalOpen(false);
      setEditingTicket(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save maintenance ticket');
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return axiosClient.put(`/maintenance/${id}`, { status });
    },
    onSuccess: () => {
      toast.success('Ticket status updated');
      queryClient.invalidateQueries(['maintenanceTickets']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update ticket status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.delete(`/maintenance/${id}`);
    },
    onSuccess: () => {
      toast.success('Maintenance ticket removed');
      queryClient.invalidateQueries(['maintenanceTickets']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete ticket');
    }
  });

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        ticket.title?.toLowerCase().includes(term) ||
        ticket.description?.toLowerCase().includes(term) ||
        ticket.property?.title?.toLowerCase().includes(term) ||
        ticket.property?.address?.toLowerCase().includes(term) ||
        ticket.reported_by?.name?.toLowerCase().includes(term) ||
        ticket.property?.leases?.[0]?.tenant?.name?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (statusFilter !== 'ALL' && ticket.status !== statusFilter) return false;

      if (categoryFilter !== 'ALL') {
        const catMeta = getCategoryMeta(ticket.type);
        const filterMeta = getCategoryMeta(categoryFilter);
        if (catMeta.label !== filterMeta.label) return false;
      }

      if (propertyFilter !== 'ALL' && ticket.property_id !== propertyFilter) return false;

      return true;
    });
  }, [tickets, searchTerm, statusFilter, categoryFilter, propertyFilter]);

  const openAddModal = () => {
    setEditingTicket(null);
    setFormData({
      property_id: properties[0]?.id || '',
      title: '',
      description: '',
      type: 'droplet',
      status: 'SCHEDULED'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      property_id: ticket.property_id,
      title: ticket.title,
      description: ticket.description || '',
      type: ticket.type || 'general',
      status: ticket.status || 'SCHEDULED'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.property_id || !formData.title.trim()) {
      toast.error('Please select a property and enter an issue title.');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (ticket) => {
    if (window.confirm(`Are you sure you want to delete "${ticket.title}"?`)) {
      deleteMutation.mutate(ticket.id);
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="dash-topbar">
        <div>
          <h1>Maintenance & Repairs</h1>
          <p>Track, manage, and resolve repair requests across your residential properties.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <MatIcon name="add" size={18} /> Log Issue
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="build" size={22} />
            </div>
            <span
              className="delta"
              style={{
                background: metrics.urgentCount > 0 ? '#FFEBEA' : '#E7F8ED',
                color: metrics.urgentCount > 0 ? '#E41E3F' : '#0F7B40'
              }}
            >
              {metrics.urgentCount > 0 ? `${metrics.urgentCount} urgent` : 'Active'}
            </span>
          </div>
          <b>{metrics.openCount}</b>
          <span>Open maintenance requests</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              <MatIcon name="warning" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFEBEA', color: '#E41E3F' }}>
              High priority
            </span>
          </div>
          <b style={{ color: metrics.urgentCount > 0 ? '#E41E3F' : 'inherit' }}>{metrics.urgentCount}</b>
          <span>Urgent attention required</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              <MatIcon name="schedule" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              In flight
            </span>
          </div>
          <b>{metrics.inProgressCount}</b>
          <span>In progress or scheduled</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              <MatIcon name="check_circle" size={22} />
            </div>
            <span className="delta" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              Completed
            </span>
          </div>
          <b>{metrics.resolvedCount}</b>
          <span>Resolved repairs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ marginBottom: '20px', padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Top row: search + dropdowns */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <MatIcon
                name="search"
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Search issues, properties, tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', height: '40px', width: '100%', borderRadius: '20px' }}
              />
            </div>

            {/* Property Filter */}
            <div style={{ minWidth: '200px' }}>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="form-control"
                style={{ height: '40px', borderRadius: '8px' }}
              >
                <option value="ALL">All Properties</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ minWidth: '180px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-control"
                style={{ height: '40px', borderRadius: '8px' }}
              >
                <option value="ALL">All Categories</option>
                <option value="droplet">Plumbing</option>
                <option value="zap">Electrical</option>
                <option value="wind">Appliance / AC</option>
                <option value="door-closed">Security & Structural</option>
                <option value="general">General Maintenance</option>
              </select>
            </div>
          </div>

          {/* Bottom row: status pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fb-text-secondary)', marginRight: '4px' }}>
              Status:
            </span>
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'URGENT', label: 'Urgent' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'SCHEDULED', label: 'Scheduled' },
              { id: 'RESOLVED', label: 'Resolved' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: statusFilter === st.id ? '1px solid var(--fb-primary)' : '1px solid var(--fb-border)',
                  background: statusFilter === st.id ? 'var(--fb-primary-tint)' : '#FFFFFF',
                  color: statusFilter === st.id ? 'var(--fb-primary)' : 'var(--fb-text)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Tickets List */}
      <div className="panel" style={{ padding: '24px' }}>
        <div className="panel-head" style={{ marginBottom: '16px' }}>
          <h2>
            Maintenance Requests {filteredTickets.length > 0 && <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--fb-text-secondary)' }}>({filteredTickets.length})</span>}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--fb-text-secondary)' }}>
            Showing {filteredTickets.length} of {tickets.length} total tickets
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
            Loading maintenance requests...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#E41E3F' }}>
            Failed to load maintenance data.
          </div>
        ) : filteredTickets.length === 0 ? (
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
              <MatIcon name="build" size={28} />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fb-text)' }}>No maintenance requests found</h2>
            <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
              {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || propertyFilter !== 'ALL'
                ? 'No maintenance tickets match the selected search or filters.'
                : 'All properties are running smoothly! No maintenance issues have been recorded.'}
            </p>
            <button onClick={openAddModal} className="btn btn-primary">
              <MatIcon name="add" size={18} /> Log an Issue
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTickets.map((ticket) => {
              const cat = getCategoryMeta(ticket.type);

              let reporterText = 'Scheduled maintenance';
              if (ticket.reported_by?.name) {
                reporterText = `Reported by ${ticket.reported_by.name}`;
              } else if (ticket.property?.leases?.[0]?.tenant?.name) {
                reporterText = `Reported by ${ticket.property.leases[0].tenant.name}`;
              } else if (ticket.reported_by_id) {
                reporterText = 'Reported by caretaker';
              }

              let dateText = '';
              try {
                dateText = formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true });
              } catch (e) {
                dateText = format(new Date(ticket.createdAt), 'MMM d, yyyy');
              }

              return (
                <div
                  key={ticket.id}
                  className="ticket-row"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '18px 0',
                    borderBottom: '1px solid var(--fb-border-light)'
                  }}
                >
                  {/* Category Icon */}
                  <div
                    className="ic"
                    style={{
                      background: cat.bg,
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title={cat.label}
                  >
                    <MatIcon name={cat.icon} size={22} style={{ color: cat.color }} />
                  </div>

                  {/* Info details */}
                  <div className="info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <b style={{ fontSize: '15px', color: 'var(--fb-text)' }}>{ticket.title}</b>
                      
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: cat.bg,
                          color: cat.color
                        }}
                      >
                        {cat.label}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--fb-text-secondary)',
                        marginTop: '4px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--fb-text)' }}>
                        {ticket.property?.title}
                      </span>
                      <span>•</span>
                      <span>{reporterText}</span>
                      <span>•</span>
                      <span>{dateText}</span>
                    </div>

                    {ticket.description && (
                      <p
                        style={{
                          fontSize: '13.5px',
                          color: 'var(--fb-text)',
                          marginTop: '8px',
                          lineHeight: '1.45',
                          background: 'var(--fb-bg)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--fb-border)'
                        }}
                      >
                        {ticket.description}
                      </p>
                    )}
                  </div>

                  {/* Status & Quick Action Controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flexShrink: 0,
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span
                      className={`status ${
                        ticket.status === 'URGENT'
                          ? 'urgent'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'due'
                          : ticket.status === 'RESOLVED'
                          ? 'paid'
                          : 'vacant'
                      }`}
                    >
                      {ticket.status.replace('_', ' ').toLowerCase()}
                    </span>

                    <select
                      value={ticket.status}
                      onChange={(e) => statusMutation.mutate({ id: ticket.id, status: e.target.value })}
                      disabled={statusMutation.isPending}
                      style={{
                        fontSize: '12px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--fb-border)',
                        background: '#FFFFFF',
                        color: 'var(--fb-text)',
                        cursor: 'pointer'
                      }}
                      title="Update status directly"
                    >
                      <option value="URGENT">Set Urgent</option>
                      <option value="IN_PROGRESS">Set In Progress</option>
                      <option value="SCHEDULED">Set Scheduled</option>
                      <option value="RESOLVED">Set Resolved</option>
                    </select>

                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(ticket)}
                        className="btn btn-outline btn-sm"
                        title="Edit ticket details"
                        style={{ padding: '6px 8px', borderRadius: '6px' }}
                      >
                        <MatIcon name="edit" size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket)}
                        className="btn btn-outline btn-sm"
                        title="Delete ticket"
                        disabled={deleteMutation.isPending}
                        style={{ padding: '6px 8px', borderRadius: '6px', color: '#E41E3F', borderColor: '#FCA5A5' }}
                      >
                        <MatIcon name="delete" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log / Edit Ticket Modal */}
      {isModalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-head">
              <h2>{editingTicket ? 'Edit Maintenance Ticket' : 'Log Maintenance Issue'}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <MatIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Property *</label>
                  <select
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    className="form-control"
                    required
                  >
                    <option value="">Select residential property</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.address ? `(${p.address})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Issue Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Leaking kitchen tap, Generator not starting"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="form-control"
                      required
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority / Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="URGENT">Urgent (Immediate)</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description / Technician Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Provide observations, contractor info, or specific instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    style={{ resize: 'vertical' }}
                  />
                </div>

              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="btn btn-primary"
                >
                  {saveMutation.isPending ? 'Saving...' : (editingTicket ? 'Update Ticket' : 'Save Issue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
