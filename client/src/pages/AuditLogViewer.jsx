import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Filter, Search, Clock, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'ALL' && !log.action.includes(filterAction)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = log.user?.email?.toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      return matchEmail || matchAction || matchDetails;
    }
    return true;
  });

  const getActionBadge = (action) => {
    if (action.includes('AUTH') || action.includes('LOGIN')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.includes('CREATE') || action.includes('ENROLL')) {
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
    }
    if (action.includes('DELETE') || action.includes('PURGE') || action.includes('REMOVE')) {
      return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
    }
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Security Audit Event Trail</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Immutable system security log tracking administrative interventions, authentication attempts, and data purges.
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200/90 dark:border-slate-800/90 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 dark:bg-[#080B11]/70 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'AUTH', 'CLASS', 'SETTING', 'USER'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterAction(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterAction === f
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-800/80'
              }`}
            >
              {f === 'ALL' ? 'All Events' : `${f.charAt(0) + f.slice(1).toLowerCase()} Logs`}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search email, action, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200/90 dark:border-slate-800/90 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recorded Security Events ({filteredLogs.length})</h2>
          <span className="text-xs text-slate-400">Latest 100 entries displayed</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs">
            No audit events found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200/90 dark:border-slate-800/90 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#080B11]/70 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase border-b border-slate-200/90 dark:border-slate-800/90">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Security Action</th>
                  <th className="px-4 py-3">Event Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60/60 font-sans">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium text-xs">
                      {log.user ? log.user.email : <span className="text-slate-400 italic">SYSTEM</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs font-sans max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
