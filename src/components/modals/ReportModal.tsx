import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { ReportedContent } from '../../types';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, reportVideoId, showToast } = useApp();
  const [reason, setReason] = useState<ReportedContent['reason']>('inappropriate');
  const [notes, setNotes] = useState('');

  if (!isReportModalOpen || !reportVideoId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.reportVideo(reportVideoId, reason, notes);
    setIsReportModalOpen(false);
    setNotes('');
    showToast('Report submitted for review. Thank you.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#303030] overflow-hidden p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#272727]">
          <div className="flex items-center gap-2 text-red-600">
            <Flag className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Report Video
            </h3>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3 mb-4">
          Please select the reason that best describes why this video violates MyTube community guidelines.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {[
            { value: 'inappropriate', label: 'Sexual or inappropriate content' },
            { value: 'harassment', label: 'Harassment or hate speech' },
            { value: 'misinformation', label: 'Misinformation or misleading claims' },
            { value: 'spam', label: 'Spam, scams or unwanted commercial content' },
            { value: 'copyright', label: 'Infringes on copyright ownership' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                reason === opt.value
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                  : 'border-slate-200 dark:border-[#2f2f2f] hover:bg-slate-50 dark:hover:bg-[#252525]'
              }`}
            >
              <input
                type="radio"
                name="reportReason"
                value={opt.value}
                checked={reason === opt.value}
                onChange={() => setReason(opt.value as any)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {opt.label}
              </span>
            </label>
          ))}

          <div className="mt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Additional Details (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Provide timestamps or extra context for moderators..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#272727]">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
