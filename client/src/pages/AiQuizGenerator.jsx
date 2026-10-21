import React, { useEffect, useState } from 'react';
import { teacherApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Sparkles, CheckCircle2, ArrowRight, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AiQuizGenerator = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('MEDIUM');

  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (subjectId) {
      teacherApi.getTopics(subjectId).then((res) => {
        if (res.success) {
          setTopics(res.data);
          if (res.data.length > 0) setTopicId(res.data[0].id);
        }
      });
    }
  }, [subjectId]);

  const loadMetadata = async () => {
    try {
      const sRes = await teacherApi.getSubjects();
      if (sRes.success && sRes.data.length > 0) {
        setSubjects(sRes.data);
        setSubjectId(sRes.data[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setGenerating(true);
    setGeneratedDraft(null);

    try {
      const res = await teacherApi.generateAiQuiz({
        subjectId: Number(subjectId),
        topicId: Number(topicId),
        questionCount: Number(questionCount),
        difficulty,
      });

      if (res.success) {
        setGeneratedDraft(res.data);
      }
    } catch (err) {
      setError(err.message || 'AI generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAndPublish = async () => {
    if (!generatedDraft) return;
    try {
      const res = await teacherApi.publishQuiz(generatedDraft.id);
      if (res.success) {
        alert('Quiz approved and published successfully! Students can now attempt it.');
        navigate('/teacher/quizzes');
      }
    } catch (err) {
      alert('Error publishing quiz: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Provider Fallback: Gemini → Groq → Ollama
        </span>
        <h1 className="text-2xl font-bold text-slate-900">AI-Powered Quiz Generator</h1>
        <p className="text-sm text-slate-500 mt-1">
          Draft structured, pedagogically validated question sets with automated duplicate detection and teacher review before publication.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Curriculum Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Topic
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                required
                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions (Fast Quick Quiz)</option>
                <option value={5}>5 Questions (Standard Diagnostic)</option>
                <option value={10}>10 Questions (Mid-Term Review)</option>
                <option value={15}>15 Questions (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cognitive Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="EASY">Easy (Foundational Definitions)</option>
                <option value="MEDIUM">Medium (Conceptual Application)</option>
                <option value="HARD">Hard (Advanced Proofs & Complex Analysis)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Generating and Validating Questions with AI Provider...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions with AI</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Draft Review Banner */}
      {generatedDraft && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-emerald-950">Draft Questions Successfully Generated!</h2>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Quiz Draft Title: <strong>{generatedDraft.title}</strong> (Saved in Question Bank with status DRAFT).
                </p>
              </div>
            </div>

            <button
              onClick={handleApproveAndPublish}
              className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Approve & Publish Quiz
            </button>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed border-t border-emerald-200/80 pt-3">
            In accordance with educational AI safety standards, all AI-generated items are initially quarantined in <strong>DRAFT</strong> status until instructor review and publication.
          </p>
        </div>
      )}
    </div>
  );
};
