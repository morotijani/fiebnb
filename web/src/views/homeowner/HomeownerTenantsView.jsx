import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import MatIcon from '../../components/common/MatIcon';
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

  // Create or Update Lease mutation
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
      toast.error(err.response?.data?.error || 'Failed to save lease agreement');
    }
  });

  const openAddModal = () => {
    setEditingTenant(null);
    const firstProp = properties[0];
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      property_id: firstProp ? firstProp.id : '',
      tenant_name: '',
      tenant_phone: '',
      tenant_email: '',
      start_date: today,
      duration_months: 12,
      rent_amount: firstProp ? firstProp.base_price : ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lease) => {
    setEditingTenant(lease);
    setFormData({
      property_id: lease.property_id,
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
    const selected = properties.find((p) => p.id === propId);
    setFormData((prev) => ({
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
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE');
  const totalMonthlyIncome = activeTenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
  const totalAdvanceCollected = activeTenants.reduce(
    (sum, t) => sum + (t.advance_payment || (t.rent_amount * (t.duration_months || 12))),
    0
  );
  const expiringSoonCount = activeTenants.filter((t) => {
    const diff = differenceInDays(new Date(t.end_date), new Date());
    return diff <= 60 && diff >= 0;
  }).length;

  // Filtered tenants
  const filtered = tenants.filter((t) => {
    const q = searchTerm.toLowerCase();
    const name = (t.tenant_name || t.tenant?.name || '').toLowerCase();
    const propTitle = (t.property?.title || '').toLowerCase();
    const phone = (t.tenant?.phone_number || '').toLowerCase();
    return name.includes(q) || propTitle.includes(q) || phone.includes(q);
  });

  return (
    <div>
      <div className="dash-topbar">
        <div>
          <h1>Tenants</h1>
          <p>Manage long-term tenants, multi-year advance leases, and contact details.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <MatIcon name="person_add" size={18} /> Onboard Tenant
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="group" size={22} />
            </div>
            <span className="delta">Active</span>
          </div>
          <b>{activeTenants.length}</b>
          <span>Current residential tenants</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              <MatIcon name="schedule" size={22} />
            </div>
            <span className="delta" style={{ background: '#FFF4E5', color: '#B25E00' }}>
              Next 60 days
            </span>
          </div>
          <b>{expiringSoonCount}</b>
          <span>Renewals pending</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              <MatIcon name="payments" size={22} />
            </div>
            <span className="delta" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              Monthly
            </span>
          </div>
          <b>GH₵{totalMonthlyIncome.toLocaleString()}</b>
          <span>Total monthly rent rate</span>
        </div>

        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="account_balance_wallet" size={22} />
            </div>
            <span className="delta">Advance Volume</span>
          </div>
          <b>GH₵{totalAdvanceCollected.toLocaleString()}</b>
          <span>Total advance contract value</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <MatIcon
            name="search"
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-text-secondary)' }}
          />
          <input
            type="text"
            placeholder="Search by tenant name, property title, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px', borderRadius: '20px', height: '40px' }}
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
            Loading tenant records...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#E41E3F' }}>
            Failed to load tenants.
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
              <MatIcon name="group" size={28} />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fb-text)' }}>No tenants found</h2>
            <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
              {searchTerm
                ? 'No tenants match your search.'
                : 'You currently do not have any tenants onboarded. Click "Onboard Tenant" to add a lease agreement.'}
            </p>
            <button onClick={openAddModal} className="btn btn-primary">
              <MatIcon name="person_add" size={18} /> Onboard Tenant
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Tenant</th>
                  <th>Rented Property</th>
                  <th>Advance Term</th>
                  <th>Monthly Rent</th>
                  <th>Total Advance</th>
                  <th>Lease Period &amp; Renewal</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
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
                    <tr key={lease.id}>
                      <td style={{ color: 'var(--fb-text-secondary)', fontWeight: '600' }}>{index + 1}</td>

                      {/* Tenant Contact */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--fb-text)' }}>
                          {lease.tenant_name || lease.tenant?.name || 'Unknown Tenant'}
                        </div>
                        {lease.tenant?.phone_number && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>
                            <MatIcon name="call" size={13} /> {lease.tenant.phone_number}
                          </div>
                        )}
                        {lease.tenant?.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--fb-text-secondary)' }}>
                            <MatIcon name="mail" size={13} /> {lease.tenant.email}
                          </div>
                        )}
                      </td>

                      {/* Property */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--fb-text)' }}>
                          {lease.property?.title || 'Residential Property'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)' }}>
                          {lease.property?.address || 'Accra, Ghana'}
                        </div>
                      </td>

                      {/* Advance Term */}
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: 'var(--fb-bg)',
                            color: 'var(--fb-text)'
                          }}
                        >
                          {durationYears} Year{durationYears > 1 ? 's' : ''} ({lease.duration_months || 12} mos)
                        </span>
                      </td>

                      {/* Monthly Rent */}
                      <td style={{ fontWeight: 600 }}>
                        GH₵{lease.rent_amount?.toLocaleString()}/mo
                      </td>

                      {/* Total Advance */}
                      <td style={{ fontWeight: 700, color: 'var(--fb-success-text)' }}>
                        GH₵{totalAdvance.toLocaleString()}
                      </td>

                      {/* Lease Period */}
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          {format(new Date(lease.start_date), 'MMM d, yyyy')} – {format(new Date(lease.end_date), 'MMM d, yyyy')}
                        </div>
                        {isExpiringSoon && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B25E00', background: '#FFF4E5', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                            <MatIcon name="warning" size={13} />
                            Renewal in {daysUntilExpiry} days
                          </div>
                        )}
                        {isExpired && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#E41E3F', background: '#FFEBEA', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                            <MatIcon name="warning" size={13} />
                            Lease Expired
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status ${lease.status === 'ACTIVE' ? 'paid' : (lease.status === 'PENDING' ? 'due' : 'vacant')}`}>
                          {lease.status === 'ACTIVE' ? 'Active' : (lease.status === 'PENDING' ? 'Pending' : lease.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(lease)}
                            className="btn btn-outline btn-sm"
                            title="Edit lease"
                            style={{ padding: '6px 8px' }}
                          >
                            <MatIcon name="edit" size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to end or remove the lease for ${lease.tenant_name || 'this tenant'}?`)) {
                                deleteMutation.mutate(lease.id);
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            title="Remove lease"
                            style={{ padding: '6px 8px', color: '#E41E3F', borderColor: '#FCA5A5' }}
                          >
                            <MatIcon name="delete" size={15} />
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
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '540px' }}>
            <div className="modal-head">
              <h2>{editingTenant ? 'Edit Tenant Lease' : 'Onboard New Tenant'}</h2>
              <button onClick={closeModal}>
                <MatIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Select Property *</label>
                  <select
                    value={formData.property_id}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    required
                    className="form-control"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} – GH₵{p.base_price.toLocaleString()}/mo ({p.address || 'Accra'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tenant Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kwesi Mensah"
                    value={formData.tenant_name}
                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0244123456"
                      value={formData.tenant_phone}
                      onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. tenant@example.com"
                      value={formData.tenant_email}
                      onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Lease Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Advance Lease Period</label>
                    <select
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                      className="form-control"
                    >
                      <option value={12}>1 Year (12 months)</option>
                      <option value={24}>2 Years (24 months)</option>
                      <option value={36}>3 Years (36 months)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Monthly Rent Rate (GH₵) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rent_amount}
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                    required
                    className="form-control"
                  />
                  {formData.rent_amount && (
                    <div style={{ fontSize: '13px', color: 'var(--fb-success-text)', fontWeight: 600, marginTop: '6px' }}>
                      Total Advance Payment: GH₵{(formData.rent_amount * formData.duration_months).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-foot">
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
