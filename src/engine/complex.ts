/**
 * Complex Number Math Utility for Quantum Mechanics
 */

import { Complex } from '../types/quantum';

export const ComplexMath = {
  create(r: number, i: number = 0): Complex {
    return { r, i };
  },

  zero(): Complex {
    return { r: 0, i: 0 };
  },

  one(): Complex {
    return { r: 1, i: 0 };
  },

  i(): Complex {
    return { r: 0, i: 1 };
  },

  add(a: Complex, b: Complex): Complex {
    return { r: a.r + b.r, i: a.i + b.i };
  },

  sub(a: Complex, b: Complex): Complex {
    return { r: a.r - b.r, i: a.i - b.i };
  },

  mul(a: Complex, b: Complex): Complex {
    return {
      r: a.r * b.r - a.i * b.i,
      i: a.r * b.i + a.i * b.r,
    };
  },

  scale(a: Complex, scalar: number): Complex {
    return { r: a.r * scalar, i: a.i * scalar };
  },

  div(a: Complex, b: Complex): Complex {
    const denom = b.r * b.r + b.i * b.i;
    if (denom === 0) return { r: 0, i: 0 };
    return {
      r: (a.r * b.r + a.i * b.i) / denom,
      i: (a.i * b.r - a.r * b.i) / denom,
    };
  },

  conjugate(a: Complex): Complex {
    return { r: a.r, i: -a.i };
  },

  magnitudeSq(a: Complex): number {
    return a.r * a.r + a.i * a.i;
  },

  magnitude(a: Complex): number {
    return Math.sqrt(a.r * a.r + a.i * a.i);
  },

  phase(a: Complex): number {
    return Math.atan2(a.i, a.r);
  },

  fromPolar(magnitude: number, phase: number): Complex {
    return {
      r: magnitude * Math.cos(phase),
      i: magnitude * Math.sin(phase),
    };
  },

  format(c: Complex, decimals: number = 3): string {
    const r = Math.abs(c.r) < 1e-6 ? 0 : Number(c.r.toFixed(decimals));
    const i = Math.abs(c.i) < 1e-6 ? 0 : Number(c.i.toFixed(decimals));

    if (i === 0) return `${r}`;
    if (r === 0) {
      if (i === 1) return 'i';
      if (i === -1) return '-i';
      return `${i}i`;
    }

    const sign = i > 0 ? '+' : '-';
    const absI = Math.abs(i);
    const iStr = absI === 1 ? 'i' : `${absI}i`;
    return `${r} ${sign} ${iStr}`;
  },

  approxEqual(a: Complex, b: Complex, tolerance: number = 1e-5): boolean {
    return Math.abs(a.r - b.r) <= tolerance && Math.abs(a.i - b.i) <= tolerance;
  },
};
