import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { HelpCircle, Clock, BookOpen, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await studentApi.getAssignedQuizzes();
        if (res.success) {
          setQuizzes(res.data);
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
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading assigned quizzes..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const handleStart = async (quizId) => {
    try {
      const res = await studentApi.startQuizAttempt(quizId);
      if (res.success) {
        navigate(`/student/quizzes/${quizId}/take`, { state: { quizData: res.data } });
      }
    } catch (err) {
      alert(err.message || 'Failed to start quiz attempt.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Assigned Quizzes &amp; Diagnostic Tests</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Take quizzes to test your understanding. Results update your topic mastery immediately and adapt future recommendations.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">You're all caught up!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No pending quizzes assigned to your cohort right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.quizId}
              className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shrink-0 shadow-md shadow-indigo-500/20">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    Published
                  </span>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                    {quiz.subjectName}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{quiz.title}</h2>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span><strong className="text-slate-800 dark:text-slate-200">{quiz.questionCount}</strong> Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span><strong className="text-slate-800 dark:text-slate-200">{quiz.timeLimitMinutes}</strong> Minutes</span>
                  </div>
                  {quiz.dueDate && (
                    <div className="flex items-center gap-1.5 col-span-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5">
                <button
                  onClick={() => handleStart(quiz.quizId)}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start Quiz Attempt <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
