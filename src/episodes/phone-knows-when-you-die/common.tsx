// common.tsx — shared helpers for the phone episode's 23 scene files.
// - camFor: piecewise camera (board framing + hard cuts at sentence boundaries)
// - bob: the board's breathing bob, driven by the global frame
// - mouth: lip-sync openness at the global frame (0 = silent, mouth hidden)
// - recline: the bed-shot wrapper (rotate -25° around the base, as boarded)
import { camAt, Framing } from './kit-phone';
import { SHOT_TIMING } from './timing';
import { mouthAt } from './lipsyncEnvelope';

export const FPS = 30;

/** Camera for a shot: board framing first, closer framings after each cut. */
export const camFor = (id: string, t: number, framings: Framing[]): string => {
  const T = SHOT_TIMING[id];
  return camAt(t, T.durSec, T.cuts, framings);
};

/** Breathing bob (board: 2 + 2*sin(gt*2.4)), gt = global seconds. */
export const bob = (globalFrame: number, rate = 2.4): number =>
  2 + 2 * Math.sin((globalFrame / FPS) * rate);

/** Lip-sync openness at the global frame. */
export const mouth = (globalFrame: number): number => mouthAt(globalFrame);

/** Global frame for a shot's local frame. */
export const gf = (id: string, localFrame: number): number =>
  SHOT_TIMING[id].startFrame + localFrame;

/** The bed-shot recline wrapper: rotate -25° around the base (450,822), as boarded. */
export const Recline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g transform="translate(450 822) rotate(-25) translate(-450 -822)">{children}</g>
);

/** Board framing helper: {z0,z1,f0,f1} shorthand. */
export const fr = (z0: number, z1: number, f0: [number, number], f1: [number, number]): Framing => ({ z0, z1, f0, f1 });
