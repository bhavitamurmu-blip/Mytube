import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music2,
  X,
  Send,
  CheckCircle
} from 'lucide-react';
import { Video, VideoComment } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';

export const ShortsViewer: React.FC = () => {
  const {
    activeShortId,
    currentUser,
    setIsAuthModalOpen,
    setShareVideoData,
    setIsShareModalOpen,
    navigateToChannel,
    refreshUser,
    showToast,
  } = useApp();

  const [shorts, setShorts] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const list = db.getShorts();
    setShorts(list);
    if (activeShortId) {
      const idx = list.findIndex(s => s.id === activeShortId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [activeShortId]);

  const currentShort = shorts[currentIndex];

  useEffect(() => {
    if (currentShort) {
      db.recordView(currentShort.id);
      db.addToHistory(currentShort.id);
      setComments(db.getComments(currentShort.id));
    }
  }, [currentShort]);

  // Keyboard navigation for Shorts (Up/Down arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shorts.length]);

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const isLiked = currentUser?.likedVideoIds.includes(currentShort?.id || '') ?? false;
  const isDisliked = currentUser?.dislikedVideoIds.includes(currentShort?.id || '') ?? false;
  const isSubscribed = currentUser?.subscribedChannelIds.includes(currentShort?.channel.id || '') ?? false;

  const handleLike = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!currentShort) return;
    const res = db.toggleLike(currentShort.id);
    setShorts(prev =>
      prev.map((s, idx) => (idx === currentIndex ? { ...s, likes: res.likes } : s))
    );
    refreshUser();
  };

  const handleDislike = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!currentShort) return;
    const res = db.toggleDislike(currentShort.id);
    setShorts(prev =>
      prev.map((s, idx) => (idx === currentIndex ? { ...s, dislikes: res.dislikes } : s))
    );
    refreshUser();
  };

  const handleSubscribe = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!currentShort) return;
    const res = db.toggleSubscribe(currentShort.channel.id);
    refreshUser();
    showToast(
      res.isSubscribed
        ? `Subscribed to ${currentShort.channel.name}`
        : `Unsubscribed from ${currentShort.channel.name}`,
      'info'
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newCommentText.trim() || !currentShort) return;

    db.addComment(currentShort.id, newCommentText);
    setNewCommentText('');
    setComments(db.getComments(currentShort.id));
    showToast('Comment added', 'success');
  };

  if (!currentShort) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)] text-slate-500">
        No Shorts available
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-3.5rem)] py-2 select-none overflow-hidden">
      {/* Short Container with Vertical 9:16 Aspect Ratio */}
      <div className="relative w-full max-w-[380px] h-[82vh] max-h-[720px] rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
        {/* Video Player */}
        <video
          ref={videoRef}
          key={currentShort.id}
          src={currentShort.videoUrl}
          poster={currentShort.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play/Pause state indicator */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-black/70 text-white flex items-center justify-center">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Top Floating Controls inside video */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md z-10">
          <div className="px-2.5 py-1 rounded-full bg-black/50 text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm">
            Shorts
          </div>
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Metadata inside video */}
        <div className="absolute bottom-4 left-4 right-16 flex flex-col gap-2 text-white drop-shadow-md z-10 pointer-events-auto">
          {/* Creator Profile */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateToChannel(currentShort.channel.id)}
              className="focus:outline-none"
            >
              <img
                src={currentShort.channel.avatarUrl}
                alt={currentShort.channel.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-white/40"
              />
            </button>
            <button
              onClick={() => navigateToChannel(currentShort.channel.id)}
              className="text-xs font-bold text-white hover:underline flex items-center gap-1"
            >
              <span>{currentShort.channel.handle}</span>
              {currentShort.channel.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
              )}
            </button>
            <button
              onClick={handleSubscribe}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                isSubscribed
                  ? 'bg-white/30 text-white backdrop-blur-sm'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Title & Hashtags */}
          <p className="text-xs font-medium line-clamp-2 leading-relaxed">
            {currentShort.title}
          </p>

          {/* Sound / Audio indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/80 font-medium">
            <Music2 className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="truncate">Original audio · {currentShort.channel.name}</span>
          </div>
        </div>

        {/* Right Floating Action Rail */}
        <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5 text-white z-10 drop-shadow-md">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                isLiked ? 'bg-[#FF0033] text-white' : 'bg-black/50 text-white backdrop-blur-sm'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold tabular-nums">
              {(currentShort.likes / 1000).toFixed(0)}K
            </span>
          </button>

          {/* Dislike */}
          <button
            onClick={handleDislike}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                isDisliked ? 'bg-[#FF0033] text-white' : 'bg-black/50 text-white backdrop-blur-sm'
              }`}
            >
              <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold">Dislike</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold tabular-nums">{comments.length}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              setShareVideoData(currentShort);
              setIsShareModalOpen(true);
            }}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">Share</span>
          </button>
        </div>

        {/* Sliding Comments Drawer */}
        {isCommentsOpen && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md z-30 flex flex-col rounded-3xl overflow-hidden p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#272727]">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Comments ({comments.length})
              </span>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {comments.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-8">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex gap-2.5">
                    <img
                      src={c.userAvatar}
                      alt={c.userName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {c.userName}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#272727]">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-[#202020] text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 rounded-full bg-[#FF0033] text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Vertical Navigation Buttons (Next / Previous Short) */}
      <div className="hidden md:flex flex-col gap-3 ml-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2b2b2b] disabled:opacity-30 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-md"
          title="Previous Short (Up Arrow)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === shorts.length - 1}
          className="p-3 rounded-full bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2b2b2b] disabled:opacity-30 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-md"
          title="Next Short (Down Arrow)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
