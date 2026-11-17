// sets.tsx — the phone video's sets, ported 1:1 from scenes_phone.py
// (bedroom_set, bedroom_night, day_room, dusk_sky, sunset_sky, night_street,
// string_lights, closeup_bg, draw_bed_blanket). Same coordinates, same colors.
import React, { useId } from 'react';
import {
  W, H, INK, LW, AddLight, Blur, Circ, Cloud, FarCity, Block, Label, Line,
  Moon, Night, Oval, Poly, RRect, Shape, Sky, Stars,
} from './kit-phone';

// ---------------------------------------------------------------------------
// Duvet (the cover) — full bed width, rises over his chest, runs across at
// the mattress top so NO bare mattress shows, drapes down the bed front.
// Drawn once in the set (behind him) and once over him (draw_bed_blanket).
// ---------------------------------------------------------------------------

export const Duvet: React.FC = () => (
  <g>
    <Shape
      d="M 120 660 L 300 618 L 470 700 L 900 700 L 900 830 C 700 862 600 812 500 842 C 350 868 250 818 120 842 Z"
      fill="#A83A42" w={LW * 0.8}
    />
    <Line x0={300} y0={640} x1={470} y1={700} w={5} v="#C05058" />
    <Line x0={380} y0={660} x1={410} y1={730} w={3} v="#8A2F35" />
    <Line x0={600} y0={700} x1={610} y1={825} w={3} v="#8A2F35" />
    <Line x0={760} y0={700} x1={765} y1={825} w={3} v="#8A2F35" />
  </g>
);

// ---------------------------------------------------------------------------
// Bedroom (night) — dark teal striped wall, wainscot, window + moon + city,
// clock at 3:12, bed left (light-oak headboard, VERTICAL pillow, full-width
// duvet, dark frame + legs + floor), nightstand + lamp OFF, red rug.
// ---------------------------------------------------------------------------

const WINDOW = { x0: 1180, y0: 96, x1: 1780, y1: 620 };

const WindowFrame: React.FC = () => {
  const { x0, y0, x1, y1 } = WINDOW;
  return (
    <g>
      <RRect x0={x0 - 22} y0={y0 - 22} x1={x1 + 22} y1={y0} fill="#3B2416" w={LW * 0.8} />
      <RRect x0={x0 - 22} y0={y1} x1={x1 + 22} y1={y1 + 22} fill="#3B2416" w={LW * 0.8} />
      <RRect x0={x0 - 22} y0={y0} x1={x0} y1={y1} fill="#3B2416" w={LW * 0.8} />
      <RRect x0={x1} y0={y0} x1={x1 + 22} y1={y1} fill="#3B2416" w={LW * 0.8} />
      <Line x0={(x0 + x1) / 2} y0={y0} x1={(x0 + x1) / 2} y1={y1} w={14} v={INK} />
    </g>
  );
};

export const BedroomSet: React.FC<{ t: number }> = ({ t }) => {
  const winClip = useId();
  return (
    <g>
      {/* striped wall */}
      <rect x={-900} y={-600} width={W + 1800} height={1420} fill="#2F5449" />
      {Array.from({ length: 62 }, (_, k) => {
        const i = k - 14;
        return <line key={k} x1={i * 62} y1={-600} x2={i * 62} y2={650} stroke="#2A4C42" strokeWidth={10} />;
      })}
      {/* wainscot */}
      <rect x={-900} y={650} width={W + 1800} height={170} fill="#4E3020" />
      {Array.from({ length: 21 }, (_, k) => {
        const i = k - 5;
        return <rect key={k} x={i * 190 + 24} y={676} width={146} height={120} fill="#462A1B" stroke={INK} strokeWidth={LW * 0.6} />;
      })}
      <Line x0={-900} y0={650} x1={W + 900} y1={650} />
      {/* floor */}
      <rect x={-900} y={820} width={W + 1800} height={H + 600 - 820} fill="#6A4429" />
      <Line x0={-900} y0={820} x1={W + 900} y1={820} />
      {/* window with night city */}
      <defs>
        <clipPath id={winClip}>
          <rect x={WINDOW.x0} y={WINDOW.y0} width={WINDOW.x1 - WINDOW.x0} height={WINDOW.y1 - WINDOW.y0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${winClip})`}>
        <Sky top="#0B1238" bot="#2A3A96" h={620} />
        <Stars t={t} />
        <Moon x={1300} y={180} r={30} />
        <Blur sigma={1.6}>
          <g transform="translate(1120 300) scale(0.5)">
            <FarCity base={700} seed={5} />
          </g>
        </Blur>
      </g>
      <WindowFrame />
      {/* curtains */}
      <Line x0={1120} y0={60} x1={1840} y1={60} w={12} />
      <Poly pts={[[1140, 60], [1220, 60], [1228, 660], [1130, 660]]} fill="#93222B" />
      <Poly pts={[[1700, 60], [1780, 60], [1788, 660], [1690, 660]]} fill="#93222B" />
      {/* wall clock at 3:12 */}
      <Circ x={300} y={250} r={62} fill="#F4EFE2" />
      <Line x0={300} y0={250} x1={336} y1={250} w={LW * 0.8} />
      <Line x0={300} y0={250} x1={312} y1={202} w={LW * 0.8} />
      <circle cx={300} cy={250} r={5} fill={INK} />
      {/* rug */}
      <Oval x0={420} y0={920} x1={1300} y1={1070} fill="#7E2A30" w={LW * 0.8} />
      <ellipse cx={860} cy={995} rx={390} ry={59} fill="none" stroke="#C39A45" strokeWidth={6} />
      {/* bed: headboard, frame + legs, mattress, duvet, pillow */}
      <RRect x0={96} y0={400} x1={172} y1={760} fill="#C8A06A" r={24} />
      <Line x0={134} y0={450} x1={134} y1={720} w={4} v="#A67C52" />
      <RRect x0={120} y0={760} x1={900} y1={950} fill="#3A2415" />
      <Line x0={120} y0={860} x1={900} y1={860} w={4} v="#2A1A0E" />
      <RRect x0={150} y0={950} x1={180} y1={1020} fill="#2A1A0E" />
      <RRect x0={850} y0={950} x1={880} y1={1020} fill="#2A1A0E" />
      <RRect x0={140} y0={700} x1={880} y1={764} fill="#F4EFE2" r={16} />
      <Duvet />
      {/* pillow: UPRIGHT, standing behind him like a backrest (v25) */}
      <g transform="translate(270 590) rotate(-5)">
        <rect x={-115} y={-150} width={230} height={300} rx={58} fill="#FFF6DC" stroke={INK} strokeWidth={LW * 0.6} />
        <path d="M -80 -130 A 60 30 0 0 1 40 -130" fill="none" stroke="#E8DCC2" strokeWidth={4} />
        <Line x0={-75} y0={0} x1={75} y1={0} w={2} v="#D8CFC0" />
      </g>
      {/* nightstand + lamp OFF (the phone screen is the only light) */}
      <RRect x0={940} y0={800} x1={1120} y1={1062} fill="#7C4E2C" />
      <Oval x0={1040} y0={780} x1={1080} y1={796} fill="#D0A548" w={LW * 0.8} />
      <Line x0={1060} y0={786} x1={1060} y1={690} w={12} />
      <Shape d="M 1000 692 C 1012 640 1108 640 1120 692 Z" fill="#2E5A3A" />
      <Oval x0={1004} y0={686} x1={1116} y1={700} fill="#3A4A3A" w={LW * 0.7} />
    </g>
  );
};

/** Night lighting over the bedroom: dark room, pools around the phone + window. */
export const BedroomNight: React.FC = () => (
  <Night
    ambient="#4C5CA0"
    lights={[
      { kind: 'pool', x: 1060, y: 700, r: 420, a: 0.95 },
      { kind: 'pool', x: 500, y: 500, r: 380, a: 0.85 },
      { kind: 'oval', x: 500, y: 1000, rx: 380, ry: 110, a: 0.7 },
      { kind: 'path', d: 'M 1180 96 H 1780 V 620 H 1180 Z', a: 0.82, blur: 10 },
      { kind: 'path', d: 'M 1200 700 L 1760 700 L 1900 1090 L 1100 1090 Z', a: 0.36, blur: 34 },
    ]}
  />
);

// ---------------------------------------------------------------------------
// Day room — bright interior: cream wall, blue-sky window, plant, rug.
// ---------------------------------------------------------------------------

export const DayRoom: React.FC<{ t: number }> = ({ t }) => {
  const winClip = useId();
  return (
    <g>
      <rect x={-900} y={-600} width={W + 1800} height={1420} fill="#E8DCC8" />
      {Array.from({ length: 62 }, (_, k) => {
        const i = k - 14;
        return <line key={k} x1={i * 62} y1={-600} x2={i * 62} y2={650} stroke="#DECFB4" strokeWidth={8} />;
      })}
      <rect x={-900} y={650} width={W + 1800} height={170} fill="#8A6A4A" />
      <Line x0={-900} y0={650} x1={W + 900} y1={650} />
      <rect x={-900} y={820} width={W + 1800} height={H + 600 - 820} fill="#6A4A2E" />
      <Line x0={-900} y0={820} x1={W + 900} y1={820} />
      <defs>
        <clipPath id={winClip}>
          <rect x={WINDOW.x0} y={WINDOW.y0} width={WINDOW.x1 - WINDOW.x0} height={WINDOW.y1 - WINDOW.y0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${winClip})`}>
        <Sky top="#7AB8E8" bot="#CFE8F8" h={620} />
        <circle cx={1560} cy={220} r={90} fill="#FFE9A0" />
        <Cloud x={1300} y={220} s={1.0} v="#FFFFFF" />
        <Cloud x={1560} y={420} s={0.8} v="#FFFFFF" />
      </g>
      <WindowFrame />
      {/* plant */}
      <RRect x0={260} y0={700} x1={340} y1={800} fill="#B85A3A" w={LW * 0.8} />
      <circle cx={300} cy={640} r={70} fill="#4E8A4E" />
      <circle cx={250} cy={680} r={50} fill="#4E8A4E" />
      <circle cx={350} cy={680} r={50} fill="#4E8A4E" />
      <circle cx={300} cy={590} r={55} fill="#4E8A4E" />
      {/* rug */}
      <Oval x0={420} y0={920} x1={1300} y1={1070} fill="#C8A878" w={LW * 0.8} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Skies
// ---------------------------------------------------------------------------

const SkyStops: React.FC<{ stops: [string, number][] }> = ({ stops }) => {
  const id = useId();
  return (
    <rect x={-2000} y={-1500} width={W + 4000} height={H + 3000} fill={`url(#${id})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2={1080} gradientUnits="userSpaceOnUse">
          {stops.map(([c, o]) => (
            <stop key={o} offset={`${o * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
    </rect>
  );
};

/** Purple-to-gold dusk: purple top, pink band, gold horizon, big low sun. */
export const DuskSky: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <SkyStops stops={[['#241A4E', 0], ['#6E3A7A', 0.45], ['#D86A6A', 0.75], ['#F2B45C', 1]]} />
    <circle cx={1420} cy={560} r={300} fill="#FFD98A" opacity={36 / 255} />
    <circle cx={1420} cy={560} r={220} fill="#FFD98A" opacity={55 / 255} />
    <circle cx={1420} cy={560} r={160} fill="#FFE9A0" />
    <Stars t={t} n={50} yScale={0.45} />
  </g>
);

/** Sunset sky for the rooftop: purple → pink → gold, low sun, skyline. */
export const SunsetSky: React.FC<{ t: number; seed?: number }> = ({ t, seed = 9 }) => {
  const r = React.useMemo(() => {
    const rand = (seed: number) => {
      let a = seed >>> 0;
      return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let x = Math.imul(a ^ (a >>> 15), 1 | a);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    };
    const rr = rand(seed);
    const out: { x: number; w: number; h: number; wins: [number, number][] }[] = [];
    let x = -100;
    while (x < W + 100) {
      const w = 120 + rr() * 140;
      const h = 180 + rr() * 240;
      const wins: [number, number][] = [];
      for (let j = 0; j < Math.floor(h / 60); j++) {
        for (let i = 0; i < Math.floor(w / 50); i++) {
          if (rr() < 0.35) wins.push([x + 14 + i * 50, 760 - h + 20 + j * 60]);
        }
      }
      out.push({ x, w, h, wins });
      x += w + 4 + rr() * 16;
    }
    return out;
  }, [seed]);
  return (
    <g>
      <SkyStops stops={[['#2A1B4E', 0], ['#7A3A6E', 0.45], ['#E87A4A', 0.75], ['#F2B45C', 1]]} />
      <circle cx={1420} cy={480} r={260} fill="#FFD98A" opacity={40 / 255} />
      <circle cx={1420} cy={480} r={190} fill="#FFD98A" opacity={60 / 255} />
      <circle cx={1420} cy={480} r={150} fill="#FFE9A0" />
      <Stars t={t} n={40} yScale={0.5} />
      {r.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={760 - b.h} width={b.w} height={b.h + 60} fill="#241A3E" />
          {b.wins.map(([wx, wy], j) => (
            <rect key={j} x={wx} y={wy} width={14} height={24} fill="#F2C14E" opacity={220 / 255} />
          ))}
        </g>
      ))}
      <rect x={-900} y={820} width={W + 1800} height={H + 600 - 820} fill="#1A1230" />
      <Line x0={-900} y0={820} x1={W + 900} y1={820} />
    </g>
  );
};

/** Night street: sky, city, blocks, pavement, lamp-lit road. */
export const NightStreet: React.FC<{ t: number }> = ({ t }) => {
  const r = React.useMemo(() => {
    let a = 4 >>> 0;
    const rand = () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const cobbles: { x: number; y: number; w: number; h: number; lite: boolean }[] = [];
    for (let row = 0; row < 7; row++) {
      const yy = 856 + row * 36 + row * row * 1.5;
      const wd = 84 + row * 8;
      for (let kx = -4; kx < 30; kx++) {
        const xx = kx * (wd + 10) + (row % 2) * (wd / 2) - 100;
        cobbles.push({ x: xx, y: yy, w: wd, h: 24 + row * 2, lite: rand() < 0.7 });
      }
    }
    return cobbles;
  }, []);
  return (
    <g>
      <Sky top="#0A1136" bot="#26358C" h={760} />
      <Stars t={t} />
      <Moon x={1500} y={150} r={36} />
      <Cloud x={700 + t * 8} y={220} s={1.0} />
      <Blur sigma={2.0}>
        <FarCity base={660} seed={8} v="#1E2A68" />
      </Blur>
      <Block x={-90} w={300} h={500} base={760} seed={21} lit={0.34} body="#222E66" dim="#2C3A80" />
      <Block x={210} w={240} h={410} base={760} seed={22} lit={0.34} body="#222E66" dim="#2C3A80" />
      <Block x={1660} w={250} h={400} base={760} seed={24} lit={0.34} body="#222E66" dim="#2C3A80" />
      <Block x={1900} w={260} h={470} base={760} seed={25} lit={0.34} body="#222E66" dim="#2C3A80" />
      <rect x={-900} y={760} width={W + 1800} height={80} fill="#444B70" />
      <Line x0={-900} y0={760} x1={W + 900} y1={760} />
      <Line x0={-900} y0={840} x1={W + 900} y1={840} />
      <rect x={-900} y={840} width={W + 1800} height={H + 600 - 840} fill="#30365A" />
      {r.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx={10} fill={c.lite ? '#3C4368' : '#474F78'} />
      ))}
    </g>
  );
};

/** A sagging string of warm bulbs (kit3 string_lights), twinkling with t. */
export const StringLights: React.FC<{ x0: number; x1: number; y: number; sag?: number; n?: number; bulb?: string; t?: number }> =
  ({ x0, x1, y, sag = 50, n = 12, bulb = '#FFE9A0', t = 0 }) => {
    const mx = (x0 + x1) / 2;
    const bulbs = Array.from({ length: n + 1 }, (_, i) => {
      const u = i / n;
      const bx = x0 + (x1 - x0) * u;
      const by = y + 4 * u * (1 - u) * sag;
      return { bx, by };
    });
    return (
      <g>
        <path d={`M ${x0} ${y} Q ${mx} ${y + sag * 2} ${x1} ${y}`} fill="none" stroke={INK} strokeWidth={3} />
        {bulbs.map(({ bx, by }, i) => (
          <g key={i}>
            <Line x0={bx} y0={by - 6} x1={bx} y1={by + 4} w={3} />
            <circle cx={bx} cy={by + 12} r={9} fill={bulb} opacity={0.72 + 0.28 * Math.sin(t * 2 + i)} />
            <AddLight x={bx} y={by + 12} r={46} v={bulb} a={110 + 50 * Math.sin(t * 2 + i)} />
          </g>
        ))}
      </g>
    );
  };

/** Close-up background: the set, blurred + zoomed, under a night pool (kit3 closeup_bg). */
export const CloseupBg: React.FC<{ t: number; dx: number; zoom?: number; set: React.ReactNode }> =
  ({ t, dx, zoom = 1.5, set }) => (
    <g>
      <Blur sigma={13}>
        <g transform={`translate(${dx} -200) scale(${zoom})`}>{set}</g>
      </Blur>
      <Night lights={[{ kind: 'pool', x: 960, y: 520, r: 900, a: 0.55 }]} />
    </g>
  );
