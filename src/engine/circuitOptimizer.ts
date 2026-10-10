/**
 * Circuit Optimization Lab Engine
 * Performs mathematically sound quantum circuit reductions and reports depth / gate count changes.
 */

import { Circuit, Gate, OptimizationResult, OptimizationStep } from '../types/quantum';
import { QuantumSimulator } from './quantumSimulator';
import { ComplexMath } from './complex';

export class CircuitOptimizer {
  /**
   * Optimize circuit and mathematically verify state preservation
   */
  static optimize(circuit: Circuit): OptimizationResult {
    const originalDepth = QuantumSimulator.computeCircuitDepth(circuit);
    const originalGateCount = circuit.gates.filter((g) => g.type !== 'BARRIER').length;
    const originalSim = QuantumSimulator.simulate(circuit);

    let workingGates = [...circuit.gates];
    const steps: OptimizationStep[] = [];

    // Step 1: Remove redundant identity gates
    const nonIdentityGates: Gate[] = [];
    const removedIdentityIds: string[] = [];
    for (const g of workingGates) {
      if (g.type === 'I') {
        removedIdentityIds.push(g.id);
      } else {
        nonIdentityGates.push(g);
      }
    }

    if (removedIdentityIds.length > 0) {
      steps.push({
        type: 'identity_removal',
        description: `Removed ${removedIdentityIds.length} redundant Identity (I) operation(s).`,
        removedGateIds: removedIdentityIds,
      });
      workingGates = nonIdentityGates;
    }

    // Step 2: Cancel adjacent self-inverses on same qubit wires (H-H, X-X, Y-Y, Z-Z, CX-CX)
    const cancelledGateIds: string[] = [];
    // Group gates per qubit wire and check chronological adjacency
    let changed = true;
    while (changed) {
      changed = false;
      const sorted = [...workingGates].sort((a, b) => a.col - b.col);

      for (let i = 0; i < sorted.length - 1; i++) {
        const g1 = sorted[i];
        const g2 = sorted[i + 1];

        if (cancelledGateIds.includes(g1.id) || cancelledGateIds.includes(g2.id)) continue;

        // Check single-qubit self-inverse
        if (
          g1.qubit === g2.qubit &&
          g1.targetQubit === undefined &&
          g2.targetQubit === undefined &&
          (g1.type === 'H' || g1.type === 'X' || g1.type === 'Y' || g1.type === 'Z') &&
          g1.type === g2.type
        ) {
          // Check if any other gate intervened on this qubit between col1 and col2
          const intervened = sorted.some(
            (other) =>
              other.id !== g1.id &&
              other.id !== g2.id &&
              (other.qubit === g1.qubit || other.targetQubit === g1.qubit) &&
              other.col > g1.col &&
              other.col < g2.col
          );

          if (!intervened) {
            cancelledGateIds.push(g1.id, g2.id);
            steps.push({
              type: 'cancellation',
              description: `Cancelled adjacent self-inverse pair: ${g1.type} followed by ${g2.type} on qubit ${g1.qubit} (U · U = I).`,
              removedGateIds: [g1.id, g2.id],
            });
            workingGates = workingGates.filter((g) => g.id !== g1.id && g.id !== g2.id);
            changed = true;
            break;
          }
        }

        // Check CNOT adjacent cancellation
        if (
          g1.type === 'CX' &&
          g2.type === 'CX' &&
          g1.qubit === g2.qubit &&
          g1.targetQubit === g2.targetQubit
        ) {
          const intervened = sorted.some(
            (other) =>
              other.id !== g1.id &&
              other.id !== g2.id &&
              (other.qubit === g1.qubit ||
                other.qubit === g1.targetQubit ||
                other.targetQubit === g1.qubit ||
                other.targetQubit === g1.targetQubit) &&
              other.col > g1.col &&
              other.col < g2.col
          );

          if (!intervened) {
            cancelledGateIds.push(g1.id, g2.id);
            steps.push({
              type: 'cancellation',
              description: `Cancelled back-to-back CNOT gates between control q${g1.qubit} and target q${g1.targetQubit} (CNOT · CNOT = I).`,
              removedGateIds: [g1.id, g2.id],
            });
            workingGates = workingGates.filter((g) => g.id !== g1.id && g.id !== g2.id);
            changed = true;
            break;
          }
        }
      }
    }

    // Step 3: Re-compact column indices to eliminate gaps
    const finalGates = this.compactColumns(workingGates, circuit.numQubits);

    const optimizedCircuit: Circuit = {
      ...circuit,
      id: `${circuit.id}_opt`,
      name: `${circuit.name} (Optimized)`,
      gates: finalGates,
    };

    const optimizedDepth = QuantumSimulator.computeCircuitDepth(optimizedCircuit);
    const optimizedGateCount = finalGates.filter((g) => g.type !== 'BARRIER').length;
    const optimizedSim = QuantumSimulator.simulate(optimizedCircuit);

    // Verify mathematical state preservation
    let isEquivalent = true;
    for (let idx = 0; idx < originalSim.stateVector.length; idx++) {
      const origAmp = originalSim.stateVector[idx].amplitude;
      const optAmp = optimizedSim.stateVector[idx].amplitude;
      if (!ComplexMath.approxEqual(origAmp, optAmp, 1e-4)) {
        isEquivalent = false;
        break;
      }
    }

    return {
      originalCircuit: circuit,
      optimizedCircuit,
      originalDepth,
      optimizedDepth,
      originalGateCount,
      optimizedGateCount,
      steps,
      isEquivalent,
    };
  }

  /**
   * Compresses timeline columns while preserving quantum dependencies
   */
  private static compactColumns(gates: Gate[], numQubits: number): Gate[] {
    const sorted = [...gates].sort((a, b) => a.col - b.col);
    const wireAvailability: number[] = new Array(numQubits).fill(0);
    const compacted: Gate[] = [];

    for (const g of sorted) {
      const q1 = g.qubit;
      const q2 = g.targetQubit;

      let nextCol = wireAvailability[q1] || 0;
      if (q2 !== undefined && q2 < numQubits) {
        nextCol = Math.max(nextCol, wireAvailability[q2] || 0);
        wireAvailability[q1] = nextCol + 1;
        wireAvailability[q2] = nextCol + 1;
      } else {
        wireAvailability[q1] = nextCol + 1;
      }

      compacted.push({
        ...g,
        col: nextCol,
      });
    }

    return compacted;
  }
}
