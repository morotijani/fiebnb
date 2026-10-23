import React from 'react';
import { useAuth } from '../context/AuthContext';
import HomeownerTenantsView from './homeowner/HomeownerTenantsView';
import ApartmentTenantsView from './apartment/ApartmentTenantsView';

export default function TenantsView() {
  const { user } = useAuth();

  if (user?.role === 'HOMEOWNER') {
    return <HomeownerTenantsView />;
  }

  return <ApartmentTenantsView />;
}
