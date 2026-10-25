import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Video, VideoCategory, NotificationItem, Playlist } from '../types';
import { db } from '../services/db';

export type AppView =
  | 'home'
  | 'watch'
  | 'shorts'
  | 'subscriptions'
  | 'library'
  | 'history'
  | 'watch-later'
  | 'liked-videos'
  | 'channel'
  | 'playlist'
  | 'studio'
  | 'admin'
  | 'search'
  | 'trending';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppContextType {
  currentUser: User | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentView: AppView;
  activeVideoId: string | null;
  activeShortId: string | null;
  activeChannelId: string | null;
  activePlaylistId: string | null;
  searchQuery: string;
  selectedCategory: VideoCategory;
  sidebarCollapsed: boolean;
  isUploadOpen: boolean;
  isAuthModalOpen: boolean;
  isShareModalOpen: boolean;
  shareVideoData: Video | null;
  isPlaylistModalOpen: boolean;
  playlistVideoId: string | null;
  isReportModalOpen: boolean;
  reportVideoId: string | null;
  notifications: NotificationItem[];
  toasts: Toast[];

  // Setters
  setCurrentView: (view: AppView) => void;
  setSelectedCategory: (cat: VideoCategory) => void;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUploadOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setShareVideoData: (video: Video | null) => void;
  setIsPlaylistModalOpen: (open: boolean) => void;
  setPlaylistVideoId: (id: string | null) => void;
  setIsReportModalOpen: (open: boolean) => void;
  setReportVideoId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Navigation helpers
  navigateToHome: () => void;
  navigateToWatch: (videoId: string) => void;
  navigateToShorts: (shortId?: string) => void;
  navigateToChannel: (channelId: string) => void;
  navigateToPlaylist: (playlistId: string) => void;
  navigateToSearch: (query: string) => void;
  navigateToStudio: () => void;
  navigateToAdmin: () => void;
  navigateToView: (view: AppView) => void;

  // Actions
  refreshUser: () => void;
  refreshNotifications: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeShortId, setActiveShortId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareVideoData, setShareVideoData] = useState<Video | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [playlistVideoId, setPlaylistVideoId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportVideoId, setReportVideoId] = useState<string | null>(null);

  // Notifications and Toasts
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize theme from system or storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('mytube_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mytube_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshUser = useCallback(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(db.getNotifications());
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [currentUser, refreshNotifications]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Navigation handlers
  const navigateToHome = useCallback(() => {
    setCurrentView('home');
    setActiveVideoId(null);
    setSelectedCategory('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToWatch = useCallback((videoId: string) => {
    setActiveVideoId(videoId);
    setCurrentView('watch');
    db.recordView(videoId);
    db.addToHistory(videoId);
    refreshUser();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [refreshUser]);

  const navigateToShorts = useCallback((shortId?: string) => {
    const shorts = db.getShorts();
    if (shorts.length > 0) {
      setActiveShortId(shortId || shorts[0].id);
      setCurrentView('shorts');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const navigateToChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentView('channel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToPlaylist = useCallback((playlistId: string) => {
    setActivePlaylistId(playlistId);
    setCurrentView('playlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    db.addSearchQuery(query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToStudio = useCallback(() => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser]);

  const navigateToAdmin = useCallback(() => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser]);

  const navigateToView = useCallback((view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const logout = useCallback(() => {
    db.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Signed out successfully', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        theme,
        toggleTheme,
        currentView,
        activeVideoId,
        activeShortId,
        activeChannelId,
        activePlaylistId,
        searchQuery,
        selectedCategory,
        sidebarCollapsed,
        isUploadOpen,
        isAuthModalOpen,
        isShareModalOpen,
        shareVideoData,
        isPlaylistModalOpen,
        playlistVideoId,
        isReportModalOpen,
        reportVideoId,
        notifications,
        toasts,

        setCurrentView,
        setSelectedCategory,
        setSidebarCollapsed,
        setIsUploadOpen,
        setIsAuthModalOpen,
        setIsShareModalOpen,
        setShareVideoData,
        setIsPlaylistModalOpen,
        setPlaylistVideoId,
        setIsReportModalOpen,
        setReportVideoId,
        setSearchQuery,

        navigateToHome,
        navigateToWatch,
        navigateToShorts,
        navigateToChannel,
        navigateToPlaylist,
        navigateToSearch,
        navigateToStudio,
        navigateToAdmin,
        navigateToView,

        refreshUser,
        refreshNotifications,
        showToast,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
