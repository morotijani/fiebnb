import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url}`;
};

export default function EditRoomModal({ room, properties, onClose }) {
  const queryClient = useQueryClient();
  const [roomNumber, setRoomNumber] = useState(room.room_number || '');
  const [modalPropertyId, setModalPropertyId] = useState(room.property_id);
  const [categoryId, setCategoryId] = useState(room.category_id || '');
  const [status, setStatus] = useState(room.status);
  const [existingImages, setExistingImages] = useState(room.images || []);
  const [pendingImages, setPendingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosClient.get('/categories');
      return res.data.filter(c => c.property_id === modalPropertyId);
    },
    enabled: !!modalPropertyId
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosClient.put(`/rooms/${room.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room updated successfully');
      queryClient.invalidateQueries(['rooms']);
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to update room';
      setError(msg);
      toast.error(msg);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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

      // 3. Update Room
      updateMutation.mutate({
        property_id: modalPropertyId,
        room_number: roomNumber,
        category_id: categoryId,
        status,
        images: finalImages
      });

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload images');
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
    // clear input so same file can be selected again
    e.target.value = '';
  };

  const removeExistingImage = (idxToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const removePendingImage = (idxToRemove) => {
    setPendingImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{maxWidth: '650px'}}>
        {/* Header */}
        <div className="modal-head">
          <h2>Edit Room {room.room_number}</h2>
          <button type="button" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {error && (
            <div style={{marginBottom:'16px', padding:'12px', background:'var(--brick-pale)', color:'var(--brick-deep)', borderRadius:'var(--r-md)', fontSize:'13.5px'}}>
              {error}
            </div>
          )}

          <form id="edit-room-form" onSubmit={handleSubmit}>
            <div className="grid-2">
              {/* Room Number */}
              <div className="form-group">
                <label>Room Name / Number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="form-control"
                  placeholder="e.g. 101, Suite A"
                  required
                />
              </div>

              {/* Property */}
              {properties && properties.length > 1 && (
                <div className="form-group">
                  <label>Property</label>
                  <select
                    value={modalPropertyId}
                    onChange={(e) => {
                      setModalPropertyId(e.target.value);
                      setCategoryId(''); // Reset category since property changed
                    }}
                    className="form-control"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category */}
              <div className="form-group">
                <label>Room Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-control"
                  disabled={isLoadingCategories}
                >
                  <option value="">Select Category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} (₵{cat.price_per_night})</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Room Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Out of Order (Maintenance)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Photos Section */}
          <div style={{marginTop: '24px', borderTop: '1px solid var(--line)', paddingTop: '24px'}}>
            <h3 style={{fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0'}}>Photo Gallery (Max 4)</h3>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'16px'}}>
              {/* Existing Images */}
              {existingImages.map((img, idx) => (
                <div key={`existing-${idx}`} style={{position:'relative', height:'110px', borderRadius:'var(--r-md)', overflow:'hidden', border:'1px solid var(--line)'}}>
                  <img src={getImageUrl(img)} alt={`Room ${idx}`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  <button type="button" onClick={() => removeExistingImage(idx)} style={{position:'absolute', top:'8px', right:'8px', background:'var(--brick-deep)', color:'white', border:'none', borderRadius:'4px', padding:'4px 8px', fontSize:'11px', cursor:'pointer'}}>Remove</button>
                </div>
              ))}

              {/* Pending Images */}
              {pendingImages.map((file, idx) => (
                <div key={`pending-${idx}`} style={{position:'relative', height:'110px', borderRadius:'var(--r-md)', overflow:'hidden', border:'2px solid var(--brand)'}}>
                  <img src={URL.createObjectURL(file)} alt={`Pending ${idx}`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  <div style={{position:'absolute', bottom:'8px', left:'8px', background:'var(--brand)', color:'white', fontSize:'10px', fontWeight:'bold', padding:'2px 6px', borderRadius:'4px'}}>NEW</div>
                  <button type="button" onClick={() => removePendingImage(idx)} style={{position:'absolute', top:'8px', right:'8px', background:'var(--brick-deep)', color:'white', border:'none', borderRadius:'4px', padding:'4px 8px', fontSize:'11px', cursor:'pointer'}}>Remove</button>
                </div>
              ))}

              {/* Upload Box */}
              {(existingImages.length + pendingImages.length) < 4 && (
                <label style={{height:'110px', borderRadius:'var(--r-md)', border:'2px dashed var(--line-dark)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'var(--paper-dim)'}}>
                  <input type="file" style={{display:'none'}} accept="image/*" multiple onChange={handleFileUpload} disabled={isUploading} />
                  {isUploading ? (
                    <span style={{fontSize:'12px', fontWeight:600, color:'var(--brand)'}}>Uploading...</span>
                  ) : (
                    <>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--ink-soft)" style={{marginBottom:'8px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span style={{fontSize:'12px', fontWeight:600, color:'var(--ink-soft)'}}>Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            form="edit-room-form"
            disabled={updateMutation.isPending || isUploading}
            className="btn btn-primary"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
