/**
 * Modular Quantum Backend Adapters Architecture
 * Accurately models and reports external quantum computing backends
 * without fabricating false connectivity.
 */

import { QuantumBackend } from '../types/quantum';

export const QUANTUM_BACKENDS: QuantumBackend[] = [
  {
    id: 'local_browser_statevector',
    name: 'Browser State-Vector Engine (Local)',
    provider: 'AI Quantum Tutor Built-in',
    type: 'local_browser',
    status: 'connected',
    description: 'High-speed browser-based state-vector linear algebra simulation engine with zero external dependencies.',
    maxQubits: 8,
    supportsNoise: true,
    requirements: ['Modern Web Browser with WebAssembly/ES2022 support', 'Zero API keys required'],
    apiDocsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  {
    id: 'qiskit_aer',
    name: 'Qiskit Aer (IBM Quantum)',
    provider: 'IBM Quantum / Qiskit Community',
    type: 'cloud_service',
    status: 'available',
    description: 'High-performance C++ simulator backend with realistic noise models and quantum matrix product state (MPS) capabilities.',
    maxQubits: 32,
    supportsNoise: true,
    requirements: [
      'Python 3.10+ runtime environment',
      'pip install qiskit qiskit-aer',
      'Local HTTP bridge service running on port 8000 (optional)',
      'IBM Quantum API token for hardware QPU submission',
    ],
    apiDocsUrl: 'https://docs.quantum.ibm.com/',
  },
  {
    id: 'pennylane_xanadu',
    name: 'PennyLane Lightning',
    provider: 'Xanadu Quantum Technologies',
    type: 'cloud_service',
    status: 'available',
    description: 'Differentiable quantum computing simulator designed for quantum machine learning (QML) and variational quantum algorithms (VQA).',
    maxQubits: 28,
    supportsNoise: true,
    requirements: [
      'Python 3.10+ runtime',
      'pip install pennylane pennylane-lightning',
      'PyTorch or TensorFlow for hybrid gradient optimization',
    ],
    apiDocsUrl: 'https://pennylane.ai/',
  },
  {
    id: 'cirq_google',
    name: 'Google Cirq Simulator',
    provider: 'Google Quantum AI',
    type: 'cloud_service',
    status: 'available',
    description: 'Specialized framework for NISQ (Noisy Intermediate-Scale Quantum) algorithms and quantum supremacy architectures.',
    maxQubits: 26,
    supportsNoise: true,
    requirements: [
      'Python 3.10+ runtime',
      'pip install cirq',
      'Google Cloud Project credentials for Quantum Engine QPU access',
    ],
    apiDocsUrl: 'https://quantumai.google/cirq',
  },
  {
    id: 'qbraid_platform',
    name: 'qBraid Cloud Bridge',
    provider: 'qBraid Platform',
    type: 'cloud_service',
    status: 'requires_auth',
    description: 'Unified multi-cloud bridge aggregating AWS Braket, Rigetti, QuEra, IonQ, and Oxford Quantum Circuits under one API.',
    maxQubits: 64,
    supportsNoise: true,
    requirements: [
      'qBraid API Key and account subscription',
      'pip install qbraid',
      'Cloud proxy authentication',
    ],
    apiDocsUrl: 'https://docs.qbraid.com/',
  },
];

export class BackendManager {
  static getBackends(): QuantumBackend[] {
    return QUANTUM_BACKENDS;
  }

  static getActiveBackend(): QuantumBackend {
    return QUANTUM_BACKENDS[0]; // Local browser simulator is always active and default
  }

  /**
   * Generates a starter Python bridge script for developers wishing to connect external SDKs
   */
  static generateBridgeSnippet(backendId: string): string {
    switch (backendId) {
      case 'qiskit_aer':
        return `# Qiskit Aer Local HTTP Bridge (FastAPI / Flask)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import uvicorn

app = FastAPI(title="Qiskit Aer Bridge for AI Quantum Tutor")
simulator = AerSimulator()

class CircuitPayload(BaseModel):
    num_qubits: int
    qiskit_code: str
    shots: int = 1024

@app.post("/simulate")
async def run_simulation(payload: CircuitPayload):
    # Execute circuit via Aer
    try:
        # Secure execution environment
        qc = QuantumCircuit(payload.num_qubits)
        # Apply operations...
        result = simulator.run(qc, shots=payload.shots).result()
        counts = result.get_counts(qc)
        return {"status": "success", "counts": counts}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)`;

      case 'pennylane_xanadu':
        return `# PennyLane Differentiable Quantum Bridge
import pennylane as qml
from fastapi import FastAPI

app = FastAPI(title="PennyLane Lightning Bridge")
dev = qml.device("lightning.qubit", wires=4)

@qml.qnode(dev)
def sample_circuit(params):
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    qml.RY(params[0], wires=1)
    return qml.probs(wires=[0, 1])

@app.post("/simulate_vqa")
def simulate_vqa(param: float = 0.5):
    probs = sample_circuit([param])
    return {"probabilities": probs.tolist()}`;

      case 'cirq_google':
        return `# Google Cirq Bridge Service
import cirq
from fastapi import FastAPI

app = FastAPI(title="Cirq Simulator Bridge")

@app.get("/cirq-bell")
def simulate_cirq_bell():
    q0, q1 = cirq.LineQubit.range(2)
    circuit = cirq.Circuit(
        cirq.H(q0),
        cirq.CNOT(q0, q1),
        cirq.measure(q0, key="m0"),
        cirq.measure(q1, key="m1")
    )
    sim = cirq.Simulator()
    result = sim.run(circuit, repetitions=1024)
    histogram = result.histogram(key="m0")
    return {"status": "success", "counts": dict(histogram)}`;

      default:
        return `# External Backend Connection Spec
# Run this service locally and configure the endpoint in settings.`;
    }
  }
}
