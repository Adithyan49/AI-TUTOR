import React from 'react';
import {
  Atom,
  Flame,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Cpu,
  Menu,
  Cloud,
  Loader2,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Circuit } from '../types/quantum';
import { useAuth } from '../firebase/AuthContext';

interface NavbarProps {
  activeCircuit: Circuit;
  totalXp: number;
  streak: number;
  onOpenTestRunner: () => void;
  onResetCanvas: () => void;
  onRunSimulation: () => void;
  onToggleSidebar?: () => void;
  onNavigateToLogin?: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCircuit,
  totalXp,
  streak,
  onOpenTestRunner,
  onResetCanvas,
  onRunSimulation,
  onToggleSidebar,
  onNavigateToLogin,
}) => {
  const { user, signInWithGoogle, signOutUser, cloudSyncStatus, loading } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Atom className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-100">AI Quantum Tutor</span>
              <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/50">
                PRO SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Interactive Quantum Computing Platform</p>
          </div>
        </div>
      </div>

      {/* Active Circuit Quick Info */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-medium text-slate-200">{activeCircuit.name}</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-mono">{activeCircuit.numQubits} Qubits</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{activeCircuit.gates.length} Gates</span>
        </div>

        <button
          onClick={onRunSimulation}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Simulate
        </button>

        <button
          onClick={onResetCanvas}
          title="Reset circuit canvas to ground state"
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Gamification & Test Suite Launcher */}
      <div className="flex items-center gap-2.5">
        {/* Firebase Cloud Sync Status */}
        {user ? (
          <div
            className="hidden items-center gap-1.5 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-400 sm:flex"
            title={`Cloud synced to ${user.email}`}
          >
            {cloudSyncStatus === 'syncing' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            ) : (
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span className="text-[11px] font-medium">
              {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Cloud Synced'}
            </span>
          </div>
        ) : (
          <div
            className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-400 sm:flex"
            title="Local storage active. Sign in to sync across devices."
          >
            <Cloud className="h-3 w-3 text-slate-500" />
            <span>Local Mode</span>
          </div>
        )}

        <button
          onClick={onOpenTestRunner}
          className="flex items-center gap-1.5 rounded-lg border border-violet-700/60 bg-violet-950/40 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-900/50 hover:text-violet-100 transition-colors"
          title="Run 14 automated tests specified in Section 23"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
          <span className="hidden sm:inline">14 Tests</span>
        </button>

        <div className="flex items-center gap-1.5 rounded-lg border border-amber-900/40 bg-amber-950/20 px-2.5 py-1 text-xs text-amber-400">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-bold">{streak}</span>
          <span className="hidden sm:inline text-amber-500/80">d</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-cyan-900/40 bg-cyan-950/20 px-2.5 py-1 text-xs text-cyan-300">
          <Award className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-bold">{totalXp}</span>
          <span className="hidden sm:inline text-cyan-500/80">XP</span>
        </div>

        {/* User Account / Google Sign-In */}
        {user ? (
          <div className="flex items-center gap-2 border-l border-slate-800 pl-2.5">
            <button
              onClick={onNavigateToLogin}
              title="Open Account & Cloud Sync Settings"
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-slate-900 transition-colors group"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-6 w-6 rounded-full border border-cyan-500/50 object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-bold text-cyan-300">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'Q'}
                </div>
              )}
              <span className="hidden max-w-[90px] truncate text-xs text-slate-200 group-hover:text-cyan-300 md:inline">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
            </button>
            <button
              onClick={signOutUser}
              title="Sign Out"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (onNavigateToLogin) {
                onNavigateToLogin();
              } else {
                signInWithGoogle();
              }
            }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 hover:text-cyan-100 transition-colors"
            title="Open Login Page to sign in or register with Google or Email"
          >
            <LogIn className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
