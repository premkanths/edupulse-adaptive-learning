import React, { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Users, ShieldAlert, Award, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const AdminReports = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [ovRes, userRes] = await Promise.all([
        api.get('/admin/reports/overview'),
        api.get('/admin/users')
      ]);

      if (ovRes.data?.success) setOverview(ovRes.data.data);
      if (userRes.data?.success) setUsers(userRes.data.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async (endpoint, filename) => {
    try {
      setDownloading(filename);
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNotification({ type: 'success', message: `Downloaded ${filename} successfully.` });
    } catch (err) {
      setNotification({ type: 'error', message: `Failed to download ${filename}` });
    } finally {
      setDownloading(null);
    }
  };

  const students = users.filter((u) => u.role === 'STUDENT');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports & Data Exports</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate formal academic transcripts, cohort performance matrices, and at-risk rosters for administration.
          </p>
        </div>
        <button
          onClick={fetchReportData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {notification.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{overview?.totalStudents || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Across {overview?.totalClasses || 0} class cohorts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz Submissions</p>
          <p className="text-3xl font-black text-indigo-600 mt-2">{overview?.totalAttempts || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Total completed attempts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Marks Records</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{overview?.totalMarksRecords || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Imported institutional records</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Alerts</p>
          <p className="text-3xl font-black text-rose-600 mt-2">{overview?.highRiskCount || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Urgent intervention needed</p>
        </div>
      </div>

      {/* CSV Export Buttons Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Official Institutional CSV Data Exports</h2>
        <p className="text-xs text-slate-500">
          Download structured CSV datasets for spreadsheet analytics, faculty reporting, or accreditation documentation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Student Performance Report</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Includes student IDs, email, active status, quizzes completed, average score, attendance %, and current risk classification.
            </p>
            <button
              onClick={() => handleDownloadCsv('/admin/reports/export/students', 'students_performance_report.csv')}
              disabled={downloading === 'students_performance_report.csv'}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {downloading === 'students_performance_report.csv' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download Students CSV
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">At-Risk Interventions Roster</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detailed breakdown of students at risk, quantified 0–100 risk score, contributing telemetry factors, and pedagogical remediation plans.
            </p>
            <button
              onClick={() => handleDownloadCsv('/admin/reports/export/at-risk', 'at_risk_interventions_report.csv')}
              disabled={downloading === 'at_risk_interventions_report.csv'}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {downloading === 'at_risk_interventions_report.csv' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download At-Risk CSV
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Topic Mastery Matrix</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curricular Bayesian Knowledge Tracing scores across all subjects and topics, tracking probability of concept mastery P(L_n).
            </p>
            <button
              onClick={() => handleDownloadCsv('/admin/reports/export/topic-mastery', 'topic_mastery_matrix.csv')}
              disabled={downloading === 'topic_mastery_matrix.csv'}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {downloading === 'topic_mastery_matrix.csv' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download Mastery CSV
            </button>
          </div>
        </div>
      </div>

      {/* Student Roster Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Enrolled Student Roster ({students.length})</h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enrolled At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">#{s.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-xs">{s.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
