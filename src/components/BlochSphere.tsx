/**
 * Interactive 3D / SVG Bloch Sphere
 * Visualizes single-qubit states, rotations, polar/azimuthal angles, and reduced density matrix purity.
 */

import React, { useState } from 'react';
import { Circuit, Gate, GateType } from '../types/quantum';
import { QuantumSimulator } from '../engine/quantumSimulator';
import { RotateCw, Eye, Sparkles, HelpCircle } from 'lucide-react';

interface BlochSphereProps {
  circuit: Circuit;
  onApplyGateToCircuit?: (gate: Gate) => void;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({
  circuit,
  onApplyGateToCircuit,
}) => {
  const [selectedQubit, setSelectedQubit] = useState<number>(0);
  const [viewRotY, setViewRotY] = useState<number>(35); // View camera azimuthal rotation
  const [viewRotX, setViewRotX] = useState<number>(20); // View camera elevation tilt

  // Run simulation to get exact Bloch vectors computed from partial traces
  const simResult = QuantumSimulator.simulate(circuit);
  const blochVectors = simResult.blochVectors;
  const currentVector = blochVectors[selectedQubit] || {
    qubit: 0,
    x: 0,
    y: 0,
    z: 1,
    theta: 0,
    phi: 0,
    purity: 1.0,
  };

  const { x, y, z, theta, phi, purity } = currentVector;
  const isEntangled = purity < 0.95;

  // Project 3D coordinate (x, y, z) to 2D SVG canvas using camera rotation angles
  const project3D = (px: number, py: number, pz: number, radius = 110) => {
    const radY = (viewRotY * Math.PI) / 180;
    const radX = (viewRotX * Math.PI) / 180;

    // Rotate around Y axis
    const x1 = px * Math.cos(radY) + py * Math.sin(radY);
    const y1 = -px * Math.sin(radY) + py * Math.cos(radY);
    const z1 = pz;

    // Rotate around X axis
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Canvas center (160, 160)
    const centerX = 160;
    const centerY = 160;

    return {
      cx: centerX + x2 * radius,
      cy: centerY - z2 * radius, // Invert Y for screen coords
      depth: y2,
    };
  };

  // Center & pole projected coordinates
  const origin = project3D(0, 0, 0);
  const northPole = project3D(0, 0, 1);
  const southPole = project3D(0, 0, -1);
  const xAxisPos = project3D(1, 0, 0);
  const xAxisNeg = project3D(-1, 0, 0);
  const yAxisPos = project3D(0, 1, 0);
  const yAxisNeg = project3D(0, -1, 0);

  // Vector endpoint coordinates
  const vectorHead = project3D(x, y, z);

  const handleQuickGate = (type: GateType) => {
    if (!onApplyGateToCircuit) return;
    const maxCol = Math.max(0, ...circuit.gates.map((g) => g.col + 1));
    const newGate: Gate = {
      id: `gate_bloch_${Date.now()}`,
      type,
      qubit: selectedQubit,
      col: maxCol,
    };
    onApplyGateToCircuit(newGate);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Qubit Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-300">Target Qubit:</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: circuit.numQubits }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedQubit(idx)}
                className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all ${
                  selectedQubit === idx
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                q[{idx}]
              </button>
            ))}
          </div>
        </div>

        {/* Camera Tilt & Rotate Controls */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Azimuth:</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={viewRotY}
              onChange={(e) => setViewRotY(parseInt(e.target.value, 10))}
              className="w-20 accent-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span>Elevation:</span>
            <input
              type="range"
              min="-60"
              max="60"
              value={viewRotX}
              onChange={(e) => setViewRotX(parseInt(e.target.value, 10))}
              className="w-20 accent-cyan-400"
            />
          </div>

          <button
            onClick={() => {
              setViewRotY(35);
              setViewRotX(20);
            }}
            className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Reset view angles"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Bloch Sphere Canvas & Metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 3D SVG Bloch Sphere Viewer */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#070e20] p-6 shadow-2xl lg:col-span-7">
          <svg
            viewBox="0 0 320 320"
            className="h-80 w-80 select-none overflow-visible"
          >
            <defs>
              {/* Radial gradient for sphere backdrop */}
              <radialGradient id="sphereGlow" cx="45%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
                <stop offset="60%" stopColor="#1e1b4b" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.7" />
              </radialGradient>

              {/* Vector arrow head marker */}
              <marker
                id="arrowHead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="#06b6d4" />
              </marker>
            </defs>

            {/* Sphere Background Circle */}
            <circle
              cx="160"
              cy="160"
              r="110"
              fill="url(#sphereGlow)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />

            {/* Equator Ellipse */}
            <ellipse
              cx="160"
              cy="160"
              rx="110"
              ry={110 * Math.sin(((viewRotX + 90) * Math.PI) / 180) * 0.35}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Prime Meridian Ellipse */}
            <ellipse
              cx="160"
              cy="160"
              rx={110 * Math.sin((viewRotY * Math.PI) / 180) * 0.4}
              ry="110"
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Z-Axis (Vertical through poles) */}
            <line
              x1={southPole.cx}
              y1={southPole.cy}
              x2={northPole.cx}
              y2={northPole.cy}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* North Pole |0⟩ */}
            <circle cx={northPole.cx} cy={northPole.cy} r="4" fill="#38bdf8" />
            <text
              x={northPole.cx}
              y={northPole.cy - 10}
              textAnchor="middle"
              className="fill-cyan-300 font-mono text-[11px] font-bold"
            >
              |0⟩ (+Z)
            </text>
            {/* South Pole |1⟩ */}
            <circle cx={southPole.cx} cy={southPole.cy} r="4" fill="#64748b" />
            <text
              x={southPole.cx}
              y={southPole.cy + 16}
              textAnchor="middle"
              className="fill-slate-400 font-mono text-[11px]"
            >
              |1⟩ (-Z)
            </text>

            {/* X-Axis */}
            <line
              x1={xAxisNeg.cx}
              y1={xAxisNeg.cy}
              x2={xAxisPos.cx}
              y2={xAxisPos.cy}
              stroke="#475569"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text
              x={xAxisPos.cx + 8}
              y={xAxisPos.cy + 4}
              className="fill-emerald-400 font-mono text-[10px]"
            >
              |+⟩ (+X)
            </text>

            {/* Y-Axis */}
            <line
              x1={yAxisNeg.cx}
              y1={yAxisNeg.cy}
              x2={yAxisPos.cx}
              y2={yAxisPos.cy}
              stroke="#475569"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text
              x={yAxisPos.cx - 10}
              y={yAxisPos.cy + 12}
              className="fill-violet-400 font-mono text-[10px]"
            >
              |+i⟩ (+Y)
            </text>

            {/* Center Origin Dot */}
            <circle cx={origin.cx} cy={origin.cy} r="2.5" fill="#475569" />

            {/* Bloch State Vector Arrow */}
            <line
              x1={origin.cx}
              y1={origin.cy}
              x2={vectorHead.cx}
              y2={vectorHead.cy}
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrowHead)"
            />

            {/* Endpoint Sphere Marker */}
            <circle
              cx={vectorHead.cx}
              cy={vectorHead.cy}
              r="5"
              fill="#22d3ee"
              stroke="#083344"
              strokeWidth="1.5"
            />
          </svg>

          {/* Entanglement & Mixed State Indicator */}
          {isEntangled && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-800/60 bg-amber-950/40 px-3 py-1.5 text-xs text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Entangled State Detected (Mixed Reduced State):</strong> Bloch vector length
                r = {Math.sqrt(x * x + y * y + z * z).toFixed(2)} &lt; 1.0 (Purity: {(purity * 100).toFixed(1)}%).
              </span>
            </div>
          )}
        </div>

        {/* State Coordinates & Gate Action Panel */}
        <div className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-semibold text-slate-200">
                BLOCH COORDINATES (q[{selectedQubit}])
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold ${
                  purity > 0.98
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                }`}
              >
                {purity > 0.98 ? 'PURE STATE (r=1.0)' : `MIXED (Purity: ${(purity * 100).toFixed(0)}%)`}
              </span>
            </div>

            {/* Cartesian Expectation Values */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                <div className="text-[10px] text-slate-500">⟨X⟩</div>
                <div className="font-bold text-cyan-300">{x.toFixed(3)}</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                <div className="text-[10px] text-slate-500">⟨Y⟩</div>
                <div className="font-bold text-violet-300">{y.toFixed(3)}</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                <div className="text-[10px] text-slate-500">⟨Z⟩</div>
                <div className="font-bold text-blue-300">{z.toFixed(3)}</div>
              </div>
            </div>

            {/* Spherical Angles */}
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Polar Angle θ (Z tilt):</span>
                <span className="font-mono text-cyan-300">
                  {theta.toFixed(3)} rad ({((theta * 180) / Math.PI).toFixed(1)}°)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Azimuthal Angle φ (X-Y plane):</span>
                <span className="font-mono text-violet-300">
                  {phi.toFixed(3)} rad ({((phi * 180) / Math.PI).toFixed(1)}°)
                </span>
              </div>
            </div>

            {/* Quick Interactive Gate Transformations */}
            {onApplyGateToCircuit && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <RotateCw className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Apply Transformation to q[{selectedQubit}]</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleQuickGate('H')}
                    className="rounded bg-blue-600/80 px-2 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Hadamard
                  </button>
                  <button
                    onClick={() => handleQuickGate('X')}
                    className="rounded bg-violet-600/80 px-2 py-1.5 text-xs font-bold text-white hover:bg-violet-500"
                  >
                    Pauli-X
                  </button>
                  <button
                    onClick={() => handleQuickGate('Z')}
                    className="rounded bg-violet-600/80 px-2 py-1.5 text-xs font-bold text-white hover:bg-violet-500"
                  >
                    Pauli-Z
                  </button>
                  <button
                    onClick={() => handleQuickGate('S')}
                    className="rounded bg-indigo-600/80 px-2 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    S (π/2)
                  </button>
                  <button
                    onClick={() => handleQuickGate('T')}
                    className="rounded bg-indigo-600/80 px-2 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    T (π/4)
                  </button>
                  <button
                    onClick={() => handleQuickGate('Y')}
                    className="rounded bg-violet-600/80 px-2 py-1.5 text-xs font-bold text-white hover:bg-violet-500"
                  >
                    Pauli-Y
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-slate-300 font-semibold mb-1">
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Bloch Sphere Physical Meaning</span>
            </div>
            Any pure single-qubit state can be uniquely represented as a point on the surface of the unit sphere:
            |ψ⟩ = cos(θ/2)|0⟩ + e^{'{iφ}'}sin(θ/2)|1⟩. When entangled, the state contracts into the interior of the sphere.
          </div>
        </div>
      </div>
    </div>
  );
};
