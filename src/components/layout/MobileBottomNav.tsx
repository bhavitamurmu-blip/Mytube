import React from 'react';
import { Home, Clapperboard, PlusCircle, Tv, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    navigateToHome,
    navigateToShorts,
    navigateToView,
    setIsUploadOpen,
    currentUser,
    setIsAuthModalOpen,
  } = useApp();

  const handleUploadClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setIsUploadOpen(true);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#272727] px-2 py-1 select-none">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Home Tab */}
        <button
          onClick={navigateToHome}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            currentView === 'home' ? 'text-[#FF0033]' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </button>

        {/* Shorts Tab */}
        <button
          onClick={() => navigateToShorts()}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            currentView === 'shorts' ? 'text-[#FF0033]' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Shorts</span>
        </button>

        {/* Upload (+) Tab */}
        <button
          onClick={handleUploadClick}
          className="flex flex-col items-center justify-center min-h-[44px] cursor-pointer text-slate-900 dark:text-white"
          aria-label="Upload Video"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#222222] border border-slate-300 dark:border-[#333333] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 text-[#FF0033]" />
          </div>
        </button>

        {/* Subscriptions Tab */}
        <button
          onClick={() => navigateToView('subscriptions')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            currentView === 'subscriptions' ? 'text-[#FF0033]' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Subscriptions</span>
        </button>

        {/* You / Library Tab */}
        <button
          onClick={() => navigateToView('library')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            currentView === 'library' ? 'text-[#FF0033]' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {currentUser ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium tracking-tight mt-1">You</span>
        </button>
      </div>
    </nav>
  );
};
