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
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  HelpCircle,
  RotateCw,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentResultMarks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Exam Paper AI Analysis State
  const [examAnalyses, setExamAnalyses] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [examTitle, setExamTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(null);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    fetchMarksAndAnalyses();
  }, []);

  const fetchMarksAndAnalyses = async () => {
    try {
      setLoading(true);
      const [marksRes, papersRes] = await Promise.all([
        studentApi.getAcademicRecords(),
        studentApi.getExamPapers().catch(() => ({ success: false, data: [] }))
      ]);

      if (marksRes.success) {
        setData(marksRes.data);
      } else {
        setError(marksRes.message);
      }

      if (papersRes.success && Array.isArray(papersRes.data)) {
        setExamAnalyses(papersRes.data);
        if (papersRes.data.length > 0) {
          setActiveAnalysis(papersRes.data[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch academic marks.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePaper = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setAnalysisError('Please select an exam paper or mark sheet file (.pdf, .docx, .txt, or image).');
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError(null);
      setAnalysisSuccess(null);

      const formData = new FormData();
      formData.append('file', uploadFile);
      if (examTitle.trim()) formData.append('examTitle', examTitle.trim());
      if (subjectName.trim()) formData.append('subjectName', subjectName.trim());

      const res = await studentApi.analyzeExamPaper(formData);
      if (res.success && res.data) {
        setAnalysisSuccess('Exam paper analyzed successfully! Review your question breakdown below.');
        setExamAnalyses((prev) => [res.data, ...prev]);
        setActiveAnalysis(res.data);
        setUploadFile(null);
        setExamTitle('');
        setSubjectName('');
      } else {
        setAnalysisError(res.message || 'Could not analyze the exam paper.');
      }
    } catch (err) {
      setAnalysisError(err.response?.data?.message || err.message || 'Failed to analyze exam script.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your academic marks, exam records, and paper scans..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const marks = data?.marksRecords || [];
  const avgMarks = data?.averageMarksPercentage ?? 0;
  const attendancePct = data?.attendancePercentage ?? 100;
  const totalAssessments = data?.totalAssessments ?? marks.length;

  const getGradeBadge = (pct) => {
    if (pct >= 85) return { label: 'Distinction (A+)', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' };
    if (pct >= 70) return { label: 'First Class (A)', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300' };
    if (pct >= 55) return { label: 'Second Class (B)', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300' };
    return { label: 'Needs Improvement (C)', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300' };
  };

  // Helper to parse JSON safely
  const parseJsonSafe = (raw, fallback = []) => {
    if (!raw) return fallback;
    if (typeof raw === 'object') return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  };

  const activeMistakes = activeAnalysis ? parseJsonSafe(activeAnalysis.mistakesJson, []) : [];
  const activeWeakTopics = activeAnalysis ? parseJsonSafe(activeAnalysis.weakTopicsJson, []) : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Introduction */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Academic Results, Marks &amp; Exam Paper AI Scanner
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-3xl leading-relaxed">
          Review official institutional assessment scores, monitor attendance eligibility, and upload your physical or digital exam answer sheets for instant question-by-question mistake diagnosis and adaptive study guidance.
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
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Scanned Papers</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{examAnalyses.length}</div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Mistakes Mapped</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: EXAM PAPER & MARK SHEET AI SCANNER (ROADMAP FEATURE) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 dark:from-indigo-950/40 dark:via-gray-900 dark:to-purple-950/40 rounded-3xl border border-indigo-200 dark:border-indigo-800/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-100 dark:border-indigo-900/50 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
              <Brain className="w-3.5 h-3.5" />
              <span>AI Exam Paper &amp; Mark Sheet Analysis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight pt-1">
              Upload Exam Papers &amp; Uncover Exact Weak Topics
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Upload your semester midterm, final question paper, or evaluated answer script. EduPulse AI parses your scores, pinpoints exactly where marks were lost, and maps mistakes directly to your curriculum syllabus.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>PDF, DOCX, TXT &amp; Image Scans</span>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleAnalyzePaper} className="bg-white/90 dark:bg-gray-850/80 rounded-2xl p-5 border border-indigo-100 dark:border-gray-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Exam / Paper Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Data Structures Midterm Test 2026"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Course / Subject Name
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition group">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">
                    {uploadFile ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      'Click to select Exam Script / Mark Sheet file (.pdf, .docx, .txt)'
                    )}
                  </span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={analyzing || !uploadFile}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {analyzing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Scanning &amp; Evaluating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Exam Paper with AI</span>
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{analysisError}</span>
            </div>
          )}

          {analysisSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{analysisSuccess}</span>
            </div>
          )}
        </form>

        {/* Previous Paper Analyses Selector / History Tabs */}
        {examAnalyses.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Your Evaluated Exam Scripts ({examAnalyses.length})
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showHistory ? 'Hide List' : 'Show All'}
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showHistory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {examAnalyses.map((paper) => {
                  const isSelected = activeAnalysis?.id === paper.id;
                  const pct = Math.round(paper.percentage || ((paper.totalScore / (paper.maxScore || 100)) * 100));

                  return (
                    <div
                      key={paper.id}
                      onClick={() => setActiveAnalysis(paper)}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40'
                          : 'bg-white dark:bg-gray-850 hover:bg-indigo-50/50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                        }`}>
                          {pct}% ({paper.grade || 'A'})
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                          {paper.uploadedAt ? new Date(paper.uploadedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm truncate">{paper.examTitle || 'Exam Script'}</h4>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {paper.subjectName || 'Course Paper'} &bull; {paper.fileName}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Active Analysis Detailed Inspection Card */}
        {activeAnalysis && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 p-6 sm:p-7 shadow-md space-y-6">
            {/* Header / Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  Active Exam Diagnostic Report
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-50">
                  {activeAnalysis.examTitle || 'Exam Script Analysis'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Subject: <span className="font-semibold text-gray-800 dark:text-gray-200">{activeAnalysis.subjectName || 'General Curriculum'}</span> &bull; Source file: <span className="font-mono">{activeAnalysis.fileName}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-center min-w-[110px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Calculated Score
                  </span>
                  <div className="text-xl font-black text-gray-900 dark:text-gray-100 font-mono mt-0.5">
                    {activeAnalysis.totalScore} / {activeAnalysis.maxScore || 100}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(activeAnalysis.percentage || ((activeAnalysis.totalScore / (activeAnalysis.maxScore || 100)) * 100))}% &bull; {activeAnalysis.grade}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Feedback & Standings Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  Diagnostic Performance Summary
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {activeAnalysis.feedbackSummary || 'Evaluation completed. Review the highlighted question misconceptions below to prepare for upcoming tests.'}
              </p>
            </div>

            {/* Identified Weak Topics from this Exam Paper */}
            {activeWeakTopics.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Weak Topics Identified on this Paper
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Directly linked to your study recommendations
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {activeWeakTopics.map((topic, idx) => {
                    const topicName = typeof topic === 'string' ? topic : topic.topicName || topic.name;
                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-800 dark:text-rose-200 shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>{topicName}</span>
                        <Link
                          to="/student/quizzes"
                          className="ml-1 text-[11px] underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                          Practice <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Question-by-Question Mistake Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    Question-by-Question Mistake Inspector ({activeMistakes.length})
                  </h4>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Where points were lost &amp; how to solve correctly
                </span>
              </div>

              {activeMistakes.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs text-gray-500">
                  No individual question mistakes detected on this paper!
                </div>
              ) : (
                <div className="space-y-3">
                  {activeMistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-xs px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {m.question || `Question ${idx + 1}`}
                          </span>
                          <span className="font-bold text-xs text-gray-900 dark:text-gray-100">
                            {m.topic || 'Curriculum Concept'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 font-mono">
                            Lost {m.marksLost ?? (m.maxMarks ? m.maxMarks - (m.marksAwarded ?? 0) : 0)} marks
                          </span>
                          {m.maxMarks && (
                            <span className="text-[11px] text-gray-500 font-mono">
                              ({m.marksAwarded ?? 0}/{m.maxMarks} pts)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Identified Misconception
                          </span>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                            {m.errorReason || m.misconception || 'Incorrect application of formula or edge cases.'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                            Recommended Correction &amp; Next Step
                          </span>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                            {m.suggestedReview || m.correction || 'Review syllabus course notes and re-attempt practice exercises.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Uploaded {activeAnalysis.uploadedAt ? new Date(activeAnalysis.uploadedAt).toLocaleString() : 'Recently'}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  to="/student/materials"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Review Course Notes</span>
                </Link>

                <Link
                  to="/student/quizzes"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-1.5"
                >
                  <span>Take Practice Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: OFFICIAL DEPARTMENT MARKS LEDGER */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">Faculty Evaluation Records</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Continuous internal assessments and semester exams logged by professors</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Verified Records
          </span>
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
    </div>
  );
};
