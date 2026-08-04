import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Plus, Edit2 } from 'lucide-react';
import EditUnitModal from '../../components/dashboard/EditUnitModal';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:3000';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function ApartmentUnitsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <div className="space-y-6 animate-pulse">
        <div className="dash-topbar">
          <div><div className="h-8 bg-slate-200 rounded w-1/4"></div></div>
        </div>
        <div className="panel h-64 bg-slate-200"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">Failed to load units data.</div>;
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
        <button className="btn btn-primary" onClick={handleAddUnit}>
          <Plus size={16} /> Add Unit
        </button>
      </div>

      <div className="panel">
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Building</th>
                <th>Category</th>
                <th>Price / Month</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units?.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
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
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        {unit.images && unit.images[0] ? (
                          <img 
                            src={getImageUrl(unit.images[0])} 
                            style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} 
                            alt={unit.room_number}
                          />
                        ) : (
                          <div style={{width: '40px', height: '40px', borderRadius: '4px', background: 'var(--paper-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: '10px'}}>
                            No Img
                          </div>
                        )}
                        <div style={{fontWeight: '600'}}>{unit.room_number}</div>
                      </div>
                    </td>
                    <td>{unit.property?.title || 'Unknown'}</td>
                    <td>{unit.category?.name || 'Unspecified'}</td>
                    <td>₵{price.toLocaleString()}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                        background: isOccupied ? '#e6f7ec' : '#f1f3f5',
                        color: isOccupied ? '#0f7b40' : '#495057'
                      }}>
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '4px 8px', fontSize: '12px'}}
                        onClick={() => handleEditUnit(unit)}
                      >
                        <Edit2 size={12} style={{marginRight: '4px'}} /> Edit
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
    </>
  );
}
