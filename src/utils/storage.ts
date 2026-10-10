/**
 * User Progress & Storage Manager
 * Stores learner data reliably in localStorage with JSON/CSV export capabilities.
 */

import { Circuit, UserProgress } from '../types/quantum';
import { ShortcutManager } from './shortcutManager';

const STORAGE_KEY = 'ai_quantum_tutor_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  completedLessons: ['intro-bits-vs-qubits'],
  completedChallenges: [],
  challengeScores: {},
  challengeAttempts: {},
  quizScores: {},
  savedCircuits: [
    {
      id: 'default_bell_pair',
      name: 'Default Bell Pair (Φ⁺)',
      numQubits: 2,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'CX', qubit: 0, targetQubit: 1, col: 1 },
      ],
      description: 'Maximally entangled EPR state (|00⟩ + |11⟩)/√2',
    },
  ],
  learningStreak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalXp: 150,
  selectedLearningPath: 'beginner',
  circuitNotes: {
    default_bell_pair: 'Bell state preparation using Hadamard on q0 followed by CNOT targeting q1.',
  },
  keyBindings: undefined,
};

export class StorageManager {
  static loadProgress(): UserProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = { ...DEFAULT_PROGRESS, keyBindings: ShortcutManager.loadKeyBindings() };
        this.saveProgress(initial);
        return initial;
      }
      const loaded: UserProgress = { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
      if (!loaded.keyBindings) {
        loaded.keyBindings = ShortcutManager.loadKeyBindings();
      }
      return loaded;
    } catch {
      return { ...DEFAULT_PROGRESS, keyBindings: ShortcutManager.loadKeyBindings() };
    }
  }

  static saveProgress(progress: UserProgress): void {
    try {
      if (progress.keyBindings) {
        ShortcutManager.saveKeyBindings(progress.keyBindings);
      } else {
        progress.keyBindings = ShortcutManager.loadKeyBindings();
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  static completeLesson(lessonId: string): UserProgress {
    const p = this.loadProgress();
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      p.totalXp += 30;
      this.updateStreak(p);
      this.saveProgress(p);
    }
    return p;
  }

  static recordChallengeAttempt(challengeId: string, success: boolean, xpEarned: number): UserProgress {
    const p = this.loadProgress();
    p.challengeAttempts[challengeId] = (p.challengeAttempts[challengeId] || 0) + 1;
    if (success) {
      if (!p.completedChallenges.includes(challengeId)) {
        p.completedChallenges.push(challengeId);
        p.totalXp += xpEarned;
      }
      p.challengeScores[challengeId] = Math.max(p.challengeScores[challengeId] || 0, 100);
      this.updateStreak(p);
    }
    this.saveProgress(p);
    return p;
  }

  static recordQuizScore(quizId: string, score: number, total: number): UserProgress {
    const p = this.loadProgress();
    p.quizScores[quizId] = {
      score,
      total,
      timestamp: new Date().toISOString(),
    };
    p.totalXp += score * 10;
    this.updateStreak(p);
    this.saveProgress(p);
    return p;
  }

  static saveCircuit(circuit: Circuit): UserProgress {
    const p = this.loadProgress();
    const existingIdx = p.savedCircuits.findIndex((c) => c.id === circuit.id);
    if (existingIdx >= 0) {
      p.savedCircuits[existingIdx] = circuit;
    } else {
      p.savedCircuits.unshift(circuit);
    }
    this.saveProgress(p);
    return p;
  }

  static deleteCircuit(circuitId: string): UserProgress {
    const p = this.loadProgress();
    p.savedCircuits = p.savedCircuits.filter((c) => c.id !== circuitId);
    this.saveProgress(p);
    return p;
  }

  private static updateStreak(p: UserProgress): void {
    const today = new Date().toISOString().split('T')[0];
    if (p.lastActiveDate !== today) {
      p.learningStreak += 1;
      p.lastActiveDate = today;
    }
  }

  static exportAsJSON(): string {
    const p = this.loadProgress();
    return JSON.stringify(p, null, 2);
  }

  static exportAsCSV(): string {
    const p = this.loadProgress();
    const rows = [
      ['Metric', 'Value'],
      ['Total XP', p.totalXp.toString()],
      ['Learning Streak', p.learningStreak.toString()],
      ['Lessons Completed', p.completedLessons.length.toString()],
      ['Challenges Completed', p.completedChallenges.length.toString()],
      ['Saved Circuits Count', p.savedCircuits.length.toString()],
      ['Selected Path', p.selectedLearningPath],
      ['Last Active Date', p.lastActiveDate],
    ];
    return rows.map((r) => r.join(',')).join('\n');
  }

  static importProgress(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.completedLessons)) {
        if (parsed.keyBindings && typeof parsed.keyBindings === 'object') {
          ShortcutManager.saveKeyBindings(parsed.keyBindings);
        }
        this.saveProgress({ ...DEFAULT_PROGRESS, ...parsed });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static getKeyBindings(): Record<string, string[]> {
    return ShortcutManager.loadKeyBindings();
  }

  static updateKeyBindings(bindings: Record<string, string[]>): UserProgress {
    ShortcutManager.saveKeyBindings(bindings);
    const p = this.loadProgress();
    p.keyBindings = bindings;
    this.saveProgress(p);
    return p;
  }

  static resetAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    ShortcutManager.resetToDefaults();
    this.saveProgress(DEFAULT_PROGRESS);
  }
}
