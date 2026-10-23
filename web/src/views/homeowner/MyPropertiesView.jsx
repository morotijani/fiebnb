import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Home,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
  Building,
  Upload,
  Calendar,
  X
} from 'lucide-react';
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
    amenities: [],
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
    mutationFn: async (data) => {
      if (editingProperty) {
        return axiosClient.put(`/properties/${editingProperty.id}`, data);
      }
      return axiosClient.post('/properties', {
        ...data,
        property_type: 'HOMEOWNER'
      });
    },
    onSuccess: () => {
      toast.success(editingProperty ? 'Property updated successfully!' : 'Property listed successfully!');
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
      toast.success('Property removed');
      queryClient.invalidateQueries(['homeownerProperties']);
      queryClient.invalidateQueries(['homeownerSummary']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete property');
    }
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      return axiosClient.put(`/properties/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      toast.success('Property status updated');
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
        setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleAdvanceYear = (year) => {
    setFormData(prev => {
      const exists = prev.advance_years.includes(year);
      if (exists) {
        if (prev.advance_years.length === 1) {
          toast.error('You must allow at least one advance term option');
          return prev;
        }
        return { ...prev, advance_years: prev.advance_years.filter(y => y !== year) };
      }
      return { ...prev, advance_years: [...prev.advance_years, year].sort((a, b) => a - b) };
    });
  };

  const toggleAmenity = (item) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(item);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== item) };
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
  const filtered = properties.filter(p => {
    const matchesSearch = (p.title + ' ' + (p.address || '')).toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'AVAILABLE') return p.status === 'AVAILABLE';
    if (statusFilter === 'UNAVAILABLE') return p.status === 'UNAVAILABLE';
    if (statusFilter === 'OCCUPIED') return p.leases && p.leases.length > 0;
    return true;
  });

  // Portfolio metrics
  const totalCount = properties.length;
  const occupiedCount = properties.filter(p => p.leases && p.leases.length > 0).length;
  const availableCount = properties.filter(p => p.status === 'AVAILABLE' && (!p.leases || p.leases.length === 0)).length;
  const monthlyTotal = properties.reduce((acc, p) => acc + (p.base_price || 0), 0);

  return (
    <div className="dash-main">
      <div className="dash-topbar">
        <div>
          <h1>My properties</h1>
          <p>List and manage your standalone properties, flats, and rooms for multi-year leases.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Add a property
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Home size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Total</span>
          </div>
          <b>{totalCount}</b>
          <span>Registered properties</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><CheckCircle2 size={17} stroke="var(--forest-deep)" /></div>
            <span className="delta" style={{ background: '#E1EAE0', color: 'var(--forest-deep)' }}>Active</span>
          </div>
          <b>{occupiedCount}</b>
          <span>Currently occupied</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Building size={17} stroke="var(--gold-deep)" /></div>
            <span className="delta" style={{ background: 'var(--gold-pale)', color: 'var(--gold-deep)' }}>Listed</span>
          </div>
          <b>{availableCount}</b>
          <span>Vacant &amp; ready to rent</span>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="ic"><Calendar size={17} stroke="var(--brick-deep)" /></div>
            <span className="delta">Monthly value</span>
          </div>
          <b>GH₵{monthlyTotal.toLocaleString()}</b>
          <span>Total monthly rent rate</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
            <input
              type="text"
              placeholder="Search by property title or location..."
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
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'UNAVAILABLE'].map(filterKey => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: statusFilter === filterKey ? '1px solid var(--ink)' : '1px solid var(--line)',
                  background: statusFilter === filterKey ? 'var(--ink)' : 'var(--white)',
                  color: statusFilter === filterKey ? 'var(--white)' : 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {filterKey === 'ALL' ? 'All Properties' : filterKey.charAt(0) + filterKey.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)' }}>
          Loading your properties...
        </div>
      ) : error ? (
        <div className="panel" style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          Failed to load properties.
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--sand)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={28} stroke="var(--brick-deep)" />
          </div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>No properties found</h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No properties match your search criteria. Try adjusting your filters.'
              : 'You haven’t listed any residential rental properties yet. Add your first house or apartment to get started!'}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Add a property
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(prop => {
            const isOccupied = prop.leases && prop.leases.length > 0;
            const activeLease = isOccupied ? prop.leases[0] : null;
            const mainImage = prop.images && prop.images.length > 0
              ? (prop.images[0].startsWith('http') ? prop.images[0] : `http://localhost:3000${prop.images[0]}`)
              : `https://picsum.photos/seed/bldg${prop.id}/600/400`;

            return (
              <div
                key={prop.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {/* Property Card Header & Image */}
                <div style={{ position: 'relative', height: '190px', background: 'var(--sand)' }}>
                  <img
                    src={mainImage}
                    alt={prop.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: isOccupied ? '#1E293B' : (prop.status === 'AVAILABLE' ? '#166534' : '#64748B'),
                        color: 'white'
                      }}
                    >
                      {isOccupied ? 'Occupied' : (prop.status === 'AVAILABLE' ? 'Listed' : 'Unlisted')}
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
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ink)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
                    {prop.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-soft)', fontSize: '13px', marginBottom: '12px' }}>
                    <MapPin size={14} />
                    <span>{prop.address || 'Accra, Ghana'}</span>
                    {prop.digital_address && (
                      <span style={{ marginLeft: '6px', fontSize: '11.5px', background: 'var(--paper-dim)', padding: '2px 6px', borderRadius: '4px' }}>
                        {prop.digital_address}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--line)' }}>
                    <span><b>{prop.bedrooms || 1}</b> Bed{prop.bedrooms > 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span><b>{prop.bathrooms || 1}</b> Bath{prop.bathrooms > 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{prop.property_type === 'HOMEOWNER' ? 'Long-term Stay' : prop.property_type}</span>
                  </div>

                  {/* Pricing and Advance Options */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Rent</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
                      GH₵{prop.base_price.toLocaleString()}{' '}
                      <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--ink-soft)' }}>/ month</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {(prop.advance_years || [1, 2]).map(yr => (
                        <span
                          key={yr}
                          style={{
                            fontSize: '11.5px',
                            background: 'var(--sand)',
                            color: 'var(--ink)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}
                        >
                          {yr} yr adv: GH₵{(prop.base_price * yr * 12).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tenant Status */}
                  <div style={{ marginTop: 'auto', background: isOccupied ? 'rgba(30,41,59,0.04)' : '#F0FDF4', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                    {isOccupied ? (
                      <div>
                        <b style={{ color: 'var(--ink)' }}>Occupied:</b> {activeLease?.tenant?.name || activeLease?.tenant_name || 'Active Tenant'}
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                          Lease until {new Date(activeLease?.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#166534', fontWeight: 600 }}>
                        ✓ Vacant — Available for lease application
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                    <button
                      onClick={() => openEditModal(prop)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Edit2 size={14} /> Edit
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
                      style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                      title="Delete property"
                    >
                      <Trash2 size={14} />
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--line)'
              }}
            >
              <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                {editingProperty ? 'Edit Property Listing' : 'Add New Rental Property'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-soft)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Property Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Furnished 3-Bed House with Gated Compound"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Address / Neighborhood *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. East Legon, Accra"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Ghana Post Digital Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GA-492-1029"
                    value={formData.digital_address}
                    onChange={(e) => setFormData({ ...formData, digital_address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Pricing & Rooms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Monthly Rent (GH₵) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 4500"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Multi-Year Advance Payment Options */}
              <div style={{ background: 'var(--paper-dim)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
                  Accepted Advance Lease Terms
                </label>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
                  Select which upfront payment periods prospective tenants can book for:
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[1, 2, 3].map(years => {
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
                          border: isSelected ? '2px solid var(--forest)' : '1px solid var(--line)',
                          borderRadius: '10px',
                          background: isSelected ? 'var(--white)' : 'var(--white)',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>
                            {years} Year{years > 1 ? 's' : ''} ({years * 12} mos)
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by div click
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                        {rent > 0 && (
                          <div style={{ fontSize: '12.5px', color: isSelected ? 'var(--forest-deep)' : 'var(--ink-soft)', marginTop: '4px', fontWeight: 600 }}>
                            GH₵{advanceTotal.toLocaleString()} upfront
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Property Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your property, compound details, parking, nearby landmarks..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Amenities &amp; Features
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVAILABLE_AMENITIES.map(amenity => {
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
                          fontWeight: 500,
                          cursor: 'pointer',
                          border: isSelected ? '1px solid var(--forest-deep)' : '1px solid var(--line)',
                          background: isSelected ? '#E1EAE0' : 'var(--white)',
                          color: isSelected ? 'var(--forest-deep)' : 'var(--ink)'
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
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Property Photos
                </label>

                {/* Upload or URL entry */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: 'var(--sand)',
                      color: 'var(--ink)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <Upload size={15} />
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
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
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
                          border: '1px solid var(--line)'
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
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--line)', paddingTop: '18px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="btn btn-primary"
                >
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
