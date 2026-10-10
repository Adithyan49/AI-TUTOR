/**
 * Coding Challenges & Interactive Lab Assessments
 * Validates actual quantum state vectors and awarded XP upon correct verification.
 */

import React, { useState } from 'react';
import { Challenge, Circuit } from '../types/quantum';
import { CODING_CHALLENGES } from '../data/challenges';
import { QuantumSimulator } from '../engine/quantumSimulator';
import { CircuitBuilder } from './CircuitBuilder';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ChallengesViewProps {
  completedChallenges: string[];
  onCompleteChallenge: (challengeId: string, xpEarned: number) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  completedChallenges,
  onCompleteChallenge,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | 'beginner' | 'intermediate' | 'advanced'
  >('all');
  const [activeChallenge, setActiveChallenge] = useState<Challenge>(CODING_CHALLENGES[0]);
  const [workingCircuit, setWorkingCircuit] = useState<Circuit>(CODING_CHALLENGES[0].starterCircuit);
  const [validationStatus, setValidationStatus] = useState<{
    tested: boolean;
    passed: boolean;
    feedback: string;
  }>({ tested: false, passed: false, feedback: '' });
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const filteredChallenges = CODING_CHALLENGES.filter(
    (c) => selectedDifficulty === 'all' || c.difficulty === selectedDifficulty
  );

  const handleSelectChallenge = (ch: Challenge) => {
    setActiveChallenge(ch);
    setWorkingCircuit(ch.starterCircuit);
    setValidationStatus({ tested: false, passed: false, feedback: '' });
    setShowHints(false);
    setShowSolution(false);
  };

  const handleVerifySubmission = () => {
    const sim = QuantumSimulator.simulate(workingCircuit);
    const rule = activeChallenge.expectedValidation;
    let passed = false;
    let feedback = '';

    if (rule.type === 'state_probability' && rule.targetProbabilities) {
      const tol = rule.tolerance || 0.05;
      let allMatch = true;

      for (const [basis, targetProb] of Object.entries(rule.targetProbabilities)) {
        const actualProb = sim.probabilities[basis] || 0;
        if (Math.abs(actualProb - targetProb) > tol) {
          allMatch = false;
          feedback = `Basis state ${basis} probability is ${(actualProb * 100).toFixed(
            1
          )}%, but expected ${(targetProb * 100).toFixed(1)}% (±${(tol * 100).toFixed(0)}%).`;
          break;
        }
      }

      if (allMatch) {
        passed = true;
        feedback = `Success! Target probability distribution achieved within tolerance!`;
      }
    } else if (rule.type === 'bell_state') {
      const p00 = sim.probabilities['|00⟩'] || 0;
      const p11 = sim.probabilities['|11⟩'] || 0;
      const p01 = sim.probabilities['|01⟩'] || 0;
      const p10 = sim.probabilities['|10⟩'] || 0;

      if (Math.abs(p00 - 0.5) < 0.05 && Math.abs(p11 - 0.5) < 0.05 && p01 < 0.02 && p10 < 0.02) {
        if (rule.maxDepth && sim.circuitDepth > rule.maxDepth) {
          passed = false;
          feedback = `State is a valid Bell pair, but circuit depth is ${sim.circuitDepth} (required ≤ ${rule.maxDepth}). Try optimizing redundant gates!`;
        } else {
          passed = true;
          feedback = 'Congratulations! Maximally entangled Bell state |Φ⁺⟩ successfully verified!';
        }
      } else {
        passed = false;
        feedback = `Did not produce equal superposition over |00⟩ and |11⟩. Current outcomes: |00⟩=${(
          p00 * 100
        ).toFixed(1)}%, |11⟩=${(p11 * 100).toFixed(1)}%.`;
      }
    }

    setValidationStatus({ tested: true, passed, feedback });

    if (passed) {
      onCompleteChallenge(activeChallenge.id, activeChallenge.xp);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Difficulty Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">Quantum Coding Challenges</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Real state-vector evaluation, automatic grading, and XP rewards.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`rounded-md px-2.5 py-1 capitalize transition-all ${
                selectedDifficulty === diff
                  ? 'bg-cyan-500 font-bold text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Challenge Selector & Active Canvas */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Challenge Selection List */}
        <div className="space-y-2 lg:col-span-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            AVAILABLE CHALLENGES ({filteredChallenges.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredChallenges.map((ch) => {
              const isSelected = activeChallenge.id === ch.id;
              const isCompleted = completedChallenges.includes(ch.id);

              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        ch.difficulty === 'beginner'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ch.difficulty === 'intermediate'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-violet-950 text-violet-400 border border-violet-800'
                      }`}
                    >
                      {ch.difficulty}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                      <span>+{ch.xp} XP</span>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </div>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-200">{ch.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-400 leading-relaxed">
                    {ch.goalDescription}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Challenge Canvas & Verification Panel */}
        <div className="space-y-4 lg:col-span-8">
          {/* Challenge Description & Goal Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{activeChallenge.title}</h3>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Target: {activeChallenge.targetNumQubits} Qubit Wire(s)
                </span>
              </div>

              <button
                onClick={handleVerifySubmission}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit & Verify Solution
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeChallenge.description}</p>

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs">
              <strong className="text-cyan-400">Objective: </strong>
              <span className="text-slate-300">{activeChallenge.goalDescription}</span>
            </div>

            {/* Verification Result Feedback Banner */}
            {validationStatus.tested && (
              <div
                className={`rounded-xl border p-3.5 text-xs transition-all ${
                  validationStatus.passed
                    ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-200'
                    : 'border-rose-800/80 bg-rose-950/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {validationStatus.passed ? (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>CHALLENGE COMPLETE! (+{activeChallenge.xp} XP Awarded)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                      <span>INCOMPLETE SOLUTION</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed text-[11px]">{validationStatus.feedback}</p>
              </div>
            )}

            {/* Hints and Solution Drawers */}
            <div className="flex items-center gap-3 pt-2 text-xs border-t border-slate-800/80">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{showHints ? 'Hide Hints' : 'View Hints'}</span>
              </button>

              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-300"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showSolution ? 'Hide Solution Explanation' : 'Solution Explanation'}</span>
              </button>
            </div>

            {showHints && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-cyan-400">Pedagogical Hints:</div>
                {activeChallenge.hints.map((hint, idx) => (
                  <div key={idx} className="text-[11px] text-slate-400 pl-2 border-l border-cyan-500/50">
                    {hint}
                  </div>
                ))}
              </div>
            )}

            {showSolution && (
              <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/20 p-3 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-indigo-400">Official Solution Walkthrough:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {activeChallenge.solutionExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Circuit Builder for Current Challenge */}
          <CircuitBuilder
            circuit={workingCircuit}
            onChangeCircuit={setWorkingCircuit}
          />
        </div>
      </div>
    </div>
  );
};
