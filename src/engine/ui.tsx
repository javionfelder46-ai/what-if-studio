import React from 'react';
import { clamp, backOut, easeOut } from './anim';
import { C } from './rig';
import { FONT } from './fonts';
import { MOONLIGHT } from './kit';

// What goes on top of a shot. The genre keeps text off the picture: one title card, small UI readouts in a mono
// face (a timer, a label, a chip), a few marks. No comic speech bubbles, no "HA HA", no captions of the voice.
// One look for every readout: a dark translucent pill, cream text, orange for the live value.

export const UI = {
  pill: '#0B0816',
  text: '#F6EFE3',
  live: '#FF8A3D',
  good: '#5BE08A',
  bad: '#FF5A4A',
};

/**
 * ANIMATED COUNTER (Nov 14, m4lkxx "Flip" idea — Javion: yes to all three): a number that counts up (or down)
 * over `dur` frames with an easeOut, instead of sitting static on screen. Use it for stat callouts
 * ("7% SMALLER" counting 0 → 7), timers, and counts. `from`/`to` are the values; `decimals` sets the
 * precision; `prefix`/`suffix` wrap the number (e.g. suffix "%"); `commas` adds thousands separators.
 * For a countdown clock (video #5's ticking timer), pass seconds and `clock` to render HH:MM:SS.
 */
export const Counter: React.FC<{
  x: number; y: number; t: number; from?: number; to: number; dur?: number;
  decimals?: number; prefix?: string; suffix?: string; commas?: boolean; clock?: boolean;
  size?: number; fill?: string; font?: string; anchor?: 'start' | 'middle' | 'end';
}> = ({ x, y, t, from = 0, to, dur = 30, decimals = 0, prefix = '', suffix = '', commas = false, clock = false, size = 56, fill = MOONLIGHT, font = FONT.ui, anchor = 'middle' }) => {
  const k = easeOut(clamp(t / dur));
  const v = from + (to - from) * k;
  let text: string;
  if (clock) {
    const s = Math.max(0, Math.round(v));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    text = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  } else if (commas) {
    text = v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  } else {
    text = v.toFixed(decimals);
  }
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill={fill} stroke="#1A1230" strokeWidth={6} paintOrder="stroke">
      {prefix + text + suffix}
    </text>
  );
};

/** A four-point sparkle that blooms and fades over 18 frames from t = 0 (a glint, a win). */
export const Sparkle: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t <= 0 || t > 18) return null;
  const k = Math.sin((t / 18) * Math.PI);
  return <path transform={`translate(${x} ${y}) scale(${k * s}) rotate(${t * 6})`} d="M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z" fill="#FFE27A" />;
};

/** A short answer or value as a small label (a sum's answer, a price, "x10"), with an optional mark drawn on after markT. */
export const Tag: React.FC<{ x: number; y: number; t: number; text: string; mark?: 'x' | 'check'; markT?: number; w?: number }> = ({ x, y, t, text, mark, markT = 8, w = 148 }) => {
  if (t < 0) return null;
  const s = backOut(clamp(t / 6));
  const m = clamp((t - markT) / 4);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-46} width={w} height={92} rx={46} fill={UI.pill} opacity={0.72} />
      <rect x={-w / 2} y={-46} width={w} height={92} rx={46} fill="none" stroke={UI.text} strokeWidth={3} opacity={0.85} />
      <text y={20} textAnchor="middle" fontFamily={FONT.ui} fontSize={58} fill={UI.text}>
        {text}
      </text>
      {mark && m > 0 ? (
        mark === 'x' ? (
          <path d={`M ${w / 2 + 18} -30 L ${w / 2 + 76} 28 M ${w / 2 + 76} -30 L ${w / 2 + 18} 28`} stroke={UI.bad} strokeWidth={13} strokeLinecap="round" strokeDasharray={170} strokeDashoffset={170 * (1 - m)} />
        ) : (
          <path d={`M ${w / 2 + 16} 0 L ${w / 2 + 38} 26 L ${w / 2 + 82} -32`} stroke={UI.good} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={110} strokeDashoffset={110 * (1 - m)} />
        )
      ) : null}
    </g>
  );
};

/** A chip in the corner naming the power while it runs (REWIND, COPY, PAUSED...), with an icon that blinks. */
export const HudChip: React.FC<{ x?: number; y?: number; f: number; label: string; icon?: 'rewind' | 'pause' | 'copy' | 'paste' | 'dot' | 'skip' }> = ({ x = 96, y = 112, f, label, icon = 'dot' }) => {
  const blink = Math.floor(f / 5) % 2 ? 1 : 0.5;
  const w = 168 + label.length * 27;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-30} y={-46} width={w} height={92} rx={46} fill={UI.pill} opacity={0.55} />
      <g transform="translate(26 0)" opacity={blink}>
        {icon === 'rewind' ? <path d="M 0 -24 L -26 0 L 0 24 Z M 30 -24 L 4 0 L 30 24 Z" fill="#FFB15A" /> : null}
        {icon === 'pause' ? <path d="M -12 -22 L -2 -22 L -2 22 L -12 22 Z M 8 -22 L 18 -22 L 18 22 L 8 22 Z" fill="#FFB15A" /> : null}
        {icon === 'copy' || icon === 'paste' ? (
          <g fill="none" stroke="#FFB15A" strokeWidth={5} strokeLinejoin="round">
            <rect x={-14} y={-22} width={26} height={32} rx={4} />
            <rect x={-2} y={-10} width={26} height={32} rx={4} fill={icon === 'paste' ? '#FFB15A' : 'none'} />
          </g>
        ) : null}
        {icon === 'dot' ? <circle r={12} fill="#FF4A4A" /> : null}
        {icon === 'skip' ? <path d="M -24 -22 L -2 0 L -24 22 Z M -2 -22 L 20 0 L -2 22 Z M 22 -22 L 30 -22 L 30 22 L 22 22 Z" fill="#FFB15A" /> : null}
      </g>
      <text x={80} y={16} fontFamily={FONT.ui} fontSize={44} fill={UI.text} letterSpacing={6}>
        {label}
      </text>
    </g>
  );
};

/** A round dial with a readout: a stopwatch counting, a countdown, a battery. `p` is how full the ring is (0..1). */
export const Dial: React.FC<{ x?: number; y?: number; p: number; readout: string; r?: number; size?: number }> = ({ x = 1720, y = 140, p, readout, r = 84, size = 40 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={UI.pill} opacity={0.55} />
    <circle r={r} fill="none" stroke={UI.text} strokeWidth={5} opacity={0.85} />
    <circle r={r} fill="none" stroke={UI.live} strokeWidth={9} strokeDasharray={2 * Math.PI * r} strokeDashoffset={2 * Math.PI * r * (1 - clamp(p))} transform="rotate(-90)" />
    <rect x={-14} y={-r - 28} width={28} height={18} rx={4} fill={UI.text} opacity={0.85} />
    <text y={size * 0.35} textAnchor="middle" fontFamily={FONT.ui} fontSize={size} fill={UI.live}>
      {readout}
    </text>
  </g>
);

/** A horizontal gauge with a label: how much is left, how fast, how strong. `p` 0..1; it turns red past `danger`. */
export const Gauge: React.FC<{ x: number; y: number; w?: number; p: number; label: string; danger?: number }> = ({ x, y, w = 420, p, label, danger = 0.8 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-20} y={-58} width={w + 40} height={110} rx={22} fill={UI.pill} opacity={0.6} />
    <text x={0} y={-18} fontFamily={FONT.ui} fontSize={28} fill={UI.text} letterSpacing={4} opacity={0.85}>
      {label}
    </text>
    <rect x={0} y={0} width={w} height={26} rx={13} fill="#ffffff" opacity={0.12} />
    <rect x={0} y={0} width={w * clamp(p)} height={26} rx={13} fill={p > danger ? UI.bad : UI.live} />
  </g>
);

/** A label that pops up and drifts off ("x10", "+1", "56"), from t = 0 over 24 frames. */
export const FloatLabel: React.FC<{ x: number; y: number; t: number; text: string; color?: string; size?: number }> = ({ x, y, t, text, color = '#FFE27A', size = 72 }) => {
  if (t < 0 || t > 24) return null;
  const s = backOut(clamp(t / 6));
  return (
    <text x={x} y={y - easeOut(t / 24) * 60} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size * s} fill={color} opacity={clamp((24 - t) / 8)} stroke="#1A1230" strokeWidth={6} paintOrder="stroke">
      {text}
    </text>
  );
};

/** Concentric rings opening out from a point (focus, a realisation, a power switching on), from t = 0 over 18 frames. */
export const FocusRings: React.FC<{ x: number; y: number; t: number; r0?: number; color?: string }> = ({ x, y, t, r0 = 60, color = '#FFE7B3' }) =>
  t > 0 && t < 18 ? (
    <g>
      {[0, 1, 2].map((i) => {
        const r = r0 + (t - i * 4) * 26;
        return r > r0 ? <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={6} opacity={clamp(1 - (t - i * 4) / 14)} /> : null;
      })}
    </g>
  ) : null;

/** Stars circling a dazed head, from t = 0. */
export const DizzyStars: React.FC<{ x: number; y: number; t: number; rx?: number; ry?: number }> = ({ x, y, t, rx = 110, ry = 50 }) =>
  t < 0 ? null : (
    <g>
      {[0, 1, 2].map((i) => {
        const a = t / 4 + (i * Math.PI * 2) / 3;
        return (
          <path
            key={i}
            transform={`translate(${x + Math.cos(a) * rx} ${y + Math.sin(a) * ry}) scale(0.5)`}
            d="M 0 -40 L 10 -12 L 40 -12 L 16 6 L 25 36 L 0 18 L -25 36 L -16 6 L -40 -12 L -10 -12 Z"
            fill="#FFE27A"
            stroke={C.ink}
            strokeWidth={5}
          />
        );
      })}
    </g>
  );

/**
 * A selection box: dashed "marching ants" that draw round a target from t = 0, with corner handles, then hold.
 * For powers that pick a thing out of the world (copy, scan, target, freeze one object).
 */
export const Marquee: React.FC<{ x: number; y: number; w: number; h: number; t: number; color?: string; label?: string }> = ({ x, y, w, h, t, color = '#7FD4FF', label }) => {
  if (t < 0) return null;
  const draw = easeOut(clamp(t / 7));
  const per = 2 * (w + h);
  const ants = (t * 2) % 24;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} opacity={0.08 * draw} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#0B0816" strokeWidth={9} opacity={0.5 * draw} strokeDasharray={`${per * draw} ${per}`} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth={5} strokeDasharray={draw < 1 ? `${per * draw} ${per}` : '14 10'} strokeDashoffset={draw < 1 ? 0 : -ants} />
      {draw >= 1
        ? [
            [x, y],
            [x + w, y],
            [x, y + h],
            [x + w, y + h],
          ].map(([hx, hy], i) => <rect key={i} x={hx - 9} y={hy - 9} width={18} height={18} rx={3} fill="#F6EFE3" stroke={color} strokeWidth={4} />)
        : null}
      {label && draw >= 1 ? (
        <g transform={`translate(${x} ${y - 22})`}>
          <rect x={0} y={-34} width={label.length * 21 + 34} height={44} rx={10} fill={color} />
          <text x={17} y={-3} fontFamily={FONT.ui} fontSize={30} fill="#0B0816">
            {label}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/**
 * Something appearing out of nowhere (a pasted copy, a summoned object): before t = 0 nothing, then it pops in about
 * (x, y) with an overshoot, glowing in the power's colour, and a ring opens out from it. Wrap the thing in it.
 */
export const PasteIn: React.FC<{ x: number; y: number; t: number; children: React.ReactNode; color?: string; ring?: number }> = ({ x, y, t, children, color = '#7FD4FF', ring = 90 }) => {
  if (t < 0) return null;
  const s = backOut(clamp(t / 7));
  const glow = 1 - clamp(t / 14);
  return (
    <g>
      {t < 16 ? <circle cx={x} cy={y} r={ring * (0.6 + easeOut(t / 16) * 1.6)} fill="none" stroke={color} strokeWidth={6} opacity={1 - t / 16} /> : null}
      <g transform={`translate(${x} ${y}) scale(${0.55 + 0.45 * s}) translate(${-x} ${-y})`} style={glow > 0 ? { filter: `drop-shadow(0 0 ${4 + 16 * glow}px ${color}) brightness(${1 + 0.5 * glow})` } : undefined}>
        {children}
      </g>
    </g>
  );
};

/** A small notice that pops in and out (COPIED, SAVED, +1), centred at x, y, from t = 0 for `hold` frames. */
export const Toast: React.FC<{ x: number; y: number; t: number; text: string; hold?: number; color?: string }> = ({ x, y, t, text, hold = 26, color = UI.live }) => {
  if (t < 0 || t > hold + 6) return null;
  const s = t < hold ? backOut(clamp(t / 6)) : 1 - clamp((t - hold) / 6);
  const w = text.length * 26 + 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill={UI.pill} opacity={0.8} />
      <circle cx={-w / 2 + 34} cy={0} r={9} fill={color} />
      <text x={14} y={12} textAnchor="middle" fontFamily={FONT.ui} fontSize={34} fill={UI.text} letterSpacing={4}>
        {text}
      </text>
    </g>
  );
};

/** VHS-style tape lines and a moving bright band, for a power that bends time (rewind, fast-forward). Full frame. */
export const TapeLines: React.FC<{ f: number }> = ({ f }) => {
  const band = 1080 - ((f * 53) % 1400) + 160;
  return (
    <g>
      <defs>
        <pattern id="tapeScan" width="4" height="6" patternUnits="userSpaceOnUse" y={(f * 3) % 6}>
          <rect width="4" height="2" fill="#000" opacity="0.22" />
        </pattern>
      </defs>
      <rect width="1920" height="1080" fill="url(#tapeScan)" />
      <rect x={0} y={band} width={1920} height={26} fill="#FFFFFF" opacity={0.1} />
    </g>
  );
};

/** The REWIND mechanic (v8, Nov 9, Javion: "add the rewind mechanic in it as well i really
    like it"): the look from the rewind reference episode — a red wash over the picture,
    rolling tape lines, a blinking REWIND chip, and a stopwatch counting BACK from `secs`.
    `p` is 0..1 progress through the rewind (0 = just started rewinding, 1 = back at the
    start); `take` is the replay number shown bottom-right ("REPLAY #400"). Drop it over
    any shot that replays a moment in reverse — the picture underneath should be the
    moment playing backward (pass a reversed `t` to the shot's poses). */
export const RewindOverlay: React.FC<{ f: number; p: number; secs?: number; take?: number }> = ({ f, p, secs = 10, take }) => {
  const s = secs * (1 - p);
  const read = `-${String(Math.floor(s)).padStart(2, '0')}.${String(Math.floor((s % 1) * 100)).padStart(2, '0')}`;
  return (
    <g>
      <rect width="1920" height="1080" fill="#FF2A1A" opacity={0.14} />
      <TapeLines f={f} />
      <HudChip f={f} label="REWIND" icon="rewind" />
      <Dial p={1 - p} readout={read} />
      {take !== undefined ? (
        <text x={1820} y={1010} textAnchor="end" fontFamily={FONT.ui} fontSize={28} fill="#F6EFE3" opacity={0.6}>
          {`REPLAY #${take}`}
        </text>
      ) : null}
    </g>
  );
};

/**
 * TEXT CHAT — a phone text-message scene (Nov 14, @fuckscales rule + Nov 14 Night Shift, Javion: "use a phone scene
 * in ours as well" / "Text message scary scene"). A dark-mode phone screen, phone fills the frame, bubbles appear
 * ONE AT A TIME (staggered `gap` frames apart) as if live, timestamps in the gaps. Grey bubbles left (incoming),
 * blue replies right. An urgent message goes `red` — red bold caps, color carries the urgency. No voiceover
 * needed for the bubbles: the text IS the scare, the viewer reads it. `messages` is the full thread in order.
 */
export const TextChat: React.FC<{
  x: number; y: number; t: number; w?: number;
  messages: { text: string; side?: 'left' | 'right'; red?: boolean; time?: string }[];
  gap?: number; title?: string;
}> = ({ x, y, t, w = 900, messages, gap = 18, title = '' }) => {
  const pad = 36;
  const fontSize = 40;
  // FIX (Nov 14, Javion: "All the words don't fit in the bubble"): FONT.ui is Fragment Mono — every char
  // is the same width (0.6em), so the bubble must be sized FROM the text, not a fixed 620. The old code
  // drew every bubble 620 wide and rendered the full text on one line regardless, so a 25-char line
  // (600px of text + 28px padding = 628) ran 8px past the bubble's right edge. Now each message is
  // word-wrapped to real lines, the bubble is exactly as wide as its longest line, and each line is
  // rendered separately so nothing can overflow.
  const charW = fontSize * 0.6;
  const maxBubbleW = w - pad * 2 - 80;
  const wrap = (text: string): string[] => {
    const maxChars = Math.max(1, Math.floor((maxBubbleW - 56) / charW));
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const wd of words) {
      const next = cur ? cur + ' ' + wd : wd;
      if (next.length <= maxChars) cur = next;
      else {
        if (cur) lines.push(cur);
        cur = wd;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const laidOut = messages.map((m) => {
    const lines = wrap(m.text);
    const bw = Math.min(maxBubbleW, Math.max(...lines.map((l) => l.length)) * charW + 56);
    const bh = lines.length * 56 + 36;
    return { ...m, lines, bw, bh };
  });
  const gapY = 26;
  const phoneH = 1500;
  const stackH = laidOut.reduce((a, b) => a + b.bh, 0) + gapY * (laidOut.length - 1);
  let cy = phoneH / 2 - 60 - stackH; // bottom-anchored: stack's top edge
  // BUZZ (Nov 14, Javion: "Does the phone also buzz while getting notifications?"): the phone vibrates
  // for 8 frames every time a new bubble lands — a small horizontal jitter plus vibration arcs on the
  // sides, like the Phone prop's buzz. The buzz is the beat that makes each text feel like it just arrived.
  const buzzWin = 8;
  let buzz = 0;
  laidOut.forEach((_, i) => {
    const start = i * gap;
    if (t >= start && t < start + buzzWin) buzz = Math.max(buzz, 1 - (t - start) / buzzWin);
  });
  const jx = buzz > 0 ? Math.sin(t * 9.1) * 4 * buzz : 0;
  return (
    <g transform={`translate(${x + jx} ${y})`}>
      {/* vibration arcs — visible while the phone buzzes */}
      {buzz > 0
        ? [-1, 1].map((sd) => (
            <g key={sd} stroke="#CFE6FF" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.8 * buzz}>
              <path d={`M ${sd * (w / 2 + 24)} ${-140} q ${sd * 14} ${70} 0 ${140}`} />
              <path d={`M ${sd * (w / 2 + 48)} ${-200} q ${sd * 20} ${100} 0 ${200}`} />
            </g>
          ))
        : null}
      {/* phone body — fixed portrait slab */}
      <rect x={-w / 2} y={-phoneH / 2} width={w} height={phoneH} rx={48} fill="#16151C" stroke="#3A3846" strokeWidth={5} />
      <rect x={-w / 2 + 18} y={-phoneH / 2 + 18} width={w - 36} height={phoneH - 36} rx={36} fill="#0B0A10" />
      {title ? (
        <text x={0} y={-phoneH / 2 + 70} textAnchor="middle" fontFamily={FONT.ui} fontSize={40} fill="#8E8E93" letterSpacing={2}>
          {title}
        </text>
      ) : null}
      {laidOut.map((m, i) => {
        const appearT = i * gap;
        const k = backOut(clamp((t - appearT) / 6));
        if (k <= 0) return null;
        const isLeft = (m.side ?? 'left') === 'left';
        const bx = isLeft ? -w / 2 + pad + 18 : w / 2 - pad - 18 - m.bw;
        const by = cy;
        cy += m.bh + gapY;
        const fill = m.red ? '#FF3B30' : isLeft ? '#3A3A3C' : '#0A84FF';
        const weight = m.red ? 800 : 400;
        return (
          <g key={i} opacity={k}>
            {m.time ? (
              <text x={0} y={by - 14} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill="#8E8E93">
                {m.time}
              </text>
            ) : null}
            <rect x={bx} y={by} width={m.bw} height={m.bh} rx={m.bh / 2} fill={fill} />
            {m.lines.map((ln, li) => (
              <text key={li} x={bx + 28} y={by + 18 + (li + 1) * 56 - 14} fontFamily={FONT.ui} fontSize={fontSize} fontWeight={weight} fill="#FFFFFF">
                {ln}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
};
export const TitleCard: React.FC<{ t: number; lines: [string, string]; accent?: string; accentT?: number; y?: number; size?: number }> = ({ t, lines, accent, accentT = 34, y = 175, size = 128 }) => {
  const pop = (d: number) => backOut(clamp((t - d) / 9));
  const pulse = t >= accentT && t < accentT + 12 ? 1 + 0.14 * Math.sin(((t - accentT) / 12) * Math.PI) : 1;
  const words = lines[1].split(' ');
  // Flatten the big line into characters (spaces kept as their own tspans so word gaps stay natural).
  // Each char carries its word index so the accent word's letters still get the pulse + yellow fill.
  const chars: { ch: string; wordIdx: number; isAccent: boolean }[] = [];
  words.forEach((w, wi) => {
    if (wi > 0) chars.push({ ch: ' ', wordIdx: wi, isAccent: false });
    const isAcc = w.replace(/[^\w]/g, '') === accent;
    w.split('').forEach((ch) => chars.push({ ch, wordIdx: wi, isAccent: isAcc }));
  });
  return (
    <g>
      <g transform={`translate(960 ${y}) scale(${pop(2)})`}>
        <text textAnchor="middle" fontFamily={FONT.title} fontWeight={600} fontSize={size / 2} letterSpacing={4} fill="#F6EFE3" stroke="#1A1230" strokeWidth={8} paintOrder="stroke">
          {lines[0]}
        </text>
      </g>
      <g transform={`translate(960 ${y + size - 3}) scale(${pop(5)})`}>
        <text textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={size} fill={MOONLIGHT} stroke="#1A1230" strokeWidth={12} paintOrder="stroke" style={{ filter: 'drop-shadow(0 0 22px rgba(169,198,255,0.55))' }}> {/* Nov 14 (Javion: "Why is the words not moonlight blue?" / "At least change it to a different color other than orange") — the chapter-title words were orange (C.orange + orange glow). Now moonlight blue, the channel's signature glow color, so the titles read as one look with the Detective's glow. */}
          {chars.map((c, i) => (
            <tspan key={i} opacity={clamp((t - (5 + i * 2)) / 3)} style={c.isAccent ? { fontSize: size * pulse } : undefined} fill={c.isAccent ? '#FFE27A' : undefined}>
              {c.ch}
            </tspan>
          ))}
        </text>
      </g>
    </g>
  );
};

/**
 * The Inkl end card — the channel outro, from the storyboard poster's bottom-right block
 * (video #2's final shot, and every video from here on): a black field, the Inkl logo in
 * the hand face with a red underline swoosh, "Curiosity. Explained.", and the red Subscribe
 * button with a white play triangle. It is the video's ONLY subscribe ask — no verbal ask,
 * no mid-video prompts, ever. Draw it full-frame (world coords, inside the camera group);
 * the shot that uses it carries no character and no set.
 */
export const EndCard: React.FC = () => (
  <g>
    <rect x={-400} y={-200} width={2720} height={1500} fill="#0B0816" />
    <text x={960} y={400} textAnchor="middle" fontFamily={FONT.hand} fontSize={170} fill="#F6EFE3">Inkl</text>
    <path d="M 780 440 Q 960 472 1140 440" stroke="#C0392B" strokeWidth={10} fill="none" strokeLinecap="round" />
    <text x={960} y={545} textAnchor="middle" fontFamily={FONT.ui} fontSize={46} fill="#F6EFE3">Curiosity. Explained.</text>
    <rect x={740} y={620} width={440} height={110} rx={55} fill="#E62117" />
    <path d="M 800 652 L 800 698 L 842 675 Z" fill="#FFFFFF" />
    <text x={1010} y={692} textAnchor="middle" fontFamily={FONT.ui} fontSize={52} fill="#FFFFFF">Subscribe!</text>
  </g>
);

// ---------------------------------------------------------------------------
// HUD / label chrome from the Super Renderer reel (video-capabilities-list.md).
// All 7 are opt-in overlays: nothing renders unless a scene drops one in.
// Each takes the global frame `f` and an optional [start, end] visibility
// window; outside the window it renders nothing. They use the same dark-pill
// + mono-text look as HudChip / Tag / Toast, so they read as one family.
// ---------------------------------------------------------------------------

/** The reel's framing chrome: a top-left dark pill naming the capability (red dot + dot separators) and a bottom-centre dark pill naming the section. */
export const SectionLabelPills: React.FC<{
  f: number;
  capability: string;
  section: string;
  start?: number;
  end?: number;
  topX?: number;
  topY?: number;
  bottomY?: number;
}> = ({ f, capability, section, start = 0, end, topX = 96, topY = 112, bottomY = 996 }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const t = f - start;
  const s = backOut(clamp(t / 6));
  const topW = 112 + capability.length * 28;
  const botW = 72 + section.length * 28;
  return (
    <g>
      <g transform={`translate(${topX} ${topY}) scale(${s})`}>
        <rect x={-30} y={-46} width={topW} height={92} rx={46} fill={UI.pill} opacity={0.72} />
        <circle cx={22} cy={0} r={11} fill={UI.bad} />
        <text x={52} y={15} fontFamily={FONT.ui} fontSize={38} fill={UI.text} letterSpacing={5}>
          {capability}
        </text>
      </g>
      <g transform={`translate(960 ${bottomY}) scale(${s})`}>
        <rect x={-botW / 2} y={-46} width={botW} height={92} rx={46} fill={UI.pill} opacity={0.72} />
        <text y={15} textAnchor="middle" fontFamily={FONT.ui} fontSize={38} fill={UI.text} letterSpacing={5}>
          {section}
        </text>
      </g>
    </g>
  );
};

/** A name label floating above a character's head: a small dark pill with white mono text. `x, y` is the head; the pill sits above it. */
export const NameTag: React.FC<{
  x: number;
  y: number;
  name: string;
  f: number;
  start?: number;
  end?: number;
}> = ({ x, y, name, f, start = 0, end }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const t = f - start;
  const s = backOut(clamp(t / 6));
  const w = 48 + name.length * 22;
  return (
    <g transform={`translate(${x} ${y - 52}) scale(${s})`}>
      <rect x={-w / 2} y={-28} width={w} height={56} rx={28} fill={UI.pill} opacity={0.78} />
      <text y={10} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill={UI.text} letterSpacing={4}>
        {name}
      </text>
    </g>
  );
};

/** The big expression name at the top when a face swaps ("SMUG", "HAPPY" — large yellow text). Pops in at `start`, holds until `end`. */
export const FaceNameLabel: React.FC<{
  expr: string;
  f: number;
  start?: number;
  end?: number;
  y?: number;
  size?: number;
}> = ({ expr, f, start = 0, end, y = 170, size = 110 }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const t = f - start;
  const s = backOut(clamp(t / 7));
  return (
    <g transform={`translate(960 ${y}) scale(${s})`}>
      <text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size} fill="#FFE27A" stroke="#1A1230" strokeWidth={8} paintOrder="stroke" letterSpacing={6}>
        {expr}
      </text>
    </g>
  );
};

/** The tech-spec pill from the title card: a rewind glyph + "REMOTION · 1920×1080 · 30 FPS". Top-left by default. */
export const TechSpecPill: React.FC<{
  f: number;
  spec?: string;
  x?: number;
  y?: number;
  start?: number;
  end?: number;
}> = ({ f, spec = 'REMOTION · 1920×1080 · 30 FPS', x = 96, y = 112, start = 0, end }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const t = f - start;
  const s = backOut(clamp(t / 6));
  const w = 144 + spec.length * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-30} y={-46} width={w} height={92} rx={46} fill={UI.pill} opacity={0.72} />
      <g transform="translate(26 0)">
        <path d="M 0 -24 L -26 0 L 0 24 Z M 30 -24 L 4 0 L 30 24 Z" fill="#FFB15A" />
      </g>
      <text x={84} y={15} fontFamily={FONT.ui} fontSize={36} fill={UI.text} letterSpacing={4}>
        {spec}
      </text>
    </g>
  );
};

/** L-shaped viewfinder corner marks at the frame corners (a static camera overlay). Full 1920×1080 frame. */
export const ViewfinderBrackets: React.FC<{
  f: number;
  inset?: number;
  len?: number;
  sw?: number;
  color?: string;
  opacity?: number;
  start?: number;
  end?: number;
}> = ({ f, inset = 48, len = 96, sw = 6, color = UI.text, opacity = 0.9, start = 0, end }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const corners: Array<[number, number, number, number]> = [
    [inset, inset, 1, 1],
    [1920 - inset, inset, -1, 1],
    [inset, 1080 - inset, 1, -1],
    [1920 - inset, 1080 - inset, -1, -1],
  ];
  return (
    <g fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" opacity={opacity}>
      {corners.map(([cx, cy, sx, sy], i) => (
        <path key={i} d={`M ${cx + sx * len} ${cy} L ${cx} ${cy} L ${cx} ${cy + sy * len}`} />
      ))}
    </g>
  );
};

/** A recording indicator: a blinking red dot + a frame counter, bottom-right by default. `x` is the right edge. */
export const RecIndicator: React.FC<{
  f: number;
  x?: number;
  y?: number;
  start?: number;
  end?: number;
}> = ({ f, x = 1824, y = 1000, start = 0, end }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const blink = Math.floor(f / 5) % 2 ? 1 : 0.45;
  const counter = String(f).padStart(6, '0');
  const w = 216;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w} y={-40} width={w} height={80} rx={40} fill={UI.pill} opacity={0.72} />
      <circle cx={-w + 40} cy={0} r={13} fill="#FF4A4A" opacity={blink} />
      <text x={-w + 66} y={13} fontFamily={FONT.ui} fontSize={36} fill={UI.text} letterSpacing={3}>
        {counter}
      </text>
    </g>
  );
};

/**
 * The timeline-FX overlay from the reel: a dashed region box (the shake/flash area, via Marquee)
 * with a scrubber bar above it showing where the playhead is. The engine already has the
 * shake/flash fx; this is just the visualisation. `dur` is how many frames the scrubber spans.
 */
export const TimelineFxOverlay: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  f: number;
  start?: number;
  end?: number;
  dur?: number;
  label?: string;
  color?: string;
}> = ({ x, y, w, h, f, start = 0, end, dur = 30, label = 'SHAKE + FLASH', color = UI.live }) => {
  if (f < start || (end !== undefined && f > end)) return null;
  const t = f - start;
  const p = clamp(t / Math.max(1, dur));
  const trackY = y - 88;
  return (
    <g>
      <Marquee x={x} y={y} w={w} h={h} t={t} color={color} label={label} />
      <g transform={`translate(${x} ${trackY})`}>
        <rect x={0} y={-7} width={w} height={14} rx={7} fill={UI.pill} opacity={0.72} />
        <rect x={0} y={-7} width={w * p} height={14} rx={7} fill={color} opacity={0.9} />
        <g transform={`translate(${w * p} 0)`}>
          <path d="M -10 -22 L 10 -22 L 0 0 Z" fill={UI.text} />
          <rect x={-3} y={-22} width={6} height={44} fill={UI.text} />
        </g>
      </g>
    </g>
  );
};
