import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function GuestsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      const res = await axiosClient.get('/bookings/all');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{padding: '40px'}}>
        <p style={{color: 'var(--ink-soft)'}}>Loading guests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{borderColor: 'var(--brick-deep)'}}>
        <p style={{color: 'var(--brick-deep)'}}>Error loading guests list. Ensure the backend is running.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'CONFIRMED': 
      case 'COMPLETED': 
        return <span className="status live">{status}</span>;
      case 'PENDING': 
        return <span className="status pending">{status}</span>;
      case 'CANCELLED': 
        return <span className="status paused" style={{color: 'var(--brick-deep)'}}>{status}</span>;
      default: 
        return <span className="status paused">{status}</span>;
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    // Search matching
    const searchLower = searchQuery.toLowerCase();
    const guestName = booking.guest?.name?.toLowerCase() || 'walk-in guest';
    const guestPhone = booking.guest?.phone_number || '';
    const propName = booking.property?.title?.toLowerCase() || '';
    const roomName = booking.room?.room_number?.toLowerCase() || '';

    const matchesSearch = 
      guestName.includes(searchLower) || 
      guestPhone.includes(searchLower) ||
      propName.includes(searchLower) ||
      roomName.includes(searchLower);

    // Status matching
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Guests & Bookings</h1>
          <p>Manage all your incoming, current, and past guests.</p>
        </div>
      </div>

      <div style={{display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 300px'}}>
          <input 
            type="text" 
            placeholder="Search by guest name, phone, property or room..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{width: '100%'}}
          />
        </div>
        <div style={{flex: '0 0 200px'}}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{width: '100%'}}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="panel" style={{padding: 0, overflowX: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th style={{width: '40px'}}>#</th>
              <th>Guest Info</th>
              <th>Property / Room</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th style={{textAlign: 'right'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings?.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: 'var(--ink-soft)'}}>
                  No bookings match your search.
                </td>
              </tr>
            )}
            {filteredBookings?.map((booking, index) => (
              <tr key={booking.id}>
                <td style={{color: 'var(--ink-soft)', fontSize: '13.5px', fontWeight: 500}}>
                  {index + 1}
                </td>
                <td>
                  <div style={{fontWeight: 600, color: 'var(--ink)', fontSize: '14px'}}>
                    {booking.guest ? booking.guest.name : 'Walk-In Guest'}
                  </div>
                  <div style={{fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px'}}>
                    {booking.guest ? booking.guest.phone_number : 'N/A'}
                  </div>
                </td>
                <td>
                  <div style={{fontWeight: 600, color: 'var(--ink)', fontSize: '14px'}}>{booking.property?.title || 'Unknown Property'}</div>
                  <div style={{fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px'}}>Room {booking.room?.room_number || 'Unassigned'}</div>
                </td>
                <td style={{color: 'var(--ink-soft)', fontSize: '13.5px'}}>
                  {new Date(booking.check_in).toLocaleDateString()}
                </td>
                <td style={{color: 'var(--ink-soft)', fontSize: '13.5px'}}>
                  {new Date(booking.check_out).toLocaleDateString()}
                </td>
                <td>
                  {getStatusBadge(booking.status)}
                </td>
                <td style={{textAlign: 'right', fontWeight: 700, color: 'var(--ink)', fontSize: '15px'}}>
                  ₵{booking.total_amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
