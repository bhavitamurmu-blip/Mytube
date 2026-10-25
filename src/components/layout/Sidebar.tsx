import React from 'react';
import {
  Home,
  Flame,
  Clapperboard,
  Tv,
  History,
  Clock,
  ThumbsUp,
  Library,
  ListVideo,
  Gamepad2,
  Music2,
  GraduationCap,
  Sparkles,
  Trophy,
  Newspaper,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    sidebarCollapsed,
    setSidebarCollapsed,
    navigateToHome,
    navigateToShorts,
    navigateToView,
    navigateToStudio,
    navigateToAdmin,
    navigateToChannel,
    currentUser,
    setSelectedCategory,
  } = useApp();

  const subscribedChannels = currentUser?.subscribedChannelIds
    ? db.getVideos()
        .map(v => v.channel)
        .filter((c, idx, arr) => arr.findIndex(item => item.id === c.id) === idx)
        .filter(c => currentUser.subscribedChannelIds.includes(c.id))
    : [];

  const mainNavItems = [
    { label: 'Home', icon: Home, view: 'home', onClick: navigateToHome },
    { label: 'Shorts', icon: Clapperboard, view: 'shorts', onClick: () => navigateToShorts() },
    { label: 'Subscriptions', icon: Tv, view: 'subscriptions', onClick: () => navigateToView('subscriptions') },
  ];

  const libraryItems = [
    { label: 'You (Library)', icon: Library, view: 'library', onClick: () => navigateToView('library') },
    { label: 'History', icon: History, view: 'history', onClick: () => navigateToView('history') },
    { label: 'Watch Later', icon: Clock, view: 'watch-later', onClick: () => navigateToView('watch-later') },
    { label: 'Liked Videos', icon: ThumbsUp, view: 'liked-videos', onClick: () => navigateToView('liked-videos') },
  ];

  const exploreItems = [
    { label: 'Trending', icon: Flame, category: 'Trending' },
    { label: 'Music', icon: Music2, category: 'Music' },
    { label: 'Gaming', icon: Gamepad2, category: 'Gaming' },
    { label: 'Education', icon: GraduationCap, category: 'Education' },
    { label: 'Comedy', icon: Sparkles, category: 'Comedy' },
    { label: 'Sports', icon: Trophy, category: 'Sports' },
    { label: 'News', icon: Newspaper, category: 'News' },
  ];

  // Collapsed Rail (Mini icon sidebar for desktop)
  if (sidebarCollapsed) {
    return (
      <aside className="hidden md:flex flex-col items-center w-18 py-3 bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-[#272727] h-[calc(100vh-3.5rem)] sticky top-14 select-none shrink-0 transition-all">
        <div className="flex flex-col gap-1 w-full px-1">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#FF0033] bg-red-50 dark:bg-red-950/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252525]'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-1.5 truncate max-w-full text-center">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => navigateToView('library')}
            className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-colors cursor-pointer ${
              currentView === 'library'
                ? 'text-[#FF0033] bg-red-50 dark:bg-red-950/20 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252525]'
            }`}
            title="You"
          >
            <Library className="w-5 h-5" />
            <span className="text-[10px] mt-1.5 truncate">You</span>
          </button>
        </div>
      </aside>
    );
  }

  // Full Expanded Sidebar
  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-30 md:hidden"
        style={{ display: 'none' }} // Controlled when mobile hamburger is tapped
      />

      <aside className="w-60 bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-[#272727] h-[calc(100vh-3.5rem)] sticky top-14 select-none shrink-0 overflow-y-auto no-scrollbar py-3 px-3 hidden md:flex flex-col gap-4 transition-all">
        {/* Primary section */}
        <div className="flex flex-col gap-0.5">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#272727] font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF0033]' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-slate-200 dark:bg-[#272727]" />

        {/* User Library section */}
        <div className="flex flex-col gap-0.5">
          <div className="px-3.5 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>You</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
          {libraryItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#272727] font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF0033]' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-slate-200 dark:bg-[#272727]" />

        {/* Subscriptions Channels list */}
        {subscribedChannels.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="px-3.5 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subscriptions
            </span>
            {subscribedChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => navigateToChannel(channel.id)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] transition-colors cursor-pointer"
              >
                <img
                  src={channel.avatarUrl}
                  alt={channel.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <span className="truncate flex-1 text-left text-xs font-medium">{channel.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {subscribedChannels.length > 0 && <div className="h-px bg-slate-200 dark:bg-[#272727]" />}

        {/* Explore Categories */}
        <div className="flex flex-col gap-0.5">
          <span className="px-3.5 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Explore
          </span>
          {exploreItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setSelectedCategory(item.category as any);
                  navigateToHome();
                }}
                className="flex items-center gap-4 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] transition-colors cursor-pointer"
              >
                <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-slate-200 dark:bg-[#272727]" />

        {/* Studio & Admin */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={navigateToStudio}
            className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              currentView === 'studio'
                ? 'text-red-600 bg-red-50 dark:bg-red-950/20 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-red-500" />
            <span>MyTube Studio</span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={navigateToAdmin}
              className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'admin'
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222]'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Admin Moderation</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 pb-6 px-3.5 text-[11px] text-slate-400 flex flex-col gap-2">
          <p>© 2026 MyTube, LLC</p>
          <p>Stream, create, connect.</p>
        </div>
      </aside>
    </>
  );
};
