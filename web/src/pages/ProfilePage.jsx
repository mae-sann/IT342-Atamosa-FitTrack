import { useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';
import '../styles/profile.css';

function formatMemberSince(dateValue) {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function roleLabel(role) {
  const value = String(role || '').toUpperCase();
  return value.includes('ADMIN') ? 'Admin' : 'User';
}

function accountType(provider) {
  return String(provider || '').toUpperCase() === 'GOOGLE' ? 'Google Account' : 'Local Account';
}

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!successMsg) return undefined;
    const timer = setTimeout(() => setSuccessMsg(''), 2500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getCurrentUser();
      const data = response.data;
      setUser(data);
      setFirstName(data?.firstName || '');
      setLastName(data?.lastName || '');
      localStorage.setItem('user', JSON.stringify(data));
    } catch (requestError) {
      console.error('Failed to load profile:', requestError);
      setError('Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = () => {
    if (editing) {
      setFirstName(user?.firstName || '');
      setLastName(user?.lastName || '');
      setEditing(false);
      setError('');
      return;
    }
    setEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEditing(false);
    setError('');
  };

  const handleSaveProfile = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setError('First name and last name are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authService.updateProfile({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
      });
      setUser(response.data);
      setFirstName(response.data?.firstName || trimmedFirstName);
      setLastName(response.data?.lastName || trimmedLastName);
      localStorage.setItem('user', JSON.stringify(response.data));
      setEditing(false);
      setSuccessMsg('Profile updated successfully');
    } catch (requestError) {
      console.error('Failed to update profile:', requestError);
      setError(requestError?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Password updated successfully');
    } catch (requestError) {
      console.error('Failed to change password:', requestError);
      setError(requestError?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const fullName = useMemo(() => {
    const first = (user?.firstName || '').trim();
    const last = (user?.lastName || '').trim();
    const resolved = `${first} ${last}`.trim();
    if (!resolved) return loading ? 'Loading...' : '';
    return resolved;
  }, [user]);

  const initials = useMemo(() => {
    const first = (user?.firstName || '').trim();
    const last = (user?.lastName || '').trim();
    const composed = `${first} ${last}`.trim();
    if (!composed) return loading ? '...' : '';
    return composed
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  }, [user, loading]);

  const memberSince = formatMemberSince(user?.createdAt);
  const profileRole = roleLabel(user?.role);
  const profileAccountType = accountType(user?.provider);
  const isGoogleAccount = String(user?.provider || '').toUpperCase() === 'GOOGLE';

  return (
    <div className="profile-page flex min-h-screen">
      <Sidebar user={user} active="profile" />

      <main className="flex-1 overflow-y-auto flex flex-col items-center">
        <div className="sticky top-0 z-20 bg-[#0A0F1E]/80 backdrop-blur border-b border-white/5 px-8 py-4 w-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-white">Profile Settings</h1>
            <p className="text-sm text-gray-500">Manage your account information and security</p>
          </div>
        </div>

        <div className="w-full max-w-4xl p-8">
          {(loading && !user) && (
            <div className="glass rounded-2xl p-4 mb-6 text-sm text-gray-300">Loading profile...</div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {successMsg}
            </div>
          )}

          <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-4xl font-black bebas text-white shadow-lg">
                {initials}
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black text-white">{fullName}</h2>
              <p className="text-gray-400 text-sm">{loading && !user ? '' : (user?.email || '')}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full font-semibold">{profileRole} Account</span>
                <span className="text-xs text-gray-400">Member since {memberSince}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 mb-6" id="profileCard">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white text-base">Personal Information</h2>
              <button type="button" className="btn-outline" onClick={handleToggleEdit}>
                {editing ? '✕ Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  className="input-field"
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  className="input-field"
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <input type="email" value={user?.email || ''} className="input-field" disabled />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed after registration</p>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Role</label>
              <input type="text" value={profileRole} className="input-field" disabled />
            </div>

            {editing && (
              <div className="flex gap-3 mt-5" id="saveRow">
                <button type="button" className="btn-primary" onClick={handleSaveProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-outline" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-white text-base mb-5">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Role</span>
                <span className="text-white font-semibold">{profileRole}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Account type</span>
                <span className="text-white font-semibold">{profileAccountType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Member since</span>
                <span className="text-white font-semibold">{memberSince}</span>
              </div>
            </div>
          </div>

          {isGoogleAccount ? (
            <div className="glass rounded-2xl p-6 mb-6 border border-blue-600/20">
              <h2 className="font-bold text-white text-base mb-3">Password Management</h2>
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3 text-xs text-blue-300">
                You signed in with Google. Password management is handled by your Google account.
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-white text-base mb-5">Change Password</h2>
              <div className="space-y-5">
                <div className="mb-1">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>
                <div className="mb-1">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    className="input-field"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
                <div className="mb-1">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3 text-xs text-blue-300 mt-4">
                  🔒 Password must be at least 8 characters and include a mix of letters and numbers.
                </div>
                <button type="button" className="btn-primary mt-4" onClick={handleChangePassword} disabled={passwordSaving}>
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-6 border border-red-900/30">
            <h2 className="font-bold text-red-400 text-base mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button type="button" className="btn-danger-disabled" disabled title="Not available in this version">
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
