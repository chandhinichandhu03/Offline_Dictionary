import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim()) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(fullName.trim(), email.trim().toLowerCase());
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          User Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Update your profile details and view your account status.
        </p>
      </div>

      {/* Profile Form */}
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
                {user?.username}
              </h3>
              {user?.is_admin && (
                <span className="px-2 py-0.5 text-[9px] font-extrabold text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950 rounded uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'recently'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="glass-input"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || (fullName === user?.full_name && email === user?.email)}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary text-red-500 hover:text-red-600"
            >
              Log Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
