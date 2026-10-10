/**
 * Quantum Algorithm Library View
 * Runnable examples and explanatory circuits with step-by-step mathematical explanations.
 */

import React, { useState } from 'react';
import { Circuit } from '../types/quantum';
import { ALGORITHM_LIBRARY, AlgorithmItem } from '../data/algorithmLibrary';
import {
  BookOpen,
  Play,
  Cpu,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Code2,
} from 'lucide-react';

interface AlgorithmLibraryViewProps {
  onLoadAlgorithm: (circuit: Circuit) => void;
  onNavigateToCode?: () => void;
}

export const AlgorithmLibraryView: React.FC<AlgorithmLibraryViewProps> = ({
  onLoadAlgorithm,
  onNavigateToCode,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmItem>(ALGORITHM_LIBRARY[1]); // Default Bell Pair
  const [showChallengeAnswer, setShowChallengeAnswer] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSelect = (algo: AlgorithmItem) => {
    setSelectedAlgo(algo);
    setShowChallengeAnswer(false);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(selectedAlgo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Quantum Algorithm Library</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Runnable quantum circuit algorithms, mathematical walkthroughs, and challenge questions.
          </p>
        </div>

        <button
          onClick={() => onLoadAlgorithm(selectedAlgo.circuit)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Load & Simulate Algorithm
        </button>
      </div>

      {/* Grid: Algorithm Explorer */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left List */}
        <div className="space-y-2 lg:col-span-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            ALGORITHM DIRECTORY ({ALGORITHM_LIBRARY.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {ALGORITHM_LIBRARY.map((algo) => {
              const isSelected = selectedAlgo.id === algo.id;
              return (
                <button
                  key={algo.id}
                  onClick={() => handleSelect(algo)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        algo.category === 'foundational'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : algo.category === 'oracles'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {algo.category}
                    </span>

                    <span className="font-mono text-xs text-cyan-400 font-semibold">
                      {algo.qubitsRequired} Qubits
                    </span>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-200">{algo.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-400 leading-relaxed">
                    {algo.learningObjective}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  {selectedAlgo.category} ALGORITHM
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedAlgo.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedAlgo.learningObjective}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Qiskit'}</span>
                </button>

                <button
                  onClick={() => onLoadAlgorithm(selectedAlgo.circuit)}
                  className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all"
                >
                  Open in Canvas
                </button>
              </div>
            </div>

            {/* Expected Mathematical Result */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                EXPECTED MATHEMATICAL STATE
              </div>
              <div className="font-mono text-xs text-cyan-300 py-1 overflow-x-auto">
                {selectedAlgo.expectedMathematicalResult}
              </div>
            </div>

            {/* Step-by-Step Execution Guide */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200">Step-by-Step Algorithm Execution:</div>
              <div className="space-y-1.5 font-mono text-xs text-slate-300">
                {selectedAlgo.stepByStepGuide.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded bg-slate-950/70 p-2.5 border border-slate-800/80 leading-relaxed"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Output Explanation */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300">
              <strong className="text-cyan-400">Output Interpretation: </strong>
              <span className="text-slate-400 leading-relaxed">{selectedAlgo.outputExplanation}</span>
            </div>

            {/* Challenge Question */}
            <div className="rounded-lg border border-indigo-900/50 bg-indigo-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">
                  Reflective Challenge Question:
                </span>
                <button
                  onClick={() => setShowChallengeAnswer(!showChallengeAnswer)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {showChallengeAnswer ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>

              <p className="text-xs text-slate-300">{selectedAlgo.challengeQuestion}</p>

              {showChallengeAnswer && (
                <div className="rounded bg-slate-950/80 p-2 text-[11px] text-emerald-300 border border-slate-800 font-mono">
                  Answer: {selectedAlgo.challengeAnswer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
