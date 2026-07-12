import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import EditRoomModal from '../components/dashboard/EditRoomModal';
import AddRoomModal from '../components/dashboard/AddRoomModal';
import CategoriesModal from '../components/dashboard/CategoriesModal';
import axiosClient from '../api/axiosClient';

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
    <div className="space-y-6">
      {/* Header and Property Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Rooms & Rates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pricing, photos, and maintenance status.</p>
        </div>

        {properties && properties.length > 1 && (
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label htmlFor="property-select" className="text-sm font-medium text-slate-600 whitespace-nowrap">Property:</label>
            <select
              id="property-select"
              className="flex-1 sm:w-64 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={isLoadingProps}
            >
              {isLoadingProps && <option>Loading properties...</option>}
              {properties?.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsManagingCategories(true)}
            disabled={!selectedPropertyId}
            className="px-4 py-2 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 border border-slate-300 transition-colors shadow-sm"
          >
            Manage Categories
          </button>
          
          <button 
            onClick={() => setIsAddingRoom(true)}
            disabled={!selectedPropertyId}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by room name or number..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <select 
            className="w-full sm:w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {propertyCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select 
            className="w-full sm:w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Out of Order</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {isLoadingRooms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-red-500 bg-white rounded-xl border border-red-200 shadow-sm">
          Error loading rooms. Ensure the backend is running.
        </div>
      ) : !filteredRooms || filteredRooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No rooms found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms?.map(room => (
            <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              {/* Image Header */}
              <div className="h-48 bg-slate-100 relative">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt={`Room ${room.room_number}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">No Image</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${
                    room.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.status === 'AVAILABLE' ? 'Available' : 'Out of Order'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Room {room.room_number}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Category / Rate</span>
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{room.category?.name || 'Standard'}</div>
                      <span className="text-xl font-bold text-blue-600">₵{room.category?.price_per_night || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setEditingRoom(room)}
                    className="w-full py-2 px-4 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
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
