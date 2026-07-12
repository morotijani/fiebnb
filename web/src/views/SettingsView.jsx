import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { User, Building, Plus, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EditPropertyModal from '../components/dashboard/EditPropertyModal';
import { format } from 'date-fns';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account and property configurations.</p>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar Nav */}
        <div className="w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5 mr-3 opacity-75" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'properties' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building className="w-5 h-5 mr-3 opacity-75" />
              Properties
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'staff' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5 mr-3 opacity-75" />
              Staff
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'properties' && <PropertiesTab />}
            {activeTab === 'staff' && <StaffTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axiosClient.get('/auth/profile');
      return res.data;
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    momo_number: ''
  });

  // Populate form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone_number: profile.phone_number || '',
        momo_number: profile.momo_number || ''
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      alert('Profile updated successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="animate-pulse h-40 bg-slate-100 rounded-lg"></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            value={profile?.email || ''}
            disabled
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">Email cannot be changed directly.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input 
            type="text" 
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Money Number</label>
          <input 
            type="text" 
            value={formData.momo_number}
            onChange={(e) => setFormData({...formData, momo_number: e.target.value})}
            placeholder="e.g. 0541234567"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={updateMutation.isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PropertiesTab() {
  const queryClient = useQueryClient();
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [newProp, setNewProp] = useState({ title: '', base_price: '', is_multi_room: false });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post('/properties', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
      setIsAdding(false);
      setNewProp({ title: '', base_price: '', is_multi_room: false });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to add property');
    }
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...newProp,
      base_price: parseFloat(newProp.base_price) || 0
    });
  };

  if (isLoading) return <div className="animate-pulse h-40 bg-slate-100 rounded-lg"></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Managed Properties</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center text-sm px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Property
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4 max-w-lg">
          <h3 className="font-medium text-slate-800">New Property Details</h3>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Property Name</label>
            <input 
              type="text" required
              value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Base Price / Night (Default)</label>
            <input 
              type="number" required min="0" step="0.01"
              value={newProp.base_price} onChange={e => setNewProp({...newProp, base_price: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" id="isMultiRoom"
              checked={newProp.is_multi_room} onChange={e => setNewProp({...newProp, is_multi_room: e.target.checked})}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isMultiRoom" className="ml-2 text-sm text-slate-700">Is this a multi-room property (e.g. Hotel)?</label>
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="submit" disabled={createMutation.isLoading} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              {createMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {properties?.length === 0 && (
          <div className="text-sm text-slate-500 italic">No properties configured yet.</div>
        )}
        {properties?.map(prop => (
          <div key={prop.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
            <div>
              <h4 className="font-semibold text-slate-800">{prop.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {prop.address ? prop.address : 'No address set'} • ₵{prop.base_price} • {prop.is_multi_room ? 'Multi-Room' : 'Single Unit'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Joined: {prop.createdAt ? format(new Date(prop.createdAt), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${prop.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                {prop.status}
              </span>
              <button 
                onClick={() => setEditingProperty(prop)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProperty && (
        <EditPropertyModal 
          property={editingProperty} 
          onClose={() => setEditingProperty(null)} 
        />
      )}
    </div>
  );
}

function StaffTab() {
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone_number: '', role: 'RECEPTIONIST' });

  const { data: properties, isLoading: isLoadingProps } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await axiosClient.get('/properties');
      return res.data;
    }
  });

  React.useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff', selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await axiosClient.get(`/properties/${selectedPropertyId}/staff`);
      return res.data;
    },
    enabled: !!selectedPropertyId
  });

  const addStaffMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post(`/properties/${selectedPropertyId}/staff`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff', selectedPropertyId]);
      setIsAdding(false);
      setNewStaff({ name: '', phone_number: '', role: 'RECEPTIONIST' });
      alert('Staff added successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to add staff');
    }
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (staffId) => {
      await axiosClient.delete(`/properties/${selectedPropertyId}/staff/${staffId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff', selectedPropertyId]);
      alert('Staff removed successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to remove staff');
    }
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addStaffMutation.mutate(newStaff);
  };

  if (isLoadingProps) return <div className="animate-pulse h-40 bg-slate-100 rounded-lg"></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Manage Staff</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {properties && properties.length > 0 && (
            <select
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}

          {!isAdding && selectedPropertyId && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center text-sm px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Staff
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4 max-w-lg">
          <h3 className="font-medium text-slate-800">New Staff Details</h3>
          <p className="text-xs text-slate-500">The user will be able to log in using their phone number and the default password: <b>123456</b>.</p>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
            <select 
              value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="HOTEL_MANAGER">Admin (Manager)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required
              value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="text" required placeholder="e.g. 0541234567"
              value={newStaff.phone_number} onChange={e => setNewStaff({...newStaff, phone_number: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button type="submit" disabled={addStaffMutation.isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {addStaffMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoadingStaff ? (
        <div className="animate-pulse h-40 bg-slate-100 rounded-lg"></div>
      ) : (
        <div className="grid gap-4">
          {(!staff || staff.length === 0) && (
            <div className="text-sm text-slate-500 italic p-4 text-center border border-slate-200 rounded-xl bg-slate-50">
              No staff added to this property yet.
            </div>
          )}
          {staff?.map(s => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {s.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{s.user.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.user.phone_number} • Role: {s.user.role}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Added: {s.createdAt ? format(new Date(s.createdAt), 'MMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
              <div>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this receptionist?')) {
                      removeStaffMutation.mutate(s.user.id);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Staff"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
