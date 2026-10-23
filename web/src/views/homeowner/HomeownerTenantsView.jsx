import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Home,
  Calendar,
  Banknote,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  X
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function HomeownerTenantsView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    start_date: '',
    duration_months: 12,
    rent_amount: ''
  });

  // Fetch properties to choose from when adding a tenant
  const { data: properties = [] } = useQuery({
    queryKey: ['homeownerProperties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  // Fetch homeowner tenants
  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['homeownerTenants'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-tenants');
      return res.data;
    }
  });

  // Delete/End lease mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.delete(`/leases/${id}`);
    },
    onSuccess: () => {
      toast.success('Tenant lease removed successfully');
      queryClient.invalidateQueries(['homeownerTenants']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to remove tenant lease');
    }
  });

  // Add/Edit mutation
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingTenant) {
        return axiosClient.put(`/leases/${editingTenant.id}`, payload);
      }
      return axiosClient.post('/leases', payload);
    },
    onSuccess: () => {
      toast.success(editingTenant ? 'Tenant lease updated' : 'Tenant onboarded successfully');
      queryClient.invalidateQueries(['homeownerTenants']);
      queryClient.invalidateQueries(['homeownerSummary']);
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save tenant');
    }
  });

  const openAddModal = () => {
    setEditingTenant(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      property_id: properties[0]?.id || '',
      tenant_name: '',
      tenant_phone: '',
      tenant_email: '',
      start_date: today,
      duration_months: 12,
      rent_amount: properties[0]?.base_price || ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lease) => {
    setEditingTenant(lease);
    setFormData({
      property_id: lease.property_id || lease.property?.id || '',
      tenant_name: lease.tenant_name || lease.tenant?.name || '',
      tenant_phone: lease.tenant?.phone_number || '',
      tenant_email: lease.tenant?.email || '',
      start_date: lease.start_date ? new Date(lease.start_date).toISOString().split('T')[0] : '',
      duration_months: lease.duration_months || 12,
      rent_amount: lease.rent_amount || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
  };

  const handlePropertyChange = (propId) => {
    const selected = properties.find(p => p.id === propId);
    setFormData(prev => ({
      ...prev,
      property_id: propId,
      rent_amount: selected ? selected.base_price : prev.rent_amount
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.property_id || !formData.tenant_name.trim() || !formData.rent_amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(formData.duration_months));

    saveMutation.mutate({
      property_id: formData.property_id,
      tenant_name: formData.tenant_name.trim(),
      tenant_phone: formData.tenant_phone.trim(),
      tenant_email: formData.tenant_email.trim() || undefined,
      start_date: startDate,
      end_date: endDate,
      duration_months: parseInt(formData.duration_months),
      rent_amount: parseFloat(formData.rent_amount)
    });
  };

  // Metrics
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE');
  const totalMonthlyIncome = activeTenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
  const totalAdvanceCollected = activeTenants.reduce((sum, t) => sum + (t.advance_payment || (t.rent_amount * (t.duration_months || 12))), 0);
  const expiringSoonCount = activeTenants.filter(t => {
    const diff = differenceInDays(new Date(t.end_date), new Date());
    return diff <= 60 && diff >= 0;
  }).length;

  // Filtered tenants
  const filtered = tenants.filter(t => {
    const q = searchTerm.toLowerCase();
    const name = (t.tenant_name || t.tenant?.name || '').toLowerCase();
    const propTitle = (t.property?.title || '').toLowerCase();
    const phone = (t.tenant?.phone_number || '').toLowerCase();
    return name.includes(q) || propTitle.includes(q) || phone.includes(q);
  });

  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>Tenants</h1>
          <p>Manage long-term tenants, multi-year advance leases, and contact details.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Onboard Tenant
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Users size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Active</span>
          </div>
          <b>{activeTenants.length}</b>
          <span>Current residential tenants</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Clock size={17} stroke="var(--gold-deep)" /></div>
            <span className="delta" style={{ background: 'var(--gold-pale)', color: 'var(--gold-deep)' }}>Next 60 days</span>
          </div>
          <b>{expiringSoonCount}</b>
          <span>Renewals pending</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Banknote size={17} stroke="var(--forest-deep)" /></div>
            <span className="delta" style={{ background: '#E1EAE0', color: 'var(--forest-deep)' }}>Monthly</span>
          </div>
          <b>GH₵{totalMonthlyIncome.toLocaleString()}</b>
          <span>Total monthly rent rate</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Banknote size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Advance Volume</span>
          </div>
          <b>GH₵{totalAdvanceCollected.toLocaleString()}</b>
          <span>Total advance contract value</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
            <input
              type="text"
              placeholder="Search by tenant name, property title, or phone number..."
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
        </div>
      </div>

      {/* Tenants Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading tenant records...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
            Failed to load tenants.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--sand)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} stroke="var(--brick-deep)" />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>No tenants found</h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
              {searchTerm ? 'No tenants match your search.' : 'You currently do not have any tenants onboarded. Click "Onboard Tenant" to add a lease agreement.'}
            </p>
            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={16} /> Onboard Tenant
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--paper-dim)' }}>
                  <th style={{ width: '40px', padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>#</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Tenant</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Rented Property</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Advance Term</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Monthly Rent</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Total Advance</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Lease Period &amp; Renewal</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink-soft)' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--ink-soft)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lease, index) => {
                  const daysUntilExpiry = differenceInDays(new Date(lease.end_date), new Date());
                  const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry >= 0 && lease.status === 'ACTIVE';
                  const isExpired = daysUntilExpiry < 0 && lease.status === 'ACTIVE';
                  const durationYears = lease.duration_months ? Math.round(lease.duration_months / 12) : 1;
                  const totalAdvance = lease.advance_payment || (lease.rent_amount * (lease.duration_months || 12));

                  return (
                    <tr key={lease.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px', color: 'var(--ink-soft)', fontWeight: '600' }}>{index + 1}</td>

                      {/* Tenant Contact */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--ink)' }}>
                          {lease.tenant_name || lease.tenant?.name || 'Unknown Tenant'}
                        </div>
                        {lease.tenant?.phone_number && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            <Phone size={12} /> {lease.tenant.phone_number}
                          </div>
                        )}
                        {lease.tenant?.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ink-soft)' }}>
                            <Mail size={12} /> {lease.tenant.email}
                          </div>
                        )}
                      </td>

                      {/* Property */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {lease.property?.title || 'Residential Property'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                          {lease.property?.address || 'Accra, Ghana'}
                        </div>
                      </td>

                      {/* Advance Term */}
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: 'var(--sand)',
                            color: 'var(--ink)'
                          }}
                        >
                          {durationYears} Year{durationYears > 1 ? 's' : ''} ({lease.duration_months || 12} mos)
                        </span>
                      </td>

                      {/* Monthly Rent */}
                      <td style={{ padding: '16px', fontWeight: 600 }}>
                        GH₵{lease.rent_amount?.toLocaleString()}/mo
                      </td>

                      {/* Total Advance */}
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                        GH₵{totalAdvance.toLocaleString()}
                      </td>

                      {/* Lease Period */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '13px' }}>
                          {format(new Date(lease.start_date), 'MMM d, yyyy')} – {format(new Date(lease.end_date), 'MMM d, yyyy')}
                        </div>
                        {isExpiringSoon && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                            <AlertTriangle size={12} />
                            Renewal in {daysUntilExpiry} days
                          </div>
                        )}
                        {isExpired && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#991B1B', background: '#FEE2E2', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                            <AlertTriangle size={12} />
                            Lease Expired
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: lease.status === 'ACTIVE' ? '#E1EAE0' : (lease.status === 'PENDING' ? 'var(--gold-pale)' : '#F1F5F9'),
                            color: lease.status === 'ACTIVE' ? 'var(--forest-deep)' : (lease.status === 'PENDING' ? 'var(--gold-deep)' : '#64748B')
                          }}
                        >
                          {lease.status === 'ACTIVE' ? 'Active' : (lease.status === 'PENDING' ? 'Pending' : lease.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(lease)}
                            className="btn btn-outline btn-sm"
                            title="Edit lease"
                            style={{ padding: '6px 8px' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to end or remove the lease for ${lease.tenant_name || 'this tenant'}?`)) {
                                deleteMutation.mutate(lease.id);
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            title="Remove lease"
                            style={{ padding: '6px 8px', color: '#DC2626', borderColor: '#FCA5A5' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard / Edit Tenant Modal */}
      {isModalOpen && (
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
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                {editingTenant ? 'Edit Tenant Lease' : 'Onboard New Tenant'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Select Property *
                </label>
                <select
                  value={formData.property_id}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — GH₵{p.base_price.toLocaleString()}/mo ({p.address || 'Accra'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Tenant Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kwesi Mensah"
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0244123456"
                    value={formData.tenant_phone}
                    onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. tenant@example.com"
                    value={formData.tenant_email}
                    onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Lease Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Advance Lease Period
                  </label>
                  <select
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value={12}>1 Year (12 months)</option>
                    <option value={24}>2 Years (24 months)</option>
                    <option value={36}>3 Years (36 months)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Monthly Rent Rate (GH₵) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.rent_amount}
                  onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
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
                {formData.rent_amount && (
                  <div style={{ fontSize: '12.5px', color: 'var(--forest-deep)', fontWeight: 600, marginTop: '4px' }}>
                    Total Advance Payment: GH₵{(formData.rent_amount * formData.duration_months).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={closeModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
                  {saveMutation.isPending ? 'Saving...' : editingTenant ? 'Save Changes' : 'Onboard Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
