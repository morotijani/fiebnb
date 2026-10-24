import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import MatIcon from '../../components/common/MatIcon';
import EditUnitModal from '../../components/dashboard/EditUnitModal';
import CategoriesModal from '../../components/dashboard/CategoriesModal';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function ApartmentUnitsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const { data: units, isLoading, error } = useQuery({
    queryKey: ['apartmentUnits'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/apartment-units');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
        Loading units data...
      </div>
    );
  }

  if (error) {
    return <div className="panel" style={{ color: '#E41E3F', padding: '24px' }}>Failed to load units data.</div>;
  }

  const handleAddUnit = () => {
    setEditingUnit({});
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Units</h1>
          <p>Manage individual apartment units across your portfolio.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => setIsCategoriesModalOpen(true)}>
            <MatIcon name="category" size={16} /> Manage Categories
          </button>
          <button className="btn btn-primary" onClick={handleAddUnit}>
            <MatIcon name="add" size={18} /> Add Unit
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Building</th>
                <th>Category</th>
                <th>Price / Month</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units?.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
                    No units found. Click "Add Unit" to create one.
                  </td>
                </tr>
              )}
              {units?.map(unit => {
                const isOccupied = unit.leases && unit.leases.some(l => l.status === 'ACTIVE');
                const price = unit.custom_price || unit.property?.base_price || 0;
                
                return (
                  <tr key={unit.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {unit.images && unit.images[0] ? (
                          <img 
                            src={getImageUrl(unit.images[0])} 
                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--fb-border)' }} 
                            alt={unit.room_number}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--fb-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fb-primary)' }}>
                            <MatIcon name="meeting_room" size={20} />
                          </div>
                        )}
                        <div style={{ fontWeight: 600, color: 'var(--fb-text)' }}>Unit {unit.room_number}</div>
                      </div>
                    </td>
                    <td>{unit.property?.title || 'Unknown'}</td>
                    <td>{unit.category?.name || 'Unspecified'}</td>
                    <td style={{ fontWeight: 600 }}>GH₵{price.toLocaleString()}</td>
                    <td>
                      <span className={`status ${isOccupied ? 'paid' : 'vacant'}`}>
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleEditUnit(unit)}
                      >
                        <MatIcon name="edit" size={15} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EditUnitModal 
          unit={editingUnit} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {isCategoriesModalOpen && (
        <CategoriesModal 
          onClose={() => setIsCategoriesModalOpen(false)} 
        />
      )}
    </>
  );
}
