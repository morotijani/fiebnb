import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { User, Building, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'properties' && <PropertiesTab />}
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
          <div key={prop.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl">
            <div>
              <h4 className="font-semibold text-slate-800">{prop.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Base Price: ₵{prop.base_price} • {prop.is_multi_room ? 'Multi-Room' : 'Single Unit'}
              </p>
            </div>
            <div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${prop.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                {prop.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
