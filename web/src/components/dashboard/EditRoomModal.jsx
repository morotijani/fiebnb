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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Edit Room {room.room_number}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form id="edit-room-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Name / Number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="e.g. 101, Suite A"
                  required
                />
              </div>

              {/* Property */}
              {properties && properties.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                  <select
                    value={modalPropertyId}
                    onChange={(e) => {
                      setModalPropertyId(e.target.value);
                      setCategoryId(''); // Reset category since property changed
                    }}
                    className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  disabled={isLoadingCategories}
                >
                  <option value="">Select Category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} (₵{cat.price_per_night})</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Out of Order (Maintenance)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Photos Section */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Photo Gallery (Max 4)</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {/* Existing Images */}
              {existingImages.map((img, idx) => (
                <div key={`existing-${idx}`} className="relative h-32 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={getImageUrl(img)} alt={`Room ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeExistingImage(idx)} className="text-white text-xs font-medium bg-red-500 px-3 py-1.5 rounded hover:bg-red-600">Remove</button>
                  </div>
                </div>
              ))}

              {/* Pending Images */}
              {pendingImages.map((file, idx) => (
                <div key={`pending-${idx}`} className="relative h-32 rounded-lg overflow-hidden border border-yellow-400 group">
                  <img src={URL.createObjectURL(file)} alt={`Pending ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">New</div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removePendingImage(idx)} className="text-white text-xs font-medium bg-red-500 px-3 py-1.5 rounded hover:bg-red-600">Remove</button>
                  </div>
                </div>
              ))}

              {/* Upload Box */}
              {(existingImages.length + pendingImages.length) < 4 && (
                <label className="relative h-32 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} disabled={isUploading} />
                  {isUploading ? (
                    <div className="flex flex-col items-center text-blue-500">
                      <svg className="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs font-semibold">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-8 w-8 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium text-slate-500">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-room-form"
            disabled={updateMutation.isPending || isUploading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center shadow-sm"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
