/**
 * Rigorous State-Vector Quantum Simulator Engine
 * Implements linear algebra operations over complex vector spaces.
 */

import {
  Circuit,
  Gate,
  Complex,
  SimulationResult,
  BasisStateVector,
  BlochVector,
} from '../types/quantum';
import { ComplexMath } from './complex';

// Seeded PRNG for deterministic simulation runs
export class SeededRNG {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// 2x2 Unitary matrix representation
export type Matrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

export const QUANTUM_GATES: Record<string, (theta?: number) => Matrix2x2> = {
  I: () => [
    [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
    [ComplexMath.create(0, 0), ComplexMath.create(1, 0)],
  ],
  X: () => [
    [ComplexMath.create(0, 0), ComplexMath.create(1, 0)],
    [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
  ],
  Y: () => [
    [ComplexMath.create(0, 0), ComplexMath.create(0, -1)],
    [ComplexMath.create(0, 1), ComplexMath.create(0, 0)],
  ],
  Z: () => [
    [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
    [ComplexMath.create(0, 0), ComplexMath.create(-1, 0)],
  ],
  H: () => {
    const invSqrt2 = 1 / Math.SQRT2;
    return [
      [ComplexMath.create(invSqrt2, 0), ComplexMath.create(invSqrt2, 0)],
      [ComplexMath.create(invSqrt2, 0), ComplexMath.create(-invSqrt2, 0)],
    ];
  },
  S: () => [
    [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
    [ComplexMath.create(0, 0), ComplexMath.create(0, 1)],
  ],
  Sdg: () => [
    [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
    [ComplexMath.create(0, 0), ComplexMath.create(0, -1)],
  ],
  T: () => {
    const invSqrt2 = 1 / Math.SQRT2;
    return [
      [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
      [ComplexMath.create(0, 0), ComplexMath.create(invSqrt2, invSqrt2)],
    ];
  },
  Tdg: () => {
    const invSqrt2 = 1 / Math.SQRT2;
    return [
      [ComplexMath.create(1, 0), ComplexMath.create(0, 0)],
      [ComplexMath.create(0, 0), ComplexMath.create(invSqrt2, -invSqrt2)],
    ];
  },
  RX: (theta = Math.PI) => {
    const half = theta / 2;
    const cos = Math.cos(half);
    const sin = Math.sin(half);
    return [
      [ComplexMath.create(cos, 0), ComplexMath.create(0, -sin)],
      [ComplexMath.create(0, -sin), ComplexMath.create(cos, 0)],
    ];
  },
  RY: (theta = Math.PI) => {
    const half = theta / 2;
    const cos = Math.cos(half);
    const sin = Math.sin(half);
    return [
      [ComplexMath.create(cos, 0), ComplexMath.create(-sin, 0)],
      [ComplexMath.create(sin, 0), ComplexMath.create(cos, 0)],
    ];
  },
  RZ: (theta = Math.PI) => {
    const half = theta / 2;
    return [
      [ComplexMath.create(Math.cos(-half), Math.sin(-half)), ComplexMath.create(0, 0)],
      [ComplexMath.create(0, 0), ComplexMath.create(Math.cos(half), Math.sin(half))],
    ];
  },
};

export interface SimulatorOptions {
  shots?: number;
  seed?: number;
  applyNoise?: boolean;
  noiseErrorRate?: number; // Educational depolarizing noise rate (0 - 0.2)
}

export class QuantumSimulator {
  /**
   * Simulates a quantum circuit and returns full state-vector, measurements, and diagnostics.
   */
  static simulate(circuit: Circuit, options: SimulatorOptions = {}): SimulationResult {
    const startTime = performance.now();
    const numQubits = Math.max(1, Math.min(circuit.numQubits || 2, 8)); // Support up to 8 qubits in browser
    const numStates = 1 << numQubits;

    // 1. Initialize state-vector to |00...0>
    let state: Complex[] = new Array(numStates).fill(null).map(() => ComplexMath.zero());
    state[0] = ComplexMath.create(1, 0);

    const shotsCount = options.shots ?? 1024;
    const rng = new SeededRNG(options.seed);
    const measuredQubits: number[] = [];

    // Sort gates by timeline column to preserve quantum execution order
    const sortedGates = [...circuit.gates].sort((a, b) => a.col - b.col);

    // Apply gates sequentially
    for (const gate of sortedGates) {
      if (gate.type === 'BARRIER') {
        continue;
      }

      if (gate.type === 'MEASURE') {
        if (!measuredQubits.includes(gate.qubit)) {
          measuredQubits.push(gate.qubit);
        }
        continue;
      }

      state = this.applyGate(state, numQubits, gate);

      // Educational noise model (if requested)
      if (options.applyNoise && options.noiseErrorRate && options.noiseErrorRate > 0) {
        state = this.applyEducationalNoise(state, numQubits, gate.qubit, options.noiseErrorRate, rng);
      }
    }

    // Check state normalization
    let normSq = 0;
    for (let i = 0; i < numStates; i++) {
      normSq += ComplexMath.magnitudeSq(state[i]);
    }
    const norm = Math.sqrt(normSq);
    const isNormalized = Math.abs(norm - 1.0) < 1e-4;

    // Normalize if minor numerical drift occurred
    if (norm > 0 && Math.abs(norm - 1.0) > 1e-6) {
      for (let i = 0; i < numStates; i++) {
        state[i] = ComplexMath.scale(state[i], 1 / norm);
      }
    }

    // Format Basis State Vectors
    const stateVector: BasisStateVector[] = [];
    const probabilities: Record<string, number> = {};

    for (let i = 0; i < numStates; i++) {
      const basis = this.formatBasisString(i, numQubits);
      const amp = state[i];
      const prob = ComplexMath.magnitudeSq(amp);
      const phase = ComplexMath.phase(amp);

      stateVector.push({
        basis,
        index: i,
        amplitude: amp,
        probability: Math.max(0, Math.min(1, prob)),
        phase,
      });

      probabilities[basis] = Math.max(0, Math.min(1, prob));
    }

    // Perform measurement sampling
    const shotsResult = this.sampleMeasurements(state, numQubits, shotsCount, rng);

    // Compute Bloch sphere vectors for all individual qubits
    const blochVectors = this.computeBlochVectors(state, numQubits);

    // Calculate circuit depth and gate count
    const circuitDepth = this.computeCircuitDepth(circuit);
    const gateCount = circuit.gates.filter((g) => g.type !== 'BARRIER').length;

    const executionTimeMs = performance.now() - startTime;

    return {
      numQubits,
      stateVector,
      probabilities,
      shotsResult,
      shotsCount,
      executionTimeMs,
      isNormalized,
      norm,
      blochVectors,
      noiseModelApplied: Boolean(options.applyNoise),
      noiseErrorRate: options.noiseErrorRate,
      circuitDepth,
      gateCount,
      measuredQubits,
    };
  }

  /**
   * Applies a gate operation to the state vector
   */
  private static applyGate(state: Complex[], numQubits: number, gate: Gate): Complex[] {
    const numStates = 1 << numQubits;
    const nextState = [...state];

    // Controlled-NOT (CNOT / CX)
    if (gate.type === 'CX') {
      const control = gate.qubit;
      const target = gate.targetQubit ?? (control === 0 ? 1 : 0);
      if (control >= numQubits || target >= numQubits || control === target) return state;

      for (let i = 0; i < numStates; i++) {
        const isControlSet = ((i >> control) & 1) === 1;
        if (isControlSet) {
          const isTargetSet = ((i >> target) & 1) === 1;
          if (!isTargetSet) {
            const flipped = i | (1 << target);
            const temp = nextState[i];
            nextState[i] = nextState[flipped];
            nextState[flipped] = temp;
          }
        }
      }
      return nextState;
    }

    // Controlled-Z (CZ)
    if (gate.type === 'CZ') {
      const control = gate.qubit;
      const target = gate.targetQubit ?? (control === 0 ? 1 : 0);
      if (control >= numQubits || target >= numQubits || control === target) return state;

      for (let i = 0; i < numStates; i++) {
        const isControlSet = ((i >> control) & 1) === 1;
        const isTargetSet = ((i >> target) & 1) === 1;
        if (isControlSet && isTargetSet) {
          // Multiply amplitude by -1
          nextState[i] = ComplexMath.scale(nextState[i], -1);
        }
      }
      return nextState;
    }

    // SWAP gate
    if (gate.type === 'SWAP') {
      const qA = gate.qubit;
      const qB = gate.targetQubit ?? (qA === 0 ? 1 : 0);
      if (qA >= numQubits || qB >= numQubits || qA === qB) return state;

      for (let i = 0; i < numStates; i++) {
        const bitA = (i >> qA) & 1;
        const bitB = (i >> qB) & 1;
        if (bitA === 1 && bitB === 0) {
          const swapped = (i ^ (1 << qA)) | (1 << qB);
          const temp = nextState[i];
          nextState[i] = nextState[swapped];
          nextState[swapped] = temp;
        }
      }
      return nextState;
    }

    // Single-qubit unitary gate
    const gateGen = QUANTUM_GATES[gate.type];
    if (!gateGen) return state;

    const u = gateGen(gate.params?.theta);
    const q = gate.qubit;
    if (q >= numQubits) return state;

    for (let i = 0; i < numStates; i++) {
      if (((i >> q) & 1) === 0) {
        const i0 = i;
        const i1 = i | (1 << q);

        const a0 = state[i0];
        const a1 = state[i1];

        // u[0][0]*a0 + u[0][1]*a1
        nextState[i0] = ComplexMath.add(
          ComplexMath.mul(u[0][0], a0),
          ComplexMath.mul(u[0][1], a1)
        );

        // u[1][0]*a0 + u[1][1]*a1
        nextState[i1] = ComplexMath.add(
          ComplexMath.mul(u[1][0], a0),
          ComplexMath.mul(u[1][1], a1)
        );
      }
    }

    return nextState;
  }

  /**
   * Educational depolarizing noise channel applied probabilistically
   */
  private static applyEducationalNoise(
    state: Complex[],
    numQubits: number,
    qubit: number,
    p: number,
    rng: SeededRNG
  ): Complex[] {
    const roll = rng.next();
    if (roll >= p) return state;

    // Apply X, Y, or Z error with equal probability
    const errType = rng.next();
    const errorGate: Gate = {
      id: 'noise',
      type: errType < 0.33 ? 'X' : errType < 0.66 ? 'Y' : 'Z',
      qubit,
      col: -1,
    };
    return this.applyGate(state, numQubits, errorGate);
  }

  /**
   * Measurement sampling based on calculated state probabilities
   */
  private static sampleMeasurements(
    state: Complex[],
    numQubits: number,
    shots: number,
    rng: SeededRNG
  ): Record<string, number> {
    const numStates = 1 << numQubits;
    const cdf: number[] = new Array(numStates);
    let accum = 0;

    for (let i = 0; i < numStates; i++) {
      accum += ComplexMath.magnitudeSq(state[i]);
      cdf[i] = accum;
    }

    const counts: Record<string, number> = {};
    for (let i = 0; i < numStates; i++) {
      counts[this.formatBasisString(i, numQubits)] = 0;
    }

    for (let shot = 0; shot < shots; shot++) {
      const r = rng.next() * accum;
      let selectedIdx = 0;
      // Binary search on CDF
      let low = 0;
      let high = numStates - 1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (cdf[mid] >= r) {
          selectedIdx = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      const basis = this.formatBasisString(selectedIdx, numQubits);
      counts[basis] = (counts[basis] || 0) + 1;
    }

    return counts;
  }

  /**
   * Formats a basis state index into standard Dirac ket string, e.g. |01⟩
   * Uses Big-Endian display where q_{n-1} is leftmost and q_0 is rightmost.
   */
  public static formatBasisString(index: number, numQubits: number): string {
    let bits = '';
    for (let q = numQubits - 1; q >= 0; q--) {
      bits += (index >> q) & 1 ? '1' : '0';
    }
    return `|${bits}⟩`;
  }

  /**
   * Computes Bloch sphere vectors for all qubits via reduced density matrix partial traces
   */
  private static computeBlochVectors(state: Complex[], numQubits: number): BlochVector[] {
    const numStates = 1 << numQubits;
    const vectors: BlochVector[] = [];

    for (let q = 0; q < numQubits; q++) {
      // Reduced density matrix for qubit q:
      // rho = [[rho00, rho01], [rho10, rho11]]
      let rho00 = 0;
      let rho11 = 0;
      let rho01 = ComplexMath.zero();

      for (let i = 0; i < numStates; i++) {
        if (((i >> q) & 1) === 0) {
          const i0 = i;
          const i1 = i | (1 << q);

          rho00 += ComplexMath.magnitudeSq(state[i0]);
          rho11 += ComplexMath.magnitudeSq(state[i1]);

          // rho01 = sum c_{i0} * c_{i1}^*
          const prod = ComplexMath.mul(state[i0], ComplexMath.conjugate(state[i1]));
          rho01 = ComplexMath.add(rho01, prod);
        }
      }

      // Pauli expectations:
      // <X> = 2 * Re(rho01)
      // <Y> = -2 * Im(rho01) = 2 * Im(rho10)
      // <Z> = rho00 - rho11
      const x = 2 * rho01.r;
      const y = -2 * rho01.i;
      const z = rho00 - rho11;

      // Purity = Tr(rho^2) = rho00^2 + rho11^2 + 2*|rho01|^2
      const purity = rho00 * rho00 + rho11 * rho11 + 2 * ComplexMath.magnitudeSq(rho01);

      // Spherical angles (theta polar, phi azimuthal)
      const rBloch = Math.sqrt(x * x + y * y + z * z);
      const clampedZ = rBloch > 0 ? Math.max(-1, Math.min(1, z / rBloch)) : 1;
      const theta = Math.acos(clampedZ);
      let phi = Math.atan2(y, x);
      if (phi < 0) phi += 2 * Math.PI;

      vectors.push({
        qubit: q,
        x: Math.abs(x) < 1e-6 ? 0 : x,
        y: Math.abs(y) < 1e-6 ? 0 : y,
        z: Math.abs(z) < 1e-6 ? 0 : z,
        theta,
        phi,
        purity: Math.min(1.0, Math.max(0, purity)),
      });
    }

    return vectors;
  }

  /**
   * Computes circuit depth taking timeline and qubit dependencies into account
   */
  public static computeCircuitDepth(circuit: Circuit): number {
    if (circuit.gates.length === 0) return 0;
    const qubitTimeline: number[] = new Array(circuit.numQubits).fill(0);

    const sortedGates = [...circuit.gates].sort((a, b) => a.col - b.col);

    for (const gate of sortedGates) {
      if (gate.type === 'BARRIER') continue;

      const q1 = gate.qubit;
      const q2 = gate.targetQubit;

      if (q2 !== undefined && q2 !== q1 && q2 < circuit.numQubits) {
        const currentDepth = Math.max(qubitTimeline[q1] || 0, qubitTimeline[q2] || 0) + 1;
        qubitTimeline[q1] = currentDepth;
        qubitTimeline[q2] = currentDepth;
      } else if (q1 < circuit.numQubits) {
        qubitTimeline[q1] = (qubitTimeline[q1] || 0) + 1;
      }
    }

    return Math.max(0, ...qubitTimeline);
  }
}
