import React, { useState, useEffect } from 'react';
import { UploadCloud, Download, CheckCircle2, AlertTriangle, RefreshCw, FileText, Check, AlertCircle } from 'lucide-react';
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handlePreview = async () => {
    if (!csvContent.trim()) {
      setNotification({ type: 'error', message: 'Please paste or upload CSV content first.' });
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
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to generate CSV preview' });
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
      setNotification({ type: 'error', message: err.response?.data?.message || 'Commit failed.' });
    } finally {
      setCommitting(false);
    }
  };

  const loadSampleData = () => {
    if (importType === 'MARKS') {
      setCsvContent(
`student_email,subject_name,assessment_type,marks_obtained,max_marks,semester,academic_year
student1@edupulse.local,Data Structures and Algorithms,MIDTERM,86.5,100,Fall,2025-2026
student2@edupulse.local,Database Management Systems,QUIZ_1,17.5,20,Fall,2025-2026
student3@edupulse.local,Web Technologies,ASSIGNMENT,48.0,50,Fall,2025-2026
invalid.student@edupulse.local,Web Technologies,MIDTERM,70.0,100,Fall,2025-2026`
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Records & Attendance Import</h1>
        <p className="text-slate-500 text-sm mt-1">
          Import institutional academic marks and attendance records via validated CSV batches.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {notification.message}
        </div>
      )}

      {/* Import Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Import Category:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => { setImportType('MARKS'); setPreview(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  importType === 'MARKS' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assessment Marks
              </button>
              <button
                type="button"
                onClick={() => { setImportType('ATTENDANCE'); setPreview(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  importType === 'ATTENDANCE' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attendance Records
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Download {importType} Template (.csv)
            </button>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Load Sample Data
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">CSV Content</label>
            <label className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows={6}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="Paste CSV rows here or upload a file..."
            className="w-full font-mono text-xs p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handlePreview}
              disabled={loadingPreview || !csvContent.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              {loadingPreview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Validate & Preview CSV
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Batch Preview & Pre-Commit Validation</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Total Rows: <span className="font-semibold text-slate-800">{preview.totalRows}</span> | Valid: <span className="font-semibold text-emerald-600">{preview.validRows}</span> | Invalid: <span className="font-semibold text-rose-600">{preview.invalidRows}</span>
              </p>
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || preview.validRows === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              {committing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Commit Valid Rows ({preview.validRows})
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Row #</th>
                  <th className="px-4 py-3">Status</th>
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
                      <th className="px-4 py-3">Attendance</th>
                    </>
                  )}
                  <th className="px-4 py-3">Validation Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber} className={row.valid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40'}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.rowNumber}</td>
                    <td className="px-4 py-3">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{row.studentEmail}</td>
                    <td className="px-4 py-3 text-slate-600">{row.subjectName}</td>
                    {importType === 'MARKS' ? (
                      <>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.assessmentType}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {row.marksObtained != null ? `${row.marksObtained} / ${row.maxMarks}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{row.semester}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-600 text-xs">{row.attendanceDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            row.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            row.attendanceStatus === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {row.attendanceStatus}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-xs">
                      {row.valid ? (
                        <span className="text-emerald-600 font-medium">Ready for commit</span>
                      ) : (
                        <span className="text-rose-600 font-medium">{row.error}</span>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Import Batch Audit History</h2>
          <button
            onClick={fetchBatches}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBatches ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No previous import batches recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">#{b.id}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{b.fileName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.totalRows}</td>
                    <td className="px-4 py-3 font-medium text-emerald-600">{b.successfulRows}</td>
                    <td className="px-4 py-3 font-medium text-rose-600">{b.failedRows}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
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
