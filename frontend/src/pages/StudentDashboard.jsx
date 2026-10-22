import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../api/client';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Bot,
  Code2,
  Brain,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  Compass,
  ListTodo,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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
    return <LoadingSpinner size="lg" text="Loading your learning progress..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert type="error" title="Dashboard Error" message={error} />
      </div>
    );
  }

  const hasHistory = data?.hasQuizHistory;
  const nextAction = data?.nextAction;
  const trajectory = data?.assessmentTrajectory;
  const dailyPlan = data?.dailyLearningPlan || [];
  const overallMasteryPct = Math.round((data?.overallMasteryAverage || 0) * 100);

  // Status descriptor for Question 1: How am I performing overall?
  const getOverallStatus = (pct) => {
    if (pct >= 75) return { label: 'High Mastery', color: 'emerald', text: 'You are demonstrating strong understanding across your curriculum concepts.' };
    if (pct >= 55) return { label: 'Steady Progress', color: 'blue', text: 'Concepts are developing well. Targeted practice on weak areas will accelerate mastery.' };
    return { label: 'Foundational Focus', color: 'amber', text: 'Focus on prerequisite concepts and guided practice to establish firm mastery.' };
  };

  const overallStatus = getOverallStatus(overallMasteryPct);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. WELCOME & PERSONALIZED LEARNING HUB */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/70 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-indigo-200/20 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-indigo-500/20 text-white dark:text-indigo-200 border border-white/20 dark:border-indigo-500/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Personalized Learning Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {data?.welcomeGreeting || `Welcome back, ${data?.studentName}!`}
          </h1>
          <p className="text-indigo-100 dark:text-gray-300 text-sm max-w-xl leading-relaxed">
            {data?.welcomeSummary || 'Here is your academic progress, strengths, and what to practise next.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <Link to="/student/results">
            <Button variant="primary" size="sm" icon={FileCheck}>
              Evaluated Papers
            </Button>
          </Link>
          <Link to="/student/quizzes">
            <Button variant="secondary" size="sm" icon={HelpCircle}>
              Take Quiz
            </Button>
          </Link>
          <Link to="/student/assistant">
            <Button variant="teal" size="sm" icon={Bot}>
              Ask Jarvis
            </Button>
          </Link>
          <Link to="/student/materials">
            <Button variant="secondary" size="sm" icon={FileText}>
              Notes
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. EXECUTIVE LEARNING METRICS (ANSWERS CORE QUESTIONS 1, 2, 6) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Your Performance Standing &amp; Trajectory</span>
          </h2>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Powered by Attentive Knowledge Tracing (AKT)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Question 1: How am I performing overall? */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Overall Mastery
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
                {hasHistory ? `${overallMasteryPct}%` : 'Ready to Start'}
              </div>
              <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, overallMasteryPct))}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-bold text-${overallStatus.color}-600 dark:text-${overallStatus.color}-400`}>
                {hasHistory ? overallStatus.label : 'Begin 1st Quiz'}
              </span>
            </div>
          </div>

          {/* Question 6: Am I improving compared with previous assessments? */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Assessment Trajectory
              </span>
              <div className={`p-2 rounded-xl ${
                trajectory?.direction === 'IMPROVING'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : trajectory?.direction === 'NEEDS_REVISION'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}>
                {trajectory?.direction === 'IMPROVING' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : trajectory?.direction === 'NEEDS_REVISION' ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-2">
                <span>{hasHistory ? `${Math.round(data?.averageQuizScore || 0)}%` : '0 Quizzes'}</span>
                {trajectory?.badge && hasHistory && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    trajectory.direction === 'IMPROVING'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : trajectory.direction === 'NEEDS_REVISION'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                  }`}>
                    {trajectory.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {hasHistory ? `Latest: ${trajectory?.latestScore || 0}% vs Avg ${trajectory?.previousAverage || 0}%` : 'Take your first quiz'}
              </p>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800 line-clamp-1">
              {trajectory?.summary || 'Calculated across sequential quiz attempts.'}
            </div>
          </div>

          {/* Question 2: Which subjects or topics am I weak in? */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Topics Requiring Revision
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
                {data?.weakTopicsCount || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data?.weakTopicsCount > 0 ? 'Topics below 60% mastery threshold' : 'All topics in good standing'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Action:</span>
              <Link to="/student/recommendations" className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
                Review Topics &rarr;
              </Link>
            </div>
          </div>

          {/* Active Academic Courses & Completed Evaluations */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Enrolled Subjects
              </span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
                {data?.enrolledSubjectsCount || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data?.completedAttemptsCount || 0} completed evaluation{data?.completedAttemptsCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Curriculum:</span>
              <Link to="/student/subjects" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
                View Subjects &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S PRIORITIZED LEARNING PLAN (ANSWERS QUESTIONS 3 & 5: WHAT TO STUDY NEXT & WHAT TO DO TODAY) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white dark:from-indigo-950/30 dark:via-gray-900 dark:to-gray-900 border border-indigo-200/90 dark:border-indigo-900/60 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 dark:border-indigo-900/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                <ListTodo className="w-3.5 h-3.5" />
                <span>Today's Prioritized Learning Plan</span>
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~35 mins total
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
              Action Plan to Boost Your Mastery Today
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              Follow these 3 focused steps to turn conceptual weaknesses into lasting strengths.
            </p>
          </div>

          {nextAction && (
            <div className="shrink-0">
              <Link to={nextAction.url || '/student/quizzes'}>
                <Button variant="primary" size="md" icon={ArrowRight}>
                  {nextAction.action || 'Start Today\'s Practice'}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 3-Step Daily Action Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyPlan.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center">
                    {item.step || idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.estimatedMinutes || 10}m
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <Link
                to={item.actionUrl || '/student/quizzes'}
                className="inline-flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pt-2 border-t border-gray-100 dark:border-gray-800/80 group"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MAIN CONTENT GRID: WEAK TOPICS (WHY STRUGGLING) & STRENGTHS & RECENT RESULTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Topics Requiring Revision & Strengths */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topics Requiring Revision (Answers Question 2 & Question 4: Why am I struggling?) */}
          <Card>
            <CardHeader
              title="Topics Requiring Revision"
              subtitle="Concepts flagged below 60% mastery with specific prerequisite guidance"
              action={
                <Link to="/student/recommendations">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                    Full Learning Path &rarr;
                  </span>
                </Link>
              }
            />

            <div className="space-y-3.5">
              {data?.topicsToPractice?.length > 0 ? (
                data.topicsToPractice.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-amber-200/90 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                          {topic.topicName}
                        </h4>
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full bg-white/80 dark:bg-gray-800">
                          {topic.subjectName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-lg">
                          {topic.masteryPercent}% Mastery
                        </span>
                        <Link
                          to={`/student/assistant?topic=${encodeURIComponent(topic.topicName)}&prompt=${encodeURIComponent(`Can you explain ${topic.topicName} step-by-step and help me understand where students typically make mistakes?`)}`}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Ask Jarvis</span>
                        </Link>
                        <Link
                          to="/student/quizzes"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          Practise
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-amber-200/50 dark:bg-amber-950/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, topic.masteryPercent))}%` }}
                      />
                    </div>

                    {/* Question 4: Why am I struggling with this topic? */}
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-amber-200/60 dark:border-amber-900/30 text-xs space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-200 block">
                        Why you are struggling &amp; recommended fix:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {topic.prerequisiteName ? (
                          <>
                            Identified concept bottleneck: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{topic.prerequisiteName}</strong>. Reviewing this prerequisite first will make this topic much easier to master.
                          </>
                        ) : (
                          topic.advice || 'A short 5-question targeted quiz will reinforce your problem-solving pattern for this topic.'
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    No critical learning gaps identified!
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    You are in solid standing across all enrolled subjects. Explore new topics or test yourself with challenge problem sets.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Topics You've Mastered (Strengths) */}
          <Card>
            <CardHeader
              title="Topics You've Mastered (Strengths)"
              subtitle="Concepts where you have demonstrated high accuracy and reliable retention"
            />

            <div className="space-y-3">
              {data?.strongTopics?.length > 0 ? (
                data.strongTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                          {topic.topicName}
                        </h4>
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          ({topic.subjectName})
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {topic.accuracy}% accuracy across {topic.attemptsCount} verified question attempts
                      </p>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-3 py-1 rounded-lg shrink-0">
                      {topic.masteryPercent}% Mastery
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-center space-y-2">
                  <BookOpen className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Take quizzes to reveal your strengths
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    As you answer questions correctly, topics you understand well will appear here.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Quiz Results & Evaluated Exam Papers Promo */}
          <Card>
            <CardHeader
              title="Recent Assessment Results &amp; Evaluated Papers"
              subtitle="Latest quiz attempts and teacher-graded exam papers with mistake diagnosis"
              action={
                <Link to="/student/results">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View Marked Papers &rarr;
                  </span>
                </Link>
              }
            />

            {/* Evaluated Papers Announcement Callout */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 sm:mt-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-gray-50">
                    Teacher-Evaluated Exam Papers Available
                  </h5>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    Inspect question-by-question mistake diagnoses, teacher notes, and generate instant practice MCQs.
                  </p>
                </div>
              </div>
              <Link to="/student/results" className="shrink-0">
                <Button variant="primary" size="sm">
                  Inspect Papers
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recentQuizzes?.length > 0 ? (
                data.recentQuizzes.map((quiz, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.date} • {quiz.feedback}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                        {quiz.score}%
                      </div>
                      <Badge variant="success" size="sm">
                        {quiz.status === 'SUBMITTED' ? 'Completed' : quiz.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-center space-y-3">
                  <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      No quiz attempts recorded yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Try a short practice quiz to start tracking your progress over time.
                    </p>
                  </div>
                  <Link to="/student/quizzes">
                    <Button variant="primary" size="sm">
                      Take Your First Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Quick Study Tools & Connected Accounts */}
        <div className="space-y-6">
          {/* Socratic AI Study Assistant Promo */}
          <Card className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900 border-indigo-200 dark:border-indigo-900/60">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  Ask Jarvis AI Tutor
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Have a question about a tricky concept or homework problem? Get step-by-step guidance grounded in your instructor's course notes.
                </p>
              </div>
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quick Prompts:
                </p>
                <Link
                  to="/student/assistant"
                  className="block p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-400 transition"
                >
                  "Explain binary search trees simply" &rarr;
                </Link>
                <Link
                  to="/student/assistant"
                  className="block p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-400 transition"
                >
                  "How do I solve recursion problems?" &rarr;
                </Link>
              </div>
              <Link to="/student/assistant" className="block pt-1">
                <Button variant="primary" size="sm" className="w-full">
                  Open Tutor Session &rarr;
                </Button>
              </Link>
            </div>
          </Card>

          {/* Course Notes & Materials */}
          <Card>
            <CardHeader
              title="Course Materials"
              subtitle="Notes uploaded by your teachers"
              action={
                <Link to="/student/materials">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View &rarr;
                  </span>
                </Link>
              }
            />
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Review lecture slides, readings, and study guides before exams to reinforce your understanding.
              </p>
              <Link
                to="/student/materials"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Open Course Notes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Connected Portfolios Snapshot */}
          <Card>
            <CardHeader
              title="Connected Portfolios"
              subtitle="External coding platforms"
              action={
                <Link to="/student/connected-accounts">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
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
                      className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {p.platform}
                        </span>
                        <Badge variant="success" size="sm">Connected</Badge>
                      </div>

                      <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                        @{p.username}
                      </p>

                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex justify-between pt-1">
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
                <div className="text-center py-5 space-y-2.5">
                  <Code2 className="w-7 h-7 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connect GitHub &amp; LeetCode to reflect your real-world coding practice.
                  </p>
                  <Link to="/student/connected-accounts">
                    <Button variant="outline" size="sm">Connect Profiles</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 5. OPTIONAL EXPANDABLE SECTION: HOW YOUR LEARNING IS ANALYSED */}
      <div className="pt-2">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              How Your Learning Is Analysed (Explainable AI &amp; AKT)
            </span>
            <span className="text-[10px] font-semibold text-gray-500 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800">
              Transparent Analytics
            </span>
          </div>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 space-y-1.5">
                <h5 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-500" /> Attentive Knowledge Tracing (AKT)
                </h5>
                <p className="leading-relaxed">
                  EduPulse uses Attentive Knowledge Tracing to evaluate your sequence of quiz answers over time. Rather than treating all questions equally, it weighs recent and concept-related questions higher to estimate how well you understand each topic.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 space-y-1.5">
                <h5 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-teal-500" /> AI Study Assistant &amp; Fallback
                </h5>
                <p className="leading-relaxed">
                  Your AI study assistant uses Google Gemini to answer questions and explain mistakes. If the AI service is ever temporarily unreachable, EduPulse automatically switches to a built-in offline educational tutor so your studying is never interrupted.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 italic pt-1 border-t border-gray-100 dark:border-gray-800">
              Note: Your mastery percentage is calculated from your verified question attempts, course examinations, and attendance records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
