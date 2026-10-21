import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, BookOpen, Building, Globe, Github, Linkedin, Lock, CheckCircle, AlertCircle, Save, RefreshCw, KeyRound, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const UserProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [passwordNotification, setPasswordNotification] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [academicInfo, setAcademicInfo] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setProfile(data);
        setName(data.name || '');
        setAvatarUrl(data.avatarUrl || '');
        setBio(data.bio || '');
        setDepartment(data.department || '');
        setAcademicInfo(data.academicInfo || '');
        setGithubUrl(data.githubUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setWebsiteUrl(data.websiteUrl || '');
        setEmailNotifications(data.emailNotifications ?? true);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setNotification({ type: 'error', message: 'Could not load your profile details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setNotification(null);
    try {
      setSaving(true);
      const payload = {
        name,
        avatarUrl,
        bio,
        department,
        academicInfo,
        githubUrl,
        linkedinUrl,
        websiteUrl,
        emailNotifications,
      };
      const res = await api.put('/user/profile', payload);
      if (res.data?.success) {
        setProfile(res.data.data);
        if (updateUser) updateUser(res.data.data);
        setNotification({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordNotification(null);

    if (newPassword.length < 6) {
      setPasswordNotification({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotification({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.post('/user/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        setPasswordNotification({ type: 'success', message: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password. Verify your current password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  if (loading) {
    return (
      <div className="text-center py-24">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  const role = profile?.role || authUser?.role;
  const isStudent = role === 'STUDENT';
  const isTeacher = role === 'TEACHER';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account &amp; Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Manage your personal details, academic affiliations, contact preferences, and security credentials.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          {notification.message}
        </div>
      )}

      {/* Main Profile Form Card */}
      <Card>
        <CardHeader
          title="Personal Information"
          subtitle="Update your display name, academic bio, and public portfolio"
        />

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D]">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-600 shadow-sm"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{name || 'User'}</span>
                <Badge variant={isStudent ? 'info' : isTeacher ? 'teal' : 'default'}>
                  {role}
                </Badge>
                <Badge variant="success">Active Account</Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Choose a preset avatar or paste a custom image URL below:
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {defaultAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                      avatarUrl === url ? 'border-indigo-600 scale-110' : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={url} alt={`avatar-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address (Verified)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-[#1A263B] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Institutional
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Department / Faculty
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {isStudent ? 'Program / Academic Year' : 'Academic Designation'}
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={academicInfo}
                  onChange={(e) => setAcademicInfo(e.target.value)}
                  placeholder={isStudent ? 'e.g. B.Tech Year 4, Section B' : 'e.g. Associate Professor'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Custom Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Bio / Academic Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your academic background, research interests, or learning goals..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-slate-100 dark:border-[#23324D] pt-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Public Portfolio &amp; Social Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="border-t border-slate-100 dark:border-[#23324D] pt-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Email Notifications
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Receive weekly progress summaries, mastery milestone updates, and quiz assignments.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 dark:border-[#23324D] pt-5 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={fetchProfile}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={saving}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader
          title="Security & Password"
          subtitle="Update your account password with cryptographic BCrypt hashing"
        />

        {passwordNotification && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border mb-4 ${
              passwordNotification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            }`}
          >
            {passwordNotification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            {passwordNotification.message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#23324D] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              type="submit"
              loading={changingPassword}
              icon={KeyRound}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
