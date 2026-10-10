/**
 * Structured Quantum Learning Modules
 * Interactive lessons with mathematical representations, interactive circuit presets, and knowledge checks.
 */

import React, { useState } from 'react';
import { Lesson, Circuit } from '../types/quantum';
import { LEARNING_MODULES } from '../data/learningModules';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Play,
  Lightbulb,
  Clock,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface LearningModulesViewProps {
  completedLessons: string[];
  onCompleteLesson: (lessonId: string) => void;
  onLoadCircuitToCanvas: (circuit: Circuit) => void;
}

export const LearningModulesView: React.FC<LearningModulesViewProps> = ({
  completedLessons,
  onCompleteLesson,
  onLoadCircuitToCanvas,
}) => {
  const [selectedTier, setSelectedTier] = useState<
    'all' | 'beginner' | 'intermediate' | 'advanced'
  >('all');
  const [activeLesson, setActiveLesson] = useState<Lesson>(LEARNING_MODULES[0]);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  const filteredLessons = LEARNING_MODULES.filter(
    (l) => selectedTier === 'all' || l.category === selectedTier
  );

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setShowHints(false);
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (quizSelectedOption === activeLesson.quiz.correctIndex) {
      onCompleteLesson(activeLesson.id);
    }
  };

  const isLessonDone = completedLessons.includes(activeLesson.id);

  return (
    <div className="space-y-5">
      {/* Top Header & Tier Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Structured Quantum Learning Modules</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Theory, linear algebra mathematics, interactive simulations, and knowledge checks.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`rounded px-2.5 py-1 capitalize transition-all ${
                selectedTier === tier
                  ? 'bg-cyan-500 font-bold text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Lessons Sidebar & Lesson Reader */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Lesson List Navigation */}
        <div className="space-y-2 lg:col-span-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            CURRICULUM MODULES ({filteredLessons.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredLessons.map((l) => {
              const isSelected = activeLesson.id === l.id;
              const isCompleted = completedLessons.includes(l.id);

              return (
                <button
                  key={l.id}
                  onClick={() => handleSelectLesson(l)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        l.category === 'beginner'
                          ? 'bg-emerald-950 text-emerald-400'
                          : l.category === 'intermediate'
                          ? 'bg-blue-950 text-blue-400'
                          : 'bg-violet-950 text-violet-400'
                      }`}
                    >
                      {l.category}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{l.estimatedMinutes}m</span>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-1" />}
                    </div>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-200">{l.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-400 leading-relaxed">
                    {l.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesson Reader Content Panel */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  {activeLesson.category} LESSON
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">{activeLesson.title}</h3>
              </div>

              {isLessonDone ? (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-950/80 border border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              ) : (
                <button
                  onClick={() => onCompleteLesson(activeLesson.id)}
                  className="rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                >
                  Mark as Complete
                </button>
              )}
            </div>

            {/* Explanatory text */}
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              {activeLesson.explanation.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Mathematical Formulas */}
            {activeLesson.mathFormulas && activeLesson.mathFormulas.length > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-3.5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  MATHEMATICAL FORMULATION
                </div>
                {activeLesson.mathFormulas.map((formula, idx) => (
                  <div key={idx} className="font-mono text-xs text-cyan-300 py-0.5 overflow-x-auto">
                    {formula}
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Example Circuit Loader */}
            <div className="flex items-center justify-between rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-3 text-xs">
              <div>
                <strong className="text-cyan-300">Interactive Example: </strong>
                <span className="text-slate-300">{activeLesson.circuitPreset.name}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Expected Result: {activeLesson.expectedResultDesc}
                </div>
              </div>

              <button
                onClick={() => onLoadCircuitToCanvas(activeLesson.circuitPreset)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Load to Circuit Canvas
              </button>
            </div>

            {/* Practical Task */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
              <strong className="text-amber-400">Practical Task: </strong>
              <span>{activeLesson.practicalTask}</span>
            </div>

            {/* Knowledge Check Quiz */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-4 space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  LESSON KNOWLEDGE CHECK
                </span>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  <Lightbulb className="h-3 w-3" />
                  <span>{showHints ? 'Hide Hint' : 'View Hint'}</span>
                </button>
              </div>

              {showHints && activeLesson.hints && (
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                  Hint: {activeLesson.hints.join(' ')}
                </div>
              )}

              <p className="text-xs text-slate-300 font-medium">{activeLesson.quiz.question}</p>

              {/* Options */}
              <div className="space-y-1.5">
                {activeLesson.quiz.options.map((opt, optIdx) => {
                  const isSelected = quizSelectedOption === optIdx;
                  let optStyle =
                    'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700';

                  if (isSelected) {
                    optStyle = 'border-cyan-500 bg-cyan-950/40 text-cyan-200 font-semibold';
                  }

                  if (quizSubmitted) {
                    if (optIdx === activeLesson.quiz.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold';
                    } else if (isSelected && optIdx !== activeLesson.quiz.correctIndex) {
                      optStyle = 'border-rose-500 bg-rose-950/60 text-rose-200 line-through';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={quizSubmitted}
                      onClick={() => setQuizSelectedOption(optIdx)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && optIdx === activeLesson.quiz.correctIndex && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={quizSelectedOption === null}
                  className="mt-2 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-30"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="mt-2 rounded bg-slate-900 p-2 text-[11px] text-slate-400 border border-slate-800">
                  <strong>Explanation: </strong>
                  {activeLesson.quiz.explanation}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
