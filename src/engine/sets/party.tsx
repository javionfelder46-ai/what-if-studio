import React from 'react';
import { makeRoom, Box, pts } from '../room';
import { PedHair, PedHairStyle } from '../rig';
import { RoomShell, BackWindow, Pendant, pendantLight, WallLight, FloorShadow, FloorPlant, WallClock, WallFrame, stand } from '../furnish';
import { Glow, LightVeil, Dust } from '../light';

// The house party at dusk, built with the room kit: a back window with the low sun on the left, a lit doorway
// on the right wall (Jake walks through it), string lights across the ceiling, two pendants over the crowd floor,
// a snack table along the back wall, a sofa on the left wall, a rug in the middle, and a big framed board on the
// back wall at PARTY_SIGN — the wall spot for the GIANT LOBSTER SIGN (drawn per-shot in shots.tsx, plain lobster,
// no shades, no thumbs-up). Characters stand on the crowd floor at about w 0.4-0.55 (stand(PARTY, u, w)); the
// door's floor point is PARTY_DOOR. Warm practicals everywhere: no even light, pools and dark corners.
// CHANNEL DUSK STYLE (video #2's storyboard poster, the channel look from here on): the party's painterly dusk
// lives here — the low sun through the back window, string lights + pendant pools (LightVeil holes + Glow), dust
// in the beams, muted mid-dark walls so the practicals read. Characters stay flat-vector black silhouettes; the
// light, haze and background depth around them do the painting. A per-shot spotlight uses the engine's
// SpotlightBeam (light.tsx), not set dressing.
export const PARTY = makeRoom({ x: 980, y: 500 }, { x0: 520, x1: 1440, y0: 330, y1: 745 }, 3.4);

/** The framed board on the back wall where the giant lobster sign hangs (screen rect, world units). */
export const PARTY_SIGN = { x: 1109, y: 396, w: 257, h: 162 };
/** The floor point at the foot of the lit doorway on the right wall — where Jake enters. */
export const PARTY_DOOR = PARTY.P(1, 1, 0.3);
/** Hip point + scale for a character standing on the party floor at (u, w). */
export const partyStand = (u: number, w: number) => stand(PARTY, u, w);

const WALL = '#43303E';
const SIDE = '#33242E';
const FLOORC = '#2E2530';

/** A background partygoer — a simplified standing silhouette, NOT a named character.
    The party reads as a party because the room is FULL: the crowd fills the background
    (snack table, sofa, back wall, door) so the foreground play area feels like one corner
    of a dense room. The crowd is what gives the Detective cover to sneak in the background
    (Javion, Nov 9: "make the party dense with people... so when the detective is in he cant
    be all in the open"). Looks cycle through varied tops; nobody in the crowd
    matches a named guest's look, so nobody reads as a clone. Subtle sway + head tilt with t —
    background people move too, just quietly. */
export type PartyGuestLook = {
  top: string;
  /** One accessory per figure, like the named cast — it must read at background scale,
      so only bold ones: a scarf, a bowtie, gold earrings, a chest badge. */
  gear: 'scarf' | 'bowtie' | 'earrings' | 'badge' | 'none';
  /** One clothing detail on the torso: a collar, a pocket, stripes, or buttons. */
  detail: 'collar' | 'pocket' | 'stripes' | 'buttons';
  /** Natural pedestrian hair (Nov 11, Javion: every pedestrian gets hair — natural
      hair, nothing that looks like a hat). PedHair at crowd scale (0.42); the
      style + brown colour cycle so no two neighbours match. */
  hair: PedHairStyle;
  /** Hair colour (a natural brown). Defaults to #3A2420. */
  hairC?: string;
};
export const PARTY_GUESTS: PartyGuestLook[] = [
  { top: '#5A7A9A', gear: 'scarf', detail: 'collar', hair: 'sidepart', hairC: '#3A2420' },
  { top: '#9A5A6A', gear: 'earrings', detail: 'pocket', hair: 'curly', hairC: '#2A1E14' },
  { top: '#6A9A5A', gear: 'bowtie', detail: 'buttons', hair: 'crop', hairC: '#5A3A28' },
  { top: '#8A6A9A', gear: 'badge', detail: 'stripes', hair: 'bun', hairC: '#4A3226' },
  { top: '#C97A3A', gear: 'scarf', detail: 'pocket', hair: 'ponytail', hairC: '#6A4A2E' },
  { top: '#4A8A7A', gear: 'none', detail: 'collar', hair: 'afro', hairC: '#241A12' },
  { top: '#B85A7A', gear: 'earrings', detail: 'buttons', hair: 'sidepart', hairC: '#8A5A3A' },
  { top: '#5A8A6A', gear: 'bowtie', detail: 'stripes', hair: 'curly', hairC: '#3A2A1A' },
];

const PartyGuest: React.FC<{ x: number; y: number; s: number; look: PartyGuestLook; t: number; seed: number; flip?: boolean }> = ({ x, y, s, look, t, seed, flip = false }) => {
  const sway = Math.sin(t / 28 + seed * 1.7) * 1.6;
  const tilt = Math.sin(t / 36 + seed * 2.3) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
      {/* legs + shoes */}
      <path d="M -16 0 L -14 64 L -4 64 L -2 0 Z" fill="#161616" />
      <path d="M 2 0 L 4 64 L 14 64 L 16 0 Z" fill="#161616" />
      <ellipse cx={-9} cy={68} rx={12} ry={6} fill="#161616" />
      <ellipse cx={9} cy={68} rx={12} ry={6} fill="#161616" />
      {/* torso in the look's top colour */}
      <path d="M -30 -138 Q 0 -148 30 -138 L 26 2 Q 0 10 -26 2 Z" fill={look.top} stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
      {/* clothing detail on the torso — collar, pocket, stripes, or buttons */}
      {look.detail === 'collar' ? (
        <path d="M -18 -138 L 0 -118 L 18 -138" fill="none" stroke="#EDE8DE" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {look.detail === 'pocket' ? <rect x={10} y={-58} width={14} height={12} rx={2} fill="none" stroke="#161616" strokeWidth={2.5} /> : null}
      {look.detail === 'stripes' ? (
        <g stroke="#161616" strokeWidth={4} strokeLinecap="round" opacity={0.6}>
          <path d="M -26 -90 L 26 -90" />
          <path d="M -27 -62 L 27 -62" />
        </g>
      ) : null}
      {look.detail === 'buttons' ? (
        <g fill="#EDE8DE" stroke="#161616" strokeWidth={2}>
          <circle cx={0} cy={-96} r={4} />
          <circle cx={0} cy={-64} r={4} />
          <circle cx={0} cy={-32} r={4} />
        </g>
      ) : null}
      {/* arms hanging at the sides, swaying a touch with the body */}
      <path d="M -30 -132 Q -38 -70 -32 -8" stroke="#161616" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 30 -132 Q 38 -70 32 -8" stroke="#161616" strokeWidth={9} fill="none" strokeLinecap="round" />
      {/* head (black silhouette + natural pedestrian hair — PedHair at crowd
          scale: head r=26 vs the Hero's r=62, so scale 0.42; hair draws after
          the head circle, before the face, like the Hero) */}
      <g transform={`translate(0 -168) rotate(${tilt})`}>
        <circle r={26} fill="#161616" />
        <g transform="scale(0.42)">
          <PedHair style={look.hair} hairC={look.hairC ?? '#3A2420'} line="#161616" />
        </g>
        {/* faces — the crowd had none, which is why they read as mannequins */}
        {seed % 3 === 1 ? (
          <g>
            <ellipse cx={-10} cy={-4} rx={4.5} ry={7} fill="#FFFFFF" />
            <path d="M 4 -4 Q 10 -10 16 -4" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            <path d="M -8 12 Q 0 17 8 12" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          </g>
        ) : seed % 3 === 2 ? (
          <g>
            <ellipse cx={-10} cy={-4} rx={4.5} ry={7} fill="#FFFFFF" />
            <ellipse cx={10} cy={-4} rx={4.5} ry={7} fill="#FFFFFF" />
            <ellipse cx={0} cy={13} rx={5} ry={3.5} fill="#FFFFFF" />
          </g>
        ) : (
          <g>
            <ellipse cx={-10} cy={-4} rx={4.5} ry={7} fill="#FFFFFF" />
            <ellipse cx={10} cy={-4} rx={4.5} ry={7} fill="#FFFFFF" />
            <path d="M -8 12 Q 0 17 8 12" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* accessory — one bold item per figure, drawn to read at background scale */}
        {look.gear === 'earrings' ? (
          <g fill="#D9A441" stroke="#161616" strokeWidth={1.5}>
            <circle cx={-26} cy={2} r={4} />
            <circle cx={26} cy={2} r={4} />
          </g>
        ) : null}
      </g>
      {/* bowtie / scarf / badge sit at the neck and chest, not on the head */}
      {look.gear === 'bowtie' ? (
        <g transform="translate(0 -138)">
          <path d="M 0 0 L -14 -8 L -14 8 Z M 0 0 L 14 -8 L 14 8 Z" fill="#161616" stroke="#161616" strokeWidth={2} strokeLinejoin="round" />
          <circle r={4} fill="#161616" />
        </g>
      ) : null}
      {look.gear === 'scarf' ? (
        <g>
          <path d="M -28 -138 Q 0 -126 28 -138 L 24 -122 Q 0 -112 -24 -122 Z" fill="#C0392B" stroke="#161616" strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M 12 -122 Q 20 -96 14 -72 L 4 -76 Q 10 -98 4 -120 Z" fill="#C0392B" stroke="#161616" strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      ) : null}
      {look.gear === 'badge' ? <rect x={-22} y={-108} width={16} height={12} rx={2} fill="#EDE8DE" stroke="#161616" strokeWidth={2} /> : null}
    </g>
  );
};

export const Party: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'pty', veil = 0.44 }) => {
  const R = PARTY;
  const { P, Q } = R;
  // string lights across the ceiling: a sagging wire with warm bulbs, swaying a touch
  const wire: { x: number; y: number }[] = [];
  for (let i = 0; i <= 12; i++) {
    const k = i / 12;
    const x = 560 + k * 840;
    const y = 352 + 52 * Math.sin(k * Math.PI) + Math.sin(t / 26 + i * 0.9) * 1.5;
    wire.push({ x, y });
  }
  const wireD = wire.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const door = PARTY_DOOR;
  return (
    <g>
      <RoomShell r={R} id={id} floor="boards" wall={WALL} side={SIDE} floorC={FLOORC} lines="#241A24" />
      {/* the back window, low sun, curtains */}
      <BackWindow r={R} id={`${id}w`} t={t} x0={600} x1={900} y0={380} y1={560} sun={{ x: 860, y: 540 }} cols={2} curtains />
      {/* the framed board for the lobster sign (generic warm art underneath; the sign covers it where drawn) */}
      <rect x={PARTY_SIGN.x - 8} y={PARTY_SIGN.y - 8} width={PARTY_SIGN.w + 16} height={PARTY_SIGN.h + 16} fill="#1E1824" />
      <rect x={PARTY_SIGN.x} y={PARTY_SIGN.y} width={PARTY_SIGN.w} height={PARTY_SIGN.h} fill="#E9D9B8" />
      {[0, 1, 2].map((i) => (
        <path key={`bun${i}`} d={`M ${PARTY_SIGN.x + 20 + i * 80} ${PARTY_SIGN.y + 14} L ${PARTY_SIGN.x + 44 + i * 80} ${PARTY_SIGN.y + 44} L ${PARTY_SIGN.x + 68 + i * 80} ${PARTY_SIGN.y + 14} Z`} fill={['#C0392B', '#E9A84A', '#3E8C86'][i]} />
      ))}
      <circle cx={PARTY_SIGN.x + PARTY_SIGN.w / 2} cy={PARTY_SIGN.y + 108} r={30} fill="#E9A84A" />
      <path d={`M ${PARTY_SIGN.x + 30} ${PARTY_SIGN.y + 138} Q ${PARTY_SIGN.x + 128} ${PARTY_SIGN.y + 116} ${PARTY_SIGN.x + 227} ${PARTY_SIGN.y + 138}`} stroke="#8A6A4A" strokeWidth={4} fill="none" />
      {/* the lit doorway on the right wall, door ajar, hall light spilling onto the floor.
          Nov 9 fix: the opening had no jamb, the knob was a speck, and there was no
          threshold — it read as a flat poster, not a doorway. */}
      <polygon points={Q([[1, 0.22, 0.08], [1, 0.22, 0.42], [1, 1, 0.42], [1, 1, 0.08]])} fill="#FFE2B0" opacity={0.9} stroke="#1E1824" strokeWidth={6} strokeLinejoin="round" />
      <polygon points={Q([[1, 0.22, 0.42], [1, 0.22, 0.52], [1, 1, 0.52], [1, 1, 0.42]])} fill="#4A3C48" stroke="#1E1824" strokeWidth={4} />
      <circle cx={P(1, 0.6, 0.5).x} cy={P(1, 0.6, 0.5).y} r={10} fill="#C9A46A" stroke="#1E1824" strokeWidth={3} />
      <polygon points={pts([{ x: door.x - 70, y: door.y + 118 }, { x: door.x + 70, y: door.y + 118 }, { x: door.x + 90, y: door.y + 132 }, { x: door.x - 90, y: door.y + 132 }])} fill="#6A4A3A" />
      <polygon points={pts([{ x: door.x - 90, y: door.y }, { x: door.x + 90, y: door.y }, { x: door.x + 190, y: door.y + 120 }, { x: door.x - 190, y: door.y + 120 }])} fill="#FFD39A" opacity={0.16} style={{ mixBlendMode: 'screen' }} />
      <Glow x={P(1, 0.55, 0.25).x} y={P(1, 0.55, 0.25).y} r={240} o={0.5} />
      {/* the snack table along the back wall: cups, a chip bowl, bottles */}
      <FloorShadow r={R} u={[0.06, 0.44]} w={[0.02, 0.16]} />
      <Box r={R} u={[0.06, 0.43]} v={[0.72, 1]} w={[0, 0.14]} front="#5B4038" top="#7A5747" side="#3A2826" rim />
      {(() => {
        const top = (u: number) => P(u, 0.72, 0.07);
        return (
          <g>
            {[0.1, 0.16, 0.22, 0.34, 0.39].map((u, i) => {
              const p = top(u);
              const c = ['#C0392B', '#E9A84A', '#3E8C86', '#D9A441', '#8A5A9A'][i];
              return (
                <g key={`cup${i}`}>
                  <path d={`M ${p.x - 10} ${p.y - 26} L ${p.x + 10} ${p.y - 26} L ${p.x + 7} ${p.y} L ${p.x - 7} ${p.y} Z`} fill={c} />
                  <rect x={p.x - 10} y={p.y - 26} width={20} height={5} fill="#F4EEE0" opacity={0.7} />
                </g>
              );
            })}
            {(() => {
              const b = top(0.28);
              return (
                <g>
                  <ellipse cx={b.x} cy={b.y - 4} rx={34} ry={11} fill="#E6E0D4" />
                  {[-14, 2, 16].map((dx, i) => (
                    <ellipse key={i} cx={b.x + dx} cy={b.y - 14 - (i === 1 ? 5 : 0)} rx={10} ry={8} fill="#E9C84A" />
                  ))}
                </g>
              );
            })()}
            {[0.45, 0.5].map((u, i) => {
              const p = top(u - 0.08);
              return <path key={`bt${i}`} d={`M ${p.x - 8} ${p.y - 44} L ${p.x + 8} ${p.y - 44} L ${p.x + 10} ${p.y} L ${p.x - 10} ${p.y} Z`} fill={i ? '#4A7A3A' : '#7A3A2A'} />;
            })}
          </g>
        );
      })()}
      {/* the sofa on the left wall — Nov 9: it read as a flat purple panel (only
          the side face showed). Added a seat plane and an armrest so it reads as a sofa. */}
      <FloorShadow r={R} u={[0.02, 0.1]} w={[0.1, 0.52]} />
      <Box r={R} u={[0, 0.07]} v={[0.55, 1]} w={[0.12, 0.5]} front="#5A3A5A" side="#402A40" rim />
      <polygon points={Q([[0, 0.72, 0.12], [0.07, 0.72, 0.12], [0.07, 0.72, 0.5], [0, 0.72, 0.5]])} fill="#6A4658" />
      <polygon points={Q([[0.07, 0.55, 0.46], [0.07, 0.55, 0.5], [0.07, 0.85, 0.5], [0.07, 0.85, 0.46]])} fill="#4A2E48" />
      {[0.18, 0.32, 0.46].map((w, i) => {
        const c = P(0.07, 0.55, w);
        return <polygon key={`cu${i}`} points={Q([[0.07, 0.55, w - 0.05], [0.07, 0.55, w + 0.05], [0.07, 0.72, w + 0.05], [0.07, 0.72, w - 0.05]])} fill={i === 1 ? '#6A4658' : '#52344A'} />;
      })}
      {/* the rug in the middle of the crowd floor */}
      <polygon points={Q([[0.3, 1, 0.32], [0.72, 1, 0.32], [0.72, 1, 0.82], [0.3, 1, 0.82]])} fill="#5A2C3A" />
      <polygon points={Q([[0.34, 1, 0.36], [0.68, 1, 0.36], [0.68, 1, 0.78], [0.34, 1, 0.78]])} fill="none" stroke="#7A4252" strokeWidth={5} />
      {/* wall dressing: a clock, two framed prints on the left wall, plants in the corners */}
      <WallClock x={P(0.5, 0.14, 0).x} y={P(0.5, 0.14, 0).y} r={26} t={t} />
      <WallFrame x={P(0, 0.2, 0.3).x - 10} y={P(0, 0.2, 0.3).y} w={110} h={86} art={1} />
      <WallFrame x={P(0, 0.48, 0.62).x - 10} y={P(0, 0.48, 0.62).y} w={96} h={76} art={2} />
      <FloorPlant r={R} u={0.93} w={0.06} />
      <FloorPlant r={R} u={0.05} w={0.72} size={0.8} />
      {/* a couple of floor cushions near the rug */}
      {[
        { u: 0.24, w: 0.68, c: '#3E8C86' },
        { u: 0.78, w: 0.66, c: '#D9A441' },
      ].map((c, i) => {
        const p = P(c.u, 1, c.w);
        const k = R.s(c.w);
        return (
          <g key={`cush${i}`}>
            <ellipse cx={p.x} cy={p.y + 2} rx={52 * k} ry={11 * k} fill="#000" opacity={0.35} />
            <ellipse cx={p.x} cy={p.y - 8 * k} rx={48 * k} ry={18 * k} fill={c.c} />
            <ellipse cx={p.x} cy={p.y - 14 * k} rx={40 * k} ry={14 * k} fill={c.c} opacity={0.8} />
            {/* seam ring — Nov 9: without it the cushions read as flat coloured discs */}
            <ellipse cx={p.x} cy={p.y - 11 * k} rx={42 * k} ry={14 * k} fill="none" stroke="#00000055" strokeWidth={3} />
          </g>
        );
      })}
      {/* THE CROWD — the party is DENSE (Javion, Nov 9). Eight background partygoers fill the
          room behind the foreground play area: snack table, sofa, back wall, door. The foreground
          named guests (Jake + guestA/B/C) play in front of them; the crowd is the room being full.
          Positions stay in the background (w <= 0.46) and clear of the sign board's face. */}
      {[
        { u: 0.11, w: 0.14 }, // Nov 11: was u 0.06 — half-cropped at the left edge in tight cameras (S48), its eyes read as floating
        { u: 0.16, w: 0.18 },
        // Nov 9 fix: the two left spots (u 0.05/0.12) sat inside the sofa's
        // footprint, so the figures read as standing ON the sofa even with
        // feet on the floor — moved out onto open floor by the back wall.
        { u: 0.18, w: 0.42 },
        { u: 0.24, w: 0.48 },
        { u: 0.32, w: 0.12 },
        { u: 0.62, w: 0.12 },
        { u: 0.84, w: 0.28 },
        { u: 0.89, w: 0.34 },
        // Nov 9 fix (Javion: "why the fuck is the ppl in the back small?????",
        // "do you not know what a party full of ppl look like"): six more
        // figures so the room reads FULL — a party, not eight small dolls.
        { u: 0.45, w: 0.15 },
        { u: 0.75, w: 0.18 },
        { u: 0.50, w: 0.30 },
        { u: 0.38, w: 0.45 },
        { u: 0.68, w: 0.45 },
        { u: 0.28, w: 0.25 },
      ].map((spot, i) => {
        const p = partyStand(spot.u, spot.w);
        // PartyGuest legs are 68 long but stand() subtracts LEG_LEN (140, the Hero's leg
        // length) to place the hip — so the crowd's feet floated 72*s above the floor and
        // the left figures read as STANDING ON the sofa/snack table (Javion, Nov 9:
        // "why is people ontop of funiture??"). Feet stay on the floor: hip y = floor - 68*s,
        // floor = p.y + 140*p.scale.
        // Nov 9: the perspective scale made the back crowd ~0.74 (two-thirds of the
        // foreground) so they read as children/dolls. Boost to ~1.0 and clamp to
        // 0.9–1.1 so every figure reads as an adult in the room, not a doll.
        const s = Math.min(Math.max(p.scale * 1.35, 0.9), 1.1);
        const y = p.y + 140 * p.scale - 68 * s;
        return <PartyGuest key={`crowd${i}`} x={p.x} y={y} s={s} look={PARTY_GUESTS[i % PARTY_GUESTS.length]} t={t} seed={i} flip={i % 3 === 0} />;
      })}
      {/* the string lights, glowing */}
      <path d={wireD} stroke="#1E1824" strokeWidth={3} fill="none" />
      {wire.map((p, i) =>
        i % 2 === 0 ? (
          <g key={`bl${i}`}>
            <circle cx={p.x} cy={p.y + 12} r={9} fill="#FFD39A" />
            <Glow x={p.x} y={p.y + 12} r={46} o={0.5} />
          </g>
        ) : null,
      )}
      <Pendant r={R} u={0.35} w={0.5} v={0.24} t={t} />
      <Pendant r={R} u={0.65} w={0.5} v={0.24} t={t + 9} />
      <WallLight r={R} u={0} v={0.42} w={0.66} />
      <LightVeil
        id={`${id}veil`}
        lights={[
          [750, 470, 430],
          pendantLight(R, 0.35, 0.5, 0.24),
          pendantLight(R, 0.65, 0.5, 0.24),
          [P(1, 0.55, 0.25).x, P(1, 0.55, 0.25).y, 380],
          [980, 400, 420],
          [980, 950, 420],
        ]}
        o={veil}
      />
      <Glow x={750} y={470} r={260} o={0.3} />
      {[0.35, 0.65].map((u) => {
        const [x, y] = pendantLight(R, u, 0.5, 0.24);
        return <Glow key={u} x={x} y={y - 34} r={250} o={0.32} />;
      })}
      <Dust t={t} seed={17} x0={600} y0={400} w={420} h={420} n={36} />
      <Dust t={t} seed={23} x0={880} y0={380} w={300} h={300} n={18} o={0.4} />
    </g>
  );
};
