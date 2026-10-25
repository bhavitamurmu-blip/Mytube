import React, { useState, useEffect } from 'react';
import { Flame, Clapperboard, Sparkles, TrendingUp } from 'lucide-react';
import { Video } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';
import { CategoryPills } from '../video/CategoryPills';
import { VideoCard } from '../video/VideoCard';

export const HomeView: React.FC = () => {
  const { selectedCategory, navigateToShorts, navigateToWatch } = useApp();

  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);

  useEffect(() => {
    const list = db.getVideos(selectedCategory);
    // Separate regular videos from shorts
    setVideos(list.filter(v => !v.isShort));
    setShorts(db.getShorts());
  }, [selectedCategory]);

  const trendingVideos = db.getVideos('Trending').filter(v => !v.isShort).slice(0, 4);

  return (
    <div className="flex flex-col w-full pb-20 select-none">
      {/* Category Pills Bar */}
      <CategoryPills />

      <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-4 flex flex-col gap-8">
        {/* TRENDING SPOTLIGHT (Shown when 'All' or 'Trending' is active) */}
        {(selectedCategory === 'All' || selectedCategory === 'Trending') && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-[#FF0033]">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  Trending Now
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Updated hourly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingVideos.map((vid, idx) => (
                <div key={vid.id} className="relative">
                  <VideoCard video={vid} />
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md bg-black/80 backdrop-blur-xs text-white font-mono text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHORTS SHELF */}
        {shorts.length > 0 && selectedCategory === 'All' && (
          <section className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-[#202020]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-[#FF0033]">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  Shorts
                </h2>
              </div>
              <button
                onClick={() => navigateToShorts()}
                className="text-xs font-bold text-[#FF0033] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-x-auto pb-2">
              {shorts.slice(0, 6).map(short => (
                <div
                  key={short.id}
                  onClick={() => navigateToShorts(short.id)}
                  className="group flex flex-col gap-1.5 rounded-2xl cursor-pointer"
                >
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-md border border-slate-100 dark:border-[#222222]">
                    <img
                      src={short.thumbnailUrl}
                      alt={short.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {short.title}
                      </p>
                      <span className="text-[10px] text-white/80 tabular-nums font-mono mt-1">
                        {(short.views / 1000).toFixed(0)}K views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECOMMENDED VIDEOS GRID */}
        <section className="flex flex-col gap-4 pt-2 border-t border-slate-100 dark:border-[#202020]">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              {selectedCategory === 'All' ? 'Recommended Videos' : `${selectedCategory} Videos`}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {videos.length} videos
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              No videos found in this category. Try selecting another category or uploading your own!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
