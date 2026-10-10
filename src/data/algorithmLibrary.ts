/**
 * Quantum Algorithm Library
 * Presets with circuit models, expected outcomes, mathematical breakdown, and challenge questions.
 */

import { Circuit } from '../types/quantum';
import { CodeConverter } from '../engine/codeConverter';

export interface AlgorithmItem {
  id: string;
  name: string;
  category: 'foundational' | 'oracles' | 'arithmetic' | 'error_mitigation';
  qubitsRequired: number;
  learningObjective: string;
  stepByStepGuide: string[];
  expectedMathematicalResult: string;
  outputExplanation: string;
  challengeQuestion: string;
  challengeAnswer: string;
  circuit: Circuit;
  code: string;
  isRunnableInBrowser: boolean;
}

export const ALGORITHM_LIBRARY: AlgorithmItem[] = [
  {
    id: 'algo-superposition',
    name: 'Equal Superposition State Preparation',
    category: 'foundational',
    qubitsRequired: 2,
    learningObjective: 'Initialize multi-qubit register into a uniform superposition spanning all 2ⁿ basis states simultaneously.',
    stepByStepGuide: [
      '1. Start with 2 qubits initialized in state |00⟩.',
      '2. Apply Hadamard gate H to qubit 0: (|0⟩ + |1⟩)/√2 ⊗ |0⟩.',
      '3. Apply Hadamard gate H to qubit 1: (|0⟩ + |1⟩)/√2 ⊗ (|0⟩ + |1⟩)/√2 = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2.',
      '4. Each of the 4 computational basis states has equal probability 1/4 = 25%.',
    ],
    expectedMathematicalResult: '|\\psi\\rangle = \\frac{1}{2}(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)',
    outputExplanation: 'All four basis states (|00⟩, |01⟩, |10⟩, |11⟩) have identical amplitude 0.5 and probability 0.25 (25%).',
    challengeQuestion: 'If you had 3 qubits in equal superposition, what would the probability of each basis state be?',
    challengeAnswer: '1/2³ = 1/8 = 12.5%.',
    circuit: {
      id: 'circ_algo_superpos',
      name: '2-Qubit Superposition',
      numQubits: 2,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'H', qubit: 1, col: 0 },
        { id: 'g2', type: 'MEASURE', qubit: 0, col: 1 },
        { id: 'g3', type: 'MEASURE', qubit: 1, col: 1 },
      ],
      description: 'Prepares uniform superposition over 4 states',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-bell-state-phi',
    name: 'Bell State |Φ⁺⟩ (EPR Pair)',
    category: 'foundational',
    qubitsRequired: 2,
    learningObjective: 'Prepare a maximally entangled two-qubit Einstein-Podolsky-Rosen pair and demonstrate quantum non-locality.',
    stepByStepGuide: [
      '1. Start in |00⟩.',
      '2. Apply H to qubit 0 to form (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2.',
      '3. Apply CNOT with control q0 and target q1.',
      '4. If q0 is 0, q1 remains 0. If q0 is 1, q1 flips to 1. Result: (|00⟩ + |11⟩)/√2.',
    ],
    expectedMathematicalResult: '|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)',
    outputExplanation: 'Measurement outcomes are strictly correlated: 50% chance of |00⟩, 50% chance of |11⟩. Outcomes |01⟩ and |10⟩ never occur.',
    challengeQuestion: 'How can you convert |Φ⁺⟩ into the |Φ⁻⟩ Bell state (|00⟩ - |11⟩)/√2?',
    challengeAnswer: 'Apply a Pauli-Z gate to either qubit 0 or qubit 1.',
    circuit: {
      id: 'circ_algo_bell_phi',
      name: 'Bell State Preparation',
      numQubits: 2,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'CX', qubit: 0, targetQubit: 1, col: 1 },
        { id: 'g2', type: 'MEASURE', qubit: 0, col: 2 },
        { id: 'g3', type: 'MEASURE', qubit: 1, col: 2 },
      ],
      description: 'Canonical Bell state generator',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-quantum-interference',
    name: 'Quantum Interference (Mach-Zehnder Analog)',
    category: 'foundational',
    qubitsRequired: 1,
    learningObjective: 'Demonstrate constructive and destructive wave interference using successive Hadamard and Phase gates.',
    stepByStepGuide: [
      '1. Start in |0⟩.',
      '2. Apply H to create (|0⟩ + |1⟩)/√2.',
      '3. Apply Pauli-Z to introduce a relative phase shift π: (|0⟩ - |1⟩)/√2 = |-⟩.',
      '4. Apply a second H gate: destructive interference cancels |0⟩ and constructive interference enhances |1⟩, yielding pure |1⟩ with 100% certainty!',
    ],
    expectedMathematicalResult: 'H Z H |0\\rangle = X |0\\rangle = |1\\rangle',
    outputExplanation: 'Without the Z gate, H·H would return the state to |0⟩. With the Z phase shift, destructive interference on |0⟩ leads to outcome |1⟩ with probability 1.0.',
    challengeQuestion: 'What gate identity is proved by H · Z · H = X?',
    challengeAnswer: 'H conjugate Z is X; Hadamard swaps the X and Z Pauli bases.',
    circuit: {
      id: 'circ_algo_interference',
      name: 'Mach-Zehnder Interference',
      numQubits: 1,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'Z', qubit: 0, col: 1 },
        { id: 'g2', type: 'H', qubit: 0, col: 2 },
      ],
      description: 'H-Z-H interference transformation',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-bernstein-vazirani',
    name: 'Bernstein-Vazirani Algorithm (Secret Bitstring)',
    category: 'oracles',
    qubitsRequired: 3,
    learningObjective: 'Find an unknown n-bit secret string s = (s₁, s₂, ... sₙ) in exactly ONE query using quantum phase kickback.',
    stepByStepGuide: [
      '1. Target secret string s = "10" on 2 input qubits (q0, q1) with 1 ancilla qubit (q2).',
      '2. Initialize input qubits in |0⟩ and ancilla in |1⟩ (via X gate).',
      '3. Apply Hadamard H to all qubits.',
      '4. Oracle encodes s: apply CNOT from q1 to ancilla q2 (since bit 1 of s is 1, and bit 0 is 0).',
      '5. Apply Hadamard H to all input qubits to decode the secret string directly.',
      '6. Measuring input register reveals the secret string s = "10" with 100% certainty!',
    ],
    expectedMathematicalResult: '|\\psi_{\\text{final}}\\rangle = |s\\rangle = |10\\rangle',
    outputExplanation: 'Classically, finding an n-bit string requires n queries. Quantumly, Bernstein-Vazirani finds all n bits simultaneously in 1 query.',
    challengeQuestion: 'If secret string was "11", what oracle gates would be required?',
    challengeAnswer: 'CNOT from q0 to ancilla, and CNOT from q1 to ancilla.',
    circuit: {
      id: 'circ_algo_bv',
      name: 'Bernstein-Vazirani Algorithm',
      numQubits: 3,
      gates: [
        { id: 'g0', type: 'X', qubit: 2, col: 0 }, // Ancilla in |1>
        { id: 'g1', type: 'H', qubit: 0, col: 1 },
        { id: 'g2', type: 'H', qubit: 1, col: 1 },
        { id: 'g3', type: 'H', qubit: 2, col: 1 },
        { id: 'g4', type: 'CX', qubit: 1, targetQubit: 2, col: 2 }, // Oracle for bit 1 of "10"
        { id: 'g5', type: 'H', qubit: 0, col: 3 },
        { id: 'g6', type: 'H', qubit: 1, col: 3 },
        { id: 'g7', type: 'MEASURE', qubit: 0, col: 4 },
        { id: 'g8', type: 'MEASURE', qubit: 1, col: 4 },
      ],
      description: 'Discovers hidden string s="10" in a single query',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-deutsch-jozsa',
    name: 'Deutsch-Jozsa Algorithm (Constant vs Balanced)',
    category: 'oracles',
    qubitsRequired: 3,
    learningObjective: 'Distinguish whether a black-box Boolean function is constant or balanced in one quantum query.',
    stepByStepGuide: [
      '1. Prepare 2 query qubits in |0⟩ and 1 ancilla in |1⟩.',
      '2. Apply H to all qubits.',
      '3. Apply oracle U_f that computes f(x). Here, balanced oracle applies CNOT from q0 to ancilla.',
      '4. Apply H to query qubits.',
      '5. Measure query qubits: outcome |00⟩ indicates CONSTANT, any other outcome indicates BALANCED.',
    ],
    expectedMathematicalResult: 'P(|00\\rangle) = 0 \\implies \\text{Function is BALANCED}',
    outputExplanation: 'Since query qubits collapse to non-zero states, the function is verified to be balanced.',
    challengeQuestion: 'What would the measurement outcome be if f(x) was constant 0?',
    challengeAnswer: 'State |00⟩ with 100% probability.',
    circuit: {
      id: 'circ_algo_dj',
      name: 'Deutsch-Jozsa 3-Qubit Circuit',
      numQubits: 3,
      gates: [
        { id: 'g0', type: 'X', qubit: 2, col: 0 },
        { id: 'g1', type: 'H', qubit: 0, col: 1 },
        { id: 'g2', type: 'H', qubit: 1, col: 1 },
        { id: 'g3', type: 'H', qubit: 2, col: 1 },
        { id: 'g4', type: 'CX', qubit: 0, targetQubit: 2, col: 2 },
        { id: 'g5', type: 'H', qubit: 0, col: 3 },
        { id: 'g6', type: 'H', qubit: 1, col: 3 },
        { id: 'g7', type: 'MEASURE', qubit: 0, col: 4 },
        { id: 'g8', type: 'MEASURE', qubit: 1, col: 4 },
      ],
      description: 'Balanced oracle evaluation in 1 query',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-grover-2q',
    name: "Grover's Search Algorithm (Target |11⟩)",
    category: 'oracles',
    qubitsRequired: 2,
    learningObjective: 'Implement amplitude amplification to find marked element |11⟩ out of 4 items with 100% probability.',
    stepByStepGuide: [
      '1. Initialize 2 qubits in uniform superposition with H gates: |s⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2.',
      '2. Oracle: Controlled-Z gate (CZ) flips the phase of target state |11⟩ from +0.5 to -0.5.',
      '3. Diffusion operator: H, X, CZ, X, H reflects all amplitudes about their mean (+0.25).',
      '4. Result: amplitude of |11⟩ increases from -0.5 to +1.0, while all other states cancel to 0!',
    ],
    expectedMathematicalResult: '|\\psi\\rangle = |11\\rangle \\quad (P(|11\\rangle) = 1.0)',
    outputExplanation: 'Amplitude amplification boosts probability of target state |11⟩ to exactly 100% in a single Grover iteration.',
    challengeQuestion: 'How many iterations would Grover search take for an 8-item database (3 qubits)?',
    challengeAnswer: 'Round(π/4 · √8) ≈ 2 iterations.',
    circuit: {
      id: 'circ_algo_grover_2q',
      name: "Grover's 2-Qubit Search",
      numQubits: 2,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'H', qubit: 1, col: 0 },
        { id: 'g2', type: 'CZ', qubit: 0, targetQubit: 1, col: 1 }, // Oracle
        { id: 'g3', type: 'H', qubit: 0, col: 2 },
        { id: 'g4', type: 'H', qubit: 1, col: 2 },
        { id: 'g5', type: 'X', qubit: 0, col: 3 },
        { id: 'g6', type: 'X', qubit: 1, col: 3 },
        { id: 'g7', type: 'CZ', qubit: 0, targetQubit: 1, col: 4 }, // Diffusion
        { id: 'g8', type: 'X', qubit: 0, col: 5 },
        { id: 'g9', type: 'X', qubit: 1, col: 5 },
        { id: 'g10', type: 'H', qubit: 0, col: 6 },
        { id: 'g11', type: 'H', qubit: 1, col: 6 },
        { id: 'g12', type: 'MEASURE', qubit: 0, col: 7 },
        { id: 'g13', type: 'MEASURE', qubit: 1, col: 7 },
      ],
      description: 'Single iteration Grover search finding |11⟩ with 100% probability',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-qft-3q',
    name: '3-Qubit Quantum Fourier Transform',
    category: 'arithmetic',
    qubitsRequired: 3,
    learningObjective: 'Map computational basis states into frequency/phase representations using Hadamard and controlled phase gates.',
    stepByStepGuide: [
      '1. Prepare input state |100⟩ (integer 1).',
      '2. Apply H to qubit 0.',
      '3. Apply controlled phase rotations S and T.',
      '4. Apply H and phase gates to qubit 1 and qubit 2.',
      '5. Reverse qubit order using SWAP(0, 2) gate to match standard binary order.',
    ],
    expectedMathematicalResult: 'QFT |j\\rangle = \\frac{1}{\\sqrt{8}}\\sum_{k=0}^7 e^{2\\pi i j k / 8} |k\\rangle',
    outputExplanation: 'All 8 states possess identical magnitude |1/√8|, with phase angles systematically rotating by multiples of 2π/8.',
    challengeQuestion: 'What is the inverse operation of QFT?',
    challengeAnswer: 'The inverse Quantum Fourier Transform (QFT†), which decodes phase information back into binary computational states.',
    circuit: {
      id: 'circ_algo_qft_3q',
      name: '3-Qubit QFT',
      numQubits: 3,
      gates: [
        { id: 'g0', type: 'X', qubit: 0, col: 0 },
        { id: 'g1', type: 'H', qubit: 0, col: 1 },
        { id: 'g2', type: 'S', qubit: 0, col: 2 },
        { id: 'g3', type: 'H', qubit: 1, col: 3 },
        { id: 'g4', type: 'T', qubit: 1, col: 4 },
        { id: 'g5', type: 'H', qubit: 2, col: 5 },
        { id: 'g6', type: 'SWAP', qubit: 0, targetQubit: 2, col: 6 },
      ],
      description: 'Transforms basis states into Fourier phase states',
    },
    code: '',
    isRunnableInBrowser: true,
  },
  {
    id: 'algo-shor-period-finding',
    name: "Shor's Algorithm: Modular Period Finding",
    category: 'arithmetic',
    qubitsRequired: 4,
    learningObjective: 'Understand how quantum period finding breaks RSA public key cryptography by finding r such that a^r ≡ 1 (mod N).',
    stepByStepGuide: [
      '1. To factor composite N (e.g. 15), pick coprime integer a (e.g. 7).',
      '2. Define modular exponential function f(x) = 7^x mod 15. The sequence is: 7⁰=1, 7¹=7, 7²=4, 7³=13, 7⁴=1 (period r = 4).',
      '3. Create quantum superposition over input counting register.',
      '4. Compute f(x) in parallel into target register.',
      '5. Apply Inverse QFT to extract the period r from quantum interference fringes.',
      '6. Once period r is found classically, prime factors are gcd(a^{r/2} ± 1, N). Here gcd(7² - 1, 15) = gcd(48, 15) = 3, and gcd(7² + 1, 15) = gcd(50, 15) = 5!',
    ],
    expectedMathematicalResult: 'f(x) = 7^x \\pmod{15} \\implies r = 4, \\quad \\gcd(7^2 - 1, 15) = 3, \\quad \\gcd(7^2 + 1, 15) = 5',
    outputExplanation: 'Demonstrates the order-finding quantum kernel that achieves polynomial time O((log N)³) prime factorization, replacing exponential classical algorithms.',
    challengeQuestion: 'Why does Shor’s algorithm require the period r to be even for the algebraic factoring step?',
    challengeAnswer: 'Because calculating a^{r/2} requires r/2 to be an integer to factor (a^{r/2} - 1)(a^{r/2} + 1).',
    circuit: {
      id: 'circ_algo_shor',
      name: "Shor's Period Finding Kernel (N=15, a=7)",
      numQubits: 4,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'H', qubit: 1, col: 0 },
        { id: 'g2', type: 'X', qubit: 2, col: 0 }, // Target initialized in |1>
        { id: 'g3', type: 'CX', qubit: 0, targetQubit: 3, col: 1 },
        { id: 'g4', type: 'H', qubit: 0, col: 2 },
        { id: 'g5', type: 'S', qubit: 1, col: 2 },
        { id: 'g6', type: 'H', qubit: 1, col: 3 },
      ],
      description: 'Educational modular period finding circuit model',
    },
    code: '',
    isRunnableInBrowser: true,
  },
];

// Initialize code for each preset
ALGORITHM_LIBRARY.forEach((algo) => {
  algo.code = CodeConverter.circuitToQiskit(algo.circuit);
});
