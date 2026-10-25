import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Film,
  Image,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { VideoCategory } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';

export const UploadModal: React.FC = () => {
  const { isUploadOpen, setIsUploadOpen, currentUser, navigateToWatch, showToast } = useApp();

  const [step, setStep] = useState<'select' | 'details' | 'uploading' | 'complete'>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('Technology');
  const [tags, setTags] = useState('Tech, Tutorial, Creator');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isShort, setIsShort] = useState(false);

  // Progress state
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('Uploading video...');
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  if (!isUploadOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Auto populate clean title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));

    // Auto generate thumbnail via hidden video canvas
    setIsGeneratingThumbnail(true);
    const video = document.createElement('video');
    video.src = objectUrl;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1; // 1 second in

    video.onloadeddata = () => {
      // Determine if vertical video (Shorts)
      if (video.videoHeight > video.videoWidth) {
        setIsShort(true);
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbData = canvas.toDataURL('image/jpeg', 0.85);
          setThumbnailUrl(thumbData);
        }
      } catch {
        // Fallback thumbnail
        setThumbnailUrl('https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80');
      }
      setIsGeneratingThumbnail(false);
    };

    video.onerror = () => {
      setThumbnailUrl('https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80');
      setIsGeneratingThumbnail(false);
    };

    setStep('details');
  };

  // Or use demo video loader if user does not have a video file ready on device
  const handleLoadSampleVideo = () => {
    fetch('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'Wildfire_Action_Sample.mp4', { type: 'video/mp4' });
        processSelectedFile(file);
      })
      .catch(() => {
        showToast('Sample loaded', 'info');
      });
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedFile) return;

    setStep('uploading');
    setProgress(15);
    setProcessingStatus('Uploading video data...');

    // Progress simulation
    setTimeout(() => {
      setProgress(45);
      setProcessingStatus('Upload finished. Processing 1080p HD stream...');
    }, 800);

    setTimeout(() => {
      setProgress(85);
      setProcessingStatus('Encoding thumbnails and metadata...');
    }, 1600);

    setTimeout(async () => {
      setProgress(100);
      setProcessingStatus('Checks complete. Video ready!');

      const parsedTags = tags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const newVideo = await db.addVideo(
        {
          title: title.trim() || 'Untitled Video',
          description: description.trim() || 'No description provided.',
          videoUrl: videoPreviewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl:
            thumbnailUrl ||
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          duration: 30,
          durationFormatted: '0:30',
          category,
          tags: parsedTags,
          channel: {
            id: currentUser.id,
            name: currentUser.name,
            handle: currentUser.handle,
            avatarUrl: currentUser.avatarUrl,
            bannerUrl: currentUser.bannerUrl,
            subscribers: 120,
            verified: false,
          },
          isShort,
          resolution: '1080p HD',
          visibility: 'public',
        },
        selectedFile
      );

      setCreatedVideoId(newVideo.id);
      setStep('complete');
      showToast('Video published successfully!', 'success');
    }, 2400);
  };

  const handleClose = () => {
    setIsUploadOpen(false);
    setStep('select');
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setTitle('');
    setDescription('');
    setProgress(0);
    setCreatedVideoId(null);
  };

  const handleWatchNow = () => {
    if (createdVideoId) {
      handleClose();
      navigateToWatch(createdVideoId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#272727]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Video
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#272727]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content based on step */}
        <div className="p-6">
          {/* STEP 1: SELECT FILE */}
          {step === 'select' && (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-[#333333] hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-10 text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#252525] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Drag and drop video files to upload
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Your video will be saved securely with instant 1080p processing. Supports MP4, WebM, and MOV.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-full bg-[#FF0033] hover:bg-red-700 text-white font-semibold text-xs tracking-wide transition-colors cursor-pointer"
                >
                  Select File from Device
                </button>

                <button
                  onClick={handleLoadSampleVideo}
                  className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#252525] hover:bg-slate-200 dark:hover:bg-[#303030] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Use Sample Video</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: METADATA DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleStartUpload} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Thumbnail Preview */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Thumbnail
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-[#333333] flex items-center justify-center">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 flex flex-col items-center">
                        <Image className="w-6 h-6 mb-1 text-slate-500" />
                        <span>Generating...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="isShortCheck"
                      checked={isShort}
                      onChange={e => setIsShort(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <label htmlFor="isShortCheck" className="text-xs text-slate-600 dark:text-slate-400">
                      Upload as MyTube Short (vertical 9:16)
                    </label>
                  </div>
                </div>

                {/* Form fields */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Title (required)
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Add a title that describes your video"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tell viewers what your video is about"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as VideoCategory)}
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

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="e.g. tech, coding, 4k"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#272727]">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 py-2 rounded-full bg-[#FF0033] hover:bg-red-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Publish Video
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: UPLOADING & PROCESSING */}
          {step === 'uploading' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-red-600 animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {processingStatus}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Please keep this window open while we optimize your video for high definition playback.
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-slate-100 dark:bg-[#252525] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400 mt-2">
                {progress}%
              </span>
            </div>
          )}

          {/* STEP 4: COMPLETE */}
          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Video Published Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                "{title}" is now publicly visible on your channel and appearing in search feeds.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-[#252525] hover:bg-slate-200 dark:hover:bg-[#303030] text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  Done
                </button>
                <button
                  onClick={handleWatchNow}
                  className="px-6 py-2.5 rounded-full bg-[#FF0033] hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-red-500/20"
                >
                  <span>Watch Video</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
