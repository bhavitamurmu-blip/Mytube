import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Video as VideoIcon,
  Bell,
  Sun,
  Moon,
  User,
  X,
  Upload,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    theme,
    toggleTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    navigateToHome,
    navigateToSearch,
    navigateToStudio,
    navigateToAdmin,
    navigateToChannel,
    navigateToWatch,
    setIsUploadOpen,
    setIsAuthModalOpen,
    notifications,
    refreshNotifications,
    logout,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchHistory(db.getSearchHistory());
  }, [showSearchDropdown]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setShowSearchDropdown(false);
      navigateToSearch(searchInput.trim());
    }
  };

  const handleSelectHistoryItem = (query: string) => {
    setSearchInput(query);
    setShowSearchDropdown(false);
    navigateToSearch(query);
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-5 h-14 bg-white dark:bg-[#0f0f0f] border-b border-slate-200 dark:border-[#272727] select-none transition-colors">
      {/* Zone 1: Menu toggle & Brand */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#272727] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={navigateToHome}
          className="flex items-center gap-1.5 focus:outline-none group cursor-pointer"
        >
          {/* Custom MyTube Logo (Play Icon Badge with Red Gradient) */}
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FF0033] flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4 text-white fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            My<span className="text-[#FF0033]">Tube</span>
          </span>
        </button>
      </div>

      {/* Zone 2: Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-xl mx-2 md:mx-6">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search videos, creators, channels..."
              className="w-full h-9 md:h-10 pl-4 pr-9 text-sm rounded-l-full bg-slate-50 dark:bg-[#121212] border border-slate-300 dark:border-[#303030] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-9 md:h-10 px-4 md:px-6 rounded-r-full bg-slate-100 dark:bg-[#222222] border border-l-0 border-slate-300 dark:border-[#303030] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Search Suggestions & History Dropdown */}
        {showSearchDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1.5 py-2 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl border border-slate-200 dark:border-[#303030] z-50 overflow-hidden">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Recent & Trending Searches</span>
              {searchHistory.length > 0 && (
                <button
                  onClick={() => {
                    db.clearSearchHistory();
                    setSearchHistory([]);
                  }}
                  className="text-[11px] text-red-500 hover:underline capitalize"
                >
                  Clear
                </button>
              )}
            </div>
            {searchHistory.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectHistoryItem(query)}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{query}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#272727] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        {/* Create / Upload Video Button */}
        <button
          onClick={() => {
            if (!currentUser) {
              setIsAuthModalOpen(true);
            } else {
              setIsUploadOpen(true);
            }
          }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-[#2f2f2f] text-slate-900 dark:text-slate-100 font-medium text-xs md:text-sm border border-slate-200 dark:border-[#333333] transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4 text-[#FF0033]" />
          <span>Create</span>
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(prev => !prev);
              if (!showNotifications) {
                db.markAllNotificationsAsRead();
                refreshNotifications();
              }
            }}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#272727] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-[#FF0033] rounded-full flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#303030] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                <span className="text-xs text-slate-500">{notifications.length} updates</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2a2a2a]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No notifications yet.</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.videoId) navigateToWatch(notif.videoId);
                        setShowNotifications(false);
                      }}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-[#252525] cursor-pointer flex gap-3 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                        {notif.type === 'milestone' ? <Sparkles className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        {currentUser ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center focus:outline-none cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 hover:ring-2 hover:ring-red-500 transition-all"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#303030] z-50 overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-[#2a2a2a] flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.handle}</p>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigateToChannel(currentUser.id);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-3"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Your Channel</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigateToStudio();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-3"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>MyTube Studio</span>
                  </button>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigateToAdmin();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center gap-3"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Moderation</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-[#2a2a2a] pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium text-xs md:text-sm transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
