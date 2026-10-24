import React from 'react';
import { useAuth } from '../context/AuthContext';
import HomeownerMaintenanceView from './homeowner/HomeownerMaintenanceView';
import ApartmentMaintenanceView from './apartment/MaintenanceView';

export default function MaintenanceView() {
  const { user } = useAuth();

  if (user?.role === 'HOMEOWNER') {
    return <HomeownerMaintenanceView />;
  }

  return <ApartmentMaintenanceView />;
}
