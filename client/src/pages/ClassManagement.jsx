import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, UserPlus, Trash2, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [studentToEnrollId, setStudentToEnrollId] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, userRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/users')
      ]);

      if (classRes.data?.success) setClasses(classRes.data.data);
      if (userRes.data?.success) {
        setTeachers(userRes.data.data.filter(u => u.role === 'TEACHER'));
        setStudents(userRes.data.data.filter(u => u.role === 'STUDENT'));
      }
    } catch (err) {
      console.error('Failed to load class management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = async (c) => {
    try {
      setSelectedClass(c);
      const res = await api.get(`/admin/classes/${c.id}`);
      if (res.data?.success) {
        setClassDetails(res.data.data);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to load class details.' });
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim() || !selectedTeacherId) return;

    try {
      const res = await api.post('/admin/classes', {
        name: newClassName.trim(),
        teacherId: parseInt(selectedTeacherId)
      });
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Class created successfully.' });
        setShowCreateModal(false);
        setNewClassName('');
        setSelectedTeacherId('');
        fetchInitialData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create class.' });
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedClass || !studentToEnrollId) return;

    try {
      const res = await api.post(`/admin/classes/${selectedClass.id}/students/${studentToEnrollId}`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Student successfully enrolled.' });
        setShowEnrollModal(false);
        setStudentToEnrollId('');
        handleSelectClass(selectedClass);
        fetchInitialData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to enroll student.' });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedClass) return;
    try {
      const res = await api.delete(`/admin/classes/${selectedClass.id}/students/${studentId}`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Student removed from cohort.' });
        handleSelectClass(selectedClass);
        fetchInitialData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to remove student.' });
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class cohort?')) return;
    try {
      const res = await api.delete(`/admin/classes/${classId}`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Class deleted successfully.' });
        setSelectedClass(null);
        setClassDetails(null);
        fetchInitialData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete class.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Class Cohorts & Student Enrollments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage academic batches, assign faculty supervisors, and organize student cohorts for quiz distribution.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Class Cohort
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {notification.message}
        </div>
      )}

      {/* Grid Layout: Classes List + Selected Class Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-1 bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Classes ({classes.length})</h2>
            <button onClick={fetchInitialData} className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-800/80">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {classes.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No class cohorts created yet.</p>
          ) : (
            <div className="space-y-2">
              {classes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectClass(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedClass?.id === c.id
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 dark:bg-[#0D1424]/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.id); }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Teacher: {c.teacherName}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {c.studentCount} Students
                    </span>
                    <span className="text-[11px] text-slate-400">ID #{c.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Class Detail */}
        <div className="lg:col-span-2 bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 shadow-sm space-y-6">
          {classDetails ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{classDetails.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      Cohort #{classDetails.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Assigned Faculty: <span className="font-semibold text-slate-800 dark:text-slate-200">{classDetails.teacherName}</span> ({classDetails.teacherEmail})
                  </p>
                </div>

                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Enroll Student
                </button>
              </div>

              {/* Enrolled Students Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Enrolled Students ({classDetails.students?.length || 0})</h3>
                {classDetails.students?.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center border border-dashed border-slate-200/90 dark:border-slate-800/90 rounded-xl">
                    No students enrolled in this cohort yet. Click "Enroll Student" to add members.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200/90 dark:border-slate-800/90 rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-[#0D1424]/70 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase border-b border-slate-200/90 dark:border-slate-800/90">
                        <tr>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Email Address</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classDetails.students.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60/60">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 text-xs">{s.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{s.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                s.isActive ? 'bg-emerald-100 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                              }`}>
                                {s.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleRemoveStudent(s.id)}
                                className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-300 font-semibold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium">Select a class cohort on the left to view students and details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Class */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Class Cohort</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Class / Cohort Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS2025-Section A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200/90 dark:border-slate-800/90 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Teacher</label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200/90 dark:border-slate-800/90 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select faculty member...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200/90 dark:border-slate-800/90 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 dark:bg-[#0D1424]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 rounded-xl text-xs font-semibold shadow-sm"
                >
                  Create Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#131C2E]/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Enroll Student into {selectedClass?.name}</h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Student</label>
                <select
                  required
                  value={studentToEnrollId}
                  onChange={(e) => setStudentToEnrollId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200/90 dark:border-slate-800/90 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose student to enroll...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 border border-slate-200/90 dark:border-slate-800/90 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 dark:bg-[#0D1424]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 rounded-xl text-xs font-semibold shadow-sm"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
