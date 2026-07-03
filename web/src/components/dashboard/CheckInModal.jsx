export default function CheckInModal({ booking, onClose, onConfirm }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Confirm Check-In</h2>
        <p className="text-slate-500 mb-6">
          Are you sure you want to check in <span className="font-semibold text-slate-700">{booking.guest?.name || 'Guest'}</span> into Room <span className="font-semibold text-slate-700">{booking.room?.room_number || 'N/A'}</span>?
        </p>

        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(booking.id)}
            className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Confirm Check-In
          </button>
        </div>
      </div>
    </div>
  );
}
