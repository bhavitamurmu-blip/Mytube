import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ListPlus,
  Download,
  Flag,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Tv
} from 'lucide-react';
import { Video } from '../../types';
import { db, getMediaBlob } from '../../services/db';
import { useApp } from '../../context/AppContext';
import { VideoCard } from './VideoCard';
import { VideoComments } from './VideoComments';

interface VideoPlayerViewProps {
  videoId: string;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ videoId }) => {
  const {
    currentUser,
    setIsAuthModalOpen,
    setShareVideoData,
    setIsShareModalOpen,
    setPlaylistVideoId,
    setIsPlaylistModalOpen,
    setReportVideoId,
    setIsReportModalOpen,
    navigateToChannel,
    refreshUser,
    showToast,
  } = useApp();

  const [video, setVideo] = useState<Video | null>(null);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSpeedSubmenu, setShowSpeedSubmenu] = useState(false);
  const [showQualitySubmenu, setShowQualitySubmenu] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [centerIconState, setCenterIconState] = useState<'play' | 'pause' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Load video details
  useEffect(() => {
    const v = db.getVideoById(videoId);
    if (v) {
      setVideo(v);
      // Check if user uploaded blob exists in IndexedDB
      if (v.isUserUploaded) {
        getMediaBlob(v.id).then(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setBlobSrc(url);
          }
        });
      } else {
        setBlobSrc(null);
      }
    }
  }, [videoId]);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (blobSrc) {
        URL.revokeObjectURL(blobSrc);
      }
    };
  }, [blobSrc]);

  // Auto-hide controls on inactivity
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3000);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      triggerCenterRipple('play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerCenterRipple('pause');
    }
  };

  const triggerCenterRipple = (type: 'play' | 'pause') => {
    setCenterIconState(type);
    setTimeout(() => setCenterIconState(null), 500);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedSubmenu(false);
    setShowSettingsMenu(false);
    showToast(`Speed set to ${speed}x`, 'info');
  };

  const handleQualitySelect = (q: string) => {
    setQuality(q);
    setShowQualitySubmenu(false);
    setShowSettingsMenu(false);
    showToast(`Quality switched to ${q}`, 'info');
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Social Actions
  const isLiked = currentUser?.likedVideoIds.includes(videoId) ?? false;
  const isDisliked = currentUser?.dislikedVideoIds.includes(videoId) ?? false;
  const isSubscribed = currentUser?.subscribedChannelIds.includes(video?.channel.id || '') ?? false;

  const handleLike = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = db.toggleLike(videoId);
    if (video) setVideo({ ...video, likes: res.likes });
    refreshUser();
  };

  const handleDislike = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = db.toggleDislike(videoId);
    if (video) setVideo({ ...video, dislikes: res.dislikes });
    refreshUser();
  };

  const handleSubscribe = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!video) return;
    const res = db.toggleSubscribe(video.channel.id);
    setVideo({
      ...video,
      channel: { ...video.channel, subscribers: res.subscribers },
    });
    refreshUser();
    showToast(
      res.isSubscribed
        ? `Subscribed to ${video.channel.name}`
        : `Unsubscribed from ${video.channel.name}`,
      'info'
    );
  };

  const handleDownload = () => {
    if (!video) return;
    const url = blobSrc || video.videoUrl;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started', 'success');
  };

  if (!video) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading video...
      </div>
    );
  }

  const upNextVideos = db.getVideos().filter(v => v.id !== video.id).slice(0, 10);

  return (
    <div className={`w-full max-w-7xl mx-auto px-2 md:px-4 py-4 ${isTheater ? 'max-w-none px-0' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player + Details + Comments */}
        <div className={`flex flex-col ${isTheater ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          {/* Video Player Container */}
          <div
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setControlsVisible(false)}
            className={`relative group bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl select-none ${
              isTheater ? 'rounded-none' : ''
            }`}
          >
            {/* Native HTML5 Video Element */}
            <video
              ref={videoRef}
              src={blobSrc || video.videoUrl}
              poster={video.thumbnailUrl}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              playsInline
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Center Play/Pause Ripple Indicator */}
            {centerIconState && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center animate-ping">
                  {centerIconState === 'play' ? (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  ) : (
                    <Pause className="w-8 h-8 fill-current" />
                  )}
                </div>
              </div>
            )}

            {/* Custom Hover Controls Overlay */}
            <div
              className={`absolute inset-0 flex flex-col justify-between p-3 md:p-4 bg-gradient-to-t from-black/85 via-transparent to-black/30 transition-opacity duration-200 pointer-events-auto ${
                controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Bar inside player */}
              <div className="flex items-center justify-between text-white drop-shadow-md">
                <h2 className="text-sm md:text-base font-semibold truncate pr-4">
                  {video.title}
                </h2>
                <div className="text-xs px-2 py-0.5 rounded bg-black/60 font-mono">
                  {quality}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex flex-col gap-2">
                {/* Scrubber / Progress Bar */}
                <div className="relative flex items-center group/scrubber cursor-pointer">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 hover:h-2.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#FF0033] transition-all"
                  />
                </div>

                {/* Controls Action Row */}
                <div className="flex items-center justify-between text-white text-xs md:text-sm">
                  {/* Left: Play, Skip, Volume, Time */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1 hover:text-red-400 transition-colors"
                      title={isPlaying ? 'Pause (space)' : 'Play (space)'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current" />
                      )}
                    </button>

                    <button
                      onClick={() => seekRelative(-10)}
                      className="p-1 hover:text-red-400 transition-colors hidden sm:block"
                      title="Rewind 10s (Left Arrow)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => seekRelative(10)}
                      className="p-1 hover:text-red-400 transition-colors hidden sm:block"
                      title="Forward 10s (Right Arrow)"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1.5 group/vol">
                      <button
                        onClick={toggleMute}
                        className="p-1 hover:text-red-400 transition-colors"
                        title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-14 sm:w-20 h-1 bg-white/40 rounded-lg appearance-none cursor-pointer accent-[#FF0033]"
                      />
                    </div>

                    {/* Time readout */}
                    <div className="font-mono text-xs text-white/90 tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration || video.duration)}
                    </div>
                  </div>

                  {/* Right: Speed, Quality/Settings, Theater, Fullscreen */}
                  <div className="relative flex items-center gap-3">
                    {/* Settings Menu Trigger */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowSettingsMenu(prev => !prev);
                          setShowSpeedSubmenu(false);
                          setShowQualitySubmenu(false);
                        }}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>

                      {/* Settings Popover */}
                      {showSettingsMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#333333] text-white p-1 z-30 overflow-hidden text-xs">
                          {!showSpeedSubmenu && !showQualitySubmenu && (
                            <>
                              <button
                                onClick={() => setShowSpeedSubmenu(true)}
                                className="w-full px-3 py-2 text-left hover:bg-[#2e2e2e] rounded-lg flex items-center justify-between"
                              >
                                <span>Playback speed</span>
                                <span className="text-slate-400">{playbackSpeed}x</span>
                              </button>
                              <button
                                onClick={() => setShowQualitySubmenu(true)}
                                className="w-full px-3 py-2 text-left hover:bg-[#2e2e2e] rounded-lg flex items-center justify-between"
                              >
                                <span>Quality</span>
                                <span className="text-slate-400">{quality}</span>
                              </button>
                            </>
                          )}

                          {/* Speed Submenu */}
                          {showSpeedSubmenu && (
                            <div>
                              <button
                                onClick={() => setShowSpeedSubmenu(false)}
                                className="w-full px-3 py-1.5 text-left text-slate-400 font-semibold border-b border-[#303030] mb-1"
                              >
                                ← Speed Options
                              </button>
                              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                                <button
                                  key={speed}
                                  onClick={() => handleSpeedSelect(speed)}
                                  className={`w-full px-3 py-1.5 text-left hover:bg-[#2e2e2e] rounded-md flex items-center justify-between ${
                                    playbackSpeed === speed ? 'text-red-500 font-bold' : ''
                                  }`}
                                >
                                  <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                  {playbackSpeed === speed && <span>✓</span>}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Quality Submenu */}
                          {showQualitySubmenu && (
                            <div>
                              <button
                                onClick={() => setShowQualitySubmenu(false)}
                                className="w-full px-3 py-1.5 text-left text-slate-400 font-semibold border-b border-[#303030] mb-1"
                              >
                                ← Video Quality
                              </button>
                              {['1080p Full HD', '720p HD', '480p', '360p', 'Auto'].map(q => (
                                <button
                                  key={q}
                                  onClick={() => handleQualitySelect(q)}
                                  className={`w-full px-3 py-1.5 text-left hover:bg-[#2e2e2e] rounded-md flex items-center justify-between ${
                                    quality.includes(q.split(' ')[0]) ? 'text-red-500 font-bold' : ''
                                  }`}
                                >
                                  <span>{q}</span>
                                  {quality.includes(q.split(' ')[0]) && <span>✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Theater Mode */}
                    <button
                      onClick={() => setIsTheater(prev => !prev)}
                      className="p-1 hover:text-red-400 transition-colors hidden sm:block"
                      title={isTheater ? 'Default view' : 'Theater mode'}
                    >
                      <Tv className="w-5 h-5" />
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1 hover:text-red-400 transition-colors"
                      title={isFullscreen ? 'Exit full screen (f)' : 'Full screen (f)'}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5" />
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Title */}
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-3 leading-snug">
            {video.title}
          </h1>

          {/* Channel Row & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pb-3 border-b border-slate-200 dark:border-[#272727]">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateToChannel(video.channel.id)}
                className="focus:outline-none"
              >
                <img
                  src={video.channel.avatarUrl}
                  alt={video.channel.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
              </button>
              <div>
                <button
                  onClick={() => navigateToChannel(video.channel.id)}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <span>{video.channel.name}</span>
                  {video.channel.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
                  )}
                </button>
                <p className="text-xs text-slate-500 tabular-nums">
                  {(video.channel.subscribers / 1000).toFixed(0)}K subscribers
                </p>
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                className={`ml-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSubscribed
                    ? 'bg-slate-200 dark:bg-[#2b2b2b] text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-[#353535]'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>

            {/* Interaction Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Like / Dislike Split Button */}
              <div className="flex items-center rounded-full bg-slate-100 dark:bg-[#222222] border border-slate-200 dark:border-[#333333] overflow-hidden">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer ${
                    isLiked ? 'text-[#FF0033]' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="tabular-nums">{(video.likes / 1000).toFixed(1)}K</span>
                </button>
                <div className="w-px h-5 bg-slate-300 dark:bg-[#404040]" />
                <button
                  onClick={handleDislike}
                  className={`px-3 py-1.5 text-xs hover:bg-slate-200 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer ${
                    isDisliked ? 'text-[#FF0033]' : 'text-slate-800 dark:text-slate-200'
                  }`}
                  title="I dislike this"
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share */}
              <button
                onClick={() => {
                  setShareVideoData(video);
                  setIsShareModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-[#2f2f2f] border border-slate-200 dark:border-[#333333] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* Save to Playlist */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setPlaylistVideoId(video.id);
                  setIsPlaylistModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-[#2f2f2f] border border-slate-200 dark:border-[#333333] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ListPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="p-2 rounded-full bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-[#2f2f2f] border border-slate-200 dark:border-[#333333] text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                title="Download video"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Report */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setReportVideoId(video.id);
                  setIsReportModalOpen(true);
                }}
                className="p-2 rounded-full bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-[#2f2f2f] border border-slate-200 dark:border-[#333333] text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                title="Report video"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div
            onClick={() => setIsDescriptionExpanded(prev => !prev)}
            className="mt-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-[#202020] text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-200/80 dark:hover:bg-[#272727] transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-slate-900 dark:text-white">
              <span className="tabular-nums">{video.views.toLocaleString()} views</span>
              <span>{video.uploadDate}</span>
              {video.tags && video.tags.length > 0 && (
                <div className="flex gap-1.5 text-blue-500 dark:text-blue-400 font-semibold">
                  {video.tags.slice(0, 3).map(tag => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <p
              className={`text-xs md:text-sm mt-2 leading-relaxed whitespace-pre-line ${
                isDescriptionExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {video.description}
            </p>

            <button
              type="button"
              className="mt-2 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1"
            >
              <span>{isDescriptionExpanded ? 'Show less' : 'Show more'}</span>
              {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Comments Section */}
          <VideoComments videoId={video.id} />
        </div>

        {/* Right Column: Up Next / Recommended Videos */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">
            Up next
          </h3>
          <div className="flex flex-col gap-1.5">
            {upNextVideos.map(nextVid => (
              <VideoCard key={nextVid.id} video={nextVid} layout="horizontal" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
