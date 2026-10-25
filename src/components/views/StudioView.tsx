import React, { useState, useEffect } from 'react';
import {
  Upload,
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  X,
  Check,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Video, VideoCategory } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';

export const StudioView: React.FC = () => {
  const {
    currentUser,
    setIsUploadOpen,
    navigateToWatch,
    showToast,
  } = useApp();

  const [creatorVideos, setCreatorVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<VideoCategory>('Technology');
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  const loadVideos = () => {
    if (!currentUser) return;
    const all = db.getVideos();
    const myVideos = all.filter(v => v.channel.id === currentUser.id || v.isUserUploaded);
    setCreatorVideos(myVideos);
  };

  useEffect(() => {
    loadVideos();
  }, [currentUser]);

  // Calculations
  const totalViews = creatorVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = creatorVideos.reduce((sum, v) => sum + v.likes, 0);
  const totalComments = creatorVideos.reduce((sum, v) => sum + db.getComments(v.id).length, 0);
  const estimatedWatchHours = (totalViews * 4.2 / 60).toFixed(1);

  const handleOpenEdit = (v: Video) => {
    setEditingVideo(v);
    setEditTitle(v.title);
    setEditDesc(v.description);
    setEditCategory(v.category);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    db.updateVideo(editingVideo.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
    });

    setEditingVideo(null);
    loadVideos();
    showToast('Video metadata updated', 'success');
  };

  const handleConfirmDelete = () => {
    if (!videoToDelete) return;
    db.deleteVideo(videoToDelete.id);
    setVideoToDelete(null);
    loadVideos();
    showToast('Video deleted from channel', 'info');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-6 select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#272727]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Channel Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-[#FF0033] font-mono font-bold uppercase">
              Studio
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your channel content, analyze performance telemetry, and engage with your community.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#FF0033] hover:bg-red-700 text-white font-semibold text-xs tracking-wide flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Analytics KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {totalViews.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +18.4% vs last period
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Watch Time (Hours)</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {estimatedWatchHours} hrs
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Consistent viewer retention
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Subscribers</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {currentUser?.subscribedChannelIds.length ? '1,240' : '120'}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +48 this week
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Videos</span>
            <ThumbsUp className="w-4 h-4 text-[#FF0033]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {creatorVideos.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalComments} community comments
          </span>
        </div>
      </div>

      {/* Videos Management Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Channel Content
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {creatorVideos.length} {creatorVideos.length === 1 ? 'video' : 'videos'} uploaded
          </span>
        </div>

        {creatorVideos.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <Upload className="w-10 h-10 text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No videos uploaded yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upload your first video to see performance analytics and manage metadata here.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2 rounded-full bg-[#FF0033] text-white text-xs font-semibold"
            >
              Upload Video
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#272727] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-3">Video</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Views</th>
                  <th className="pb-3 px-3 text-right">Likes</th>
                  <th className="pb-3 px-3 text-right">Comments</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
                {creatorVideos.map(vid => (
                  <tr key={vid.id} className="hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors">
                    {/* Video Column */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => navigateToWatch(vid.id)}
                          className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer"
                        >
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[10px] text-white font-mono">
                            {vid.durationFormatted}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 max-w-xs">
                          <p
                            onClick={() => navigateToWatch(vid.id)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-red-500 cursor-pointer line-clamp-1"
                          >
                            {vid.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {vid.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {vid.uploadDate}
                    </td>

                    {/* Views */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {vid.views.toLocaleString()}
                    </td>

                    {/* Likes */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {vid.likes.toLocaleString()}
                    </td>

                    {/* Comments */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {db.getComments(vid.id).length}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigateToWatch(vid.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2e2e2e]"
                          title="Watch video"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(vid)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2e2e2e]"
                          title="Edit metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setVideoToDelete(vid)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#272727]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Video Details
              </h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as VideoCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Technology">Technology</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Music">Music</option>
                  <option value="Education">Education</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Sports">Sports</option>
                  <option value="News">News</option>
                  <option value="Animation">Animation</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#272727]">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FF0033] text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Video?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete "{videoToDelete.title}"? This cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-slate-100 dark:bg-[#252525] text-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
