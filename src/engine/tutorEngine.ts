/**
 * AI Quantum Tutor Engine
 * Dual-engine architecture:
 * 1. High-fidelity Local Rule-Based Quantum Expert System (Offline, instant, 100% reliable)
 * 2. Optional Server-Side Google Gemini AI integration (gemini-3.8-flash)
 */

import { Circuit } from '../types/quantum';
import { QuantumSimulator } from './quantumSimulator';
import { ComplexMath } from './complex';

export interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  sourceLabel?: string; // 'Local Quantum Expert' or 'Google Gemini AI'
  modelUsed?: string;
  circuitSnapshot?: {
    numQubits: number;
    gateCount: number;
    isEntangled: boolean;
  };
  sources?: Array<{ title: string; url: string }>;
  grounded?: boolean;
}

export class TutorEngine {
  /**
   * Generates expert tutor guidance given query, active circuit, learner level, search grounding, and model
   */
  static async queryTutor(
    userQuery: string,
    circuit: Circuit,
    learnerLevel: 'beginner' | 'intermediate' | 'advanced',
    mode: 'auto' | 'local' | 'gemini',
    history: TutorMessage[] = [],
    options: {
      modelName?: string;
      useSearchGrounding?: boolean;
      useMapsGrounding?: boolean;
    } = {}
  ): Promise<{
    text: string;
    source: 'local' | 'gemini';
    model: string;
    sources?: Array<{ title: string; url: string }>;
    grounded?: boolean;
  }> {
    // If user explicitly chose Gemini or Auto, attempt server-side proxy
    if (mode === 'gemini' || mode === 'auto') {
      try {
        const response = await fetch('/api/tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userQuery,
            circuitContext: {
              name: circuit.name,
              numQubits: circuit.numQubits,
              gateCount: circuit.gates.length,
              gates: circuit.gates.map((g) => ({
                type: g.type,
                qubit: g.qubit,
                targetQubit: g.targetQubit,
                col: g.col,
              })),
            },
            learnerLevel,
            history: history.slice(-8).map((m) => ({ sender: m.sender, text: m.text })),
            modelName: options.modelName || 'gemini-3.8-flash',
            useSearchGrounding: options.useSearchGrounding || false,
            useMapsGrounding: options.useMapsGrounding || false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.reply) {
            return {
              text: data.reply,
              source: 'gemini',
              model: data.source || 'gemini-3.8-flash',
              sources: data.sources,
              grounded: data.grounded,
            };
          }
        }
      } catch {
        // Fall back gracefully to Local Quantum Expert
      }
    }

    // Local Quantum Rule-Based Expert Engine
    const localAnswer = this.generateLocalExpertResponse(userQuery, circuit, learnerLevel);
    return {
      text: localAnswer,
      source: 'local',
      model: 'Rule-Based Quantum Expert Engine',
    };
  }

  /**
   * Generates audio narration for tutoring message
   */
  static async generateSpeech(text: string): Promise<string | null> {
    try {
      const res = await fetch('/api/tutor/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.audio || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Local Quantum Expert Engine with domain-specific knowledge and real circuit state context
   */
  private static generateLocalExpertResponse(
    query: string,
    circuit: Circuit,
    level: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    const qLower = query.toLowerCase();

    // Circuit Context Analysis
    const sim = QuantumSimulator.simulate(circuit);
    const gateCount = circuit.gates.filter((g) => g.type !== 'BARRIER').length;
    const isBellState =
      circuit.numQubits >= 2 &&
      sim.probabilities['|00⟩'] > 0.45 &&
      sim.probabilities['|11⟩'] > 0.45 &&
      (sim.probabilities['|01⟩'] || 0) < 0.05;

    // 1. Inquiries about the CURRENT active circuit
    if (
      qLower.includes('my circuit') ||
      qLower.includes('this circuit') ||
      qLower.includes('explain current') ||
      qLower.includes('what does this do') ||
      qLower.includes('circuit doing')
    ) {
      if (gateCount === 0) {
        return `Your current canvas has ${circuit.numQubits} qubit(s) in the ground state |${'0'.repeat(
          circuit.numQubits
        )}⟩ with 0 gates. Add gates like **H** or **X** from the palette to begin quantum operations!`;
      }

      let explanation = `### Analysis of "${circuit.name}":\n`;
      explanation += `• **Qubits:** ${circuit.numQubits} wire(s)\n`;
      explanation += `• **Gate Count:** ${gateCount} gates (Circuit Depth: ${sim.circuitDepth})\n`;
      explanation += `• **State Norm:** ${sim.norm.toFixed(4)} (${sim.isNormalized ? 'Unitary & Normalized' : 'Drift detected'})\n\n`;

      if (isBellState) {
        explanation += `🌟 **Entanglement Detected!** Your circuit creates a Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.\n`;
        explanation += `Notice that measuring qubit 0 immediately determines qubit 1. States |01⟩ and |10⟩ have 0% probability.\n`;
      } else {
        const topStates = Object.entries(sim.probabilities)
          .filter(([, p]) => p > 0.01)
          .sort((a, b) => b[1] - a[1])
          .map(([basis, p]) => `${basis}: ${(p * 100).toFixed(1)}%`);
        explanation += `• **Key State Probabilities:** ${topStates.join(', ') || 'Uniform'}\n`;
      }

      if (level === 'beginner') {
        explanation += `\n**Beginner Tip:** In quantum circuits, gates act from left to right across the timeline. Try adding a **Measurement** gate to see simulated shot samples!`;
      } else if (level === 'intermediate') {
        explanation += `\n**Intermediate Tip:** Check the Bloch Sphere tab to view individual qubit state vectors and phase rotations.`;
      } else {
        explanation += `\n**Advanced Tip:** Use the Optimization Lab to verify if adjacent gate cancellations or depth reductions are available for this circuit.`;
      }
      return explanation;
    }

    // 2. Questions about Superposition
    if (qLower.includes('superposition') || qLower.includes('hadamard') || qLower.includes('h gate')) {
      if (level === 'beginner') {
        return `### What is Superposition?\nIn classical computing, a bit is either strictly **0** or **1**.\nA **qubit** in superposition exists in a linear combination of both states simultaneously:\n\n$$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$\n\nWhen you apply a **Hadamard gate (H)** to |0⟩, it splits the probability evenly:\n• $H|0\\rangle = \\frac{1}{\\sqrt{2}}|0\\rangle + \\frac{1}{\\sqrt{2}}|1\\rangle$\n• Measurement yields 0 or 1 with exactly 50% probability each!`;
      }
      return `### Superposition & Hadamard Transformation\nThe Hadamard gate H is a Hermitian unitary operator:\n$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$\n\nApplying H to standard computational basis states produces the diagonal Fourier basis:\n• $H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$\n• $H|1\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$\n\nNotice that the state $|-\\rangle$ carries a relative phase of $\\pi$ (represented by $-1$). While both states yield identical 50/50 measurement probabilities in the Z-basis, their interference behaviors are completely opposite!`;
    }

    // 3. Questions about Entanglement & Bell States
    if (qLower.includes('entangle') || qLower.includes('bell state') || qLower.includes('cnot')) {
      return `### Entanglement & Bell States\nQuantum entanglement occurs when two or more qubits exist in a composite state that **cannot be factored** into independent individual qubit states:\n\n$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}} \\ne (|\\psi_A\\rangle \\otimes |\\psi_B\\rangle)$$\n\n**How to prepare it:**\n1. Place an **H gate** on qubit 0 (creates superposition on q0).\n2. Place a **CNOT (CX) gate** with q0 as control and q1 as target.\n\n**Result:** If q0 collapses to 0, q1 collapses to 0. If q0 collapses to 1, q1 collapses to 1. The outcomes are perfectly correlated!`;
    }

    // 4. Questions about Measurement & Collapse
    if (qLower.includes('measurement') || qLower.includes('collapse') || qLower.includes('born rule')) {
      return `### Quantum Measurement & The Born Rule\n1. **The Born Rule:** The probability of observing eigenstate $|k\\rangle$ upon measuring state $|\\psi\\rangle = \\sum_i c_i |i\\rangle$ is given by the squared magnitude of its amplitude:\n$$P(k) = |c_k|^2$$\n2. **State Collapse:** Measurement is non-unitary and irreversible. It projects the quantum superposition into a single definitive classical state.\n3. **Multiple Shots:** Because a single measurement gives only one outcome, we perform repeated experiments ("shots", e.g. 1024 runs) to reconstruct the true probability distribution.`;
    }

    // 5. Questions about Grover's Search or Quantum Speedup
    if (qLower.includes('grover') || qLower.includes('search') || qLower.includes('speedup')) {
      return `### Grover's Algorithm & Quadratic Speedup\nGrover's algorithm searches an unsorted database of $N = 2^n$ items in $O(\\sqrt{N})$ queries, compared to $O(N)$ classically.\n\n**Core Steps:**\n1. **Superposition:** Uniformly superpose all states with $H^{\\otimes n}$.\n2. **Oracle ($U_w$):** Inverts the phase of the target marked state: $(-1)^{f(x)}|x\\rangle$.\n3. **Diffusion Operator ($2|s\\rangle\\langle s| - I$):** Inverts all amplitudes about their average mean, geometrically amplifying the target amplitude.\n\n*Note on Speedup:* In small simulations (like 2-4 qubits in a browser), classical computers can easily track the state vector. Real quantum speedup emerges when $n \\ge 50$ qubits, where $2^{50} \\approx 10^{15}$ amplitudes exceed classical memory!`;
    }

    // 6. Questions about Debugging or Unexpected Probabilities
    if (qLower.includes('debug') || qLower.includes('unexpected') || qLower.includes('wrong') || qLower.includes('error')) {
      return `### Troubleshooting Circuit Probabilities\nIf your circuit is producing unexpected results, check these common causes:\n1. **Phase Cancellation:** Did a Hadamard gate destructively interfere with a previous gate (e.g. H·Z·H produces state |1⟩)?\n2. **Target vs Control:** In CNOT (CX), ensure qubit 0 is the intended control and qubit 1 is the target. Reversing them flips the conditioning!\n3. **Gate Overlaps:** Check the **Circuit Debugger** tab to ensure no gates occupy identical timeline slots on the same wire.\n4. **Try the Optimization Lab:** It can highlight redundant gate pairs like adjacent X-X or H-H operations.`;
    }

    // 7. Questions about Google Willow QPU, Hardware & Surface Code Thresholds
    if (qLower.includes('willow') || qLower.includes('threshold') || qLower.includes('surface code') || qLower.includes('hardware')) {
      return `### Google Quantum AI "Willow" Processor & Below-Threshold Error Correction\nIn December 2024, Google Quantum AI introduced the **Willow** superconducting processor:\n\n• **Qubit Count:** 105 physical qubits in a 2D planar square grid.\n• **Historical Breakthrough:** Demonstrated quantum error correction operating **below the fault-tolerant surface code threshold**.\n• **Exponential Error Scaling:** As the surface code distance increased from $d=3$ to $d=5$ to $d=7$, the logical qubit error rate decreased exponentially. This proved the fundamental requirement for building scalable fault-tolerant quantum computers!\n• **Benchmark Performance:** Completed a random circuit sampling task in under 5 minutes that would take modern classical supercomputers an estimated $10^{25}$ years.`;
    }

    // 8. Questions about VQE & Quantum Chemistry
    if (qLower.includes('vqe') || qLower.includes('chemistry') || qLower.includes('molecule') || qLower.includes('energy')) {
      return `### Variational Quantum Eigensolver (VQE) in Quantum Chemistry\nVQE is a hybrid quantum-classical algorithm designed for NISQ hardware to find the ground-state energy of molecular electronic Hamiltonians:\n\n1. **Fermionic Mapping:** Molecular orbitals are mapped to qubits via Jordan-Wigner or Parity transformations: $H = \\sum_i c_i P_i$ where $P_i$ are Pauli strings ($X, Y, Z$).\n2. **Parameterized Ansatz:** A quantum circuit prepares trial wave function $|\\psi(\\vec{\\theta})\\rangle$ using rotation gates ($R_Y, R_Z$) and entanglers ($CX$).\n3. **Energy Expectation:** Measure $\\langle H \\rangle = \\langle \\psi(\\vec{\\theta}) | H | \\psi(\\vec{\\theta}) \\rangle$.\n4. **Classical Optimization:** A classical optimizer (COBYLA/SPSA) adjusts $\\vec{\\theta}$ to minimize energy by the variational principle: $E_0 \\le \\langle H \\rangle$.\n\nCheck the **Science & VQE Lab** tab in the sidebar to simulate $H_2$ and $LiH$ potential energy curves across varying interatomic bond distances!`;
    }

    // Default pedagogical response
    return `### AI Quantum Tutor Guidance\nI am here to guide your quantum learning journey. Here are some topics we can explore:\n\n• **"Explain superposition and the Hadamard gate"**\n• **"How does CNOT create entanglement?"**\n• **"Why are Bell state outcomes correlated?"**\n• **"Explain my current circuit"**\n• **"How does Grover's search achieve quadratic speedup?"**\n• **"What does circuit depth mean?"**\n\nAsk any question or click one of the suggested prompts below!`;
  }
}
