import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle, RotateCcw, Sliders, Brain, Mail, ShieldAlert, Cpu } from 'lucide-react';
import api from '../services/api';

export const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    'bkt.mastery.threshold': '0.85',
    'bkt.remediation.threshold': '0.60',
    'ai.provider.order': 'GEMINI,GROQ,OLLAMA,OFFLINE',
    'risk.low_score.threshold': '50.0',
    'risk.attendance.threshold': '75.0',
    'risk.inactive_days.threshold': '7',
    'email.summary.cron': '0 0 6 * * MON',
    'privacy.retention_days': '365'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data.data) {
        const map = { ...settings };
        res.data.data.forEach((s) => {
          map[s.configKey] = s.configValue;
        });
        setSettings(map);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/settings/batch', settings);
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Platform configuration settings updated successfully.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update platform settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      'bkt.mastery.threshold': '0.85',
      'bkt.remediation.threshold': '0.60',
      'ai.provider.order': 'GEMINI,GROQ,OLLAMA,OFFLINE',
      'risk.low_score.threshold': '50.0',
      'risk.attendance.threshold': '75.0',
      'risk.inactive_days.threshold': '7',
      'email.summary.cron': '0 0 6 * * MON',
      'privacy.retention_days': '365'
    });
    setNotification({ type: 'success', message: 'Reset settings to default parameters. Click "Save Configuration" to apply.' });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Configuration & System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fine-tune Bayesian Knowledge Tracing hyperparameters, AI fallback prioritization, and risk classification thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Bayesian Knowledge Tracing Hyperparameters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Adaptive Learning (BKT) Hyperparameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Concept Mastery Threshold (0.50 - 0.99)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.50"
                max="0.99"
                value={settings['bkt.mastery.threshold']}
                onChange={(e) => handleChange('bkt.mastery.threshold', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Topic is classified as MASTERED when P(L_n) reaches this level.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Remediation Alert Threshold (0.20 - 0.70)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.20"
                max="0.70"
                value={settings['bkt.remediation.threshold']}
                onChange={(e) => handleChange('bkt.remediation.threshold', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers prerequisite review recommendation when P(L_n) drops below this.</p>
            </div>
          </div>
        </div>

        {/* Section 2: AI Provider Fallback Cascade */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-bold text-slate-900">Generative AI Provider Priority Sequence</h2>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Cascade Order (Comma-separated)
            </label>
            <input
              type="text"
              value={settings['ai.provider.order']}
              onChange={(e) => handleChange('ai.provider.order', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Default: <code className="font-mono text-slate-700">GEMINI,GROQ,OLLAMA,OFFLINE</code>. The system automatically falls back to the next available provider if upstream API limits or network issues occur.
            </p>
          </div>
        </div>

        {/* Section 3: Machine Learning & Risk Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">At-Risk Prediction Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Low Quiz Score Alert (%)
              </label>
              <input
                type="number"
                step="1"
                min="30"
                max="80"
                value={settings['risk.low_score.threshold']}
                onChange={(e) => handleChange('risk.low_score.threshold', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Scores below this trigger high-risk flags.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Minimum Attendance (%)
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max="90"
                value={settings['risk.attendance.threshold']}
                onChange={(e) => handleChange('risk.attendance.threshold', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Attendance below this flags academic risk.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Inactivity Warning (Days)
              </label>
              <input
                type="number"
                step="1"
                min="2"
                max="30"
                value={settings['risk.inactive_days.threshold']}
                onChange={(e) => handleChange('risk.inactive_days.threshold', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Days without activity before alert.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Email Schedule & Retention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Email Digest Schedule & Data Retention</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Weekly Summary Cron Expression
              </label>
              <input
                type="text"
                value={settings['email.summary.cron']}
                onChange={(e) => handleChange('email.summary.cron', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: <code className="font-mono text-slate-700">0 0 6 * * MON</code> (Monday 6:00 AM)</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Data Retention Window (Days)
              </label>
              <input
                type="number"
                step="30"
                min="90"
                max="1095"
                value={settings['privacy.retention_days']}
                onChange={(e) => handleChange('privacy.retention_days', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Institutional archive retention period.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Platform Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
