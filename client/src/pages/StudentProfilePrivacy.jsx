import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Github,
  Code2,
  Calendar,
  FileText,
  Mail,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Star,
  ExternalLink,
  Award
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentProfilePrivacy = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('ACADEMIC'); // ACADEMIC, WEEKLY, EXTERNAL, SURVEY, PRIVACY

  // Data states
  const [academicData, setAcademicData] = useState(null);
  const [weeklySummaries, setWeeklySummaries] = useState([]);
  const [externalProfiles, setExternalProfiles] = useState([]);
  const [riskStatus, setRiskStatus] = useState(null);
  const [consent, setConsent] = useState(null);
  const [survey, setSurvey] = useState(null);

  // Form states
  const [githubUser, setGithubUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [hackerrankUser, setHackerrankUser] = useState('');

  const [surveyForm, setSurveyForm] = useState({
    q1Usefulness: 5,
    q2EaseOfUse: 5,
    q3ExplanationClarity: 5,
    q4Trust: 5,
    q5AiUsefulness: 5,
    comments: ''
  });

  const [loading, setLoading] = useState(true);
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [acadRes, weekRes, extRes, riskRes, consentRes, survRes] = await Promise.all([
        api.get('/student/academic-records'),
        api.get('/student/weekly-summaries'),
        api.get('/student/external-profiles'),
        api.get('/student/my-risk-status'),
        api.get('/student/consent'),
        api.get('/student/survey')
      ]);

      if (acadRes.data?.success) setAcademicData(acadRes.data.data);
      if (weekRes.data?.success) setWeeklySummaries(weekRes.data.data);
      if (extRes.data?.success) {
        setExternalProfiles(extRes.data.data);
        extRes.data.data.forEach(p => {
          if (p.platform === 'GITHUB') setGithubUser(p.username);
          if (p.platform === 'LEETCODE') setLeetcodeUser(p.username);
          if (p.platform === 'HACKERRANK') setHackerrankUser(p.username);
        });
      }
      if (riskRes.data?.success) setRiskStatus(riskRes.data.data);
      if (consentRes.data?.success) setConsent(consentRes.data.data);
      if (survRes.data?.success && survRes.data.data) {
        setSurvey(survRes.data.data);
        setSurveyForm({
          q1Usefulness: survRes.data.data.q1Usefulness,
          q2EaseOfUse: survRes.data.data.q2EaseOfUse,
          q3ExplanationClarity: survRes.data.data.q3ExplanationClarity,
          q4Trust: survRes.data.data.q4Trust,
          q5AiUsefulness: survRes.data.data.q5AiUsefulness,
          comments: survRes.data.data.comments || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile & privacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProfile = async (platform, username) => {
    if (!username.trim()) return;
    try {
      setSyncingPlatform(platform);
      const res = await api.post('/student/external-profiles/link', { platform, username });
      if (res.data?.success) {
        setNotification({ type: 'success', message: `${platform} profile linked and synced!` });
        fetchAllData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: `Failed to link ${platform} profile.` });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingSurvey(true);
      const res = await api.post('/student/survey', surveyForm);
      if (res.data?.success) {
        setSurvey(res.data.data);
        setNotification({ type: 'success', message: 'Thank you! Your survey feedback has been recorded for the research evaluation.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to submit feedback survey.' });
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const handleToggleConsent = async () => {
    const nextStatus = consent?.consentStatus === 'GRANTED' ? 'WITHDRAWN' : 'GRANTED';
    try {
      const res = await api.post('/student/consent', { status: nextStatus });
      if (res.data?.success) {
        setConsent(res.data.data);
        setNotification({ type: 'success', message: `Consent preferences updated to: ${nextStatus}` });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update consent.' });
    }
  };

  const handleDeleteMyData = async () => {
    try {
      await api.post('/student/delete-my-data');
      alert('Your data and chat history have been permanently anonymized and purged in compliance with privacy regulations. You will now be logged out.');
      logout();
    } catch (err) {
      setNotification({ type: 'error', message: 'Data deletion failed.' });
    }
  };

  const parseSnapshot = (snapshotJson) => {
    if (!snapshotJson) return null;
    try {
      return JSON.parse(snapshotJson);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Hub & Privacy Controls</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your institutional marks, weekly progress digests, external coding portfolios, and GDPR/FERPA privacy rights.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'ACADEMIC', label: 'Academic & Attendance', icon: FileText },
          { id: 'WEEKLY', label: 'Weekly Summaries', icon: Mail },
          { id: 'EXTERNAL', label: 'External Coding Profiles', icon: Code2 },
          { id: 'SURVEY', label: 'Research Feedback Survey', icon: Star },
          { id: 'PRIVACY', label: 'Privacy & Data Rights', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACADEMIC & ATTENDANCE */}
      {activeTab === 'ACADEMIC' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
              <p className="text-3xl font-black text-indigo-600 mt-2">
                {academicData?.attendancePercentage != null ? `${academicData.attendancePercentage}%` : '100%'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Based on {academicData?.totalAttendanceClasses || 0} class sessions</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutional Marks Avg</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                {academicData?.averageMarksPercentage != null ? `${academicData.averageMarksPercentage}%` : '85%'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Across {academicData?.totalAssessments || 0} formal assessments</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Risk Level</p>
              <p className={`text-xl font-black mt-2 ${
                riskStatus?.riskLevel === 'HIGH' ? 'text-rose-600' : riskStatus?.riskLevel === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {riskStatus?.riskLevel || 'LOW'} RISK
              </p>
              <p className="text-xs text-slate-400 mt-1">Continuous self-monitoring</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
              <p className="text-xl font-bold text-slate-800 mt-2">Active Enrolled</p>
              <p className="text-xs text-slate-400 mt-1">Academic Year 2025-2026</p>
            </div>
          </div>

          {/* Marks Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Institutional Examination & Assessment Records</h3>
            {academicData?.marksRecords?.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No examination marks imported yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-4 py-3">Marks Obtained</th>
                      <th className="px-4 py-3">Maximum Marks</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {academicData?.marksRecords?.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{m.subject?.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{m.assessmentName}</td>
                        <td className="px-4 py-3 font-semibold text-indigo-700">{m.marksObtained}</td>
                        <td className="px-4 py-3 text-slate-600">{m.maximumMarks}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {Math.round((m.marksObtained / m.maximumMarks) * 100)}%
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{m.assessmentDate}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {m.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY SUMMARIES */}
      {activeTab === 'WEEKLY' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Weekly Adaptive Learning Summaries</h2>
            <span className="text-xs text-slate-500">Automatically generated every Monday at 6:00 AM</span>
          </div>

          {weeklySummaries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No weekly summaries generated yet. Complete quizzes to receive your Monday progress report!
            </div>
          ) : (
            weeklySummaries.map((summary) => (
              <div key={summary.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-900">Week of {summary.weekStart}</span>
                  </div>
                  <span className="text-xs text-slate-400">Dispatched: {new Date(summary.emailedAt).toLocaleDateString()}</span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line font-sans text-xs leading-relaxed">
                  {summary.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: EXTERNAL CODING PROFILES */}
      {activeTab === 'EXTERNAL' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Connect your public developer and competitive programming profiles to enrich your academic portfolio.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GitHub Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Github className="w-5 h-5" /> GitHub
                </div>
                {externalProfiles.find(p => p.platform === 'GITHUB') && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Linked
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleLinkProfile('GITHUB', githubUser)}
                  disabled={syncingPlatform === 'GITHUB'}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  {syncingPlatform === 'GITHUB' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Sync GitHub Stats
                </button>
              </div>

              {(() => {
                const p = externalProfiles.find(x => x.platform === 'GITHUB');
                const snap = p ? parseSnapshot(p.snapshotJson) : null;
                if (!snap) return null;
                return (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                    <p><strong>Public Repos:</strong> {snap.publicRepos}</p>
                    <p><strong>Followers:</strong> {snap.followers}</p>
                    {snap.topLanguages && <p><strong>Languages:</strong> {snap.topLanguages.join(', ')}</p>}
                    <a href={snap.profileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1 font-semibold text-[11px] pt-1">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* LeetCode Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Code2 className="w-5 h-5 text-amber-500" /> LeetCode
                </div>
                {externalProfiles.find(p => p.platform === 'LEETCODE') && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Linked
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="LeetCode username"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleLinkProfile('LEETCODE', leetcodeUser)}
                  disabled={syncingPlatform === 'LEETCODE'}
                  className="w-full py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  {syncingPlatform === 'LEETCODE' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Sync LeetCode Stats
                </button>
              </div>

              {(() => {
                const p = externalProfiles.find(x => x.platform === 'LEETCODE');
                const snap = p ? parseSnapshot(p.snapshotJson) : null;
                if (!snap) return null;
                return (
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-1.5 text-slate-700">
                    <p><strong>Total Solved:</strong> <span className="font-bold text-amber-700">{snap.totalSolved}</span></p>
                    <p className="text-[11px] text-slate-500">Easy: {snap.easySolved} | Medium: {snap.mediumSolved} | Hard: {snap.hardSolved}</p>
                    {snap.acceptanceRate && <p><strong>Acceptance Rate:</strong> {snap.acceptanceRate}%</p>}
                    <a href={snap.profileUrl} target="_blank" rel="noreferrer" className="text-amber-700 flex items-center gap-1 font-semibold text-[11px] pt-1">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* HackerRank Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Award className="w-5 h-5 text-emerald-600" /> HackerRank
                </div>
                {externalProfiles.find(p => p.platform === 'HACKERRANK') && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Linked
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="HackerRank username"
                  value={hackerrankUser}
                  onChange={(e) => setHackerrankUser(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleLinkProfile('HACKERRANK', hackerrankUser)}
                  disabled={syncingPlatform === 'HACKERRANK'}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  {syncingPlatform === 'HACKERRANK' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Sync HackerRank Stats
                </button>
              </div>

              {(() => {
                const p = externalProfiles.find(x => x.platform === 'HACKERRANK');
                const snap = p ? parseSnapshot(p.snapshotJson) : null;
                if (!snap) return null;
                return (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-1.5 text-slate-700">
                    <p><strong>Badges:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {snap.badges?.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                    <a href={snap.profileUrl} target="_blank" rel="noreferrer" className="text-emerald-700 flex items-center gap-1 font-semibold text-[11px] pt-1">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESEARCH FEEDBACK SURVEY */}
      {activeTab === 'SURVEY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">EduPulse Platform Research Feedback Survey</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your empirical ratings help evaluate the Bayesian Knowledge Tracing model, explainability clarity, and AI assistant usability for research publication.
            </p>
          </div>

          <form onSubmit={handleSurveySubmit} className="space-y-6">
            {[
              { key: 'q1Usefulness', question: '1. How effective was EduPulse in identifying your weak topics?' },
              { key: 'q2EaseOfUse', question: '2. How intuitive and seamless was the user interface?' },
              { key: 'q3ExplanationClarity', question: '3. How clear were the pedagogical answer explanations and "Why this?" recommendations?' },
              { key: 'q4Trust', question: '4. How much do you trust the Bayesian Knowledge Tracing topic mastery estimations?' },
              { key: 'q5AiUsefulness', question: '5. How helpful was the AI study assistant in resolving your specific conceptual doubts?' }
            ].map(({ key, question }) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 block">{question}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSurveyForm({ ...surveyForm, [key]: score })}
                      className={`w-12 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        surveyForm[key] === score
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${surveyForm[key] === score ? 'fill-white' : ''}`} />
                      {score}
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">
                    {surveyForm[key] === 1 ? 'Strongly Disagree' : surveyForm[key] === 5 ? 'Strongly Agree' : 'Agree'}
                  </span>
                </div>
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 block">
                Additional Qualitative Comments (Optional):
              </label>
              <textarea
                rows={3}
                value={surveyForm.comments}
                onChange={(e) => setSurveyForm({ ...surveyForm, comments: e.target.value })}
                placeholder="Share your thoughts on the adaptive recommendations, quiz pacing, or suggestions for improvement..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingSurvey}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              {submittingSurvey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {survey ? 'Update Research Survey Submission' : 'Submit Survey Feedback'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PRIVACY & DATA RIGHTS */}
      {activeTab === 'PRIVACY' && (
        <div className="space-y-6">
          {/* Consent Setting Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Privacy & Research Data Sharing Consent</h3>
                <p className="text-xs text-slate-500 mt-0.5">Policy Version 1.0 (FERPA & GDPR Compliant)</p>
              </div>
              <button
                onClick={handleToggleConsent}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  consent?.consentStatus === 'GRANTED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                Consent: {consent?.consentStatus || 'GRANTED'}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When enabled, your anonymized quiz attempt counts, Bayesian Knowledge Tracing topic accuracy scores, and feedback survey ratings may be incorporated into empirical research benchmarks. No personally identifying information (name, email) is ever disclosed in public findings.
            </p>
          </div>

          {/* Right to be Forgotten (Data Deletion) */}
          <div className="bg-rose-50/40 rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-rose-900">Right to be Forgotten (Account Deletion & Data Purge)</h3>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  In compliance with GDPR Article 17 and institutional privacy safeguards, you may request permanent anonymization of your personal data. This irreversibly purges your AI chat history, unlinks external coding accounts, and anonymizes your student profile.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Purge & Anonymize My Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Data Erasure</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently purge your private AI chat history and anonymize your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMyData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Yes, Purge My Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
