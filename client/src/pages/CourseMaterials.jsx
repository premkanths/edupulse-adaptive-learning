import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Trash2, FileText, CheckCircle2, AlertTriangle, RefreshCw, Plus, Search, Layers, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const CourseMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Upload Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [inputType, setInputType] = useState('FILE'); // 'FILE' | 'TEXT'

  // Test RAG Retrieval State
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testingRag, setTestingRag] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matRes, subRes] = await Promise.all([
        api.get('/teacher/materials'),
        api.get('/teacher/subjects'),
      ]);

      if (matRes.data?.success) setMaterials(matRes.data.data);
      if (subRes.data?.success) setSubjects(subRes.data.data);
    } catch (err) {
      console.error('Failed to load course materials:', err);
      setNotification({ type: 'error', message: 'Could not load course study materials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setNotification({ type: 'error', message: 'Please select a subject.' });
      return;
    }

    if (inputType === 'FILE' && !file) {
      setNotification({ type: 'error', message: 'Please select a document file (.pdf, .docx, .txt, .md).' });
      return;
    }

    if (inputType === 'TEXT' && !rawText.trim()) {
      setNotification({ type: 'error', message: 'Please enter notes or study text.' });
      return;
    }

    try {
      setUploading(true);
      setNotification(null);

      const formData = new FormData();
      formData.append('subjectId', selectedSubjectId);
      if (title.trim()) formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (inputType === 'FILE' && file) formData.append('file', file);
      if (inputType === 'TEXT' && rawText.trim()) formData.append('rawText', rawText.trim());

      const res = await api.post('/teacher/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setNotification({ type: 'success', message: res.data.message || 'Course notes processed successfully.' });
        setShowUploadModal(false);
        setTitle('');
        setDescription('');
        setFile(null);
        setRawText('');
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to upload course material.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}" and its study chunks?`)) return;

    try {
      const res = await api.delete(`/teacher/materials/${id}`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Course material and chunks removed.' });
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete course material.' });
    }
  };

  const handleTestRag = async (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    try {
      setTestingRag(true);
      const res = await api.post('/student/materials/retrieve', {
        query: testQuery.trim(),
        topK: 3,
      });

      if (res.data?.success) {
        setTestResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingRag(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Course Study Materials (RAG Knowledge Base)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Upload course notes, slides, and study guides. EduPulse automatically chunks text into vector-searchable knowledge for student AI tutoring.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Study Material
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          {notification.message}
        </div>
      )}

      {/* Materials List Card */}
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Uploaded Materials ({materials.length})</h2>
          <button
            onClick={fetchData}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
            <FileText className="w-8 h-8 mx-auto text-gray-400" />
            <p>No course materials uploaded yet. Upload your first PDF, DOCX, or text notes to activate RAG grounded tutoring.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {m.subject?.name || 'General Subject'}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {m.fileType || 'TXT'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50 mt-2 line-clamp-1">{m.title}</h3>
                  {m.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{m.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-3.5 h-3.5" />
                    {m.chunkCount} study chunks
                  </span>

                  <button
                    onClick={() => handleDelete(m.id, m.title)}
                    className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RAG Retrieval Verification Sandbox */}
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            RAG Semantic Retrieval Sandbox
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Test how the AI retrieves study passages for student questions in real-time.
          </p>
        </div>

        <form onSubmit={handleTestRag} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter test question (e.g. 'What is the runtime of Dijkstra algorithm?')..."
            className="flex-1 py-2 px-3.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={testingRag || !testQuery.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {testingRag ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Retrieve Passages
          </button>
        </form>

        {testResults && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Top Retrieved Grounding Chunks ({testResults.length})
            </h4>
            {testResults.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No matching passages found above relevance threshold.</p>
            ) : (
              testResults.map((r, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">
                      📄 {r.materialTitle} (Section {r.chunkIndex}) — {r.subjectName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      Score: {r.similarityScore}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">{r.snippet}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Upload Course Study Material</h3>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select Target Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Data Structures Lecture 4 - Binary Trees"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Brief Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts covered..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Input Method</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setInputType('FILE')}
                    className={`flex-1 py-1.5 rounded-lg font-medium border ${
                      inputType === 'FILE'
                        ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    File Upload (.pdf, .docx, .txt, .md)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('TEXT')}
                    className={`flex-1 py-1.5 rounded-lg font-medium border ${
                      inputType === 'TEXT'
                        ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Paste Text / Notes
                  </button>
                </div>

                {inputType === 'FILE' ? (
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl"
                  />
                ) : (
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste lecture notes or textbook summary here..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Process & Chunk Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
