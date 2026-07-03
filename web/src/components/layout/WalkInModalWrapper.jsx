import { useDashboard } from '../../context/DashboardContext';
import WalkInModal from '../dashboard/WalkInModal';

export default function WalkInModalWrapper() {
  const { isWalkInModalOpen, closeWalkInModal, walkInInitialData } = useDashboard();

  return (
    <WalkInModal 
      isOpen={isWalkInModalOpen} 
      onClose={closeWalkInModal} 
      initialData={walkInInitialData}
    />
  );
}
