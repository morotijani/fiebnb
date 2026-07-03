import ResourceTimeline from '../components/dashboard/ResourceTimeline';

export default function CalendarView() {
  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Booking Calendar</h2>
          <p className="text-slate-500 mt-1">Manage room availability and manual walk-in blocks.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + New Walk-in
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ResourceTimeline />
      </div>
    </div>
  );
}
