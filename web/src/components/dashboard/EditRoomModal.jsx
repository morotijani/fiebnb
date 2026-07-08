import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export default function EditRoomModal({ room, onClose }) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState(room.price_per_night || '');
  const [status, setStatus] = useState(room.status);
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.put(`/rooms/${room.id}`, { price_per_night: price, status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      onClose();
    }
  });

  const photoMutation = useMutation({
    mutationFn: async (file) => {
      setIsUploading(true);
      try {
        // 1. Get Presigned URL
        const presignedRes = await axiosClient.post('/storage/upload-url', {
          filename: file.name,
          contentType: file.type 
        });
        
        const { uploadUrl, publicUrl } = presignedRes.data;

        // 2. Upload file directly to Cloudflare R2
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        if (!uploadRes.ok) throw new Error('Failed to upload file to storage');

        // 3. Append to Room Images
        const appendRes = await axiosClient.post(`/rooms/${room.id}/photos`, {
          imageUrl: publicUrl
        });

        return appendRes.data;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      photoMutation.mutate(file);
    }
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
          
          <form id="edit-room-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Night (₵)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">₵</span>
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                    placeholder="150"
                  />
                </div>
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
            <h3 className="text-lg font-bold text-slate-800 mb-4">Photo Gallery</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {room.images?.map((img, idx) => (
                <div key={idx} className="relative h-32 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={img} alt={`Room ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="text-white text-xs font-medium bg-red-500 px-3 py-1.5 rounded hover:bg-red-600">Remove</button>
                  </div>
                </div>
              ))}

              {/* Upload Box */}
              <label className="relative h-32 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
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
