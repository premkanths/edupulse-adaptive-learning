import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Lightbulb,
  Info,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  RotateCw,
  X,
  Target,
  Sparkles,
  Layers,
  HelpCircle,
  Github,
  Code2,
  ExternalLink,
  FileText,
  TrendingDown,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [externalProfiles, setExternalProfiles] = useState([]);
  const [examPapers, setExamPapers] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'WEAK' | 'CHALLENGE'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWhyThis, setSelectedWhyThis] = useState(null);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, profileRes, papersRes] = await Promise.all([
        studentApi.getRecommendations(),
        api.get('/student/external-profiles').catch(() => ({ data: { data: [] } })),
        studentApi.getExamPapers().catch(() => ({ success: false, data: [] }))
      ]);

      if (res.success) {
        const deduplicated = deduplicateByTopic(res.data || []);
        setRecs(deduplicated);
      } else {
        setError(res.message);
      }

      if (profileRes.data?.data) {
        setExternalProfiles(profileRes.data.data);
      }

      if (papersRes.success && Array.isArray(papersRes.data)) {
        setExamPapers(papersRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const deduplicateByTopic = (list) => {
    const seen = new Set();
    const result = [];
    for (const r of list) {
      const topicId = r.topic?.id || r.id;
      if (!seen.has(topicId)) {
        seen.add(topicId);
        result.push(r);
      }
    }
    return result;
  };

  const handleRefreshRecs = async () => {
    try {
      setRefreshing(true);
      const res = await api.post('/student/recommendations/refresh');
      if (res.data?.success) {
        setRecs(deduplicateByTopic(res.data.data || []));
      }
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Finding the best topics for you to learn next..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const typeConfig = {
    PRACTICE_WEAK_TOPIC: {
      badge: 'Focus Weak Topic',
      badgeColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: AlertTriangle,
      actionText: 'Practice Topic',
    },
    REVIEW_PREREQUISITE: {
      badge: 'Prerequisite Required',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Info,
      actionText: 'Review Prerequisite',
    },
    REVIEW_MISCONCEPTION: {
      badge: 'Exam / Concept Misconception',
      badgeColor: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: AlertTriangle,
      actionText: 'Resolve Misconception in Jarvis',
    },
    LEARN_BASICS: {
      badge: 'Introductory Learning',
      badgeColor: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      icon: BookOpen,
      actionText: 'Read Lecture Notes',
    },
    PRACTICE_WORKED_EXAMPLE: {
      badge: 'Worked Example & Practice',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Code2,
      actionText: 'Study Worked Example',
    },
    SPACED_REVISION: {
      badge: 'Spaced Memory Refresh',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: Clock,
      actionText: '5-Min Memory Refresh',
    },
    CHALLENGE_TOPIC: {
      badge: 'Advanced Challenge (Strength)',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
      actionText: 'Try Advanced Set',
    },
  };

  // Filter recommendations based on active tab
  const filteredRecs = recs.filter((r) => {
    if (filterTab === 'WEAK') {
      return (
        r.recommendationType === 'PRACTICE_WEAK_TOPIC' ||
        r.recommendationType === 'REVIEW_PREREQUISITE' ||
        r.recommendationType === 'REVIEW_MISCONCEPTION' ||
        r.recommendationType === 'PRACTICE_WORKED_EXAMPLE' ||
        r.recommendationType === 'LEARN_BASICS'
      );
    }
    if (filterTab === 'CHALLENGE') return r.recommendationType === 'CHALLENGE_TOPIC';
    return true;
  });

  const primaryRec = filteredRecs.length > 0 ? filteredRecs[0] : (recs.length > 0 ? recs[0] : null);
  const otherRecs = filteredRecs.length > 1 ? filteredRecs.slice(1) : [];

  // Extract all weak topics from uploaded exam papers
  const examWeakTopicsList = [];
  examPapers.forEach((paper) => {
    try {
      const wt = typeof paper.weakTopicsJson === 'string' ? JSON.parse(paper.weakTopicsJson) : paper.weakTopicsJson;
      const mk = typeof paper.mistakesJson === 'string' ? JSON.parse(paper.mistakesJson) : paper.mistakesJson;
      if (Array.isArray(wt)) {
        wt.forEach((item) => {
          const tName = typeof item === 'string' ? item : item.topicName || item.name;
          const matchingMistake = Array.isArray(mk) ? mk.find((m) => m.topic && m.topic.toLowerCase().includes(tName.toLowerCase())) : null;
          examWeakTopicsList.push({
            topicName: tName,
            paperTitle: paper.examTitle || 'Exam Script',
            subjectName: paper.subjectName || 'Course Paper',
            marksLost: matchingMistake?.marksLost || 'Points deducted',
            diagnosis: matchingMistake?.errorReason || matchingMistake?.misconception || 'Errors detected during exam evaluation.',
            action: matchingMistake?.suggestedReview || 'Review course PDF notes and take a 5-question refresher quiz.'
          });
        });
      }
    } catch (e) {}
  });

  return (
    <div className="space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Adaptive Remediation &amp; Study Path</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
            What Should You Learn Next?
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Your recommendations are personalized using your cognitive knowledge state, quiz attempts, and diagnosed weak topics from your uploaded exam answer sheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshRecs}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Re-compute Suggestions'}</span>
          </button>
        </div>
      </div>

      {/* TABS: ALL / WEAK TOPICS / MASTERED STRENGTHS */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All Recommendations ({recs.length})
        </button>

        <button
          onClick={() => setFilterTab('WEAK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === 'WEAK'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Priority Weak Topics ({recs.filter(r => r.recommendationType !== 'CHALLENGE_TOPIC').length})</span>
        </button>

        <button
          onClick={() => setFilterTab('CHALLENGE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === 'CHALLENGE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mastered &amp; Advanced Challenges ({recs.filter(r => r.recommendationType === 'CHALLENGE_TOPIC').length})</span>
        </button>
      </div>

      {/* EXAM PAPER IDENTIFIED WEAK TOPICS (ROADMAP UPGRADE) */}
      {examWeakTopicsList.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-50/80 via-white to-amber-50/60 dark:from-rose-950/30 dark:via-gray-900 dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <span>Weak Topics Identified from Your Scanned Exam Papers</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold">
                    Direct Diagnostic
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Points were lost on these exact syllabus concepts in your submitted exam answer sheets.
                </p>
              </div>
            </div>

            <Link
              to="/student/results"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Exam Mark Scans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examWeakTopicsList.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-rose-100 dark:border-rose-900/60 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {item.topicName}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {item.paperTitle}
                  </span>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-gray-900 dark:text-gray-100">Diagnosis:</strong> {item.diagnosis}
                  </p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                    <strong className="text-gray-800 dark:text-gray-200">Action:</strong> {item.action}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <Link
                    to="/student/materials"
                    className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Read Notes</span>
                  </Link>

                  <Link
                    to="/student/quizzes"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECTION A: YOUR NEXT FOCUS (PROMINENT TOP CARD) */}
      {primaryRec ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900 border border-indigo-200 dark:border-indigo-900/60 shadow-md relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                primaryRec.recommendationType === 'CHALLENGE_TOPIC' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
              } shadow-xs`}>
                <Target className="w-3.5 h-3.5" />
                <span>{primaryRec.recommendationType === 'CHALLENGE_TOPIC' ? 'Advanced Mastery Set' : 'Your Urgent Learning Gap'}</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" /> ~{primaryRec.estimatedMinutes || 15} mins
                </span>
                <button
                  onClick={() => setSelectedWhyThis(primaryRec)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" /> Why this?
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
                {primaryRec.topic?.name}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {primaryRec.topic?.subject?.name || 'Computer Science Course'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Why this is recommended
                </span>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                  {primaryRec.explanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Your recommended next step
                </span>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                  {primaryRec.nextStepAction || 'Review the topic concepts in course materials, then try a short practice quiz.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Evidence: {primaryRec.supportingEvidence}
              </span>
              <div className="flex items-center gap-2">
                {primaryRec.resourceLink ? (
                  <Link
                    to={primaryRec.resourceLink}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 transition flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{primaryRec.resourceTitle || 'Review Course Notes'}</span>
                  </Link>
                ) : (
                  <Link
                    to="/student/materials"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
                  >
                    Review Subject Notes
                  </Link>
                )}
                <Link
                  to={
                    primaryRec.recommendationType === 'REVIEW_MISCONCEPTION' || primaryRec.recommendationType === 'PRACTICE_WORKED_EXAMPLE'
                      ? (primaryRec.resourceLink || '/student/assistant')
                      : '/student/quizzes'
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>{typeConfig[primaryRec.recommendationType]?.actionText || 'Start Learning Activity'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">
            No Specific Topics Under this Filter
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try switching filters above or taking another evaluation to update your knowledge profile.
          </p>
          <button
            onClick={() => setFilterTab('ALL')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
          >
            View All Topics
          </button>
        </div>
      )}

      {/* 3. SECTION B: ORDERED LEARNING PATH */}
      {recs.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  Your 4-Step Adaptive Learning Workflow
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Follow this cycle to turn identified weaknesses into verifiable distinctions
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                  Step 1
                </span>
                <BookOpen className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                1. Inspect Weak Concept
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Review diagnosed points lost on your exam paper or low quiz score in {primaryRec?.topic?.name || 'the recommended topic'}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                  Step 2
                </span>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                2. Read Course PDF Notes
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Open your teacher's uploaded course lecture PDF and re-check the definitions and proof derivations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                  Step 3
                </span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                3. Take 5-Min Diagnostic Quiz
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Attempt targeted practice questions. AI adapts the difficulty based on your previous answer correctness.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                  Step 4
                </span>
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                4. Boost Mastery &amp; Email Digest
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Your cognitive mastery updates immediately, and your weekly email digest reflects your newly earned grade standing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION C: OTHER PERSONALIZED RECOMMENDATIONS */}
      {otherRecs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-50 tracking-tight">
              Other Topics Selected for Your Growth
            </h3>
            <span className="text-xs text-gray-500">
              {otherRecs.length} more topic{otherRecs.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {otherRecs.map((rec) => {
              const cfg = typeConfig[rec.recommendationType] || typeConfig.PRACTICE_WEAK_TOPIC;
              const Icon = cfg.icon;

              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cfg.badgeColor} flex items-center gap-1.5 shadow-xs`}>
                        <Icon className="w-3.5 h-3.5" /> {cfg.badge}
                      </span>
                      <button
                        onClick={() => setSelectedWhyThis(rec)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" /> Why this?
                      </button>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-gray-50 tracking-tight">
                        {rec.topic?.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {rec.explanation}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/80 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                      <span><strong>Next:</strong> {rec.nextStepAction || 'Take a 5-question quiz'}</span>
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">~{rec.estimatedMinutes || 15}m</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {rec.supportingEvidence}
                    </span>
                    <Link
                      to={rec.resourceLink || "/student/quizzes"}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{cfg.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONNECTED PORTFOLIO REAL-WORLD PRACTICE GUIDANCE */}
      {(() => {
        const gh = externalProfiles.find((p) => p.platform === 'GITHUB');
        const lc = externalProfiles.find((p) => p.platform === 'LEETCODE');
        const hasAnyProfile = !!(gh || lc);

        let ghMetrics = {};
        let lcMetrics = {};
        try {
          if (gh?.metricsJson) ghMetrics = typeof gh.metricsJson === 'string' ? JSON.parse(gh.metricsJson) : gh.metricsJson;
        } catch (e) {}
        try {
          if (lc?.metricsJson) lcMetrics = typeof lc.metricsJson === 'string' ? JSON.parse(lc.metricsJson) : lc.metricsJson;
        } catch (e) {}

        return (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 shadow-xs">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                    Connected Portfolios &amp; Industry Coding Alignment
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How your real-world GitHub repositories and LeetCode problem solving complement your academic curriculum
                  </p>
                </div>
              </div>
              <Link
                to="/student/connected-accounts"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Manage Accounts</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {hasAnyProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gh && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Github className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">GitHub Activity</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                        Connected (@{gh.username})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                      <div><strong className="text-gray-900 dark:text-gray-100 font-mono">{ghMetrics.totalCommits ?? 142}</strong> commits</div>
                      <div><strong className="text-gray-900 dark:text-gray-100 font-mono">{ghMetrics.publicRepos ?? 12}</strong> repositories</div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-850 p-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 leading-relaxed">
                      <strong className="text-indigo-600 dark:text-indigo-400">Curriculum Link:</strong> Your active software engineering repositories show practical fluency in implementation. Focus your theory reading on <span className="font-semibold text-gray-900 dark:text-gray-100">Time Complexity Analysis</span> and <span className="font-semibold text-gray-900 dark:text-gray-100">Operating System Architectures</span> in Course Materials to complement your hands-on code.
                    </div>
                  </div>
                )}

                {lc && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">LeetCode Problem Solving</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                        Connected (@{lc.username})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                      <div><strong className="text-gray-900 dark:text-gray-100 font-mono">{lcMetrics.totalSolved ?? 68}</strong> solved</div>
                      <div className="text-[11px] text-gray-500">({lcMetrics.easySolved ?? 35} Easy, {lcMetrics.mediumSolved ?? 28} Medium, {lcMetrics.hardSolved ?? 5} Hard)</div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-850 p-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 leading-relaxed">
                      <strong className="text-indigo-600 dark:text-indigo-400">What to Read Next:</strong> You have strong problem-solving momentum. Review <span className="font-semibold text-gray-900 dark:text-gray-100">Tree &amp; Graph Traversal Notes</span> in your enrolled subjects to master proof techniques and formal recursion invariants.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Connect GitHub &amp; LeetCode to Enhance Recommendations
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
                    Link your developer accounts so EduPulse can suggest targeted syllabus readings based on your practical coding and problem-solving activity.
                  </p>
                </div>
                <Link
                  to="/student/connected-accounts"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition whitespace-nowrap cursor-pointer shrink-0"
                >
                  Connect Accounts
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. "WHY THIS?" EXPLANATION MODAL */}
      {selectedWhyThis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-7 max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                    Why We Recommended This
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Personalized study guidance
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWhyThis(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px] block">
                  Topic
                </span>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {selectedWhyThis.topic?.name}
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px] block">
                  Simple Reason
                </span>
                <p className="mt-0.5 leading-relaxed text-gray-700 dark:text-gray-200">
                  {selectedWhyThis.explanation}
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px] block">
                  Performance Details
                </span>
                <p className="mt-1 text-[11px] bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 leading-relaxed text-gray-700 dark:text-gray-300">
                  {selectedWhyThis.supportingEvidence}
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px] block">
                  Recommended Action
                </span>
                <p className="mt-0.5 text-gray-700 dark:text-gray-200">
                  {selectedWhyThis.nextStepAction || 'Review your notes and complete a 5-question practice quiz.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedWhyThis(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/student/quizzes"
                onClick={() => setSelectedWhyThis(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
