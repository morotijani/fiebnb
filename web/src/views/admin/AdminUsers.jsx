import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/users');
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Users</h1>
        <p className="text-slate-500 mt-1 text-sm">All registered users on Fiebnb.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users?.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{user.name}</td>
                    <td className="p-4 text-sm text-slate-600">{user.email}</td>
                    <td className="p-4 text-sm text-slate-600">{user.phone_number}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
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
