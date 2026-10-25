export type VideoCategory =
  | 'All'
  | 'Trending'
  | 'Music'
  | 'Gaming'
  | 'Education'
  | 'Comedy'
  | 'Sports'
  | 'News'
  | 'Technology'
  | 'Animation';

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl?: string;
  subscribers: number;
  verified?: boolean;
  description?: string;
  joinedDate?: string;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies: CommentReply[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  uploadTimestamp: number;
  category: VideoCategory;
  tags: string[];
  channel: Channel;
  isShort?: boolean;
  isUserUploaded?: boolean;
  visibility?: 'public' | 'unlisted' | 'private';
  resolution?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  role: 'user' | 'creator' | 'admin';
  status: 'active' | 'suspended';
  subscribedChannelIds: string[];
  likedVideoIds: string[];
  dislikedVideoIds: string[];
  watchLaterVideoIds: string[];
  history: { videoId: string; watchedAt: number }[];
  playlists: Playlist[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  userId: string;
  videoIds: string[];
  createdAt: string;
  isPrivate?: boolean;
  thumbnailUrl?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  videoId?: string;
  channelAvatar?: string;
  type: 'upload' | 'comment' | 'milestone' | 'system';
}

export interface ReportedContent {
  id: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail: string;
  channelName: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reason: 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'copyright';
  notes?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'removed';
}
