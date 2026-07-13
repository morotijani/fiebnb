import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function OnboardingRequests() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['adminOnboardingRequests'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/onboarding-requests');
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosClient.post(`/admin/onboarding-requests/${id}/approve`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['adminOnboardingRequests']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to approve request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosClient.post(`/admin/onboarding-requests/${id}/reject`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['adminOnboardingRequests']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to reject request');
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading requests...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Onboarding Requests</h1>
        <p className="text-slate-500 mt-1 text-sm">Review and approve new hotels and guesthouses.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Date</th>
                <th className="p-4">User</th>
                <th className="p-4">Property Type</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No onboarding requests found.
                  </td>
                </tr>
              ) : (
                requests?.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{req.user?.name}</p>
                      <p className="text-xs text-slate-500">{req.user?.email}</p>
                      <p className="text-xs text-slate-500">{req.user?.phone_number}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-700">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                        {req.property_type || 'HOTEL'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 whitespace-pre-wrap max-w-xs">
                      {req.admin_notes}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(req.id)}
                            disabled={approveMutation.isLoading || rejectMutation.isLoading}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(req.id)}
                            disabled={approveMutation.isLoading || rejectMutation.isLoading}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
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
