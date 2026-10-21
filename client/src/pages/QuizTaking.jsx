import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { studentApi } from '../api/client';
import { Clock, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const QuizTaking = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(location.state?.quizData || null);
  const [loading, setLoading] = useState(!location.state?.quizData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // qId -> chosenIndex
  const [timeTaken, setTimeTaken] = useState({}); // qId -> seconds
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const questionStartTime = useRef(Date.now());

  // Load quiz attempt data if not passed in state
  useEffect(() => {
    if (!quizData) {
      studentApi.startQuizAttempt(quizId)
        .then((res) => {
          if (res.success) {
            setQuizData(res.data);
            setTimeLeft((res.data.timeLimitMinutes || 20) * 60);
          }
        })
        .catch((err) => {
          alert('Could not start quiz: ' + err.message);
          navigate('/student/quizzes');
        })
        .finally(() => setLoading(false));
    } else {
      setTimeLeft((quizData.timeLimitMinutes || 20) * 60);
    }
  }, [quizId]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const recordTimeForCurrentQuestion = () => {
    const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
    const currentQ = quizData?.questions?.[currentIndex];
    if (currentQ) {
      setTimeTaken((prev) => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + elapsed,
      }));
    }
    questionStartTime.current = Date.now();
  };

  const handleSelectOption = (chosenIdx) => {
    const currentQ = quizData?.questions?.[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: chosenIdx,
    }));
  };

  const handleNext = () => {
    recordTimeForCurrentQuestion();
    if (currentIndex < (quizData?.questions?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    recordTimeForCurrentQuestion();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpTo = (index) => {
    recordTimeForCurrentQuestion();
    setCurrentIndex(index);
  };

  const handleAutoSubmit = () => {
    alert('Time limit expired! Your answers are being submitted automatically.');
    performSubmission();
  };

  const performSubmission = async () => {
    recordTimeForCurrentQuestion();
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await studentApi.submitQuizAttempt(quizData.attemptId, answers, timeTaken);
      if (res.success) {
        navigate(`/student/attempts/${quizData.attemptId}/result`, { state: { evaluation: res.data } });
      }
    } catch (err) {
      alert(err.message || 'Error submitting attempt.');
      setSubmitting(false);
    }
  };

  if (loading || !quizData) {
    return <LoadingSpinner size="lg" text="Preparing quiz session..." />;
  }

  const questions = quizData.questions || [];
  const currentQ = questions[currentIndex];
  const isAnswered = (qId) => answers[qId] !== undefined;

  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header with Timer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {quizData.subjectName}
          </span>
          <h1 className="text-xl font-bold text-slate-900">{quizData.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm font-bold border ${
              timeLeft < 300
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Submit Quiz
          </button>
        </div>
      </div>

      {/* Question Navigator Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase mr-2 shrink-0">Questions:</span>
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => handleJumpTo(idx)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              idx === currentIndex
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                : isAnswered(q.id)
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">
          Answered: {answeredCount} / {questions.length}
        </span>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                {currentQ.topicName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          <p className="text-base font-semibold text-slate-900 leading-relaxed">
            {currentQ.text}
          </p>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((option, optIdx) => {
              const isSelected = answers[currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                Review & Submit <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Confirm Submission?</h2>
            </div>

            <p className="text-sm text-slate-600">
              You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
              Once submitted, your responses will be evaluated and your topic mastery will be updated.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={performSubmission}
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                {submitting ? 'Scoring...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
