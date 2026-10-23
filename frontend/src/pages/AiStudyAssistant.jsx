import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Bot, User, Send, Plus, Trash2, Sparkles, Shield, BookOpen, HelpCircle, Compass, CheckCircle, ArrowRight, History, X, MessageSquare } from 'lucide-react';

export const AiStudyAssistant = () => {
  const [searchParams] = useSearchParams();
  const queryTopic = searchParams.get('topic');
  const queryPrompt = searchParams.get('prompt');

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [tutoringMode, setTutoringMode] = useState('EXPLANATORY'); // 'EXPLANATORY' | 'SOCRATIC'
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (queryPrompt) {
      setInputText(queryPrompt);
    } else if (queryTopic) {
      setInputText(`Can you explain the core concepts of "${queryTopic}" step-by-step and help me understand where students typically make mistakes?`);
    }
  }, [queryTopic, queryPrompt]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const loadSessions = async () => {
    try {
      const res = await studentApi.getChatSessions();
      if (res.success) {
        setSessions(res.data);
        if (res.data.length > 0 && !activeSessionId) {
          setActiveSessionId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId) => {
    setLoadingMessages(true);
    try {
      const res = await studentApi.getSessionMessages(sessionId);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await studentApi.createChatSession('New Study Chat');
      if (res.success) {
        setSessions([res.data, ...sessions]);
        setActiveSessionId(res.data.id);
        setMessages([]);
      }
    } catch (err) {
      alert('Failed to create new session: ' + err.message);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      await studentApi.deleteChatSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      alert('Failed to delete session: ' + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    const userMessage = inputText.trim();
    setInputText('');

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        const newSessionRes = await studentApi.createChatSession(userMessage.substring(0, 30));
        if (newSessionRes.success) {
          currentSessionId = newSessionRes.data.id;
          setSessions([newSessionRes.data, ...sessions]);
          setActiveSessionId(currentSessionId);
        }
      } catch (err) {
        alert('Could not start a new chat: ' + err.message);
        return;
      }
    }

    const optimisticMessage = {
      id: Date.now(),
      role: 'USER',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setSending(true);

    try {
      const res = await studentApi.sendChatMessage(currentSessionId, userMessage, tutoringMode);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
      } else {
        alert(res.message || 'Error communicating with AI assistant.');
      }
    } catch (err) {
      alert(err.message || 'Error communicating with AI assistant.');
    } finally {
      setSending(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputText(prompt);
  };

  // Render message with parsed source citations
  const renderMessageContent = (content) => {
    if (!content) return null;

    const notesSplit = content.split(/---+\s*\*\*Referenced Course Notes:\*\*/i);
    const mainBody = notesSplit[0];
    const notesFooter = notesSplit.length > 1 ? notesSplit[1] : null;

    return (
      <div className="space-y-3">
        <div className="whitespace-pre-wrap">{mainBody.trim()}</div>
        {notesFooter && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grounded in Official Course Materials:</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {notesFooter.trim()}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Privacy Notice, Tutoring Mode Selector & Mobile History Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="line-clamp-2 sm:line-clamp-none">
            <strong>Dual Intelligence Active:</strong> Grounded in official course materials + answers any computer science or programming question beyond your notes.
          </span>
        </div>

        {/* Action Controls: Tutoring Mode Selector + Mobile Chats Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Mobile Chat History Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileHistory(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
            title="View previous chats"
          >
            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Chats ({sessions.length})</span>
          </button>

          {/* Tutoring Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setTutoringMode('EXPLANATORY')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                tutoringMode === 'EXPLANATORY'
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Direct Teaching</span>
            </button>
            <button
              type="button"
              onClick={() => setTutoringMode('SOCRATIC')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                tutoringMode === 'SOCRATIC'
                  ? 'bg-white dark:bg-gray-900 text-teal-600 dark:text-teal-400 font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Practice Hints</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[calc(100vh-14rem)] min-h-[550px] md:h-[680px] relative">
        {/* Backdrop for mobile drawer */}
        {showMobileHistory && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            onClick={() => setShowMobileHistory(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar: Saved Sessions (Desktop fixed, Mobile slide-in drawer) */}
        <div
          className={`${
            showMobileHistory
              ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl flex flex-col'
              : 'hidden'
          } md:flex md:static md:w-72 border-r border-gray-200 dark:border-gray-800 p-4 flex-col justify-between shrink-0 bg-gray-50 dark:bg-gray-950 transition-all`}
        >
          <div className="space-y-3">
            {/* Header on mobile */}
            <div className="flex items-center justify-between md:hidden pb-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Previous Conversations
              </span>
              <button
                type="button"
                onClick={() => setShowMobileHistory(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                handleCreateSession();
                setShowMobileHistory(false);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" /> New Study Chat
            </button>

            <span className="hidden md:block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 pt-2">
              Previous Conversations
            </span>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] md:max-h-[500px]">
              {loadingSessions ? (
                <div className="p-4 text-center text-xs text-gray-400">Loading chats...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">No previous chats yet.</div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setShowMobileHistory(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      activeSessionId === s.id
                        ? 'bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Main Chat Window */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-gray-900">
          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && !loadingMessages ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-8 space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-50">Hello, I am J.A.R.V.I.S., your AI academic tutor. How may I assist you today?</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mt-1">
                    {tutoringMode === 'SOCRATIC'
                      ? 'In Practice Hints mode, I provide guiding questions to help you solve problems independently.'
                      : 'Dual-Intelligence Tutor: Ask me anything from your official course notes, exam mistakes & weak topics—or explore any programming language, algorithm, or general academic concept beyond your curriculum!'}
                  </p>
                </div>

                {/* Suggested Prompt Chips */}
                <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-2">
                  <button
                    onClick={() => handleSuggestedPrompt('Why is search in an unbalanced BST O(n)?')}
                    className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🌲 Why is search in an unbalanced BST O(n)?
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('What are my identified weak topics and how should I practice?')}
                    className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🎯 What are my current weak topics?
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('Explain 3NF database normalization with a clear college example.')}
                    className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🗄️ Explain 3NF database normalization
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('Explain Microservices vs Monolith architecture with real-world pros and cons.')}
                    className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🏗️ Microservices vs Monolith architecture
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('How does Python handle memory management and the Global Interpreter Lock (GIL)?')}
                    className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🐍 Python memory & GIL explained
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'USER';
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xs'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20 whitespace-pre-wrap'
                          : 'bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {isUser ? m.content : renderMessageContent(m.content)}
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span>
                    {tutoringMode === 'SOCRATIC'
                      ? 'Formulating Socratic guiding questions...'
                      : 'Searching course notes & synthesizing explanation...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Redirected Focus Topic Banner */}
          {(queryTopic || queryPrompt) && (
            <div className="px-4 py-2.5 bg-indigo-50/90 dark:bg-indigo-950/70 border-t border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-200 truncate">
                  <strong className="text-indigo-900 dark:text-indigo-300 font-semibold">Recommended Study Focus:</strong> {queryTopic || 'Targeted Concept Question'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending}
                className="shrink-0 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Ask Jarvis Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                tutoringMode === 'SOCRATIC'
                  ? 'Ask a question or explain your reasoning for Socratic guidance...'
                  : 'Ask a question about your courses, topics, or quiz errors...'
              }
              className="flex-1 py-2.5 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-500/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
