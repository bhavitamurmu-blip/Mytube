import React, { useState } from 'react';
import { X, ListPlus, Plus, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const PlaylistModal: React.FC = () => {
  const {
    isPlaylistModalOpen,
    setIsPlaylistModalOpen,
    playlistVideoId,
    currentUser,
    refreshUser,
    showToast,
  } = useApp();

  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isPlaylistModalOpen || !playlistVideoId || !currentUser) return null;

  const playlists = currentUser.playlists || [];

  const handleTogglePlaylist = (playlistId: string) => {
    const added = db.toggleVideoInPlaylist(playlistId, playlistVideoId);
    refreshUser();
    showToast(added ? 'Added to playlist' : 'Removed from playlist', 'info');
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPl = db.createPlaylist(newTitle);
    if (newPl) {
      db.toggleVideoInPlaylist(newPl.id, playlistVideoId);
      refreshUser();
      setNewTitle('');
      setIsCreating(false);
      showToast(`Playlist "${newPl.title}" created`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#272727]">
          <div className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Save video to...
            </h3>
          </div>
          <button
            onClick={() => setIsPlaylistModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Playlists list */}
        <div className="py-3 max-h-60 overflow-y-auto space-y-1">
          {playlists.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No playlists found. Create one below!
            </p>
          ) : (
            playlists.map(pl => {
              const containsVideo = pl.videoIds.includes(playlistVideoId);
              return (
                <label
                  key={pl.id}
                  onClick={() => handleTogglePlaylist(pl.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#252525] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={containsVideo}
                    className="w-4 h-4 rounded accent-[#FF0033] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {pl.title}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {pl.videoIds.length} {pl.videoIds.length === 1 ? 'video' : 'videos'}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Create new playlist toggle/form */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#272727]">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#252525] hover:bg-slate-200 dark:hover:bg-[#303030] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create new playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-2">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Enter playlist title..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-full bg-[#FF0033] text-white text-xs font-semibold disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
