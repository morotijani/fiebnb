import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import EditRoomModal from '../components/dashboard/EditRoomModal';
import AddRoomModal from '../components/dashboard/AddRoomModal';
import CategoriesModal from '../components/dashboard/CategoriesModal';
import axiosClient from '../api/axiosClient';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url}`;
};

export default function RoomsView() {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch properties for the selector
  const { data: properties, isLoading: isLoadingProps } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  // Auto-select the first property
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Fetch rooms for the selected property
  const { data: rooms, isLoading: isLoadingRooms, error } = useQuery({
    queryKey: ['rooms', selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await axiosClient.get(`/rooms?propertyId=${selectedPropertyId}`);
      return res.data;
    },
    enabled: !!selectedPropertyId
  });
  // Fetch categories to populate filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosClient.get('/categories');
      return res.data;
    }
  });
  const propertyCategories = categories?.filter(c => c.property_id === selectedPropertyId) || [];

  const filteredRooms = rooms?.filter(room => {
    const matchesSearch = room.room_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? room.category_id === filterCategory : true;
    const matchesStatus = filterStatus ? room.status === filterStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Header and Property Selector */}
      <div className="dash-topbar">
        <div>
          <h1>Rooms & Rates</h1>
          <p>Manage pricing, photos, and maintenance status.</p>
        </div>

        <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
          {properties && properties.length > 1 && (
            <select
              className="filter-select"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={isLoadingProps}
            >
              {isLoadingProps && <option>Loading properties...</option>}
              {properties?.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}

          <button 
            onClick={() => setIsManagingCategories(true)}
            disabled={!selectedPropertyId}
            className="btn btn-outline"
          >
            Manage Categories
          </button>
          
          <button 
            onClick={() => setIsAddingRoom(true)}
            disabled={!selectedPropertyId}
            className="btn btn-primary"
          >
            + Add Room
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="filter-search">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by room name or number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {propertyCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="MAINTENANCE">Out of Order</option>
        </select>
      </div>

      {/* Rooms Grid */}
      {isLoadingRooms ? (
        <div style={{color:'var(--ink-soft)'}}>Loading rooms...</div>
      ) : error ? (
        <div className="panel" style={{color:'var(--brick-deep)'}}>
          Error loading rooms. Ensure the backend is running.
        </div>
      ) : !filteredRooms || filteredRooms.length === 0 ? (
        <div className="panel" style={{textAlign:'center', color:'var(--ink-soft)', padding:'60px 20px'}}>
          <p>No rooms found.</p>
        </div>
      ) : (
        <div className="room-grid">
          {filteredRooms?.map(room => (
            <div key={room.id} className="room-card">
              {/* Image Header */}
              <div className="room-img-wrap">
                {room.images && room.images.length > 0 ? (
                  <img src={getImageUrl(room.images[0])} alt={`Room ${room.room_number}`} />
                ) : (
                  <span>No Image</span>
                )}
                
                {/* Status Badge */}
                <div className="room-badge" style={{
                  background: room.status === 'AVAILABLE' ? '#d1fae5' : '#fee2e2',
                  color: room.status === 'AVAILABLE' ? '#065f46' : '#991b1b'
                }}>
                  {room.status === 'AVAILABLE' ? 'Available' : 'Out of Order'}
                </div>
              </div>

              {/* Card Body */}
              <div className="room-body">
                <h3>Room {room.room_number}</h3>
                <div className="room-meta">
                  <div>
                    <span className="lbl">Category</span>
                    <span className="cat">{room.category?.name || 'Standard'}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className="lbl">Rate</span>
                    <span className="price">₵{room.category?.price_per_night || 0}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="room-foot">
                  <button 
                    onClick={() => setEditingRoom(room)}
                    className="btn btn-outline" style={{width:'100%'}}
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRoom && (
        <EditRoomModal 
          room={editingRoom} 
          properties={properties}
          onClose={() => setEditingRoom(null)} 
        />
      )}

      {/* Add Modal */}
      {isAddingRoom && (
        <AddRoomModal
          propertyId={selectedPropertyId}
          properties={properties}
          onClose={() => setIsAddingRoom(false)}
        />
      )}

      {/* Categories Modal */}
      {isManagingCategories && (
        <CategoriesModal
          propertyId={selectedPropertyId}
          onClose={() => setIsManagingCategories(false)}
        />
      )}
    </div>
  );
}
