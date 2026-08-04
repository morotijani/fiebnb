import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function EditUnitModal({ unit = {}, onClose }) {
  const queryClient = useQueryClient();
  const isCreating = !unit.id;
  
  const [formData, setFormData] = useState({
    property_id: unit.property_id || '',
    category_id: unit.category_id || '',
    room_number: unit.room_number || '',
    custom_price: unit.custom_price || '',
    status: unit.status || 'AVAILABLE',
  });

  const [existingImages, setExistingImages] = useState(unit.images || []);
  const [pendingImages, setPendingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch buildings
  const { data: buildings = [] } = useQuery({
    queryKey: ['apartmentBuildings'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-buildings');
      return res.data;
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosClient.get('/categories');
      return res.data;
    }
  });

  // Filter categories by selected building
  const filteredCategories = categories.filter(c => c.property_id === formData.property_id);

  // Auto-select building if there is only one
  useEffect(() => {
    if (isCreating && buildings.length === 1 && !formData.property_id) {
      setFormData(prev => ({ ...prev, property_id: buildings[0].id }));
    }
  }, [buildings, isCreating, formData.property_id]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (isCreating) {
        const res = await axiosClient.post('/rooms', data);
        return res.data;
      } else {
        const res = await axiosClient.put(`/rooms/${unit.id}`, data);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(isCreating ? 'Unit created successfully' : 'Unit updated successfully');
      queryClient.invalidateQueries(['apartmentUnits']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save unit');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.property_id) return toast.error('Please select a building');
    if (!formData.category_id) return toast.error('Please select a category. If none exist, create one first.');

    setIsUploading(true);

    try {
      let newUrls = [];
      
      if (pendingImages.length > 0) {
        const uploadData = new FormData();
        pendingImages.forEach(file => {
          uploadData.append('files', file);
        });

        const uploadRes = await axiosClient.post('/storage/upload', uploadData, {
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
    const totalImages = existingImages.length + pendingImages.length + files.length;
    
    if (totalImages > 4) {
      toast.error('Maximum 4 photos allowed per unit');
      return;
    }
    
    setPendingImages(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removePendingImage = (index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div className="modal-head">
          <h2 style={{fontSize: '18px', fontWeight: '600', margin: 0}}>{isCreating ? 'Add New Unit' : 'Edit Unit Settings'}</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)'}}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 250px'}}>
                <label className="form-label">Building</label>
                <select 
                  className="form-control" 
                  value={formData.property_id}
                  onChange={e => {
                    setFormData({...formData, property_id: e.target.value, category_id: ''});
                  }}
                  required
                >
                  <option value="">Select Building...</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              
              <div style={{flex: '1 1 250px'}}>
                <label className="form-label">Unit Category</label>
                <select 
                  className="form-control" 
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  required
                  disabled={!formData.property_id}
                >
                  <option value="">Select Category...</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {formData.property_id && filteredCategories.length === 0 && (
                  <p style={{fontSize: '12px', color: 'var(--brick)', marginTop: '4px'}}>
                    No categories found for this building. Please create a category first.
                  </p>
                )}
              </div>
            </div>

            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 250px'}}>
                <label className="form-label">Unit Number</label>
                <input 
                  type="text" required
                  value={formData.room_number} 
                  onChange={e => setFormData({...formData, room_number: e.target.value})}
                  className="form-control"
                  placeholder="e.g. 1A, 402"
                />
              </div>

              <div style={{flex: '1 1 250px'}}>
                <label className="form-label">Custom Price / Month (Optional)</label>
                <input 
                  type="number" min="0" step="0.01"
                  value={formData.custom_price} 
                  onChange={e => setFormData({...formData, custom_price: e.target.value})}
                  className="form-control"
                  placeholder="Overrides building base rent"
                />
              </div>
            </div>

            {/* Photos Section */}
            <div>
              <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>Unit Gallery (Max 4)</h3>
              
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px'}}>
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} style={{position: 'relative', height: '100px', width: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)'}} className="group">
                    <img src={getImageUrl(img)} alt={`Unit ${idx}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
              className="btn btn-primary"
              disabled={isUploading || updateMutation.isLoading}
            >
              {isUploading ? 'Uploading...' : updateMutation.isLoading ? 'Saving...' : 'Save Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
