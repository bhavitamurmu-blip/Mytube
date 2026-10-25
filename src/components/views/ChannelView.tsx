import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Bell,
  Play,
  Film,
  ListVideo,
  Info,
  Edit3,
  Calendar,
  Share2,
  Tv
} from 'lucide-react';
import { Channel, Video } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';
import { VideoCard } from '../video/VideoCard';

interface ChannelViewProps {
  channelId: string;
}

export const ChannelView: React.FC<ChannelViewProps> = ({ channelId }) => {
  const {
    currentUser,
    setIsAuthModalOpen,
    setIsUploadOpen,
    refreshUser,
    showToast,
    navigateToWatch,
  } = useApp();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [channelShorts, setChannelShorts] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'playlists' | 'about'>('home');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  const isOwnChannel = currentUser?.id === channelId;

  useEffect(() => {
    // Look up channel from videos or current user
    const allVideos = db.getVideos();
    const v = allVideos.find(vid => vid.channel.id === channelId);

    if (v) {
      setChannel(v.channel);
      setBioInput(v.channel.description || '');
    } else if (currentUser && currentUser.id === channelId) {
      const userChan: Channel = {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        bannerUrl: currentUser.bannerUrl,
        subscribers: 120,
        description: currentUser.bio || 'Welcome to my official MyTube channel!',
        joinedDate: 'Joined Oct 2026',
      };
      setChannel(userChan);
      setBioInput(userChan.description || '');
    }

    const videos = allVideos.filter(vid => vid.channel.id === channelId && !vid.isShort);
    const shorts = allVideos.filter(vid => vid.channel.id === channelId && vid.isShort);
    setChannelVideos(videos);
    setChannelShorts(shorts);
  }, [channelId, currentUser]);

  if (!channel) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading channel...
      </div>
    );
  }

  const isSubscribed = currentUser?.subscribedChannelIds.includes(channel.id) ?? false;

  const handleSubscribe = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = db.toggleSubscribe(channel.id);
    setChannel(prev => (prev ? { ...prev, subscribers: res.subscribers } : null));
    refreshUser();
    showToast(
      res.isSubscribed ? `Subscribed to ${channel.name}` : `Unsubscribed from ${channel.name}`,
      'info'
    );
  };

  const handleSaveBio = () => {
    if (isOwnChannel) {
      db.updateUserProfile({ bio: bioInput });
      refreshUser();
      setChannel(prev => (prev ? { ...prev, description: bioInput } : null));
      setIsEditingBio(false);
      showToast('Channel bio updated', 'success');
    }
  };

  const featuredVideo = channelVideos[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-6 py-4 select-none">
      {/* Channel Banner */}
      <div className="relative w-full h-36 sm:h-52 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-200 dark:border-[#272727]">
        <img
          src={
            channel.bannerUrl ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80'
          }
          alt={channel.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Channel Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 px-2">
        <div className="flex items-center gap-4 md:gap-6">
          <img
            src={channel.avatarUrl}
            alt={channel.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-white dark:border-[#0f0f0f] shadow-lg shrink-0"
          />
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{channel.name}</span>
              {channel.verified && (
                <CheckCircle className="w-5 h-5 text-slate-400 fill-slate-400" />
              )}
            </h1>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {channel.handle}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {(channel.subscribers / 1000).toFixed(0)}K subscribers
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {channelVideos.length + channelShorts.length} videos
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-1 max-w-xl">
              {channel.description || 'Welcome to my channel on MyTube!'}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          {isOwnChannel ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#FF0033] hover:bg-red-700 text-white font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              Upload New Video
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              className={`px-6 py-2.5 rounded-full font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSubscribed
                  ? 'bg-slate-200 dark:bg-[#2b2b2b] text-slate-800 dark:text-slate-200'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Channel Navigation Tabs */}
      <div className="flex items-center gap-4 mt-6 border-b border-slate-200 dark:border-[#272727] text-sm font-semibold text-slate-500 overflow-x-auto no-scrollbar">
        {[
          { key: 'home', label: 'Home' },
          { key: 'videos', label: `Videos (${channelVideos.length})` },
          { key: 'shorts', label: `Shorts (${channelShorts.length})` },
          { key: 'about', label: 'About' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-1 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {/* HOME TAB: Featured Spotlight + Uploads Grid */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8">
            {featuredVideo && (
              <div
                onClick={() => navigateToWatch(featuredVideo.id)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] cursor-pointer hover:border-red-500 transition-colors"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                  <img
                    src={featuredVideo.thumbnailUrl}
                    alt={featuredVideo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-xs font-mono">
                    {featuredVideo.durationFormatted}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                    Featured Video
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {featuredVideo.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                    {featuredVideo.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                    <span>{(featuredVideo.views / 1000).toFixed(0)}K views</span>
                    <span>·</span>
                    <span>{featuredVideo.uploadDate}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Latest Uploads
              </h3>
              {channelVideos.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No videos uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {channelVideos.map(vid => (
                    <VideoCard key={vid.id} video={vid} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div>
            {channelVideos.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                This channel has not posted any videos yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {channelVideos.map(vid => (
                  <VideoCard key={vid.id} video={vid} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SHORTS TAB */}
        {activeTab === 'shorts' && (
          <div>
            {channelShorts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                This channel has not posted any vertical Shorts yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {channelShorts.map(short => (
                  <div
                    key={short.id}
                    onClick={() => navigateToWatch(short.id)}
                    className="group flex flex-col gap-2 rounded-2xl cursor-pointer"
                  >
                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                      <img
                        src={short.thumbnailUrl}
                        alt={short.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold drop-shadow line-clamp-2">
                        {short.title}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 tabular-nums px-1">
                      {(short.views / 1000).toFixed(0)}K views
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Description
                </h4>
                {isOwnChannel && !isEditingBio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Bio</span>
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-[#202020] border border-slate-300 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1.5 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {channel.description || 'No description provided.'}
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{channel.joinedDate || 'Joined October 2026'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-slate-400" />
                <span>{channelVideos.length + channelShorts.length} total videos published</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
