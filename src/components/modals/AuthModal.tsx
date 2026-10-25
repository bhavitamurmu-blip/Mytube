import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Shield, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, DEMO_USERS } from '../../services/db';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, refreshUser, showToast } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = db.login(email);
    if (res.error) {
      setError(res.error);
      return;
    }
    refreshUser();
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${res.user?.name}!`, 'success');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email.');
      return;
    }
    const cleanHandle = handle.trim() || name.replace(/\s+/g, '');
    const res = db.signup(name.trim(), email.trim(), cleanHandle);
    if (res.error) {
      setError(res.error);
      return;
    }
    refreshUser();
    setIsAuthModalOpen(false);
    showToast(`Welcome to MyTube, ${res.user?.name}! Your channel is ready.`, 'success');
  };

  const handleQuickDemoLogin = (userId: string) => {
    db.setCurrentUser(userId);
    refreshUser();
    setIsAuthModalOpen(false);
    const user = db.getCurrentUser();
    showToast(`Logged in as ${user?.name} (${user?.role})`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#272727]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#E50914] to-[#FF0033] flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {mode === 'signin' ? 'Sign in to MyTube' : 'Create MyTube Account'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Fast Demo Accounts Switcher */}
        <div className="my-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-[#303030]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            1-Click Quick Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('user-creator')}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white dark:bg-[#2a2a2a] hover:ring-2 hover:ring-red-500 text-center transition-all cursor-pointer shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Creator"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                Sarah (Creator)
              </span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('user-admin')}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white dark:bg-[#2a2a2a] hover:ring-2 hover:ring-amber-500 text-center transition-all cursor-pointer shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate w-full">
                Alex (Admin)
              </span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('user-guest')}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white dark:bg-[#2a2a2a] hover:ring-2 hover:ring-blue-500 text-center transition-all cursor-pointer shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Viewer"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                Jordan (Viewer)
              </span>
            </button>
          </div>
        </div>

        {/* Tab switcher: Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-[#222222] p-1 mb-4">
          <button
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'bg-white dark:bg-[#303030] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-[#303030] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Create Channel
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. sarah@mytube.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-full bg-[#FF0033] hover:bg-red-700 text-white font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Channel / Creator Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Creative Horizon Studio"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Channel Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="@CreativeHorizon"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="creator@domain.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-full bg-[#FF0033] hover:bg-red-700 text-white font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              Create Account & Channel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
