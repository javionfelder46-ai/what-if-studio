#!/usr/bin/env python3
"""Generate src/episodes/zenn-003/shots.tsx + index.tsx from the verified puppet specs
(zenn/scenes/zenn_003_v2_specs.json) and episode.json (sizes/sets/keys).

Mapping rules (verified against the rig code, not guessed):
- Arms: the puppet fk_arm and the rig joints() use the SAME convention (angle from straight
  down, forearm angle = shoulder + elbow), except the rig mirrors the LEFT arm by its side
  sign. So: rig armL.a = -puppet armL_sh, armL.b = armL_el; rig armR.a = puppet armR_sh,
  armR.b = armR_el.
- Legs: the puppet stores feet (IK targets); the rig stores leg angles. Two-bone IK in local
  space (THIGH 72, SHIN 68, hip roots +/-17) recovers (a, b); the foot is recomputed from the
  angles and asserted within 2 local units.
- Faces: pose keys carry the puppet expression; faceAt swaps through a blink. The MOOD_MAP
  below is the ONLY allowed mapping. An unmapped mood is a hard error, never a silent swap:
  the face must match the feeling of the line.
- Looks: ROLE_LOOK is the ONLY allowed mapping. A role with no look in rig.tsx LOOKS is a
  hard error, never a Pip/Mo stand-in: our cast is black silhouettes, not the skill's.
- Labels: screen-space (outside the camera group) in the hand face; 'pink' = hot pink
  #E91E63 (video #3 accent); 'black' renders cream #F6EFE3 because black text vanishes on
  the dusk sets (flagged for the board gate-check).
- DAY X: a HudChip readout, top-left, every shot (never a caption).
- Sets: Cell (+door/bed/window/prison flags), Cave, Antarctic, Lab, Classroom (skill),
  Exterior (doorOpen on DAY 30), Stage. Set clock offset per shot so dust/sways don't
  restart at every cut.

Usage: python3 zenn003_gen_shots.py check   # validate tables, print the missing-cast list
       python3 zenn003_gen_shots.py emit    # write shots.tsx + index.tsx (refuses if check fails)
"""
import json, math, re, sys
from pathlib import Path

ZENN = Path('/home/hatch/workspace/youtube-shorts/zenn')
STUDIO = Path('/home/hatch/workspace/what-if-studio')
EP = STUDIO / 'src/episodes/zenn-003'
FPS = 30

# ------------------------------------------------------------------ cast tables (THE gate)
# Roles in the specs -> rig LOOKS key. None = no look exists yet; the generator refuses to emit.
ROLE_LOOK = {
    'detective': 'detective',
    'jake': 'jake',
    'hero': 'hero',              # the trapped "you" — full black silhouette, slate-blue shirt #608EAA
    'researcher': 'researcher',  # Antarctic crew guest look
    'student': 'student',        # McGill cubicle guest look (round glasses)
    'prisoner': 'prisoner',      # Grassian solitary guest look
    'teenager': 'teenager',      # Gardner guest look
    'scientist': 'scientist',    # lab guest look (round glasses)
    'teacher': 'teacher',        # Pygmalion handoff guest look
}
# CHARACTER FIDELITY (Nov 7, Javion: "pay deep attention to the characters"):
# the Detective's magnifying glass is a hand prop, not part of his look
# (rig.tsx) — it must be placed at his hand in the signature shots.
# #2 precedent: cold open + close.
GLASS_SHOTS = {'S1', 'S158'}
# Puppet mood -> rig Expr. None = the rig has no such expression yet; refuse, never substitute.
MOOD_MAP = {
    'neutral': 'neutral',
    'worried': 'worried',
    'puzzled': 'puzzled',
    'happy': 'happy',
    'smug': 'smug',
    'scared': 'scared',
    'angry': 'angry',
    'stressed': 'stressed',
    'sad': 'sad',
    'determined': 'determined',
}

PINK = '#E91E63'   # puppet PINK (233,30,99): video #3 accent, hot pink
CREAM = '#F6EFE3'  # label cream (readable on the dusk sets)
INK = '#161616'    # black-silhouette black

# ------------------------------------------------------------------ rig geometry (from src/engine/rig.tsx)
THIGH, SHIN = 72, 68
HIP_X = 17
LEG_LEN = THIGH + SHIN


def leg_angles(hips_x, hips_y, foot_x, foot_y, scale, facing):
    """Two-bone IK: rig leg angles (a, b) that put the foot at the spec position.
    The spec's foot is the SOLE on the floor; the rig's leg ends at the ANKLE, with the
    shoe drawn 15 units below it (ellipse ry 11 at end.y+4) and 9 forward. So the IK
    target is the ankle: sole minus (facing*9, 15), in local units. Knees point forward
    (in the facing direction). The puppet's shin STRETCHES to any foot (its seg() draws
    knee->foot regardless of length), so an out-of-reach foot clamps: the leg points at
    the foot and lands short. Returns ((a, b), shortfall_local)."""
    tx = (foot_x - hips_x) / scale - facing * 9
    ty = (foot_y - hips_y) / scale - 15
    out = []
    short = 0.0
    for root_x in (-HIP_X, HIP_X):
        dx, dy = tx - root_x, ty
        d_raw = math.hypot(dx, dy)
        d = max(1.0, min(d_raw, THIGH + SHIN - 0.5))
        short = max(short, d_raw - d)
        phi = math.degrees(math.atan2(facing * dx, dy))  # target angle in the facing frame
        alpha = math.degrees(math.acos(max(-1.0, min(1.0, (THIGH**2 + d**2 - SHIN**2) / (2 * THIGH * d)))))
        # two solutions: knee forward (a = phi + alpha) or knee back (a = phi - alpha).
        # In the facing frame, the knee is forward when the thigh swings toward +facing.
        a = phi + alpha
        knee_x = root_x + facing * THIGH * math.sin(math.radians(a))
        knee_y = THIGH * math.cos(math.radians(a))
        a2 = math.degrees(math.atan2(facing * (tx - knee_x), ty - knee_y))
        b = a2 - a
        out.append((round(a, 1), round(b, 1)))
    return out, short  # [legL, legR], worst clamp shortfall


def load():
    specs = json.loads((ZENN / 'scenes/zenn_003_v2_specs.json').read_text())
    scenes = json.loads((ZENN / 'scenes/zenn_003_scenes.json').read_text())
    ep = json.loads((EP / 'episode.json').read_text())
    rig = (STUDIO / 'src/engine/rig.tsx').read_text()
    looks_region = rig.split('export const LOOKS')[1].split('};', 1)[0]
    looks = set(re.findall(r"^\s{2}(\w+): \{", looks_region, re.M))
    exprs = set(re.findall(r"export type Expr = ([^;]+);", rig)[0].replace("'", '').split('|'))
    exprs = {e.strip() for e in exprs}
    return specs, scenes, ep, looks, exprs


def check():
    specs, scenes, ep, looks, exprs = load()
    problems = []
    # looks
    need_roles = {}
    for s in specs:
        for c in s['characters']:
            need_roles.setdefault(c['id'], []).append(s['n'] + 1)
    for role, shot_ns in sorted(need_roles.items()):
        want = ROLE_LOOK.get(role)
        if want is None:
            problems.append(f"ROLE '{role}': no rig look yet (used in {len(shot_ns)} shots: S{min(shot_ns)}..S{max(shot_ns)})")
        elif want not in looks:
            problems.append(f"ROLE '{role}': mapped to look '{want}' which is not in rig.tsx LOOKS")
    # moods
    need_moods = {}
    for s in specs:
        for c in s['characters']:
            for _, p in c['poses']:
                need_moods.setdefault(p['expression'], []).append(s['n'] + 1)
    for mood, shot_ns in sorted(need_moods.items()):
        want = MOOD_MAP.get(mood)
        if want is None:
            problems.append(f"MOOD '{mood}': no rig Expr yet (used in {len(shot_ns)} pose keys across {len(set(shot_ns))} shots)")
        elif want not in exprs:
            problems.append(f"MOOD '{mood}': mapped to Expr '{want}' which is not in rig.tsx")
    print(f'roles needed: {sorted(need_roles)}')
    print(f'moods needed: {sorted(need_moods)}')
    # leg mapping over every pose key (translation validity, cast-independent):
    # stretch-adjusted keys + worst clamp shortfall are warnings for the board check.
    n_stretch, max_short = 0, 0.0
    big_short = []
    for s in specs:
        for c in s['characters']:
            _, _, ns, ms = char_keys(c)
            n_stretch += ns
            if ms > 10:
                big_short.append((round(ms, 1), s['n'] + 1, c['id']))
            max_short = max(max_short, ms)
    print(f'leg mapping: {n_stretch} stretch-adjusted pose keys (hips lowered to plant feet), '
          f'worst wide-stance clamp shortfall {max_short:.1f} local units')
    if big_short:
        print(f'  shots with clamp shortfall >10 (feet land short — hand-tune legs at board time): '
              f'{sorted(set((n, c) for _, n, c in big_short))}')
    print(f'rig looks: {sorted(looks)}')
    print(f'rig exprs: {sorted(exprs)}')
    if problems:
        print(f'\nBLOCKED: {len(problems)} problem(s):')
        for p in problems:
            print('  -', p)
        return False
    print('\nCHECK PASSED: cast complete, all mappings valid.')
    return True


# ------------------------------------------------------------------ emit
SIZE_CAM = {  # size -> (center fn, zoom0, zoom1): centres resolved per shot at emit time
    'wide': ('wide', 1.0, 1.06),
    'medium': ('hero', 1.8, 1.9),
    'close-up': ('head', 3.2, 3.35),
    'macro insert': ('prop', 2.4, 2.5),
    'high angle': ('wide', 1.25, 1.3),
    'low angle': ('hero', 1.6, 1.68),
    'over-the-shoulder': ('hero', 1.5, 1.55),
    'two-shot': ('mid', 1.35, 1.4),
}
SET_COMP = {
    'cell': ('Cell', ''),
    'cell (door)': ('Cell', ' door'),
    'cell (bed)': ('Cell', ' bed'),
    'cell (window)': ('Cell', ' window'),
    'cell (wall)': ('Cell', ''),
    'cell (prison)': ('Cell', ' prison'),
    'lab': ('Lab', ''),
    'antarctic': ('Antarctic', ''),
    'cave': ('Cave', ''),
    'classroom': ('Classroom', ''),
    'outside': ('Exterior', ''),
    'stage': ('Stage', ''),
}


def day_num(day_str):
    m = re.search(r'(\d+)', day_str or '')
    return int(m.group(1)) if m else 1


def fmt(v):
    if isinstance(v, float):
        return f'{v:.1f}' if abs(v - round(v)) > 0.05 else str(int(round(v)))
    return str(v)


def char_keys(c):
    """poseAt keys for one character slot. Returns (keys, facing, n_stretch, max_short).
    Stretch rule: the rig's legs are 140 local units; a pose key whose hips sit more than
    155 local units above the floor (the puppet's 'tall stretch' — the puppet's shin
    stretches to any foot, the rig's cannot) gets its hips lowered to plant the feet
    (hips_y = max foot_y - 155*scale) instead of floating feet. Wide stances clamp:
    the leg points at the foot and lands short by max_short local units."""
    scale = c.get('scale', 1.0)
    keys = c['poses']
    facing = 1
    if len(keys) >= 2:
        dx = keys[-1][1]['hips_x'] - keys[0][1]['hips_x']
        facing = 1 if dx >= -30 else -1
    out, n_stretch, max_short = [], 0, 0.0
    for sec, p in keys:
        hy = p['hips_y']
        vdist = max(p['footL_y'], p['footR_y']) - hy
        if vdist / scale > 155:
            hy = max(p['footL_y'], p['footR_y']) - 155 * scale
            n_stretch += 1
        legL, shL = leg_angles(p['hips_x'], hy, p['footL_x'], p['footL_y'], scale, facing)
        legR, shR = leg_angles(p['hips_x'], hy, p['footR_x'], p['footR_y'], scale, facing)
        max_short = max(max_short, shL, shR)
        out.append((round(sec * FPS), {
            'x': p['hips_x'], 'y': hy, 'scale': scale,
            'tilt': p.get('torso_lean', 0), 'headTilt': p.get('head_tilt', 0),
            'look': p.get('look', 0),
            'armL': {'a': -p['armL_sh'], 'b': p['armL_el']},
            'armR': {'a': p['armR_sh'], 'b': p['armR_el']},
            'legL': {'a': legL[0][0], 'b': legL[0][1]},
            'legR': {'a': legR[1][0], 'b': legR[1][1]},
        }))
    return out, facing, n_stretch, max_short


def key_pose(keys, frame):
    """The pose dict of the nearest key at or before `frame` (for camera centres)."""
    pk = keys[0][1]
    for f, p in keys:
        if f <= frame:
            pk = p
    return pk


def face_keys(c):
    out = []
    last = None
    for sec, p in c['poses']:
        e = MOOD_MAP[p['expression']]
        if e != last:
            out.append((round(sec * FPS), e))
            last = e
    return out


def js_pose(p):
    def limb(l):
        return f"{{ a: {fmt(l['a'])}, b: {fmt(l['b'])} }}"
    return ("{ x: %s, y: %s, scale: %s, tilt: %s, headTilt: %s, look: %s, "
            "armL: %s, armR: %s, legL: %s, legR: %s }" % (
                fmt(p['x']), fmt(p['y']), fmt(p['scale']), fmt(p['tilt']), fmt(p['headTilt']),
                fmt(p['look']), limb(p['armL']), limb(p['armR']), limb(p['legL']), limb(p['legR'])))


def js_label_text(text, x):
    """A label's text as safe JSX: escape & < >, split real newlines into tspans."""
    parts = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').split('\n')
    if len(parts) == 1:
        return parts[0]
    return ''.join(f'<tspan x={{{x}}} dy={{{0 if i == 0 else 58}}}>{p}</tspan>' for i, p in enumerate(parts))


def _esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


# ------------------------------------------------------------------ extra prop drawings
# The Prop switch in emit() only drew 9 kinds; every other kind fell through to the
# blank dark panel (board self-check, Nov 7: 17 shots showed a blank panel as their
# subject). Each case below is a small flat-vector drawing in the same style, in a
# local frame centred on (0, 0) (~220 x 140). `dX` is the gentle drift from
# extra.drift_x. PROP_HALF gives the drawing's half-extent for camera fitting.
PROP_HALF = {
    'calendar': (130, 170), 'brain': (150, 110), 'door': (110, 180),
    'graph': (140, 110), 'mirror': (120, 110), 'tally': (110, 90),
    # FRAMING FIX (board self-check, Nov 7): true half-extents, not the (140,110)
    # default — the default over-pushed S15's sign onto the Detective's face and
    # under-measured the speech bubble (its text is wider than the old rect).
    'sign': (157, 58),            # dynamic rect: w=max(260, 19*maxlen+48), h=28+44*nlines (S15 2-line: 314x116)
    'speech_bubble': (135, 70),   # widened rect x -130..130, tail to y 66
    'balance_scale': (145, 110),  # pans x -108..108 + left label to x -145, labels to y 108
}

# ------------------------------------------------------------------ layout boxes (board v6)
# A prop's TRUE drawn box in world units: (half-width, above-anchor, below-anchor).
# PROP_HALF is symmetric and wrong for the two shapes that clipped/collided on the
# v5 board: question_mark (the "?" glyph ascends ~180 above its baseline, its dot
# sits ~60 below it — S141's top was cut off by the frame) and the speech bubble
# (its tail hangs 66 below the rect). The sign's rect is sized from its text.
# Everything else keeps PROP_HALF (measured, conservative).
def prop_box(pr):
    kind, s = pr['kind'], pr.get('s', 1.0)
    dx = abs(pr.get('drift_x') or 0)
    if kind == 'sign':
        lns = (pr.get('text') or '').split('\n')
        w = max(260, max((len(l) for l in lns), default=0) * 19 + 48)
        h = 28 + len(lns) * 44
        return (w / 2 * s, h / 2 * s, h / 2 * s)
    if kind == 'speech_bubble':
        return (130 * s + dx, 70 * s, 66 * s)
    if kind == 'question_mark':
        return (75 * s + dx, 180 * s, 60 * s)
    hw, hh = PROP_HALF.get(kind, (140, 110))
    return (hw * s + dx, hh * s, hh * s)


def _hit(a, b):
    """Do screen boxes a/b (x0, y0, x1, y1) overlap?"""
    return a[0] < b[2] and a[2] > b[0] and a[1] < b[3] and a[3] > b[1]


def _screen_box(pcx, pcy, hw, top, bot, cx, cy, z):
    """A world-space prop box as a screen box at zoom z (1920x1080 frame)."""
    return (960 + (pcx - hw - cx) * z, 540 + (pcy - top - cy) * z,
            960 + (pcx + hw - cx) * z, 540 + (pcy + bot - cy) * z)


def chip_box(day_label):
    """The DAY chip's screen box (HudChip at 96,112; 12px clearance margin)."""
    w = 168 + 27 * len(day_label)
    return (54, 54, 66 + w + 12, 170)


def chip_fallbacks(day_label):
    """Alternate chip positions (HudChip translate x, y) when top-left is blocked:
    bottom-left, then bottom-right. The chip is a HUD readout — it moves, the
    story content does not."""
    w = 168 + 27 * len(day_label)
    return [(96, 968), (1884 - w, 968)]
EXTRA_CASES = [
"""    case 'accordion': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-45} width={140} height={90} rx={8} fill="#D96A5F" stroke="#161616" strokeWidth={5} /><path d="M -35 -45 V 45 M 0 -45 V 45 M 35 -45 V 45" stroke="#161616" strokeWidth={3} /><rect x={-84} y={-30} width={14} height={60} rx={5} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={70} y={-30} width={14} height={60} rx={5} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /></g>);""",
"""    case 'alarm_bell': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -52 28 Q -52 -42 0 -42 Q 52 -42 52 28 Z" fill="#E8C86A" stroke="#161616" strokeWidth={5} /><rect x={-58} y={28} width={116} height={10} rx={5} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><circle cx={0} cy={48} r={9} fill="#161616" /><path d="M -52 -30 L -72 -52 M 52 -30 L 72 -52" stroke="#161616" strokeWidth={5} strokeLinecap="round" /></g>);""",
"""    case 'balance_scale': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M 0 -70 V 62 M -28 62 H 28" stroke="#161616" strokeWidth={6} strokeLinecap="round" /><g transform={`rotate(${(extra.tilt as number) || 0})`}><path d="M -85 -52 H 85" stroke="#161616" strokeWidth={6} strokeLinecap="round" /><path d="M -85 -52 L -105 -18 M -85 -52 L -65 -18 M 85 -52 L 65 -18 M 85 -52 L 105 -18" stroke="#161616" strokeWidth={4} /><path d="M -108 -18 Q -85 16 -62 -18 Z" fill="#C97A8C" stroke="#161616" strokeWidth={4} /><path d="M 62 -18 Q 85 16 108 -18 Z" fill="#C97A8C" stroke="#161616" strokeWidth={4} /></g>{((extra.left as string) || '').split('\\n').map((ln, i) => (<text key={i} x={-85} y={82 + i * 26} textAnchor="middle" fontFamily={FONT.hand} fontSize={24} fill="#F6EFE3">{ln}</text>))}{((extra.right as string) || '').split('\\n').map((ln, i) => (<text key={i} x={85} y={82 + i * 26} textAnchor="middle" fontFamily={FONT.hand} fontSize={24} fill="#F6EFE3">{ln}</text>))}</g>);""",
"""    case 'ball_game': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-10} cy={0} r={46} fill="#D96A5F" stroke="#161616" strokeWidth={5} /><path d="M -52 -10 Q -10 10 32 -10 M -40 34 Q -10 12 28 34" stroke="#161616" strokeWidth={4} fill="none" /><path d="M -78 -40 Q -92 -10 -78 20 M -92 -52 Q -108 -14 -92 26" stroke="#F6EFE3" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} /><path d="M 62 -52 V 10" stroke="#161616" strokeWidth={5} /><ellipse cx={78} cy={12} rx={26} ry={8} fill="none" stroke="#E8C86A" strokeWidth={5} /></g>);""",
"""    case 'bdnf': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -50 -18 L 40 -28 M -50 -18 L 0 34 M 40 -28 L 0 34" stroke="#F6EFE3" strokeWidth={4} /><circle cx={-50} cy={-18} r={18} fill="#7FA97A" stroke="#161616" strokeWidth={4} /><circle cx={40} cy={-28} r={14} fill="#E8C86A" stroke="#161616" strokeWidth={4} /><circle cx={0} cy={34} r={16} fill="#608EAA" stroke="#161616" strokeWidth={4} /><circle cx={-50} cy={-18} r={5} fill="#161616" /><circle cx={40} cy={-28} r={4} fill="#161616" /><circle cx={0} cy={34} r={5} fill="#161616" /></g>);""",
"""    case 'bed': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-95} y={-6} width={190} height={22} rx={4} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><rect x={-95} y={-28} width={190} height={24} rx={6} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={-88} y={-50} width={52} height={24} rx={8} fill="#FFFFFF" stroke="#161616" strokeWidth={4} /><rect x={-10} y={-28} width={105} height={24} fill="#608EAA" stroke="#161616" strokeWidth={4} /><rect x={-88} y={16} width={8} height={22} fill="#161616" /><rect x={80} y={16} width={8} height={22} fill="#161616" /></g>);""",
"""    case 'bench': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-90} y={-58} width={180} height={14} rx={4} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><rect x={-90} y={-14} width={180} height={16} rx={4} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><rect x={-82} y={2} width={10} height={52} fill="#161616" /><rect x={72} y={2} width={10} height={52} fill="#161616" /></g>);""",
"""    case 'book': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -90 -40 Q -45 -58 0 -40 L 0 40 Q -45 22 -90 40 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M 90 -40 Q 45 -58 0 -40 L 0 40 Q 45 22 90 40 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -72 -24 H -16 M -72 -6 H -16 M -72 12 H -16 M 16 -24 H 72 M 16 -6 H 72 M 16 12 H 72" stroke="#4A4438" strokeWidth={3} strokeLinecap="round" /></g>);""",
"""    case 'brain_pair': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><Brain x={-58} y={0} s={0.62} t={t} /><Brain x={58} y={0} s={0.62} t={t} /></g>);""",
"""    case 'brain_scan': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -62 62 L -62 -10 Q -62 -62 0 -62 Q 62 -62 62 -10 L 62 62" fill="none" stroke="#F6EFE3" strokeWidth={5} /><Brain x={0} y={-8} s={0.55} t={t} /><path d="M -62 -62 H 62 M -62 -30 H 62 M -62 2 H 62" stroke="#E91E63" strokeWidth={3} opacity={0.55} /></g>);""",
"""    case 'breathalyzer': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-45} y={-20} width={90} height={55} rx={10} fill="#3E8C86" stroke="#161616" strokeWidth={4} /><rect x={-30} y={-8} width={34} height={20} rx={4} fill="#161616" /><text x={-13} y={8} fontFamily={FONT.hand} fontSize={18} fill="#9BEFB0">0.00</text><path d="M 45 -12 L 78 -34" stroke="#161616" strokeWidth={6} strokeLinecap="round" /><circle cx={82} cy={-38} r={8} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /></g>);""",
"""    case 'brick_wall': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-110} y={-70} width={220} height={140} rx={6} fill="#7A4A42" stroke="#161616" strokeWidth={5} /><path d="M -110 -24 H 110 M -110 24 H 110 M -55 -70 V -24 M 0 -24 V 24 M 55 -70 V -24 M -55 24 V 70" stroke="#5A322C" strokeWidth={4} /></g>);""",
"""    case 'car': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -95 30 L -95 0 Q -95 -14 -78 -16 L -58 -16 L -40 -44 Q -36 -52 -24 -52 L 30 -52 Q 42 -52 48 -42 L 62 -16 L 82 -16 Q 95 -16 95 0 L 95 30 Z" fill="#D96A5F" stroke="#161616" strokeWidth={5} /><rect x={-30} y={-44} width={62} height={28} rx={4} fill="#BFE3F0" stroke="#161616" strokeWidth={4} /><circle cx={-52} cy={30} r={16} fill="#161616" /><circle cx={52} cy={30} r={16} fill="#161616" /><circle cx={-52} cy={30} r={7} fill="#8A8EA6" /><circle cx={52} cy={30} r={7} fill="#8A8EA6" /></g>);""",
"""    case 'chalkboard': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}>{((extra.lines as string[]) || []).map((ln, i) => (<text key={i} x={0} y={-10 + i * 52} textAnchor="middle" fontFamily={FONT.hand} fontSize={52} fill="#EDEFE6">{ln}</text>))}</g>);""",
"""    case 'cigarette': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform="rotate(-24)"><rect x={-70} y={-8} width={120} height={16} rx={8} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={34} y={-8} width={16} height={16} fill="#E8862E" stroke="#161616" strokeWidth={4} /><path d="M 58 -10 Q 74 -34 58 -52 Q 84 -30 66 -58" stroke="#F6EFE3" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} /></g></g>);""",
"""    case 'coffee_cup': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-42} y={-30} width={84} height={66} rx={10} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M 42 -16 Q 66 -16 66 2 Q 66 20 42 20" fill="none" stroke="#161616" strokeWidth={5} /><path d="M -20 -46 Q -28 -62 -18 -74 M 0 -46 Q -8 -64 2 -78 M 20 -46 Q 12 -62 22 -74" stroke="#F6EFE3" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} /><rect x={-42} y={-6} width={84} height={14} fill="#7A4A42" /></g>);""",
"""    case 'comment_box': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-100} y={-58} width={200} height={104} rx={14} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M -60 46 L -40 78 L -28 46 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><circle cx={-68} cy={-28} r={14} fill="#608EAA" stroke="#161616" strokeWidth={4} /><path d="M -40 -34 H 70 M -40 -14 H 70 M -40 6 H 40" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>);""",
"""    case 'cubicles': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-105} y={-50} width={60} height={110} fill="#453C4C" stroke="#161616" strokeWidth={4} /><rect x={-30} y={-50} width={60} height={110} fill="#3A3340" stroke="#161616" strokeWidth={4} /><rect x={45} y={-50} width={60} height={110} fill="#453C4C" stroke="#161616" strokeWidth={4} /><rect x={-105} y={20} width={210} height={10} fill="#8A7A5A" stroke="#161616" strokeWidth={3} /></g>);""",
"""    case 'door_row': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform="translate(-58 0) scale(0.55)"><rect x={-110} y={-180} width={220} height={360} fill="#453C4C" stroke="#1E1824" strokeWidth={6} /><circle cx={88} cy={20} r={12} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} /></g><g transform="translate(58 0) scale(0.55)"><rect x={-110} y={-180} width={220} height={360} fill="#453C4C" stroke="#1E1824" strokeWidth={6} /><circle cx={88} cy={20} r={12} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} /></g></g>);""",
"""    case 'dots': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-52} cy={0} r={13} fill="#F6EFE3" /><circle cx={0} cy={0} r={13} fill="#F6EFE3" /><circle cx={52} cy={0} r={13} fill="#F6EFE3" /></g>);""",
"""    case 'ear': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -30 -52 Q 52 -58 46 6 Q 42 58 -14 52 Q -52 46 -46 4 Q -42 -28 -10 -30 Q 12 -28 12 -4 Q 12 18 -8 16" fill="#E8C8A0" stroke="#161616" strokeWidth={5} strokeLinecap="round" /></g>);""",
"""    case 'food_tray': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><ellipse cx={0} cy={34} rx={100} ry={16} fill="#8A8EA6" stroke="#161616" strokeWidth={4} /><path d="M -62 34 Q -62 -38 0 -38 Q 62 -38 62 34 Z" fill="#C9CDD6" stroke="#161616" strokeWidth={5} /><circle cx={0} cy={-46} r={8} fill="#161616" /><circle cx={-68} cy={34} r={12} fill="#D96A5F" stroke="#161616" strokeWidth={4} /><circle cx={68} cy={34} r={12} fill="#7FA97A" stroke="#161616" strokeWidth={4} /></g>);""",
"""    case 'globe': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={-8} r={56} fill="#608EAA" stroke="#161616" strokeWidth={5} /><ellipse cx={0} cy={-8} rx={56} ry={22} fill="none" stroke="#161616" strokeWidth={3} /><ellipse cx={0} cy={-8} rx={22} ry={56} fill="none" stroke="#161616" strokeWidth={3} /><path d="M -48 -40 Q 0 -8 48 -40" stroke="#7FA97A" strokeWidth={8} fill="none" strokeLinecap="round" /><path d="M 0 48 V 66 M -26 66 H 26" stroke="#161616" strokeWidth={5} strokeLinecap="round" /></g>);""",
"""    case 'graph': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -90 60 H 95 M -90 60 V -60" stroke="#F6EFE3" strokeWidth={5} strokeLinecap="round" /><path d="M -80 30 L -40 10 L 0 22 L 40 -18 L 80 -42" stroke="#E91E63" strokeWidth={5} fill="none" strokeLinecap="round" /><circle cx={-40} cy={10} r={7} fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><circle cx={40} cy={-18} r={7} fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><circle cx={80} cy={-42} r={7} fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><text x={0} y={92} textAnchor="middle" fontFamily={FONT.hand} fontSize={26} fill="#F6EFE3">{(extra.label as string) || ''}</text></g>);""",
"""    case 'heart': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform={`scale(${1 + 0.06 * Math.max(0, Math.sin((t / 30) * (((extra.bpm as number) || 60) / 60) * Math.PI * 2))})`}><path d="M 0 52 Q -78 -6 -52 -52 Q -28 -78 0 -48 Q 28 -78 52 -52 Q 78 -6 0 52 Z" fill="#E91E63" stroke="#161616" strokeWidth={5} /></g></g>);""",
"""    case 'house': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-62} y={-12} width={124} height={76} fill="#D96A5F" stroke="#161616" strokeWidth={5} /><path d="M -78 -12 L 0 -62 L 78 -12 Z" fill="#8A7A5A" stroke="#161616" strokeWidth={5} /><rect x={-16} y={18} width={32} height={46} fill="#453C4C" stroke="#161616" strokeWidth={4} /><rect x={-48} y={4} width={24} height={24} fill="#FFE2B0" stroke="#161616" strokeWidth={4} /></g>);""",
"""    case 'icons_row': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}>{((extra.kinds as string[]) || []).map((k, i) => (<MiniIcon key={i} kind={k} x={(i - 1) * 74} y={0} />))}</g>);""",
"""    case 'key': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-58} cy={0} r={24} fill="#E8C86A" stroke="#161616" strokeWidth={5} /><circle cx={-58} cy={0} r={10} fill="none" stroke="#161616" strokeWidth={4} /><path d="M -34 0 H 78 M 62 0 V 22 M 78 0 V 14" stroke="#161616" strokeWidth={7} strokeLinecap="round" /></g>);""",
"""    case 'magnifier': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-8} cy={-12} r={52} fill="#FFFFFF" opacity={0.16} stroke="#161616" strokeWidth={6} /><text x={-8} y={-2} textAnchor="middle" fontFamily={FONT.hand} fontSize={30} fill="#161616">{(extra.word as string) || ''}</text><path d="M 28 26 L 66 62" stroke="#161616" strokeWidth={10} strokeLinecap="round" /></g>);""",
"""    case 'maze': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-90} y={-60} width={180} height={120} rx={6} fill="#2A2530" stroke="#161616" strokeWidth={5} /><path d="M -60 -60 V 0 H -10 V -30 H 40 V 10 H 70 M -60 30 H 0 V 60 M 30 -60 V -10" stroke="#F6EFE3" strokeWidth={4} fill="none" /></g>);""",
"""    case 'memory_door': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-80} width={140} height={160} rx={6} fill="#453C4C" stroke="#E91E63" strokeWidth={5} /><rect x={-44} y={-52} width={52} height={40} fill="#F2EAD8" stroke="#161616" strokeWidth={3} /><circle cx={44} cy={0} r={8} fill="#E8C86A" stroke="#161616" strokeWidth={3} /><path d="M -70 -80 H 70" stroke="#FFE2B0" strokeWidth={4} opacity={0.8} /></g>);""",
"""    case 'mirror': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-62} y={-70} width={124} height={140} rx={40} fill="#BFE3F0" stroke="#161616" strokeWidth={5} /><path d="M -40 -70 L 10 70 M -10 -70 L 40 70" stroke="#FFFFFF" strokeWidth={10} opacity={0.5} /><rect x={-8} y={70} width={16} height={16} fill="#161616" /></g>);""",
"""    case 'mouth': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -72 0 Q 0 -34 72 0 Q 0 44 -72 0 Z" fill="#8A4A42" stroke="#161616" strokeWidth={5} /><ellipse cx={0} cy={6} rx={34} ry={14} fill="#3A0E0A" /><path d="M -72 0 Q 0 -34 72 0" fill="none" stroke="#161616" strokeWidth={5} /></g>);""",
"""    case 'note': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-80} y={-70} width={160} height={140} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={-80} y={-70} width={160} height={22} fill="#E91E63" opacity={0.85} />{((extra.lines as string[]) || []).map((ln, i) => (<text key={i} x={-64} y={-6 + i * 34} fontFamily={FONT.hand} fontSize={28} fill="#161616">{ln}</text>))}</g>);""",
"""    case 'number_card': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-80} y={-70} width={160} height={140} rx={10} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><text x={0} y={28} textAnchor="middle" fontFamily={FONT.hand} fontSize={96} fill="#161616">{(extra.text as string) || ''}</text></g>);""",
"""    case 'numbers': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><text x={0} y={20} textAnchor="middle" fontFamily={FONT.hand} fontSize={72} fill="#F6EFE3">7  14  21</text></g>);""",
"""    case 'paper_stacks': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-84} y={-52} width={150} height={104} rx={4} fill="#D8D2C0" stroke="#161616" strokeWidth={4} /><rect x={-66} y={-34} width={150} height={104} rx={4} fill="#E8E2CE" stroke="#161616" strokeWidth={4} /><rect x={-48} y={-16} width={150} height={104} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -28 8 H 82 M -28 30 H 82 M -28 52 H 52" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>);""",
"""    case 'photos': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform="rotate(-8)"><rect x={-96} y={-62} width={120} height={104} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -88 18 L -58 -22 L -34 6 L -12 -18 L 16 18 Z" fill="#608EAA" /><circle cx={-4} cy={-44} r={10} fill="#E8C86A" /></g><g transform="rotate(7)" opacity={extra.fade ? 0.55 : 1}><rect x={-16} y={-46} width={120} height={104} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -8 34 L 22 -10 L 46 18 L 68 -6 L 96 34 Z" fill="#7FA97A" /><circle cx={76} cy={-28} r={10} fill="#E8C86A" /></g></g>);""",
"""    case 'picture_frames': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-100} y={-60} width={84} height={100} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><circle cx={-58} cy={-22} r={14} fill="#E8C86A" /><path d="M -92 22 L -66 -8 L -44 14 L -22 -4 L -8 22 Z" fill="#608EAA" /><rect x={16} y={-60} width={84} height={100} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><circle cx={58} cy={-22} r={14} fill="#D96A5F" /><path d="M 24 22 L 50 -8 L 72 14 L 92 22 Z" fill="#7FA97A" /></g>);""",
"""    case 'pocket_watch': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={6} r={54} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M -6 -48 Q 0 -78 26 -72" fill="none" stroke="#161616" strokeWidth={5} strokeLinecap="round" /><circle cx={28} cy={-70} r={7} fill="#E8C86A" stroke="#161616" strokeWidth={3} /><path d="M 0 6 L 0 -26 M 0 6 L 22 18" stroke="#161616" strokeWidth={5} strokeLinecap="round" /><circle cx={0} cy={6} r={5} fill="#161616" /></g>);""",
"""    case 'radio_dial': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-95} y={-48} width={190} height={96} rx={10} fill="#8A5A3A" stroke="#161616" strokeWidth={5} /><circle cx={-58} cy={0} r={26} fill="#2A2530" stroke="#161616" strokeWidth={4} /><circle cx={-58} cy={0} r={10} fill="#E8C86A" /><rect x={10} y={-28} width={64} height={18} rx={4} fill="#FFE2B0" stroke="#161616" strokeWidth={3} /><path d="M 74 -48 L 96 -78" stroke="#161616" strokeWidth={4} strokeLinecap="round" /><text x={0} y={78} textAnchor="middle" fontFamily={FONT.hand} fontSize={26} fill="#F6EFE3">{(extra.label as string) || ''}</text></g>);""",
"""    case 'recap_board': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-105} y={-70} width={210} height={140} rx={8} fill="#2A2530" stroke="#4A4438" strokeWidth={4} />{[0, 1, 2].map((i) => (<g key={i}><path d={`M -88 ${-40 + i * 40} L -76 ${-28 + i * 40} L -60 ${-48 + i * 40}`} stroke="#E91E63" strokeWidth={5} fill="none" strokeLinecap="round" /><path d={`M -44 ${-34 + i * 40} L 88 ${-34 + i * 40}`} stroke="#EFE2CC" strokeWidth={4} strokeLinecap="round" /></g>))}</g>);""",
"""    case 'recovery_road': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -110 70 L -28 -60 H 28 L 110 70 Z" fill="#453C4C" stroke="#161616" strokeWidth={5} /><path d="M -8 60 L -3 -44 M 3 -44 L 8 60" stroke="#FFE2B0" strokeWidth={5} strokeDasharray="14 12" /><circle cx={72} cy={-52} r={20} fill="#FFE2B0" stroke="#161616" strokeWidth={4} /></g>);""",
"""    case 'road_sign': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M 0 -10 V 78" stroke="#161616" strokeWidth={8} strokeLinecap="round" /><rect x={-95} y={-72} width={190} height={64} rx={10} fill="#608EAA" stroke="#161616" strokeWidth={5} />{((extra.text as string) || '').split('\\n').map((ln, i) => (<text key={i} x={0} y={-44 + i * 26} textAnchor="middle" fontFamily={FONT.hand} fontSize={24} fill="#F6EFE3">{ln}</text>))}</g>);""",
"""    case 'rope': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -60 20 Q -60 -60 0 -60 Q 60 -60 60 20 Q 60 60 0 60 Q -60 60 -60 20" fill="none" stroke="#C9A86A" strokeWidth={10} /><path d="M -36 20 Q -36 -36 0 -36 Q 36 -36 36 20 Q 36 36 0 36 Q -36 36 -36 20" fill="none" stroke="#C9A86A" strokeWidth={10} /><path d="M -12 20 Q -12 -12 0 -12 Q 12 -12 12 20" fill="none" stroke="#C9A86A" strokeWidth={10} /></g>);""",
"""    case 'scanner': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-100} y={-40} width={200} height={80} rx={8} fill="#8A8EA6" stroke="#161616" strokeWidth={5} /><rect x={-88} y={-28} width={176} height={44} rx={4} fill="#BFE3F0" stroke="#161616" strokeWidth={3} /><rect x={-88} y={-12} width={176} height={8} fill="#E91E63" opacity={0.85} /><circle cx={78} cy={-56} r={8} fill="#9BEFB0" stroke="#161616" strokeWidth={3} /></g>);""",
"""    case 'scissors': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -70 -40 L 70 40 M -70 40 L 70 -40" stroke="#C9CDD6" strokeWidth={10} strokeLinecap="round" /><circle cx={-78} cy={-46} r={16} fill="none" stroke="#161616" strokeWidth={6} /><circle cx={-78} cy={46} r={16} fill="none" stroke="#161616" strokeWidth={6} /><circle cx={0} cy={0} r={7} fill="#161616" /></g>);""",
"""    case 'speech_bubble': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-130} y={-70} width={260} height={100} rx={40} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M -40 30 L -58 66 L -12 30 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} />{((extra.lines as string[]) || []).map((ln, i) => (<text key={i} x={0} y={-28 + i * 36} textAnchor="middle" fontFamily={FONT.hand} fontSize={30} fill="#161616">{ln}</text>))}</g>);""",
"""    case 'stamp': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-50} width={140} height={100} rx={6} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={-54} y={-34} width={108} height={68} fill="#608EAA" stroke="#161616" strokeWidth={3} /><circle cx={0} cy={0} r={26} fill="none" stroke="#E91E63" strokeWidth={4} /><text x={0} y={8} textAnchor="middle" fontFamily={FONT.hand} fontSize={22} fill="#E91E63">INKL</text></g>);""",
"""    case 'stopwatch': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={8} r={52} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><rect x={-8} y={-58} width={16} height={14} rx={4} fill="#161616" /><path d="M 0 8 L 0 -24 M 0 8 L 24 22" stroke="#161616" strokeWidth={5} strokeLinecap="round" /><circle cx={0} cy={8} r={5} fill="#161616" />{[0, 1, 2, 3].map((i) => { const a = (i * 90 * Math.PI) / 180; return (<line key={i} x1={Math.cos(a) * 42} y1={8 + Math.sin(a) * 42} x2={Math.cos(a) * 48} y2={8 + Math.sin(a) * 48} stroke="#161616" strokeWidth={4} strokeLinecap="round" />); })}</g>);""",
"""    case 'street_sign': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M 0 -6 V 78" stroke="#161616" strokeWidth={8} strokeLinecap="round" /><rect x={-85} y={-64} width={170} height={58} rx={10} fill="#3E8C86" stroke="#161616" strokeWidth={5} />{extra.face ? (<g><circle cx={-28} cy={-38} r={6} fill="#161616" /><circle cx={28} cy={-38} r={6} fill="#161616" /><path d="M -20 -18 Q 0 -6 20 -18" stroke="#161616" strokeWidth={4} fill="none" strokeLinecap="round" /></g>) : (<g><path d="M -60 -46 H 60 M -60 -28 H 60" stroke="#F6EFE3" strokeWidth={4} strokeLinecap="round" /></g>)}</g>);""",
"""    case 'sun': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={0} r={40} fill="#FFE2B0" stroke="#161616" strokeWidth={5} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i * 45 * Math.PI) / 180; return (<line key={i} x1={Math.cos(a) * 52} y1={Math.sin(a) * 52} x2={Math.cos(a) * 70} y2={Math.sin(a) * 70} stroke="#FFE2B0" strokeWidth={6} strokeLinecap="round" />); })}</g>);""",
"""    case 'sun_moon': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}>{((extra.mode as string) || 'both') === 'crossed' ? (<g><circle cx={0} cy={0} r={40} fill="#FFE2B0" stroke="#161616" strokeWidth={5} /><path d="M -34 -34 L 34 34 M 34 -34 L -34 34" stroke="#E91E63" strokeWidth={8} strokeLinecap="round" /></g>) : (<g><circle cx={-42} cy={0} r={30} fill="#FFE2B0" stroke="#161616" strokeWidth={5} /><path d="M 52 -34 Q 18 0 52 34 Q 84 0 52 -34 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /></g>)}</g>);""",
"""    case 'tally': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -72 -30 V 30 M -40 -30 V 30 M -8 -30 V 30 M 24 -30 V 30 M -84 -26 L 36 26" stroke="#F6EFE3" strokeWidth={6} strokeLinecap="round" /><text x={0} y={66} textAnchor="middle" fontFamily={FONT.hand} fontSize={26} fill="#F6EFE3">{(extra.label as string) || ''}</text></g>);""",
"""    case 'test_paper': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-70} width={140} height={140} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -50 -44 H 50 M -50 -22 H 50 M -50 0 H 50 M -50 22 H 20" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /><path d="M 28 8 L 48 28 M 48 8 L 28 28" stroke="#E91E63" strokeWidth={6} strokeLinecap="round" /><path d="M -50 44 L -40 54 L -24 36" stroke="#2A7A4A" strokeWidth={5} fill="none" strokeLinecap="round" /></g>);""",
"""    case 'whisper_walls': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-105} y={-60} width={210} height={120} rx={6} fill="#453C4C" stroke="#161616" strokeWidth={5} /><g stroke="#F6EFE3" strokeWidth={5} fill="none" strokeLinecap="round"><path d="M -30 -20 Q -12 0 -30 20 M -8 -30 Q 14 0 -8 30 M 16 -20 Q 34 0 16 20" /></g><circle cx={68} cy={0} r={16} fill="#E8C8A0" stroke="#161616" strokeWidth={4} /></g>);""",
"""    case 'zzz': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><text x={-60} y={30} fontFamily={FONT.hand} fontSize={52} fill="#F6EFE3">Z</text><text x={-6} y={-2} fontFamily={FONT.hand} fontSize={40} fill="#F6EFE3">z</text><text x={38} y={-30} fontFamily={FONT.hand} fontSize={30} fill="#F6EFE3">z</text></g>);""",
]


def emit():
    if not check():
        print('\nREFUSING TO EMIT: fix the cast first (see problems above).')
        return 1
    specs, scenes, ep, looks, exprs = load()
    shots = {s['id']: s for s in ep['shots']}
    layout_report = []  # one entry per shot: chip box, prop + label screen boxes (see layout mode)
    lines = []
    lines.append("import React from 'react';")
    lines.append("import {")
    lines.append("  Hero, Pose, basePose, poseAt, faceAt, kf, camT, LOOKS, Foreground, HudChip, TitleCard,")
    lines.append("  WallCalendar, WallClock, Cell, cellStand, Cave, Antarctic, Lab, Classroom, Exterior, Stage,")
    lines.append("  FONT, ShotProps, joints, toWorld, Magnifier, EndCard,")
    lines.append("} from '../../engine';")
    lines.append("")
    lines.append("// \"You're Trapped for 30 Days — What It Does to Your Brain\" — 159 shots, one per scene,")
    lines.append("// generated from the verified puppet specs (scenes/zenn_003_v2_specs.json) by")
    lines.append("// /tmp/zenn003_gen_shots.py. Every shot is a pure function of its own clock t; each is")
    lines.append("// right at its `key` frame first. Review the generated code, then verify on the board.")
    lines.append("// DAY X is a HudChip readout (never a caption); scene labels are screen-space hand text.")
    lines.append("// S159 is the voiceless end card (EndCard, same as video #2 S182) — appended after the")
    lines.append("// specs loop; it has no puppet spec and no edit cue of its own (edit '+131' + end f:15960).")
    lines.append("")
    lines.append(f"const PINK = '{PINK}';")
    lines.append(f"const CREAM = '{CREAM}';")
    lines.append("")
    lines.append("const DayChip: React.FC<{ t: number; day: string; x?: number; y?: number }> = ({ t, day, x = 96, y = 112 }) => (")
    lines.append("  <HudChip x={x} y={y} f={t} label={day} icon=\"dot\" />")
    lines.append(");")
    lines.append("")
    lines.append("const QMark: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (")
    lines.append("  <text x={x} y={y} textAnchor=\"middle\" fontFamily={FONT.hand} fontSize={200 * s} fill={PINK}>?</text>")
    lines.append(");")
    lines.append("")
    lines.append("const SoundWaves: React.FC<{ x: number; y: number; s?: number; mode?: string }> = ({ x, y, s = 1, mode = 'wavy' }) => (")
    lines.append("  <g stroke={CREAM} strokeWidth={7 * s} fill=\"none\" strokeLinecap=\"round\" opacity={0.9}>")
    lines.append("    {/* flatline sits 70u below the prop's y: at y it coincides with the Cell set's lamp bar and vanishes into the glow (S56). */}")
    lines.append("    {mode === 'flatline' ? (<path d={`M ${x - 50 * s} ${y + 70 * s} H ${x + 50 * s}`} />) : ([0, 1, 2].map((i) => (")
    lines.append("      <path key={i} d={`M ${x + (14 + i * 20) * s} ${y - (26 - i * 8) * s} Q ${x + (34 + i * 22) * s} ${y} ${x + (14 + i * 20) * s} ${y + (26 - i * 8) * s}`} />")
    lines.append("    )))}")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("const Brain: React.FC<{ x: number; y: number; s?: number; t?: number; bpm?: number }> = ({ x, y, s = 1, t = 0, bpm = 0 }) => {")
    lines.append("  const beat = bpm > 0 ? 1 + 0.07 * Math.max(0, Math.sin((t / 30) * (bpm / 60) * Math.PI * 2)) : 1;")
    lines.append("  return (")
    lines.append("    <g transform={`translate(${x} ${y}) scale(${s * beat})`}>")
    lines.append("      <path d=\"M -70 10 Q -78 -52 -20 -58 Q 4 -78 30 -56 Q 74 -52 66 4 Q 62 44 20 48 Q -40 52 -70 10 Z\" fill=\"#E8A0B0\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("      <path d=\"M -40 -30 Q -20 -18 -34 4 M -6 -44 Q 6 -24 -8 0 M 30 -36 Q 44 -16 30 8\" stroke=\"#C97A8C\" strokeWidth={5} fill=\"none\" strokeLinecap=\"round\" />")
    lines.append("    </g>")
    lines.append("  );")
    lines.append("};")
    lines.append("")
    lines.append("const MiniIcon: React.FC<{ kind: string; x: number; y: number }> = ({ kind, x, y }) => (")
    lines.append("  <g transform={`translate(${x} ${y})`}>")
    lines.append("    {kind === 'clock' ? (<g><circle r={26} fill=\"#F2EAD8\" stroke=\"#161616\" strokeWidth={4} /><path d=\"M 0 0 L 0 -14 M 0 0 L 10 6\" stroke=\"#161616\" strokeWidth={4} strokeLinecap=\"round\" /></g>) : kind === 'bed' ? (<g><rect x={-26} y={-6} width={52} height={16} rx={4} fill=\"#608EAA\" stroke=\"#161616\" strokeWidth={4} /><rect x={-26} y={-18} width={20} height={12} rx={4} fill=\"#F2EAD8\" stroke=\"#161616\" strokeWidth={3} /></g>) : kind === 'voice' ? (<g stroke=\"#F6EFE3\" strokeWidth={5} fill=\"none\" strokeLinecap=\"round\"><path d=\"M -14 -12 Q -4 0 -14 12 M 0 -18 Q 12 0 0 18 M 14 -12 Q 24 0 14 12\" /></g>) : (<circle r={14} fill=\"#E8C86A\" stroke=\"#161616\" strokeWidth={4} />)}")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("const Prop: React.FC<{ kind: string; x: number; y: number; s?: number; t?: number; extra?: Record<string, unknown> }> = ({ kind, x, y, s = 1, t = 0, extra = {} }) => {")
    lines.append("  const dX = ((extra.drift_x as number) || 0) * Math.sin(t / 45);")
    lines.append("  switch (kind) {")
    lines.append("    case 'question_mark': return <QMark x={x} y={y} s={s} />;")
    lines.append("    case 'brain': return <Brain x={x} y={y} s={s} t={t} bpm={(extra.bpm as number) || 0} />;")
    lines.append("    case 'calendar': return <WallCalendar x={x} y={y - 170 * s} w={260 * s} crossed={(extra.crossed as number) || 0} />;")
    lines.append("    case 'wall_clock': return <WallClock x={x} y={y} r={44 * s} t={t} />;")
    lines.append("    case 'sound_waves': return <SoundWaves x={x} y={y} s={s} mode={(extra.mode as string) || 'wavy'} />;")
    lines.append("    case 'lightbulb': return (<g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={-30} r={34} fill=\"#FFE2B0\" stroke=\"#161616\" strokeWidth={5} /><path d=\"M -14 4 L 14 4 L 8 34 L -8 34 Z\" fill=\"#8A7A5A\" stroke=\"#161616\" strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * 60 * Math.PI) / 180; return <path key={i} d={`M ${Math.cos(a) * 48} ${-30 + Math.sin(a) * 48} L ${Math.cos(a) * 64} ${-30 + Math.sin(a) * 64}`} stroke=\"#FFE2B0\" strokeWidth={5} strokeLinecap=\"round\" />; })}</g>);")
    lines.append("    case 'checklist': return (<g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-70} y={-90} width={140} height={180} fill=\"#F2EAD8\" stroke=\"#161616\" strokeWidth={4} />{[0, 1, 2, 3].map((i) => (<g key={i}><path d={`M -52 ${-58 + i * 38} L -40 ${-46 + i * 38} L -24 ${-66 + i * 38}`} stroke=\"#2A7A4A\" strokeWidth={5} fill=\"none\" strokeLinecap=\"round\" /><path d={`M -12 ${-52 + i * 38} L 52 ${-52 + i * 38}`} stroke=\"#4A4438\" strokeWidth={4} strokeLinecap=\"round\" /></g>))}</g>);")
    lines.append("    case 'sign': return (<g transform={`translate(${x} ${y}) scale(${s})`}>{(() => { const lns = ((extra.text as string) || '').split('\\n'); const mw = Math.max(0, ...lns.map((l) => l.length)); const w = Math.max(260, mw * 19 + 48); const h = 28 + lns.length * 44; return (<g><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill=\"#F2EAD8\" stroke=\"#161616\" strokeWidth={5} />{lns.map((ln, i) => (<text key={i} x={0} y={-h / 2 + 32 + i * 44} textAnchor=\"middle\" fontFamily={FONT.hand} fontSize={36} fill=\"#161616\">{ln}</text>))}</g>); })()}</g>);")
    lines.append("    case 'door': return (<g transform={`translate(${x} ${y}) scale(${s})`}>{extra.open_ ? (<g>{/* Nov 12 v14 (Javion: \"look at the door it's glitched\"): the old open_ was a translucent warm wash over the closed slab — a flat tan board that hid the padlock, cut the picture and sat on the bowl. Now a real OPEN doorway: sunlit opening inset in the frame, the door swung open toward the viewer hinged on the right jamb (foreshortened panel, two recessed panels + knob), sunlight spilling on the floor. */}<rect x={-110} y={-180} width={220} height={360} fill=\"#3A3340\" stroke=\"#1E1824\" strokeWidth={6} /><rect x={-98} y={-168} width={196} height={336} fill=\"#FFE9BE\" /><rect x={-78} y={-148} width={156} height={296} fill=\"#FFF6DC\" opacity={0.85} /><polygon points=\"-98,168 98,168 170,330 -170,330\" fill=\"#FFE2B0\" opacity={0.28} /><polygon points=\"-70,168 70,168 120,320 -120,320\" fill=\"#FFE2B0\" opacity={0.3} /><rect x={98} y={-168} width={68} height={336} fill=\"#453C4C\" stroke=\"#1E1824\" strokeWidth={5} /><rect x={108} y={-148} width={48} height={130} fill=\"none\" stroke=\"#332C3A\" strokeWidth={3} /><rect x={108} y={8} width={48} height={130} fill=\"none\" stroke=\"#332C3A\" strokeWidth={3} /><circle cx={156} cy={20} r={10} fill=\"#8A7A5A\" stroke=\"#1E1824\" strokeWidth={4} /></g>) : (<g><rect x={-110} y={-180} width={220} height={360} fill=\"#453C4C\" stroke=\"#1E1824\" strokeWidth={6} /><circle cx={88} cy={20} r={12} fill=\"#8A7A5A\" stroke=\"#1E1824\" strokeWidth={4} /></g>)}</g>);")
    for c in EXTRA_CASES:
        lines.append(c)
    lines.append("    default: return (<g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}><rect x={-110} y={-70} width={220} height={140} rx={8} fill=\"#2A2530\" stroke=\"#4A4438\" strokeWidth={3} />{[0, 1, 2].map((i) => (<path key={i} d={`M -88 ${-34 + i * 34} L ${88 - (i % 2) * 40} ${-34 + i * 34}`} stroke=\"#EFE2CC\" strokeWidth={3} strokeLinecap=\"round\" opacity={0.8} />))}</g>);")
    lines.append("  }")
    lines.append("};")
    lines.append("")

    for n, sp in enumerate(specs):
        sid = f'S{n + 1}'
        meta = shots[sid]
        size = meta['size']
        set_name = meta['set']
        comp, flags = SET_COMP[set_name]
        day = sp['day']
        dn = day_num(day)
        dur_f = round((sp['end'] - sp['start']) * FPS)
        key_f = meta['key']
        chars = sp['characters']
        char_data = [char_keys(c) for c in chars]  # [(keys, facing, n_stretch, max_short)]
        # FRAMING FIX (board self-check, Nov 7): S7's ghost hero stands exactly where the
        # Cell set hangs its wall picture (1300, 520), so the frame lands on his face.
        # Shift the ghost left so the picture clears his head.
        if sid == 'S7' and len(chars) > 1 and chars[1].get('ghost'):
            for _f, _p in char_data[1][0]:
                _p['x'] -= 160
        # camera centre (from the ADJUSTED key poses, so stretch fixes move the frame too)
        # FRAMING FIXES (board self-check, Nov 7):
        # - 'macro insert' used to centre on the first prop only, slicing any character in
        #   the shot in half at the frame edge (S40/S56/S74/S88); and with no characters it
        #   fell back to the wide centre (960, 560) while keeping the 2.4 zoom (S102).
        #   The macro camera now frames the prop AND the characters, fitting both.
        kind, z0, z1 = SIZE_CAM[size]
        if kind == 'prop':
            pts = []  # (cx, cy, half_w, half_h) focal extents to keep inside the frame
            for pr in sp['props']:
                hw, hh = PROP_HALF.get(pr['kind'], (140, 110))
                pts.append((pr['cx'], pr['cy'], hw * pr.get('s', 1.0), hh * pr.get('s', 1.0)))
                if chars:
                    break  # with characters, only the first prop is focal; the rest is dressing
            if chars:
                pk = key_pose(char_data[0][0], key_f)
                sc = chars[0].get('scale', 1.0)
                pts.append((pk['x'], pk['y'] - 176 * sc, 130, 110))
            if pts:
                x0 = min(p[0] - p[2] for p in pts); x1 = max(p[0] + p[2] for p in pts)
                y0 = min(p[1] - p[3] for p in pts); y1 = max(p[1] + p[3] for p in pts)
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                z0 = max(1.4, min(z0, 1800 / max(x1 - x0, 1), 960 / max(y1 - y0, 1)))
                z1 = z0 + 0.1
            else:
                cx, cy = 960, 520
        elif kind == 'wide':
            cx, cy = 960, 560
        elif not chars:
            # No hero in the shot — the room-centre default (960, 560) lands a zoomed
            # size on empty wall and slices the props (S115: picture frames' tops cut).
            # Centre on the first prop instead, fitting the zoom to it. Wide sizes
            # (z0 < 2) keep the room centre: their content is the room itself (S10's
            # door, S39's beds). S123's two-calendar comparison is a 'macro insert'
            # (episode.json), so the 'prop' branch above fits both.
            if sp['props'] and z0 >= 2.0:
                pr0 = sp['props'][0]
                hw0, hh0 = PROP_HALF.get(pr0['kind'], (140, 110))
                cx, cy = pr0['cx'], pr0['cy']
                z0 = max(1.4, min(z0, 1800 / max(2 * hw0 * pr0.get('s', 1.0), 1), 960 / max(2 * hh0 * pr0.get('s', 1.0), 1)))
                z1 = z0 + 0.1
            else:
                cx, cy = 960, 560
        elif kind == 'hero':
            pk = key_pose(char_data[0][0], key_f)
            cx, cy = pk['x'], pk['y'] - 60
        elif kind == 'head':
            pk = key_pose(char_data[0][0], key_f)
            cx, cy = pk['x'], pk['y'] - 176 * chars[0].get('scale', 1.0)
        elif kind == 'mid':
            xs = [key_pose(cd[0], key_f)['x'] for cd in char_data]
            cx, cy = sum(xs) / len(xs), 580
        else:
            cx, cy = 960, 560
        # over-the-shoulder needs two characters; otherwise fall back to medium
        ots = size == 'over-the-shoulder' and len(chars) >= 2
        eff_size = size if (size != 'over-the-shoulder' or ots) else 'medium'
        if eff_size != size:
            kind, z0, z1 = SIZE_CAM['medium']
            pk = key_pose(char_data[0][0], key_f)
            cx, cy = pk['x'], pk['y'] - 60
        # FRAMING FIX (board v6): a close-up's zoom can exceed a focal prop's size —
        # S139's wall calendar is 340 world units tall but the 3.35x close-up only
        # shows 322, so the calendar's top was cut through its header and its right
        # edge ran off-frame. Cap the zoom so every prop in the shot fits the frame
        # (with margin). The cap only bites when a prop is genuinely too big for the
        # zoom — wide/medium shots and small props are untouched.
        if sp['props']:
            for pr in sp['props']:
                hw, top, bot = prop_box(pr)
                # +48, not +32: the pull-in below only fires when the prop is
                # strictly smaller than the visible frame minus 32 — at exactly
                # +32 it skips and the prop stays at its spec position (S139's
                # calendar sat at y=460 through the first cap). The extra 16
                # leaves the pull-in a real range to clamp into.
                cap = min(1080 / (top + bot + 48), 1920 / (2 * hw + 48))
                if z1 > cap:
                    z1 = max(1.4, cap)
                    z0 = min(z0, z1 - 0.15)
        # set element
        t_off = 40 + n * 37
        if comp == 'Cell':
            set_el = f'<Cell t={{t + {t_off}}} id="s{n + 1}" veil={{{0.28 if size == "wide" else 0.44}}}{flags} day={{{dn}}} />'
        elif comp == 'Exterior':
            set_el = f'<Exterior t={{t + {t_off}}} id="s{n + 1}" doorOpen={{{"true" if dn >= 30 else "false"}}} />'
        elif comp == 'Classroom':
            # The Classroom set draws its own board ("7 x 8 = ?"). A chalkboard prop
            # carries the lesson's own equation — feed it into the set's `board` slot
            # instead of drawing a second board on top of it (S52). The prop is skipped
            # in the prop loops below.
            _cb = next((p for p in sp['props'] if p['kind'] == 'chalkboard'), None)
            if _cb:
                # The board's writing area is x 426-1054, y 196-524 — but the camera may
                # show only a strip of it (S52: only y 388-524 is visible, so a fixed
                # y=330 put the text above the frame and it vanished). Centre the text
                # in the VISIBLE strip, sized to fit it, x clamped to the visible board.
                _vt = max(196, cy - 540 / z1)
                _vb = min(524, cy + 540 / z1)
                _by = (_vt + _vb) / 2
                _bs = max(40, min(104, (_vb - _vt) * 0.45))
                _lns = _cb.get('lines', [])
                _tw = max((len(ln) for ln in _lns), default=0) * _bs * 0.5
                _bx = min(max(740, cx - 960 / z1 + _tw + 16), cx + 960 / z1 - _tw - 16)
                _bx = min(max(_bx, 426 + _tw + 8), 1054 - _tw - 8)
                _lh = _bs * 0.9
                _y0 = _by + _bs * 0.35 - (len(_lns) - 1) * _lh / 2
                _lines = ''.join(
                    f'<text x={{{_bx}}} y={{{_y0 + i * _lh}}} textAnchor="middle" fontFamily={{FONT.hand}} fontSize={{{_bs}}} fill="#EDEFE6" opacity={{0.92}}>{_esc(ln)}</text>'
                    for i, ln in enumerate(_lns))
                set_el = f'<Classroom t={{t + {t_off}}} id="s{n + 1}" board={{(<g>{_lines}</g>)}} />'
            else:
                set_el = f'<Classroom t={{t + {t_off}}} id="s{n + 1}" />'
        else:
            set_el = f'<{comp} t={{t + {t_off}}} id="s{n + 1}" />'
        # title-card scenes
        title = sp.get('title')
        lines.append(f"// ---------- {sid}: {size}, {set_name} — {sp['chapter']} ({day}) ----------")
        lines.append(f"export const {sid}: React.FC<ShotProps> = ({{ t, len }}) => {{")
        # character poses
        for ci, c in enumerate(chars):
            role = c['id']
            look = ROLE_LOOK[role]
            pk, facing, _, _ = char_data[ci]
            fk = face_keys(c)
            base = pk[0][1]
            lines.append(f"  const p{ci} = poseAt(t, [")
            for f, p in pk:
                lines.append(f"    {{ f: {f}, p: {js_pose(p)} }},")
            lines.append("  ]);")
            fk_str = ', '.join('[%d, %s]' % (f, repr(e)) for f, e in fk)
            lines.append(f"  const f{ci} = faceAt(t, [{fk_str}]);")
            ghost = c.get('ghost', False)
            rim = 'rimInkl' if look in ('detective', 'jake') else 'rimInkl'
            lines.append(f"  const hero{ci} = <Hero look={{LOOKS.{look}}} pose={{{{ ...p{ci}, ...f{ci}, facing: {facing} }}}} rimId=\"{rim}\" shadow={{1}} />;")
            if ghost:
                lines.append(f"  const hero{ci}G = <g opacity={{0.35}}>{{hero{ci}}}</g>;")
        # the Detective's magnifying glass follows his right hand exactly
        # (joints + toWorld — the #2 pattern); S1: Detective is chars[0],
        # S158: chars[1] (hero first).
        if sid in GLASS_SHOTS:
            di = next(i for i, c in enumerate(chars) if c['id'] == 'detective')
            lines.append(f"  const mg = toWorld(p{di}, joints(p{di}).armR.end);")
        # camera
        lines.append(f"  const camX = kf(t, [[0, {fmt(cx)}], [len, {fmt(cx)}]]);")
        lines.append(f"  const camY = kf(t, [[0, {fmt(cy)}], [len, {fmt(cy)}]]);")
        lines.append(f"  const zoom = kf(t, [[0, {z0}], [len, {z1}]]);")
        lines.append("  return (")
        lines.append("    <g>")
        lines.append("      <g transform={camT(camX, camY, zoom)}>")
        lines.append(f"        {set_el}")
        # FRAMING FIX (board self-check, Nov 7): a prop placed for the wide puppet
        # frame gets sliced at the edge when the Remotion shot zooms in (S26's calendar
        # lost its right columns, S12's its left, S23/S31/S103's tops were clipped).
        # Pull any prop whose box would cross the visible frame inward until it fits
        # (16px margin); a prop too big to fit stays where the spec put it.
        # world-space head centres (hx, hy, scale), for the front-layer
        # face-collision check in _fit_prop below (S15: a sign pulled into the
        # frame landed on the Detective's face).
        head_boxes_w = []
        for _cd, _c in zip(char_data, chars):
            _pk = key_pose(_cd[0], key_f)
            _sc = _c.get('scale', 1.0)
            head_boxes_w.append((_pk['x'], _pk['y'] - 176 * _sc, _sc))
        def _fit_prop(pr):
            # FRAMING FIX (board v6, Nov 7): the v5 pull-in clamped props to the visible
            # frame but ignored the screen-space DAY chip (top-left) — S15's sign was
            # pushed to the frame's top edge, right under the chip, and S59's bubble
            # sat under it. It also used symmetric half-extents for the "?" (S141: the
            # glyph ascends ~180 above its baseline, so the pull-in put its top
            # off-frame). prop_box() gives the true drawn box (half-width, above,
            # below); every prop's screen box must clear the chip at BOTH zooms.
            # If no clear in-frame spot exists for the prop, return chip_ok=False and
            # the caller moves the chip instead — the HUD moves, the story does not.
            pcx, pcy = pr['cx'], pr['cy']
            hw, top, bot = prop_box(pr)
            vx0, vx1 = cx - 960 / z1, cx + 960 / z1
            vy0, vy1 = cy - 540 / z1, cy + 540 / z1
            if 2 * hw < (vx1 - vx0) - 32:
                pcx = min(max(pcx, vx0 + hw + 16), vx1 - hw - 16)
            if top + bot < (vy1 - vy0) - 32:
                pcy = min(max(pcy, vy0 + top + 16), vy1 - bot - 16)
            # FRAMING FIX (board self-check, Nov 7): a FRONT-layer prop pulled into
            # the frame can land on a character's face (S15: the sign covered the
            # Detective's eyes and cap). No front-layer prop may cover a face point
            # (face centre, eyes, mouth, head top). Try nudging it past the head
            # (left / right / up / down); if no clear in-frame spot exists, leave
            # it at its spec position — off-frame beats face-covering. Back-layer
            # props are exempt: a character standing in front of one is natural
            # depth (S139's calendar behind the hero's head is fine). Speech
            # bubbles are exempt too: they are drawn to sit beside a face, and
            # their rounded-rect + tail shape over-reads as a box (S59's bubbles
            # were falsely flagged and hidden by the fallback) — the frame
            # pull-in above still keeps them in-frame, and the board check
            # verifies they sit clear of the face.
            if pr.get('layer') != 'back' and pr['kind'] != 'speech_bubble' and head_boxes_w:
                def _covers_face(x, y):
                    for (hx, hy, sc) in head_boxes_w:
                        for (fx, fy) in ((hx, hy), (hx - 35 * sc, hy - 30 * sc),
                                         (hx + 35 * sc, hy - 30 * sc), (hx, hy + 45 * sc),
                                         (hx, hy - 85 * sc)):
                            if x - hw <= fx <= x + hw and y - top <= fy <= y + bot:
                                return True
                    return False
                if _covers_face(pcx, pcy):
                    placed = False
                    for (hx, hy, sc) in head_boxes_w:
                        hbw, hbh = 130 * sc, 110 * sc
                        cands = [(hx - hbw - hw - 16, pcy), (hx + hbw + hw + 16, pcy),
                                 (pcx, hy - hbh - top - 16), (pcx, hy + hbh + bot + 16)]
                        for (nx, ny) in cands:
                            if (vx0 + hw + 16 <= nx <= vx1 - hw - 16 and
                                    vy0 + top + 16 <= ny <= vy1 - bot - 16 and
                                    not _covers_face(nx, ny)):
                                pcx, pcy = nx, ny
                                placed = True
                                break
                        if placed:
                            break
                    if not placed:
                        pcx, pcy = pr['cx'], pr['cy']
            # CHIP KEEP-OUT (board v6): the DAY chip is screen-space top-left; a
            # prop whose screen box reaches it collides with the readout. Try
            # nudging the prop clear (down / right / up / down, minimal shift + 8px);
            # a nudge must stay in-frame, clear of the chip at both zooms, and must
            # not put the prop over a head (circle check — the 5-point check misses
            # a big prop's corner on a big head, which is exactly S59's bubble).
            # Back-layer props are exempt from the head check (the character is
            # drawn in front of them, so they can never cover a face).
            cb = chip_box(day)
            def _clear_chip(x, y):
                return not any(_hit(_screen_box(x, y, hw, top, bot, cx, cy, z), cb)
                               for z in (z0, z1))
            def _covers_head_circle(x, y):
                for (hx, hy, sc) in head_boxes_w:
                    r = 90 * sc + 8
                    qx = min(max(hx, x - hw), x + hw)
                    qy = min(max(hy, y - top), y + bot)
                    if (hx - qx) ** 2 + (hy - qy) ** 2 < r * r:
                        return True
                return False
            chip_ok = _clear_chip(pcx, pcy)
            if not chip_ok:
                cands = [
                    (pcx, math.ceil(max(cy + (cb[3] + 8 - 540) / z + top for z in (z0, z1)))),
                    (math.ceil(max(cx + (cb[2] + 8 - 960) / z + hw for z in (z0, z1))), pcy),
                    (pcx, math.floor(min(cy + (cb[1] - 8 - 540) / z - bot for z in (z0, z1)))),
                    (math.floor(min(cx + (cb[0] - 8 - 960) / z - hw for z in (z0, z1))), pcy),
                ]
                for (nx, ny) in cands:
                    if not (vx0 + hw + 16 <= nx <= vx1 - hw - 16 and
                            vy0 + top + 16 <= ny <= vy1 - bot - 16):
                        continue
                    if pr.get('layer') != 'back' and head_boxes_w and _covers_head_circle(nx, ny):
                        continue
                    if _clear_chip(nx, ny):
                        pcx, pcy = nx, ny
                        chip_ok = True
                        break
            return pcx, pcy, chip_ok
        # Fit all props first (positions + chip_ok), then decide the chip, then
        # emit in draw order. The chip decision needs every prop's screen box and
        # every label's box, so it cannot be made while emitting props one by one.
        def _prop_el(pr, pcx, pcy):
            extra = {k: v for k, v in pr.items() if k not in ('kind', 'cx', 'cy', 's', 'layer')}
            return (f"        <Prop kind=\"{pr['kind']}\" x={{{fmt(pcx)}}} y={{{fmt(pcy)}}}"
                    f" s={{{fmt(pr.get('s', 1.0))}}} t={{t}} extra={{{json.dumps(extra)}}} />")
        back_fitted, front_fitted = [], []
        for pr in sp['props']:
            if pr.get('layer') == 'back' and not (pr['kind'] == 'chalkboard' and comp == 'Classroom'):
                pcx, pcy, ok = _fit_prop(pr)
                back_fitted.append((pr, pcx, pcy, ok))
            elif pr.get('layer') != 'back' and not (pr['kind'] == 'chalkboard' and comp == 'Classroom'):
                pcx, pcy, ok = _fit_prop(pr)
                front_fitted.append((pr, pcx, pcy, ok))
        # FRAMING FIX (board self-check, Nov 7): screen-space labels are placed blind —
        # S140's "WEEK 1 · WEEK 2" landed across the hero's face. Nudge any label whose
        # box overlaps a character's head box at the key frame up until it clears.
        head_boxes = []
        for cd, c in zip(char_data, chars):
            pk = key_pose(cd[0], key_f)
            sc = c.get('scale', 1.0)
            hx = 960 + (pk['x'] - cx) * z1
            hy = 540 + (pk['y'] - 176 * sc - cy) * z1
            head_boxes.append((hx - 130, hx + 130, hy - 110, hy + 110))
        label_placed = []
        for lb in sp['labels']:
            lx, ly = lb['x'], lb['y']
            hw = max(len(lb['text']) * lb['size'] * 0.32, 40)
            hh = lb['size'] * 0.6
            for _ in range(2):
                hit = any(lx - hw < bx1 and lx + hw > bx0 and ly - hh < by1 and ly + hh > by0
                          for (bx0, bx1, by0, by1) in head_boxes)
                if not hit:
                    break
                ly -= 150
            label_placed.append((lb, lx, ly, hw, hh))
        # CHIP PLACEMENT (board v6): default top-left. If any prop could not be nudged
        # clear of the chip, move the chip to a clear corner (bottom-left, then
        # bottom-right) — checked against every prop screen box (both zooms) and
        # every label box, with the same 12px clearance margin as chip_box().
        chip_xy = None
        if not all(ok for (_, _, _, ok) in back_fitted + front_fitted):
            all_boxes = [b for boxes in
                         ([_screen_box(pcx, pcy, *prop_box(pr), cx, cy, z)
                           for z in (z0, z1)] for (pr, pcx, pcy, _) in back_fitted + front_fitted)
                         for b in boxes]
            all_boxes += [(lx - hw, ly - hh, lx + hw, ly + hh) for (_, lx, ly, hw, hh) in label_placed]
            for (fx, fy) in chip_fallbacks(day):
                w = 168 + 27 * len(day)
                cb = (fx - 42, fy - 58, fx - 30 + w + 12, fy + 58)
                if not any(_hit(cb, b) for b in all_boxes):
                    chip_xy = (fx, fy)
                    break
        # emit in draw order: back props, characters, magnifier, front props, ots, title
        for (pr, pcx, pcy, _ok) in back_fitted:
            lines.append(_prop_el(pr, pcx, pcy))
        # characters (in spec order)
        for ci, c in enumerate(chars):
            if c.get('ghost'):
                lines.append(f"        {{hero{ci}G}}")
            else:
                lines.append(f"        {{hero{ci}}}")
        if sid in GLASS_SHOTS:
            lines.append("        <Magnifier x={mg.x} y={mg.y} s={1} />")
        for (pr, pcx, pcy, _ok) in front_fitted:
            lines.append(_prop_el(pr, pcx, pcy))
        if ots:
            lines.append("        <Foreground blur={16}>")
            lines.append("          <Hero look={LOOKS." + ROLE_LOOK[chars[1]['id']] + "} pose={{ ...basePose, x: 240, y: 660, scale: 2.1, yaw: -0.5, expr: 'neutral' }} rimId=\"rimInkl\" shadow={0} />")
            lines.append("        </Foreground>")
        if title:
            ch_name = sp['chapter']
            lines.append(f"        <TitleCard t={{t}} lines={{['{ch_name.split(':')[0].upper()}', '{ch_name.split(': ', 1)[1].upper() if ': ' in ch_name else ''}']}} size={{110}} />")
        lines.append("      </g>")
        # screen-space: DAY chip + labels
        if chip_xy is not None:
            lines.append(f"      <DayChip t={{t}} day=\"{day}\" x={{{chip_xy[0]}}} y={{{chip_xy[1]}}} />")
            cb = (chip_xy[0] - 42, chip_xy[1] - 58, chip_xy[0] - 30 + 168 + 27 * len(day) + 12, chip_xy[1] + 58)
        else:
            lines.append(f"      <DayChip t={{t}} day=\"{day}\" />")
            cb = chip_box(day)
        for (lb, lx, ly, hw, hh) in label_placed:
            col = PINK if lb.get('color') == 'pink' else CREAM
            lines.append(f"      <text x={{{fmt(lx)}}} y={{{fmt(ly)}}} textAnchor=\"middle\" fontFamily={{FONT.hand}} fontSize={{{fmt(lb['size'])}}} fill=\"{col}\">{js_label_text(lb['text'], fmt(lx))}</text>")
        layout_report.append({
            'id': sid, 'day': day, 'chip_moved': chip_xy is not None,
            'chip': [round(v) for v in cb],
            'props': [{'kind': pr['kind'],
                       'box0': [round(v) for v in _screen_box(pcx, pcy, *prop_box(pr), cx, cy, z0)],
                       'box1': [round(v) for v in _screen_box(pcx, pcy, *prop_box(pr), cx, cy, z1)],
                       'chip_ok': ok} for (pr, pcx, pcy, ok) in back_fitted + front_fitted],
            'labels': [{'text': lb['text'],
                        'box': [round(lx - hw), round(ly - hh), round(lx + hw), round(ly + hh)]}
                       for (lb, lx, ly, hw, hh) in label_placed],
        })
        lines.append("    </g>")
        lines.append("  );")
        lines.append("};")
        lines.append("")
    # S159: the voiceless end card (Javion, Nov 7: storyboard last slide goes in,
    # same as video #2 S182). No puppet spec, no characters, no DAY chip — the shared
    # EndCard component, slow 1.00 -> 1.06 push, exactly the #2 pattern. Its timeline
    # segment comes from the edit entry {"shot": "S159", "at": "+131"} + "end": "f:15960".
    lines.append("// ---------- S159: wide, endcard — Ch9 What 30 Days Really Does ----------")
    lines.append("export const S159: React.FC<ShotProps> = ({ t, len }) => {")
    lines.append("  const camX = kf(t, [[0, 960], [len, 960]]);")
    lines.append("  const camY = kf(t, [[0, 540], [len, 540]]);")
    lines.append("  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);")
    lines.append("  return (")
    lines.append("    <g>")
    lines.append("      <g transform={camT(camX, camY, zoom)}>")
    lines.append("        <EndCard />")
    lines.append("      </g>")
    lines.append("    </g>")
    lines.append("  );")
    lines.append("};")
    lines.append("")
    (EP / 'shots.tsx').write_text('\n'.join(lines), encoding='utf-8')
    print(f"wrote {EP / 'shots.tsx'} ({len(lines)} lines)")
    (STUDIO / 'out' / 'zenn-003' / 'layout_report.json').write_text(
        json.dumps(layout_report, indent=1), encoding='utf-8')
    moved = [e['id'] for e in layout_report if e['chip_moved']]
    # a prop with chip_ok False is only a problem if the chip did NOT move:
    # when the chip moved, the prop is clear of the chip's new corner.
    unmoved = [(e['id'], p['kind']) for e in layout_report if not e['chip_moved']
               for p in e['props'] if not p['chip_ok']]
    if moved:
        print(f"chip moved (prop could not clear top-left): {', '.join(moved)}")
    if unmoved:
        print(f"WARNING props still under the chip (chip has no clear corner): {unmoved}")
    return 0


def layout_check():
    """Programmatic sweep of layout_report.json (board v6): (a) the DAY chip must
    not overlap any prop or label box, (b) no text may overlap other text
    (sign / speech_bubble / label), (c) every box must sit fully inside the
    1920x1080 frame with a 16px margin. Prints every violation; exit 0 iff clean."""
    import os
    path = STUDIO / 'out' / 'zenn-003' / 'layout_report.json'
    if not os.path.exists(path):
        print(f'layout report missing: {path} — run `python3 gen_shots.py emit` first')
        return False
    report = json.loads(path.read_text(encoding='utf-8'))
    problems = []
    TEXT_KINDS = {'sign', 'speech_bubble'}
    for e in report:
        boxes = [(f"prop:{p['kind']}", b) for p in e['props'] for b in (p['box0'], p['box1'])]
        boxes += [(f"label:{l['text']}", l['box']) for l in e['labels']]
        # (a) chip vs everything
        for name, b in boxes:
            if _hit(e['chip'], b):
                problems.append(f"{e['id']}: CHIP overlaps {name} {b}")
        # (b) text vs text — compare distinct items, not the two zoom variants
        # of the same prop (a prop always overlaps its own zoomed self).
        text_items = [(f"prop:{p['kind']}", [p['box0'], p['box1']])
                      for p in e['props'] if p['kind'] in TEXT_KINDS]
        text_items += [(f"label:{l['text']}", [l['box']]) for l in e['labels']]
        for i in range(len(text_items)):
            for j in range(i + 1, len(text_items)):
                if any(_hit(a, b) for a in text_items[i][1] for b in text_items[j][1]):
                    problems.append(f"{e['id']}: TEXT overlap {text_items[i][0]} vs {text_items[j][0]}")
        # (c) frame edges (16px margin)
        for name, b in boxes:
            if b[0] < 16 or b[1] < 16 or b[2] > 1904 or b[3] > 1064:
                problems.append(f"{e['id']}: EDGE {name} {b}")
    if problems:
        print(f'layout: {len(problems)} violation(s)')
        for p in problems:
            print('  ' + p)
        return False
    print(f"layout: clean — {len(report)} shots, chip clear, no text collisions, nothing at the edges")
    return True


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if mode == 'check':
        sys.exit(0 if check() else 1)
    if mode == 'emit':
        sys.exit(emit())
    if mode == 'layout':
        sys.exit(0 if layout_check() else 1)
    print('usage: check | emit | layout')
    sys.exit(2)
