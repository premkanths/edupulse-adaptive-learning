import React, { useState, useEffect } from 'react';
import { UploadCloud, Download, CheckCircle2, AlertTriangle, RefreshCw, FileText, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

export const AcademicImport = () => {
  const [importType, setImportType] = useState('MARKS'); // MARKS or ATTENDANCE
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('academic_records.csv');
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const res = await api.get('/admin/import/batches');
      if (res.data?.success) {
        setBatches(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get(`/admin/import/templates/${importType}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${importType.toLowerCase()}_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to download template' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      // Excel File -> Send directly to backend upload endpoint for native POI parsing
      try {
        setLoadingPreview(true);
        setNotification(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', importType);

        const res = await api.post('/admin/import/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.success) {
          setPreview(res.data.data);
          setNotification({ type: 'success', message: `Parsed ${file.name} successfully.` });
        }
      } catch (err) {
        setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to parse Excel file.' });
      } finally {
        setLoadingPreview(false);
      }
    } else {
      // CSV File -> read text and preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        setCsvContent(content);
        try {
          setLoadingPreview(true);
          const res = await api.post('/admin/import/preview', {
            type: importType,
            csvContent: content,
            fileName: file.name
          });
          if (res.data?.success) {
            setPreview(res.data.data);
          }
        } catch (err) {
          setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to preview CSV' });
        } finally {
          setLoadingPreview(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePreview = async () => {
    if (!csvContent.trim()) {
      setNotification({ type: 'error', message: 'Please paste or upload CSV/Excel content first.' });
      return;
    }
    try {
      setLoadingPreview(true);
      setNotification(null);
      const res = await api.post('/admin/import/preview', {
        type: importType,
        csvContent,
        fileName
      });
      if (res.data?.success) {
        setPreview(res.data.data);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to generate preview' });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCommit = async () => {
    if (!preview || preview.validRows === 0) {
      setNotification({ type: 'error', message: 'No valid rows available to import.' });
      return;
    }
    try {
      setCommitting(true);
      const res = await api.post('/admin/import/commit', {
        type: importType,
        fileName,
        rows: preview.rows
      });
      if (res.data?.success) {
        setNotification({ type: 'success', message: res.data.message });
        setPreview(null);
        setCsvContent('');
        fetchBatches();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to commit import batch' });
    } finally {
      setCommitting(false);
    }
  };

  const loadSampleData = () => {
    if (importType === 'MARKS') {
      setCsvContent(
`student_email,subject_name,assessment_type,marks_obtained,max_marks,semester,academic_year
student1@edupulse.local,Data Structures and Algorithms,MIDTERM,85.5,100,Fall,2025-2026
student2@edupulse.local,Database Management Systems,QUIZ_1,18.0,20,Fall,2025-2026
student3@edupulse.local,Web Technologies,ASSIGNMENT,45.0,50,Fall,2025-2026`
      );
    } else {
      setCsvContent(
`student_email,subject_name,attendance_date,status
student1@edupulse.local,Data Structures and Algorithms,2025-10-15,PRESENT
student2@edupulse.local,Database Management Systems,2025-10-15,ABSENT
student3@edupulse.local,Web Technologies,2025-10-15,EXCUSED`
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Academic Records & Attendance Import</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Import institutional academic marks and attendance records via validated CSV and Excel (.xlsx) batches.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {notification.message}
        </div>
      )}

      {/* Import Configuration Card */}
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Import Category:</span>
            <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1 border border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => { setImportType('MARKS'); setPreview(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  importType === 'MARKS' ? 'bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 shadow-sm font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
                }`}
              >
                Assessment Marks
              </button>
              <button
                type="button"
                onClick={() => { setImportType('ATTENDANCE'); setPreview(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  importType === 'ATTENDANCE' ? 'bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 shadow-sm font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
                }`}
              >
                Attendance Records
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Download {importType} Template (.csv)
            </button>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Load Sample Data
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File Upload (.csv or .xlsx)</label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Choose CSV or Excel File</span>
              <input type="file" accept=".csv,.xlsx,.xls,.tsv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="Paste CSV rows here or upload a CSV / Excel spreadsheet above..."
            className="w-full font-mono text-xs p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
          />

          <div className="flex justify-end">
            <button
              onClick={handlePreview}
              disabled={loadingPreview || !csvContent.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              {loadingPreview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Validate & Preview
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {preview && (
        <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Pre-Commit Validation Preview</h2>
              <div className="flex items-center gap-4 text-xs font-semibold mt-1">
                <span className="text-gray-500 dark:text-gray-400">Total: {preview.totalRows}</span>
                <span className="text-emerald-600">Valid: {preview.validRows}</span>
                <span className="text-rose-600">Errors/Duplicates: {preview.invalidRows}</span>
              </div>
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || preview.validRows === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              {committing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Commit {preview.validRows} Valid Records
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Validation Status</th>
                  <th className="px-4 py-3">Student Email</th>
                  <th className="px-4 py-3">Subject</th>
                  {importType === 'MARKS' ? (
                    <>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-4 py-3">Marks</th>
                      <th className="px-4 py-3">Semester</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                    </>
                  )}
                  <th className="px-4 py-3">Audit Details & Warnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{row.rowNumber}</td>
                    <td className="px-4 py-3">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : row.duplicate ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                          <AlertTriangle className="w-3.5 h-3.5" /> Duplicate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
                          <AlertCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-gray-200 font-medium">{row.studentEmail}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.subjectName}</td>
                    {importType === 'MARKS' ? (
                      <>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{row.assessmentType}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-gray-200">
                          {row.marksObtained != null ? `${row.marksObtained} / ${row.maxMarks}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.semester}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{row.attendanceDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            row.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800 dark:text-emerald-300' :
                            row.attendanceStatus === 'ABSENT' ? 'bg-rose-100 text-rose-800 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:text-amber-300'
                          }`}>
                            {row.attendanceStatus}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-xs">
                      {row.valid ? (
                        row.warning ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">{row.warning}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready for commit</span>
                        )
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">{row.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History of Import Batches */}
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Import Batch Audit History</h2>
          <button
            onClick={fetchBatches}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBatches ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No previous import batches recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3">Batch ID</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Rows</th>
                  <th className="px-4 py-3">Success</th>
                  <th className="px-4 py-3">Failed</th>
                  <th className="px-4 py-3">Uploaded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">#{b.id}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-gray-200 font-medium">{b.fileName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:text-emerald-300' :
                        b.status === 'FAILED' ? 'bg-rose-100 text-rose-800 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:text-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.totalRows}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{b.successfulRows}</td>
                    <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">{b.failedRows}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
