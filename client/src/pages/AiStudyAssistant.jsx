import React, { useEffect, useState, useRef } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Bot, User, Send, Plus, Trash2, Sparkles, Shield, AlertCircle } from 'lucide-react';

export const AiStudyAssistant = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadSessions();
  }, []);

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

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const newSessionRes = await studentApi.createChatSession(inputText.trim().substring(0, 25));
      targetSessionId = newSessionRes.data.id;
      setSessions([newSessionRes.data, ...sessions]);
      setActiveSessionId(targetSessionId);
    }

    const userText = inputText.trim();
    setInputText('');

    // Optimistic user message update
    const optimisticMsg = {
      id: Date.now(),
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);

    try {
      const res = await studentApi.sendChatMessage(targetSessionId, userText);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
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

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-indigo-900">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Personalized Context Active:</strong> The assistant reviews your live topic mastery (<code className="font-mono bg-white px-1 py-0.5 rounded text-indigo-700">pKnown</code>) and quiz attempts to customize explanations. Chats are private to your student ID.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex h-[680px]">
        {/* Left Sidebar: Saved Sessions */}
        <div className="w-72 border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 bg-slate-50/50">
          <div className="space-y-3">
            <button
              onClick={handleCreateSession}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100"
            >
              <Plus className="w-4 h-4" /> New Study Chat
            </button>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 pt-2">
              Previous Conversations
            </span>

            <div className="space-y-1 overflow-y-auto max-h-[500px]">
              {loadingSessions ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading chats...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No previous chats yet.</div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      activeSessionId === s.id
                        ? 'bg-indigo-100/70 text-indigo-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded transition-opacity"
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
        <div className="flex-1 flex flex-col justify-between bg-white">
          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && !loadingMessages ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">How can I help you study today?</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Ask me to explain difficult algorithms, clarify misconceptions from your recent quizzes, or break down foundational prerequisites.
                  </p>
                </div>

                {/* Suggested Prompt Chips */}
                <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
                  <button
                    onClick={() => handleSuggestedPrompt('Why is search in an unbalanced BST O(n)?')}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🌲 Why is search in an unbalanced BST O(n)?
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('What are my identified weak topics and how should I practice?')}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🎯 What are my current weak topics?
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('Explain 3NF database normalization with a clear college example.')}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🗄️ Explain 3NF database normalization
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'USER';
                return (
                  <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-wrap ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span>Synthesizing pedagogical explanation...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about your courses, topics, or quiz errors..."
              className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer shadow-sm shadow-indigo-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
