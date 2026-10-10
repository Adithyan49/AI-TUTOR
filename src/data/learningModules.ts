/**
 * Structured Quantum Learning Modules Curriculum
 * Categorized into Beginner, Intermediate, and Advanced tiers.
 */

import { Lesson } from '../types/quantum';

export const LEARNING_MODULES: Lesson[] = [
  // BEGINNER
  {
    id: 'intro-bits-vs-qubits',
    title: 'Classical Bits versus Qubits',
    category: 'beginner',
    estimatedMinutes: 8,
    summary: 'Understand the fundamental contrast between binary classical information and quantum state vectors.',
    explanation: [
      'A classical bit is strictly deterministic and binary: it exists solely in state 0 or state 1 (e.g. voltage low or high).',
      'A quantum bit (qubit) is a two-level quantum mechanical system. While it can be measured in computational basis states |0⟩ or |1⟩, prior to measurement it can exist in an arbitrary linear combination (superposition) of both basis states.',
      'This quantum property allows quantum computers to process complex multidimensional state spaces simultaneously.',
    ],
    mathFormulas: [
      '|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle',
      '|\\alpha|^2 + |\\beta|^2 = 1 \\quad (\\alpha, \\beta \\in \\mathbb{C})',
    ],
    circuitPreset: {
      id: 'circ_qubit_intro',
      name: 'Qubit State Initialization',
      numQubits: 1,
      gates: [{ id: 'g1', type: 'I', qubit: 0, col: 0 }],
      description: 'Default state |0⟩ with identity operation',
    },
    expectedResultDesc: 'The qubit stays in pure ground state |0⟩ with 100% probability.',
    practicalTask: 'Observe the probability bar chart. Notice that in the ground state |0⟩, probability P(|0⟩) = 1.0.',
    quiz: {
      question: 'What is the primary difference between a classical bit and a qubit prior to measurement?',
      options: [
        'A classical bit can hold infinite values, while a qubit can only hold 0 or 1.',
        'A qubit can exist in a continuous linear superposition of |0⟩ and |1⟩ with complex probability amplitudes.',
        'Qubits do not follow probability rules and never collapse.',
        'Qubits operate at higher clock speeds than classical bits.',
      ],
      correctIndex: 1,
      explanation: 'A qubit can exist in a superposition |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex amplitudes such that |α|² + |β|² = 1.',
    },
    hints: ['Look at the mathematical formula showing alpha and beta amplitudes.'],
  },
  {
    id: 'qubit-state-notation',
    title: 'Dirac Bra-Ket State Notation',
    category: 'beginner',
    estimatedMinutes: 10,
    summary: 'Master Dirac ket notation, column vectors, and complex state representations.',
    explanation: [
      'In quantum mechanics, Dirac notation is standard. A "ket" |ψ⟩ denotes a column state vector in a complex Hilbert space.',
      'The computational basis states are defined as orthonormal vectors: |0⟩ = [1, 0]ᵀ and |1⟩ = [0, 1]ᵀ.',
      'A "bra" ⟨ψ| denotes the conjugate transpose (row vector) of |ψ⟩. The inner product ⟨φ|ψ⟩ measures the overlap between states.',
    ],
    mathFormulas: [
      '|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}, \\quad |1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}',
      '\\langle \\psi | = (\\alpha^*, \\beta^*), \\quad \\langle \\psi | \\psi \\rangle = |\\alpha|^2 + |\\beta|^2 = 1',
    ],
    circuitPreset: {
      id: 'circ_dirac_x',
      name: 'Pauli-X State Flip',
      numQubits: 1,
      gates: [{ id: 'g1', type: 'X', qubit: 0, col: 0 }],
      description: 'Pauli-X transforms |0⟩ into |1⟩',
    },
    expectedResultDesc: 'State transforms from |0⟩ to |1⟩ with 100% measurement probability.',
    practicalTask: 'Apply the Pauli-X gate to see the vector transition from [1, 0]ᵀ to [0, 1]ᵀ.',
    quiz: {
      question: 'What does the Dirac ket |1⟩ represent in column vector form?',
      options: ['[1, 1]ᵀ', '[1, 0]ᵀ', '[0, 1]ᵀ', '[0, 0]ᵀ'],
      correctIndex: 2,
      explanation: '|1⟩ corresponds to the second standard basis vector [0, 1]ᵀ.',
    },
    hints: ['Recall that |0⟩ is [1, 0]ᵀ and |1⟩ is [0, 1]ᵀ.'],
  },
  {
    id: 'superposition-intro',
    title: 'Superposition & Hadamard Gate',
    category: 'beginner',
    estimatedMinutes: 12,
    summary: 'Discover quantum superposition, equal state mixtures, and constructive/destructive interference basics.',
    explanation: [
      'Superposition allows a quantum system to exist simultaneously in a linear combination of basis states.',
      'Applying the Hadamard gate H to |0⟩ creates the symmetric superposition state |+⟩ = (|0⟩ + |1⟩)/√2.',
      'Measurement of this state yields 0 or 1 with exactly 50% probability each, yet prior to measurement the phase remains strictly coherent.',
    ],
    mathFormulas: [
      'H |0\\rangle = \\frac{1}{\\sqrt{2}}|0\\rangle + \\frac{1}{\\sqrt{2}}|1\\rangle = |+\\rangle',
      'P(0) = |1/\\sqrt{2}|^2 = 0.5, \\quad P(1) = |1/\\sqrt{2}|^2 = 0.5',
    ],
    circuitPreset: {
      id: 'circ_hadamard_intro',
      name: 'Equal Superposition',
      numQubits: 1,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, col: 0 },
        { id: 'g2', type: 'MEASURE', qubit: 0, col: 1 },
      ],
      description: 'Single Hadamard gate preparing |+⟩ state',
    },
    expectedResultDesc: 'Even 50% probability distribution across |0⟩ and |1⟩.',
    practicalTask: 'Run 1024 simulation shots and observe how measurements split roughly 512 / 512.',
    quiz: {
      question: 'What is the amplitude of |0⟩ after applying a Hadamard gate to |0⟩?',
      options: ['1.0', '0.5', '1/√2 (≈0.7071)', '0.0'],
      correctIndex: 2,
      explanation: 'The amplitude is 1/√2, which squares to give a measurement probability of 1/2 = 50%.',
    },
    hints: ['Probability is the square of the amplitude magnitude: P = |α|².'],
  },
  {
    id: 'measurement-probability',
    title: 'Quantum Measurement & Born Rule',
    category: 'beginner',
    estimatedMinutes: 12,
    summary: 'The Born rule, state vector collapse, and the statistical nature of quantum readout.',
    explanation: [
      'According to the Born rule, the probability of obtaining outcome |k⟩ upon measurement is P(k) = |⟨k|ψ⟩|² = |cₖ|².',
      'Measurement is a non-unitary projection that irreversibly collapses the superposition into a definite eigenstate of the measurement observable.',
      'Multiple shots are required to reconstruct probability distributions empirically.',
    ],
    mathFormulas: [
      'P(x) = |\\alpha_x|^2',
      '\\sum_{x} P(x) = \\sum_{x} |\\alpha_x|^2 = 1.0',
    ],
    circuitPreset: {
      id: 'circ_born_rule',
      name: 'Measurement Projection',
      numQubits: 1,
      gates: [
        { id: 'g1', type: 'RY', qubit: 0, params: { theta: Math.PI / 3 }, col: 0 },
        { id: 'g2', type: 'MEASURE', qubit: 0, col: 1 },
      ],
      description: 'RY(π/3) rotates state to test non-trivial probabilities: cos²(π/6) = 75%, sin²(π/6) = 25%',
    },
    expectedResultDesc: '|0⟩ has 75% probability and |1⟩ has 25% probability.',
    practicalTask: 'Inspect the state vector table to verify that 0.75 + 0.25 = 1.0.',
    quiz: {
      question: 'What happens to a qubit in superposition when it undergoes a projective computational measurement?',
      options: [
        'It duplicates into two identical qubits.',
        'It collapses instantaneously and irreversibly into either |0⟩ or |1⟩ according to the Born rule probabilities.',
        'It returns to its initial ground state |0⟩ immediately.',
        'Its phase angle flips by 180 degrees without affecting the amplitudes.',
      ],
      correctIndex: 1,
      explanation: 'Projective measurement collapses the quantum state into one of the eigenstates of the measurement basis.',
    },
    hints: ['Measurement causes wave function collapse.'],
  },

  // INTERMEDIATE
  {
    id: 'pauli-gates',
    title: 'Pauli Gates (X, Y, Z) and Phase Flips',
    category: 'intermediate',
    estimatedMinutes: 15,
    summary: 'Explore Pauli operators as rotations on the Bloch sphere and understand phase flips vs bit flips.',
    explanation: [
      'The Pauli matrices σₓ, σ_y, σ_z form the foundation of single-qubit quantum operations.',
      'Pauli-X acts as a classical NOT gate (bit flip), exchanging |0⟩ and |1⟩.',
      'Pauli-Z acts as a phase flip: it leaves |0⟩ unchanged but maps |1⟩ to -|1⟩ (a π phase shift).',
      'Pauli-Y combines both a bit flip and a phase flip, mapping |0⟩ to i|1⟩ and |1⟩ to -i|0⟩.',
    ],
    mathFormulas: [
      'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
      'Z |+\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}',
    ],
    circuitPreset: {
      id: 'circ_pauli_z',
      name: 'Pauli Phase Flip',
      numQubits: 1,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, col: 0 },
        { id: 'g2', type: 'Z', qubit: 0, col: 1 },
      ],
      description: 'H followed by Z transforms |0⟩ into |-⟩',
    },
    expectedResultDesc: 'Equal 50% probabilities, with relative phase π on state |1⟩.',
    practicalTask: 'Switch to the Bloch Sphere view and observe how Z rotates the vector 180° around the Z-axis.',
    quiz: {
      question: 'What is the effect of applying the Pauli-Z gate to the state |1⟩?',
      options: ['It changes the state to |0⟩', 'It multiplies the state by -1: -|1⟩', 'It has no effect on |1⟩', 'It sets the state to 0'],
      correctIndex: 1,
      explanation: 'Z|1⟩ = -|1⟩. It applies a relative phase of e^{iπ} = -1 to the basis state |1⟩.',
    },
    hints: ['Look at the bottom-right matrix entry of Z.'],
  },
  {
    id: 'entanglement-bell-states',
    title: 'Entanglement & Bell States (EPR Pairs)',
    category: 'intermediate',
    estimatedMinutes: 18,
    summary: 'Construct maximally entangled Bell states and understand Einstein-Podolsky-Rosen correlations.',
    explanation: [
      'Quantum entanglement is a phenomenon where two or more qubits share a joint state that cannot be factored into independent individual states.',
      'The canonical Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is created with a Hadamard gate on qubit 0 followed by a CNOT from qubit 0 to qubit 1.',
      'Measuring qubit 0 immediately determines the measurement outcome of qubit 1 with 100% correlation, regardless of physical separation.',
    ],
    mathFormulas: [
      '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
      '|\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}, \\quad |\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}, \\quad |\\Psi^-\\rangle = \\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}',
    ],
    circuitPreset: {
      id: 'circ_bell_phi_plus',
      name: 'Bell State |Φ⁺⟩ Generator',
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, col: 0 },
        { id: 'g2', type: 'CX', qubit: 0, targetQubit: 1, col: 1 },
        { id: 'g3', type: 'MEASURE', qubit: 0, col: 2 },
        { id: 'g4', type: 'MEASURE', qubit: 1, col: 2 },
      ],
      description: 'H on q0 followed by CNOT(q0 -> q1) creates maximally entangled state',
    },
    expectedResultDesc: 'Joint outcomes are strictly |00⟩ (50%) and |11⟩ (50%). States |01⟩ and |10⟩ have exactly 0% probability.',
    practicalTask: 'Run the circuit and verify that outcomes 01 and 10 never appear in measurement statistics.',
    quiz: {
      question: 'Why cannot the Bell state (|00⟩ + |11⟩)/√2 be written as a product state (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩)?',
      options: [
        'Because qubits cannot interact without classical wires.',
        'Because matching coefficients requires a·d = 0 and b·c = 0, which contradicts a·c = 1/√2 and b·d = 1/√2.',
        'Because it violates the no-cloning theorem.',
        'Because entanglement requires at least 4 qubits.',
      ],
      correctIndex: 1,
      explanation: 'Expanding (a|0⟩+b|1⟩)(c|0⟩+d|1⟩) = ac|00⟩ + ad|01⟩ + bc|10⟩ + bd|11⟩. Since ad=0 and bc=0, either a or d is 0 and b or c is 0, which makes ac=0 or bd=0, a direct contradiction.',
    },
    hints: ['An entangled state is by definition not separable into tensor products of single-qubit states.'],
  },
  {
    id: 'cnot-controlled-gates',
    title: 'Controlled Gates & Two-Qubit Dynamics',
    category: 'intermediate',
    estimatedMinutes: 15,
    summary: 'Master CNOT (CX), Controlled-Z (CZ), and SWAP operations.',
    explanation: [
      'Two-qubit gates are required for universal quantum computing.',
      'The Controlled-NOT gate applies Pauli-X to the target qubit if and only if the control qubit is in state |1⟩.',
      'Controlled-Z applies a phase flip (-1) only to state |11⟩. Unlike classical gates, CZ is symmetric between control and target!',
      'SWAP exchanges the quantum states of two qubits using three alternating CNOT gates.',
    ],
    mathFormulas: [
      'CNOT |c, t\\rangle = |c, c \\oplus t\\rangle',
      'CZ = \\text{diag}(1, 1, 1, -1)',
      '\\text{SWAP} = \\text{CNOT}(0, 1) \\cdot \\text{CNOT}(1, 0) \\cdot \\text{CNOT}(0, 1)',
    ],
    circuitPreset: {
      id: 'circ_swap_decomp',
      name: 'SWAP Decomposition',
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'X', qubit: 0, col: 0 },
        { id: 'g2', type: 'CX', qubit: 0, targetQubit: 1, col: 1 },
        { id: 'g3', type: 'CX', qubit: 1, targetQubit: 0, col: 2 },
        { id: 'g4', type: 'CX', qubit: 0, targetQubit: 1, col: 3 },
      ],
      description: 'Prepares |10⟩ and swaps states to |01⟩ using 3 CNOTs',
    },
    expectedResultDesc: 'State transforms into |01⟩ with 100% certainty.',
    practicalTask: 'Observe how three successive CNOTs interchange quantum states.',
    quiz: {
      question: 'If control qubit is in state |1⟩ and target qubit is in state |0⟩, what is the output of CNOT?',
      options: ['|00⟩', '|01⟩', '|11⟩', '|10⟩'],
      correctIndex: 2,
      explanation: 'Since control is 1, the target 0 is flipped to 1. The joint state becomes |11⟩.',
    },
    hints: ['Control stays 1, target flips from 0 to 1.'],
  },

  // ADVANCED
  {
    id: 'quantum-teleportation',
    title: 'Quantum Teleportation Protocol',
    category: 'advanced',
    estimatedMinutes: 25,
    summary: 'Transmit an unknown quantum state using entanglement and classical communication without violating no-cloning.',
    explanation: [
      'Quantum teleportation transfers an arbitrary unknown qubit state |ψ⟩ from Alice to Bob using an EPR pair and two classical bits.',
      'Alice entangles her unknown state with her half of the EPR pair using CNOT and H, then measures both qubits.',
      'Bob uses Alice’s two classical measurement results to apply Pauli corrections (X, Z) to his qubit, perfectly recovering |ψ⟩.',
      'The original state |ψ⟩ is destroyed during Alice’s measurement, completely respecting the no-cloning theorem!',
    ],
    mathFormulas: [
      '|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle',
      '|\\psi\\rangle \\otimes |\\Phi^+\\rangle_{AB} = \\frac{1}{2} \\sum_{x,y \\in \\{0,1\\}} |xy\\rangle_A \\otimes (Z^y X^x |\\psi\\rangle_B)',
    ],
    circuitPreset: {
      id: 'circ_teleportation',
      name: 'Quantum Teleportation Protocol',
      numQubits: 3,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, col: 0 },
        { id: 'g1', type: 'T', qubit: 0, col: 1 }, // Prepare arbitrary state on q0
        { id: 'g2', type: 'H', qubit: 1, col: 2 },
        { id: 'g3', type: 'CX', qubit: 1, targetQubit: 2, col: 3 }, // Bell pair between q1 and q2
        { id: 'g4', type: 'CX', qubit: 0, targetQubit: 1, col: 4 }, // Alice's CNOT
        { id: 'g5', type: 'H', qubit: 0, col: 5 }, // Alice's H
        { id: 'g6', type: 'CX', qubit: 1, targetQubit: 2, col: 6 }, // Conditional X correction
        { id: 'g7', type: 'CZ', qubit: 0, targetQubit: 2, col: 7 }, // Conditional Z correction
      ],
      description: 'Teleports the arbitrary state prepared on q0 to qubit q2',
    },
    expectedResultDesc: 'Bob’s qubit q2 ends up in the exact state |ψ⟩ originally prepared on q0.',
    practicalTask: 'Check the Bloch vector of q2. It matches the spherical coordinates of the initial state on q0.',
    quiz: {
      question: 'Why does quantum teleportation not violate the no-cloning theorem or special relativity?',
      options: [
        'Because the teleportation speed is instantaneous and ignores relativity.',
        'Because the sender’s original state is destroyed by measurement, and Bob cannot reconstruct the state without receiving classical bits at sub-light speed.',
        'Because it only works for classical bits.',
        'Because no measurement takes place.',
      ],
      correctIndex: 1,
      explanation: 'The initial state is destroyed upon measurement (satisfying no-cloning), and Bob requires Alice’s classical bits (traveling at ≤ c) to apply the recovery operators.',
    },
    hints: ['Remember the two classical bits needed for Bob’s corrections.'],
  },
  {
    id: 'deutsch-jozsa-algo',
    title: 'Deutsch-Jozsa Algorithm',
    category: 'advanced',
    estimatedMinutes: 20,
    summary: 'The landmark algorithm demonstrating exponential quantum speedup over deterministic classical queries.',
    explanation: [
      'The Deutsch-Jozsa problem asks whether an unknown black-box Boolean function f: {0,1}ⁿ → {0,1} is constant (all 0s or all 1s) or balanced (half 0s and half 1s).',
      'Classically, in the worst deterministic case, one must evaluate the function 2ⁿ⁻¹ + 1 times.',
      'The Deutsch-Jozsa algorithm determines this with certainty using only ONE single quantum query!',
      'It leverages phase kickback: evaluating the function into an ancilla qubit in the |-⟩ state encodes f(x) directly as a global phase (-1)^{f(x)}.',
    ],
    mathFormulas: [
      '|\\psi_1\\rangle = H^{\\otimes n}|0\\rangle^{\\otimes n} \\otimes H|1\\rangle = \\frac{1}{\\sqrt{2^n}}\\sum_x |x\\rangle \\otimes |-\\rangle',
      'U_f |x\\rangle |-\\rangle = (-1)^{f(x)} |x\\rangle |-\\rangle',
      '\\text{If constant: } P(|0\\dots 0\\rangle) = 1.0; \\quad \\text{If balanced: } P(|0\\dots 0\\rangle) = 0.0',
    ],
    circuitPreset: {
      id: 'circ_deutsch_jozsa',
      name: 'Deutsch-Jozsa (Balanced Oracle)',
      numQubits: 3,
      gates: [
        { id: 'g0', type: 'X', qubit: 2, col: 0 }, // Ancilla in |1>
        { id: 'g1', type: 'H', qubit: 0, col: 1 },
        { id: 'g2', type: 'H', qubit: 1, col: 1 },
        { id: 'g3', type: 'H', qubit: 2, col: 1 }, // All into superposition
        { id: 'g4', type: 'CX', qubit: 0, targetQubit: 2, col: 2 }, // Balanced oracle f(x) = x0
        { id: 'g5', type: 'H', qubit: 0, col: 3 },
        { id: 'g6', type: 'H', qubit: 1, col: 3 }, // Interfere back
      ],
      description: '3-qubit Deutsch-Jozsa circuit with balanced oracle f(x) = x0',
    },
    expectedResultDesc: 'Register qubits never collapse into |00⟩, proving the function is balanced.',
    practicalTask: 'Verify that outcome |00⟩ has 0% probability on the input register.',
    quiz: {
      question: 'In the Deutsch-Jozsa algorithm, how many oracle evaluations are needed to determine if f is constant or balanced?',
      options: ['2ⁿ evaluations', '2ⁿ⁻¹ + 1 evaluations', 'Exactly 1 quantum evaluation', 'N² evaluations'],
      correctIndex: 2,
      explanation: 'Deutsch-Jozsa requires exactly 1 quantum oracle evaluation, compared to 2ⁿ⁻¹ + 1 classical queries.',
    },
    hints: ['Quantum parallelism evaluates all inputs simultaneously in one pass.'],
  },
  {
    id: 'grover-search-algo',
    title: "Grover's Quantum Search Algorithm",
    category: 'advanced',
    estimatedMinutes: 25,
    summary: "Achieve quadratic speedup O(√N) for unstructured database search using amplitude amplification.",
    explanation: [
      "Grover's algorithm searches an unsorted database of N = 2ⁿ items in O(√N) queries, compared to O(N) classically.",
      "The algorithm alternates between two operators: the Oracle (which marks the target state with a -1 phase) and the Diffusion Operator (which inverts all amplitudes about their mean).",
      "Repeated iterations amplify the marked state's amplitude while suppressing all non-marked states, making the target state detectable with near 100% probability upon measurement.",
    ],
    mathFormulas: [
      "U_w |x\\rangle = (-1)^{f(x)} |x\\rangle",
      "U_s = 2|s\\rangle\\langle s| - I \\quad (|s\\rangle = H^{\\otimes n}|0\\rangle^{\\otimes n})",
      "\\text{Optimal iterations: } R \\approx \\frac{\\pi}{4}\\sqrt{N}",
    ],
    circuitPreset: {
      id: 'circ_grover_2q',
      name: "Grover's Search (2 Qubits, target |11⟩)",
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, col: 0 },
        { id: 'g2', type: 'H', qubit: 1, col: 0 }, // Superposition
        { id: 'g3', type: 'CZ', qubit: 0, targetQubit: 1, col: 1 }, // Oracle for |11>
        { id: 'g4', type: 'H', qubit: 0, col: 2 },
        { id: 'g5', type: 'H', qubit: 1, col: 2 },
        { id: 'g6', type: 'X', qubit: 0, col: 3 },
        { id: 'g7', type: 'X', qubit: 1, col: 3 },
        { id: 'g8', type: 'CZ', qubit: 0, targetQubit: 1, col: 4 }, // Diffusion operator
        { id: 'g9', type: 'X', qubit: 0, col: 5 },
        { id: 'g10', type: 'X', qubit: 1, col: 5 },
        { id: 'g11', type: 'H', qubit: 0, col: 6 },
        { id: 'g12', type: 'H', qubit: 1, col: 6 },
      ],
      description: 'Finds marked target state |11⟩ with 100% probability in 1 iteration',
    },
    expectedResultDesc: 'Target state |11⟩ is amplified to 100% probability!',
    practicalTask: 'Simulate the circuit and notice how the probability of |11⟩ rises to 1.0 while |00⟩, |01⟩, and |10⟩ fall to 0.0.',
    quiz: {
      question: "What is the query complexity of Grover's search algorithm for a database of N items?",
      options: ['O(log N)', 'O(√N)', 'O(N)', 'O(1)'],
      correctIndex: 1,
      explanation: 'Grover’s algorithm provides a quadratic speedup of O(√N) compared to classical O(N).',
    },
    hints: ['Think of the square root speedup.'],
  },
  {
    id: 'quantum-fourier-transform',
    title: 'Quantum Fourier Transform (QFT)',
    category: 'advanced',
    estimatedMinutes: 25,
    summary: 'The quantum analog of the discrete Fourier transform and the core engine behind Shor’s algorithm and phase estimation.',
    explanation: [
      'The Quantum Fourier Transform transforms a quantum state from the computational basis into the Fourier phase basis.',
      'It operates on 2ⁿ amplitudes using only O(n²) quantum gates, compared to O(n 2ⁿ) for the classical Fast Fourier Transform (FFT)—an exponential speedup in transformation complexity!',
      'QFT uses Hadamard gates and controlled-phase rotations (R_k = diag(1, e^{2πi/2^k})).',
    ],
    mathFormulas: [
      'QFT |j\\rangle = \\frac{1}{\\sqrt{N}} \\sum_{k=0}^{N-1} e^{2\\pi i j k / N} |k\\rangle',
      'R_k = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 2^k} \\end{pmatrix}',
    ],
    circuitPreset: {
      id: 'circ_qft_3q',
      name: '3-Qubit Quantum Fourier Transform',
      numQubits: 3,
      gates: [
        { id: 'g0', type: 'X', qubit: 0, col: 0 }, // Input state |100> (int 1)
        { id: 'g1', type: 'H', qubit: 0, col: 1 },
        { id: 'g2', type: 'S', qubit: 0, col: 2 },
        { id: 'g3', type: 'H', qubit: 1, col: 3 },
        { id: 'g4', type: 'T', qubit: 1, col: 4 },
        { id: 'g5', type: 'H', qubit: 2, col: 5 },
        { id: 'g6', type: 'SWAP', qubit: 0, targetQubit: 2, col: 6 }, // Bit-reversal swap
      ],
      description: '3-Qubit QFT circuit mapping computational state to Fourier phase basis',
    },
    expectedResultDesc: 'Uniform amplitude magnitude |1/√8| across all basis states with linearly advancing phase angles.',
    practicalTask: 'Inspect the phase angle of each basis state vector to observe the phase progression.',
    quiz: {
      question: 'What is the primary role of the Quantum Fourier Transform in Shor’s factoring algorithm?',
      options: [
        'To generate random numbers.',
        'To extract the period r of the modular exponential function f(x) = a^x mod N from quantum phase interference.',
        'To decrypt RSA keys without quantum operations.',
        'To perform classical multiplication faster.',
      ],
      correctIndex: 1,
      explanation: 'QFT extracts the period r from phase interference, enabling classical continued fractions to find prime factors.',
    },
    hints: ['QFT is used for period finding in Shor’s algorithm.'],
  },
];
