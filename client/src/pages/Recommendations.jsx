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
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWhyThis, setSelectedWhyThis] = useState(null);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getRecommendations();
      if (res.success) {
        // Guarantee frontend deduplication by topic ID as well
        const deduplicated = deduplicateByTopic(res.data || []);
        setRecs(deduplicated);
      } else {
        setError(res.message);
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
      badge: 'Focus Topic',
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
    CHALLENGE_TOPIC: {
      badge: 'Advanced Challenge',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
      actionText: 'Try Advanced Set',
    },
  };

  const primaryRec = recs.length > 0 ? recs[0] : null;
  const otherRecs = recs.length > 1 ? recs.slice(1) : [];

  return (
    <div className="space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Personalized Study Path</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
            What Should You Learn Next?
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Your learning suggestions are based on your quiz results, previous attempts, and available learning analysis.
          </p>
        </div>

        <button
          onClick={handleRefreshRecs}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Suggestions'}</span>
        </button>
      </div>

      {/* 2. SECTION A: YOUR NEXT FOCUS (PROMINENT TOP CARD) */}
      {primaryRec ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900 border border-indigo-200 dark:border-indigo-900/60 shadow-md relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                <Target className="w-3.5 h-3.5" />
                <span>Your Next Focus</span>
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
                  Your next step
                </span>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                  {primaryRec.nextStepAction || 'Review the topic concepts, then try a short practice quiz.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Evidence: {primaryRec.supportingEvidence}
              </span>
              <Link
                to="/student/quizzes"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Start Practice Activity</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">
            You're All Caught Up!
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You currently have no critical learning gaps. Try exploring advanced problem sets or reviewing course notes.
          </p>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
          >
            Explore Quizzes
          </Link>
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
                  Your Recommended Learning Path
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Follow these 4 simple steps to master concepts efficiently
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
                Review Prerequisites
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {primaryRec?.recommendationType === 'REVIEW_PREREQUISITE'
                  ? `Review foundational notes for ${primaryRec.topic?.name} before moving forward.`
                  : 'Check prerequisite definitions and formulas in your course materials.'}
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
                Practise Key Topic
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Work through focused examples and solve exercises in {primaryRec?.topic?.name || 'your focus topic'}.
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
                Take Short Quiz
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Attempt a 5-question practice quiz to test your memory and verify concept mastery.
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
                Review Updated Progress
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                See your newly earned mastery percentage reflected immediately on your student dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION C: OTHER PERSONALIZED RECOMMENDATIONS (DEDUPLICATED) */}
      {otherRecs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-50 tracking-tight">
              Additional Suggestions for You
            </h3>
            <span className="text-xs text-gray-500">
              {otherRecs.length} more topic{otherRecs.length === 1 ? '' : 's'} to explore
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
                      to="/student/quizzes"
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

      {/* 5. "WHY THIS?" EXPLANATION MODAL (PLAIN ENGLISH) */}
      {selectedWhyThis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-7 max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
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
