import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen, shareVideoData, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  if (!isShareModalOpen || !shareVideoData) return null;

  const shareUrl = `${window.location.origin}?v=${shareVideoData.id}`;
  const embedCode = `<iframe width="560" height="315" src="${shareVideoData.videoUrl}" title="${shareVideoData.title}" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    showToast('Embed code copied', 'success');
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareVideoData.title + ' ' + shareUrl)}`,
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareVideoData.title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Reddit',
      icon: '🤖',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareVideoData.title)}`,
    },
    {
      name: 'Email',
      icon: '✉️',
      url: `mailto:?subject=${encodeURIComponent(shareVideoData.title)}&body=${encodeURIComponent('Check out this video on MyTube: ' + shareUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#272727]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share
            </h3>
          </div>
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-4 gap-3 my-5">
          {shareOptions.map(opt => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#222222] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors"
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {opt.name}
              </span>
            </a>
          ))}
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#202020] border border-slate-200 dark:border-[#333333]">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 text-xs text-slate-800 dark:text-slate-200 font-mono truncate focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FF0033] hover:bg-red-700 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Embed toggle */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#272727]">
          <button
            onClick={() => setShowEmbed(prev => !prev)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <Code className="w-4 h-4" />
            <span>{showEmbed ? 'Hide embed code' : 'Embed video player'}</span>
          </button>
          {showEmbed && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-[#222222] rounded-xl border border-slate-200 dark:border-[#333333] flex flex-col gap-2">
              <pre className="text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto font-mono">
                {embedCode}
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="self-end px-3 py-1 bg-slate-200 dark:bg-[#333333] hover:bg-slate-300 text-xs font-semibold rounded-lg"
              >
                Copy Embed Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
