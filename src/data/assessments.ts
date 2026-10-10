/**
 * Comprehensive Quantum Computing Assessment Quizzes
 */

import { QuizQuestion } from '../types/quantum';

export const ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  // Beginner
  {
    id: 'quiz-b1',
    category: 'beginner',
    topic: 'Superposition & Qubit States',
    question: 'If a qubit is in state |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩, what is the probability of measuring outcome 1?',
    options: ['25%', '50%', '75%', '100%'],
    correctIndex: 2,
    explanation: 'By the Born rule, P(1) = |√3/2|² = 3/4 = 75%.',
  },
  {
    id: 'quiz-b2',
    category: 'beginner',
    topic: 'Quantum Gate Operations',
    question: 'Which quantum gate is equivalent to a classical NOT gate?',
    options: ['Hadamard (H)', 'Pauli-X (X)', 'Pauli-Z (Z)', 'Phase gate (S)'],
    correctIndex: 1,
    explanation: 'Pauli-X swaps amplitudes between |0⟩ and |1⟩, mirroring classical negation.',
  },
  {
    id: 'quiz-b3',
    category: 'beginner',
    topic: 'Hadamard Properties',
    question: 'What is the outcome of applying a Hadamard gate twice in succession to state |0⟩? (i.e. H · H |0⟩)',
    options: ['|1⟩', '|0⟩', '(|0⟩ + |1⟩)/√2', '(|0⟩ - |1⟩)/√2'],
    correctIndex: 1,
    explanation: 'The Hadamard gate is Hermitian and unitary, meaning H² = I. Applying it twice returns the state back to |0⟩.',
  },
  {
    id: 'quiz-b4',
    category: 'beginner',
    topic: 'Measurement Collapse',
    question: 'Why do we need multiple simulation shots to evaluate a quantum algorithm in practice?',
    options: [
      'Because quantum processors run too hot on a single shot.',
      'Because projective measurement collapses superposition into a single random outcome, requiring statistical sampling to reconstruct the underlying probability distribution.',
      'Because qubits lose data if measured only once.',
      'Because classical computers cannot interpret quantum numbers.',
    ],
    correctIndex: 1,
    explanation: 'Measurement yields only a single eigenvalue per run, so multiple shots are required to reconstruct the probability distribution.',
  },

  // Intermediate
  {
    id: 'quiz-i1',
    category: 'intermediate',
    topic: 'Two-Qubit Entanglement',
    question: 'In the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, if Alice measures qubit 0 and obtains 1, what will Bob observe when measuring qubit 1?',
    options: [
      'Bob has a 50% chance of 0 and 50% chance of 1.',
      'Bob will measure 1 with 100% certainty.',
      'Bob will measure 0 with 100% certainty.',
      'Bob’s qubit is destroyed before he can measure.',
    ],
    correctIndex: 1,
    explanation: 'Because |Φ⁺⟩ has only components |00⟩ and |11⟩, measuring 1 on qubit 0 collapses the joint state to |11⟩, guaranteeing Bob measures 1.',
  },
  {
    id: 'quiz-i2',
    category: 'intermediate',
    topic: 'CNOT Gate Function',
    question: 'What state is produced when CNOT is applied to input state |10⟩ (control=1, target=0)?',
    options: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
    correctIndex: 3,
    explanation: 'Since the control qubit is 1, the target qubit 0 is flipped to 1, producing |11⟩.',
  },
  {
    id: 'quiz-i3',
    category: 'intermediate',
    topic: 'Phase & Rotation Gates',
    question: 'What is the matrix relationship between the S gate and the Pauli-Z gate?',
    options: ['S² = Z', 'Z² = S', 'S = Z · H', 'S · Z = I'],
    correctIndex: 0,
    explanation: 'S = diag(1, i). S² = diag(1, i²) = diag(1, -1) = Z. The S gate is known as the √Z gate.',
  },
  {
    id: 'quiz-i4',
    category: 'intermediate',
    topic: 'Bloch Sphere Coordinates',
    question: 'What point on the Bloch sphere corresponds to the state |+⟩ = (|0⟩ + |1⟩)/√2?',
    options: ['North pole (Z = +1)', 'South pole (Z = -1)', '+X axis (X = +1, Y = 0, Z = 0)', '+Y axis (X = 0, Y = +1, Z = 0)'],
    correctIndex: 2,
    explanation: '|+⟩ has θ = π/2 and φ = 0, pointing directly along the positive X-axis.',
  },

  // Advanced
  {
    id: 'quiz-a1',
    category: 'advanced',
    topic: "Grover's Diffusion Operator",
    question: "What geometric transformation does Grover's diffusion operator (2|s⟩⟨s| - I) perform on quantum state amplitudes?",
    options: [
      'A 90-degree rotation in Hilbert space.',
      'An inversion of all state amplitudes about their mean average.',
      'A projection onto classical bits.',
      'A random permutation of amplitudes.',
    ],
    correctIndex: 1,
    explanation: 'The diffusion operator reflects all probability amplitudes about their arithmetic mean, boosting states with negative phases.',
  },
  {
    id: 'quiz-a2',
    category: 'advanced',
    topic: 'Quantum Teleportation & No-Cloning',
    question: 'Why does quantum teleportation not violate the no-cloning theorem?',
    options: [
      'Because Alice only teleports classical bits.',
      'Because Alice’s original qubit is measured during Bell state analysis, irreversibly destroying the original state.',
      'Because Bob only receives an approximation of the state.',
      'Because the no-cloning theorem does not apply to entangled particles.',
    ],
    correctIndex: 1,
    explanation: 'Teleportation transfers the quantum state by destroying the original at the sender, so only one copy ever exists.',
  },
  {
    id: 'quiz-a3',
    category: 'advanced',
    topic: 'Shor’s Factoring Speedup',
    question: 'Which step in Shor’s algorithm is executed on a quantum computer rather than classically?',
    options: [
      'Finding the greatest common divisor (GCD).',
      'Picking a random coprime integer a.',
      'Finding the period r of the modular exponential sequence aˣ mod N.',
      'Multiplying the two prime factors together.',
    ],
    correctIndex: 2,
    explanation: 'Order-finding / period-finding is the exponentially hard problem solved on a quantum computer using quantum phase estimation and QFT.',
  },
  {
    id: 'quiz-a4',
    category: 'advanced',
    topic: 'Quantum Circuit Complexity',
    question: 'What is defined as the "depth" of a quantum circuit?',
    options: [
      'The total number of physical qubits in the processor.',
      'The length of the longest path of sequential dependent gate operations from input to output.',
      'The temperature of the dilution refrigerator.',
      'The number of measurement gates.',
    ],
    correctIndex: 1,
    explanation: 'Circuit depth is the number of time slices or maximum layers of gates that must be executed sequentially due to qubit dependencies.',
  },
];
