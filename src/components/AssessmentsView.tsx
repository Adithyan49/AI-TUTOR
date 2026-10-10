/**
 * Quantum Assessments & Quizzes View
 * Interactive knowledge evaluations with immediate feedback, detailed explanations, and score tracking.
 */

import React, { useState } from 'react';
import { QuizQuestion } from '../types/quantum';
import { ASSESSMENT_QUESTIONS } from '../data/assessments';
import {
  CheckSquare,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface AssessmentsViewProps {
  onSaveQuizScore: (quizId: string, score: number, total: number) => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ onSaveQuizScore }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'beginner' | 'intermediate' | 'advanced'
  >('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const filteredQuestions = ASSESSMENT_QUESTIONS.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const score = calculateScore();
    onSaveQuizScore(`quiz_${selectedCategory}`, score, filteredQuestions.length);
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const total = filteredQuestions.length;
  const pct = total > 0 ? ((score / total) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-5">
      {/* Header & Category Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Quantum Knowledge Assessments</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Concept evaluations with immediate grading and pedagogical answer rationales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSubmitted(false);
                  setUserAnswers({});
                }}
                className={`rounded px-2.5 py-1 capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 font-bold text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {submitted && (
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake
            </button>
          )}
        </div>
      </div>

      {/* Submitted Score Summary Banner */}
      {submitted && (
        <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-cyan-400" />
            <div>
              <div className="text-sm font-bold text-slate-100">
                Assessment Completed! Your Score: {score} / {total} ({pct}%)
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {score === total
                  ? 'Outstanding! You demonstrated complete conceptual mastery of these quantum topics.'
                  : 'Great effort! Review the explanations below to refine your understanding of quantum mechanics.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const selectedOption = userAnswers[q.id];
          const isAnswered = selectedOption !== undefined;
          const isCorrect = selectedOption === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 shadow-md transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-900/60 bg-emerald-950/20'
                    : 'border-rose-900/60 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                  Question {idx + 1} • {q.topic}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    q.category === 'beginner'
                      ? 'bg-emerald-950 text-emerald-400'
                      : q.category === 'intermediate'
                      ? 'bg-blue-950 text-blue-400'
                      : 'bg-violet-950 text-violet-400'
                  }`}
                >
                  {q.category}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-100 mb-3">{q.question}</h3>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  let optStyle =
                    'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

                  if (isThisSelected) {
                    optStyle = 'border-cyan-500 bg-cyan-950/40 text-cyan-200 font-semibold';
                  }

                  if (submitted) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold';
                    } else if (isThisSelected && !isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-950/60 text-rose-200 line-through';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && optIdx === q.correctIndex && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      {submitted && isThisSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {submitted && (
                <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-950/80 p-2.5 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-cyan-400">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Explanation:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!submitted && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(userAnswers).length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-30 transition-all"
          >
            <CheckSquare className="h-4 w-4" />
            Submit Answers & Grade Assessment
          </button>
        </div>
      )}
    </div>
  );
};
