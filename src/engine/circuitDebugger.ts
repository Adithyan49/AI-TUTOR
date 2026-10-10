/**
 * Quantum Circuit Debugger & Diagnostic Engine
 * Analyzes circuits for semantic, structural, and mathematical anomalies.
 */

import { Circuit, CircuitValidationError, Gate } from '../types/quantum';
import { QuantumSimulator } from './quantumSimulator';

export class CircuitDebugger {
  /**
   * Run comprehensive diagnostic audit on a circuit
   */
  static validate(circuit: Circuit): CircuitValidationError[] {
    const errors: CircuitValidationError[] = [];
    const numQubits = circuit.numQubits;

    // 1. Check for wire collisions (multiple gates at the same qubit & column)
    const wireOccupation = new Map<string, Gate>();

    for (const gate of circuit.gates) {
      // Check qubit bounds
      if (gate.qubit < 0 || gate.qubit >= numQubits) {
        errors.push({
          id: `bound-qubit-${gate.id}`,
          severity: 'error',
          message: `Gate ${gate.type} assigned to qubit q${gate.qubit}, which exceeds circuit capacity (0 to ${numQubits - 1}).`,
          qubit: gate.qubit,
          col: gate.col,
          gateId: gate.id,
          suggestedFix: `Resize circuit qubits or move gate to wire q${numQubits - 1}.`,
          canAutoFix: true,
        });
      }

      // Check target qubit bounds for multi-qubit gates
      if (gate.type === 'CX' || gate.type === 'CZ' || gate.type === 'SWAP') {
        if (gate.targetQubit === undefined) {
          errors.push({
            id: `missing-target-${gate.id}`,
            severity: 'error',
            message: `Two-qubit gate ${gate.type} on control q${gate.qubit} is missing a target qubit.`,
            qubit: gate.qubit,
            col: gate.col,
            gateId: gate.id,
            suggestedFix: `Assign a valid distinct target qubit (e.g. q${gate.qubit === 0 ? 1 : 0}).`,
            canAutoFix: true,
          });
        } else if (gate.targetQubit === gate.qubit) {
          errors.push({
            id: `self-target-${gate.id}`,
            severity: 'error',
            message: `Two-qubit gate ${gate.type} has control and target set to the same qubit q${gate.qubit}. A quantum gate cannot act on itself as both control and target.`,
            qubit: gate.qubit,
            col: gate.col,
            gateId: gate.id,
            suggestedFix: `Change target qubit to a distinct wire.`,
            canAutoFix: true,
          });
        } else if (gate.targetQubit >= numQubits) {
          errors.push({
            id: `bound-target-${gate.id}`,
            severity: 'error',
            message: `Target qubit q${gate.targetQubit} for ${gate.type} gate exceeds circuit capacity.`,
            qubit: gate.targetQubit,
            col: gate.col,
            gateId: gate.id,
            suggestedFix: `Adjust target qubit index.`,
            canAutoFix: true,
          });
        }
      }

      // Check parameter validity for rotation gates
      if (gate.type === 'RX' || gate.type === 'RY' || gate.type === 'RZ') {
        if (gate.params?.theta !== undefined && isNaN(gate.params.theta)) {
          errors.push({
            id: `invalid-param-${gate.id}`,
            severity: 'error',
            message: `Rotation gate ${gate.type} has invalid angle parameter (NaN).`,
            qubit: gate.qubit,
            col: gate.col,
            gateId: gate.id,
            suggestedFix: `Set rotation angle θ to π/2 or 0.`,
            canAutoFix: true,
          });
        }
      }

      // Collision detection on control/primary wire
      const keyPrimary = `q${gate.qubit}_c${gate.col}`;
      if (wireOccupation.has(keyPrimary)) {
        const existing = wireOccupation.get(keyPrimary)!;
        errors.push({
          id: `collision-${gate.id}-${existing.id}`,
          severity: 'warning',
          message: `Timeline collision: Both gate ${existing.type} and ${gate.type} are placed on qubit q${gate.qubit} at column ${gate.col}.`,
          qubit: gate.qubit,
          col: gate.col,
          gateId: gate.id,
          suggestedFix: `Shift gate to column ${gate.col + 1} to ensure sequential unitary execution.`,
          canAutoFix: true,
        });
      } else {
        wireOccupation.set(keyPrimary, gate);
      }

      // Collision detection on target wire
      if (gate.targetQubit !== undefined) {
        const keyTarget = `q${gate.targetQubit}_c${gate.col}`;
        if (wireOccupation.has(keyTarget)) {
          const existing = wireOccupation.get(keyTarget)!;
          errors.push({
            id: `collision-target-${gate.id}-${existing.id}`,
            severity: 'warning',
            message: `Timeline collision: Target wire q${gate.targetQubit} of ${gate.type} intersects with gate ${existing.type} at column ${gate.col}.`,
            qubit: gate.targetQubit,
            col: gate.col,
            gateId: gate.id,
            suggestedFix: `Shift gate to column ${gate.col + 1}.`,
            canAutoFix: true,
          });
        } else {
          wireOccupation.set(keyTarget, gate);
        }
      }
    }

    // 2. State Simulation Normalization Check
    try {
      const sim = QuantumSimulator.simulate(circuit);
      if (!sim.isNormalized) {
        errors.push({
          id: 'unnormalized-state',
          severity: 'error',
          message: `State vector norm is ${sim.norm.toFixed(4)}, deviating from unitary conservation (norm must equal 1.0).`,
          suggestedFix: `Inspect non-unitary custom gates.`,
          canAutoFix: false,
        });
      }
    } catch (err: any) {
      errors.push({
        id: 'simulation-runtime-error',
        severity: 'error',
        message: `Simulation engine failed: ${err.message || 'Unknown error'}`,
        suggestedFix: `Reset circuit to a known valid configuration.`,
        canAutoFix: false,
      });
    }

    // 3. Measurement presence recommendations
    const hasMeasurements = circuit.gates.some((g) => g.type === 'MEASURE');
    if (!hasMeasurements && circuit.gates.length > 0) {
      errors.push({
        id: 'missing-measurement-info',
        severity: 'info',
        message: 'No measurement operations found in this circuit. While state vectors are computed in simulator mode, real quantum computers require measurement operations to extract classical bits.',
        suggestedFix: 'Add Measurement gates at the end of the circuit.',
        canAutoFix: true,
      });
    }

    return errors;
  }

  /**
   * Applies safe automated repairs to known circuit issues
   */
  static autoFixCircuit(circuit: Circuit): Circuit {
    const numQubits = circuit.numQubits;
    const fixedGates: Gate[] = [];
    const usedSlots = new Set<string>();

    for (const g of circuit.gates) {
      let q = Math.max(0, Math.min(numQubits - 1, g.qubit));
      let targetQ = g.targetQubit;

      if (g.type === 'CX' || g.type === 'CZ' || g.type === 'SWAP') {
        if (targetQ === undefined || targetQ === q || targetQ >= numQubits) {
          targetQ = q === 0 ? Math.min(numQubits - 1, 1) : 0;
        }
      }

      let col = Math.max(0, g.col);
      // Ensure no collision
      while (
        usedSlots.has(`q${q}_c${col}`) ||
        (targetQ !== undefined && usedSlots.has(`q${targetQ}_c${col}`))
      ) {
        col++;
      }

      usedSlots.add(`q${q}_c${col}`);
      if (targetQ !== undefined) {
        usedSlots.add(`q${targetQ}_c${col}`);
      }

      fixedGates.push({
        ...g,
        qubit: q,
        targetQubit: targetQ,
        col,
      });
    }

    return {
      ...circuit,
      gates: fixedGates,
    };
  }
}
