/**
 * Quantum computing core type definitions
 */

export type Complex = {
  r: number; // Real component
  i: number; // Imaginary component
};

export type GateType =
  | 'I'
  | 'X'
  | 'Y'
  | 'Z'
  | 'H'
  | 'S'
  | 'T'
  | 'Sdg'
  | 'Tdg'
  | 'RX'
  | 'RY'
  | 'RZ'
  | 'CX'
  | 'CZ'
  | 'SWAP'
  | 'BARRIER'
  | 'MEASURE';

export interface Gate {
  id: string;
  type: GateType;
  qubit: number;
  targetQubit?: number; // For CX, CZ, SWAP
  controlQubit?: number; // Alias for qubit when this gate is controlled
  params?: {
    theta?: number; // Angle in radians for RX, RY, RZ
  };
  col: number; // Circuit timeline step / column index (0-indexed)
}

export interface Circuit {
  id: string;
  name: string;
  numQubits: number;
  gates: Gate[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BasisStateVector {
  basis: string; // e.g., "|00>"
  index: number; // Integer representation
  amplitude: Complex;
  probability: number;
  phase: number; // In radians (-π to π)
}

export interface BlochVector {
  qubit: number;
  x: number;
  y: number;
  z: number;
  theta: number; // Polar angle [0, π]
  phi: number; // Azimuthal angle [0, 2π)
  purity: number; // 1.0 for pure state
}

export interface SimulationResult {
  numQubits: number;
  stateVector: BasisStateVector[];
  probabilities: Record<string, number>;
  shotsResult?: Record<string, number>;
  shotsCount: number;
  executionTimeMs: number;
  isNormalized: boolean;
  norm: number;
  blochVectors: BlochVector[];
  noiseModelApplied: boolean;
  noiseErrorRate?: number;
  circuitDepth: number;
  gateCount: number;
  measuredQubits: number[];
}

export interface CircuitValidationError {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  qubit?: number;
  col?: number;
  gateId?: string;
  suggestedFix?: string;
  canAutoFix?: boolean;
  fixAction?: () => void;
}

export interface OptimizationStep {
  type: 'cancellation' | 'identity_removal' | 'rotation_merge' | 'commutation';
  description: string;
  removedGateIds: string[];
  addedGates?: Gate[];
}

export interface OptimizationResult {
  originalCircuit: Circuit;
  optimizedCircuit: Circuit;
  originalDepth: number;
  optimizedDepth: number;
  originalGateCount: number;
  optimizedGateCount: number;
  steps: OptimizationStep[];
  isEquivalent: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  summary: string;
  explanation: string[];
  mathFormulas?: string[];
  circuitPreset: Circuit;
  expectedResultDesc: string;
  practicalTask: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  hints: string[];
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  description: string;
  goalDescription: string;
  targetNumQubits: number;
  starterCircuit: Circuit;
  hints: string[];
  solutionExplanation: string;
  expectedValidation: {
    type: 'state_probability' | 'bell_state' | 'gate_count' | 'depth' | 'custom';
    targetProbabilities?: Record<string, number>;
    tolerance?: number;
    maxDepth?: number;
    maxGates?: number;
  };
}

export interface QuizQuestion {
  id: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  completedLessons: string[];
  completedChallenges: string[];
  challengeScores: Record<string, number>;
  challengeAttempts: Record<string, number>;
  quizScores: Record<string, { score: number; total: number; timestamp: string }>;
  savedCircuits: Circuit[];
  learningStreak: number;
  lastActiveDate: string;
  totalXp: number;
  selectedLearningPath: 'beginner' | 'intermediate' | 'advanced' | 'custom';
  circuitNotes: Record<string, string>;
  keyBindings?: Record<string, string[]>;
}

export interface QuantumBackend {
  id: string;
  name: string;
  provider: string;
  type: 'local_browser' | 'cloud_service' | 'qpu_hardware';
  status: 'connected' | 'available' | 'requires_auth' | 'offline';
  description: string;
  maxQubits: number;
  supportsNoise: boolean;
  requirements: string[];
  apiDocsUrl: string;
}
