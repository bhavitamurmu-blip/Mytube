import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Film,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Search
} from 'lucide-react';
import { ReportedContent, User, Video } from '../../types';
import { db } from '../../services/db';
import { useApp } from '../../context/AppContext';

export const AdminView: React.FC = () => {
  const { navigateToWatch, showToast } = useApp();

  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [userSearch, setUserSearch] = useState('');

  const loadData = () => {
    setReports(db.getReports());
    setUsers(db.getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveReport = (reportId: string, action: 'keep' | 'remove') => {
    db.resolveReport(reportId, action);
    loadData();
    showToast(
      action === 'remove'
        ? 'Video removed from platform permanently'
        : 'Report dismissed, video kept',
      action === 'remove' ? 'info' : 'success'
    );
  };

  const handleToggleUserStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    db.updateUserStatus(user.id, nextStatus);
    loadData();
    showToast(`User account ${user.name} is now ${nextStatus}`, 'info');
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.handle.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#272727]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Admin Moderation Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review flagged content, enforce community safety guidelines, and manage user accounts.
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 font-semibold text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{pendingReports.length} Pending Reports</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-slate-300 font-semibold text-xs">
            {users.length} Registered Users
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mt-6 border-b border-slate-200 dark:border-[#272727] text-sm font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'text-red-600 border-b-2 border-red-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Reported Content ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-red-600 border-b-2 border-red-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="py-6">
        {/* REPORTED CONTENT TAB */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-4">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No reports submitted. All clear!
              </div>
            ) : (
              reports.map(report => (
                <div
                  key={report.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    report.status === 'pending'
                      ? 'bg-white dark:bg-[#1a1a1a] border-amber-200 dark:border-amber-900/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#171717] border-slate-200 dark:border-[#272727] opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Thumbnail & Video Info */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <img
                        src={report.videoThumbnail}
                        alt={report.videoTitle}
                        className="w-24 aspect-video rounded-xl object-cover bg-black shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/40 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                            {report.reason}
                          </span>
                          <span className="text-[11px] text-slate-400">{report.timestamp}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                          {report.videoTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Channel: <span className="font-semibold text-slate-700 dark:text-slate-300">{report.channelName}</span> · Reported by {report.reportedByUserName}
                        </p>
                        {report.notes && (
                          <p className="text-xs italic text-slate-600 dark:text-slate-400 mt-1">
                            "{report.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {report.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => navigateToWatch(report.videoId)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#272727] transition-colors"
                            title="Inspect video"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'keep')}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#252525] hover:bg-slate-200 dark:hover:bg-[#303030] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Dismiss Report</span>
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'remove')}
                            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Video</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Status: {report.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* USER ACCOUNTS TAB */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-4">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, handle..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#272727] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#272727] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Handle</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {user.handle}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#282828] font-semibold text-[11px] capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] capitalize ${
                            user.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                              : 'bg-red-100 dark:bg-red-950/40 text-red-600'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              user.status === 'active'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
