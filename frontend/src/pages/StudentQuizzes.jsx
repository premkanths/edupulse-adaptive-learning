import React, { useEffect, useState, useRef } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { HelpCircle, Clock, BookOpen, Calendar, ArrowRight, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { findMatchingQuiz } from '../utils/quizLauncher';

export const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingQuizId, setStartingQuizId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetTopic = searchParams.get('topic');
  const targetSubject = searchParams.get('subject');
  const targetQuizId = searchParams.get('quizId');
  const autoStart = searchParams.get('autoStart') === 'true';
  const autoStartedRef = useRef(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await studentApi.getAssignedQuizzes();
        if (res.success) {
          const list = res.data || [];
          setQuizzes(list);

          // Check if autoStart is requested
          if (autoStart && !autoStartedRef.current && list.length > 0) {
            autoStartedRef.current = true;
            const matched = findMatchingQuiz(list, {
              topic: targetTopic,
              subject: targetSubject,
              quizId: targetQuizId
            });
            if (matched) {
              setStartingQuizId(matched.quizId);
              try {
                const startRes = await studentApi.startQuizAttempt(matched.quizId);
                if (startRes.success) {
                  navigate(`/student/quizzes/${matched.quizId}/take`, { state: { quizData: startRes.data } });
                  return;
                }
              } catch (startErr) {
                console.warn('Auto start attempt failed, staying on list:', startErr);
                setStartingQuizId(null);
              }
            }
          }
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assigned quizzes.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [autoStart, targetTopic, targetSubject, targetQuizId]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading assigned quizzes..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const handleStart = async (quizId) => {
    try {
      setStartingQuizId(quizId);
      const res = await studentApi.startQuizAttempt(quizId);
      if (res.success) {
        navigate(`/student/quizzes/${quizId}/take`, { state: { quizData: res.data } });
      }
    } catch (err) {
      alert(err.message || 'Failed to start quiz attempt.');
    } finally {
      setStartingQuizId(null);
    }
  };

  const matchedRecommended = (targetTopic || targetSubject || targetQuizId)
    ? findMatchingQuiz(quizzes, { topic: targetTopic, subject: targetSubject, quizId: targetQuizId })
    : null;

  // Sort matched recommended quiz to the very top
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    if (matchedRecommended && a.quizId === matchedRecommended.quizId) return -1;
    if (matchedRecommended && b.quizId === matchedRecommended.quizId) return 1;
    return 0;
  });

  return (
    <div className="space-y-8 relative">
      {/* Auto-start full-screen transition overlay */}
      {startingQuizId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in text-white">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/90 flex items-center justify-center shadow-2xl animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Entering Practice Quiz...</h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-sm">
              Loading your questions and starting your timer for targeted concept practice.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Assigned Quizzes &amp; Diagnostic Tests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Take quizzes to test your understanding. Results update your topic mastery immediately and adapt future recommendations.
        </p>

        {targetTopic && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-bold">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Targeted Practice for: <u>{targetTopic}</u></span>
          </div>
        )}
      </div>

      {sortedQuizzes.length === 0 ? (
        <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">You're all caught up!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No pending quizzes assigned to your cohort right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedQuizzes.map((quiz) => {
            const isTarget = matchedRecommended && quiz.quizId === matchedRecommended.quizId;

            return (
              <div
                key={quiz.quizId}
                className={`bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between ${
                  isTarget
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10'
                    : 'border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-3 text-white rounded-2xl shrink-0 shadow-md ${
                      isTarget ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-indigo-500/30 animate-pulse' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-indigo-500/20'
                    }`}>
                      {isTarget ? <Target className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                    </div>

                    <div className="flex items-center gap-2">
                      {isTarget && (
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                          🎯 Target Practice
                        </span>
                      )}
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                        Published
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      {quiz.subjectName}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 tracking-tight">{quiz.title}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 py-3 border-y border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span><strong className="text-slate-800 dark:text-gray-200">{quiz.questionCount}</strong> Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span><strong className="text-slate-800 dark:text-gray-200">{quiz.timeLimitMinutes}</strong> Minutes</span>
                    </div>
                    {quiz.dueDate && (
                      <div className="flex items-center gap-1.5 col-span-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    onClick={() => handleStart(quiz.quizId)}
                    disabled={startingQuizId !== null}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 ${
                      isTarget
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 shadow-indigo-500/30 ring-2 ring-indigo-400'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-indigo-500/25'
                    }`}
                  >
                    <span>{isTarget ? 'Launch Recommended Quiz' : 'Start Quiz Attempt'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
