import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Award, CheckCircle2, XCircle, ArrowRight, Lightbulb, BookOpen, Layers } from 'lucide-react';

export const QuizResult = () => {
  const { attemptId } = useParams();
  const location = useLocation();

  const [data, setData] = useState(location.state?.evaluation || null);
  const [loading, setLoading] = useState(!location.state?.evaluation);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data) {
      studentApi.getAttemptReview(attemptId)
        .then((res) => {
          if (res.success) {
            setData(res.data);
          } else {
            setError(res.message);
          }
        })
        .catch((err) => setError(err.message || 'Failed to load attempt review.'))
        .finally(() => setLoading(false));
    }
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Calculating final score & topic mastery..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const score = data.score || 0;
  const questions = data.questions || data.answers || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Score Summary Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
            Assessment Completed
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{data.quizTitle || 'Quiz Evaluation'}</h1>
          <p className="text-indigo-100 text-sm max-w-lg">
            Your answers have been scored and Bayesian Knowledge Tracing topic estimates have updated in real time.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center shrink-0 min-w-[160px]">
          <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider block">Score</span>
          <div className="text-4xl font-extrabold text-white mt-1">{score}%</div>
          <span className="text-xs text-indigo-200 mt-1 block">
            {data.correctCount !== undefined ? `${data.correctCount} / ${data.totalQuestions} Correct` : 'Submitted'}
          </span>
        </div>
      </div>

      {/* Action Next Steps */}
      <div className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-2xl">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Adaptive Recommendations Updated</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review your personalized study suggestions tailored to today's quiz errors.
            </p>
          </div>
        </div>

        <Link
          to="/student/recommendations"
          className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          View Recommendations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Question Review List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Question-by-Question Diagnostic Review</h2>

        {questions.map((q, idx) => {
          const isCorrect = q.isCorrect;

          return (
            <div
              key={idx}
              className={`bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-3xl p-6 border shadow-sm space-y-4 ${
                isCorrect ? 'border-emerald-200/80' : 'border-rose-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Topic: <strong className="text-slate-700 dark:text-slate-300">{q.topicName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {q.text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options?.map((opt, optIdx) => {
                  const wasChosen = q.chosenIndex === optIdx;
                  const isRightOption = q.correctIndex === optIdx;

                  let optClass = 'bg-slate-50 dark:bg-[#0D1424]/70 border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-300';
                  if (isRightOption) {
                    optClass = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-900 font-semibold';
                  } else if (wasChosen && !isRightOption) {
                    optClass = 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-900 line-through';
                  }

                  return (
                    <div key={optIdx} className={`p-3 rounded-xl border flex items-center gap-2.5 ${optClass}`}>
                      <span className="w-5 h-5 rounded-md bg-white/80 border text-[10px] font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Explanation */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                  Why this answer?
                </span>
                <p className="leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
