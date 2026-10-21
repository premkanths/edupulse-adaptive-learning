import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Sparkles, Filter, ChevronRight, User } from 'lucide-react';
import api from '../services/api';

export const AtRiskStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [recalculatingId, setRecalculatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchAtRiskStudents();
  }, []);

  const fetchAtRiskStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/at-risk-students');
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load at-risk students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (studentId) => {
    try {
      setRecalculatingId(studentId);
      const res = await api.post(`/teacher/at-risk-students/${studentId}/recalculate`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Risk status updated using latest academic performance indicators.' });
        fetchAtRiskStudents();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to recalculate risk.' });
    } finally {
      setRecalculatingId(null);
    }
  };

  const filteredStudents = students.filter(s => {
    if (filter === 'ALL') return true;
    return s.riskLevel === filter;
  });

  const highRiskCount = students.filter(s => s.riskLevel === 'HIGH').length;
  const modRiskCount = students.filter(s => s.riskLevel === 'MODERATE').length;
  const lowRiskCount = students.filter(s => s.riskLevel === 'LOW').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI & Heuristic At-Risk Student Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">
            Predictive machine learning (Random Forest) & deterministic rule-based monitoring of academic risk factors.
          </p>
        </div>
        <button
          onClick={fetchAtRiskStudents}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Predictions
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {notification.message}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Evaluated</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{students.length}</p>
          <p className="text-xs text-slate-400 mt-1">All enrolled students</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">High Risk</p>
          <p className="text-2xl font-black text-rose-600 mt-2">{highRiskCount}</p>
          <p className="text-xs text-rose-500 mt-1">Urgent intervention needed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Moderate Risk</p>
          <p className="text-2xl font-black text-amber-600 mt-2">{modRiskCount}</p>
          <p className="text-xs text-amber-500 mt-1">Targeted practice required</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Low Risk / On Track</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{lowRiskCount}</p>
          <p className="text-xs text-emerald-500 mt-1">Meeting mastery targets</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === lvl
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {lvl === 'ALL' ? 'All Students' : `${lvl.charAt(0) + lvl.slice(1).toLowerCase()} Risk`}
          </button>
        ))}
      </div>

      {/* Student Risk List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Evaluating student risk features...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No students match the selected filter.
          </div>
        ) : (
          filteredStudents.map((s) => {
            const isHigh = s.riskLevel === 'HIGH';
            const isMod = s.riskLevel === 'MODERATE';
            return (
              <div
                key={s.studentId}
                className={`bg-white rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  isHigh ? 'border-rose-200 bg-rose-50/10' : isMod ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Student Info & Risk Score */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                      isHigh ? 'bg-rose-100 text-rose-700' : isMod ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {s.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-slate-900">{s.studentName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isHigh ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          isMod ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        }`}>
                          {s.riskLevel} RISK
                        </span>
                        {s.isFallback ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Heuristic Fallback
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Random Forest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{s.studentEmail}</p>

                      {/* Risk Progress Bar */}
                      <div className="mt-3 flex items-center gap-3 w-64">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${s.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 font-mono">{s.riskScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Reasons & Factors */}
                  <div className="flex-1 lg:max-w-md">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Identified Risk Factors:</p>
                    <ul className="space-y-1">
                      {s.reasons.map((r, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold shrink-0">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Pedagogical Intervention */}
                  <div className="lg:max-w-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Recommended Action:</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {s.recommendedIntervention}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleRecalculate(s.studentId)}
                        disabled={recalculatingId === s.studentId}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${recalculatingId === s.studentId ? 'animate-spin' : ''}`} />
                        Recalculate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
