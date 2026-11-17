import React from 'react';
import { lerp, easeInOut, clamp } from './anim';

// The cast, drawn entirely in code: one rig, and a costume (a Look) per character. Every character is built
// once here, so they look identical in every shot: that's the "drawn, not guessed" point. Original
// characters only: never a channel's own hero or anything that resembles a famous cartoon character.

export const C = {
  skin: '#F6EFE3',
  skinShade: '#E2D3BE',
  ink: '#1D2033',
  jacket: '#F2B33D',
  jacketShade: '#D4922A',
  shoe: '#2FB7A6',
  orange: '#FF8A3D',
  limb: '#EFE2CC',
};

/** A costume for the rig: the same body and animation, different colours and one optional extra piece. */
export type Look = {
  skin: string;
  skinShade: string;
  hand: string;
  jacket: string;
  jacketShade: string;
  accent: string;
  /** Shirt colour showing in the open front of the coat/jacket (suit extra). Defaults to
      cream white; the professors set it to their colour so the shirt — not a jacket —
      is what distinguishes them under their lab coats. */
  shirt?: string;
  limb: string;
  line: string;
  shoe: string;
  face: string;
  extra?: 'hood' | 'curls' | 'suit' | 'deerstalker' | 'specs';
  /** One distinct human item per character (a watch, a scarf, earrings...). */
  gear?: 'watch' | 'scarf' | 'earrings' | 'bowtie' | 'lanyard' | 'straps' | 'stripes' | 'hoodie' | 'labcoat' | 'cardigan' | 'jacket';
  /** Bold black sunglasses, always on (Nov 9, Javion: Jake wears shades like the thumbnail).
      Forces the Face's classic-shades render to full opacity on every shot.
      REMOVED Nov 14, 2026 (Javion: "He not having glasses anymore") — Jake's eyes
      must show so his face can express emotion (@oddhourtales lesson: the face
      shows worry/fear through brow + mouth; sunglasses hide the eyes entirely).
      No look sets shades: true anymore; the field stays for the Face's pose.glasses
      path. Brows are no longer suppressed — they are the expression now. */
  shades?: boolean;
  /** Occasion/weather dressing (Nov 11, Javion: dress the character for the scene).
      When set, the rig adds that occasion's props automatically. 'snow' = gloves +
      beanie + scarf (a winter set). 'sun' = sun hat (wide brim). 'wind' = scarf
      with the tail streaming. 'rain' adds NO headgear in the rig — a rain hood
      was built and REMOVED Nov 11 because the render test showed it reads as
      blonde hair (side drapes + centre seam = a bob with a parting), which breaks
      the no-hair rule; rain is covered by the Umbrella hand prop instead, placed
      by the shot like the Magnifier. */
  weather?: Weather;
  /** Natural pedestrian hair (Nov 11, Javion: every pedestrian gets hair —
      natural hair, nothing that looks like a hat). A PedHairStyle + a natural
      brown colour. ONLY for pedestrians (guests/crowd): the Detective
      (deerstalker), Jake (bald), the hero and the professors never get this
      field — the Hero renders PedHair only when L.hair is set and the look is
      not a deerstalker. */
  hair?: PedHairStyle;
  /** Hair colour (a natural brown). Defaults to #3A2420. */
  hairC?: string;
  /** Season (Nov 11, Javion: dress for the season too). A shorthand for weather:
      winter → snow, summer → sun, autumn → wind, spring → none (the base look is
      already the light layer). An explicit weather (on the Hero or the look) wins
      over the season. */
  season?: Season;
  /** Sleeves (Nov 12 v17+v18). v17 (Javion: "put long sleeves on the ppl in
      snow? you know like a sweater?"): the snow researchers wear long sleeves.
      v18 (Javion: "do the same thing for T-Shirts? for the other ppl... the ones
      thats not in snow"): everyone else gets sleeves too, matching the garment.
      - 'tshirt': SHORT sleeves — upper arm only (shoulder to mid-upper-arm),
        forearm bare. For shirt-wearers.
      - 'long': FULL sleeves — shoulder to wrist, in the garment colour. For
        jacket / coat / sweater-wearers.
      v19 (Javion, looking at S52: "he has a jacket on put longer sleeves on
      him"): the S52 teacher wears a yellow hoodie (LOOKS.teenager) and the
      teacher look is a cardigan — both are long-sleeved jackets, so teenager
      and teacher are 'long', not 'tshirt'. The sleeve length matches the
      GARMENT: hoodie/cardigan/jacket/labcoat/sweater = long, shirt = tshirt.
      Both use the v17 technique: the sleeve starts buried 24px inside the torso,
      is drawn BEFORE the torso so the torso covers the join, follows the arm pose,
      same colour as the garment — sleeve + torso read as ONE garment, never a
      floating rectangle (the v7 failure: every sleeve shape tried — quad,
      torso-stub, stroke tube, tapered tube — read as a tab because its top was
      visible ON the torso). A look with no sleeve field has bare stick arms. */
  sleeve?: 'tshirt' | 'long';
};
/** Occasion/weather for a character: 'none' (default), 'snow', 'rain', 'sun', 'wind'.
    A shot sets it in one place — `weather="snow"` on the Hero, or `weather: 'snow'`
    in the look — and the rig adds the full occasion set automatically. */
export type Weather = 'none' | 'snow' | 'rain' | 'sun' | 'wind';
/** Season: a shorthand for weather. winter = snow set, summer = sun hat,
    autumn = wind (scarf, tail streaming), spring = none (light already). */
export type Season = 'none' | 'spring' | 'summer' | 'autumn' | 'winter';
/** Season → weather mapping. An explicit weather always wins over the season. */
export const seasonWeather = (s: Season): Weather =>
  s === 'winter' ? 'snow' : s === 'summer' ? 'sun' : s === 'autumn' ? 'wind' : 'none';
export type CastName = 'pip' | 'pipHood' | 'pipInk' | 'mo' | 'sis' | 'mom' | 'suit' | 'detective' | 'jake' | 'hero' | 'researcher' | 'student' | 'prisoner' | 'teenager' | 'scientist' | 'teacher' | 'guestA' | 'guestB' | 'guestC' | 'profA' | 'profB' | 'profC';
export const LOOKS: Record<CastName, Look> = {
  // A: Pip as built
  pip: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: C.limb, line: C.ink, shoe: C.shoe, face: C.ink },
  // B: Pip in a dark hoodie with mustard drawstrings: the body goes dark and catches the rim light, the head stays the brightest thing
  pipHood: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#2E2B3D', jacketShade: '#24212F', accent: C.jacket, limb: '#2E2B3D', line: '#121019', shoe: C.shoe, face: C.ink, extra: 'hood' },
  // C: a dark head with light features, the genre's high-contrast convention, in Pip's mustard
  pipInk: { skin: '#26232F', skinShade: '#1C1A24', hand: '#26232F', jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: '#26232F', line: '#121019', shoe: C.shoe, face: '#F6EFE3' },
  // Mo, Pip's friend: a second recurring character with his own costume (curly hair, headphones round his neck)
  mo: { skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#5E6E46', jacketShade: '#4C5A38', accent: '#E9C46A', limb: '#3A3446', line: '#1A1622', shoe: '#D9534F', face: C.ink, extra: 'curls' },
  // the formula's recurring cast (beats 5 and 6): Pip's little sister (draw her at about 0.7 of Pip's scale), his mum,
  // and the man in a suit who notices the power. All three are ours: plain shapes, no famous silhouettes.
  sis: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#F28C6A', limb: '#3A3446', line: '#14121C', shoe: '#F28C6A', face: C.ink },
  mom: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#8A5A6A', jacketShade: '#704858', accent: '#E9C46A', limb: '#3A3446', line: '#14121C', shoe: '#5A4A6A', face: C.ink },
  suit: { skin: '#D9C6AE', skinShade: '#C2AE96', hand: '#D9C6AE', jacket: '#2B2F3A', jacketShade: '#20232C', accent: '#A8323E', limb: '#2B2F3A', line: '#0E0F14', shoe: '#14151A', face: C.ink, extra: 'suit' },
  // INKL — the Detective: full black silhouette (#161616, the v4 approved black), white facial features,
  // slate-blue jacket + white shirt + dark tie (86,106,133 — the live profile pic), deerstalker cap, no coat. Canonical reference:
  // branding/inkl_detective_pfp_night.png. The magnifying glass is a hand prop in the shots, not part of the look.
  detective: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#566A85', jacketShade: '#42536A', accent: '#3E4F63', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', extra: 'deerstalker', sleeve: 'long' },
  // INKL — Jake: full black silhouette, white facial features, plain red shirt (#C0392B).
  // Nov 11 (Javion: "he does not wear a lobster shirt that shit was just for a video"):
  // the lobster emblem is GONE — it was only for the video #2 Spotlight story. Jake's
  // shirt is plain red now, no emblem. Sunglasses stay (permanent), watch stays.
  // Nov 10 (Javion, on the S100 sample: "take the hair off"): Jake is BALD — no hairStyle,
  // so the Hair component never renders for him. The professors are bald too; Jake joins them.
  jake: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#C0392B', jacketShade: '#96281B', accent: '#96281B', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'watch', sleeve: 'tshirt' },
  // INKL — video #3 hero ("you", the trapped protagonist): full black silhouette, white features, slate-blue
  // shirt #608EAA (96,142,168 — the puppet cast table), distinct from the Detective's #566A85. No lobster, no hair.
  hero: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#608EAA', jacketShade: '#4A6E88', accent: '#4A6E88', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'jacket', sleeve: 'tshirt' },
  // INKL — video #3 guests (puppet cast table): black silhouettes, shirts as colour blocks, arms at sides.
  // Nov 11 (Javion: every pedestrian gets natural hair): each guest has a PedHair
  // style + a natural brown colour — the puppet table's hair traits are back, as
  // natural hair (student ponytail, teacher curly, teenager crop), never as a hat.
  // Guests read by shirt colour + glasses + hair. The hero, Detective, Jake and
  // the professors stay bald / deerstalker — pedestrians only.
  researcher: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#C85A46', jacketShade: '#9E4636', accent: '#9E4636', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'lanyard', hair: 'bun', hairC: '#4A3226', sleeve: 'long' },
  student: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#7FA97A', jacketShade: '#658A62', accent: '#658A62', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', extra: 'specs', gear: 'straps', hair: 'ponytail', hairC: '#6A4A2E', sleeve: 'tshirt' },
  prisoner: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#AAAAAA', jacketShade: '#8A8A8A', accent: '#8A8A8A', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'stripes', hair: 'afro', hairC: '#241A12', sleeve: 'tshirt' },
  teenager: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#E8C86A', jacketShade: '#BFA153', accent: '#BFA153', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'hoodie', hair: 'crop', hairC: '#8A5A3A', sleeve: 'long' },
  scientist: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#F5F5F0', jacketShade: '#D8D8D2', accent: '#D8D8D2', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'labcoat', hair: 'sidepart', hairC: '#3A2A1A', sleeve: 'long' },
  teacher: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'cardigan', hair: 'curly', hairC: '#5A3A28', sleeve: 'long' },
  // INKL — video #2 crowd guests: black silhouettes, varied shirts, arms at sides. No emblem on any guest.
  guestA: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#2F6E69', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'scarf', hair: 'sidepart', hairC: '#3A2420', sleeve: 'tshirt' },
  guestB: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#D96A5F', jacketShade: '#AD544B', accent: '#AD544B', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'earrings', hair: 'curly', hairC: '#2A1E14', sleeve: 'tshirt' },
  guestC: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#D9A441', jacketShade: '#AD8334', accent: '#AD8334', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', gear: 'bowtie', hair: 'crop', hairC: '#5A3A28', sleeve: 'tshirt' },
  // INKL — the three Cornell professors (Nov 9, Javion: "make the professor apart of the video").
  // Gilovich, Medvec, Savitsky — the science explainers. ALL BALD (Javion: "keep the professors bald"):
  // no hairStyle, so the Hair component never renders for them. Distinct by jacket colour only.
  // profA = Thomas Gilovich; profB = Victoria Medvec; profC = Kenneth Savitsky.
  // NO jackets (Javion, Nov 9: "take the jackets off and put them in the right attire") — the
  // attire is a white lab coat (jacket = coat white) over a COLOURED SHIRT, and the shirt
  // colour is what distinguishes them: navy / burgundy / charcoal. The tie (accent) matches
  // the shirt, so it reads as no tie — just coat + shirt.
  profA: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#F5F5F0', jacketShade: '#D8D8D2', accent: '#2E4057', shirt: '#2E4057', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', extra: 'suit', gear: 'labcoat', sleeve: 'long' },
  profB: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#F5F5F0', jacketShade: '#D8D8D2', accent: '#7A3B4A', shirt: '#7A3B4A', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', extra: 'suit', gear: 'labcoat', sleeve: 'long' },
  profC: { skin: '#161616', skinShade: '#2A2A2A', hand: '#161616', jacket: '#F5F5F0', jacketShade: '#D8D8D2', accent: '#4A4A52', shirt: '#4A4A52', limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF', extra: 'suit', gear: 'labcoat', sleeve: 'long' },
};

// ---------- the hero ----------
/** Mitten hands: open (a palm and a thumb) or pointing (a fist with the index finger out). */
export type HandKind = 'open' | 'point';
export type Expr = 'neutral' | 'happy' | 'smug' | 'smirk' | 'shock' | 'worried' | 'oops' | 'cool' | 'dizzy' | 'tired' | 'puzzled' | 'sad' | 'scared' | 'stressed' | 'determined' | 'angry';
export type Limb = { a: number; b: number }; // a: upper segment angle, b: bend of the lower segment (degrees)
export type Pose = {
  x: number;
  y: number; // hip point
  scale: number;
  facing: 1 | -1;
  tilt: number; // torso lean around the hips, degrees, + leans screen-right
  spin: number; // whole-body rotation around the chest (tumbles)
  headTilt: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expr;
  blink: number; // 0 open, 1 shut
  look: number; // -1..1 eye offset
  glasses: number; // 0..1
  yaw: number; // -1 profile facing screen-left, 0 front, 1 profile facing screen-right
  thighScale: number; // 1 = full thigh; <1 foreshortens the thigh (front-facing seated poses: knees toward camera, thigh points at viewer so it draws short). Default 1.
  squash: number; // + squashes (landing), - stretches (jump), about the feet
  handL: HandKind;
  handR: HandKind;
  sway: number; // secondary motion: how far loose things (the hood's drawstrings) swing, degrees-ish
  glint?: number; // 0..1 the eyes light up in the power's colour (set it after poseAt: it isn't interpolated)
  glintColor?: string;
};

export const basePose: Pose = {
  x: 960,
  y: 700,
  scale: 1,
  facing: 1,
  tilt: 0,
  spin: 0,
  headTilt: 0,
  armL: { a: 5, b: 0 },
  armR: { a: 5, b: 0 },
  // Nov 11 (Javion: legs straight, not bent/dancing): standing legs are VERTICAL
  // ({a:0, b:0}). The feet stay apart because the hip stance is wide (HIP.x 26)
  // and the shoes are narrow (rx 14) — no splay, and the feet can never merge
  // into one oval again.
  legL: { a: 0, b: 0 },
  legR: { a: 0, b: 0 },
  expr: 'neutral',
  blink: 0,
  look: 0,
  glasses: 0,
  yaw: 0,
  thighScale: 1,
  squash: 0,
  handL: 'open',
  handR: 'open',
  sway: 0,
};

type Key = { f: number; p: Partial<Pose>; ease?: (t: number) => number };

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: lerp(a.a, b.a, t), b: lerp(a.b, b.b, t) });

/** Interpolates every numeric part of a pose between keys; the face swaps (never morphs) at its key. */
export const poseAt = (f: number, keys: Key[], from: Pose = basePose): Pose => {
  // resolve each key into a full pose, carrying values forward
  const full: { f: number; p: Pose; ease?: (t: number) => number }[] = [];
  let cur = from;
  for (const k of keys) {
    cur = { ...cur, ...k.p };
    full.push({ f: k.f, p: cur, ease: k.ease });
  }
  // STILLNESS FIX (Nov 14, Javion: characters "floating and shaking" in video #3):
  // the pose keys carry a baked-in idle wobble — x swaying +/-6px and y bobbing up to
  // 12px on a ~21-frame cycle — which reads on screen as shaking side-to-side and
  // feet lifting off the floor. If a character's x barely moves across its keys
  // (<=15px range) that's idle sway, not a deliberate move: hold it at its mean.
  // Same for y (<=15px range): hold the LOWEST value so feet stay planted on the
  // floor. Deliberate moves (walks, steps: 100px+ on x) pass through untouched.
  const xs = full.map((k) => k.p.x);
  const ys = full.map((k) => k.p.y);
  if (Math.max(...xs) - Math.min(...xs) <= 15) {
    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
    for (const k of full) k.p = { ...k.p, x: meanX };
  }
  if (Math.max(...ys) - Math.min(...ys) <= 15) {
    const groundY = Math.max(...ys);
    for (const k of full) k.p = { ...k.p, y: groundY };
  }
  // IDLE-FLAP FIX (Nov 14, Javion: arms swinging + eyes darting side to side):
  // the pose keys carry baked-in idle oscillation — arm angles reversing
  // 4→60→-4→60 and look values flipping +10→-8→+10 — which reads as arms
  // flapping and eyes darting for no reason while the character stands still.
  // A deliberate gesture is a single out-and-hold or out-and-back (0-1
  // reversals); 2+ reversals is idle flapping. Hold the flapping component
  // at its first key's value (arms) or at 0 = eyes centred (look).
  const reversals = (vals: number[], eps = 1): number => {
    let r = 0;
    let prev = 0;
    for (let i = 1; i < vals.length; i++) {
      const d = vals[i] - vals[i - 1];
      const dir = d > eps ? 1 : d < -eps ? -1 : 0;
      if (dir !== 0 && prev !== 0 && dir !== prev) r++;
      if (dir !== 0) prev = dir;
    }
    return r;
  };
  const armLa = full.map((k) => k.p.armL.a);
  const armLb = full.map((k) => k.p.armL.b);
  const armRa = full.map((k) => k.p.armR.a);
  const armRb = full.map((k) => k.p.armR.b);
  const looks = full.map((k) => k.p.look);
  if (reversals(armLa) >= 2) { const v = armLa[0]; for (const k of full) k.p = { ...k.p, armL: { ...k.p.armL, a: v } }; }
  if (reversals(armLb) >= 2) { const v = armLb[0]; for (const k of full) k.p = { ...k.p, armL: { ...k.p.armL, b: v } }; }
  if (reversals(armRa) >= 2) { const v = armRa[0]; for (const k of full) k.p = { ...k.p, armR: { ...k.p.armR, a: v } }; }
  if (reversals(armRb) >= 2) { const v = armRb[0]; for (const k of full) k.p = { ...k.p, armR: { ...k.p.armR, b: v } }; }
  if (reversals(looks, 0.5) >= 2) { for (const k of full) k.p = { ...k.p, look: 0 }; }
  if (f <= full[0].f) return full[0].p;
  for (let i = 0; i < full.length - 1; i++) {
    const A = full[i];
    const B = full[i + 1];
    if (f <= B.f) {
      const t = (B.ease ?? easeInOut)((f - A.f) / Math.max(1e-6, B.f - A.f));
      return {
        x: lerp(A.p.x, B.p.x, t),
        y: lerp(A.p.y, B.p.y, t),
        scale: lerp(A.p.scale, B.p.scale, t),
        facing: t < 0.5 ? A.p.facing : B.p.facing,
        tilt: lerp(A.p.tilt, B.p.tilt, t),
        spin: lerp(A.p.spin, B.p.spin, t),
        headTilt: lerp(A.p.headTilt, B.p.headTilt, t),
        armL: mixLimb(A.p.armL, B.p.armL, t),
        armR: mixLimb(A.p.armR, B.p.armR, t),
        legL: mixLimb(A.p.legL, B.p.legL, t),
        legR: mixLimb(A.p.legR, B.p.legR, t),
        expr: A.p.expr, // a face swaps when its own key lands, so hold the earlier one
        handL: A.p.handL,
        handR: A.p.handR,
        blink: lerp(A.p.blink, B.p.blink, t),
        look: lerp(A.p.look, B.p.look, t),
        glasses: lerp(A.p.glasses, B.p.glasses, t),
        yaw: lerp(A.p.yaw, B.p.yaw, t),
        thighScale: lerp(A.p.thighScale ?? 1, B.p.thighScale ?? 1, t),
        squash: lerp(A.p.squash, B.p.squash, t),
        sway: lerp(A.p.sway, B.p.sway, t),
      };
    }
  }
  return full[full.length - 1].p;
};

// body measurements (local space: hips at 0,0, y down)
const UPPER_ARM = 62;
const FORE_ARM = 58;
const THIGH = 72;
const SHIN = 68;
const SHOULDER = { x: 42, y: -108 };
const HIP = { x: 26, y: 0 };
export const HEAD = { x: 0, y: -176, r: 62 };
export const LEG_LEN = THIGH + SHIN;

/**
 * SLIM build (video #5, Nov 14 — Javion: match the fusion-cutaway / Jake-2126 /
 * Mars samples, NOT the video #3 rig). Small round head, thin black stick arms
 * and legs, longer legs, narrower shoulders/hips. Head/total ≈ 0.27 (vs 0.33
 * classic). OPT-IN ONLY: joints()/Hero take a `slim` flag, default false, so
 * every earlier episode renders byte-identical. The slim head sits higher
 * (y -188) on a longer torso; total height 400 at scale 1 (head top -242,
 * feet +158). Hands/feet for slim are the Mars-sample lock: plain black
 * mitten (no thumb, no knuckle marks), pointing = mitten + one point, feet =
 * plain rounded black ovals flat on the floor (no shoe shape).
 */
export const SLIM = {
  UPPER_ARM: 58,
  FORE_ARM: 54,
  THIGH: 80,
  SHIN: 78,
  SHOULDER: { x: 36, y: -116 },
  HIP: { x: 22, y: 0 },
  HEAD: { x: 0, y: -188, r: 54 },
};
export const SLIM_LEG_LEN = SLIM.THIGH + SLIM.SHIN; // 158
/** Limb stroke widths: classic 14 (+7 outline) vs slim thin stick 8 (+4). */
const LIMB_W = (slim: boolean) => (slim ? 8 : 14);
const LIMB_OUTLINE = (slim: boolean) => (slim ? 4 : 7);

const rad = (d: number) => (d * Math.PI) / 180;
type P = { x: number; y: number };
const rot = (p: P, deg: number, c: P = { x: 0, y: 0 }): P => {
  const r = rad(deg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};

/** Joint positions in local space (before the hip translate/scale), so scenes can attach props to hands.
    Pass slim=true for the video #5 stickman build (small head, thin limbs, long legs). */
export const joints = (pose: Pose, slim = false) => {
  const G = slim ? SLIM : { UPPER_ARM, FORE_ARM, THIGH, SHIN, SHOULDER, HIP, HEAD };
  const side = (s: 1 | -1, limb: Limb, root: P, l1: number, l2: number, isLeg: boolean) => {
    // arms swing outward (away from the body) on their own side; legs splay outward
    // in screen space for every non-profile pose (|yaw| < 1), so the two feet always
    // land apart. Nov 10 root cause of the merged-legs defect (31 board shots: hero
    // single leg under desks, Jake, Detective on the rooftop): the old direction was
    // sign(yaw), so a negative three-quarter yaw (-0.2/-0.3) INVERTED the
    // {legL:-5, legR:+5} splay — both feet landed within ~3 units and the shoes
    // (rx 18) merged into one oval, reading as a single leg. With dir=+1 the same
    // angles splay outward regardless of yaw sign. Profile walks (|yaw| >= 0.99)
    // keep the facing-sign direction so the legs swing forward/back correctly.
    // (Nov 9 context, kept: legs used pose.facing, which poseAt STEPS at the midpoint
    // of a turn while yaw interpolates smoothly — legs must follow yaw, not facing,
    // so they turn WITH the body; facing is only the fallback when yaw is exactly 0.)
    const dir = isLeg ? (Math.abs(pose.yaw) >= 0.99 ? Math.sign(pose.yaw) : 1) : s;
    const d1 = { x: dir * Math.sin(rad(limb.a)), y: Math.cos(rad(limb.a)) };
    const mid = { x: root.x + d1.x * l1, y: root.y + d1.y * l1 };
    const a2 = limb.a + limb.b;
    const d2 = { x: dir * Math.sin(rad(a2)), y: Math.cos(rad(a2)) };
    return { root, mid, end: { x: mid.x + d2.x * l2, y: mid.y + d2.y * l2 } };
  };
  const torsoRot = (p: P) => rot(p, pose.tilt);
  const sp = limbSpread(pose.yaw);
  const shL = { x: -G.SHOULDER.x * sp + pose.yaw * 6, y: G.SHOULDER.y };
  const shR = { x: G.SHOULDER.x * sp + pose.yaw * 6, y: G.SHOULDER.y };
  const armL = side(-1, pose.armL, shL, G.UPPER_ARM, G.FORE_ARM, false);
  const armR = side(1, pose.armR, shR, G.UPPER_ARM, G.FORE_ARM, false);
  const legL = side(-1, pose.legL, { x: -G.HIP.x * sp, y: 0 }, G.THIGH * (pose.thighScale ?? 1), G.SHIN, true);
  const legR = side(1, pose.legR, { x: G.HIP.x * sp, y: 0 }, G.THIGH * (pose.thighScale ?? 1), G.SHIN, true);
  const r = (o: { root: P; mid: P; end: P }) => ({ root: torsoRot(o.root), mid: torsoRot(o.mid), end: torsoRot(o.end) });
  return { armL: r(armL), armR: r(armR), legL, legR, head: torsoRot(G.HEAD) };
};

/** How wide the body reads as it turns: full width face-on, about a third in profile.
    (Nov 8, Javion on clip v4: a turned body must read as a SIDE view, not a narrower
    front — the old 0.4 left the shirt front visible at 60% width.) */
export const turnWidth = (yaw: number) => 1 - 0.65 * Math.min(1, Math.abs(yaw));
/** Shoulders and hips close up as he turns, so in profile the limbs overlap the body.
    v8 fix (Nov 9, Javion: body rotations "really glitchy"): this used 0.85, so the
    shoulders/hips collapsed to 15% while the torso only narrowed to 35% — the arms
    detached from the body mid-turn. Now 0.65, the same rate as turnWidth, so the whole
    body narrows as ONE unit. */
export const limbSpread = (yaw: number) => 1 - 0.65 * Math.min(1, Math.abs(yaw));

/** Face swaps happen through a blink: two frames shut either side of each change, as in the genre. */
export const faceAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1];
  let blink = 0;
  for (let i = 0; i < keys.length; i++) {
    const [k, e] = keys[i];
    if (f >= k) expr = e;
    if (i > 0 && f >= k - 2 && f < k + 1) blink = 1;
  }
  return { expr, blink };
};

/** A local point to world space, for attaching props (the mug in Pip's hand). */
export const toWorld = (pose: Pose, p: P): P => {
  const spun = rot(p, pose.spin, { x: 0, y: -90 });
  return { x: pose.x + spun.x * pose.scale, y: pose.y + spun.y * pose.scale };
};

/** Straight-arm reach: the right arm angle (local) that points the hand at a world target. */
export const reachAngle = (pose: Pose, target: P, slim = false) => {
  const SH = slim ? SLIM.SHOULDER : SHOULDER;
  const sh = toWorld(pose, rot({ x: SH.x * limbSpread(pose.yaw) + pose.yaw * 6, y: SH.y }, pose.tilt));
  const world = (Math.atan2(target.x - sh.x, target.y - sh.y) * 180) / Math.PI; // 0 = straight down
  return world - pose.tilt;
};

const Face: React.FC<{ expr: Expr; blink: number; look: number; glasses: number; yaw?: number; ink?: string; glint?: number; glintColor?: string; specs?: boolean; slim?: boolean; mouthOpen?: number; showBrows?: boolean }> = ({ expr, blink, look, glasses, yaw = 0, ink = C.ink, glint = 0, glintColor = '#8FF0FF', specs = false, slim = false, mouthOpen, showBrows = false }) => {
  // v34: look is -1..1 by design, but the generator wrote ±8-15 in many shots — unclamped, the eyes slid up to 105px off the face (S50, S83, S86) and floated beside the head. Clamp the shift so the eyes always stay on the face.
  const ex = Math.max(-14, Math.min(14, look * 7));
  const ay = Math.min(1, Math.abs(yaw));
  const farHidden = ay > 0.72;
  const farSide = yaw > 0 ? -1 : 1; // facing screen-right hides the screen-left eye
  // Slim head: centre -188 (vs -176), r 54 (vs 62) — eyes sit at the vertical
  // middle of the smaller head, bigger relative to it (Mars-sample face).
  const HY = slim ? SLIM.HEAD.y : HEAD.y;
  const eyeY = HY - (slim ? 2 : 4);
  // heavy lids: half shut when smug or cool, more than half when tired (with dark rings under the eyes).
  // The five feeling-expressions each carry their own lid too: angry heaviest, then stressed, sad, determined lightest.
  const lid = expr === 'smug' || expr === 'cool' ? 0.45 : expr === 'tired' ? 0.58 : expr === 'angry' ? 0.4 : expr === 'stressed' ? 0.3 : expr === 'sad' ? 0.25 : expr === 'determined' ? 0.12 : 0;
  const open = Math.max(0.08, 1 - Math.max(blink, lid));
  const eye = (cx: number) => {
    if (slim) {
      // Mars-sample face: eyes ONLY — bigger white ovals on the smaller head,
      // no brows, no mouth (those are skipped below too). The mood is carried
      // by the pose, not the face. Happy = closed arcs, shock/scared = big,
      // blink = shut curve, lidded expressions keep their lid line.
      const scx = Math.sign(cx) * 19;
      if (farHidden && Math.sign(cx) === farSide) return null;
      if (expr === 'happy') return <path d={`M ${scx - 9} ${eyeY + 3} Q ${scx} ${eyeY - 8} ${scx + 9} ${eyeY + 3}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
      if (blink >= 0.95) return <path d={`M ${scx - 11} ${eyeY + 1} Q ${scx} ${eyeY + 7} ${scx + 11} ${eyeY + 1}`} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
      const big = expr === 'shock' || expr === 'scared';
      const rx = big ? 12 : 9;
      const ry = (big ? 16 : 14) * open;
      return (
        <g>
          <ellipse cx={scx + ex} cy={eyeY + (lid ? 3 : 0)} rx={rx} ry={ry} fill={ink} />
          {lid ? <path d={`M ${scx - 11} ${eyeY - 4} L ${scx + 11} ${eyeY - 2}`} stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" /> : null}
        </g>
      );
    }
    if (farHidden && Math.sign(cx) === farSide) return null;
    if (expr === 'happy') return <path d={`M ${cx - 10} ${eyeY + 3} Q ${cx} ${eyeY - 9} ${cx + 10} ${eyeY + 3}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (expr === 'oops') return <path d={`M ${cx - 9} ${eyeY - 6} L ${cx + 4} ${eyeY} L ${cx - 9} ${eyeY + 6}`} transform={cx > 0 ? `translate(${2 * cx},0) scale(-1,1)` : undefined} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (expr === 'dizzy') return <g stroke={ink} strokeWidth={5} strokeLinecap="round"><path d={`M ${cx - 7} ${eyeY - 7} L ${cx + 7} ${eyeY + 7} M ${cx + 7} ${eyeY - 7} L ${cx - 7} ${eyeY + 7}`} /></g>;
    // shut (a blink's middle frame, or asleep): the closed lid's curve, with the tired rings kept
    if (blink >= 0.95)
      return (
        <g>
          <path d={`M ${cx - 12} ${eyeY + 1} Q ${cx} ${eyeY + 8} ${cx + 12} ${eyeY + 1}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 15} Q ${cx} ${eyeY + 22} ${cx + 12} ${eyeY + 15}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
        </g>
      );
    const big = expr === 'shock' || expr === 'scared';
    const rx = big ? 11 : 7;
    const ry = (big ? 13 : 10) * open;
    return (
      <g>
        <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={rx} ry={ry} fill={ink} />
        {big && open > 0.5 ? <circle cx={cx + ex + 3.5} cy={eyeY - 4} r={3.4} fill="#fff" /> : null}
        {lid ? <path d={expr === 'tired' ? `M ${cx - 13} ${eyeY - 1} Q ${cx} ${eyeY - 5} ${cx + 13} ${eyeY - 1}` : `M ${cx - 12} ${eyeY - 4} L ${cx + 12} ${eyeY - 2}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 14} Q ${cx} ${eyeY + 21} ${cx + 12} ${eyeY + 14}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
      </g>
    );
  };
  const brows: Record<Expr, string> = {
    neutral: '',
    happy: '',
    smug: `M -34 ${eyeY - 22} L -12 ${eyeY - 20} M 12 ${eyeY - 26} L 34 ${eyeY - 30}`,
    // smirk: ONE brow raised high (right), the other flat — sly, knowing, onto the mystery.
    smirk: `M -34 ${eyeY - 20} L -12 ${eyeY - 20} M 12 ${eyeY - 34} Q 23 ${eyeY - 42} 34 ${eyeY - 32}`,
    shock: `M -32 ${eyeY - 28} Q -21 ${eyeY - 36} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 21 ${eyeY - 36} 32 ${eyeY - 28}`,
    worried: `M -32 ${eyeY - 18} L -12 ${eyeY - 26} M 12 ${eyeY - 26} L 32 ${eyeY - 18}`,
    oops: `M -32 ${eyeY - 20} L -12 ${eyeY - 16} M 12 ${eyeY - 16} L 32 ${eyeY - 20}`,
    cool: '',
    dizzy: '',
    tired: `M -33 ${eyeY - 17} Q -22 ${eyeY - 21} -11 ${eyeY - 19} M 11 ${eyeY - 19} Q 22 ${eyeY - 21} 33 ${eyeY - 17}`,
    puzzled: `M -32.8 ${eyeY - 14} L -6.8 ${eyeY - 23} M 6.8 ${eyeY - 22} L 32.8 ${eyeY - 15}`,
    // the five feeling-expressions: brows do the feeling, each a different angle from the others.
    // sad: inner ends raised (like worried, steeper curve); scared: steep straight lines, inner ends high;
    // stressed: asymmetric (one brow down-in, one up); determined: shallow inner-down; angry: steep inner-down.
    sad: `M -33 ${eyeY - 14} Q -22 ${eyeY - 26} -11 ${eyeY - 25} M 11 ${eyeY - 25} Q 22 ${eyeY - 26} 33 ${eyeY - 14}`,
    scared: `M -33 ${eyeY - 26} L -11 ${eyeY - 36} M 11 ${eyeY - 36} L 33 ${eyeY - 26}`,
    stressed: `M -32 ${eyeY - 16} L -12 ${eyeY - 24} M 12 ${eyeY - 28} L 32 ${eyeY - 20}`,
    determined: `M -32 ${eyeY - 26} L -12 ${eyeY - 19} M 12 ${eyeY - 19} L 32 ${eyeY - 26}`,
    angry: `M -34 ${eyeY - 28} L -10 ${eyeY - 16} M 10 ${eyeY - 16} L 34 ${eyeY - 28}`,
  };
  // Neutral has no brow in the record (the Mars-sample face is eyes-only when
  // calm). When the opt-in `brows` prop is on, a neutral face still gets a flat
  // relaxed brow — so a calm beat reads as a face, not a blank head. This is
  // gated on `brows`, so non-slim characters and episodes that don't pass the
  // prop are unchanged (their neutral stays brow-less, as before).
  const browPath = brows[expr] || (showBrows && expr === 'neutral' ? `M -34 ${eyeY - 20} L -12 ${eyeY - 20} M 12 ${eyeY - 20} L 34 ${eyeY - 20}` : '');
  // Profile fix: the face narrows in profile (turnWidth) and the far eye is
  // hidden (farHidden), but the brow path draws BOTH brows — squished together
  // they read as two dashes over one eye. In profile, draw only the NEAR brow
  // (the segment on the side of the visible eye). Each brow path is two
  // M-segments (left brow, right brow); pick the one whose start-x sign
  // matches the near side (yaw > 0 → right brow, yaw < 0 → left brow).
  const browDraw = (() => {
    if (!browPath || !farHidden) return browPath;
    const segs = browPath.match(/M\s*-?[\d.]+[^M]*/g) || [];
    const near = segs.find((s) => {
      const m = s.match(/M\s*(-?[\d.]+)/);
      return m ? Math.sign(parseFloat(m[1])) === (yaw > 0 ? 1 : -1) : false;
    });
    return near || browPath;
  })();
  const mY = HEAD.y + 28;
  const mouth: Record<Expr, React.ReactNode> = {
    neutral: <path d={`M -10 ${mY} Q 0 ${mY + 4} 10 ${mY}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    happy: <path d={`M -18 ${mY - 4} Q 0 ${mY + 20} 18 ${mY - 4} Z`} fill={ink} />,
    smug: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    // smirk: a one-sided smile, lopsided and knowing (bigger rise than smug's).
    smirk: <path d={`M -14 ${mY + 2} Q 2 ${mY + 10} 18 ${mY - 8}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    shock: <ellipse cx={0} cy={mY + 4} rx={10} ry={14} fill={ink} />,
    worried: <path d={`M -16 ${mY + 4} Q -8 ${mY - 4} 0 ${mY + 4} Q 8 ${mY + 12} 16 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    oops: <g><rect x={-18} y={mY - 6} width={36} height={16} rx={6} fill={ink} /><path d={`M -14 ${mY + 2} L 14 ${mY + 2}`} stroke="#fff" strokeWidth={3} /></g>,
    cool: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    dizzy: <path d={`M -14 ${mY + 4} Q -7 ${mY - 4} 0 ${mY + 4} Q 7 ${mY + 12} 14 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    tired: <path d={`M -11 ${mY + 4} Q 0 ${mY} 11 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    puzzled: <path d={`M -11 ${mY + 2} Q 0 ${mY - 4} 11 ${mY + 2}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    // mouths for the five feeling-expressions: sad is a shallow frown, angry a deep one; scared a small open
    // oval (smaller than shock's); stressed a wobble; determined a perfectly straight pressed line.
    sad: <path d={`M -14 ${mY + 6} Q 0 ${mY - 6} 14 ${mY + 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    scared: <ellipse cx={0} cy={mY + 4} rx={7} ry={10} fill={ink} />,
    stressed: <path d={`M -13 ${mY + 3} Q -6 ${mY} 0 ${mY + 3} Q 6 ${mY + 6} 13 ${mY + 3}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    determined: <path d={`M -13 ${mY + 2} L 13 ${mY + 2}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    angry: <path d={`M -15 ${mY + 8} Q 0 ${mY - 8} 15 ${mY + 8}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
  };
  return (
    // v8 fix (Nov 9, Javion: body rotations "really glitchy"): the face used its own width
    // scale (1 - 0.28*ay = 0.72 in profile) while the torso narrows to 0.35 — so in profile
    // the head stayed wide on a narrow body, reading as a mismatch. The face now narrows
    // at the same turnWidth rate as the torso, so the whole body turns as ONE unit.
    <g transform={`translate(${yaw * 30} 0) scale(${turnWidth(yaw)} 1)`}>
      {eye(-21)}
      {eye(21)}
      {/* v8: brows are suppressed when the shades are on — the brows sit ABOVE the glasses
          bar, on the black head, with the eyes hidden behind the dark lenses, so they read
          as detached white slashes floating over the shades. The shades ARE the expression.
          Slim suppresses brows by default (Mars-sample face is eyes-only); the opt-in
          `brows` prop re-enables them (shadow-warns, Nov 16 — Javion: "put faces on the
          stick man"). The brow paths use eyeY, which is already slim-adjusted. */}
      {(showBrows || !slim) && browDraw && glasses < 0.9 ? <path d={browDraw} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {/* Slim: NO static mouth — the Mars-sample face is eyes only. A mouth appears
          ONLY while the character is speaking (mouthOpen, lip-sync, Nov 15, Javion:
          "make the mouth move the same time the narration is going on"): an ellipse
          whose height tracks the speech amplitude, so it opens and closes in time
          with the words and vanishes (closed) when the character is silent. */}
      {slim ? null : (mouthOpen === undefined ? mouth[expr] : null)}
      {mouthOpen !== undefined && mouthOpen > 0.01 ? (
        <ellipse cx={0} cy={(slim ? HY : HEAD.y) + 28} rx={slim ? 10 : 11} ry={Math.max(1.5, mouthOpen * (slim ? 12 : 14))} fill={ink} />
      ) : null}
      {!slim && (expr === 'shock' || expr === 'oops' || expr === 'scared') ? <path d={`M 52 ${HEAD.y - 30} q 6 10 0 16 q -6 -6 0 -16 Z`} fill="#8FD3FF" /> : null}
      {/* a power lighting the eyes: a soft halo, a bright iris, a white catchlight (none while the lids are shut) */}
      {glint > 0.01 && blink < 0.95
        ? [-21, 21].map((cx) =>
            farHidden && Math.sign(cx) === farSide ? null : (
              <g key={`gl${cx}`} opacity={Math.min(1, glint)}>
                <circle cx={cx + ex} cy={eyeY} r={17} fill={glintColor} opacity={0.2} />
                <circle cx={cx + ex} cy={eyeY} r={12} fill={glintColor} opacity={0.28} />
                <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={8} ry={Math.max(2, 11 * open)} fill={glintColor} />
                <circle cx={cx + ex + 2.5} cy={eyeY - 3} r={2.6} fill="#FFFFFF" />
              </g>
            ),
          )
        : null}
      {glasses > 0.01 ? (
        // Slim: the shades scale to the smaller head (x0.87 about the eye line) —
        // Jake's sunglasses sit horizontally across the middle of his face.
        <g opacity={glasses} transform={`translate(0 ${(1 - glasses) * -60})${slim ? ` translate(0 ${eyeY}) scale(0.87) translate(0 ${-eyeY})` : ''}`}>
          {/* classic shades: a full bar across, two big lenses. Bold BLACK frame
              (Nov 9, Javion: the white frame read as clear/white glasses, not
              bold black sunglasses). SOLID lenses — NO white glint
              (Nov 14, Javion: the white streaks read as eyes/marks, not gloss).
              The lenses are deep enough to fully cover the white eye ovals
              behind them, so no white peeks out below OR above the lens edges:
              the slim glasses group scales x0.87 about the eye line, so the
              lens top/bottom in lens coords must clear the eye's ±14
              (→ ±16.1 in lens coords) with margin.
              SHAPE FIX v7 (Nov 14, Javion: "It's just hanging on his face?"):
              six versions of RECTANGLE lenses all read as boxes/screens — a
              rectangle doesn't say "sunglasses", it says "box". Wayfarers do:
              the lenses are TRAPEZOIDS, wider at the top than the bottom, so
              the shape itself reads as shades. Each lens is a trapezoid path
              (44 wide at the top, 32 at the bottom), the bridge joins them at
              the top inner corners, and the arms leave from the top outer
              corners straight back to the head. Dark slate (#232E3D) with a
              thin lighter rim (#3A4654). */}
          <g fill="#232E3D" stroke="#3A4654" strokeWidth={2} strokeLinejoin="round">
            <path d={`M -50 ${eyeY - 17} L -6 ${eyeY - 17} L -12 ${eyeY + 17} L -44 ${eyeY + 17} Z`} />
            <path d={`M 6 ${eyeY - 17} L 50 ${eyeY - 17} L 44 ${eyeY + 17} L 12 ${eyeY + 17} Z`} />
          </g>
          <rect x={-6} y={eyeY - 17} width={12} height={6} fill="#232E3D" />
          {/* temple arms: they MUST reach the sides of the head (the ears) or the
              shades float on the face. The glasses group scales x0.87 about the
              eye line, so the head edge (r=62) sits at ±71 in lens coords — the
              arms run from the lens outer corners all the way to ±71, where they
              meet the head and go back over the ears. (Javion Nov 14: "glasses
              go to the side of your head… it's just something floating on his
              fucking face".) */}
          <path d={`M -50 ${eyeY - 14} L -71 ${eyeY - 14} M 50 ${eyeY - 14} L 71 ${eyeY - 14}`} stroke="#232E3D" strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
      {specs ? (
        // round spectacles (student + scientist looks): thin light rims over the eyes, a bridge, short temples.
        // Drawn inside the face's own transform so they track the eyes as the head turns; the far rim hides
        // with the far eye in full profile. Slim: smaller rims, closer together, on the smaller head.
        <g stroke="#EDE8DE" strokeWidth={3.5} fill="none" strokeLinecap="round">
          {(slim ? [-18, 18] : [-21, 21]).map((cx) =>
            farHidden && Math.sign(cx) === farSide ? null : (
              <circle key={`sp${cx}`} cx={cx} cy={eyeY} r={slim ? 15 : 17} />
            ),
          )}
          <path d={`M -4 ${eyeY} L 4 ${eyeY}`} />
          <path d={`M -38 ${eyeY - 2} L -56 ${eyeY - 6} M 38 ${eyeY - 2} L 56 ${eyeY - 6}`} />
        </g>
      ) : null}
    </g>
  );
};

/**
 * HAIR_SAMPLE flag (Nov 8, Javion: hair on all characters + different clothes/accessories,
 * like actual human beings). Hair is drawn in the look's own hair colour — on INKL looks
 * that's the same #161616 as the head, so it reads as part of the black silhouette, its
 * OUTLINE doing the work against the set. Every style is a distinct head outline, so two
 * characters never read as palette swaps. Drawn AFTER the head circle (and after the cap),
 * BEFORE the face, so brows/eyes always draw over the fringe. Only rendered when the
 * sample flag is on; the default-off path never calls this.
 * Head-local coords: head centre (0,-176), r=62; brows sit around y=-200, eyes at -180.
 */
// Nov 11 (Javion: "get rid of the hair command entirely"): the Hair
// component is REMOVED — no hair on any character in any scene, ever.
// Heads are plain smooth round silhouettes.
// Nov 11 (Javion: ShirtFace prints were video #2 props only — REMOVED with the hair).

/**
 * PEDESTRIAN HAIR (Nov 11, Javion: "every pedestrian gets hair... natural hair,
 * nothing that looks like a hat, actual natural looking hair"). ONLY for
 * pedestrians (background/crowd/guest characters): the Detective keeps his
 * deerstalker, Jake stays bald, the hero and the professors stay bald.
 *
 * Local frame: head centre (0,0), head r=62. Brows sit at y=-24, eyes at y=-4 —
 * the hairline (fringe) stays ABOVE the brows (y <= -28) so brows/eyes always
 * draw on the face, never on hair. Drawn after the head circle, before the Face.
 *
 * What makes it read as HAIR, not a hat (the old Hair component failed here):
 *   - a SCALLOPED hairline (fringe) across the forehead — never a straight
 *     horizontal edge (a straight edge + dome = a cap);
 *   - a BUMPY / textured top outline (strands, curl clusters, bumps) — never a
 *     smooth dome (a smooth dome = a beanie);
 *   - NO flat disc sticking out past the head's sides (no sun-hat / deerstalker
 *     visor), NO straight folded strip across the forehead (no beanie fold),
 *     NO centred knob on top (no pom / button);
 *   - a tail, a knot, or curl clusters where the style has one — those shapes
 *     only ever read as hair.
 * Hair is a natural brown, distinct from the #161616 head, so the hairline
 * reads against the silhouette (the old #161616-on-#161616 hair was invisible
 * except at the outline, which is why it read as a hat).
 */
export type PedHairStyle = 'crop' | 'sidepart' | 'afro' | 'bun' | 'ponytail' | 'curly';
export const PED_HAIR_STYLES: PedHairStyle[] = ['crop', 'sidepart', 'afro', 'bun', 'ponytail', 'curly'];
/** Natural hair browns (proven by the classroom Kids' hairC, plus the light
    brown #8A5A3A and dark brown #3A2A1A used by the teenager / scientist /
    crowd — all read as natural hair in the PedHair test render). */
export const PED_HAIR_COLORS = ['#3A2420', '#2A1E14', '#5A3A28', '#4A3226', '#6A4A2E', '#241A12', '#8A5A3A', '#3A2A1A'];
export const PedHair: React.FC<{ style: PedHairStyle; hairC?: string; line?: string }> = ({ style, hairC = '#3A2420', line = '#000000' }) => {
  const sw = { stroke: line, strokeWidth: 3.5, strokeLinejoin: 'round' as const };
  // Short strand lines that break the crown's smooth curve (crop / sidepart / bun / ponytail).
  const strands = (d: string[]) => (
    <g stroke={line} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.45}>
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </g>
  );
  return (
    <g fill={hairC} {...sw}>
      {style === 'crop' ? (
        <g>
          {/* short crop: hair hugging the top/back of the head, scalloped fringe */}
          <path d="M -62 -8 Q -60 -40 -42 -56 Q -22 -72 0 -72 Q 22 -72 42 -56 Q 60 -40 62 -8 Q 56 -24 46 -28 Q 36 -34 26 -29 Q 16 -34 6 -29 Q -4 -34 -14 -29 Q -24 -34 -34 -29 Q -44 -30 -46 -28 Q -56 -24 -62 -8 Z" />
          {strands(['M -32 -58 Q -18 -66 -2 -66', 'M 10 -66 Q 26 -64 36 -54'])}
        </g>
      ) : null}
      {style === 'sidepart' ? (
        <g>
          {/* side part: swept to one side, the part is a small upward notch in the fringe */}
          <path d="M -62 -2 Q -62 -42 -44 -58 Q -22 -70 4 -68 Q 32 -66 50 -50 Q 62 -38 62 -12 Q 54 -20 46 -16 Q 40 -10 32 -14 Q 24 -8 16 -13 Q 8 -17 0 -12 L -12 -24 L -20 -12 Q -28 -14 -36 -10 Q -46 -12 -54 -8 Q -58 -6 -62 -2 Z" />
          {strands(['M -14 -56 Q 12 -60 36 -46'])}
        </g>
      ) : null}
      {style === 'afro' ? (
        <g>
          {/* afro: a big textured mass — a ring of bumps over the top and sides */}
          <path d="M -62 -6 Q -60 -40 -42 -56 Q -22 -70 0 -70 Q 22 -70 42 -56 Q 60 -40 62 -6 Q 52 -22 42 -26 Q 30 -32 18 -28 Q 0 -32 -18 -28 Q -30 -32 -42 -26 Q -52 -22 -62 -6 Z" />
          <g stroke="none">
            <circle cx={-56} cy={-48} r={16} />
            <circle cx={-40} cy={-62} r={16} />
            <circle cx={-20} cy={-70} r={16} />
            <circle cx={0} cy={-72} r={16} />
            <circle cx={20} cy={-70} r={16} />
            <circle cx={40} cy={-62} r={16} />
            <circle cx={56} cy={-48} r={16} />
            <circle cx={-64} cy={-16} r={14} />
            <circle cx={64} cy={-16} r={14} />
          </g>
        </g>
      ) : null}
      {style === 'bun' ? (
        <g>
          {/* bun: hair pulled back (high hairline, more forehead shows) + a knot at the top-back */}
          <path d="M -62 -10 Q -60 -42 -42 -58 Q -22 -72 0 -72 Q 22 -72 42 -58 Q 60 -42 62 -10 Q 54 -26 44 -30 Q 34 -36 24 -31 Q 12 -36 0 -31 Q -12 -36 -24 -31 Q -34 -36 -44 -30 Q -54 -26 -62 -10 Z" />
          <circle cx={16} cy={-78} r={15} />
          <g stroke={line} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.5}>
            <path d="M 8 -86 Q 16 -90 24 -86" />
            <path d="M 6 -78 Q 16 -82 26 -78" />
          </g>
          {strands(['M 10 -66 Q -10 -58 -30 -48', 'M 22 -66 Q 36 -56 44 -44'])}
        </g>
      ) : null}
      {style === 'ponytail' ? (
        <g>
          {/* ponytail: pulled back like the bun, plus a tail hanging down the side */}
          <path d="M -62 -10 Q -60 -42 -42 -58 Q -22 -72 0 -72 Q 22 -72 42 -58 Q 60 -42 62 -10 Q 54 -26 44 -30 Q 34 -36 24 -31 Q 12 -36 0 -31 Q -12 -36 -24 -31 Q -34 -36 -44 -30 Q -54 -26 -62 -10 Z" />
          <path d="M 44 -34 Q 66 -18 70 8 Q 72 34 64 56 Q 58 62 54 54 Q 58 30 54 6 Q 50 -14 38 -26 Z" />
          <path d="M 42 -30 Q 54 -34 62 -26" stroke={line} strokeWidth={5} strokeLinecap="round" fill="none" />
          {strands(['M -6 -66 Q -24 -56 -38 -44', 'M 8 -66 Q 26 -58 38 -46'])}
        </g>
      ) : null}
      {style === 'curly' ? (
        <g>
          {/* curly: clustered curls across the top — bumpy outline, never a smooth dome */}
          <path d="M -62 -6 Q -60 -40 -42 -56 Q -22 -70 0 -70 Q 22 -70 42 -56 Q 60 -40 62 -6 Q 52 -22 42 -26 Q 30 -32 18 -28 Q 0 -32 -18 -28 Q -30 -32 -42 -26 Q -52 -22 -62 -6 Z" />
          <g stroke="none">
            <circle cx={-46} cy={-55} r={19} />
            <circle cx={-24} cy={-58} r={19} />
            <circle cx={0} cy={-62} r={19} />
            <circle cx={24} cy={-58} r={19} />
            <circle cx={46} cy={-55} r={19} />
            <circle cx={-60} cy={-20} r={15} />
            <circle cx={60} cy={-20} r={15} />
          </g>
        </g>
      ) : null}
    </g>
  );
};

export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look; weather?: Weather; season?: Season; slim?: boolean; mouthOpen?: number; showBrows?: boolean }> = ({ pose, shadow = 1, rimId = 'rimBlue', look = LOOKS.pipHood, weather, season, slim = false, mouthOpen, showBrows = false }) => {
  const j = joints(pose, slim);
  // Slim head + leg length (video #5 stickman build); classic otherwise.
  const HD = slim ? SLIM.HEAD : HEAD;
  const LL = slim ? SLIM_LEG_LEN : LEG_LEN;
  const L = look;
  // Occasion dressing (Nov 11, Javion): explicit weather wins (Hero prop, then the
  // look's weather); else the season maps to a weather (winter→snow, summer→sun,
  // autumn→wind, spring→none); else 'none'. The shot sets it in one place and the
  // rig adds the full occasion set automatically.
  const effWeather: Weather = weather ?? L.weather ?? seasonWeather(season ?? L.season ?? 'none');
  const snow = effWeather === 'snow';
  // NOTE: no `rain` const here on purpose — rain adds no rig props (see the
  // weather doc above: the rain hood read as hair, so rain is the Umbrella
  // hand prop only). 'rain' stays a valid Weather value for the shot to name.
  const sun = effWeather === 'sun';
  const wind = effWeather === 'wind';
  // Snow glove colour: warm coral, the same as the beanie — a matching winter set.
  // It reads as gloves on both black (#161616) and cream (#F6EFE3) skin.
  const GLOVE = '#D96A5F';
  const BEANIE = '#D96A5F';
  const BEANIE_SHADE = '#AD544B';
  // ---- Cloth motion (Nov 8, Javion: clothes must MOVE, not sit stiff) ----
  // Nov 11 (Javion: no hair, ever): the old hairOn gate is GONE. Sleeves, gear,
  // hem, watch and earrings render UNCONDITIONALLY — the gate was the reason
  // sleeves vanished whenever hair was off. Every character is a plain smooth
  // round-headed silhouette; costume details are what tell them apart.
  // How much the arms are lifted on average (10 = hanging, 135 = cheering): the hem
  // rides up and skews with it, so the cloth sits differently in every pose.
  const avgArmA = (pose.armL.a + pose.armR.a) / 2;
  // Nov 12 v7 (Javion: "just take the fucking rectangle sleeves off and leave the shirt"):
  // SLEEVES REMOVED ENTIRELY. Every sleeve shape tried — v6 quad, v7 torso-stub, v7 stroke
  // tube, v7 tapered tube — still read as a rectangle/tab pasted on the shoulder. No sleeve
  // in any shape. The shirt is the torso only; arms are bare black stick arms.
  // v17 EXCEPTION (Javion: "put long sleeves on the ppl in snow? you know like a sweater?"):
  // the snow researchers (LOOKS.researcher) DO get sleeves — the sleeve() helper below,
  // gated on the look's sleeve field, drawn BEFORE the torso with its start buried inside
  // the torso. That burying + under-torso draw is what the v7 attempts lacked: their tops
  // were visible ON the torso, which is what read as a tab.
  // v18 (Javion: "do the same thing for T-Shirts? for the other ppl... the ones thats not
  // in snow"): the same technique now covers EVERYONE — shirt-wearers get SHORT sleeves
  // (sleeve: 'tshirt', upper arm only, forearm bare) and jacket/coat-wearers get FULL
  // sleeves (sleeve: 'long', shoulder to wrist, in the garment colour). The v7 order now
  // means only: no sleeve whose top shows on the shoulder — the buried-start + draw-before-
  // torso rule is what makes a sleeve read as a garment instead of a tab. The legacy puppet
  // cast (pip, pipHood, pipInk, mo, sis, mom, suit) has no sleeve field and stays bare-armed;
  // they are not in video #3 and Javion did not ask for them.
  // A wristwatch on the left wrist: it rides the forearm, so it travels with the hand.
  const watch = (o: { root: P; mid: P; end: P }) => {
    const dx = o.end.x - o.mid.x;
    const dy = o.end.y - o.mid.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const wx = o.end.x - ux * 10;
    const wy = o.end.y - uy * 10;
    const ang = (Math.atan2(dx, dy) * 180) / Math.PI;
    return (
      <g transform={`translate(${wx} ${wy}) rotate(${-ang})`}>
        <rect x={-11} y={-6} width={22} height={12} rx={4} fill="#EDE8DE" stroke={L.line} strokeWidth={3} />
        <circle cx={0} cy={0} r={3.5} fill="#161616" />
        <path d="M 0 0 L 2.5 -2.5" stroke="#EDE8DE" strokeWidth={1.5} strokeLinecap="round" />
      </g>
    );
  };
  // limbs are light with a dark outline, so they read on the dark sets (navy limbs vanished on navy walls).
  // Slim: thin black stick limbs (Mars sample) — stroke 8 + 4 outline, no extra bulk.
  const limb = (o: { root: P; mid: P; end: P }, w: number) => {
    const ow = LIMB_OUTLINE(slim);
    const d = `M ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`;
    return (
      <g>
        <path d={d} stroke={L.line} strokeWidth={w + ow} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={L.limb} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  // SWEATER / LONG SLEEVE (Nov 12 v17, Javion: long sleeves on the people in the snow, "like a
  // sweater"; v18: same for every jacket/coat-wearer). A thick stroke in the jacket colour — same fill + dark outline as the torso,
  // so it reads as the SAME garment — along the arm's two segments, following the pose
  // exactly like the bare limb. Two things make it read as a sleeve instead of the v7 tab:
  // (1) the stroke starts 24px INSIDE the torso (toward the body centre), so its round cap
  // is buried in the torso mass, never visible on the shoulder; (2) it is drawn BEFORE the
  // torso (see the render block), so the torso covers the join entirely — what the viewer
  // sees is the sleeve emerging from the shoulder with no gap, no bump, no seam. Width 22
  // (vs bare arm 14) so it reads as a clothed arm, not a stick. Covers shoulder to wrist;
  // the hand at the end is unchanged (bare hand — the snow glove is a separate occasion
  // piece and these researchers have no weather set, so hands stay as they are).
  const sleeve = (o: { root: P; mid: P; end: P }) => {
    const inward = o.root.x > 0 ? -1 : 1;
    const start = { x: o.root.x + inward * 24, y: o.root.y };
    const d = `M ${start.x} ${start.y} L ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`;
    return (
      <g>
        <path d={d} stroke={L.line} strokeWidth={29} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={L.jacket} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  // T-SHIRT SLEEVE (Nov 12 v18, Javion: "do the same thing for T-Shirts?"). The SAME
  // technique as the long sleeve — buried 24px start, drawn BEFORE the torso — but SHORT:
  // it ends at mid-upper-arm (the midpoint of root→mid), so the forearm stays a bare stick
  // arm. Same jacket colour + dark outline + width 22, so it reads as a T-shirt, not a tab.
  // The hem is a FLAT edge (butt caps): a round cap here would read as a tube end, while a
  // flat edge reads as a sleeve hem. The bare forearm (bareFrom below) starts exactly at
  // the hem, its round cap buried inside the sleeve width, so there is no gap.
  const tshirtEnd = (o: { root: P; mid: P }) => ({ x: (o.root.x + o.mid.x) / 2, y: (o.root.y + o.mid.y) / 2 });
  const tshirtSleeve = (o: { root: P; mid: P; end: P }) => {
    const inward = o.root.x > 0 ? -1 : 1;
    const start = { x: o.root.x + inward * 24, y: o.root.y };
    const half = tshirtEnd(o);
    const d = `M ${start.x} ${start.y} L ${o.root.x} ${o.root.y} L ${half.x} ${half.y}`;
    return (
      <g>
        <path d={d} stroke={L.line} strokeWidth={29} fill="none" strokeLinecap="butt" strokeLinejoin="round" />
        <path d={d} stroke={L.jacket} strokeWidth={22} fill="none" strokeLinecap="butt" strokeLinejoin="round" />
      </g>
    );
  };
  // BARE FOREARM for t-shirt mode: the exposed arm from the sleeve hem (mid-upper-arm)
  // through the elbow to the wrist. Same two-segment stroke as limb(), but starting at
  // `from` instead of the shoulder. Its round cap sits inside the sleeve's width at the
  // hem, so the black arm emerges from the sleeve with no gap.
  const bareFrom = (from: P, mid: P, end: P, w: number) => {
    const d = `M ${from.x} ${from.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`;
    return (
      <g>
        <path d={d} stroke={L.line} strokeWidth={w + LIMB_OUTLINE(slim)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={L.limb} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  // The bare-limb portion of one arm, by sleeve mode: 'long' covers the whole arm (none),
  // 'tshirt' leaves the forearm bare from the sleeve hem, no sleeve leaves the whole arm bare.
  // Slim: NO sleeves ever (Mars sample — bare thin stick arms, the coat is the torso only),
  // so the arm is always the plain thin limb.
  const armLimb = (o: { root: P; mid: P; end: P }) =>
    slim ? limb(o, LIMB_W(slim)) : L.sleeve === 'long' ? null : L.sleeve === 'tshirt' ? bareFrom(tshirtEnd(o), o.mid, o.end, 14) : limb(o, 14);
  const shoe = (o: { root: P; mid: P; end: P }) => {
    if (slim) {
      // Mars-sample feet: simple rounded black ovals at the ends of the thin
      // stick legs, planted FLAT on the floor, fully visible. No shoe shape,
      // no toes, no yaw offset — the foot points straight down where the leg ends.
      return <ellipse cx={o.end.x} cy={o.end.y + 3} rx={12} ry={8} fill={L.shoe} />;
    }
    // v8 fix (Nov 9, Javion: "the feet and legs being in the wrong direction from the body"):
    // the shoe offset used pose.facing, which poseAt STEPS (instant flip at the turn midpoint),
    // so the shoe SNAPPED 18px when the body turned. It now follows yaw (smooth), so the
    // foot points where the body points through the whole turn; at yaw 0 (front) it is centred.
    return <ellipse cx={o.end.x + pose.yaw * 9} cy={o.end.y + 4} rx={14} ry={11} fill={L.shoe} stroke={L.line} strokeWidth={4} />;
  };
  // a mitten along the forearm: the palm, the thumb toward the body, two knuckle marks; or a pointing fist.
  // SNOW (Nov 11, Javion): the mitten becomes a GLOVE — same shape, slightly bigger,
  // in the snow-glove colour with a cuff band at the wrist, so it reads as winter gear
  // on any skin colour. The cuff sits over the wrist joint; the glove follows the
  // forearm angle exactly like the bare hand.
  const hand = (o: { mid: P; end: P }, side: 1 | -1, kind: HandKind) => {
    const ang = (Math.atan2(o.end.x - o.mid.x, o.end.y - o.mid.y) * 180) / Math.PI;
    if (slim) {
      // Mars-sample hands: a simple solid black mitten — NO fingers, no thumb
      // bump, no knuckle marks. A pointing hand is the SAME mitten with ONE
      // deliberate point (a single tapered point along the forearm), never
      // individual fingers. The group is rotated so +y runs along the forearm.
      return (
        <g transform={`translate(${o.end.x} ${o.end.y}) rotate(${-ang})`}>
          {kind === 'point' ? (
            <g fill={L.hand}>
              <ellipse cx={0} cy={4} rx={8} ry={11} />
              <path d="M -3.5 12 L -1.5 27 Q 0 31 1.5 27 L 3.5 12 Z" />
            </g>
          ) : (
            <ellipse cx={0} cy={8} rx={8} ry={11} fill={L.hand} />
          )}
        </g>
      );
    }
    const hc = snow ? GLOVE : L.hand;
    const prx = snow ? 13 : 11;
    const pry = snow ? 17 : 15;
    return (
      <g transform={`translate(${o.end.x} ${o.end.y}) rotate(${-ang})`}>
        {snow ? <rect x={-14} y={-13} width={28} height={12} rx={5} fill={GLOVE} stroke={L.line} strokeWidth={3.5} /> : null}
        {kind === 'point' ? (
          <g>
            <rect x={-4} y={10} width={8} height={24} rx={4} fill={hc} stroke={L.line} strokeWidth={3.5} />
            <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={hc} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
            <ellipse cx={side * 10} cy={6} rx={4.5} ry={7} fill={hc} stroke={L.line} strokeWidth={3.5} />
          </g>
        ) : (
          <g>
            <ellipse cx={side * 10} cy={3} rx={5.5} ry={9} transform={`rotate(${side * -28} ${side * 10} 3)`} fill={hc} stroke={L.line} strokeWidth={4} />
            <ellipse cx={0} cy={10} rx={prx} ry={pry} fill={hc} stroke={L.line} strokeWidth={4} />
            <path d="M -4 17 L -4 23 M 3 18 L 3 24" stroke={L.line} strokeWidth={2} opacity={0.45} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };
  const kw = turnWidth(pose.yaw);
  // Front-of-shirt details (centre seam, collar, shirt V/tie, chest emblem) belong to the
  // FRONT of the body. One unified rotation: as yaw turns the body to the side, those
  // details rotate away from the camera and must fade out — otherwise the turned body
  // still reads as a front shirt. Fully visible face-on (|yaw| <= 0.3), gone by |yaw| >= 0.6.
  // (Nov 8, Javion on clip v4: "when you turn to the side we arent suppose to see the
  // front of the shirt still" — the whole body rotates as one unit, driven by yaw.)
  const ay = Math.min(1, Math.abs(pose.yaw));
  const frontFade = clamp(1 - (ay - 0.3) / 0.3, 0, 1);
  const torso = (
    <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} 0) scale(${kw} 1)`}>
      {/* Nov 12 (Javion: "the clothes look disgusting"): the torso is a SHAPED garment now, not a flat
          rectangle. Defined shoulders (sloped top edge), a slight waist taper (narrowest ~y=-18), and a
          small hip flare to a clean hem that sits at the waist/hips (y≈+2..+14). The old flat rect with a
          straight hem read as a coloured bib draped over a black body; the taper + flare read as a shirt
          the character is actually wearing. Colours unchanged per look. */}
      <path d="M -46 -112 Q -44 -121 -32 -123 Q 0 -127 32 -123 Q 44 -121 46 -112 L 45 -58 Q 41 -34 38 -18 Q 37 -6 41 1 Q 42 6 36 8 Q 0 14 -36 8 Q -42 6 -41 1 Q -37 -6 -38 -18 Q -41 -34 -45 -58 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 12 -116 Q 30 -114 46 -112 L 45 -58 Q 41 -34 38 -18 Q 37 -6 41 1 Q 36 8 12 9 Z" fill={L.jacketShade} opacity={0.55} />
      <path d="M 0 -118 L 0 6" stroke={L.jacketShade} strokeWidth={4} opacity={frontFade} />
      {L.extra === 'suit' || L.extra === 'deerstalker' ? (
        // a shirt in the V of the jacket/coat and a tie in the accent colour (+ a shirt collar for the Detective)
        <g opacity={frontFade}>
          <path d="M -24 -116 L 0 -54 L 24 -116 Z" fill={L.shirt ?? '#EDE8DE'} />
          <path d="M -7 -112 L 7 -112 L 9 -100 L 5 -64 L 0 -56 L -5 -64 L -9 -100 Z" fill={L.accent} />
          <path d="M -26 -116 L 0 -54 M 26 -116 L 0 -54" stroke={L.line} strokeWidth={4} />
          {L.extra === 'deerstalker' ? (
            <g>
              <path d="M -24 -116 L -6 -104 L -14 -114 Z" fill="#EDE8DE" stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
              <path d="M 24 -116 L 6 -104 L 14 -114 Z" fill="#EDE8DE" stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
            </g>
          ) : null}
        </g>
      ) : (
        // Nov 12 v6 (Javion: "multiple clothing stacked on top of everyone"): the filled collar band is
        // REMOVED. It was drawn for every non-suit look AND the gears draw their own neckline details
        // (hoodie drawstrings, cardigan collar, labcoat lapels, jacket shirt V), so the band read as a
        // second collar — a pointed shirt collar layered over a hoodie / cardigan / jacket. The torso's
        // own top edge (outlined, part of the torso path) is the neckline now; the gear's own detail is
        // the only neckline detail. One clean top, no stacked collar.
        <g />
      )}
      {/* HAIR_SAMPLE gear (Nov 8, Javion): one distinct human item per character. Chest items
          fade with frontFade as the body turns, like the emblem — a turned body shows its
          side, never its front details. */}
      {/* SNOW/WIND (Nov 11, Javion): the scarf is part of the snow set and the wind
          set, so it renders whenever the occasion is snow or wind — even if the look's
          own gear is something else (Jake's watch, the Detective's none). The cream
          scarf + coral gloves and beanie read as one coordinated winter set. In wind
          the tail streams sideways (rotated around its top) instead of hanging. */}
      {L.gear === 'scarf' || snow || wind ? (
        <g>
          <path d="M -46 -118 Q 0 -102 46 -118 L 44 -100 Q 0 -86 -44 -100 Z" fill="#EDE8DE" stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          {/* the tail hangs past the waist and its tip swings with the body's sway + lean;
              in wind it streams sideways instead of hanging */}
          <g opacity={frontFade} transform={`translate(${pose.sway * 1.2 + pose.tilt * 1.5} 0) rotate(${wind ? -45 : 0} 0 -102)`}>
            <path d="M -12 -102 L 14 -102 L 10 26 L -2 34 L -14 24 Z" fill="#EDE8DE" stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
            <path d="M -12 24 L -2 30 M -2 24 L 8 28" stroke={L.line} strokeWidth={2} strokeLinecap="round" />
          </g>
        </g>
      ) : null}
      {L.gear === 'bowtie' ? (
        <g opacity={frontFade}>
          <path d="M -30 -118 L -4 -107 L -30 -96 Z" fill="#161616" stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          <path d="M 30 -118 L 4 -107 L 30 -96 Z" fill="#161616" stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          <rect x={-6} y={-113} width={12} height={12} rx={3} fill="#161616" stroke={L.line} strokeWidth={3} />
        </g>
      ) : null}
      {L.gear === 'lanyard' ? (
        <g opacity={frontFade}>
          <path d="M -20 -112 L 0 -58 L 20 -112" stroke={L.accent} strokeWidth={4} fill="none" strokeLinecap="round" />
          <rect x={-15} y={-60} width={30} height={22} rx={3} fill="#EDE8DE" stroke={L.line} strokeWidth={3} />
          <path d="M -9 -52 L 9 -52 M -9 -46 L 9 -46" stroke={L.line} strokeWidth={2} strokeLinecap="round" />
        </g>
      ) : null}
      {L.gear === 'straps' ? (
        <g opacity={frontFade}>
          <path d="M -38 -116 L -26 -116 L -22 2 L -34 2 Z" fill={L.jacketShade} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          <path d="M 38 -116 L 26 -116 L 22 2 L 34 2 Z" fill={L.jacketShade} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          <path d="M -32 -30 L 32 -30" stroke={L.jacketShade} strokeWidth={6} strokeLinecap="round" />
        </g>
      ) : null}
      {L.gear === 'stripes' ? (
        <g opacity={frontFade} stroke={L.jacketShade} strokeWidth={6} strokeLinecap="round">
          <path d="M -42 -82 L 42 -82" />
          <path d="M -43 -52 L 43 -52" />
          <path d="M -40 -22 L 40 -22" />
        </g>
      ) : null}
      {L.gear === 'labcoat' ? (
        <g opacity={frontFade}>
          <path d="M -24 -116 L -6 -100 L -14 -60 L -30 -96 Z" fill="#D8D8D2" stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M 24 -116 L 6 -100 L 14 -60 L 30 -96 Z" fill="#D8D8D2" stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M 0 -96 L 0 2" stroke={L.jacketShade} strokeWidth={3} />
          <circle cx={-8} cy={-40} r={4} fill={L.line} />
          <circle cx={-8} cy={-12} r={4} fill={L.line} />
          <rect x={14} y={-52} width={20} height={16} rx={2} fill="none" stroke={L.line} strokeWidth={2.5} />
        </g>
      ) : null}
      {L.gear === 'cardigan' ? (
        <g opacity={frontFade}>
          <path d="M -26 -116 Q 0 -96 26 -116 L 18 -102 Q 0 -90 -18 -102 Z" fill={L.jacketShade} stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M -7 -108 L -7 2 M 7 -108 L 7 2" stroke={L.jacketShade} strokeWidth={3} />
          <circle cx={0} cy={-72} r={4.5} fill="#EDE8DE" stroke={L.line} strokeWidth={2.5} />
          <circle cx={0} cy={-40} r={4.5} fill="#EDE8DE" stroke={L.line} strokeWidth={2.5} />
          <circle cx={0} cy={-8} r={4.5} fill="#EDE8DE" stroke={L.line} strokeWidth={2.5} />
        </g>
      ) : null}
      {L.gear === 'jacket' ? (
        // Nov 12 v6 (Javion: "multiple clothing stacked on top of everyone"): the jacket is ONE clean
        // garment now — the torso itself IS the jacket. The v5 yoke + two full-length panels (each
        // outlined, in a darker shade) piled on top of the torso and read as separate layers draped on
        // the chest. Removed. What remains is the cream shirt V (the shirt showing through the open
        // front) + a centre seam closing the front below the V. One top, one shirt inset, no stacking.
        <g opacity={frontFade}>
          <path d="M -22 -116 L 0 -52 L 22 -116 Z" fill="#EDE8DE" />
          <path d="M 0 -52 L 0 4" stroke={L.line} strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : null}
      {L.gear === 'hoodie' ? (
        <g opacity={frontFade} transform={`translate(${pose.sway * 0.8} 0)`}>
          <path d="M -12 -104 Q -14 -84 -16 -66 M 12 -104 Q 14 -84 16 -66" stroke="#EDE8DE" strokeWidth={4} strokeLinecap="round" fill="none" />
          <circle cx={-16} cy={-62} r={4.5} fill="#EDE8DE" stroke={L.line} strokeWidth={2} />
          <circle cx={16} cy={-62} r={4.5} fill="#EDE8DE" stroke={L.line} strokeWidth={2} />
        </g>
      ) : null}
      {/* HAIR_SAMPLE hem (Nov 8, Javion: the cloth must MOVE). The hem rides up and skews
          as the arms lift and the body leans — standing it sits level, cheering it lifts
          ~6px and tilts ~10°, mid-walk it sits in between. */}
      <g transform={`rotate(${(avgArmA - 10) * 0.1 + pose.tilt * 0.6 + pose.squash * 50}) translate(0 ${-(avgArmA - 10) * 0.05})`}>
        {/* Nov 12: the hem is a curved seam following the shaped torso's hem (waist/hips, y≈-6..+12),
            not a flat straight band — it hugs the body's bottom edge so the shirt ends at the waist. */}
        <path d="M -40 -6 Q 0 2 40 -6 L 38 5 Q 0 12 -38 5 Z" fill={L.jacketShade} opacity={0.65} />
        <path d="M -40 -6 Q 0 2 40 -6" stroke={L.line} strokeWidth={2} fill="none" opacity={0.5} />
      </g>
    </g>
  );
  const head = (
    <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt} 0 ${HD.y + 40})`}>
      <circle cx={HD.x} cy={HD.y} r={HD.r} fill={L.skin} stroke={L.line} strokeWidth={4} />
      {/* head shading crescent, lower-right — offsets scaled x0.87 for the slim head so it stays inside the circle */}
      <path d={`M ${HD.x + (slim ? 12 : 14)} ${HD.y + (slim ? 50 : 58)} A ${HD.r} ${HD.r} 0 0 0 ${HD.x + (slim ? 52 : 60)} ${HD.y + (slim ? 12 : 14)} A ${slim ? 52 : 70} ${slim ? 52 : 70} 0 0 1 ${HD.x + (slim ? 12 : 14)} ${HD.y + (slim ? 50 : 58)} Z`} fill={L.skinShade} />
      {L.hair && L.extra !== 'deerstalker' ? (
        // PEDESTRIAN HAIR (Nov 11, Javion: every pedestrian gets natural hair).
        // PedHair draws in its own local frame (head centre (0,0), r=62), so it is
        // translated to the head centre and shifted with yaw like the deerstalker.
        // Never renders for the Detective (deerstalker guard above) or for Jake /
        // the hero / the professors (they simply have no hair field).
        // Slim: translated to the smaller head centre and scaled x0.87 about it.
        <g transform={`translate(${-pose.yaw * 16} ${HD.y})${slim ? ' scale(0.87)' : ''}`}>
          <PedHair style={L.hair} hairC={L.hairC ?? '#3A2420'} line={L.line} />
        </g>
      ) : null}
      {L.extra === 'deerstalker' ? (
        // the Detective's deerstalker — v6, from a ZOOMED look at the live profile pic (Nov 7).
        // What v4/v5 missed: the pic's crown is FLAT and WIDE (151 wide, 43 tall) and the brim is
        // a DEEP soft visor — ~21 tall at the center front, half the crown's height — curving down
        // over the forehead and drooping to points past the head's sides. v5's band was a thin stripe
        // (16 tall on a 59-tall crown), which read as a flat cap. Bold panel seams + LITTLE BOW on top
        // (the locked look — Javion Nov 13: "the lil bow at the top is actually coo"; Nov 14 fix: the code
        // drew an oval button, not a bow).
        // Slim: scaled x0.87 about the smaller head centre (the little bow on top stays).
        <g transform={`translate(${-pose.yaw * 16} 0)${slim ? ' translate(0 -188) scale(0.87) translate(0 188)' : ''}`}>
          <path d="M -76 -210 A 76 43 0 0 1 76 -210 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 0 -247 L 0 -222" stroke={L.line} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M -7 -247 Q -32 -234 -42 -222" stroke={L.line} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M 7 -247 Q 32 -234 42 -222" stroke={L.line} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M -92 -198 Q -50 -222 0 -224 Q 50 -222 92 -198 Q 60 -196 30 -200 Q 0 -203 -30 -200 Q -60 -196 -92 -198 Z" fill={L.jacket} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          {/* little bow: two small loops + a centre knot, sitting on the crown's top seam */}
          <path d="M 0 -250 Q -11 -261 -17 -251 Q -11 -242 0 -250 Z" fill={L.jacket} stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M 0 -250 Q 11 -261 17 -251 Q 11 -242 0 -250 Z" fill={L.jacket} stroke={L.line} strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={0} cy={-250} r={3.5} fill={L.jacket} stroke={L.line} strokeWidth={2} />
        </g>
      ) : null}
      {snow && L.extra !== 'deerstalker' ? (
        // BEANIE (Nov 11, Javion: snow occasion = gloves + beanie + scarf). A knitted cap:
        // a smooth dome over the top of the head, a folded ribbed brim band, a small pom.
        // It is a HAT, not hair — no fringe, no strands, no side pieces; the dome is one
        // smooth arc, the brim is a straight folded band, the pom sits on top. Drawn after
        // the head circle and before the Face, like the deerstalker, so brows/eyes draw
        // over it. Shifts with yaw like the deerstalker. NOT rendered for the Detective:
        // his deerstalker is his signature and stays — in snow he gets gloves + scarf only.
        <g transform={`translate(${-pose.yaw * 16} 0)`}>
          <path d="M -68 -200 A 68 52 0 0 1 68 -200 Z" fill={BEANIE} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <g stroke={BEANIE_SHADE} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8}>
            <path d="M -34 -206 Q -38 -228 -30 -244" />
            <path d="M 0 -208 Q 0 -232 0 -248" />
            <path d="M 34 -206 Q 38 -228 30 -244" />
          </g>
          <rect x={-70} y={-212} width={140} height={18} rx={9} fill={BEANIE_SHADE} stroke={L.line} strokeWidth={3.5} />
          <g stroke="#8A4238" strokeWidth={2.5} strokeLinecap="round">
            <path d="M -52 -210 L -52 -196" />
            <path d="M -26 -210 L -26 -196" />
            <path d="M 0 -210 L 0 -196" />
            <path d="M 26 -210 L 26 -196" />
            <path d="M 52 -210 L 52 -196" />
          </g>
          <circle cx={0} cy={-256} r={11} fill={BEANIE} stroke={L.line} strokeWidth={3.5} />
          <path d="M -6 -260 Q 0 -266 6 -260" stroke={BEANIE_SHADE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {sun && L.extra !== 'deerstalker' ? (
        // SUN HAT (Nov 11, Javion: sun/heat occasion). A wide-brim straw hat: a low
        // dome crown, a WIDE flat brim (the defining feature — nothing else in the
        // rig has a brim this wide), and a darker band. It is a HAT, not hair: the
        // brim is a flat disc, the crown is a smooth dome, no fringe or strands.
        // NOT rendered for the Detective: his deerstalker is already a hat and stays.
        <g transform={`translate(${-pose.yaw * 16} 0)`}>
          <path d="M -64 -196 A 64 48 0 0 1 64 -196 Z" fill="#E8C86A" stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={0} cy={-196} rx={95} ry={14} fill="#E8C86A" stroke={L.line} strokeWidth={3.5} />
          <path d="M -64 -210 Q 0 -218 64 -210 L 64 -196 Q 0 -204 -64 -196 Z" fill="#BFA153" stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
        </g>
      ) : null}
      <Face expr={pose.expr} blink={pose.blink} look={pose.look} glasses={L.shades ? 1 : pose.glasses} yaw={pose.yaw} ink={L.face} glint={pose.glint} glintColor={pose.glintColor} specs={L.extra === 'specs'} slim={slim} mouthOpen={mouthOpen} showBrows={showBrows} />
      {L.gear === 'earrings' ? (
        <g stroke="#E8C86A" strokeWidth={4} fill="none" strokeLinecap="round">
          <circle cx={slim ? -52 : -60} cy={HD.y + 30} r={8} />
          <circle cx={slim ? 52 : 60} cy={HD.y + 30} r={8} />
        </g>
      ) : null}
    </g>
  );
  return (
    <g>
      {shadow > 0 ? <ellipse cx={pose.x} cy={pose.y + LL * pose.scale + 10} rx={(slim ? 60 : 70) * pose.scale} ry={12 * pose.scale} fill="#000" opacity={0.25 * shadow} /> : null}
      <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale}) rotate(${pose.spin} 0 -90)`} filter={`url(#${rimId})`}>
        <g transform={`translate(0 ${LL}) scale(${1 + 0.6 * pose.squash} ${1 - pose.squash}) translate(0 ${-LL})`}>
          {/* the far side is drawn first, so a turned body overlaps itself the right way */}
          {pose.yaw < 0 ? <>{limb(j.legR, LIMB_W(slim))}{shoe(j.legR)}{limb(j.legL, LIMB_W(slim))}{shoe(j.legL)}</> : <>{limb(j.legL, LIMB_W(slim))}{shoe(j.legL)}{limb(j.legR, LIMB_W(slim))}{shoe(j.legR)}</>}
          {/* SLEEVES (Nov 12 v17+v18): sleeves are drawn BEFORE the torso, so the torso covers
              the sleeve's buried start — the sleeve emerges from the shoulder with no gap, no
              bump, no tab. 'long' covers shoulder to wrist (sleeve()); 'tshirt' covers the upper
              arm only (tshirtSleeve()) and the bare forearm is drawn in the yaw branches below
              (armLimb()). The hands stay in their usual yaw branches (the wrist is below the
              torso, so hand draw order is unchanged). Characters with no sleeve field keep bare
              stick arms. Slim: NO sleeves — the Mars sample has bare thin stick arms and the
              coat is the torso only. */}
          {!slim && L.sleeve === 'long' ? <>{sleeve(j.armL)}{sleeve(j.armR)}</> : null}
          {!slim && L.sleeve === 'tshirt' ? <>{tshirtSleeve(j.armL)}{tshirtSleeve(j.armR)}</> : null}
          {pose.yaw < 0 ? <>{armLimb(j.armR)}{hand(j.armR, -1, pose.handR)}</> : <>{armLimb(j.armL)}{hand(j.armL, 1, pose.handL)}{!slim && L.gear === 'watch' ? watch(j.armL) : null}</>}
          {torso}
          {pose.yaw < 0 ? <>{armLimb(j.armL)}{hand(j.armL, 1, pose.handL)}{!slim && L.gear === 'watch' ? watch(j.armL) : null}</> : <>{armLimb(j.armR)}{hand(j.armR, -1, pose.handR)}</>}
          {L.extra === 'hood' ? (
            <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt * 0.5} 0 ${HEAD.y + 40})`}>
              <path d={`M -70 ${HEAD.y + 14} Q -80 ${HEAD.y - 74} 0 ${HEAD.y - 80} Q 80 ${HEAD.y - 74} 70 ${HEAD.y + 14} Q 52 -100 0 -106 Q -52 -100 -70 ${HEAD.y + 14} Z`} fill={L.jacket} stroke={L.line} strokeWidth={4} />
              {(() => {
                const sw = pose.sway * 0.7 - pose.tilt * 0.6;
                return (
                  <g>
                    <path d={`M -12 -108 Q ${-14 + sw * 0.3} -88 ${-16 + sw} -66 M 12 -108 Q ${14 + sw * 0.3} -88 ${16 + sw} -66`} stroke={L.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
                    <circle cx={-16 + sw} cy={-64} r={5} fill={L.accent} />
                    <circle cx={16 + sw} cy={-64} r={5} fill={L.accent} />
                  </g>
                );
              })()}
            </g>
          ) : null}
          {L.extra === 'curls' ? (
            <g transform={`rotate(${pose.tilt})`}>
              <path d="M -46 -110 Q 0 -86 46 -110" stroke="#E06A5A" strokeWidth={8} fill="none" strokeLinecap="round" />
              <rect x={-60} y={-126} width={20} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
              <rect x={40} y={-126} width={20} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
            </g>
          ) : null}
          {L.gear === 'hoodie' ? (
            // Nov 12 (Javion: "the clothes look disgusting"): the hood resting behind the neck — a COMPACT
            // rounded shape hugging the back of the head, not a wide cape. The old hood spanned ±84 with a
            // -178 top and read as a cape/collar draped oddly. This one is ±66 wide, tops out at -180 just
            // behind the head, and its bottom edge sits at the neck (y≈-100..-132) so it peeks out around the
            // head's sides and shoulders like a hood lying flat behind the neck. Drawn before the head, so
            // the head covers its middle and only the ring shows.
            <g transform={`rotate(${pose.tilt})`}>
              <path d="M -52 -100 Q -66 -150 -36 -170 Q 0 -180 36 -170 Q 66 -150 52 -100 Q 30 -130 0 -132 Q -30 -130 -52 -100 Z" fill={L.jacketShade} stroke={L.line} strokeWidth={3.5} strokeLinejoin="round" />
            </g>
          ) : null}
          {head}
        </g>
      </g>
    </g>
  );
};


/** A character is the rig in a costume: <Actor> is the same as <Hero>, named for scenes with more than one person. */
export const Actor = Hero;

/**
 * The Detective's magnifying glass (v4 signature prop): dark-wood handle + round slate lens in a BRASS
 * rim with a white glint. Place it at a hand — <Magnifier x={hand.x} y={hand.y} s={pose.scale} /> — the
 * lens sits just above the gripping hand and the handle runs down into it. Ported from
 * puppet_blackhead draw_held_magnifier (ring r 55 at hand + (28,-78), slate fill, white glint arc),
 * rescaled to the rig (head r 62) and lightened: the puppet's black handle and dark slate vanish on the
 * dusk sets, so the lens is a lighter slate (#4E5E84). Rim is BRASS #C9A227 (Nov 15, Javion: "why is
 * his magnifying glass green?" — the lime accent had been painted on the rim; a magnifying glass is a
 * real tool and its rim is brass, not the video's accent color). Handle is dark wood #6B4423 with a
 * dark edge. Wrap it in filter="url(#rimBlue)" so it catches the same warm tan edge light as the
 * characters. The hand position comes from joints(pose) + toWorld(pose, …).
 */
export const Magnifier: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* v8: the whole magnifier is drawn at 0.65 — the r=52 lens was 84% of the Detective's
        head diameter and filled the frame in the outro close-ups. Lens is now ~r=34.
        BRASS rim + dark-wood handle (Nov 15 — see the doc comment above). Lens stays
        clear slate glass — no tint, no accent color on it. */}
    <g transform="scale(0.65)">
      <line x1={26} y1={-28} x2={0} y2={0} stroke="#161616" strokeWidth={12} strokeLinecap="round" />
      <line x1={26} y1={-28} x2={0} y2={0} stroke="#6B4423" strokeWidth={6} strokeLinecap="round" />
      <circle cx={26} cy={-72} r={52} fill="#4E5E84" stroke="#C9A227" strokeWidth={7} />
      <circle cx={26} cy={-72} r={46} fill="none" stroke="#8A6D1F" strokeWidth={2} opacity={0.7} />
      <path d="M -12 -100 A 42 42 0 0 1 14 -112" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
      <circle cx={8} cy={-92} r={4} fill="#FFFFFF" />
    </g>
  </g>
);

/**
 * RAIN (Nov 11, Javion: dress for the occasion). An umbrella, a hand prop like the
 * Magnifier: the shot places it at a hand — `const h = toWorld(p, joints(p).armR.end)`
 * then `<Umbrella x={h.x} y={h.y} />`. The pole runs from the hand up to the canopy,
 * which clears the head (canopy chord ~260 above the hand, head top ~238 above the
 * hip). Canopy is red so it pops on the dusk sets. Tilt it slightly for wind.
 */
export const Umbrella: React.FC<{ x: number; y: number; s?: number; tilt?: number }> = ({ x, y, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
    <line x1={0} y1={6} x2={0} y2={-260} stroke="#161616" strokeWidth={8} strokeLinecap="round" />
    <line x1={0} y1={6} x2={0} y2={-260} stroke="#566A85" strokeWidth={3.5} strokeLinecap="round" />
    <path d="M -80 -260 A 80 58 0 0 1 80 -260 Z" fill="#C0392B" stroke="#161616" strokeWidth={4} strokeLinejoin="round" />
    <g stroke="#96281B" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85}>
      <path d="M -40 -262 Q -44 -286 -30 -306" />
      <path d="M 0 -262 L 0 -314" />
      <path d="M 40 -262 Q 44 -286 30 -306" />
    </g>
    <circle cx={0} cy={-320} r={7} fill="#161616" />
  </g>
);

/**
 * A walk in profile. `phase` advances about 0.6 a frame for a normal walk; `ground` is the floor height under the hips
 * (a number, or a function of x for stairs and slopes). Leans into the step, bobs the head, bends the elbows, swings
 * loose things (the drawstrings) a beat behind the body.
 */
export const walkPose = (x: number, phase: number, ground: number | ((x: number) => number), scale = 0.9, extra: Partial<Pose> = {}, facing: 1 | -1 = 1): Pose => {
  const s = Math.sin(phase);
  const g = typeof ground === 'number' ? ground : ground(x);
  return {
    ...basePose,
    x,
    y: g - LEG_LEN * scale - Math.abs(Math.cos(phase)) * 7,
    scale,
    facing,
    yaw: facing,
    tilt: 5 * facing,
    headTilt: 2 * Math.sin(phase * 2),
    sway: 10 * Math.sin(phase + 0.8),
    legL: { a: 28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2)) },
    legR: { a: -28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2 + Math.PI)) },
    // v8 fix (Nov 9, Javion: "jake arms are literally swinging too much for no reason"):
    // 24 deg read as exaggerated flailing in motion. 12 deg is a natural walk swing.
    armL: { a: 12 * s, b: 12 + 14 * Math.abs(s) },
    armR: { a: 12 * s, b: 12 + 14 * Math.abs(s) },
    ...extra,
  };
};

/** Two-bone IK for a leg: thigh (72) + shin (68). `w` is the foot's offset from the hip
    in facing-forward units (positive = ahead of the body), `v` is how far below the hip.
    Returns {a, b} in the rig's limb convention (a: thigh angle from straight down,
    b: knee bend, negative = knee forward). Verified by round-trip: forward kinematics
    of the returned angles lands back on the target. */
const solveLeg = (w: number, v: number): Limb => {
  let d = Math.hypot(w, v);
  if (d > LEG_LEN - 0.01) {
    const s = (LEG_LEN - 0.01) / d;
    w *= s;
    v *= s;
    d = LEG_LEN - 0.01;
  }
  if (d < 8) {
    w = 0;
    v = 8;
    d = 8;
  }
  const phi = Math.atan2(w, v); // hip->foot line, from straight down
  const psi = Math.acos(clamp((THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d), -1, 1));
  const chi = Math.acos(clamp((SHIN * SHIN + d * d - THIGH * THIGH) / (2 * SHIN * d), -1, 1));
  const a = ((phi + psi) * 180) / Math.PI; // thigh angles forward of the line: knee forward
  const a2 = ((phi - chi) * 180) / Math.PI; // shin angles back to the foot
  return { a, b: a2 - a };
};

/**
 * A walk with TRUE planted steps (S2 entrance fix, Nov 8 2026 — Javion: "literally walking
 * in place and gliding across the fucking floor"). Each foot PLANTS on the floor, holds
 * while the body moves over it, then swings forward to the next plant. The stride is
 * derived from the body's own speed (distance per step = speed x step time), so the feet
 * can never slide relative to the floor. ~2 steps/sec (15 frames/step at 30fps).
 * Why the old walkPose glided: its fixed ±28° swing moved each foot ~150px per cycle
 * while the body only advanced ~26px per step, and at every swing extreme both feet sat
 * ~18px above the floor (a leg at 28° is 12% shorter vertically) — feet never planted.
 * Here the legs are solved with 2-bone IK from the foot targets, and the hip height comes
 * out of the stance leg's geometry (straight at mid-stance, lowest at double support),
 * so the bob is real instead of a pasted sine. Arms swing opposite the legs with a slight
 * elbow bend, never stiff. `x0`/`x1` are the hip's world x at t=0/len — LINEAR, a walk
 * must not ease in/out (the old easeInOut made Jake linger on top of guestB at the door).
 * `ground` is the floor's world y. Only S2 uses this for now (scoped fix); walkPose keeps
 * its old behaviour for the other shots until the verification pass decides on them.
 */
export const plantedWalkPose = (
  x0: number,
  x1: number,
  t: number,
  len: number,
  ground: number,
  scale = 1.1,
  extra: Partial<Pose> = {},
  facing: 1 | -1 = -1,
): Pose => {
  const T = 15; // frames per step — 2 steps/sec at 30fps
  const v = (x1 - x0) / Math.max(1, len); // world px/frame, linear
  const dir = v < 0 ? -1 : 1; // world walking direction
  const stride = Math.abs(v) * T; // px the body travels per step
  const x = x0 + v * t;
  const n = Math.floor(t / T); // step index: a foot plants every T frames
  const frac = t / T - n; // 0..1 within the current step
  // Plants: at step k the planting foot lands half a stride ahead of the body.
  const plantAt = (k: number) => x0 + v * (k * T) + dir * (stride / 2);
  const stanceIsLeft = n % 2 === 0; // left plants on even steps, right on odd
  const stanceX = plantAt(n); // the planted foot: fixed until the next step
  const swingFrom = plantAt(n - 1); // the swinging foot: lifts off its old plant...
  const swingTo = plantAt(n + 1); // ...and lands a full stride ahead of it
  const e = easeInOut(frac); // swing: slow at lift-off and plant, fast mid-swing
  const swingX = swingFrom + (swingTo - swingFrom) * e;
  const lift = 26 * Math.sin(Math.PI * frac); // world px the swinging foot lifts
  // Hip height from the stance leg: straight at mid-stance, lowest at double support.
  const stanceOff = (stanceX - x) / scale; // local px, stance foot ahead/behind the hip
  const hipH = Math.sqrt(Math.max(60 * 60, LEG_LEN * LEG_LEN - stanceOff * stanceOff));
  const y = ground - hipH * scale;
  // Local foot targets (hips at 0,0, y down). In profile the hip roots nearly coincide.
  const sp = 1 - 0.85; // limbSpread(±1) — yaw is full profile, roots ~±2.5 apart
  const rootL = -HIP.x * sp;
  const rootR = HIP.x * sp;
  const toLocal = (worldX: number, worldY: number, rootX: number) => ({
    w: facing * ((worldX - x) / scale - rootX),
    v: (worldY - y) / scale,
  });
  const stanceT = toLocal(stanceX, ground, stanceIsLeft ? rootL : rootR);
  const swingT = toLocal(swingX, ground - lift, stanceIsLeft ? rootR : rootL);
  const legL = stanceIsLeft ? solveLeg(stanceT.w, stanceT.v) : solveLeg(swingT.w, swingT.v);
  const legR = stanceIsLeft ? solveLeg(swingT.w, swingT.v) : solveLeg(stanceT.w, stanceT.v);
  // Arms swing opposite the legs: at s=0 the left foot plants ahead, so the left arm is
  // back and the right arm forward. Both arms share one `a` value because the rig mirrors
  // arms by side (armL forward is a>0, armR forward is a<0) — same value, opposite swing.
  const s = (((t / T) % 2) + 2) % 2; // 0..2 step phase
  // v8 fix (Nov 9): 16 deg arm swing read as flailing in motion; 12 deg is a natural walk.
  const armA = -12 * Math.cos(Math.PI * s);
  return {
    ...basePose,
    x,
    y,
    scale,
    facing,
    yaw: facing,
    tilt: 4 * facing, // lean into the walk
    headTilt: 2 * Math.sin(Math.PI * s),
    sway: 5 * Math.sin(Math.PI * s + 0.8),
    legL,
    legR,
    armL: { a: armA, b: 8 },
    armR: { a: armA, b: 8 },
    ...extra,
  };
};

/** Where the feet are for a pose standing at hip y: use it to put a character on a floor (y = floor - feetBelowHips). */
export const feetBelowHips = (scale: number) => LEG_LEN * scale;
