import React, { useState, useEffect } from 'react';
import { teacherApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  X,
  AlertTriangle
} from 'lucide-react';

export const TeacherExamPapers = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Upload Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Inspection Modal State
  const [inspectPaper, setInspectPaper] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, subjectsRes, papersRes] = await Promise.all([
        teacherApi.getStudents().catch(() => ({ success: false, data: [] })),
        teacherApi.getSubjects().catch(() => ({ success: false, data: [] })),
        teacherApi.getExamPapers().catch(() => ({ success: false, data: [] })),
      ]);

      if (studentsRes.success && Array.isArray(studentsRes.data)) {
        setStudents(studentsRes.data);
      }
      if (subjectsRes.success && Array.isArray(subjectsRes.data)) {
        setSubjects(subjectsRes.data);
      }
      if (papersRes.success && Array.isArray(papersRes.data)) {
        setPapers(papersRes.data);
      }
    } catch (err) {
      setError(err.message || 'Error communicating with exam grading server');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPaper = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Please select the student whose exam paper is being evaluated.');
      return;
    }
    if (!file) {
      setError('Please select an exam paper or evaluated answer sheet file (.pdf, .docx, .txt).');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('studentId', selectedStudentId);
      formData.append('file', file);
      if (examTitle.trim()) formData.append('examTitle', examTitle.trim());
      if (subjectName.trim()) formData.append('subjectName', subjectName.trim());

      const res = await teacherApi.uploadExamPaper(formData);
      if (res.success && res.data) {
        setSuccessMsg(`Exam paper '${res.data.examTitle}' evaluated successfully with AI question diagnosis!`);
        setPapers((prev) => [res.data, ...prev]);
        setInspectPaper(res.data);
        setShowUploadModal(false);
        // Reset form
        setSelectedStudentId('');
        setExamTitle('');
        setSubjectName('');
        setFile(null);
      } else {
        setError(res.message || 'Failed to upload and evaluate exam paper.');
      }
    } catch (err) {
      setError(err.message || 'Error uploading exam paper to server.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePaper = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this evaluated exam paper?')) return;

    try {
      const res = await teacherApi.deleteExamPaper(id);
      if (res.success) {
        setPapers((prev) => prev.filter((p) => p.id !== id));
        if (inspectPaper?.id === id) setInspectPaper(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete exam paper.');
    }
  };

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.examTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = filterSubject === 'ALL' || p.subjectName === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = ['ALL', ...new Set(papers.map((p) => p.subjectName).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
              Student Exam Papers &amp; AI Grader
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Faculty Evaluation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-3xl leading-relaxed">
            Upload student evaluated semester scripts, midterms, or assignment answer sheets. EduPulse AI automatically extracts questions, identifies deducted marks, diagnoses student misconceptions, and synchronizes weak topics into their adaptive storage.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload &amp; Evaluate Exam Paper</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">Evaluated Papers</span>
            <span className="text-xl font-black text-gray-900 dark:text-gray-100">{papers.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">Students Evaluated</span>
            <span className="text-xl font-black text-gray-900 dark:text-gray-100">
              {new Set(papers.map((p) => p.student?.id).filter(Boolean)).size}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">AI Grader Engine</span>
            <span className="text-xs font-black text-purple-700 dark:text-purple-300">OCR &amp; LLM Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">Adaptive Remediation</span>
            <span className="text-xs font-black text-amber-700 dark:text-amber-300">Auto-Linked to MCQs</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, exam title, or subject..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500">Subject:</span>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-xs py-2 px-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none"
          >
            {uniqueSubjects.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Papers Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <LoadingSpinner size="lg" text="Loading evaluated student exam papers..." />
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Evaluated Papers Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {papers.length === 0
              ? 'Click "Upload & Evaluate Exam Paper" above to submit a student exam script for automated AI grading and diagnosis.'
              : 'No exam papers match your current search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const pct = Math.round(paper.percentage || ((paper.totalScore / (paper.maxScore || 100)) * 100));
            let parsedMistakes = [];
            try {
              if (paper.mistakesJson) parsedMistakes = JSON.parse(paper.mistakesJson);
            } catch (ignored) {}

            return (
              <div
                key={paper.id}
                onClick={() => setInspectPaper(paper)}
                className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 truncate">
                      {paper.subjectName || 'Curriculum'}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {pct}% &bull; {paper.grade || 'A'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 group-hover:text-indigo-600 transition line-clamp-1">
                    {paper.examTitle}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {paper.student?.name || 'Student'}
                    </span>
                    <span className="text-gray-400 text-[11px] truncate">({paper.student?.email})</span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {paper.feedbackSummary || 'AI diagnostic evaluation complete.'}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-gray-400">
                    {paper.totalScore} / {paper.maxScore || 50} pts &bull; {parsedMistakes.length} errors
                  </span>

                  <div className="flex items-center gap-1.5">
                    {paper.fileData && (
                      <a
                        href={teacherApi.getExamPaperFileUrl(paper.id)}
                        onClick={(e) => e.stopPropagation()}
                        download
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                        title="Download Original Paper PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDeletePaper(paper.id, e)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition"
                      title="Delete Exam Paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setInspectPaper(paper)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD & EVALUATE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">Upload &amp; Evaluate Exam Paper</h3>
                  <span className="text-[11px] text-gray-500">Automated AI OCR &amp; Question Diagnosis</span>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPaper} className="space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Target Student *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Enrolled Student...</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email}) {st.academicInfo ? `— ${st.academicInfo}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Curriculum Subject
                </label>
                <input
                  type="text"
                  list="subjectsList"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="subjectsList">
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>

              {/* Exam Title */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Examination / Assessment Title
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm 1: Data Structures Assessment"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Evaluated Answer Script / Paper File *
                </label>
                <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {file ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      'Select student exam paper (.pdf, .docx, .txt)'
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Scanned or digital evaluated answer scripts</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file || !selectedStudentId}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Grading &amp; Diagnosing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate &amp; Save Paper</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {inspectPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  AI Evaluator Diagnostic Record
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-50">{inspectPaper.examTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Student: <strong>{inspectPaper.student?.name}</strong> ({inspectPaper.student?.email}) &bull; Subject: <strong>{inspectPaper.subjectName}</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectPaper(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Standing */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800">
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block">Total Marks</span>
                <div className="text-lg font-black font-mono text-gray-900 dark:text-gray-100 mt-0.5">
                  {inspectPaper.totalScore} / {inspectPaper.maxScore || 50}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Percentage</span>
                <div className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {Math.round(inspectPaper.percentage || ((inspectPaper.totalScore / (inspectPaper.maxScore || 100)) * 100))}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800">
                <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block">Academic Grade</span>
                <div className="text-xs font-black text-purple-700 dark:text-purple-300 mt-1 truncate">
                  {inspectPaper.grade}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Performance Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {inspectPaper.feedbackSummary}
              </p>
            </div>

            {/* Questions Mistakes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Diagnosed Question Mistakes</span>
                </h4>
              </div>

              {(() => {
                let mistakes = [];
                try {
                  if (inspectPaper.mistakesJson) mistakes = JSON.parse(inspectPaper.mistakesJson);
                } catch (ignored) {}

                if (mistakes.length === 0) {
                  return (
                    <div className="p-4 text-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-xs text-gray-500">
                      No question mistakes diagnosed on this evaluated exam paper.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {mistakes.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {m.question || `Question ${idx + 1}`} &bull; {m.topic}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            Lost {m.marksLost} marks
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          <strong>Misconception:</strong> {m.errorReason}
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400">
                          <strong>Correction:</strong> {m.suggestedReview}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Weak Topics */}
            {(() => {
              let weak = [];
              try {
                if (inspectPaper.weakTopicsJson) weak = JSON.parse(inspectPaper.weakTopicsJson);
              } catch (ignored) {}

              if (weak.length === 0) return null;

              return (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Weak Topics Synchronized to Student Profile
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {weak.map((w, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setInspectPaper(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
