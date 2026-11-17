import React from 'react';
import { makeRoom, S3, Box } from '../room';
import { RoomShell, Pendant, pendantLight, WallFrame, FloorShadow, stand } from '../furnish';
import { WallTexture, LightVeil, Dust, Glow } from '../light';

// The locked room: video #3's main set. A bare room in one-point perspective — one padlocked door, one small
// barred window high on the back wall, one bare bulb that never goes off (the pendant), a mattress on the floor,
// food tray by the door, tally marks counting the days on the wall, and the note: "thirty days. Good luck."
// Flags pick the dressing per shot: `door` (the padlocked door), `bed` (a bed frame instead of the floor
// mattress), `window` (the barred window), `prison` (grey tiles + bars for the Grassian flashback).
// `day` sets how many tally marks are on the wall (one per day, capped at 30).
export const CELL = makeRoom({ x: 960, y: 500 }, { x0: 520, x1: 1400, y0: 330, y1: 740 }, 3.4);

/** A quadrilateral with rounded corners, as an SVG path. `p` are four screen points in order,
    `r` is the corner radius in px. Sharp corners read as a hard box; rounded corners read as
    soft fabric — that's the difference between a white box and a pillow. */
type SPt = { x: number; y: number };

/** A soft, plump, bulging closed outline through a list of screen points.
 *  Each edge is a quadratic curve whose control point is pushed OUTWARD from
 *  the shape's centre, so the sides bulge instead of running straight. A
 *  fluffy pillow bulges in the middle — straight edges read as a box, no
 *  matter how rounded the corners are. */
const fluffyOutline = (pts: SPt[], bulge: number): string => {
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p.x, 0) / n;
  const cy = pts.reduce((s, p) => s + p.y, 0) / n;
  const fmt = (p: SPt) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    // two perpendiculars; keep the one pointing away from the centre
    const c1x = mx + (-dy / len) * bulge;
    const c1y = my + (dx / len) * bulge;
    const c2x = mx + (dy / len) * bulge;
    const c2y = my + (-dx / len) * bulge;
    const d1 = Math.hypot(c1x - cx, c1y - cy);
    const d2 = Math.hypot(c2x - cx, c2y - cy);
    const px = d1 > d2 ? c1x : c2x;
    const py = d1 > d2 ? c1y : c2y;
    if (i === 0) d += `M ${fmt(a)} `;
    d += `Q ${px.toFixed(1)},${py.toFixed(1)} ${fmt(b)} `;
  }
  return d + 'Z';
};
const roundedQuad = (p: SPt[], r: number): string => {
  const [a, b, c, d] = p;
  const sub = (p1: SPt, p2: SPt) => ({ x: p1.x - p2.x, y: p1.y - p2.y });
  const len = (v: SPt) => Math.hypot(v.x, v.y) || 1;
  const norm = (v: SPt) => { const l = len(v); return { x: v.x / l, y: v.y / l }; };
  const add = (pt: SPt, v: SPt, s: number) => ({ x: pt.x + v.x * s, y: pt.y + v.y * s });
  const fmt = (pt: SPt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  const eAB = norm(sub(b, a)), eBC = norm(sub(c, b)), eCD = norm(sub(d, c)), eDA = norm(sub(a, d));
  const p1 = add(a, eAB, r), p2 = add(b, eAB, -r);
  const p3 = add(b, eBC, r), p4 = add(c, eBC, -r);
  const p5 = add(c, eCD, r), p6 = add(d, eCD, -r);
  const p7 = add(d, eDA, r), p8 = add(a, eDA, -r);
  return `M ${fmt(p1)} L ${fmt(p2)} Q ${fmt(b)} ${fmt(p3)} L ${fmt(p4)} Q ${fmt(c)} ${fmt(p5)} L ${fmt(p6)} Q ${fmt(d)} ${fmt(p7)} L ${fmt(p8)} Q ${fmt(a)} ${fmt(p1)} Z`;
};

/** Tally marks in groups of five on the back wall: `day` marks, deterministic. */
const Tallies: React.FC<{ day: number; x: number; y: number }> = ({ day, x, y }) => {
  const marks: React.ReactNode[] = [];
  const n = Math.min(30, Math.max(0, day));
  for (let g = 0; g < Math.ceil(n / 5); g++) {
    const gx = x + (g % 6) * 34;
    const gy = y + Math.floor(g / 6) * 30;
    const inGroup = Math.min(5, n - g * 5);
    for (let i = 0; i < Math.min(4, inGroup); i++) {
      marks.push(<path key={`t${g}-${i}`} d={`M ${gx + i * 7} ${gy} L ${gx + i * 7 - 2} ${gy + 22}`} stroke="#C9BFAE" strokeWidth={3} strokeLinecap="round" />);
    }
    if (inGroup === 5) marks.push(<path key={`t${g}-x`} d={`M ${gx - 4} ${gy + 20} L ${gx + 26} ${gy + 2}`} stroke="#C9BFAE" strokeWidth={3} strokeLinecap="round" />);
  }
  return <g opacity={0.85}>{marks}</g>;
};

/** The padlocked door on the back wall (screen coords on the back wall's box). */
const Door: React.FC = () => (
  <g>
    <rect x={1060} y={380} width={230} height={360} fill="#3A3340" stroke="#1E1824" strokeWidth={6} />
    <rect x={1072} y={392} width={206} height={336} fill="#453C4C" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M 1080 ${440 + i * 110} L 1270 ${440 + i * 110}`} stroke="#332C3A" strokeWidth={3} />
    ))}
    {/* the food slot near the floor, and the handle */}
    <rect x={1100} y={660} width={150} height={26} rx={4} fill="#14101C" stroke="#1E1824" strokeWidth={4} />
    <circle cx={1252} cy={560} r={12} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} />
    {/* the padlock on the hasp */}
    <rect x={1162} y={520} width={26} height={18} fill="#5E5A6C" stroke="#1E1824" strokeWidth={3} />
    <path d="M 1166 520 L 1166 506 Q 1166 492 1175 492 Q 1184 492 1184 506 L 1184 520" fill="none" stroke="#8A8494" strokeWidth={5} />
    <rect x={1158} y={536} width={34} height={40} rx={6} fill="#C9A84A" stroke="#1E1824" strokeWidth={4} />
    <circle cx={1175} cy={554} r={6} fill="#1E1824" />
  </g>
);

/** The note pinned beside the door: "thirty days. Good luck." */
const Note: React.FC = () => (
  <g transform="rotate(-3 1010 470)">
    <rect x={985} y={440} width={52} height={66} fill="#F2EAD8" stroke="#1E1824" strokeWidth={2.5} />
    <circle cx={1011} cy={446} r={4} fill="#8A2A3A" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M 993 ${460 + i * 11} L ${1029 - (i % 2) * 8} ${460 + i * 11}`} stroke="#4A4438" strokeWidth={2.5} strokeLinecap="round" />
    ))}
  </g>
);

export const Cell: React.FC<{
  t: number; id?: string; veil?: number; door?: boolean; bed?: boolean; window?: boolean; prison?: boolean; day?: number; mattress?: boolean;
}> = ({ t, id = 'cell', veil = 0.44, door = false, bed = false, window = false, prison = false, day = 1, mattress = true }) => {
  const r = CELL;
  const { Q } = r;
  const wall = prison ? '#3E3A44' : S3.wall;
  const floorC = prison ? '#2A272E' : S3.floor;
  // the small barred window, high on the back wall: a dusk sky through the bars (poster style — the
  // purple-to-orange gradient is the channel's light now, even in a room with no sun; the warm spill
  // on the floor is the only colour the room ever gets)
  const win = { x0: 640, x1: 830, y0: 370, y1: 490 };
  return (
    <g>
      <RoomShell r={r} id={id} floor={prison ? 'tiles' : 'boards'} wall={wall} floorC={floorC} />
      {/* poster-style dusk wash on the back wall: purple high, warm low — the flat wall read
          darker and flatter than the poster; the wash is a blend over the wall, not a repaint */}
      <defs>
        <linearGradient id={`${id}wallDusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A2A55" />
          <stop offset="55%" stopColor="#4A3350" />
          <stop offset="100%" stopColor="#6A453A" />
        </linearGradient>
        <linearGradient id={`${id}winSky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A3A7A" />
          <stop offset="60%" stopColor="#C97A5A" />
          <stop offset="100%" stopColor="#E8A05A" />
        </linearGradient>
      </defs>
      <rect x={520} y={330} width={880} height={410} fill={`url(#${id}wallDusk)`} opacity={0.55} />
      {/* the bare bulb that never goes off: pendant at u 0.5, plus its glow on the floor */}
      <Pendant r={r} u={0.5} w={0.42} t={t} cone={0.45} glow={0.75} />
      {window ? (
        <g>
          <rect x={win.x0 - 10} y={win.y0 - 10} width={win.x1 - win.x0 + 20} height={win.y1 - win.y0 + 20} fill="#1E1824" />
          <rect x={win.x0} y={win.y0} width={win.x1 - win.x0} height={win.y1 - win.y0} fill={`url(#${id}winSky)`} />
          <circle cx={(win.x0 + win.x1) / 2 + 30} cy={win.y1 - 18} r={22} fill="#FFE8B0" opacity={0.9} />
          <circle cx={(win.x0 + win.x1) / 2 + 30} cy={win.y1 - 18} r={44} fill="#FFC978" opacity={0.35} style={{ mixBlendMode: 'screen' }} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={win.x0 + 40 + i * 58} y={win.y0} width={8} height={win.y1 - win.y0} fill="#1E1824" />
          ))}
          <rect x={win.x0} y={win.y0 + 56} width={win.x1 - win.x0} height={8} fill="#1E1824" />
          <rect x={win.x0 - 14} y={win.y1 + 2} width={win.x1 - win.x0 + 28} height={10} fill="#1E1824" />
          <Glow x={(win.x0 + win.x1) / 2} y={(win.y0 + win.y1) / 2} r={260} kind="warm" o={0.4} />
          <polygon points={Q([[0.14, 1, 0.02], [0.32, 1, 0.02], [0.42, 1, 0.55], [0.04, 1, 0.55]])} fill="#FFD7A0" opacity={0.12} style={{ mixBlendMode: 'screen' }} />
        </g>
      ) : null}
      {door ? (
        <g>
          <Door />
          <Note />
        </g>
      ) : null}
      {/* tally marks: the day count, scratched into the back wall left of the door.
          Nov 12 v6: moved from x=600 to x=700 — at 600 they sat at the left frame edge and were
          cut off in tighter shots (S81, S90, S93, S95, S101, S115). At 700 they stay fully in
          frame in the same framings, still left of the door. */}
      <Tallies day={Math.min(day, 12)} x={700} y={560} /> // row 1: first 12 days (was `day` — double-counted with row 2)
      <Tallies day={Math.max(0, day - 12)} x={700} y={600} />
      {/* a wall vent, a pipe run, and the light switch that does nothing.
          Nov 12 v6: vent moved from x=1330 to x=1290 — at 1330 it was cut off at the right frame
          edge in tighter shots (S90, S98, S106, S112, S116). */}
      <rect x={1290} y={420} width={56} height={40} fill="#1E1824" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M 1298 ${430 + i * 11} L 1338 ${430 + i * 11}`} stroke="#3A3340" strokeWidth={3} />
      ))}
      <path d="M 520 348 L 1400 348" stroke="#2A2331" strokeWidth={8} />
      <rect x={560} y={640} width={26} height={40} rx={4} fill="#2A2026" stroke="#1E1824" strokeWidth={3} />
      <rect x={568} y={650} width={10} height={16} fill="#C9BFAE" />
      {bed ? (
        <g>
          <FloorShadow r={r} u={[0.06, 0.42]} w={[0.1, 0.5]} />
          <Box r={r} u={[0.07, 0.4]} v={[0.85, 0.95]} w={[0.08, 0.42]} front="#5B4038" top="#7A5747" side="#3A2826" rim />
          {/* Nov 14 (Javion: bed "big as shit" / "looks like a table" — still too tall): the platform bed was waist-high (mattress top v=0.64) — table height. A bed's mattress sits at KNEE height. Lowered the whole bed hard: frame v=0.85–0.95, mattress top v=0.79 (knee height, like the floor mattress), short legs. Headboard stays REMOVED. */}
          <Box r={r} u={[0.07, 0.4]} v={[0.79, 0.85]} w={[0.08, 0.42]} front="#D8CFC0" top="#EFE3C8" side="#C8BFA8" rim />
          <polygon points={Q([[0.07, 0.805, 0.42], [0.4, 0.805, 0.42], [0.4, 0.815, 0.42], [0.07, 0.815, 0.42]])} fill="#B8A888" />
          {/* Nov 12 v20: the bed frame floated — its box bottom (v=0.8) sat above the floor (v=1)
              with no legs, so in S9/S30/S36/S38/S53/S129/S147 it read as a slab hovering in mid-air.
              Front legs (dark wood, at the bed's front corners) ground it to the floor. */}
          <Box r={r} u={[0.07, 0.10]} v={[0.95, 1.0]} w={[0.38, 0.42]} front="#3A2826" />
          <Box r={r} u={[0.37, 0.40]} v={[0.95, 1.0]} w={[0.38, 0.42]} front="#3A2826" />
          <polygon points={Q([[0.07, 0.79, 0.42], [0.4, 0.79, 0.42], [0.4, 0.79, 0.08], [0.07, 0.79, 0.08]])} fill="#E6DCC8" />
          {/* blanket on the mattress top (foot half) so the bed top is not bare beige — the blanket + pillow + headboard together read as a bed, not a table. */}
          <polygon points={Q([[0.20, 0.79, 0.08], [0.40, 0.79, 0.08], [0.40, 0.79, 0.42], [0.20, 0.79, 0.42]])} fill="#5A4A6A" />
          <polygon points={Q([[0.20, 0.79, 0.42], [0.40, 0.79, 0.42], [0.40, 0.81, 0.42], [0.20, 0.81, 0.42]])} fill="#4A3A5A" opacity={0.9} />
          {/* v38 (Javion: "the bed is messed up... it doesnt look like a bed"): the platform bed read as a bare table — its "pillow" was a flat #F2EAD8 polygon painted on the top surface, same colour family as the sheet, no outline, no puff, invisible at a glance. Now it has a real puffy 2D pillow like the floor mattress: a soft silhouette with outline + seam + dome, rising above the top (v=0.54–0.62) at the left end. Affects S30/S36/S38/S53/S129/S147 (all platform-bed shots). */}
          {(() => {
            const P = r.P;
            // Nov 14 (Javion: "why is the pillow like that?") — the pillow read as a flat deflated slab: top edge dead flat at v=0.67, height only 0.12 vs width 0.21. A pillow needs a DOME — top edge bulges up in the middle. New top: corners v=0.70, peak v=0.58 at center, height 0.21 at the peak.
            const outline: SPt[] = [
              P(0.07, 0.70, 0.1),
              P(0.175, 0.58, 0.1),
              P(0.28, 0.70, 0.1),
              P(0.28, 0.70, 0.16),
              P(0.28, 0.73, 0.2),
              P(0.28, 0.79, 0.2),
              P(0.07, 0.79, 0.2),
              P(0.07, 0.70, 0.2),
            ];
            const shadow: SPt[] = [P(0.06, 0.79, 0.09), P(0.29, 0.79, 0.09), P(0.29, 0.79, 0.21), P(0.06, 0.79, 0.21)];
            const cx = outline.reduce((s, p) => s + p.x, 0) / outline.length;
            const cy = outline.reduce((s, p) => s + p.y, 0) / outline.length;
            const seam: SPt[] = outline.map((p) => ({ x: cx + (p.x - cx) * 0.88, y: cy + (p.y - cy) * 0.88 }));
            const dome: SPt[] = outline.map((p) => ({ x: cx + (p.x - cx) * 0.5, y: cy + (p.y - cy) * 0.5 }));
            return (
              <g>
                <path d={roundedQuad(shadow, 10)} fill="#000000" opacity={0.2} />
                <path d={fluffyOutline(outline, 7)} fill="#C8D8E8" stroke="#1E1824" strokeWidth={2.5} />
                <path d={fluffyOutline(seam, 6)} fill="none" stroke="#A8B8CC" strokeWidth={1.5} />
                <path d={fluffyOutline(dome, 8)} fill="#E8F0F8" opacity={0.85} />
              </g>
            );
          })()}
          <polygon points={Q([[0.16, 0.79, 0.42], [0.4, 0.79, 0.42], [0.4, 0.95, 0.42], [0.16, 0.95, 0.42]])} fill="#5A4A6A" />
        </g>
      ) : mattress ? (
        <g>
          {/* the floor mattress + pillow + blanket: the room's only furniture.
              Nov 12 v7: `mattress={false}` hides it — S39 has its own centre bed Prop, and the
              floor mattress next to it read as a SECOND bed to a viewer.
              Nov 12 v21–v23: height tweaks only (v=0.96→0.90→0.75→0.84). They never
              fixed the real problem. The old code hand-drew the vertical face on the
              FAR end (w=0.25, against the wall) and exposed the UNDERSIDE (v=1) as a
              big visible surface — so the mattress read as a flat shape hovering over
              the floor instead of a solid object sitting on it (Javion: "that shit is
              literally floating"). v24: the mattress is a proper 3D Box — Box draws
              only the faces the camera can see (front at w=0.55, the near end; top at
              v=0.84; the right side at u=0.38), so it sits on the floor like a real
              mattress. Top at v=0.84 (front face 0.16 tall, shin height). Pillow +
              blanket ride on the top; piping seam on the front face. v25 (Javion:
              "draw the sheets better and the pillows, it just look like flat lines
              on a 3d box"): the blanket and pillow were flat polygons painted on
              the mattress top — no volume, no drape. Now the pillow is its own 3D
              Box rising above the mattress top (v=0.79–0.84, a puffy shape, not a
              flat patch), and the blanket drapes over the front edge and hangs
              halfway down the front face, with fold lines, so it reads as fabric,
              not a sticker. v26 (Javion: "fix the fuckin pillows make it actually look
              like pillows shit is a white box" + "the bed is a lil small make it bigger"):
              the pillow was a Box — sharp corners, so it read as a white box, not a
              pillow. Now it's drawn as ROUNDED quads (roundedQuad helper): rounded
              corners + a taller puff (v=0.77–0.84) read as a soft pillow. And the bed
              is bigger: u=0.06–0.40, w=0.22–0.58 (was 0.08–0.38 / 0.25–0.55). v27
              (Javion: "its literally still not a pillow its a transparent box"): the
              rounded pillow had no outline, so it blended into the light mattress top
              and read as a faint ghost. Now every face has a dark outline plus a
              contact shadow under it, and the puff is taller (v=0.76–0.84). */}
          <FloorShadow r={r} u={[0.06, 0.4]} w={[0.22, 0.58]} />
          <Box r={r} u={[0.06, 0.4]} v={[0.84, 1]} w={[0.22, 0.58]} front="#8A7666" top="#D8CFC0" side="#7A6655" />
          {/* mattress piping: a thin darker seam just under the top edge of the FRONT
              face (w=0.58, the near end the camera sees). */}
          <polygon points={Q([[0.06, 0.865, 0.58], [0.4, 0.865, 0.58], [0.4, 0.878, 0.58], [0.06, 0.878, 0.58]])} fill="#6A5A4A" />
          {/* the pillow: a REGULAR pillow — the kind a human lays their head on.
              v33 (Javion: "make the pillow 2d please"): he is right. The 3D faces
              (top + front + side) are what keep making it read as a box — it IS a
              box, with faces. The channel is flat-vector 2D, and the pillow should
              be too. So the faces are GONE. The pillow is now ONE flat 2D shape —
              a single soft silhouette, wide and low, with bulging edges, a seam
              line, and a soft highlight in the centre for the plump dome. No faces,
              no box. Same small size (u=0.07-0.20, clear of the blanket), warm
              opaque cream, dark outline, contact shadow.
              v34 (full-board review, Nov 12): the right end of the pillow came to
              a SHARP POINT in every still — the hexagon corner at the near end
              (u=0.20, v=0.76, w=0.46) pokes out like a horn / leaf tip, because
              the two bulging fluffyOutline edges meet there at an acute angle.
              The corner is CHAMFERED now: the outline stops short of the near
              corner along the top edge (w=0.40) and starts the right edge lower
              down (v=0.79), so the right end is a short diagonal, not a point.
              Seam and dome are scaled from the outline, so they follow. */}
          {(() => {
            const P = r.P;
            const outline: SPt[] = [
              P(0.07, 0.76, 0.3),
              P(0.2, 0.76, 0.3),
              P(0.2, 0.76, 0.4),
              P(0.2, 0.79, 0.46),
              P(0.2, 0.84, 0.46),
              P(0.07, 0.84, 0.46),
              P(0.07, 0.76, 0.46),
            ];
            const shadow: SPt[] = [P(0.06, 0.84, 0.29), P(0.21, 0.84, 0.29), P(0.21, 0.84, 0.47), P(0.06, 0.84, 0.47)];
            const cx = outline.reduce((s, p) => s + p.x, 0) / outline.length;
            const cy = outline.reduce((s, p) => s + p.y, 0) / outline.length;
            const seam: SPt[] = outline.map((p) => ({ x: cx + (p.x - cx) * 0.88, y: cy + (p.y - cy) * 0.88 }));
            const dome: SPt[] = outline.map((p) => ({ x: cx + (p.x - cx) * 0.5, y: cy + (p.y - cy) * 0.5 }));
            return (
              <g>
                <path d={roundedQuad(shadow, 10)} fill="#000000" opacity={0.2} />
                <path d={fluffyOutline(outline, 7)} fill="#EFE3C8" stroke="#1E1824" strokeWidth={2.5} />
                <path d={fluffyOutline(seam, 6)} fill="none" stroke="#D8C9A8" strokeWidth={1.5} />
                <path d={fluffyOutline(dome, 8)} fill="#F5EFE0" opacity={0.85} />
              </g>
            );
          })()}
          {/* the blanket: flat on the mattress top, then draping over the front edge
              and hanging halfway down the front face, with fold lines so it reads as
              fabric. The drape is a touch darker (vertical face, in shadow). */}
          <polygon points={Q([[0.2, 0.84, 0.22], [0.4, 0.84, 0.22], [0.4, 0.84, 0.58], [0.2, 0.84, 0.58]])} fill="#4A3A5A" opacity={0.9} />
          <polygon points={Q([[0.2, 0.84, 0.58], [0.4, 0.84, 0.58], [0.4, 0.93, 0.58], [0.2, 0.93, 0.58]])} fill="#3E3050" opacity={0.95} />
          <polygon points={Q([[0.26, 0.84, 0.58], [0.27, 0.84, 0.58], [0.27, 0.93, 0.58], [0.26, 0.93, 0.58]])} fill="#2E2438" opacity={0.7} />
          <polygon points={Q([[0.33, 0.84, 0.58], [0.34, 0.84, 0.58], [0.34, 0.93, 0.58], [0.33, 0.93, 0.58]])} fill="#2E2438" opacity={0.7} />
        </g>
      ) : null}
      {/* the food tray by the door, a cup, and the bucket in the corner.
          Nov 12 v14 (Javion: "look at the door it's glitched"): the tray was at cx=1150,
          centred under the doorway (door spans x=1060..1290) with only 8px under the door's
          bottom edge — it read as wedged under the door. Moved to cx=950, on the open floor
          left of the doorway, clear of the door and of the mattress (ends x≈830). */}
      <g>
        <ellipse cx={950} cy={772} rx={70} ry={12} fill="#000" opacity={0.35} />
        <polygon points="888,748 1012,748 1000,772 900,772" fill="#8A7A5A" />
        <ellipse cx={950} cy={748} rx={62} ry={10} fill="#A89878" />
        <circle cx={920} cy={746} r={14} fill="#C9BFAE" />
        <circle cx={980} cy={746} r={11} fill="#7A4A4A" />
        <ellipse cx={1450} cy={800} rx={46} ry={10} fill="#000" opacity={0.35} />
        <polygon points="1412,742 1488,742 1480,800 1420,800" fill="#3A3340" />
        <ellipse cx={1450} cy={742} rx={38} ry={8} fill="#2A2530" />
      </g>
      {/* a crack in the back wall, a framed picture that was never hung straight.
          Nov 12 v7: the crack was at x≈900, right next to the pendant lamp — in frame it read as
          a bent lamp cord / a crack running from the lamp. Moved to x≈660, clear of the lamp,
          clear of the tallies (x=700, y=560+), clear of the light switch (x=560, y=640).
          Nov 12 v14 (Javion: "look at the door it's glitched"): the picture was at x=1260,
          half-hidden behind the door (door spans x=1060..1290) — the door cut through it.
          First moved to x=880, but that put it under the centred wall items other shots hang
          at x≈960 (wall_clock, whisper_walls, brick_wall) — 4 new displacement flags (S18,
          S32, S77, S90). Now at x=560, on the free left span: clear of the door, the centred
          items, the tallies (x=700+) and the note (x=985+), above the light switch (y=640+). */}
      <path d="M 660 360 L 672 420 L 658 480 L 668 540" stroke="#2A2331" strokeWidth={3} fill="none" opacity={0.8} />
      <g transform="rotate(-4 592 560)">
        <WallFrame x={560} y={520} w={64} h={80} art={1} />
      </g>
      {/* dust in the bulb's beam, drifting; the veil sinks the mid-tones with holes at the bulb and window */}
      <Dust t={t} seed={7} x0={860} y0={380} w={220} h={420} n={36} o={0.6} />
      <LightVeil id={`${id}veil`} lights={[pendantLight(r, 0.5, 0.42), ...(window ? [[735, 430, 300] as [number, number, number]] : [])]} o={veil} />
      <Glow x={960} y={430} r={300} o={0.45} />
      <Glow x={960} y={800} r={480} o={0.4} />
      <WallTexture rect={[520, 330, 880, 410]} />
    </g>
  );
};

/** Where a character stands in the cell: hip point + scale at floor point (u, w). */
export const cellStand = (u: number, w: number) => stand(CELL, u, w);
