/**
 * In-App Automated Test Runner Modal
 * Runs the 14 automated test suites live to verify mathematical correctness.
 */

import React, { useState, useEffect } from 'react';
import { QuantumTestSuite, TestResultItem } from '../engine/quantumTester';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [totalPassed, setTotalPassed] = useState<number>(0);
  const [totalFailed, setTotalFailed] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  const runTests = async () => {
    setIsRunning(true);
    // Short tick to allow rendering
    await new Promise((res) => setTimeout(res, 50));

    const suite = await QuantumTestSuite.runAllTests();
    setTestResults(suite.results);
    setTotalPassed(suite.totalPassed);
    setTotalFailed(suite.totalFailed);
    setTotalDuration(suite.totalDurationMs);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen && testResults.length === 0) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/30 text-violet-400 border border-violet-500/40">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                14 Automated Quantum Verification Tests (Section 23)
              </h2>
              <p className="text-[11px] text-slate-400">
                Gate matrices, normalization, correlations, sampling, and compiler validation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Rerun Suite</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Score Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-5 py-2.5 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold">Passed: {totalPassed} / 14</span>
            {totalFailed > 0 && <span className="text-rose-400 font-bold">Failed: {totalFailed}</span>}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Execution Time: {totalDuration.toFixed(2)} ms</span>
          </div>
        </div>

        {/* Tests List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {isRunning ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-xs text-slate-400">
              <Sparkles className="h-8 w-8 text-violet-400 animate-spin mb-2" />
              <span>Executing linear algebra unit matrices & state-vector assertions...</span>
            </div>
          ) : (
            testResults.map((test, idx) => (
              <div
                key={test.id}
                className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {test.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        {idx + 1}. {test.name}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                        {test.category}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400 font-mono leading-relaxed">
                      {test.assertion}
                    </p>

                    {test.details && (
                      <p className="mt-1 text-[10px] text-rose-400 font-mono">{test.details}</p>
                    )}
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-500 shrink-0 ml-3">
                  {test.durationMs.toFixed(2)}ms
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-5 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>All 14 tests verified against pure mathematical state vectors.</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
