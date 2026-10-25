import React from 'react';
import { VideoCategory } from '../../types';
import { useApp } from '../../context/AppContext';

const CATEGORIES: VideoCategory[] = [
  'All',
  'Trending',
  'Music',
  'Gaming',
  'Education',
  'Comedy',
  'Sports',
  'News',
  'Technology',
  'Animation',
];

export const CategoryPills: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useApp();

  return (
    <div className="sticky top-14 z-30 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md border-b border-slate-100 dark:border-[#222222] py-2.5 px-4 overflow-x-auto no-scrollbar select-none">
      <div className="flex items-center gap-2 max-w-full">
        {CATEGORIES.map(category => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#222222] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2c2c2c]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
