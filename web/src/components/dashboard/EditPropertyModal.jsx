import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import MatIcon from '../common/MatIcon';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Default to Accra, Ghana

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url}`;
};

export default function EditPropertyModal({ property = {}, onClose, defaultPropertyType = 'HOTEL' }) {
  const queryClient = useQueryClient();
  const isCreating = !property.id;
  
  const [formData, setFormData] = useState({
    title: property.title || '',
    description: property.description || '',
    base_price: property.base_price || '',
    address: property.address || '',
    digital_address: property.digital_address || '',
    latitude: property.latitude || defaultCenter.lat,
    longitude: property.longitude || defaultCenter.lng,
    property_type: property.property_type || defaultPropertyType,
  });

  const [existingImages, setExistingImages] = useState(property.images || []);
  const [pendingImages, setPendingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
      if (isCreating) {
        const res = await axiosClient.post('/properties', data);
        return res.data;
      } else {
        const res = await axiosClient.put(`/properties/${property.id}`, data);
        return res.data;
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let newUrls = [];
      
      if (pendingImages.length > 0) {
        const formData = new FormData();
        pendingImages.forEach(file => {
          formData.append('files', file);
        });

        const uploadRes = await axiosClient.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        newUrls = uploadRes.data.urls;
      }

      const finalImages = [...existingImages, ...newUrls];

      updateMutation.mutate({
        ...formData,
        images: finalImages
      });

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const availableSlots = 4 - (existingImages.length + pendingImages.length);
    const filesToAdd = files.slice(0, availableSlots);
    
    if (filesToAdd.length < files.length) {
      alert(`You can only upload up to 4 images. Adding ${filesToAdd.length} image(s).`);
    }

    setPendingImages(prev => [...prev, ...filesToAdd]);
    e.target.value = '';
  };

  const removeExistingImage = (idxToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const removePendingImage = (idxToRemove) => {
    setPendingImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
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
    <div className="modal-overlay open" onClick={onClose}>
      
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: '800px'}}>
        <div className="modal-head">
          <h2 style={{fontSize: '18px', fontWeight: '600', margin: 0}}>
            {isCreating 
              ? (defaultPropertyType === 'APARTMENT' ? 'Add New Building' : 'Add New Property') 
              : (defaultPropertyType === 'APARTMENT' ? 'Edit Building Settings' : 'Edit Property Settings')}
          </h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)'}} aria-label="Close">
            <MatIcon name="close" size={20} />
          </button>
        </div>

        <form id="edit-prop-form" onSubmit={handleSubmit}>
          <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 300px'}}>
                <label className="form-label">{defaultPropertyType === 'APARTMENT' ? 'Building Name' : 'Property Name'}</label>
                <input 
                  type="text" required
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="form-control"
                />
              </div>
              <div style={{flex: '1 1 300px'}}>
                <label className="form-label">{defaultPropertyType === 'APARTMENT' ? 'Base Price / Month' : 'Base Price / Night'}</label>
                <input 
                  type="number" required min="0" step="0.01"
                  value={formData.base_price} 
                  onChange={e => setFormData({...formData, base_price: e.target.value})}
                  className="form-control"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea 
                rows="3"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="form-control"
                placeholder="Enter a description of the property..."
              />
            </div>

            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 300px'}}>
                <label className="form-label">Address</label>
                {isLoaded ? (
                  <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                    <input
                      type="text"
                      placeholder="Search and select an address"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="form-control"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="form-control"
                    placeholder="Loading Google Maps..."
                  />
                )}
              </div>
              <div style={{flex: '1 1 300px'}}>
                <label className="form-label">Digital Address</label>
                <input 
                  type="text" 
                  value={formData.digital_address} 
                  onChange={e => setFormData({...formData, digital_address: e.target.value})}
                  className="form-control"
                  placeholder="e.g. GA-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Pin Location on Map</label>
              <p style={{fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '8px'}}>Click on the map to accurately drop the pin at your property's entrance.</p>
              
              {loadError && <div style={{color: 'var(--brick-deep)', fontSize: '14px'}}>Error loading Google Maps API</div>}
              {!isLoaded && !loadError && <div style={{background: 'var(--paper-dim)', height: '300px', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading Map...</div>}
              {isLoaded && (
                <div style={{border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden', position: 'relative'}}>
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



            {/* Photos Section */}
            <div>
              <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>Property Gallery (Max 4)</h3>
              
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px'}}>
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} style={{position: 'relative', height: '100px', width: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)'}} className="group">
                    <img src={getImageUrl(img)} alt={`Property ${idx}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeExistingImage(idx)} className="btn btn-outline" style={{padding: '4px 8px', fontSize: '11px', background: 'var(--brick-deep)', color: 'white', borderColor: 'var(--brick-deep)'}}>Remove</button>
                    </div>
                  </div>
                ))}

                {/* Pending Images */}
                {pendingImages.map((file, idx) => (
                  <div key={`pending-${idx}`} style={{position: 'relative', height: '100px', width: '100px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--gold)'}} className="group">
                    <img src={URL.createObjectURL(file)} alt={`Pending ${idx}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    <div style={{position: 'absolute', top: '4px', right: '4px', background: 'var(--gold)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '12px'}}>New</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removePendingImage(idx)} className="btn btn-outline" style={{padding: '4px 8px', fontSize: '11px', background: 'var(--brick-deep)', color: 'white', borderColor: 'var(--brick-deep)'}}>Remove</button>
                    </div>
                  </div>
                ))}

                {/* Upload Box */}
                {(existingImages.length + pendingImages.length) < 4 && (
                  <label style={{height: '100px', width: '100px', borderRadius: '12px', border: '2px dashed var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--paper-dim)'}}>
                    <input type="file" style={{display: 'none'}} accept="image/*" multiple onChange={handleFileUpload} disabled={isUploading} />
                    {isUploading ? (
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent)'}}>
                        <span style={{fontSize: '10px', fontWeight: '600'}}>Uploading</span>
                      </div>
                    ) : (
                      <>
                        <svg style={{height: '24px', width: '24px', color: 'var(--ink-soft)', marginBottom: '4px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span style={{fontSize: '11px', fontWeight: '500', color: 'var(--ink-soft)'}}>Add Photo</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending || isUploading}
              className="btn btn-primary"
            >
              {(updateMutation.isPending || isUploading) ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
