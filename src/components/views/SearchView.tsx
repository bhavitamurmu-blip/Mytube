import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Bell, Filter } from 'lucide-react';
import { Video, Channel } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';
import { VideoCard } from '../video/VideoCard';

interface SearchViewProps {
  query: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ query }) => {
  const { navigateToChannel, currentUser, refreshUser, showToast, setIsAuthModalOpen } = useApp();

  const [matchingVideos, setMatchingVideos] = useState<Video[]>([]);
  const [matchingChannels, setMatchingChannels] = useState<Channel[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'videos' | 'channels'>('all');

  useEffect(() => {
    const all = db.getVideos();
    const q = query.toLowerCase().trim();

    const vids = all.filter(
      v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        v.channel.handle.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q))
    );

    // Extract channels matching query
    const channelsMap = new Map<string, Channel>();
    all.forEach(v => {
      if (
        v.channel.name.toLowerCase().includes(q) ||
        v.channel.handle.toLowerCase().includes(q)
      ) {
        channelsMap.set(v.channel.id, v.channel);
      }
    });

    setMatchingVideos(vids);
    setMatchingChannels(Array.from(channelsMap.values()));
  }, [query]);

  const handleSubscribeChannel = (channel: Channel) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = db.toggleSubscribe(channel.id);
    refreshUser();
    showToast(
      res.isSubscribed ? `Subscribed to ${channel.name}` : `Unsubscribed from ${channel.name}`,
      'info'
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-6 select-none">
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#272727]">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-red-500" />
          <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
            Results for <span className="text-red-500">"{query}"</span>
          </h1>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('videos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'videos'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-slate-300'
            }`}
          >
            Videos ({matchingVideos.length})
          </button>
          <button
            onClick={() => setFilterType('channels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'channels'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-slate-300'
            }`}
          >
            Channels ({matchingChannels.length})
          </button>
        </div>
      </div>

      <div className="py-6 flex flex-col gap-6">
        {/* MATCHING CHANNELS SPOTLIGHT */}
        {(filterType === 'all' || filterType === 'channels') && matchingChannels.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Creators & Channels
            </span>
            <div className="divide-y divide-slate-100 dark:divide-[#252525]">
              {matchingChannels.map(channel => {
                const isSubscribed = currentUser?.subscribedChannelIds.includes(channel.id);
                return (
                  <div
                    key={channel.id}
                    onClick={() => navigateToChannel(channel.id)}
                    className="flex items-center justify-between gap-4 py-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={channel.avatarUrl}
                        alt={channel.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-[#303030]"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-red-500 transition-colors">
                          <span>{channel.name}</span>
                          {channel.verified && (
                            <CheckCircle className="w-4 h-4 text-slate-400 fill-slate-400" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {channel.handle} · {(channel.subscribers / 1000).toFixed(0)}K subscribers
                        </p>
                        {channel.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 max-w-md">
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribeChannel(channel);
                      }}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        isSubscribed
                          ? 'bg-slate-200 dark:bg-[#2b2b2b] text-slate-800 dark:text-slate-200'
                          : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-red-600'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-slate-200 dark:bg-[#272727] my-2" />
          </div>
        )}

        {/* MATCHING VIDEOS */}
        {(filterType === 'all' || filterType === 'videos') && (
          <div>
            {matchingVideos.length === 0 && matchingChannels.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500">
                No matching results found for "{query}". Try checking your spelling or search for popular topics like "Blender", "Supercars", or "Synthwave".
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-w-4xl">
                {matchingVideos.map(vid => (
                  <VideoCard key={vid.id} video={vid} layout="horizontal" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
