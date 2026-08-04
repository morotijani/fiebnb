import ResourceTimeline from '../components/dashboard/ResourceTimeline';
import { useDashboard } from '../context/DashboardContext';

export default function CalendarView() {
  const { openWalkInModal } = useDashboard();
  
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="dash-topbar">
        <div>
          <h1>Booking Calendar</h1>
          <p>Manage room availability and manual walk-in blocks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openWalkInModal()}>
          + New Walk-in
        </button>
      </div>

      <div style={{flex: 1, minHeight: 0, minWidth: 0}}>
        <ResourceTimeline />
      </div>
    </div>
  );
}
