import React from 'react';
import { clamp, easeOut, backOut } from '../anim';
import { FONT } from '../fonts';

// The schematic: the genre's diagram shot for the science beat ("That's real."). A dark blueprint with a fine grid,
// cream line drawings that draw on, labels in the mono face, a number that counts, icons that light up in orange.
// Keep it to one idea per shot, readable in the time it's up.

export const SCH = { ground: '#101A2A', grid: '#1C2C44', line: '#F6EFE3', dim: '#7E8DA6', live: '#FF8A3D', glow: '#FFB15A' };

export const Schematic: React.FC<{ t: number; id?: string }> = ({ t, id = 'sch' }) => (
  <g>
    <defs>
      <pattern id={`${id}grid`} width={40} height={40} patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={SCH.grid} strokeWidth={1.5} />
      </pattern>
      <pattern id={`${id}grid5`} width={200} height={200} patternUnits="userSpaceOnUse">
        <path d="M 200 0 L 0 0 0 200" fill="none" stroke={SCH.grid} strokeWidth={3} />
      </pattern>
      <radialGradient id={`${id}glow`}>
        <stop offset="0%" stopColor="#2A4466" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#2A4466" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={2720} height={1880} fill={SCH.ground} />
    <circle cx={960} cy={520} r={900} fill={`url(#${id}glow)`} />
    <g transform={`translate(${(t * 0.4) % 40} 0)`}>
      <rect x={-440} y={-400} width={2800} height={1880} fill={`url(#${id}grid)`} />
      <rect x={-440} y={-400} width={2800} height={1880} fill={`url(#${id}grid5)`} />
    </g>
    {/* corner registration marks, like a drawing sheet */}
    {[
      [80, 80, 1, 1],
      [1840, 80, -1, 1],
      [80, 1000, 1, -1],
      [1840, 1000, -1, -1],
    ].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M ${x} ${y + sy * 40} L ${x} ${y} L ${x + sx * 40} ${y}`} stroke={SCH.dim} strokeWidth={3} fill="none" />
    ))}
  </g>
);

/** A path that draws on from t = 0 over `dur` frames. */
export const DrawOn: React.FC<{ d: string; t: number; dur?: number; color?: string; width?: number; fill?: string }> = ({ d, t, dur = 10, color = SCH.line, width = 5, fill = 'none' }) => {
  const p = easeOut(clamp(t / dur));
  if (p <= 0) return null;
  return <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={color} strokeWidth={width} fill={p >= 1 ? fill : 'none'} strokeLinecap="round" strokeLinejoin="round" />;
};

/** An arrow from (x0, y0) to (x1, y1), drawing on from t = 0, with a slight arc. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; t: number; dur?: number; color?: string; bend?: number }> = ({ x0, y0, x1, y1, t, dur = 8, color = SCH.line, bend = 0.12 }) => {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend;
  const my = (y0 + y1) / 2 + (x1 - x0) * bend;
  const p = easeOut(clamp(t / dur));
  const a = Math.atan2(y1 - my, x1 - mx);
  return (
    <g>
      <DrawOn d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} t={t} dur={dur} color={color} width={5} />
      {p >= 1 ? <path d={`M ${x1 - 22 * Math.cos(a - 0.45)} ${y1 - 22 * Math.sin(a - 0.45)} L ${x1} ${y1} L ${x1 - 22 * Math.cos(a + 0.45)} ${y1 - 22 * Math.sin(a + 0.45)}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

/** A label in the mono face that pops on from t = 0. */
export const SchLabel: React.FC<{ x: number; y: number; t: number; text: string; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, t, text, size = 36, color = SCH.line, anchor = 'middle' }) => {
  if (t < 0) return null;
  const s = backOut(clamp(t / 6));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <text textAnchor={anchor} fontFamily={FONT.ui} fontSize={size} fill={color} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

/** A number counting from 0 to `to` between t = 0 and dur, formatted with commas (or by `format`). */
export const CountUp: React.FC<{ x: number; y: number; t: number; to: number; dur?: number; size?: number; color?: string; suffix?: string; format?: (v: number) => string }> = ({
  x, y, t, to, dur = 30, size = 64, color = SCH.live, suffix = '', format,
}) => {
  if (t < 0) return null;
  const v = to * easeOut(clamp(t / dur));
  const txt = format ? format(v) : Math.round(v).toLocaleString('en-US');
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontSize={size} fill={color} style={{ filter: `drop-shadow(0 0 14px ${SCH.glow}66)` }}>
      {txt + suffix}
    </text>
  );
};

/** A bar chart that FILLS UP: horizontal bars grow from 0 to their value over `dur` frames.
    v8 (Nov 9, Javion: "with the percentage part add graphs/bars filling up and other
    explanations too it while adding the detective too it"): the percentage shots were
    numbers-only on empty blue. Each bar has a label above it, a faint track showing the
    full 100% width, a fill that grows to value% of maxW, and the % number riding the
    end of the fill as it counts up. Bars are comparable at a glance — the longer bar wins. */
export const BarChart: React.FC<{
  x: number; y: number; t: number;
  bars: { label: string; value: number; color?: string }[];
  maxW?: number; barH?: number; gap?: number; dur?: number; labelSize?: number; valueSize?: number;
}> = ({ x, y, t, bars, maxW = 900, barH = 64, gap = 120, dur = 40, labelSize = 40, valueSize = 56 }) => {
  if (t < 0) return null;
  const p = easeOut(clamp(t / dur));
  return (
    <g>
      {bars.map((b, i) => {
        const by = y + i * gap;
        const w = (b.value / 100) * maxW * p;
        const v = Math.round(b.value * p);
        const col = b.color || SCH.live;
        return (
          <g key={i}>
            <text x={x} y={by - 16} fontFamily={FONT.ui} fontSize={labelSize} fill={SCH.line} letterSpacing={2}>
              {b.label}
            </text>
            <rect x={x} y={by} width={maxW} height={barH} rx={8} fill="none" stroke={SCH.dim} strokeWidth={2} opacity={0.5} />
            {w > 2 ? <rect x={x} y={by} width={w} height={barH} rx={8} fill={col} /> : null}
            <text x={x + Math.max(w, 0) + 20} y={by + barH * 0.72} fontFamily={FONT.ui} fontSize={valueSize} fill={col} style={{ filter: `drop-shadow(0 0 12px ${SCH.glow}66)` }}>
              {v}%
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** A pie chart that FILLS UP: slices sweep out from the top over `dur` frames.
    v8 (Nov 9, Javion: "put both percentages on that chart a pie chart is used to compare
    2 or more percentages"): when a shot compares 2+ percentages, BOTH go on the SAME pie
    as slices — the whole circle is 100%, so the gap between the slices IS the story. The
    unfilled remainder shows as the faint track. Each slice grows 0 to its value over the
    shot; the % rides inside slices big enough to hold it (>=20%), smaller slices get their
    % stacked under their outside label. Bars are NOT for comparing percentages. */
export const PieChart: React.FC<{
  x: number; y: number; t: number;
  slices: { label: string; value: number; color?: string }[];
  r?: number; dur?: number; labelSize?: number; valueSize?: number;
}> = ({ x, y, t, slices, r = 150, dur = 40, labelSize = 34, valueSize = 52 }) => {
  if (t < 0) return null;
  const p = easeOut(clamp(t / dur));
  // Slices start at the top (-90deg) and sweep clockwise, staying adjacent as they grow.
  let acc = -90;
  const items = slices.map((s) => {
    const sweep = (s.value / 100) * 360 * p;
    const item = { ...s, start: acc, sweep, mid: acc + sweep / 2 };
    acc += sweep;
    return item;
  });
  const polar = (deg: number, rad: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [x + rad * Math.cos(a), y + rad * Math.sin(a)];
  };
  return (
    <g>
      {/* faint track: the whole 100% circle, so the unfilled remainder reads as empty */}
      <circle cx={x} cy={y} r={r} fill="none" stroke={SCH.dim} strokeWidth={2} opacity={0.5} />
      {items.map((s, i) => {
        if (s.sweep < 0.5) return null;
        const col = s.color || SCH.live;
        const [x0, y0] = polar(s.start, r);
        const [x1, y1] = polar(s.start + s.sweep, r);
        const largeArc = s.sweep > 180 ? 1 : 0;
        const d = s.sweep >= 359.5
          ? undefined
          : `M ${x} ${y} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
        // Outside label sits at the slice's mid-angle, just past the rim.
        const [lx, ly] = polar(s.mid, r + 55);
        // % rides inside big slices; small slices carry it under their outside label.
        // (Nov 9 board fix: the % at r*0.62 sat so close to the rim that it touched
        // the outside label — "48%GUESSED" collided in S84. r*0.55 clears the label
        // without pushing the text across a diagonal slice's edge, which r*0.45 did
        // in S172's 23% slice.)
        const [vx, vy] = polar(s.mid, r * 0.55);
        const v = Math.round(s.value * p);
        return (
          <g key={i}>
            {d ? <path d={d} fill={col} /> : <circle cx={x} cy={y} r={r} fill={col} />}
            {s.value >= 20 ? (
              <text x={vx} y={vy} fontFamily={FONT.ui} fontSize={valueSize} fill="#F6EFE3" textAnchor="middle" dominantBaseline="middle">
                {v}%
              </text>
            ) : null}
            {/* Outside label: dark halo so it reads even where it overlaps its own slice
                (Nov 9: "GUESSED" in slice-grey on the grey slice was invisible — the G
                vanished). Small slices carry label + % on ONE line, never stacked below —
                the stacked % collided with the explanation text under the pie. Big slices
                (value >= 20) anchor the label at its START, not its centre: centred, the
                label's left edge reached back to the rim and touched the inside % —
                "48%GUESSED" in S84 even with the % pulled to r*0.55. */}
            <text x={lx} y={ly} fontFamily={FONT.ui} fontSize={labelSize} fill={col} textAnchor={s.value >= 20 ? 'start' : 'middle'} dominantBaseline="middle" letterSpacing={2} stroke="#0B1220" strokeWidth={5} paintOrder="stroke">
              {s.value < 20 ? `${s.label} ${v}%` : s.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** A line icon of a kind of power plant, lit (orange, glowing) when `on` > 0. Centred on x, y, about 120 tall. */
export const PlantIcon: React.FC<{ x: number; y: number; kind: 'tower' | 'wind' | 'solar' | 'dam' | 'factory'; on: number; t: number; s?: number }> = ({ x, y, kind, on, t, s = 1 }) => {
  const c = on > 0 ? SCH.live : SCH.dim;
  const w = 5;
  const body: Record<string, React.ReactNode> = {
    tower: (
      <g>
        <path d="M -44 50 Q -26 0 -36 -50 L 36 -50 Q 26 0 44 50 Z" />
        <path d="M 50 50 L 50 -20 L 70 -20 L 70 50" />
        {on > 0 ? <path d={`M -20 -62 q ${-10 + Math.sin(t / 5) * 6} -20 0 -36 q 14 -14 4 -30`} strokeOpacity={0.7} /> : null}
      </g>
    ),
    wind: (
      <g>
        <path d="M 0 -20 L -6 50 L 6 50 Z" />
        <g transform={`translate(0 -20) rotate(${on > 0 ? t * 12 : 20})`}>
          <path d="M 0 0 L 0 -56 M 0 0 L 48 28 M 0 0 L -48 28" />
        </g>
      </g>
    ),
    solar: (
      <g>
        <path d="M -60 20 L -36 -30 L 60 -30 L 36 20 Z" />
        <path d="M -48 -5 L 48 -5 M -12 -30 L -24 20 M 24 -30 L 12 20" />
        <path d="M 0 20 L 0 50" />
      </g>
    ),
    dam: (
      <g>
        <path d="M -60 -40 L -40 50 L 40 50 L 60 -40 Z" />
        <path d="M -20 10 Q -10 30 -20 50 M 10 10 Q 20 30 10 50" />
      </g>
    ),
    factory: (
      <g>
        <path d="M -60 50 L -60 0 L -30 -20 L -30 0 L 0 -20 L 0 0 L 30 -20 L 30 50 Z" />
        <path d="M 40 50 L 40 -50 L 58 -50 L 58 50" />
      </g>
    ),
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.12 * Math.sin(clamp(on) * Math.PI))})`} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" style={on > 0 ? { filter: `drop-shadow(0 0 10px ${SCH.glow})` } : undefined}>
      {body[kind]}
    </g>
  );
};
