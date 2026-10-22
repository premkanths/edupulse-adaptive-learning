import React, { useState, useEffect } from 'react';
import { studentApi, API_BASE } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  FileText,
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Bot,
  Calendar,
  User,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Copy,
  Check,
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'text'
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleOpenMaterial = async (item, mode = 'pdf') => {
    setActiveMaterial(item);
    setViewMode(mode);
    setPdfBlobUrl(null);

    if (mode === 'pdf') {
      setPdfLoading(true);
      try {
        const token = localStorage.getItem('edupulse_token') || localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/materials/${item.id}/file`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      } catch (err) {
        console.error('Failed to load PDF preview:', err);
      } finally {
        setPdfLoading(false);
      }
    }
  };

  const handleDownloadFile = async (item) => {
    try {
      const token = localStorage.getItem('edupulse_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/materials/${item.id}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName || 'material.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleCloseModal = () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    setActiveMaterial(null);
  };

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.getAvailableMaterials();
      if (res.success) {
        setMaterials(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch course materials');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with course material server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const subjects = ['ALL', ...new Set(materials.map((m) => m.subject?.name).filter(Boolean))];

  const filteredMaterials = materials.filter((m) => {
    const matchesSubject = selectedSubject === 'ALL' || m.subject?.name === selectedSubject;
    const matchesSearch =
      searchQuery === '' ||
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.textContent?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileTypeBadge = (fileType) => {
    switch (fileType?.toUpperCase()) {
      case 'PDF':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'DOCX':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'MD':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading teacher-provided course materials..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Teacher Course Materials</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              RAG &amp; Study Notes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
            Subject Course Materials &amp; Lecture Notes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-3xl">
            Read, study, and research official course materials, lecture notes, and curriculum guides provided by your course instructors. Integrated with EduPulse AI semantic tutoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/assistant')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Jarvis AI Tutor</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {sub === 'ALL' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search notes, topics, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 transition"
          />
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">No Course Materials Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery
              ? `No study materials matched "${searchQuery}". Try clearing search filters.`
              : 'Your instructors have not uploaded materials for this subject yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((item) => {
            const badgeColor = getFileTypeBadge(item.fileType);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {item.subject?.name || 'General Course'}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColor}`}>
                      {item.fileType || 'TXT'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {item.description || 'Comprehensive notes and curriculum materials prepared for classroom study.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300 line-clamp-3 font-mono text-[11px] leading-relaxed">
                    {item.textContent?.substring(0, 200)}...
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{item.teacher?.name || 'Faculty'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{item.chunkCount || 1} RAG Chunks</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMaterial(item, 'pdf')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                      title="Read original PDF document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>
                    <button
                      onClick={() => handleOpenMaterial(item, 'text')}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                      title="Read plain text"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadFile(item)}
                      title="Download original file"
                      className="p-2 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/student/assistant')}
                      title="Ask Jarvis AI tutor about this material"
                      className="p-2 rounded-xl text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-gray-700 transition cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* READING MODAL */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-indigo-950/40 dark:via-gray-900 dark:to-purple-950/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {activeMaterial.subject?.name}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {activeMaterial.fileType}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-50">{activeMaterial.title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By {activeMaterial.teacher?.name} &bull; Uploaded on {activeMaterial.createdAt ? new Date(activeMaterial.createdAt).toLocaleDateString() : 'Recent'}
                </p>
              </div>

              {/* View Switcher & Action buttons */}
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setViewMode('pdf');
                      if (!pdfBlobUrl) handleOpenMaterial(activeMaterial, 'pdf');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      viewMode === 'pdf' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    PDF Viewer
                  </button>
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      viewMode === 'text' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Lecture Text
                  </button>
                </div>

                <button
                  onClick={() => handleDownloadFile(activeMaterial)}
                  className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {activeMaterial.description && (
                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                  <strong>Instructor Overview:</strong> {activeMaterial.description}
                </div>
              )}

              {viewMode === 'pdf' ? (
                <div className="w-full min-h-[55vh] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {pdfLoading ? (
                    <div className="p-8 text-center">
                      <LoadingSpinner size="md" text="Loading original PDF document..." />
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={pdfBlobUrl}
                      title={activeMaterial.title}
                      className="w-full h-[65vh] border-0 rounded-2xl"
                    />
                  ) : (
                    <div className="p-8 text-center text-gray-500 space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm font-semibold">Binary PDF preview unavailable. Viewing extracted lecture text instead.</p>
                      <button
                        onClick={() => setViewMode('text')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        Switch to Lecture Text
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {activeMaterial.textContent}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Indexed for semantic search &bull; RAG chunks ready
              </span>
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate('/student/assistant');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Discuss with Jarvis AI Tutor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
