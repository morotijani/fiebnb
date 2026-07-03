import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInInitialData, setWalkInInitialData] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isBookingSidebarOpen, setIsBookingSidebarOpen] = useState(false);

  const openWalkInModal = (initialData = null) => {
    setWalkInInitialData(initialData);
    setIsWalkInModalOpen(true);
  };

  const closeWalkInModal = () => {
    setIsWalkInModalOpen(false);
    setWalkInInitialData(null);
  };

  const openBookingSidebar = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsBookingSidebarOpen(true);
  };

  const closeBookingSidebar = () => {
    setIsBookingSidebarOpen(false);
    // Optional: add a small delay before clearing the ID to let the slide-out animation finish gracefully
    setTimeout(() => setSelectedBookingId(null), 300);
  };

  return (
    <DashboardContext.Provider value={{
      isWalkInModalOpen,
      walkInInitialData,
      openWalkInModal,
      closeWalkInModal,
      isBookingSidebarOpen,
      selectedBookingId,
      openBookingSidebar,
      closeBookingSidebar
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
