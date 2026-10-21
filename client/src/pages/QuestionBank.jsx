import React, { useEffect, useState } from 'react';
import { teacherApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { HelpCircle, Plus, Filter, CheckCircle2, BookOpen } from 'lucide-react';

export const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

// Form state
  const [text, setText] = useState('');
  const [topicId, setTopicId] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedTopicId]);

  const loadData = async () => {
    try {
      const [qRes, tRes] = await Promise.all([
        teacherApi.getQuestions(selectedTopicId || null),
        teacherApi.getTopics(),
      ]);

      if (qRes.success) setQuestions(qRes.data);
      if (tRes.success) {
        setTopics(tRes.data);
        if (!topicId && tRes.data.length > 0) setTopicId(tRes.data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load question bank data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await teacherApi.createQuestion({
        topicId: Number(topicId),
        text,
        options,
        correctIndex: Number(correctIndex),
        difficulty,
        explanation,
      });

      if (res.success) {
        setShowAddModal(false);
        setText('');
        setExplanation('');
        setOptions(['', '', '', '']);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error creating question');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading question bank records..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Question Bank Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Store, curate, and review manual and AI-generated assessment items for quizzes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-100"
        >
          <Plus className="w-4 h-4" /> Add Question Manually
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter Toolbar */}
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Filter by Topic:</span>
        <select
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
          className="text-xs py-1.5 px-3 bg-gray-50 dark:bg-gray-950/ border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Topics ({questions.length} items)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.subject?.name})</option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q) => {
          let opts = [];
          try {
            opts = JSON.parse(q.optionsJson);
          } catch (e) {
            opts = [];
          }

          return (
            <div key={q.id} className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/80 font-semibold text-gray-700 dark:text-gray-300">
                    {q.topic?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                    {q.difficulty}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase">
                  Source: {q.source}
                </span>
              </div>

              <p className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-relaxed">{q.text}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {opts.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      idx === q.correctIndex
                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 font-semibold'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/ text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-white/95 dark:bg-gray-900 backdrop-blur-xl border text-[10px] font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-950/ rounded-xl text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                <strong className="text-gray-700 dark:text-gray-300">Explanation: </strong>
                {q.explanation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 max-w-xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4 my-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Add New Question to Bank</h2>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  required
                  className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/ focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subject?.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Question Text</label>
                <textarea
                  rows="2"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the question text..."
                  required
                  className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/ focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase">Answer Options (Exactly 4)</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      required
                      className="flex-1 py-1.5 px-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/ focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Correct Answer</label>
                  <select
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/ focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/ focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Pedagogical Explanation</label>
                <textarea
                  rows="2"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the correct answer is right for student feedback..."
                  required
                  className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/ focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 dark:bg-gray-800/80 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
