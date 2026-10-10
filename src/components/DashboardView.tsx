/**
 * Main Application Dashboard View
 * Executive portal showing learning status, active circuit status, quick actions, and recommended lessons.
 */

import React from 'react';
import { Circuit, UserProgress } from '../types/quantum';
import { QuantumSimulator } from '../engine/quantumSimulator';
import { LEARNING_MODULES } from '../data/learningModules';
import { CODING_CHALLENGES } from '../data/challenges';
import { NavTabId } from './Sidebar';
import {
  Atom,
  CircuitBoard,
  GraduationCap,
  Sparkles,
  Trophy,
  Flame,
  Award,
  ArrowRight,
  Play,
  Cpu,
  Bot,
  Globe2,
} from 'lucide-react';

interface DashboardViewProps {
  activeCircuit: Circuit;
  progress: UserProgress;
  onNavigate: (tab: NavTabId) => void;
  onLoadPreset: (circuit: Circuit) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeCircuit,
  progress,
  onNavigate,
  onLoadPreset,
}) => {
  const simResult = QuantumSimulator.simulate(activeCircuit);

  const nextLesson =
    LEARNING_MODULES.find((l) => !progress.completedLessons.includes(l.id)) ||
    LEARNING_MODULES[0];

  const nextChallenge =
    CODING_CHALLENGES.find((c) => !progress.completedChallenges.includes(c.id)) ||
    CODING_CHALLENGES[0];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#0a1428] via-[#0d1c3a] to-[#0a1428] p-6 shadow-2xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Interactive Quantum Computing & AI Tutoring</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Learn, Design & Simulate <span className="text-cyan-400">Quantum Algorithms</span>
            </h1>

            <p className="text-xs text-slate-300 sm:text-sm leading-relaxed">
              Explore complex state-vector spaces, entanglement correlations, and quantum logic gates with
              mathematically rigorous linear algebra simulation and AI-assisted tutoring.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('builder')}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 active:scale-95 transition-all"
              >
                <CircuitBoard className="h-4 w-4" />
                <span>Open Circuit Builder</span>
              </button>

              <button
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all"
              >
                <GraduationCap className="h-4 w-4 text-cyan-400" />
                <span>Start Learning Modules</span>
              </button>

              <button
                onClick={() => onNavigate('tutor')}
                className="flex items-center gap-2 rounded-xl border border-violet-700/60 bg-violet-950/40 px-4 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-900/50 transition-all"
              >
                <Bot className="h-4 w-4 text-violet-400" />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-center w-60 shadow-xl backdrop-blur-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-3 border border-cyan-500/40 shadow-inner">
              <Atom className="h-8 w-8 animate-spin-slow" />
            </div>
            <div className="font-mono text-xs font-bold text-cyan-300">Browser State-Vector</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Unitary Norm = 1.000</div>
            <div className="text-[10px] text-slate-500 mt-2">Zero Software Install Needed</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          onClick={() => onNavigate('analytics')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md hover:border-cyan-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-semibold">Total XP Earned</span>
            <Award className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400 font-mono">{progress.totalXp}</div>
          <div className="text-[11px] text-slate-500 mt-1">Level {Math.floor(progress.totalXp / 100) + 1} Apprentice</div>
        </div>

        <div
          onClick={() => onNavigate('analytics')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-semibold">Day Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">{progress.learningStreak} Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Active daily learning</div>
        </div>

        <div
          onClick={() => onNavigate('learn')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md hover:border-violet-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-semibold">Lessons Mastered</span>
            <GraduationCap className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-violet-400 font-mono">
            {progress.completedLessons.length} / {LEARNING_MODULES.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((progress.completedLessons.length / LEARNING_MODULES.length) * 100).toFixed(0)}% Curriculum Done
          </div>
        </div>

        <div
          onClick={() => onNavigate('challenges')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-semibold">Challenges Solved</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {progress.completedChallenges.length} / {CODING_CHALLENGES.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Auto-validated state vectors</div>
        </div>
      </div>

      {/* Main Grid: Active Circuit Status & Recommended Tracks */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Active Circuit Quick Visualizer Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-slate-200">ACTIVE CIRCUIT STATE FEEDBACK</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('builder')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>Edit Circuit</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="font-bold text-slate-100">{activeCircuit.name}</div>
            <div className="font-mono text-slate-400">
              {activeCircuit.numQubits} Qubits | Depth: {simResult.circuitDepth} | Gates:{' '}
              {activeCircuit.gates.length}
            </div>
          </div>

          {/* Quick Probability Bars Preview */}
          <div className="space-y-2 pt-1">
            {simResult.stateVector.slice(0, 4).map((sv) => {
              const pct = (sv.probability * 100).toFixed(1);
              return (
                <div key={sv.basis} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 font-bold text-slate-300">{sv.basis}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Visual Navigation Shortcuts */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('bloch_sphere')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 py-2 text-xs text-cyan-300 hover:bg-slate-800"
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>Bloch Sphere</span>
            </button>
            <button
              onClick={() => onNavigate('state_visualizer')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 py-2 text-xs text-violet-300 hover:bg-slate-800"
            >
              <Atom className="h-3.5 w-3.5" />
              <span>Dirac Amplitudes</span>
            </button>
            <button
              onClick={() => onNavigate('code')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 py-2 text-xs text-emerald-300 hover:bg-slate-800"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Python Qiskit</span>
            </button>
          </div>
        </div>

        {/* Recommended Next Activities */}
        <div className="space-y-4 lg:col-span-5">
          {/* Next Lesson Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
                RECOMMENDED LESSON
              </span>
              <span className="text-slate-500 text-[11px] font-mono">{nextLesson.estimatedMinutes}m</span>
            </div>

            <h3 className="text-xs font-bold text-slate-100">{nextLesson.title}</h3>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {nextLesson.summary}
            </p>

            <button
              onClick={() => onNavigate('learn')}
              className="w-full flex items-center justify-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/40 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all mt-2"
            >
              <span>Continue Lesson</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Next Challenge Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">
                RECOMMENDED CHALLENGE
              </span>
              <span className="text-amber-400 text-[11px] font-mono">+{nextChallenge.xp} XP</span>
            </div>

            <h3 className="text-xs font-bold text-slate-100">{nextChallenge.title}</h3>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {nextChallenge.goalDescription}
            </p>

            <button
              onClick={() => onNavigate('challenges')}
              className="w-full flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/40 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all mt-2"
            >
              <span>Solve Challenge</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
