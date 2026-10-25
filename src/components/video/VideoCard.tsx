import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Clock, ListPlus, Share2, Flag, CheckCircle } from 'lucide-react';
import { Video } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

interface VideoCardProps {
  video: Video;
  layout?: 'grid' | 'horizontal';
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, layout = 'grid' }) => {
  const {
    navigateToWatch,
    navigateToChannel,
    setShareVideoData,
    setIsShareModalOpen,
    setPlaylistVideoId,
    setIsPlaylistModalOpen,
    setReportVideoId,
    setIsReportModalOpen,
    currentUser,
    setIsAuthModalOpen,
    showToast,
    refreshUser,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const handleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const added = db.toggleWatchLater(video.id);
    refreshUser();
    showToast(added ? 'Saved to Watch Later' : 'Removed from Watch Later', 'success');
  };

  const handleSaveToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setPlaylistVideoId(video.id);
    setIsPlaylistModalOpen(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setShareVideoData(video);
    setIsShareModalOpen(true);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setReportVideoId(video.id);
    setIsReportModalOpen(true);
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => navigateToWatch(video.id)}
        className="group flex gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer select-none relative"
      >
        {/* Horizontal Thumbnail */}
        <div className="relative w-40 sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/85 text-white text-[11px] font-mono tabular-nums font-semibold">
            {video.durationFormatted}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-500 transition-colors leading-snug">
            {video.title}
          </h4>
          <p
            onClick={(e) => {
              e.stopPropagation();
              navigateToChannel(video.channel.id);
            }}
            className="text-xs text-slate-500 dark:text-slate-400 mt-1 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            <span>{video.channel.name}</span>
            {video.channel.verified && <CheckCircle className="w-3 h-3 text-slate-400 fill-slate-400" />}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{formatViews(video.views)}</span>
            <span aria-hidden="true">·</span>
            <span>{video.uploadDate}</span>
          </div>
        </div>

        {/* More Menu */}
        <div ref={menuRef} className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(prev => !prev);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#2b2b2b]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-slate-200 dark:border-[#303030] z-30 py-1 overflow-hidden">
              <button
                onClick={handleWatchLater}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-2.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Save to Watch Later</span>
              </button>
              <button
                onClick={handleSaveToPlaylist}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-2.5"
              >
                <ListPlus className="w-3.5 h-3.5 text-slate-400" />
                <span>Save to Playlist</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-2.5"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Video</span>
              </button>
              <button
                onClick={handleReport}
                className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Video</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div
      onClick={() => navigateToWatch(video.id)}
      className="group flex flex-col gap-3 rounded-2xl p-1 hover:bg-slate-100/50 dark:hover:bg-[#1a1a1a]/50 transition-colors cursor-pointer select-none relative"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 dark:border-[#222222]">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-white text-xs font-mono tabular-nums font-semibold tracking-tight shadow-sm">
          {video.durationFormatted}
        </div>
        {video.resolution && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono uppercase font-bold tracking-wider">
            {video.resolution}
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="flex gap-3 px-1">
        {/* Channel Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToChannel(video.channel.id);
          }}
          className="shrink-0 focus:outline-none"
        >
          <img
            src={video.channel.avatarUrl}
            alt={video.channel.name}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity"
          />
        </button>

        {/* Text Details */}
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
            {video.title}
          </h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              navigateToChannel(video.channel.id);
            }}
            className="text-xs text-slate-500 dark:text-slate-400 mt-1 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 truncate"
          >
            <span>{video.channel.name}</span>
            {video.channel.verified && (
              <CheckCircle className="w-3 h-3 text-slate-400 fill-slate-400 shrink-0" />
            )}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="tabular-nums">{formatViews(video.views)}</span>
            <span aria-hidden="true">·</span>
            <span>{video.uploadDate}</span>
          </div>
        </div>

        {/* 3-dots Context Menu */}
        <div ref={menuRef} className="absolute top-[calc(56.25%+12px)] right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(prev => !prev);
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#2b2b2b] transition-colors"
            aria-label="Video actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-slate-200 dark:border-[#303030] z-30 py-1 overflow-hidden">
              <button
                onClick={handleWatchLater}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-2.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Save to Watch Later</span>
              </button>
              <button
                onClick={handleSaveToPlaylist}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-2.5"
              >
                <ListPlus className="w-3.5 h-3.5 text-slate-400" />
                <span>Save to Playlist</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] flex items-center gap-2.5"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Video</span>
              </button>
              <button
                onClick={handleReport}
                className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Video</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
