import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomeView } from './components/views/HomeView';
import { VideoPlayerView } from './components/video/VideoPlayerView';
import { ShortsViewer } from './components/shorts/ShortsViewer';
import { ChannelView } from './components/views/ChannelView';
import { StudioView } from './components/views/StudioView';
import { AdminView } from './components/views/AdminView';
import { LibraryView } from './components/views/LibraryView';
import { SearchView } from './components/views/SearchView';

import { UploadModal } from './components/modals/UploadModal';
import { AuthModal } from './components/modals/AuthModal';
import { ShareModal } from './components/modals/ShareModal';
import { PlaylistModal } from './components/modals/PlaylistModal';
import { ReportModal } from './components/modals/ReportModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, activeVideoId, activeChannelId, searchQuery, toasts } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar (hidden when in watch view on desktop if user wants theater, or responsive) */}
        {currentView !== 'shorts' && <Sidebar />}

        {/* View Router */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {currentView === 'home' && <HomeView />}
          {currentView === 'watch' && activeVideoId && <VideoPlayerView videoId={activeVideoId} />}
          {currentView === 'shorts' && <ShortsViewer />}
          {currentView === 'channel' && activeChannelId && <ChannelView channelId={activeChannelId} />}
          {currentView === 'studio' && <StudioView />}
          {currentView === 'admin' && <AdminView />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'history' && <LibraryView initialSubTab="history" />}
          {currentView === 'watch-later' && <LibraryView initialSubTab="watch-later" />}
          {currentView === 'liked-videos' && <LibraryView initialSubTab="liked-videos" />}
          {currentView === 'subscriptions' && <LibraryView initialSubTab="subscriptions" />}
          {currentView === 'search' && <SearchView query={searchQuery} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <UploadModal />
      <AuthModal />
      <ShareModal />
      <PlaylistModal />
      <ReportModal />

      {/* Toast Notifications */}
      <div className="fixed bottom-18 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in pointer-events-auto border border-white/10 dark:border-black/10"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
