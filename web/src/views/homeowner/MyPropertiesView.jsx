import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MatIcon from '../../components/common/MatIcon';
import axiosClient from '../../api/axiosClient';

const AVAILABLE_AMENITIES = [
  'Backup Generator',
  'Water Reservoir / Polytank',
  'Gated Compound',
  'Security Guard',
  'Parking Space',
  'Air Conditioning',
  'Furnished',
  'Self Compound',
  'Prepaid Electricity Meter',
  'Wifi'
];

export default function HomeownerMyPropertiesView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    digital_address: '',
    base_price: '',
    bedrooms: 1,
    bathrooms: 1,
    description: '',
    advance_years: [1, 2],
    amenities: ['Water Reservoir / Polytank', 'Gated Compound', 'Parking Space'],
    images: []
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch properties
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['homeownerProperties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  // Create or Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProperty) {
        return axiosClient.put(`/properties/${editingProperty.id}`, payload);
      }
      return axiosClient.post('/properties', {
        ...payload,
        property_type: 'HOMEOWNER',
        is_multi_room: false
      });
    },
    onSuccess: () => {
      toast.success(editingProperty ? 'Property updated successfully!' : 'Property added successfully!');
      queryClient.invalidateQueries(['homeownerProperties']);
      queryClient.invalidateQueries(['homeownerSummary']);
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save property');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      toast.success('Property removed successfully');
      queryClient.invalidateQueries(['homeownerProperties']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete property');
    }
  });

  // Toggle Published Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      return axiosClient.put(`/properties/${id}`, { status: newStatus });
    },
    onSuccess: (_, vars) => {
      toast.success(`Property marked as ${vars.newStatus.toLowerCase()}`);
      queryClient.invalidateQueries(['homeownerProperties']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  });

  const openCreateModal = () => {
    setEditingProperty(null);
    setFormData({
      title: '',
      address: '',
      digital_address: '',
      base_price: '',
      bedrooms: 1,
      bathrooms: 1,
      description: '',
      advance_years: [1, 2],
      amenities: ['Water Reservoir / Polytank', 'Gated Compound', 'Parking Space'],
      images: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prop) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title || '',
      address: prop.address || '',
      digital_address: prop.digital_address || '',
      base_price: prop.base_price || '',
      bedrooms: prop.bedrooms || 1,
      bathrooms: prop.bathrooms || 1,
      description: prop.description || '',
      advance_years: prop.advance_years && prop.advance_years.length > 0 ? prop.advance_years : [1, 2],
      amenities: prop.amenities || [],
      images: prop.images || []
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
    setNewImageUrl('');
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadFormData.append('files', files[i]);
    }

    try {
      setIsUploading(true);
      const res = await axiosClient.post('/storage/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.data.urls]
        }));
        toast.success(`${res.data.urls.length} photo(s) uploaded`);
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleAdvanceYear = (year) => {
    setFormData((prev) => {
      const exists = prev.advance_years.includes(year);
      if (exists) {
        if (prev.advance_years.length === 1) {
          toast.error('You must allow at least one advance term option');
          return prev;
        }
        return { ...prev, advance_years: prev.advance_years.filter((y) => y !== year) };
      }
      return { ...prev, advance_years: [...prev.advance_years, year].sort((a, b) => a - b) };
    });
  };

  const toggleAmenity = (item) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a) => a !== item) };
      }
      return { ...prev, amenities: [...prev.amenities, item] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.base_price) {
      toast.error('Please provide a property title and monthly rent');
      return;
    }

    saveMutation.mutate({
      ...formData,
      base_price: parseFloat(formData.base_price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms)
    });
  };

  // Filtered Properties
  const filtered = properties.filter((p) => {
    const matchesSearch = (p.title + ' ' + (p.address || '')).toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'AVAILABLE') return p.status === 'AVAILABLE';
    if (statusFilter === 'UNAVAILABLE') return p.status === 'UNAVAILABLE';
    if (statusFilter === 'OCCUPIED') return p.leases && p.leases.length > 0;
    return true;
  });

  // Portfolio metrics
  const totalCount = properties.length;
  const occupiedCount = properties.filter((p) => p.leases && p.leases.length > 0).length;
  const availableCount = properties.filter((p) => p.status === 'AVAILABLE' && (!p.leases || p.leases.length === 0)).length;
  const monthlyTotal = properties.reduce((acc, p) => acc + (p.base_price || 0), 0);

  return (
    <div>
      <div className="dash-topbar">
        <div>
          <h1>My properties</h1>
          <p>List and manage your standalone properties, flats, and rooms for multi-year leases.</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <MatIcon name="add" size={18} /> Add a property
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <div className="ic">
              <MatIcon name="home" size={22} />
            </div>
            <span className="delta">Total</span>
          </div>
          <b>{totalCount}</b>
          <span>Registered properties</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              <MatIcon name="check_circle" size={22} />
            </div>
            <span className="delta" style={{ background: '#E7F8ED', color: '#0F7B40' }}>
              Active
            </span>
          </div>
          <b>{occupiedCount}</b>
          <span>Currently occupied</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: 'var(--fb-primary-tint)', color: 'var(--fb-primary)' }}>
              <MatIcon name="domain" size={22} />
            </div>
            <span className="delta" style={{ background: 'var(--fb-primary-tint)', color: 'var(--fb-primary)' }}>
              Listed
            </span>
          </div>
          <b>{availableCount}</b>
          <span>Vacant &amp; ready to rent</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic" style={{ background: 'var(--fb-hover)', color: 'var(--fb-text)' }}>
              <MatIcon name="calendar_month" size={22} />
            </div>
            <span className="delta">Monthly value</span>
          </div>
          <b>GH₵{monthlyTotal.toLocaleString()}</b>
          <span>Total monthly rent rate</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <MatIcon
              name="search"
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search by property title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', borderRadius: '20px', height: '40px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'UNAVAILABLE'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: statusFilter === filterKey ? '1px solid var(--fb-primary)' : '1px solid var(--fb-border)',
                  background: statusFilter === filterKey ? 'var(--fb-primary-tint)' : '#FFFFFF',
                  color: statusFilter === filterKey ? 'var(--fb-primary)' : 'var(--fb-text)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {filterKey === 'ALL'
                  ? 'All Properties'
                  : filterKey === 'AVAILABLE'
                  ? 'Listed / Vacant'
                  : filterKey === 'OCCUPIED'
                  ? 'Occupied'
                  : 'Unlisted'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
          Loading your properties...
        </div>
      ) : error ? (
        <div className="panel" style={{ padding: '40px', textAlign: 'center', color: '#E41E3F' }}>
          Failed to load properties.
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--fb-hover)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fb-primary)'
            }}
          >
            <MatIcon name="home" size={32} />
          </div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fb-text)' }}>No properties found</h2>
          <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No properties match your search criteria. Try adjusting your filters.'
              : "You haven't listed any residential rental properties yet. Add your first house or apartment to get started!"}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <MatIcon name="add" size={18} /> Add a property
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map((prop) => {
            const isOccupied = prop.leases && prop.leases.length > 0;
            const activeLease = isOccupied ? prop.leases[0] : null;
            const mainImage =
              prop.images && prop.images.length > 0
                ? prop.images[0].startsWith('http')
                  ? prop.images[0]
                  : `http://localhost:3000${prop.images[0]}`
                : `https://picsum.photos/seed/bldg${prop.id}/600/400`;

            return (
              <div
                key={prop.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--fb-border)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Property Card Header & Image */}
                <div style={{ position: 'relative', height: '190px', background: 'var(--fb-hover)' }}>
                  <img
                    src={mainImage}
                    alt={prop.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span
                      className={`status ${
                        isOccupied ? 'paid' : prop.status === 'AVAILABLE' ? 'vacant' : 'due'
                      }`}
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                    >
                      {isOccupied ? 'Occupied' : prop.status === 'AVAILABLE' ? 'Listed' : 'Unlisted'}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <Link
                      to={`/listing/${prop.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View listing on public website"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--fb-text)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        textDecoration: 'none'
                      }}
                    >
                      <MatIcon name="open_in_new" size={16} />
                    </Link>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--fb-text)' }}>
                    {prop.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--fb-text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
                    <MatIcon name="location_on" size={16} />
                    <span>{prop.address || 'Accra, Ghana'}</span>
                    {prop.digital_address && (
                      <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 700, background: 'var(--fb-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                        {prop.digital_address}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--fb-text-secondary)', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--fb-border-light)' }}>
                    <span><b>{prop.bedrooms || 1}</b> Bed{prop.bedrooms > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span><b>{prop.bathrooms || 1}</b> Bath{prop.bathrooms > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{prop.property_type === 'HOMEOWNER' ? 'Residential' : prop.property_type}</span>
                  </div>

                  {/* Pricing and Advance Options */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--fb-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Monthly Rent
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fb-text)', marginTop: '2px' }}>
                      GH₵{prop.base_price.toLocaleString()}{' '}
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fb-text-secondary)' }}>/ month</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {(prop.advance_years || [1, 2]).map((yr) => (
                        <span
                          key={yr}
                          style={{
                            fontSize: '11.5px',
                            background: 'var(--fb-bg)',
                            color: 'var(--fb-text)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            border: '1px solid var(--fb-border)'
                          }}
                        >
                          {yr} yr adv: GH₵{(prop.base_price * yr * 12).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tenant Status */}
                  <div
                    style={{
                      marginTop: 'auto',
                      background: isOccupied ? 'var(--fb-bg)' : 'var(--fb-success-bg)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '13px'
                    }}
                  >
                    {isOccupied ? (
                      <div>
                        <b style={{ color: 'var(--fb-text)' }}>Occupied:</b> {activeLease?.tenant?.name || activeLease?.tenant_name || 'Active Tenant'}
                        <div style={{ fontSize: '11.5px', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>
                          Lease until {new Date(activeLease?.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--fb-success-text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MatIcon name="check_circle" size={16} /> Vacant — Available to lease
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--fb-border-light)', paddingTop: '14px' }}>
                    <button
                      onClick={() => openEditModal(prop)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <MatIcon name="edit" size={15} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        const newStatus = prop.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
                        toggleStatusMutation.mutate({ id: prop.id, newStatus });
                      }}
                      className="btn btn-outline btn-sm"
                      title={prop.status === 'AVAILABLE' ? 'Unpublish from website' : 'Publish to website'}
                    >
                      {prop.status === 'AVAILABLE' ? 'Unlist' : 'Publish'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${prop.title}"?`)) {
                          deleteMutation.mutate(prop.id);
                        }
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#E41E3F', borderColor: '#FCA5A5' }}
                      title="Delete property"
                    >
                      <MatIcon name="delete" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '680px', maxHeight: '90vh' }}>
            {/* Modal Header */}
            <div className="modal-head">
              <h2>{editingProperty ? 'Edit Property Listing' : 'Add New Rental Property'}</h2>
              <button onClick={closeModal}>
                <MatIcon name="close" size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Property Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Furnished 3-Bed House with Gated Compound"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Address / Neighborhood *</label>
                    <input
                      type="text"
                      placeholder="e.g. East Legon, Accra"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ghana Post Digital Address</label>
                    <input
                      type="text"
                      placeholder="e.g. GA-492-1029"
                      value={formData.digital_address}
                      onChange={(e) => setFormData({ ...formData, digital_address: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Pricing & Rooms */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Monthly Rent (GH₵) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 4500"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bedrooms</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bathrooms</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Multi-Year Advance Payment Options */}
                <div style={{ background: 'var(--fb-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--fb-border)' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--fb-text)' }}>
                    Accepted Advance Lease Terms
                  </label>
                  <p style={{ fontSize: '12.5px', color: 'var(--fb-text-secondary)', marginBottom: '12px', marginTop: 0 }}>
                    Select which upfront payment periods prospective tenants can book for:
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[1, 2, 3].map((years) => {
                      const isSelected = formData.advance_years.includes(years);
                      const rent = parseFloat(formData.base_price) || 0;
                      const advanceTotal = rent * years * 12;

                      return (
                        <div
                          key={years}
                          onClick={() => toggleAdvanceYear(years)}
                          style={{
                            flex: 1,
                            minWidth: '160px',
                            padding: '12px 14px',
                            border: isSelected ? '2px solid var(--fb-primary)' : '1px solid var(--fb-border)',
                            borderRadius: '10px',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: '13.5px' }}>
                              {years} Year{years > 1 ? 's' : ''} ({years * 12} mos)
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                          {rent > 0 && (
                            <div style={{ fontSize: '12.5px', color: isSelected ? 'var(--fb-primary)' : 'var(--fb-text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                              GH₵{advanceTotal.toLocaleString()} upfront
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Property Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your property, compound details, parking, nearby landmarks..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Amenities */}
                <div className="form-group">
                  <label>Amenities &amp; Features</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {AVAILABLE_AMENITIES.map((amenity) => {
                      const isSelected = formData.amenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid var(--fb-primary)' : '1px solid var(--fb-border)',
                            background: isSelected ? 'var(--fb-primary-tint)' : '#FFFFFF',
                            color: isSelected ? 'var(--fb-primary)' : 'var(--fb-text)'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photos */}
                <div className="form-group">
                  <label>Property Photos</label>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: 'var(--fb-hover)',
                        color: 'var(--fb-text)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: '1px solid var(--fb-border)'
                      }}
                    >
                      <MatIcon name="upload" size={16} />
                      {isUploading ? 'Uploading...' : 'Upload Photos'}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste an image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="btn btn-outline btn-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Photo Previews */}
                  {formData.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '90px',
                            height: '70px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--fb-border)'
                          }}
                        >
                          <img
                            src={img.startsWith('http') ? img : `http://localhost:3000${img}`}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0,0,0,0.65)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            <MatIcon name="close" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-foot">
                <button type="button" onClick={closeModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
                  {saveMutation.isPending ? 'Saving...' : editingProperty ? 'Save Changes' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
