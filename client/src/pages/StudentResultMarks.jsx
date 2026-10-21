import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Award,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Upload,
  AlertCircle
} from 'lucide-react';

export const StudentResultMarks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await studentApi.getAcademicRecords();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch academic marks.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your academic marks and exam records..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const marks = data?.marksRecords || [];
  const attendance = data?.attendanceRecords || [];
  const avgMarks = data?.averageMarksPercentage ?? 0;
  const attendancePct = data?.attendancePercentage ?? 100;
  const totalAssessments = data?.totalAssessments ?? marks.length;

  const getGradeBadge = (pct) => {
    if (pct >= 85) return { label: 'Distinction (A+)', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' };
    if (pct >= 70) return { label: 'First Class (A)', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300' };
    if (pct >= 55) return { label: 'Second Class (B)', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300' };
    return { label: 'Needs Improvement (C)', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300' };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Introduction */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Academic Results &amp; Marks</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Review your official institution examination scores, continuous internal assessments, attendance standing, and upcoming exam script analysis.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam Average</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{avgMarks}%</div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Verified by Faculty</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance Rate</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{attendancePct}%</div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Mandatory &ge; 75% Met</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recorded Tests</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{totalAssessments}</div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Internal &amp; Midterms</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academic Standing</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">Low Risk</div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Eligible for Final Exam</div>
          </div>
        </div>
      </div>

      {/* Main Assessments & Marks Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">Exam &amp; Assessment Records</h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Official Department Ledger</span>
        </div>

        {marks.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No Assessment Records Yet</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your professors will upload your continuous assessment scores here once evaluated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Assessment</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Marks Obtained</th>
                  <th className="py-3.5 px-5 text-right">Percentage</th>
                  <th className="py-3.5 px-5 text-center">Grade Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {marks.map((m) => {
                  const pct = m.maximumMarks > 0 ? Math.round((m.marksObtained / m.maximumMarks) * 100) : 0;
                  const grade = getGradeBadge(pct);

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-850/40 transition">
                      <td className="py-3.5 px-5 font-semibold text-gray-900 dark:text-gray-100">
                        {m.assessmentName}
                      </td>
                      <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400">
                        {m.subject?.name || 'General Course'}
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 dark:text-gray-400">
                        {m.assessmentDate || 'Recent'}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-right font-bold text-gray-900 dark:text-gray-100">
                        {m.marksObtained} / {m.maximumMarks}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {pct}%
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${grade.bg}`}>
                          {grade.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Ingestion Feature Card: Exam Papers & Answer Sheets */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/40 dark:via-gray-900 dark:to-purple-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wide">
                Planned Feature
              </span>
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                EduPulse OCR &amp; Vision Ingestion
              </span>
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-50">
              Exam Papers &amp; Handwritten Answer Sheets Ingestion
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              We are introducing intelligent OCR and layout parser support for physical semester question papers and student handwritten answer books. When enabled, your submitted physical exam scripts will be automatically scanned, mapped to rubrics, and correlated with AKT concept mastery.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end gap-2 w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Vision OCR Parsing Pipeline</span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Architecture ready &bull; Awaiting paper ingestion scans
            </span>
          </div>
        </div>

        {/* Feature roadmap cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-900/50">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
            <div className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">1. Question Paper OCR</div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Automatic extraction of section weightage, questions, and learning objectives.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
            <div className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">2. Answer Script Alignment</div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Faculty marks &amp; margin annotations linked to each student solution section.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
            <div className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">3. AKT Mastery Sync</div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Question-level errors update the student's concept mastery model automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
