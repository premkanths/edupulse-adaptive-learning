import React, { useEffect, useState } from 'react';
import { teacherApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { BookOpen, Plus, Sparkles, Send, CheckCircle2, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [qRes, sRes, cRes] = await Promise.all([
        teacherApi.getQuizzes(),
        teacherApi.getSubjects(),
        teacherApi.getClasses(),
      ]);

      if (qRes.success) setQuizzes(qRes.data);
      if (sRes.success) {
        setSubjects(sRes.data);
        if (sRes.data.length > 0 && !subjectId) setSubjectId(sRes.data[0].id);
      }
      if (cRes.success) {
        setClasses(cRes.data);
        if (cRes.data.length > 0 && !selectedClassId) setSelectedClassId(cRes.data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (quizId) => {
    try {
      const res = await teacherApi.publishQuiz(quizId);
      if (res.success) {
        alert('Quiz published successfully! Students can now attempt it.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error publishing quiz');
    }
  };

  const handleOpenAssign = (quiz) => {
    setSelectedQuiz(quiz);
    setShowAssignModal(true);
  };

  const handleAssignToClass = async (e) => {
    e.preventDefault();
    if (!selectedQuiz || !selectedClassId) return;

    setSaving(true);
    try {
      const res = await teacherApi.assignQuiz(selectedQuiz.id, Number(selectedClassId));
      if (res.success) {
        alert('Quiz assigned successfully to class!');
        setShowAssignModal(false);
      }
    } catch (err) {
      alert(err.message || 'Error assigning quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading quizzes..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quizzes & Assessment Orchestration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, assign, publish quizzes, or generate question sets with AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/teacher/quizzes/ai-generate"
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/80 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> AI Quiz Generator
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {quiz.subject?.name}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    quiz.status === 'PUBLISHED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                  }`}
                >
                  {quiz.status}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{quiz.title}</h2>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{quiz.timeLimitMinutes} mins</span>
                </div>
                {quiz.aiProvider && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    AI: {quiz.aiProvider}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
              {quiz.status === 'DRAFT' && (
                <button
                  onClick={() => handlePublish(quiz.id)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Publish Quiz
                </button>
              )}

              <button
                onClick={() => handleOpenAssign(quiz)}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Users className="w-3.5 h-3.5" /> Assign to Class
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Assign Quiz to Class</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Assigning: <strong>{selectedQuiz.title}</strong></p>

            <form onSubmit={handleAssignToClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Class Cohort</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  required
                  className="w-full py-2 px-3 border border-slate-200/90 dark:border-slate-800/90 rounded-xl bg-slate-50 dark:bg-[#0D1424]/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-800/80 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  {saving ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
