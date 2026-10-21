import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentApi } from '../api/client';
import {
  Sparkles,
  X,
  BookOpen,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Award,
  GraduationCap,
  Calendar,
  ExternalLink,
  Code2,
  TrendingUp,
  FileText,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  User,
  ArrowRight,
  Target
} from 'lucide-react';

export const StudentAiSummaryDrawer = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | learned | gaps | academics | external
  const navigate = useNavigate();

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.getAiSummary();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load AI summary');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with AI intelligence server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    studentInfo = {},
    whatHeLearned = {},
    whatHeShouldLearn = {},
    academics = {},
    external = {},
    aiSynthesis = {}
  } = data || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/40 dark:via-gray-900 dark:to-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900 dark:text-gray-50 tracking-tight">
                  Student AI Summary
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  AKT &amp; ML
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {studentInfo?.name || 'Student'} • {studentInfo?.academicInfo || 'Undergraduate'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchSummary}
              disabled={loading}
              title="Refresh AI Analysis"
              className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/student/ai-summary');
              }}
              title="Open Full Page View"
              className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 text-xs overflow-x-auto no-scrollbar gap-1 py-2">
          {[
            { id: 'overview', label: 'AI Overview', icon: Sparkles },
            { id: 'learned', label: 'What I Learned', icon: CheckCircle2 },
            { id: 'gaps', label: 'What to Learn', icon: AlertTriangle },
            { id: 'academics', label: 'Academics', icon: GraduationCap },
            { id: 'external', label: 'External & Projects', icon: Code2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-gray-200/80 dark:border-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-gray-500">Synthesizing Attentive Knowledge Tracing &amp; Academic Data...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <p className="font-bold">Failed to load summary</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Executive Narrative */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{aiSynthesis?.headline || 'Your Learning Summary & Next Steps'}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                      {aiSynthesis?.executiveSummary}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 border-t border-indigo-100/60 dark:border-indigo-900/40">
                      <span>EduPulse AI Learning Assistant</span>
                    </div>
                  </div>

                  {/* Quick Stat Pill Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">AKT Estimated Mastery</span>
                      <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        {whatHeLearned?.averageMasteryPercent || 0}%
                      </div>
                      <span className="text-[10px] text-gray-500">Across enrolled subjects</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Academic Exam Avg</span>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {academics?.averageMarksPercentage || 0}%
                      </div>
                      <span className="text-[10px] text-gray-500">Institutional marks</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Class Attendance</span>
                      <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                        {academics?.attendancePercentage || 0}%
                      </div>
                      <span className="text-[10px] text-gray-500">Attendance standing</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Academic Risk Level</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {academics?.riskLevel === 'LOW' ? (
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            LOW RISK (SAFE)
                          </span>
                        ) : (
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            {academics?.riskLevel || 'EVALUATING'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">ML Random Forest model</span>
                    </div>
                  </div>

                  {/* Simple Direct Next Action */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Next Action</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiSynthesis?.nextAction || 'Practice a short 5-minute quiz on your priority topic to boost your mastery.'}
                    </p>
                    <div className="pt-1">
                      <Link
                        to="/student/quizzes"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Start Practice Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WHAT I LEARNED */}
              {activeTab === 'learned' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Mastered Topics ({whatHeLearned?.masteredCount || 0})
                    </span>
                    <span className="text-[11px] text-gray-500">P(Mastery) &ge; 65% via AKT</span>
                  </div>

                  {whatHeLearned?.masteredTopics?.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
                      Take diagnostic quizzes to establish certified topic mastery.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {whatHeLearned?.masteredTopics?.map((topic) => (
                        <div
                          key={topic.topicId}
                          className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">
                                {topic.topicName}
                              </h4>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {topic.subjectName}
                              </p>
                            </div>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              {topic.masteryPercent}% Mastery
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                            <span>Accuracy: <strong className="text-gray-700 dark:text-gray-300">{topic.accuracy}%</strong></span>
                            <span>Attempts: <strong className="text-gray-700 dark:text-gray-300">{topic.attemptsCount}</strong></span>
                            <span>AKT pKnown: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{topic.pKnown}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completed Quizzes & Metrics */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">Quiz Practice Standing</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Quizzes Finished:</span>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{whatHeLearned?.totalQuizzesCompleted || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Average Score:</span>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{whatHeLearned?.averageQuizScore || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WHAT TO LEARN (GAPS) */}
              {activeTab === 'gaps' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Active Knowledge Gaps ({whatHeShouldLearn?.gapCount || 0})
                    </span>
                    <span className="text-[11px] text-gray-500">Targeted by AKT</span>
                  </div>

                  <div className="space-y-2.5">
                    {whatHeShouldLearn?.activeGaps?.map((gap) => (
                      <div
                        key={gap.topicId}
                        className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/60 border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">
                              {gap.topicName}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {gap.subjectName}
                            </p>
                          </div>
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                            {gap.masteryPercent}% Mastery
                          </span>
                        </div>

                        {gap.hasPrerequisite && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Prerequisite required: <strong>{gap.prerequisiteName}</strong></span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-gray-500">
                            Historical Accuracy: {gap.accuracy}% ({gap.attemptsCount} attempts)
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              navigate('/student/quizzes');
                            }}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Practice Topic <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50 uppercase tracking-wider">
                      Algorithmic Recommendations
                    </h4>
                    {whatHeShouldLearn?.recommendations?.map((rec) => (
                      <div key={rec.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <span>{rec.topicName}</span>
                          <span className="text-[10px] font-medium text-gray-500">{rec.type}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                          {rec.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ACADEMICS */}
              {activeTab === 'academics' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Overall Attendance</span>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {academics?.attendancePercentage}%
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Exam Marks Average</span>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {academics?.averageMarksPercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Academic Marks List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50 uppercase tracking-wider">
                      Course Assessment Marks
                    </h4>
                    {academics?.marksRecords?.length === 0 ? (
                      <p className="text-xs text-gray-500">No institutional examination marks recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {academics?.marksRecords?.map((m) => {
                          const pct = m.maximumMarks ? Math.round((m.marksObtained / m.maximumMarks) * 100) : 0;
                          return (
                            <div key={m.id} className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                              <div>
                                <h5 className="text-xs font-bold text-gray-900 dark:text-gray-50">{m.assessmentName}</h5>
                                <p className="text-[10px] text-gray-500">{m.subject?.name || 'Subject Course'}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                                  {m.marksObtained} / {m.maximumMarks}
                                </span>
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{pct}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ML Risk Explanation */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Early Warning &amp; Risk Prediction</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Random Forest classifier evaluates attendance rate, quiz trajectory, and exam scores. Risk score: <strong>{academics?.riskScore}%</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: EXTERNAL PROFILES */}
              {activeTab === 'external' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connected coding platforms and external developer portfolios:
                  </p>

                  <div className="space-y-3">
                    {external?.profiles?.map((prof, idx) => {
                      let stats = {};
                      try {
                        stats = typeof prof.snapshotJson === 'string' ? JSON.parse(prof.snapshotJson) : (prof.snapshotJson || {});
                      } catch (e) {}

                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                                {prof.platform[0]}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">{prof.platform}</h4>
                                <span className="text-[10px] text-gray-500">@{prof.username}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Connected
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100 dark:border-gray-700">
                            {prof.platform === 'GITHUB' && (
                              <>
                                <div><span className="text-gray-500 text-[10px]">Public Repos:</span> <p className="font-bold">{stats.publicRepos || 0}</p></div>
                                <div><span className="text-gray-500 text-[10px]">Followers:</span> <p className="font-bold">{stats.followers || 0}</p></div>
                              </>
                            )}
                            {prof.platform === 'LEETCODE' && (
                              <>
                                <div><span className="text-gray-500 text-[10px]">Problems Solved:</span> <p className="font-bold text-emerald-600">{stats.solvedCount || 0}</p></div>
                                <div><span className="text-gray-500 text-[10px]">Contest Rating:</span> <p className="font-bold text-indigo-600">{stats.rating || 'N/A'}</p></div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Portfolio Links */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50">Verified Professional Links</h4>
                    <div className="space-y-1.5 text-xs">
                      {studentInfo?.githubUrl && (
                        <a href={studentInfo.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 hover:underline">
                          <span>GitHub: {studentInfo.githubUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {studentInfo?.linkedinUrl && (
                        <a href={studentInfo.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 hover:underline">
                          <span>LinkedIn: {studentInfo.linkedinUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {studentInfo?.websiteUrl && (
                        <a href={studentInfo.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 hover:underline">
                          <span>Portfolio Website: {studentInfo.websiteUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/student/ai-summary');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Open Full AI Dossier Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
