import React, { useState } from 'react';
import {
  History,
  Clock,
  ThumbsUp,
  Tv,
  ListVideo,
  Trash2,
  Play,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { VideoCard } from '../video/VideoCard';
import { Video } from '../../types';

interface LibraryViewProps {
  initialSubTab?: 'history' | 'watch-later' | 'liked-videos' | 'subscriptions' | 'playlists';
}

export const LibraryView: React.FC<LibraryViewProps> = ({ initialSubTab = 'history' }) => {
  const {
    currentUser,
    navigateToWatch,
    navigateToChannel,
    setIsAuthModalOpen,
    refreshUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'history' | 'watch-later' | 'liked-videos' | 'subscriptions' | 'playlists'>(initialSubTab);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-500 mb-4">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Enjoy your favorite videos
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          Sign in to access videos that you've liked, saved to watch later, or watched recently.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 rounded-full bg-[#FF0033] text-white text-xs font-semibold cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Retrieve videos
  const allVideos = db.getVideos();

  // Watch History
  const historyVideos: Video[] = currentUser.history
    .map(h => allVideos.find(v => v.id === h.videoId))
    .filter((v): v is Video => !!v);

  // Watch Later
  const watchLaterVideos: Video[] = currentUser.watchLaterVideoIds
    .map(id => allVideos.find(v => v.id === id))
    .filter((v): v is Video => !!v);

  // Liked Videos
  const likedVideos: Video[] = currentUser.likedVideoIds
    .map(id => allVideos.find(v => v.id === id))
    .filter((v): v is Video => !!v);

  // Subscribed Channels
  const subscribedChannels = allVideos
    .map(v => v.channel)
    .filter((c, idx, arr) => arr.findIndex(item => item.id === c.id) === idx)
    .filter(c => currentUser.subscribedChannelIds.includes(c.id));

  // Playlists
  const playlists = currentUser.playlists || [];

  const handleClearHistory = () => {
    db.clearHistory();
    refreshUser();
    showToast('Watch history cleared', 'info');
  };

  const handleRemoveHistoryItem = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.removeFromHistory(videoId);
    refreshUser();
    showToast('Removed from watch history', 'info');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-6 select-none">
      {/* Header Profile preview */}
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-[#272727]">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500">
            {currentUser.handle} · {currentUser.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mt-6 border-b border-slate-200 dark:border-[#272727] text-sm font-semibold overflow-x-auto no-scrollbar">
        {[
          { key: 'history', label: `History (${historyVideos.length})`, icon: History },
          { key: 'watch-later', label: `Watch Later (${watchLaterVideos.length})`, icon: Clock },
          { key: 'liked-videos', label: `Liked Videos (${likedVideos.length})`, icon: ThumbsUp },
          { key: 'subscriptions', label: `Subscriptions (${subscribedChannels.length})`, icon: Tv },
          { key: 'playlists', label: `Playlists (${playlists.length})`, icon: ListVideo },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                isActive
                  ? 'text-red-600 border-b-2 border-red-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="py-6">
        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Watch History
              </h2>
              {historyVideos.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </div>

            {historyVideos.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                You haven't watched any videos yet. Videos you watch will appear here.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-4xl">
                {historyVideos.map(vid => (
                  <div key={vid.id} className="relative group">
                    <VideoCard video={vid} layout="horizontal" />
                    <button
                      onClick={e => handleRemoveHistoryItem(vid.id, e)}
                      className="absolute top-3 right-10 p-1.5 rounded-full text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WATCH LATER TAB */}
        {activeTab === 'watch-later' && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Saved to Watch Later
            </h2>
            {watchLaterVideos.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No videos saved for later. Click "Save" on any video to add it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {watchLaterVideos.map(vid => (
                  <VideoCard key={vid.id} video={vid} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIKED VIDEOS TAB */}
        {activeTab === 'liked-videos' && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Liked Videos
            </h2>
            {likedVideos.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No liked videos yet. Like videos to build your favorites list!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {likedVideos.map(vid => (
                  <VideoCard key={vid.id} video={vid} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Channels You Follow
            </h2>
            {subscribedChannels.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                You haven't subscribed to any creators yet. Explore trending videos to discover creators!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscribedChannels.map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => navigateToChannel(channel.id)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] hover:border-red-500 transition-colors cursor-pointer"
                  >
                    <img
                      src={channel.avatarUrl}
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {channel.name}
                      </h3>
                      <p className="text-xs text-slate-500">{channel.handle}</p>
                      <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                        {(channel.subscribers / 1000).toFixed(0)}K subscribers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLAYLISTS TAB */}
        {activeTab === 'playlists' && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Saved Playlists
            </h2>
            {playlists.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No playlists created yet. Save videos into custom playlists while watching!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {playlists.map(pl => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      if (pl.videoIds.length > 0) {
                        navigateToWatch(pl.videoIds[0]);
                      } else {
                        showToast('This playlist is currently empty', 'info');
                      }
                    }}
                    className="group flex flex-col gap-2 rounded-2xl p-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] hover:border-red-500 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                      <img
                        src={pl.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play All</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono">
                        {pl.videoIds.length} videos
                      </div>
                    </div>
                    <div className="px-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {pl.title}
                      </h3>
                      {pl.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {pl.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
