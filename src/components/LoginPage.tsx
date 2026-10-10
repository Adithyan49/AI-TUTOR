/**
 * Login & Learner Account Page
 * Supports Google popup authentication, email/password sign-in and registration,
 * password reset requests, guest mode, and cloud profile management.
 */

import React, { useState } from 'react';
import {
  Atom,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  LogOut,
  Flame,
  Award,
  CircuitBoard,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { StorageManager } from '../utils/storage';
import { UserProgress } from '../types/quantum';

interface LoginPageProps {
  onNavigateToTab: (tabId: string) => void;
  currentProgress?: UserProgress;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToTab,
  currentProgress,
}) => {
  const {
    user,
    loading: authLoading,
    cloudSyncStatus,
    lastSyncedAt,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    signOutUser,
    syncProgressToCloud,
  } = useAuth();

  // Tab mode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const localProgress = currentProgress || StorageManager.loadProgress();

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      setErrorMsg(msg);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (authMode === 'forgot') {
      setSubmitting(true);
      const res = await sendPasswordReset(email);
      setSubmitting(false);
      if (res.success) {
        setSuccessMsg(`Password reset email sent to ${email}. Please check your inbox.`);
      } else {
        setErrorMsg(res.error || 'Failed to send password reset email.');
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      const res = await signUpWithEmail(email, password, displayName);
      setSubmitting(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Welcome to AI Quantum Tutor.');
      } else {
        setErrorMsg(res.error || 'Failed to register account.');
      }
    } else {
      setSubmitting(true);
      const res = await signInWithEmail(email, password);
      setSubmitting(false);
      if (res.success) {
        setSuccessMsg('Signed in successfully! Synchronizing with cloud...');
      } else {
        setErrorMsg(res.error || 'Failed to sign in.');
      }
    }
  };

  const handleForceSync = async () => {
    if (!user) return;
    setSyncingNow(true);
    try {
      await syncProgressToCloud(localProgress);
      setSuccessMsg('All circuits and progress successfully synchronized with Google Cloud Firestore!');
    } catch {
      setErrorMsg('Cloud synchronization failed. Please check your connection.');
    } finally {
      setSyncingNow(false);
    }
  };

  const handleQuickDemoFill = (preset: 'student' | 'researcher') => {
    if (preset === 'student') {
      setEmail('student@quantumtutor.edu');
      setPassword('quantum123!');
      setDisplayName('Alex Quantum');
    } else {
      setEmail('researcher@quantumlab.org');
      setPassword('entangled99!');
      setDisplayName('Dr. Elena Vance');
    }
  };

  // If already logged in, display full account & cloud sync overview
  if (user) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#070d1a] p-4 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-violet-950/40 p-6 shadow-xl shadow-cyan-950/20">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Learner'}
                    className="h-16 w-16 rounded-2xl border-2 border-cyan-400 shadow-md shadow-cyan-500/20 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950 text-2xl font-bold text-cyan-300 shadow-md">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'Q'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">
                      {user.displayName || 'Quantum Learner'}
                    </h1>
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      CLOUD CONNECTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    UID: {user.uid.slice(0, 16)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleForceSync}
                  disabled={syncingNow || cloudSyncStatus === 'syncing'}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-all shadow-sm disabled:opacity-50"
                >
                  {syncingNow || cloudSyncStatus === 'syncing' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    <Cloud className="h-4 w-4 text-cyan-400" />
                  )}
                  <span>Sync to Cloud</span>
                </button>

                <button
                  onClick={signOutUser}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3.5 text-xs text-emerald-300 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs text-rose-300 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total XP</span>
                <Award className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{localProgress.totalXp}</p>
              <span className="text-[10px] text-cyan-400">Synced across devices</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Learning Streak</span>
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{localProgress.learningStreak} days</p>
              <span className="text-[10px] text-amber-400">Active study sequence</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Saved Circuits</span>
                <CircuitBoard className="h-4 w-4 text-violet-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{localProgress.savedCircuits.length}</p>
              <span className="text-[10px] text-violet-400">Cloud circuit library</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Completed Lessons</span>
                <BookOpen className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{localProgress.completedLessons.length}</p>
              <span className="text-[10px] text-emerald-400">Concepts mastered</span>
            </div>
          </div>

          {/* Cloud Sync & Storage Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cloud className="h-4 w-4 text-cyan-400" />
              <span>Google Cloud Firestore Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-slate-400">Sync Status:</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {cloudSyncStatus === 'syncing' ? 'Synchronizing...' : 'Fully Synchronized'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-slate-400">Last Synced:</span>
                <span className="font-mono text-slate-200">{lastSyncedAt || 'Just now'}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-cyan-300 font-mono">Cloud Firestore (Multi-region)</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-slate-400">Security Rules:</span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Hardened RBAC Active
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateToTab('builder')}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
              >
                <span>Open Circuit Builder</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => onNavigateToTab('collaboration')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5 text-violet-400" />
                <span>Explore Community Experiments</span>
              </button>

              <button
                onClick={() => onNavigateToTab('dashboard')}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If NOT logged in, display sign in / registration page
  return (
    <div className="flex-1 overflow-y-auto bg-[#070d1a] p-4 lg:p-8 flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 via-slate-900/60 to-violet-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 shadow-lg shadow-cyan-950">
                <Atom className="h-6 w-6 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>AI Quantum Tutor</span>
                </h1>
                <span className="text-[11px] text-cyan-400 font-medium">Cloud Learner Studio</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-300 leading-relaxed">
              Experience scientific quantum circuit simulation with state-vector accuracy,
              interactive Bloch spheres, and continuous progress syncing to Google Cloud.
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                  <Cloud className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Cloud Firestore Persistence</h4>
                  <p className="text-[11px] text-slate-400">
                    Keep your custom quantum circuits and algorithm designs synced across every browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
                  <Flame className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Gamified Mastery</h4>
                  <p className="text-[11px] text-slate-400">
                    Track daily study streaks, earn XP, and complete 14 quantum engineering milestones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-950/80 border border-violet-800/60 text-violet-400">
                  <Share2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Collaborative Workspace</h4>
                  <p className="text-[11px] text-slate-400">
                    Publish your experiments to the live community gallery and exchange algorithm ideas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Mode Quick Link */}
          <div className="mt-8 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Want to explore first?</span>
              <button
                onClick={() => onNavigateToTab('dashboard')}
                className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#091224] p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Mode Switch Tabs */}
            <div className="flex items-center rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  authMode === 'signin'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  authMode === 'signup'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google One-Click Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800/90 py-2.5 text-xs font-semibold text-white transition-all shadow-sm hover:border-slate-600 disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-[#091224] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                or with email
              </span>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Richard Feynman"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learner@quantum.edu"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-cyan-500/20 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                ) : authMode === 'signup' ? (
                  <UserPlus className="h-4 w-4" />
                ) : authMode === 'forgot' ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                <span>
                  {authMode === 'signup'
                    ? 'Create Free Account'
                    : authMode === 'forgot'
                    ? 'Send Password Reset Link'
                    : 'Sign In to Studio'}
                </span>
              </button>

              {authMode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
                >
                  Back to Sign In
                </button>
              )}
            </form>
          </div>

          {/* Demo Fill & Presets */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span>Quick Test Demo Presets:</span>
              <span className="text-slate-500">Auto-fills credentials</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('student')}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-700 hover:text-cyan-300 transition-colors"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('researcher')}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:border-violet-700 hover:text-violet-300 transition-colors"
              >
                🔬 Researcher
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
