/**
 * Personalized Learning Paths
 * Dynamic progress-based roadmap with rule-based topic recommendations and career goals.
 */

import React from 'react';
import { UserProgress } from '../types/quantum';
import { LEARNING_MODULES } from '../data/learningModules';
import { CODING_CHALLENGES } from '../data/challenges';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
} from 'lucide-react';

interface LearningPathsViewProps {
  progress: UserProgress;
  onSelectPath: (path: 'beginner' | 'intermediate' | 'advanced') => void;
  onNavigateToLesson: (lessonId: string) => void;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({
  progress,
  onSelectPath,
  onNavigateToLesson,
}) => {
  // Compute next recommended lesson based on completed lessons
  const nextRecommendedLesson =
    LEARNING_MODULES.find((l) => !progress.completedLessons.includes(l.id)) ||
    LEARNING_MODULES[0];

  const paths = [
    {
      id: 'beginner' as const,
      title: 'Quantum Foundations Track',
      level: 'Beginner',
      description: 'Master qubits, superposition, bra-ket notation, and single-qubit rotations.',
      targetCareer: 'Quantum Enthusiast & Student',
      modulesCount: 4,
      xp: 200,
    },
    {
      id: 'intermediate' as const,
      title: 'Entanglement & Multi-Qubit Systems',
      level: 'Intermediate',
      description: 'Explore Bell states, CNOT interactions, phase gates, and quantum interference.',
      targetCareer: 'Quantum Software Developer',
      modulesCount: 6,
      xp: 450,
    },
    {
      id: 'advanced' as const,
      title: 'Quantum Algorithms & Complexity',
      level: 'Advanced',
      description: 'Implement teleportation, Deutsch-Jozsa, Grover search, QFT, and Shor order-finding.',
      targetCareer: 'Quantum Algorithm Researcher',
      modulesCount: 5,
      xp: 800,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Personalized Learning Roadmap</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Rule-based skill tracking, dynamic recommendations, and career tracks.
          </p>
        </div>

        <div className="rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300">
          Current Track: <span className="font-bold uppercase">{progress.selectedLearningPath}</span>
        </div>
      </div>

      {/* Recommended Next Lesson Card */}
      <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                RECOMMENDED NEXT STEP
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {nextRecommendedLesson.title} ({nextRecommendedLesson.category.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                {nextRecommendedLesson.summary}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToLesson(nextRecommendedLesson.id)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
          >
            <span>Start Lesson</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Path Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {paths.map((p) => {
          const isSelected = progress.selectedLearningPath === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-4 shadow-lg transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/40'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    p.id === 'beginner'
                      ? 'bg-emerald-950 text-emerald-400'
                      : p.id === 'intermediate'
                      ? 'bg-blue-950 text-blue-400'
                      : 'bg-violet-950 text-violet-400'
                  }`}
                >
                  {p.level}
                </span>

                <span className="font-mono text-xs text-amber-400 font-bold">+{p.xp} XP</span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 mt-3">{p.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Track: {p.targetCareer}</span>
                <button
                  onClick={() => onSelectPath(p.id)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isSelected ? 'Active Track' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Roadmap Timeline */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
          CURRICULUM MASTERY TIMELINE
        </h3>

        <div className="space-y-3">
          {LEARNING_MODULES.map((lesson, idx) => {
            const isCompleted = progress.completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                onClick={() => onNavigateToLesson(lesson.id)}
                className={`flex items-center justify-between rounded-lg border p-3 text-xs cursor-pointer transition-all ${
                  isCompleted
                    ? 'border-emerald-800/40 bg-emerald-950/10 hover:bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>

                  <div>
                    <span className="font-bold text-slate-200">{lesson.title}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-500 uppercase">
                      [{lesson.category}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>{lesson.estimatedMinutes} min</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
