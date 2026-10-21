import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../api/client';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { BookOpen, Award, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, Zap, Bot, Code2 } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, extRes] = await Promise.all([
          studentApi.getDashboard(),
          api.get('/student/external-profiles').catch(() => ({ data: { data: [] } })),
        ]);

        if (dashRes.success) {
          setData(dashRes.data);
        } else {
          setError(dashRes.message);
        }

        if (extRes.data?.data) {
          setProfiles(extRes.data.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load student dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading student analytics from MySQL..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert type="error" title="Dashboard Error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 dark:from-[#131C2E] dark:via-[#19243B] dark:to-[#0D1524] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-indigo-200/20 dark:border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient top right glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-indigo-500/20 text-white dark:text-indigo-200 border border-white/20 dark:border-indigo-500/30 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Bayesian Knowledge Tracing Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {data?.studentName}!
          </h1>
          <p className="text-blue-100 dark:text-slate-300 text-sm max-w-xl leading-relaxed">
            EduPulse continuously models your cognitive mastery state across individual knowledge components.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <Link to="/student/assistant">
            <Button variant="teal" size="sm" icon={Bot}>
              AI Study Assistant
            </Button>
          </Link>
          <Link to="/student/recommendations">
            <Button variant="primary" size="sm" icon={Lightbulb}>
              View Recommended Practice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Topic Mastery"
          value={`${Math.round((data?.overallMasteryAverage || 0) * 100)}%`}
          subtitle="Empirical BKT Estimate (pKnown)"
          icon={Award}
          color="blue"
          trend="+4.2% gain"
        />
        <StatCard
          title="Enrolled Subjects"
          value={data?.enrolledSubjectsCount || 0}
          subtitle="Active academic courses"
          icon={BookOpen}
          color="teal"
        />
        <StatCard
          title="Strong Topics"
          value={data?.strongTopicsCount || 0}
          subtitle="pKnown ≥ 0.80 mastery threshold"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Weak Topics"
          value={data?.weakTopicsCount || 0}
          subtitle="pKnown < 0.50 (Action needed)"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Recommendations & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adaptive Recommendations (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Personalized Topic Recommendations"
              subtitle="Sequenced according to prerequisite dependencies and mastery deficits"
              action={
                <Link to="/student/recommendations">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                    All Recommendations &rarr;
                  </span>
                </Link>
              }
            />

            <div className="space-y-3">
              {data?.recommendations?.length > 0 ? (
                data.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-[#23324D] bg-slate-50 dark:bg-[#0D1424] hover:bg-slate-100/80 dark:hover:bg-[#162136] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.topic}</span>
                      <Badge variant="warning">{rec.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white">Why this?</strong> {rec.reason}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{rec.action}</span>
                      <Link
                        to="/student/quizzes"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        Start Practice <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                  All prerequisite topics are currently above mastery threshold! Great work.
                </p>
              )}
            </div>
          </Card>

          {/* Recent Quizzes */}
          <Card>
            <CardHeader
              title="Recent Quiz Attempts"
              subtitle="Formative evaluation history and scores"
              action={
                <Link to="/student/performance">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Performance History &rarr;
                  </span>
                </Link>
              }
            />

            <div className="space-y-3">
              {data?.recentQuizzes?.length > 0 ? (
                data.recentQuizzes.map((quiz, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-[#23324D] bg-slate-50 dark:bg-[#0D1424] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{quiz.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attempted on {quiz.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{quiz.score}%</div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{quiz.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No recent quiz attempts recorded.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Connected Portfolios & Quick Tools */}
        <div className="space-y-6">
          {/* Coding Profiles Snapshot */}
          <Card>
            <CardHeader
              title="Connected Portfolios"
              subtitle="Extracurricular coding profiles"
              action={
                <Link to="/student/connected-accounts">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Manage &rarr;
                  </span>
                </Link>
              }
            />

            <div className="space-y-3">
              {profiles.length > 0 ? (
                profiles.map((p) => {
                  let stats = {};
                  try {
                    stats = JSON.parse(p.snapshotJson || '{}');
                  } catch (e) {}

                  return (
                    <div
                      key={p.platform}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-[#23324D] bg-slate-50 dark:bg-[#0D1424] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {p.platform}
                        </span>
                        <Badge variant="success" size="sm">Connected</Badge>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                        @{p.username}
                      </p>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between pt-1">
                        {p.platform === 'GITHUB' && (
                          <span>{stats.publicRepos || 0} public repositories</span>
                        )}
                        {p.platform === 'LEETCODE' && (
                          <span>{stats.totalSolved || 0} problems solved</span>
                        )}
                        {p.platform === 'HACKERRANK' && (
                          <span>{(stats.badges || []).length} skill badges</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Code2 className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">No coding portfolios linked yet.</p>
                  <Link to="/student/connected-accounts">
                    <Button variant="outline" size="sm">Connect GitHub &amp; LeetCode</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Socratic AI Study Assistant Promo */}
          <Card className="bg-indigo-50/60 dark:bg-[#131C2E] border-indigo-200 dark:border-[#23324D]">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Need Pedagogical Guidance?</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  The Socratic Study Assistant reads your recent quiz errors and explains core concepts step-by-step.
                </p>
              </div>
              <Link to="/student/assistant" className="block pt-1">
                <Button variant="primary" size="sm" className="w-full">
                  Open AI Tutor &rarr;
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
