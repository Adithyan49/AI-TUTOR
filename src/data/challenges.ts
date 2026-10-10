/**
 * Interactive Coding Challenges with Real State-Vector Validation
 */

import { Challenge } from '../types/quantum';

export const CODING_CHALLENGES: Challenge[] = [
  // BEGINNER CHALLENGES
  {
    id: 'ch-superposition',
    title: 'Challenge 1: Create a Quantum Superposition',
    difficulty: 'beginner',
    xp: 50,
    description: 'A single qubit begins in the classical ground state |0⟩. Transform it into an equal superposition |+⟩ = (|0⟩ + |1⟩)/√2 so that measurement yields 50% chance of |0⟩ and 50% chance of |1⟩.',
    goalDescription: 'Configure qubit q0 to produce an equal probability distribution: P(|0⟩) ≈ 0.5 and P(|1⟩) ≈ 0.5.',
    targetNumQubits: 1,
    starterCircuit: {
      id: 'circ_ch_1',
      name: 'Superposition Challenge',
      numQubits: 1,
      gates: [],
    },
    hints: [
      'The Hadamard gate (H) creates an equal superposition when applied to |0⟩.',
      'Place an H gate on wire q0 at column 0.',
    ],
    solutionExplanation: 'Applying the Hadamard gate H to the ground state |0⟩ maps it to 1/√2 |0⟩ + 1/√2 |1⟩. Squaring the amplitudes gives P(0) = 0.5 and P(1) = 0.5.',
    expectedValidation: {
      type: 'state_probability',
      targetProbabilities: {
        '|0⟩': 0.5,
        '|1⟩': 0.5,
      },
      tolerance: 0.05,
    },
  },
  {
    id: 'ch-bitflip',
    title: 'Challenge 2: The Quantum NOT Bit-Flip',
    difficulty: 'beginner',
    xp: 50,
    description: 'Transform a qubit initialized in state |0⟩ into state |1⟩ with 100% certainty.',
    goalDescription: 'Attain P(|1⟩) = 1.0 (100%) on wire q0.',
    targetNumQubits: 1,
    starterCircuit: {
      id: 'circ_ch_2',
      name: 'Bit-Flip Challenge',
      numQubits: 1,
      gates: [],
    },
    hints: [
      'The Pauli-X gate performs a classical NOT operation on a qubit.',
      'Add an X gate to qubit 0.',
    ],
    solutionExplanation: 'Pauli-X matrix [ [0, 1], [1, 0] ] maps vector [1, 0]ᵀ to [0, 1]ᵀ, achieving state |1⟩.',
    expectedValidation: {
      type: 'state_probability',
      targetProbabilities: {
        '|1⟩': 1.0,
      },
      tolerance: 0.02,
    },
  },
  {
    id: 'ch-bell-phi-plus',
    title: 'Challenge 3: Prepare the Bell State |Φ⁺⟩',
    difficulty: 'beginner',
    xp: 100,
    description: 'Construct the iconic Einstein-Podolsky-Rosen (EPR) entangled pair: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 using 2 qubits.',
    goalDescription: 'Attain P(|00⟩) = 0.5 and P(|11⟩) = 0.5, with exactly 0% probability on |01⟩ and |10⟩.',
    targetNumQubits: 2,
    starterCircuit: {
      id: 'circ_ch_3',
      name: 'Bell State Challenge',
      numQubits: 2,
      gates: [],
    },
    hints: [
      'Step 1: Put the first qubit (q0) into superposition with an H gate.',
      'Step 2: Entangle q0 with q1 using a CNOT (CX) gate with q0 as control and q1 as target.',
    ],
    solutionExplanation: 'H on q0 creates (|00⟩ + |10⟩)/√2. Then CNOT(0->1) flips q1 only when q0 is 1, creating (|00⟩ + |11⟩)/√2.',
    expectedValidation: {
      type: 'bell_state',
      targetProbabilities: {
        '|00⟩': 0.5,
        '|11⟩': 0.5,
      },
      tolerance: 0.04,
    },
  },

  // INTERMEDIATE CHALLENGES
  {
    id: 'ch-target-distribution',
    title: 'Challenge 4: Synthesize Arbitrary Probabilities (75% / 25%)',
    difficulty: 'intermediate',
    xp: 120,
    description: 'Prepare a single-qubit state with a non-uniform probability distribution: exactly 75% probability for |0⟩ and 25% probability for |1⟩.',
    goalDescription: 'P(|0⟩) ≈ 0.75 and P(|1⟩) ≈ 0.25.',
    targetNumQubits: 1,
    starterCircuit: {
      id: 'circ_ch_4',
      name: 'Probability Synthesis',
      numQubits: 1,
      gates: [],
    },
    hints: [
      'A rotation gate RY(θ) prepares state cos(θ/2)|0⟩ + sin(θ/2)|1⟩.',
      'We need cos²(θ/2) = 0.75, which means cos(θ/2) = √3/2. Therefore θ/2 = π/6, so θ = π/3 ≈ 1.047 radians.',
    ],
    solutionExplanation: 'Applying RY(π/3) rotates the state vector so that amplitude on |0⟩ is cos(π/6) = √3/2, which squares to 3/4 = 75%.',
    expectedValidation: {
      type: 'state_probability',
      targetProbabilities: {
        '|0⟩': 0.75,
        '|1⟩': 0.25,
      },
      tolerance: 0.06,
    },
  },
  {
    id: 'ch-ghz-state',
    title: 'Challenge 5: Create a 3-Qubit GHZ State',
    difficulty: 'intermediate',
    xp: 150,
    description: 'Construct the Greenberger-Horne-Zeilinger (GHZ) tripartite entangled state: |GHZ⟩ = (|000⟩ + |111⟩)/√2.',
    goalDescription: 'Attain P(|000⟩) = 0.5 and P(|111⟩) = 0.5, with all other 6 basis states having 0% probability.',
    targetNumQubits: 3,
    starterCircuit: {
      id: 'circ_ch_5',
      name: 'GHZ State Challenge',
      numQubits: 3,
      gates: [],
    },
    hints: [
      'Start like a Bell pair: H on q0, then CNOT from q0 to q1.',
      'Next, cascade the entanglement: apply another CNOT from q1 to q2 (or q0 to q2).',
    ],
    solutionExplanation: 'H on q0 creates (|000⟩ + |100⟩)/√2. CNOT(0->1) creates (|000⟩ + |110⟩)/√2. CNOT(1->2) creates (|000⟩ + |111⟩)/√2.',
    expectedValidation: {
      type: 'state_probability',
      targetProbabilities: {
        '|000⟩': 0.5,
        '|111⟩': 0.5,
      },
      tolerance: 0.04,
    },
  },
  {
    id: 'ch-circuit-debugging',
    title: 'Challenge 6: Debug a Malfunctioning Circuit',
    difficulty: 'intermediate',
    xp: 120,
    description: 'A colleague tried to prepare a Bell state, but mistakenly placed redundant gates and misplaced a CNOT target. Repair the circuit so it correctly outputs (|00⟩ + |11⟩)/√2 with optimal depth.',
    goalDescription: 'Output clean Bell state |Φ⁺⟩ with no redundant gate collisions and depth ≤ 3.',
    targetNumQubits: 2,
    starterCircuit: {
      id: 'circ_ch_debug_broken',
      name: 'Broken Bell Circuit',
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'I', qubit: 0, col: 0 },
        { id: 'g2', type: 'H', qubit: 0, col: 1 },
        { id: 'g3', type: 'X', qubit: 0, col: 2 },
        { id: 'g4', type: 'X', qubit: 0, col: 3 }, // Redundant pair X-X
        { id: 'g5', type: 'CX', qubit: 0, targetQubit: 1, col: 4 },
      ],
    },
    hints: [
      'Two adjacent X gates cancel each other out: X · X = I.',
      'Identity gate I is a no-op.',
      'Remove the redundant gates or run the Optimization Lab to inspect reductions.',
    ],
    solutionExplanation: 'Removing the I gate and the redundant X-X pair leaves simply H(0) followed by CNOT(0->1).',
    expectedValidation: {
      type: 'bell_state',
      targetProbabilities: {
        '|00⟩': 0.5,
        '|11⟩': 0.5,
      },
      maxDepth: 3,
      tolerance: 0.04,
    },
  },

  // ADVANCED CHALLENGES
  {
    id: 'ch-grover-oracle',
    title: 'Challenge 7: Grover 2-Qubit Target Amplification',
    difficulty: 'advanced',
    xp: 200,
    description: 'Build a full 2-qubit Grover search circuit that amplifies the target marked state |11⟩ to 100% probability in 1 iteration.',
    goalDescription: 'Attain P(|11⟩) ≥ 0.95 with P(|00⟩), P(|01⟩), P(|10⟩) < 0.05.',
    targetNumQubits: 2,
    starterCircuit: {
      id: 'circ_ch_grover',
      name: 'Grover Search Canvas',
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, col: 0 },
        { id: 'g2', type: 'H', qubit: 1, col: 0 },
      ],
    },
    hints: [
      'You need: 1) Initial superposition (already provided), 2) Oracle for |11⟩ (CZ gate), 3) Diffusion operator: H on all, X on all, CZ, X on all, H on all.',
    ],
    solutionExplanation: 'The phase flip by CZ followed by the Grover diffusion operator reflects amplitudes across the mean, boosting |11⟩ to 100%.',
    expectedValidation: {
      type: 'state_probability',
      targetProbabilities: {
        '|11⟩': 1.0,
      },
      tolerance: 0.05,
    },
  },
];
