import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, CornerDownRight, Trash2, Send } from 'lucide-react';
import { VideoComment, CommentReply } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';

interface VideoCommentsProps {
  videoId: string;
}

export const VideoComments: React.FC<VideoCommentsProps> = ({ videoId }) => {
  const { currentUser, setIsAuthModalOpen, showToast } = useApp();
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const loadComments = () => {
    let list = db.getComments(videoId);
    if (sortBy === 'top') {
      list = [...list].sort((a, b) => b.likes - a.likes);
    } else {
      list = [...list].sort((a, b) => b.id.localeCompare(a.id));
    }
    setComments(list);
  };

  useEffect(() => {
    loadComments();
  }, [videoId, sortBy]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newCommentText.trim()) return;

    db.addComment(videoId, newCommentText);
    setNewCommentText('');
    loadComments();
    showToast('Comment posted', 'success');
  };

  const handleAddReply = (commentId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!replyText.trim()) return;

    db.addReply(videoId, commentId, replyText);
    setReplyText('');
    setReplyingCommentId(null);
    loadComments();
    showToast('Reply added', 'success');
  };

  const handleLikeComment = (commentId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    db.toggleCommentLike(videoId, commentId);
    loadComments();
  };

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Header with Count & Sort */}
      <div className="flex items-center gap-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
          {totalComments} Comments
        </h3>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setSortBy('top')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              sortBy === 'top'
                ? 'bg-slate-200 dark:bg-[#333333] text-slate-900 dark:text-white font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-[#252525]'
            }`}
          >
            Top comments
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              sortBy === 'newest'
                ? 'bg-slate-200 dark:bg-[#333333] text-slate-900 dark:text-white font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-[#252525]'
            }`}
          >
            Newest first
          </button>
        </div>
      </div>

      {/* Add New Comment Box */}
      <div className="flex gap-3">
        {currentUser ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#252525] shrink-0" />
        )}
        <form onSubmit={handleAddComment} className="flex-1 flex flex-col gap-2">
          <textarea
            rows={2}
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder={currentUser ? 'Add a comment...' : 'Sign in to add a comment'}
            disabled={!currentUser}
            className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors resize-none"
          />
          <div className="flex justify-end gap-2">
            {newCommentText && (
              <button
                type="button"
                onClick={() => setNewCommentText('')}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!newCommentText.trim() || !currentUser}
              className="px-4 py-1.5 rounded-full bg-[#FF0033] hover:bg-red-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-5 divide-y divide-slate-100 dark:divide-[#252525]">
        {comments.map(comment => (
          <div key={comment.id} className="pt-4 first:pt-0 flex gap-3">
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {comment.userName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{comment.timestamp}</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 leading-relaxed whitespace-pre-line">
                {comment.text}
              </p>

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                    comment.isLiked
                      ? 'text-[#FF0033]'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span className="tabular-nums">{comment.likes > 0 ? comment.likes : ''}</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      setIsAuthModalOpen(true);
                      return;
                    }
                    setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                >
                  Reply
                </button>
              </div>

              {/* Reply Input Form */}
              {replyingCommentId === comment.id && (
                <div className="mt-3 pl-3 border-l-2 border-red-500 flex flex-col gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a public reply..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingCommentId(null);
                        setReplyText('');
                      }}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-3 py-1 rounded-full bg-[#FF0033] text-white text-xs font-semibold disabled:opacity-40"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies List */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l border-slate-200 dark:border-[#2a2a2a] flex flex-col gap-3">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-2.5">
                      <img
                        src={reply.userAvatar}
                        alt={reply.userName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {reply.userName}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
