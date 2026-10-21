import React, { useState, useEffect } from 'react';
import { Github, Code2, Award, RefreshCw, Unlink, ExternalLink, CheckCircle, AlertTriangle, AlertCircle, Edit3, Save, X, Clock, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ConnectedAccounts = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);

  // Connection input states
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [hackerrankUsername, setHackerrankUsername] = useState('');

  // Manual entry modal state
  const [manualModal, setManualModal] = useState(null); // 'GITHUB' | 'LEETCODE' | 'HACKERRANK' | null
  const [manualForm, setManualForm] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/external-profiles');
      if (res.data?.success && res.data.data) {
        setProfiles(res.data.data);
        res.data.data.forEach((p) => {
          if (p.platform === 'GITHUB') setGithubUsername(p.username);
          if (p.platform === 'LEETCODE') setLeetcodeUsername(p.username);
          if (p.platform === 'HACKERRANK') setHackerrankUsername(p.username);
        });
      }
    } catch (err) {
      console.error('Failed to load external profiles:', err);
      setNotification({ type: 'error', message: 'Could not load connected accounts.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform, username) => {
    if (!username.trim()) {
      setNotification({ type: 'error', message: `Please enter a valid ${platform} username.` });
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [platform]: 'connect' }));
      const res = await api.post('/student/external-profiles/link', { platform, username: username.trim() });
      if (res.data?.success) {
        setNotification({ type: 'success', message: `${platform} connected and synced successfully!` });
        fetchProfiles();
      }
    } catch (err) {
      setNotification({ type: 'error', message: `Failed to connect ${platform} account.` });
    } finally {
      setActionLoading((prev) => ({ ...prev, [platform]: null }));
    }
  };

  const handleForceRefresh = async (platform) => {
    try {
      setActionLoading((prev) => ({ ...prev, [platform]: 'sync' }));
      const res = await api.post(`/student/external-profiles/sync/${platform}?force=true`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: `${platform} stats refreshed!` });
        fetchProfiles();
      }
    } catch (err) {
      setNotification({ type: 'error', message: `Failed to refresh ${platform} stats. You can use manual entry if the provider is unavailable.` });
    } finally {
      setActionLoading((prev) => ({ ...prev, [platform]: null }));
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform}?`)) return;

    try {
      setActionLoading((prev) => ({ ...prev, [platform]: 'disconnect' }));
      const res = await api.delete(`/student/external-profiles/${platform}`);
      if (res.data?.success) {
        setNotification({ type: 'success', message: `${platform} disconnected.` });
        if (platform === 'GITHUB') setGithubUsername('');
        if (platform === 'LEETCODE') setLeetcodeUsername('');
        if (platform === 'HACKERRANK') setHackerrankUsername('');
        fetchProfiles();
      }
    } catch (err) {
      setNotification({ type: 'error', message: `Failed to disconnect ${platform}.` });
    } finally {
      setActionLoading((prev) => ({ ...prev, [platform]: null }));
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manualModal) return;

    try {
      setActionLoading((prev) => ({ ...prev, [manualModal]: 'manual' }));
      const payload = {
        platform: manualModal,
        ...manualForm,
      };
      const res = await api.post('/student/external-profiles/manual', payload);
      if (res.data?.success) {
        setNotification({ type: 'success', message: `Manual ${manualModal} statistics saved successfully.` });
        setManualModal(null);
        fetchProfiles();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to save manual statistics.' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [manualModal]: null }));
    }
  };

  const getProfileByPlatform = (platform) => {
    return profiles.find((p) => p.platform === platform) || null;
  };

  const parseSnapshot = (snapshotJson) => {
    if (!snapshotJson) return null;
    try {
      return JSON.parse(snapshotJson);
    } catch (e) {
      return null;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'LIVE_API':
        return <Badge variant="success" size="sm">Live Public API</Badge>;
      case 'MANUAL_ENTRY':
        return <Badge variant="info" size="sm">Manually Entered</Badge>;
      case 'CACHED_SNAPSHOT':
        return <Badge variant="warning" size="sm">Cached Snapshot</Badge>;
      case 'DEMO_SYNC':
      default:
        return <Badge variant="default" size="sm">Demo Telemetry</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <RefreshCw className="w-10 h-10 text-academic-blue animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading connected portfolios...</p>
      </div>
    );
  }

  const ghProfile = getProfileByPlatform('GITHUB');
  const ghStats = parseSnapshot(ghProfile?.snapshotJson);

  const lcProfile = getProfileByPlatform('LEETCODE');
  const lcStats = parseSnapshot(lcProfile?.snapshotJson);

  const hrProfile = getProfileByPlatform('HACKERRANK');
  const hrStats = parseSnapshot(hrProfile?.snapshotJson);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Connected Coding Portfolios</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Link your GitHub, LeetCode, and HackerRank profiles to showcase extracurricular coding rigor alongside your academic telemetry.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Policy Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-3 leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-academic-blue flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900 dark:text-gray-200 font-semibold">Privacy &amp; Fair Grading Notice:</strong> Coding portfolio telemetry is strictly auxiliary. It is never used to automatically penalize academic grades or override topic mastery calculated by the Bayesian Knowledge Tracing engine.
        </div>
      </div>

      {/* 3 Dedicated Provider Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* CARD 1: GITHUB */}
        <Card hover={true}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-gray-800 text-white flex items-center justify-center font-bold">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">GitHub Developer Profile</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Repositories, followers, and language footprint</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ghProfile ? (
                <>
                  <Badge variant="success">Connected</Badge>
                  {getSourceBadge(ghStats?.source)}
                </>
              ) : (
                <Badge variant="default">Not Connected</Badge>
              )}
            </div>
          </div>

          {ghProfile && ghStats ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800">
                {ghStats.avatarUrl ? (
                  <img src={ghStats.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg">
                    {ghProfile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-50">{ghProfile.username}</span>
                    <a
                      href={ghStats.profileUrl || `https://github.com/${ghProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-academic-blue hover:underline inline-flex items-center gap-0.5"
                    >
                      View on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {ghStats.bio && <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{ghStats.bio}"</p>}
                  <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="w-3 h-3" /> Last Synced: {new Date(ghProfile.lastSyncedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40">
                  <p className="text-2xl font-black text-gray-900 dark:text-gray-50">{ghStats.publicRepos ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Public Repos</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40">
                  <p className="text-2xl font-black text-gray-900 dark:text-gray-50">{ghStats.followers ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Followers</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40">
                  <p className="text-2xl font-black text-gray-900 dark:text-gray-50">{ghStats.following ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Following</p>
                </div>
              </div>

              {/* Languages */}
              {ghStats.topLanguages && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-gray-500">Top Languages:</span>
                  {ghStats.topLanguages.map((lang) => (
                    <span key={lang} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono">
                      {lang}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    loading={actionLoading.GITHUB === 'sync'}
                    onClick={() => handleForceRefresh('GITHUB')}
                  >
                    Force Live Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      setManualModal('GITHUB');
                      setManualForm({
                        publicRepos: ghStats.publicRepos || 0,
                        followers: ghStats.followers || 0,
                        following: ghStats.following || 0,
                        bio: ghStats.bio || '',
                      });
                    }}
                  >
                    Manual Override
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  icon={Unlink}
                  loading={actionLoading.GITHUB === 'disconnect'}
                  onClick={() => handleDisconnect('GITHUB')}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Github className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="Enter GitHub username (e.g. torvalds)"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-academic-blue"
                  />
                </div>
                <Button
                  variant="primary"
                  loading={actionLoading.GITHUB === 'connect'}
                  onClick={() => handleConnect('GITHUB', githubUsername)}
                >
                  Connect &amp; Fetch Stats
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Connects directly to the unauthenticated public GitHub REST API.
              </p>
            </div>
          )}
        </Card>

        {/* CARD 2: LEETCODE */}
        <Card hover={true}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">LeetCode Competitive Problem Solving</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total solved questions, difficulty tiers, and ranking</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lcProfile ? (
                <>
                  <Badge variant="success">Connected</Badge>
                  {getSourceBadge(lcStats?.source)}
                </>
              ) : (
                <Badge variant="default">Not Connected</Badge>
              )}
            </div>
          </div>

          {lcProfile && lcStats ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-50">{lcProfile.username}</span>
                    <a
                      href={lcStats.profileUrl || `https://leetcode.com/${lcProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-academic-blue hover:underline inline-flex items-center gap-0.5"
                    >
                      View on LeetCode <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="w-3 h-3" /> Last Synced: {new Date(lcProfile.lastSyncedAt).toLocaleString()}
                  </p>
                </div>

                {lcStats.ranking && (
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Global Rank:</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-50">#{lcStats.ranking.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Solved Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40">
                  <p className="text-2xl font-black text-gray-900 dark:text-gray-50">{lcStats.totalSolved ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Total Solved</p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{lcStats.easySolved ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mt-0.5">Easy</p>
                </div>
                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30">
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{lcStats.mediumSolved ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mt-0.5">Medium</p>
                </div>
                <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30">
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{lcStats.hardSolved ?? '—'}</p>
                  <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mt-0.5">Hard</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    loading={actionLoading.LEETCODE === 'sync'}
                    onClick={() => handleForceRefresh('LEETCODE')}
                  >
                    Force Live Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      setManualModal('LEETCODE');
                      setManualForm({
                        totalSolved: lcStats.totalSolved || 0,
                        easySolved: lcStats.easySolved || 0,
                        mediumSolved: lcStats.mediumSolved || 0,
                        hardSolved: lcStats.hardSolved || 0,
                        acceptanceRate: lcStats.acceptanceRate || 65.0,
                        ranking: lcStats.ranking || 100000,
                      });
                    }}
                  >
                    Manual Override
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  icon={Unlink}
                  loading={actionLoading.LEETCODE === 'disconnect'}
                  onClick={() => handleDisconnect('LEETCODE')}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Code2 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="Enter LeetCode username"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <Button
                  variant="primary"
                  loading={actionLoading.LEETCODE === 'connect'}
                  onClick={() => handleConnect('LEETCODE', leetcodeUsername)}
                >
                  Connect &amp; Fetch Stats
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Fetches your publicly solved questions breakdown via public LeetCode GraphQL statistics.
              </p>
            </div>
          )}
        </Card>

        {/* CARD 3: HACKERRANK */}
        <Card hover={true}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">HackerRank Certifications &amp; Badges</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verified domain certifications and problem solving badges</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hrProfile ? (
                <>
                  <Badge variant="success">Connected</Badge>
                  {getSourceBadge(hrStats?.source)}
                </>
              ) : (
                <Badge variant="default">Not Connected</Badge>
              )}
            </div>
          </div>

          {hrProfile && hrStats ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-50">{hrProfile.username}</span>
                    <a
                      href={hrStats.profileUrl || `https://www.hackerrank.com/${hrProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-academic-blue hover:underline inline-flex items-center gap-0.5"
                    >
                      View on HackerRank <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="w-3 h-3" /> Last Synced: {new Date(hrProfile.lastSyncedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Badges & Certs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Earned Skill Badges</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(hrStats.badges || ['Problem Solving (Gold)', 'Java (Silver)']).map((badge) => (
                      <span key={badge} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                        ★ {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Certificates</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(hrStats.certificates || ['Problem Solving (Basic)', 'Java (Basic)']).map((cert) => (
                      <span key={cert} className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      setManualModal('HACKERRANK');
                      setManualForm({
                        badges: (hrStats.badges || []).join(', '),
                        certificates: (hrStats.certificates || []).join(', '),
                      });
                    }}
                  >
                    Manual Override
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  icon={Unlink}
                  loading={actionLoading.HACKERRANK === 'disconnect'}
                  onClick={() => handleDisconnect('HACKERRANK')}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Award className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={hackerrankUsername}
                    onChange={(e) => setHackerrankUsername(e.target.value)}
                    placeholder="Enter HackerRank username"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  variant="primary"
                  loading={actionLoading.HACKERRANK === 'connect'}
                  onClick={() => handleConnect('HACKERRANK', hackerrankUsername)}
                >
                  Connect &amp; Fetch Stats
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Links verified skill certificates and algorithmic domain badges.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Manual Entry Modal Dialog */}
      {manualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-academic-darkCard border border-gray-200 dark:border-academic-darkBorder rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                Manual Override: {manualModal}
              </h3>
              <button
                onClick={() => setManualModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              When public platform APIs are rate-limited or unavailable, enter your verified public statistics below. They will be explicitly tagged as <strong>MANUALLY ENTERED</strong>.
            </p>

            <form onSubmit={handleSaveManual} className="space-y-4">
              {manualModal === 'GITHUB' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Public Repos</label>
                    <input
                      type="number"
                      required
                      value={manualForm.publicRepos || 0}
                      onChange={(e) => setManualForm({ ...manualForm, publicRepos: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Followers</label>
                    <input
                      type="number"
                      required
                      value={manualForm.followers || 0}
                      onChange={(e) => setManualForm({ ...manualForm, followers: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {manualModal === 'LEETCODE' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Total Solved</label>
                    <input
                      type="number"
                      required
                      value={manualForm.totalSolved || 0}
                      onChange={(e) => setManualForm({ ...manualForm, totalSolved: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-600 mb-1">Easy</label>
                      <input
                        type="number"
                        value={manualForm.easySolved || 0}
                        onChange={(e) => setManualForm({ ...manualForm, easySolved: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-600 mb-1">Medium</label>
                      <input
                        type="number"
                        value={manualForm.mediumSolved || 0}
                        onChange={(e) => setManualForm({ ...manualForm, mediumSolved: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-rose-600 mb-1">Hard</label>
                      <input
                        type="number"
                        value={manualForm.hardSolved || 0}
                        onChange={(e) => setManualForm({ ...manualForm, hardSolved: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {manualModal === 'HACKERRANK' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Badges (comma separated)</label>
                    <input
                      type="text"
                      value={manualForm.badges || ''}
                      onChange={(e) => setManualForm({ ...manualForm, badges: e.target.value.split(',').map((s) => s.trim()) })}
                      placeholder="Problem Solving (Gold), Java (Silver)"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" size="sm" onClick={() => setManualModal(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" icon={Save}>Save Manual Override</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
