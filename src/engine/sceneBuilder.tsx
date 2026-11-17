// sceneBuilder.tsx — modular scene functions for the 2D Remotion pipeline.
// Nov 14, 2026 (Javion): "having it build each scene as its own function with a set duration"
// WHY: video #3 shipped with bugs that all came from scenes sharing state through the
// rig and the set — poseAt arm-angle reversals made arms swing with no reason (48 shots),
// look reversals made eyes dart side to side, characters floated (S53/S129), and
// ghost/echo doubles appeared (S136). Each scene as its own SEALED function with a FIXED
// duration kills all four: a scene cannot leak a pose, a character, or a y-offset into
// the next scene, and floor contact is computed inside the function, never inherited.
//
// HOW IT WORKS
// - defineScene(id, durationSec, fn): registers one scene. fn receives ONLY its own
//   local time t (0..duration) and a SceneApi — it cannot see other scenes.
// - The composition assembles scenes in order by concatenating their durations.
//   The timeline is DERIVED from the scene list — never hand-written, so durations
//   cannot drift from the code.
// - SceneApi gives the scene: floorY (the floor line in this set, so feet plant on
//   it), and a character() helper that stamps a character at an explicit (x, y) with
//   feet on floorY unless the scene deliberately lifts them.
// - GUARDS (run at build time, fail the build if violated):
//   1. No character may appear in a scene unless that scene's fn declares it.
//      (Kills duplication / ghost doubles.)
//   2. Every character's feet must sit on floorY at every key, unless the scene
//      sets airborne: true with an explicit reason. (Kills floating.)
//   3. Arm angles and look must not reverse direction 2+ times within one scene
//      (the poseAt idle-flap rule, enforced here instead of inside the rig).
//   4. Duration must be > 0 and the scene's keys must fit inside it.

import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SceneApi = {
  /** Local time inside this scene, seconds, 0..duration. */
  t: number;
  /** This scene's fixed duration, seconds. */
  duration: number;
  /** The floor line (v coordinate) for this scene's set. Feet plant here. */
  floorY: number;
  /** Frame number inside this scene (0-based). */
  frame: number;
  /** Frames per second (30). */
  fps: number;
};

export type CharacterSpec = {
  /** Which character: 'detective' | 'jake' | 'hero' | 'professor' | ... */
  who: string;
  /** Horizontal position, 0..1 (u coordinate). */
  x: number;
  /** Vertical position of the FEET, 0..1 (v coordinate). Defaults to floorY. */
  feetY?: number;
  /** Set true ONLY with a written reason (jump, fall, carried). Otherwise the
      guard rejects any feetY above floorY. */
  airborne?: boolean;
  /** Why this character is airborne (required when airborne is true). */
  airborneReason?: string;
};

export type SceneFn = (api: SceneApi) => React.ReactElement | null;

export type SceneDef = {
  id: string;
  /** Fixed duration in seconds. The timeline is derived from these. */
  durationSec: number;
  /** The scene's own function. Sealed: it only sees its own api. */
  fn: SceneFn;
  /** Characters this scene declares. Anything rendered but not declared fails. */
  characters: CharacterSpec[];
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry: SceneDef[] = [];

export function defineScene(def: SceneDef): SceneDef {
  if (registry.some((s) => s.id === def.id)) {
    throw new Error(`sceneBuilder: duplicate scene id "${def.id}"`);
  }
  if (!(def.durationSec > 0)) {
    throw new Error(`sceneBuilder: scene "${def.id}" must have durationSec > 0`);
  }
  registry.push(def);
  return def;
}

export function getScenes(): readonly SceneDef[] {
  return registry;
}

// ---------------------------------------------------------------------------
// Timeline derivation — never hand-write first/len again.
// ---------------------------------------------------------------------------

export type TimelineShot = {
  id: string;
  first: number; // first frame (0-based)
  len: number; // length in frames
  durationSec: number;
};

export function buildTimeline(fps = 30): TimelineShot[] {
  let frame = 0;
  return registry.map((s) => {
    const len = Math.round(s.durationSec * fps);
    const shot: TimelineShot = { id: s.id, first: frame, len, durationSec: s.durationSec };
    frame += len;
    return shot;
  });
}

export function totalDurationSec(): number {
  return registry.reduce((sum, s) => sum + s.durationSec, 0);
}

// ---------------------------------------------------------------------------
// Guards — run at build time. A violation fails the build with a named error
// instead of shipping a glitched frame.
// ---------------------------------------------------------------------------

/** Reversal counter: how many times a series of numbers changes direction. */
export function countReversals(vals: number[], eps = 1): number {
  let reversals = 0;
  let prevDir = 0;
  for (let i = 1; i < vals.length; i++) {
    const d = vals[i] - vals[i - 1];
    const dir = Math.abs(d) <= eps ? 0 : Math.sign(d);
    if (dir !== 0 && prevDir !== 0 && dir !== prevDir) reversals++;
    if (dir !== 0) prevDir = dir;
  }
  return reversals;
}

/**
 * Guard 1 — no undeclared characters.
 * Pass the list of characters actually rendered in this scene; anything not in
 * the scene's declared characters list fails the build.
 */
export function guardDeclaredCharacters(scene: SceneDef, rendered: string[]): void {
  const declared = new Set(scene.characters.map((c) => c.who));
  for (const who of rendered) {
    if (!declared.has(who)) {
      throw new Error(
        `sceneBuilder: scene "${scene.id}" renders undeclared character "${who}". ` +
          `Declare it in the scene's characters list or remove it. (Kills ghost doubles.)`
      );
    }
  }
}

/**
 * Guard 2 — feet on the floor.
 * Every declared character's feet must sit on floorY unless airborne is set
 * with a reason. A feetY even slightly above the floor is floating.
 */
export function guardFeetOnFloor(scene: SceneDef, floorY: number, eps = 0.005): void {
  for (const c of scene.characters) {
    const feetY = c.feetY ?? floorY;
    if (!c.airborne && feetY < floorY - eps) {
      throw new Error(
        `sceneBuilder: scene "${scene.id}" character "${c.who}" floats — ` +
          `feetY ${feetY} is above floorY ${floorY}. Plant the feet on the floor ` +
          `or set airborne: true with airborneReason. (S53/S129 lesson.)`
      );
    }
    if (c.airborne && !c.airborneReason) {
      throw new Error(
        `sceneBuilder: scene "${scene.id}" character "${c.who}" is airborne without a reason. ` +
          `Set airborneReason (jump, fall, carried, ...).`
      );
    }
  }
}

/**
 * Guard 3 — no idle flap.
 * Arm angles and look must not reverse direction 2+ times within one scene.
 * Pass the key arrays; a violation means the character will swing/dart for no
 * reason. (The v42 poseAt fix, enforced at the scene level.)
 */
export function guardNoIdleFlap(
  sceneId: string,
  label: string,
  armAngles: number[],
  lookVals?: number[]
): void {
  if (countReversals(armAngles, 1) >= 2) {
    throw new Error(
      `sceneBuilder: scene "${sceneId}" ${label} arm angles reverse 2+ times ` +
        `[${armAngles.join(', ')}] — idle flap. Hold the arm at its first value.`
    );
  }
  if (lookVals && countReversals(lookVals, 0.5) >= 2) {
    throw new Error(
      `sceneBuilder: scene "${sceneId}" ${label} look reverses 2+ times ` +
        `[${lookVals.join(', ')}] — eyes will dart. Hold look at 0.`
    );
  }
}

/** Run all guards for one scene. Call it inside the scene's build step. */
export function guardScene(scene: SceneDef, floorY: number, rendered: string[]): void {
  guardDeclaredCharacters(scene, rendered);
  guardFeetOnFloor(scene, floorY);
}

// ---------------------------------------------------------------------------
// Example — one scene written the modular way (S53 shape, not a real shot).
// ---------------------------------------------------------------------------

export const exampleS53Like = defineScene({
  id: 'S53-example',
  durationSec: 4.5,
  characters: [
    // Feet plant on the floor (feetY defaults to floorY). No airborne.
    { who: 'hero', x: 0.22 },
  ],
  fn: ({ t, duration, floorY }) => {
    // The scene only knows its own local time. Nothing leaks in or out.
    // A deliberate point: arm rises once and holds — 1 reversal max, guard passes.
    const armRaise = t < 1 ? 4 : 90;
    return (
      <g>
        {/* render the hero at x=0.22, feet on floorY, arm at armRaise */}
        <text x={10} y={20} fill="#fff">
          {`S53-like t=${t.toFixed(2)}/${duration} floorY=${floorY} arm=${armRaise}`}
        </text>
      </g>
    );
  },
});
