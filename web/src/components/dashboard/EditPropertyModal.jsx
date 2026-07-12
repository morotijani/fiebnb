import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Default to Accra, Ghana

export default function EditPropertyModal({ property, onClose }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: property.title || '',
    base_price: property.base_price || '',
    address: property.address || '',
    digital_address: property.digital_address || '',
    latitude: property.latitude || defaultCenter.lat,
    longitude: property.longitude || defaultCenter.lng,
    is_multi_room: property.is_multi_room || false,
  });

  const [mapCenter, setMapCenter] = useState({ 
    lat: property.latitude || defaultCenter.lat, 
    lng: property.longitude || defaultCenter.lng 
  });
  
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.put(`/properties/${property.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Property updated successfully');
      queryClient.invalidateQueries(['properties']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update property');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const onLoadAutocomplete = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMapCenter({ lat, lng });
        setFormData(prev => ({
          ...prev,
          address: place.formatted_address || place.name || prev.address,
          latitude: lat,
          longitude: lng
        }));
      }
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Edit Property Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-prop-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                <input 
                  type="text" required
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price / Night</label>
                <input 
                  type="number" required min="0" step="0.01"
                  value={formData.base_price} 
                  onChange={e => setFormData({...formData, base_price: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                {isLoaded ? (
                  <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                    <input
                      type="text"
                      placeholder="Search and select an address"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Loading Google Maps..."
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Digital Address</label>
                <input 
                  type="text" 
                  value={formData.digital_address} 
                  onChange={e => setFormData({...formData, digital_address: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. GA-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pin Location on Map</label>
              <p className="text-xs text-slate-500 mb-2">Click on the map to accurately drop the pin at your property's entrance.</p>
              
              {loadError && <div className="text-red-500 text-sm">Error loading Google Maps API</div>}
              {!isLoaded && !loadError && <div className="bg-slate-100 h-[300px] w-full rounded-lg animate-pulse flex items-center justify-center">Loading Map...</div>}
              {isLoaded && (
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm relative">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                    options={{ disableDefaultUI: false, streetViewControl: false }}
                  >
                    <Marker 
                      position={{ lat: formData.latitude, lng: formData.longitude }} 
                      draggable={true}
                      onDragEnd={handleMapClick}
                    />
                  </GoogleMap>
                </div>
              )}
            </div>

            <div className="flex items-center pt-2">
              <input 
                type="checkbox" id="isMultiRoom"
                checked={formData.is_multi_room} 
                onChange={e => setFormData({...formData, is_multi_room: e.target.checked})}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isMultiRoom" className="ml-2 text-sm text-slate-700">Multi-room property (e.g. Hotel / Guesthouse)</label>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-prop-form"
            disabled={updateMutation.isPending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
