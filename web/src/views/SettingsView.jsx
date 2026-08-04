import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function SettingsView() {
  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Settings</h1>
          <p>Manage your account profile and security.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Personal Information</h2>
          </div>
          <ProfileForm />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Security</h2>
          </div>
          <PasswordChangeForm />
        </div>
      </div>
    </>
  );
}

function ProfileForm() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axiosClient.get('/auth/profile');
      return res.data;
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    momo_number: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone_number: profile.phone_number || '',
        momo_number: profile.momo_number || ''
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      alert('Profile updated successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div style={{color: 'var(--ink-soft)'}}>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      <div>
        <label className="form-label">Full Name</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="form-control"
        />
      </div>
      <div>
        <label className="form-label">Email</label>
        <input 
          type="email" 
          value={profile?.email || ''}
          disabled
          className="form-control"
          style={{background: 'var(--paper-dim)', color: 'var(--ink-soft)', cursor: 'not-allowed'}}
        />
        <p style={{fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px'}}>Email cannot be changed directly.</p>
      </div>
      <div>
        <label className="form-label">Account Role</label>
        <input 
          type="text" 
          value={profile?.role || ''}
          disabled
          className="form-control"
          style={{background: 'var(--paper-dim)', color: 'var(--ink-soft)', cursor: 'not-allowed', textTransform: 'capitalize'}}
        />
      </div>
      <div>
        <label className="form-label">Phone Number</label>
        <input 
          type="text" 
          value={formData.phone_number}
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
          className="form-control"
        />
      </div>
      <div>
        <label className="form-label">Mobile Money Number</label>
        <input 
          type="text" 
          value={formData.momo_number}
          onChange={(e) => setFormData({...formData, momo_number: e.target.value})}
          placeholder="e.g. 0541234567"
          className="form-control"
        />
      </div>
      <div style={{marginTop: '8px'}}>
        <button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="btn btn-primary"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function PasswordChangeForm() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const passwordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.put('/auth/password', data);
      return res.data;
    },
    onSuccess: () => {
      alert('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to update password');
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });
  };

  return (
    <form onSubmit={handlePasswordSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      <div>
        <label className="form-label">Current Password</label>
        <input 
          type="password" 
          required
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
          className="form-control"
        />
      </div>
      <div>
        <label className="form-label">New Password</label>
        <input 
          type="password" 
          required
          minLength={6}
          value={passwords.newPassword}
          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
          className="form-control"
        />
      </div>
      <div>
        <label className="form-label">Confirm New Password</label>
        <input 
          type="password" 
          required
          minLength={6}
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
          className="form-control"
        />
      </div>
      <div style={{marginTop: '8px'}}>
        <button 
          type="submit" 
          disabled={passwordMutation.isPending}
          className="btn btn-primary"
        >
          {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}
