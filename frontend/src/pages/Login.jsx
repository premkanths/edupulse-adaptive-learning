import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Filter,
  Users,
  BookOpen
} from 'lucide-react';
import { Alert } from '../components/Alert';
import api from '../services/api';

// Fallback dataset for 50 students across 3 sections & 3 teachers
const STATIC_STUDENTS = [
  // Section A (Students 1 to 17) -> Lead: Prof. Sarah Connor
  { name: 'Aarav Sharma', email: 'student1@edupulse.local', category: 'HIGH', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '96%', avgScore: '89%' },
  { name: 'Ananya Patel', email: 'student2@edupulse.local', category: 'HIGH', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '94%', avgScore: '87%' },
  { name: 'Rohan Gupta', email: 'student3@edupulse.local', category: 'AT_RISK', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '54%', avgScore: '46%' },
  { name: 'Priya Nair', email: 'student4@edupulse.local', category: 'MODERATE', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '82%', avgScore: '74%' },
  { name: 'Karthik Raja', email: 'student5@edupulse.local', category: 'MODERATE', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '79%', avgScore: '71%' },
  { name: 'Meera Sen', email: 'student6@edupulse.local', category: 'HIGH', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '98%', avgScore: '92%' },
  { name: 'Vikram Joshi', email: 'student7@edupulse.local', category: 'AT_RISK', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '52%', avgScore: '43%' },
  { name: 'Neha Verma', email: 'student8@edupulse.local', category: 'MODERATE', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '85%', avgScore: '76%' },
  { name: 'Rahul Das', email: 'student9@edupulse.local', category: 'AT_RISK', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '56%', avgScore: '48%' },
  { name: 'Divya Reddy', email: 'student10@edupulse.local', category: 'HIGH', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '93%', avgScore: '88%' },
  { name: 'Aditya Roy', email: 'student11@edupulse.local', category: 'MODERATE', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '77%', avgScore: '69%' },
  { name: 'Sneha Kulkarni', email: 'student12@edupulse.local', category: 'HIGH', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '95%', avgScore: '89%' },
  { name: 'Tarun Kumar', email: 'student13@edupulse.local', category: 'AT_RISK', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '53%', avgScore: '45%' },
  { name: 'Pooja Hegde', email: 'student14@edupulse.local', category: 'MODERATE', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '80%', avgScore: '73%' },
  { name: 'Varun Tej', email: 'student15@edupulse.local', category: 'HIGH', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '92%', avgScore: '86%' },
  { name: 'Kavya Madhavan', email: 'student16@edupulse.local', category: 'MODERATE', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '83%', avgScore: '75%' },
  { name: 'Nikhil Siddharth', email: 'student17@edupulse.local', category: 'AT_RISK', section: 'Section A', mentor: 'Prof. Sarah Connor', attendance: '55%', avgScore: '47%' },

  // Section B (Students 18 to 34) -> Lead: Prof. Alan Turing
  { name: 'Siddharth Menon', email: 'student18@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '95%', avgScore: '90%' },
  { name: 'Riya Chakraborty', email: 'student19@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '93%', avgScore: '88%' },
  { name: 'Amitav Ghosh', email: 'student20@edupulse.local', category: 'AT_RISK', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '51%', avgScore: '42%' },
  { name: 'Deepa Malik', email: 'student21@edupulse.local', category: 'MODERATE', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '84%', avgScore: '76%' },
  { name: 'Farhan Akhtar', email: 'student22@edupulse.local', category: 'MODERATE', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '78%', avgScore: '70%' },
  { name: 'Ishita Dutta', email: 'student23@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '96%', avgScore: '91%' },
  { name: 'Harish Kalyan', email: 'student24@edupulse.local', category: 'AT_RISK', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '53%', avgScore: '44%' },
  { name: 'Jyoti Prakash', email: 'student25@edupulse.local', category: 'MODERATE', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '81%', avgScore: '72%' },
  { name: 'Kunal Kapoor', email: 'student26@edupulse.local', category: 'AT_RISK', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '57%', avgScore: '49%' },
  { name: 'Lavanya Tripathi', email: 'student27@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '94%', avgScore: '87%' },
  { name: 'Manish Paul', email: 'student28@edupulse.local', category: 'MODERATE', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '79%', avgScore: '71%' },
  { name: 'Nidhi Agarwal', email: 'student29@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '97%', avgScore: '93%' },
  { name: 'Omkar Prasad', email: 'student30@edupulse.local', category: 'AT_RISK', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '54%', avgScore: '46%' },
  { name: 'Pallavi Sharda', email: 'student31@edupulse.local', category: 'MODERATE', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '82%', avgScore: '74%' },
  { name: 'Qadir Khan', email: 'student32@edupulse.local', category: 'MODERATE', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '76%', avgScore: '68%' },
  { name: 'Rashmika Mandanna', email: 'student33@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '96%', avgScore: '90%' },
  { name: 'Sachin Tendulkar', email: 'student34@edupulse.local', category: 'HIGH', section: 'Section B', mentor: 'Prof. Alan Turing', attendance: '99%', avgScore: '96%' },

  // Section C (Students 35 to 50) -> Lead: Prof. Ada Lovelace
  { name: 'Tanvi Shah', email: 'student35@edupulse.local', category: 'HIGH', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '95%', avgScore: '89%' },
  { name: 'Uday Kiran', email: 'student36@edupulse.local', category: 'AT_RISK', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '50%', avgScore: '41%' },
  { name: 'Vaishnavi Gowda', email: 'student37@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '83%', avgScore: '75%' },
  { name: 'Waseem Ahmed', email: 'student38@edupulse.local', category: 'AT_RISK', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '55%', avgScore: '47%' },
  { name: 'Yashwant Rao', email: 'student39@edupulse.local', category: 'HIGH', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '92%', avgScore: '86%' },
  { name: 'Zoya Akhtar', email: 'student40@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '80%', avgScore: '73%' },
  { name: 'Abhimanyu Singh', email: 'student41@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '78%', avgScore: '70%' },
  { name: 'Bhavana Menon', email: 'student42@edupulse.local', category: 'HIGH', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '96%', avgScore: '91%' },
  { name: 'Chirag Paswan', email: 'student43@edupulse.local', category: 'AT_RISK', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '52%', avgScore: '43%' },
  { name: 'Drishti Dhami', email: 'student44@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '81%', avgScore: '72%' },
  { name: 'Eshan Hilal', email: 'student45@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '77%', avgScore: '69%' },
  { name: 'Fatima Sana', email: 'student46@edupulse.local', category: 'HIGH', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '94%', avgScore: '88%' },
  { name: 'Gaurav Khanna', email: 'student47@edupulse.local', category: 'AT_RISK', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '54%', avgScore: '45%' },
  { name: 'Hansika Motwani', email: 'student48@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '82%', avgScore: '74%' },
  { name: 'Ishaan Khatter', email: 'student49@edupulse.local', category: 'MODERATE', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '79%', avgScore: '71%' },
  { name: 'Janhvi Kapoor', email: 'student50@edupulse.local', category: 'HIGH', section: 'Section C', mentor: 'Prof. Ada Lovelace', attendance: '97%', avgScore: '92%' },

  // Section D (Students 51 to 60) -> Lead: Prof. Maya Lin (CLEAN SLATE FOR LIVE PRESENTATION)
  { name: 'Aakash Varma', email: 'student51@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Ananya Deshmukh', email: 'student52@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Bikram Roy', email: 'student53@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Chaitanya Joshi', email: 'student54@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Deepika Padukone', email: 'student55@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Eklavya Sharma', email: 'student56@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Gitanjali Rao', email: 'student57@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Himanshu Tiwari', email: 'student58@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Indira Sengupta', email: 'student59@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' },
  { name: 'Jayesh Patel', email: 'student60@edupulse.local', category: 'DEMO', section: 'Section D (Live Demo)', mentor: 'Prof. Maya Lin', attendance: 'New (0%)', avgScore: 'Pending' }
];

const STATIC_TEACHERS = [
  {
    name: 'Prof. Maya Lin (Live Demo)',
    email: 'teacher.maya@edupulse.local',
    section: 'CS Year 4 - Section D (Live Demo)',
    cohortSize: '10 Students (Fresh Class)',
    subjects: ['Add on spot during presentation!'],
    atRiskCount: 0,
    bio: 'Fresh faculty account for live presentation: add subjects, notes, mark sheets & assign quizzes on the spot!'
  },
  {
    name: 'Prof. Sarah Connor',
    email: 'teacher.sarah@edupulse.local',
    section: 'CS Year 4 - Section A',
    cohortSize: '17 Students',
    subjects: ['Data Structures & Algorithms', 'Computer Networks'],
    atRiskCount: 5,
    bio: 'Lead Mentor for Section A with 5 at-risk students in Remedial Queue.'
  },
  {
    name: 'Prof. Alan Turing',
    email: 'teacher.alan@edupulse.local',
    section: 'CS Year 4 - Section B',
    cohortSize: '17 Students',
    subjects: ['Database Management Systems', 'Software Engineering & System Design'],
    atRiskCount: 4,
    bio: 'Lead Mentor for Section B overseeing DBMS & Architecture cohorts.'
  },
  {
    name: 'Prof. Ada Lovelace',
    email: 'teacher.ada@edupulse.local',
    section: 'CS Year 4 - Section C',
    cohortSize: '16 Students',
    subjects: ['Operating Systems'],
    atRiskCount: 4,
    bio: 'Lead Mentor for Section C specializing in Operating Systems & Concurrency.'
  }
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Demo accounts modal state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoTab, setDemoTab] = useState('STUDENTS'); // STUDENTS | TEACHERS | ADMIN
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL'); // ALL | Section A | Section B | Section C
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL | HIGH | MODERATE | AT_RISK

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read role context from query params: /login?role=STUDENT | TEACHER | ADMIN
  const searchParams = new URLSearchParams(location.search);
  const requestedRole = (searchParams.get('role') || 'STUDENT').toUpperCase();

  const redirectByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'TEACHER':
        navigate('/teacher/dashboard');
        break;
      case 'STUDENT':
      default:
        navigate('/student/dashboard');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail, demoPassword = 'Password@123') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);
    setShowDemoModal(false);

    try {
      const user = await login(demoEmail, demoPassword);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalInfo = () => {
    if (requestedRole === 'TEACHER') {
      return {
        badge: 'Faculty Portal',
        badgeColor: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 shadow-xs',
        icon: UserCheck,
        title: 'Faculty & Instructor Sign In',
        subtitle: 'Class curriculum, analytics, and early warning interventions'
      };
    }
    if (requestedRole === 'ADMIN') {
      return {
        badge: 'Administration',
        badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-xs',
        icon: ShieldCheck,
        title: 'Institutional Administrator Sign In',
        subtitle: 'Campus cohorts, global settings, and audit logs'
      };
    }
    return {
      badge: 'Learner Portal',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs',
      icon: GraduationCap,
      title: 'Sign in to EduPulse',
      subtitle: 'Adaptive learning paths, AKT mastery, and AI tutor'
    };
  };

  const portal = getPortalInfo();
  const PortalIcon = portal.icon;

  // Filter students based on search, section, and risk status
  const filteredStudents = useMemo(() => {
    return STATIC_STUDENTS.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.mentor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = selectedSection === 'ALL' || st.section === selectedSection;
      const matchesCategory = selectedCategory === 'ALL' || st.category === selectedCategory;
      return matchesSearch && matchesSection && matchesCategory;
    });
  }, [searchQuery, selectedSection, selectedCategory]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden">
      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1 transition-all ${portal.badgeColor}`}>
            <PortalIcon className="w-3.5 h-3.5" />
            <span>{portal.badge}</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
            {portal.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {portal.subtitle}
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@edupulse.local"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              1-Click Demo Accounts
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('student1@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-bold rounded-xl border border-indigo-200 dark:border-gray-800 bg-indigo-50 dark:bg-gray-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Student 1</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('teacher.sarah@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-bold rounded-xl border border-teal-200 dark:border-gray-800 bg-teal-50 dark:bg-gray-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('admin@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-bold rounded-xl border border-rose-200 dark:border-gray-800 bg-rose-50 dark:bg-gray-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Admin</span>
            </button>
          </div>

          {/* Interactive Modal Launcher for All 50 Students & 3 Teachers */}
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-indigo-300/80 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Select from all 50 Students & 3 Teachers</span>
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            New student?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:underline">
              &larr; Back to Portal Selection
            </Link>
          </p>
        </div>
      </div>

      {/* Interactive 50-Student & Teacher Demo Account Selector Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 truncate">
                    EduPulse Interactive Demo Persona Selector
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Instant 1-click login into any student, teacher, or admin account (Password: <code className="text-indigo-600 dark:text-indigo-400 font-semibold">Password@123</code>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Role Tabs */}
            <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setDemoTab('STUDENTS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  demoTab === 'STUDENTS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>50 Students</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${demoTab === 'STUDENTS' ? 'bg-indigo-700 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                  {filteredStudents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoTab('TEACHERS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  demoTab === 'TEACHERS'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>4 Teachers (Mentors)</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${demoTab === 'TEACHERS' ? 'bg-teal-700 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                  4
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoTab('ADMIN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  demoTab === 'ADMIN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Administrator</span>
              </button>
            </div>

            {/* Students View Filters */}
            {demoTab === 'STUDENTS' && (
              <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student name, email, or mentor..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Section selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {['ALL', 'Section D (Live Demo)', 'Section A', 'Section B', 'Section C'].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedSection(sec)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          selectedSection === sec
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {sec === 'ALL' ? 'All Sections' : sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk / Status Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
                  {[
                    { id: 'ALL', label: 'All (60)' },
                    { id: 'DEMO', label: '✨ Live Demo (Fresh 10)' },
                    { id: 'HIGH', label: '🟢 High Achiever (>85%)' },
                    { id: 'MODERATE', label: '🟡 Steady Progress' },
                    { id: 'AT_RISK', label: '🔴 At-Risk (Needs Remedial)' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Body Container */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[56vh] space-y-3">
              {/* STUDENTS TAB */}
              {demoTab === 'STUDENTS' && (
                <>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700" />
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No students found matching your criteria</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSection('ALL');
                          setSelectedCategory('ALL');
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {filteredStudents.map((st) => {
                        const isHigh = st.category === 'HIGH';
                        const isRisk = st.category === 'AT_RISK';
                        const isDemo = st.category === 'DEMO';

                        const badgeClass = isDemo
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : isHigh
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : isRisk
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

                        const avatarClass = isDemo
                          ? 'bg-purple-600 text-white'
                          : isHigh
                          ? 'bg-emerald-600 text-white'
                          : isRisk
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white';

                        return (
                          <div
                            key={st.email}
                            onClick={() => quickLogin(st.email, 'Password@123')}
                            className="group p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarClass}`}>
                                  {st.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                    {st.name}
                                  </h4>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                                    {st.email}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badgeClass}`}>
                                {isDemo ? '✨ Fresh Demo' : isHigh ? 'Top Ranker' : isRisk ? 'At-Risk' : 'Steady'}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {st.section}
                              </span>
                              <div className="flex items-center gap-2">
                                <span>Att: <strong className={isDemo ? 'text-purple-600 dark:text-purple-400 font-bold' : isRisk ? 'text-rose-600' : 'text-gray-900 dark:text-gray-200'}>{st.attendance}</strong></span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                                  Login &rarr;
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* TEACHERS TAB */}
              {demoTab === 'TEACHERS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATIC_TEACHERS.map((tc) => (
                    <div
                      key={tc.email}
                      onClick={() => quickLogin(tc.email, 'Password@123')}
                      className={`group p-5 rounded-2xl border bg-white dark:bg-gray-900 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        tc.atRiskCount === 0
                          ? 'border-purple-200 dark:border-purple-800/80 hover:border-purple-400 dark:hover:border-purple-500'
                          : 'border-gray-200 dark:border-gray-800 hover:border-teal-400 dark:hover:border-teal-600'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold ${tc.atRiskCount === 0 ? 'bg-purple-600' : 'bg-teal-600'}`}>
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            tc.atRiskCount === 0
                              ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                          }`}>
                            {tc.atRiskCount === 0 ? '✨ Live Demo Lead' : 'Class Lead'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {tc.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {tc.email}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{tc.section}</span>
                            <span>{tc.cohortSize}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            <strong>Subjects:</strong> {tc.subjects.join(', ')}
                          </p>
                        </div>

                        {tc.atRiskCount === 0 ? (
                          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2">
                            <Sparkles className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                            <span><strong>Clean Slate:</strong> Ready for on-spot upload & quiz demo</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span><strong>{tc.atRiskCount} At-Risk Students</strong> queued in remedial queue</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          tc.atRiskCount === 0
                            ? 'bg-purple-600 group-hover:bg-purple-700'
                            : 'bg-teal-600 group-hover:bg-teal-700'
                        }`}
                      >
                        <span>Sign in as {tc.name.split(' ')[1]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ADMIN TAB */}
              {demoTab === 'ADMIN' && (
                <div className="max-w-md mx-auto p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center space-y-5">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Dr. Robert Vance (Institutional Administrator)
                    </h4>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      admin@edupulse.local
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Full campus governance access: oversees all 50 student profiles, 3 faculty class leads, 5 course syllabi, student roster assignments, audit log monitoring, and live test email dispatches.
                  </p>

                  <button
                    type="button"
                    onClick={() => quickLogin('admin@edupulse.local', 'Password@123')}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Sign in as Institutional Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                All 54 demo accounts pre-seeded with active academic records
              </span>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

