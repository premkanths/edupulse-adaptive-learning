import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, MessageSquare, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/client';
import { MarkdownRenderer } from './MarkdownRenderer';

export const FloatingChatWidget = () => {
  const { role } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ASSISTANT',
      content: 'Hello! I am J.A.R.V.I.S., your adaptive AI study assistant. At your service—ask me anything from your course materials and weak topics, or any programming, algorithms, and technical concepts beyond your notes!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Hide widget if not a student, or if currently viewing dedicated full-screen AI pages
  if (role !== 'STUDENT' || location.pathname === '/student/assistant' || location.pathname === '/student/chat' || location.pathname === '/student/ai-summary') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'USER', content: userText }]);
    setLoading(true);

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const sRes = await studentApi.createChatSession(userText.substring(0, 25));
        currentSessionId = sRes.data.id;
        setSessionId(currentSessionId);
      }

      const res = await studentApi.sendChatMessage(currentSessionId, userText);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ASSISTANT', content: 'Apologies, I encountered an issue: ' + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40">
      {!isOpen && (
        <>
          {/* Mobile Compact FAB (Circular, fits any mobile screen without cutting off) */}
          <button
            onClick={() => setIsOpen(true)}
            className="sm:hidden w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all animate-scale-up relative"
            title="Ask J.A.R.V.I.S. AI Tutor"
            aria-label="Ask J.A.R.V.I.S. AI Tutor"
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900 animate-pulse" />
          </button>

          {/* Desktop / Tablet Extended Pill */}
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 py-3 px-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/30 text-xs font-bold transition-all hover:scale-105 cursor-pointer animate-scale-up"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Ask JARVIS AI</span>
          </button>
        </>
      )}

      {isOpen && (
        <div className="fixed inset-x-2.5 bottom-2 sm:inset-auto sm:right-6 sm:bottom-6 w-auto sm:w-96 h-[80vh] sm:h-[520px] max-h-[560px] bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-up z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  J.A.R.V.I.S. AI Tutor
                  <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded-md font-extrabold uppercase tracking-wider">Online</span>
                </h3>
                <span className="text-[10px] text-indigo-100 block">Adaptive Intelligence &bull; At your service</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'USER';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-xs whitespace-pre-wrap'
                        : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {isUser ? m.content : <MarkdownRenderer content={m.content} />}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-gray-400 p-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span>J.A.R.V.I.S. is synthesizing your answer...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask J.A.R.V.I.S. a question..."
              className="flex-1 py-2 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
