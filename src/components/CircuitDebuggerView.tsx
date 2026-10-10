/**
 * Circuit Error Detection & Debugger View
 * Audits quantum circuits for syntax errors, gate collisions, out-of-bound qubits, and normalization drifts.
 */

import React from 'react';
import { Circuit, CircuitValidationError } from '../types/quantum';
import { CircuitDebugger } from '../engine/circuitDebugger';
import {
  Bug,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wrench,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface CircuitDebuggerViewProps {
  circuit: Circuit;
  onUpdateCircuit: (circuit: Circuit) => void;
  onNavigateToLesson?: (lessonId: string) => void;
}

export const CircuitDebuggerView: React.FC<CircuitDebuggerViewProps> = ({
  circuit,
  onUpdateCircuit,
  onNavigateToLesson,
}) => {
  const issues: CircuitValidationError[] = CircuitDebugger.validate(circuit);
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  const handleAutoRepair = () => {
    const repaired = CircuitDebugger.autoFixCircuit(circuit);
    onUpdateCircuit(repaired);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Quantum Circuit Debugger</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Automated semantic validation, boundary enforcement, and unitary conservation checks.
          </p>
        </div>

        {issues.length > 0 && (
          <button
            onClick={handleAutoRepair}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95"
          >
            <Wrench className="h-3.5 w-3.5" />
            Apply Safe Auto-Repair
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Critical Errors</div>
          <div className="mt-1 text-lg font-bold text-rose-400 font-mono">{errors.length}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Collisions & Warnings</div>
          <div className="mt-1 text-lg font-bold text-amber-400 font-mono">{warnings.length}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Educational Suggestions</div>
          <div className="mt-1 text-lg font-bold text-cyan-400 font-mono">{infos.length}</div>
        </div>
      </div>

      {/* Issues List or Clean Status */}
      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-10 text-center shadow-lg">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
          <h3 className="text-sm font-bold text-emerald-200">Zero Circuit Defects Detected!</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            All gate indices are within bounds, no timeline collisions occurred, and the state-vector
            preserves complete unitary probability conservation (norm = 1.000).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => {
            const isError = issue.severity === 'error';
            const isWarning = issue.severity === 'warning';

            return (
              <div
                key={issue.id}
                className={`rounded-xl border p-4 shadow-md transition-all ${
                  isError
                    ? 'border-rose-900/60 bg-rose-950/20'
                    : isWarning
                    ? 'border-amber-900/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isError ? (
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            isError
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : isWarning
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {issue.severity}
                        </span>

                        {issue.qubit !== undefined && (
                          <span className="font-mono text-xs text-slate-300">
                            Location: Wire q[{issue.qubit}]{issue.col !== undefined && `, Col ${issue.col}`}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs text-slate-200 leading-relaxed font-medium">
                        {issue.message}
                      </p>

                      {issue.suggestedFix && (
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                          <strong className="text-cyan-400">Suggested Correction:</strong>
                          <span>{issue.suggestedFix}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {onNavigateToLesson && (
                    <button
                      onClick={() => onNavigateToLesson('cnot-controlled-gates')}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 shrink-0"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Review Lesson</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
