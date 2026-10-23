import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Sparkles,
  BookOpen,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Award,
  GraduationCap,
  Calendar,
  ExternalLink,
  Code2,
  TrendingUp,
  FileText,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight,
  Zap,
  BarChart2,
  Check,
  Layers,
  HelpCircle,
  Bot,
  Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const StudentAiSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Updated recently');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | learned | gaps | academics | external | all
  const navigate = useNavigate();

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.getAiSummary();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to generate student AI summary');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with intelligence server');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const res = await (studentApi.generateAiSummary ? studentApi.generateAiSummary() : studentApi.getAiSummary());
      if (res.success) {
        setData(res.data);
        const now = new Date();
        setLastUpdatedTime(`Updated at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner size="lg" text="Generating your personalized AI summary..." />;
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Summary Error" message={error} />
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    studentInfo = {},
    whatHeLearned = {},
    whatHeShouldLearn = {},
    academics = {},
    external = {},
    aiSynthesis = {}
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Student Learning Portfolio</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              AI Powered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
            Your AI Learning Summary &amp; Progress Overview
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-3xl">
            A clear, student-friendly view of what you have learned, where your strengths are, and what to focus on next.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>

          <button
            onClick={fetchSummary}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </button>
        </div>
      </div>

      {/* Student Profile Identity Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-inner">
              {studentInfo?.name ? studentInfo.name[0] : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{studentInfo?.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {studentInfo?.academicInfo || 'Student'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-medium mt-0.5">
                {studentInfo?.department} • {studentInfo?.email}
              </p>
              {studentInfo?.bio && (
                <p className="text-xs text-indigo-100/80 mt-2 max-w-xl line-clamp-2">
                  {studentInfo.bio}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">Topic Mastery</span>
              <span className="text-xl font-black text-white mt-0.5 block">{whatHeLearned?.averageMasteryPercent}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">Exam Average</span>
              <span className="text-xl font-black text-emerald-300 mt-0.5 block">{academics?.averageMarksPercentage}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">Attendance</span>
              <span className="text-xl font-black text-purple-300 mt-0.5 block">{academics?.attendancePercentage}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">Academic Zone</span>
              <span className="text-xs font-black text-white px-2 py-1 rounded-md bg-emerald-500/80 mt-1 inline-block">
                SAFE &amp; ON TRACK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Row */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Summary Overview', icon: Sparkles },
          { id: 'learned', label: 'What I Learned', count: whatHeLearned?.masteredCount, icon: CheckCircle2 },
          { id: 'gaps', label: 'What to Learn', count: whatHeShouldLearn?.gapCount, icon: AlertTriangle },
          { id: 'academics', label: 'Academics & Attendance', icon: GraduationCap },
          { id: 'external', label: 'Coding & Projects', count: external?.profiles?.length, icon: Code2 },
          { id: 'all', label: 'View All Sections', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: STUDENT-FRIENDLY AI EXECUTIVE NARRATIVE */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  Your Learning Summary &amp; Action Plan
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Here is a breakdown of how you are doing in your subjects and where to focus next.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline-block">
                {lastUpdatedTime}
              </span>
              <button
                onClick={handleGenerateSummary}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                title="Generate fresh AI synthesis from live performance data"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'Generating...' : 'Generate Summary'}</span>
              </button>
            </div>
          </div>

          {/* SIMPLE, DIRECT STUDENT SUMMARY */}
          <div className={`p-6 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/50 space-y-4 transition-opacity duration-300 ${generating ? 'opacity-60 animate-pulse' : 'opacity-100'}`}>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{aiSynthesis?.headline || 'Where You Stand & What to Do Next'}</span>
            </div>

            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
              {aiSynthesis?.executiveSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-indigo-100 dark:border-gray-700 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100">Next Priority</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                    {aiSynthesis?.nextAction || 'Practice a short 5-minute quiz on your priority topic to boost your mastery.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-indigo-100 dark:border-gray-700 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100">Quick Study Tip</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                    {aiSynthesis?.readingAdvice || 'Review teacher notes and slides in Course Materials before your next lecture.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/student/quizzes?autoStart=true')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
              >
                <span>Take 5-Min Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const targetTopic = whatHeShouldLearn?.gaps?.[0]?.topicName || '';
                  navigate(`/student/materials?topic=${encodeURIComponent(targetTopic)}&autoOpen=true`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Read Lecture Notes</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Guidance by: <strong className="text-gray-700 dark:text-gray-300">EduPulse AI Learning Assistant</strong>
            </span>
            <button
              onClick={() => navigate('/student/assistant')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ask Jarvis AI Tutor to explain my summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: WHAT I LEARNED */}
      {(activeTab === 'learned' || activeTab === 'all') && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  What You Have Learned
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Topics where you have demonstrated strong understanding (Mastery &ge; 65%)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              {whatHeLearned?.masteredCount || 0} Topics Mastered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whatHeLearned?.masteredTopics?.length === 0 ? (
              <div className="col-span-2 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
                Take a few practice quizzes to test your understanding and unlock certified topic mastery.
              </div>
            ) : (
              whatHeLearned?.masteredTopics?.map((topic) => (
                <div
                  key={topic.topicId}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                        {topic.topicName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {topic.subjectName}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {topic.masteryPercent}% Mastery
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${topic.masteryPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Quiz Accuracy: <strong className="text-gray-700 dark:text-gray-300">{topic.accuracy}%</strong></span>
                    <span>Total Attempts: <strong className="text-gray-700 dark:text-gray-300">{topic.attemptsCount}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quiz Practice Standing Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50 uppercase tracking-wider">
              Quiz Practice Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block">Quizzes Completed</span>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100 mt-0.5">{whatHeLearned?.totalQuizzesCompleted || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block">Average Quiz Score</span>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{whatHeLearned?.averageQuizScore || 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block">Overall Mastery Level</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{whatHeLearned?.averageMasteryPercent || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: WHAT TO LEARN (GAPS & RECOMMENDATIONS) */}
      {(activeTab === 'gaps' || activeTab === 'all') && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  What You Should Learn Next
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Topics that need extra practice to ensure solid mastery
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              {whatHeShouldLearn?.gapCount || 0} Topics to Practice
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whatHeShouldLearn?.activeGaps?.map((gap) => (
              <div
                key={gap.topicId}
                className="p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                        {gap.topicName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {gap.subjectName}
                      </p>
                    </div>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                      {gap.masteryPercent}% Mastery
                    </span>
                  </div>

                  {gap.hasPrerequisite && (
                    <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Recommended prerequisite: <strong>{gap.prerequisiteName}</strong></span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[11px] text-gray-500">
                    Accuracy: {gap.accuracy}% ({gap.attemptsCount} attempts)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/student/materials?topic=${encodeURIComponent(gap.topicName || gap.name || '')}&subject=${encodeURIComponent(gap.subjectName || '')}&autoOpen=true`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Read Notes</span>
                    </button>
                    <button
                      onClick={() => navigate(`/student/quizzes?topic=${encodeURIComponent(gap.topicName || gap.name || '')}&autoStart=true`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer"
                    >
                      <span>Practice Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations Box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50 uppercase tracking-wider">
                Tailored Recommendations For You
              </h4>
              <Link to="/student/recommendations" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All &rarr;
              </Link>
            </div>
            {whatHeShouldLearn?.recommendations?.slice(0, 2).map((rec) => (
              <div key={rec.id} className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{rec.topicName}</span>
                <p className="text-gray-600 dark:text-gray-300">{rec.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: ACADEMIC MARKS & ATTENDANCE */}
      {(activeTab === 'academics' || activeTab === 'all') && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  Course Marks &amp; Attendance Record
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Institutional examination grades and classroom attendance standing
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
              {academics?.attendancePercentage}% Attendance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Overall Attendance</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {academics?.attendancePercentage}%
                </div>
                <span className="text-[10px] text-gray-500">Regular attendance</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Exam Marks Average</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {academics?.averageMarksPercentage}%
                </div>
                <span className="text-[10px] text-gray-500">Passing grade</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Academic Standing</span>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  Safe &amp; On Track
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                  Consistent participation and steady assessment marks.
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            </div>
          </div>

          {/* Assessment Marks List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50 uppercase tracking-wider">
              Assessment Scores
            </h4>
            {academics?.marksRecords?.length === 0 ? (
              <p className="text-xs text-gray-500">No institutional examination marks recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {academics?.marksRecords?.map((m) => {
                  const pct = m.maximumMarks ? Math.round((m.marksObtained / m.maximumMarks) * 100) : 0;
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-gray-900 dark:text-gray-50">
                          {m.assessmentName}
                        </h5>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {m.subject?.name || 'Enrolled Course'} • {m.assessmentDate || 'Current Semester'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                          {m.marksObtained} / {m.maximumMarks}
                        </span>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: EXTERNAL CODING & PROJECTS */}
      {(activeTab === 'external' || activeTab === 'all') && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  Coding Profiles &amp; Projects
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your connected developer accounts and verified coding stats
                </p>
              </div>
            </div>
            <Link
              to="/student/connected-accounts"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Profiles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {external?.profiles?.map((prof, idx) => {
              let stats = {};
              try {
                stats = typeof prof.snapshotJson === 'string' ? JSON.parse(prof.snapshotJson) : (prof.snapshotJson || {});
              } catch (e) {}

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm">
                        {prof.platform[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">
                          {prof.platform}
                        </h4>
                        <span className="text-[11px] text-gray-500">@{prof.username}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Connected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                    {prof.platform === 'GITHUB' && (
                      <>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Public Repositories</span>
                          <strong className="text-sm font-black text-gray-900 dark:text-gray-100">{stats.publicRepos || 0}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Followers / Stars</span>
                          <strong className="text-sm font-black text-gray-900 dark:text-gray-100">{stats.followers || 0}</strong>
                        </div>
                      </>
                    )}
                    {prof.platform === 'LEETCODE' && (
                      <>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Problems Solved</span>
                          <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.solvedCount || 0}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Contest Rating</span>
                          <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">{stats.rating || 'N/A'}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Public Portfolio Links */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">Verified Professional Links</h4>
            <div className="space-y-1.5 text-xs">
              {studentInfo?.githubUrl && (
                <a href={studentInfo.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 hover:underline">
                  <span>GitHub: {studentInfo.githubUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {studentInfo?.linkedinUrl && (
                <a href={studentInfo.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 hover:underline">
                  <span>LinkedIn: {studentInfo.linkedinUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {studentInfo?.websiteUrl && (
                <a href={studentInfo.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 hover:underline">
                  <span>Portfolio Website: {studentInfo.websiteUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
