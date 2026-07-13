import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { format } from 'date-fns';

export default function AdminProperties() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['adminProperties'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/properties');
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading properties...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Properties</h1>
        <p className="text-slate-500 mt-1 text-sm">All properties hosted on Fiebnb.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Property</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Type</th>
                <th className="p-4">Rooms</th>
                <th className="p-4">Status</th>
                <th className="p-4">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No properties found.
                  </td>
                </tr>
              ) : (
                properties?.map(prop => (
                  <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{prop.title}</p>
                      <p className="text-xs text-slate-500">{prop.address || 'No address'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {prop.owner?.name} <br/>
                      <span className="text-xs text-slate-400">{prop.owner?.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                        {prop.property_type || (prop.is_multi_room ? 'MULTI-ROOM' : 'SINGLE UNIT')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 text-center">
                      {prop._count?.rooms || 0}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        prop.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(prop.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
