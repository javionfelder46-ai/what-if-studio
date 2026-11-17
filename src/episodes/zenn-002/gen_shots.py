#!/usr/bin/env python3
"""Generate src/episodes/zenn-002/shots.tsx + index.tsx from episode.json (sizes/sets/keys),
timeline.json (lengths/lines) and the puppet scene texts (scenes/zenn_002_scenes.json).

POSTER RE-PLAN (Nov 7): the first board passed the look/defect checks but FAILED the poster
match — it was built before Javion's 34-panel storyboard poster arrived
(out/zenn-002-storyboard-ref.png). The poster is now the shot plan: Jake carries the story
(Jake is in ~30 of 34 panels, the Detective in NONE of them). RESTAGE below reassigns every
shot by story beat, not by the poster's timestamps (our timing is locked to the voiceover).
THE DETECTIVE APPEARS ONLY AT THREE ANCHORS (checked in check()):
  (1) S1, the cold open (he opens the mystery with the shirt);
  (2) S31, the "THE SPOTLIGHT EFFECT" sign beat (poster panel 14 — Detective points at the
      standing sign; the parent brief's "~S84-S90" estimate does not match the voiceover —
      the sign line is S31, "That gap has a name. The spotlight effect.");
  (3) the sunset finale S178-S181 (he delivers the video #3 teaser, then closes the
      sunset scene ALONGSIDE Jake) — then S182, the Inkl end card.
Everything else is Jake, the crowd guests, the student wearer + observers, or the Schematic
number boards (S25-S29, S35-S36, S83, S85-S86, S122, S125-S126, S171-S173 are numbers-only,
no character — poster panels 12-13 are pure number boards). S182 is a 4 s voiceless end
card appended after the voiceover (timeline total 18470 -> 18590 frames); it is the ONE
subscribe ask in the video (Javion's reversal, Nov 7 ~3:36am CT) — no verbal ask, no
mid-video prompts anywhere else.
ART STYLE (Javion: "that exact art style"): the poster is painterly dusk — purple-to-orange
skies, visible light sources with real pools of light, haze, glow, detailed backgrounds.
The characters stay FLAT-VECTOR black silhouettes (never painterly); the RENDERING around
them pushes toward the poster: the Rooftop's big low sun + city + Haze for the sunset close,
Cone spotlight beams on the party spotlight beats (S7/S14/S76), Sparkles on the confidence
beat (S40), the Party set's string lights / pendants / dust. Flat solid fills alone do not
match the poster — every still is side-by-side checked against its poster panel for color,
light and atmosphere at the board gate.
CHARACTER FIDELITY (Javion: "pay deep attention to the characters"): the gate-checked cast
sheet (out/cast.png) is the reference — plain smooth round black heads, white features,
Detective's deerstalker shape + slate blue, Jake's red shirt + emblem placement, guest shirt
colors. Faces/moods are checked ZOOMED (2x crops): eyebrows + eyes + mouth must match the
line's mood distinctly, heads on necks, arms behind shirts from cuffs, no drifting
proportions or wrong hats/shirts. Any drift goes back. This check applies at the board gate
AND again on the full video (carried forward to the animation phase).

Mapping rules (verified against the rig code, not guessed):
- Cast is parsed from each shot's note: 'Detective' -> detective, 'Jake + crowd guests' ->
  jake + guestA/B/C, 'student wearer + observers' -> student (wearer) + guests, 'Jake'
  alone -> jake, 'Detective + numbers' -> detective on the Schematic with CountUps,
  'Numbers only' / 'No character' -> no character, 'End card' -> the S182 end card,
  'Jake + Detective' -> jake + detective (S181 sunset close only).
  An unparsed note is a hard error, never a guessed cast.
- RESTAGE is the single source of truth for the re-plan: resolve_meta() applies it over
  episode.json (cast phrase, set, size) for BOTH check() and emit(), and `sync` persists
  it into episode.json + timeline.json (notes/sizes/sets + the S182 shot/segment) so the
  data files stay truthful. Never hand-edit shots.tsx; never run build_episode.py here —
  it REWRITES episode.json from the puppet sources and would clobber the restage.
- Looks: ROLE_LOOK is the ONLY allowed mapping. A role with no look in rig.tsx LOOKS is a
  hard error, never a Pip/Mo stand-in: our cast is black silhouettes, not the skill's.
- Faces: faceAt swaps through a blink, never a morph. EXPR_OVERRIDES + EXPR_RULES are the
  ONLY expression sources; an unmapped expression is a hard error.
- Poses: poseAt keys with anticipation, holds, overshoot — every key interpolates, so no
  pose ever snaps. Walks use the rig's walkPose directly (a pure function of t), sampled
  never — interpolation of sampled walk keys would alias the step cycle.
- THE 5 V6 DEFECTS (hard constraints, checked in check() and in the emitted code):
  (1) no snap: every poseAt list has >= 2 keys, all numeric fields interpolate;
  (2) PANEL 3 (poster is the spec, Javion Nov 7 ~3:58am CT — the old "giant lobster
      stays plain" rule is REVERSED): the BIG lobster keeps its bold shades + thumbs up,
      full-frame, as the poster draws it — S4 is a macro insert of the BigLobster, and
      the wall sign (LobsterSign) wears the same shades + thumbs up. Jake's face shades
      are BOLD DARK SUNGLASSES drawn by the BoldShades component (the rig's glasses read
      as white-framed clear lenses on a black head — dark lenses vanish, the white glints
      read as frames); S43 gets BoldShades (poster panel 16, cool shades);
  (3) real articulated walk via walkPose, feet planted on the floor line;
  (4) no floating: every hip y is computed from a floor line (stand() math, Desk, stepTop,
      EXT_GROUND), feet = hip y + 140*scale;
  (5) expressions vary per beat: faceAt has >= 2 entries wherever the line changes mood.
- THE 5 V4 LOOK ITEMS: full black silhouettes (plain smooth round heads), warm tan rim-light
  rimInkl on the lit side, Detective's deerstalker + Magnifier (cold open S1 + close S181,
  glass RAISED in the LEFT hand per the cast sheet — armL 95/30, right hand scratching
  the head armR 120/110 — never low at his side), Jake's emblem (part of his LOOK, never
  redrawn per shot), no coloring-book fills.
- Set clock offset per shot (t + N) so dust/sways carry across cuts.
- Question popups: screen-space hand-font, warm red, inside frame, never touching an edge.
  No captions of the voice anywhere; no subscribe ask anywhere except the S182 end card.

Usage: python3 gen_shots.py check   # validate tables, print the cast/expression map
       python3 gen_shots.py sync    # persist RESTAGE into episode.json + timeline.json
       python3 gen_shots.py emit    # write shots.tsx + index.tsx (refuses if check fails)
"""
import json, math, re, sys
from pathlib import Path

STUDIO = Path('/home/hatch/workspace/what-if-studio')
ZENN = Path('/home/hatch/workspace/youtube-shorts/zenn')
EP = STUDIO / 'src/episodes/zenn-002'
FPS = 30

# ------------------------------------------------------------------ cast tables (THE gate)
ROLE_LOOK = {
    'detective': 'detective',
    'jake': 'jake',
    'student': 'student',    # the experiment wearer (green shirt, round specs)
    'guestA': 'guestA',      # teal shirt crowd guest
    'guestB': 'guestB',      # coral shirt crowd guest
    'guestC': 'guestC',      # mustard shirt crowd guest
}
MOOD_MAP = {
    'neutral': 'neutral', 'worried': 'worried', 'puzzled': 'puzzled', 'happy': 'happy',
    'smug': 'smug', 'scared': 'scared', 'angry': 'angry', 'stressed': 'stressed',
    'sad': 'sad', 'determined': 'determined', 'oops': 'oops', 'dizzy': 'dizzy',
    'tired': 'tired', 'cool': 'cool', 'shock': 'shock',
}
RED = '#C0392B'     # video #2 accent, warm red
CREAM = '#F6EFE3'
INK = '#161616'

# ------------------------------------------------------------------ room math (mirror of engine/room.tsx makeRoom)
def _lerp(a, b, t):
    return a + (b - a) * t

class Room:
    def __init__(self, vp, back, S=3.4):
        self.vp, self.back, self.S = vp, back, S
    def s(self, w):
        return 1 / _lerp(1, 1 / self.S, w)
    def P(self, u, v, w):
        k = self.s(w)
        return (round(self.vp[0] + (_lerp(self.back[0], self.back[1], u) - self.vp[0]) * k, 1),
                round(self.vp[1] + (_lerp(self.back[2], self.back[3], v) - self.vp[1]) * k, 1))
    def stand(self, u, w, k=0.62):
        p = self.P(u, 1, w)
        sc = k * (self.back[3] - self.back[2]) * self.s(w) / 378
        return (p[0], round(p[1] - 140 * sc, 1), round(sc, 3))

PARTY = Room((980, 500), (520, 1440, 330, 745))
BEDROOM = Room((940, 500), (480, 1440, 320, 742))
KITCHEN = Room((960, 500), (500, 1420, 330, 745))

# ------------------------------------------------------------------ fixed staging (hip x, hip y, scale)
STUDY_DET = (960, 712, 1.0)          # Detective behind the Desk (study doc: hips (960,712))
STUDY_JAKE = (960, 712, 1.0)
STUDY_GUEST_A = (700, 719, 0.95)     # the "audience" flanking the Detective in two-shots
STUDY_GUEST_B = (1220, 719, 0.95)
PARTY_JAKE = PARTY.stand(0.5, 0.5)   # (980, 731.3, 1.052)
PARTY_A = PARTY.stand(0.3, 0.45)     # (695.6, 719.4, 0.998)
PARTY_B = PARTY.stand(0.7, 0.45)     # (1264.4, 719.4, 0.998)
PARTY_C = PARTY.stand(0.2, 0.45)     # (575.5, 719.4, 0.998)
PARTY_D = PARTY.stand(0.8, 0.45)     # (1384.5, 719.4, 0.998)
PARTY_B2 = PARTY.stand(0.88, 0.45)   # (1492.3, 719.4, 0.998) — S2's guestB: the walk
    # camera lags Jake, so at the key frame he is ~100 world units right of centre;
    # 0.8 still left their heads touching. 0.88 clears him by ~180 world units.
PARTY_DOOR = PARTY.P(1, 1, 0.3)      # (1563.6, 810.8) — the lit doorway's floor point
CLASS_WEARER = (1260, 760, 1.0)      # at the SchoolDesk (kit doc: Pip stood (1260,760))
CLASS_OBS_A = (520, 830, 0.95)
CLASS_OBS_B = (1620, 830, 0.95)
SCHEM_DET = (560, 800, 1.0)          # Detective on the grid, facing the numbers at right
BED_DET = BEDROOM.stand(0.55, 0.3)   # (1026, 684, 0.878) — back a step so the teal
    # trainers on the floor (u 0.5/0.56, w 0.5) sit clearly in front of his feet,
    # not under them (they read as his shoes at w 0.5 — S52/S106 first-pass fail)
BED_WARDROBE = BEDROOM.stand(0.62, 0.5)
KIT_DET = KITCHEN.stand(0.5, 0.4)    # (960, 708.6, 0.948) behind the island
EXT_DET = (960, 700, 1.0)            # feet at EXT_GROUND 840
STAIR_DET = (800, 504, 0.9)          # on the tread: stepTop(800) = 630, hips 630 - 140*0.9
# Jake's hip point per set (same floor math as the Detective's spots, his own places):
BED_JAKE = BEDROOM.stand(0.55, 0.3)  # (1026, 684, 0.878) — his bedroom, the replaying room
KIT_JAKE = KITCHEN.stand(0.5, 0.4)   # (960, 708.6, 0.948) behind the island (S157, coffee)
EXT_JAKE = (960, 700, 1.0)           # feet at EXT_GROUND 840 (S137)
STAIR_JAKE = (800, 504, 0.9)         # the trip (S51)
ROOF_JAKE = (960, 700, 1.0)          # feet on the rooftop deck ~840, against the low sun (S177)
ROOF_DET = (960, 700, 1.0)           # the teaser + the sunset close (S178-S181)
JAKE_POS = {'study': STUDY_JAKE, 'party': PARTY_JAKE, 'bedroom': BED_JAKE,
            'kitchen': KIT_JAKE, 'exterior': EXT_JAKE, 'stairwell': STAIR_JAKE,
            'rooftop': ROOF_JAKE, 'classroom': (1260, 760, 1.0), 'schematic': (560, 800, 1.0)}
# S16, the Cornell establishing shot: the wearer + observers on the pavement in front of
# the Exterior set's building (feet at EXT_GROUND 840).
EXT_WEARER = (960, 700, 1.0)
EXT_OBS_A = (620, 700, 0.95)
EXT_OBS_B = (1300, 700, 0.95)
# S181, the sunset close: Jake SITS on the deck in profile, legs stretched forward on
# the deck toward the sun (feet planted on the deck, not dangling off a parapet — the
# parapet read as standing with bent knees); the Detective stands beside him, glass raised.
S181_JAKE = (700, 815, 1.0)
S181_DET = (1180, 700, 1.0)

# ------------------------------------------------------------------ the poster re-plan
SHOT_COUNT = 182                     # 181 voiceover shots + S182, the voiceless end card
ENDCARD_LEN = 120                    # 4 s of end card after the voiceover (18470 -> 18590)

def _r(cast, set_name=None, size=None):
    d = {'cast': cast}
    if set_name:
        d['set'] = set_name
    if size:
        d['size'] = size
    return d

# sid -> {cast phrase (as it reads in the note), set, size}. Only what changes from
# episode.json is listed; everything else stays as built. Cast phrases must parse via
# parse_cast below. Detective anchors: S1, S31 (sign), S178-S181 (sunset finale) ONLY.
RESTAGE = {
    # Act 1 (poster panels 1-8): Jake notices the shirt, the party, "but they're not!"
    # Panel 3 (poster is the spec): the BIG lobster, full-frame — shades + thumbs up.
    'S4': _r('No character', 'party', 'macro insert'),
    'S9': _r('Jake', 'party', 'close-up'),
    'S10': _r('Jake', 'party'), 'S11': _r('Jake', 'party'), 'S12': _r('Jake', 'party'),
    'S13': _r('Jake', 'party'), 'S14': _r('Jake + crowd guests', 'party'),
    'S15': _r('Jake', 'party'),
    # Act 2 (panels 9-14): Cornell -> Barry Manilow -> clipboard -> 46%/23% -> THE SIGN
    'S16': _r('student wearer + observers (crowd guests)', 'exterior'),
    'S25': _r('Numbers only', 'schematic'), 'S26': _r('Numbers only', 'schematic'),
    'S27': _r('Numbers only', 'schematic'), 'S28': _r('Numbers only', 'schematic'),
    'S29': _r('Numbers only', 'schematic'),
    'S31': _r('Detective', 'study', 'two-shot'),   # ANCHOR 2: the sign beat
    'S32': _r('Jake', 'party'), 'S33': _r('Jake + crowd guests', 'party'),
    'S34': _r('Jake', 'party'), 'S35': _r('Numbers only', 'schematic'),
    'S36': _r('Numbers only', 'schematic'), 'S37': _r('Jake + crowd guests', 'party'),
    'S38': _r('Jake + crowd guests', 'party'), 'S39': _r('Jake', 'party'),
    # Act 3 (panels 15-18): upside (confidence, sparkles) -> feels great (shades) ->
    # one mistake ("!") -> feels worse (sad). The replay beats live in Jake's bedroom.
    'S40': _r('Jake', 'party', 'medium'), 'S41': _r('Jake', 'party'),
    'S42': _r('Jake', 'party'), 'S43': _r('Jake', 'party'), 'S44': _r('Jake', 'party'),
    'S45': _r('Jake', 'party'), 'S46': _r('Jake + crowd guests', 'party'),
    'S47': _r('Jake', 'party'), 'S48': _r('Jake', 'party'),
    'S49': _r('Jake + crowd guests', 'party'), 'S50': _r('Jake', 'party'),
    'S51': _r('Jake', 'stairwell'), 'S52': _r('Jake', 'bedroom'),
    'S53': _r('Jake', 'bedroom'), 'S54': _r('Jake', 'bedroom', 'medium'),
    'S55': _r('Jake', 'bedroom'), 'S56': _r('No character', 'study'),
    'S57': _r('Jake', 'bedroom'), 'S58': _r('Jake', 'bedroom'),
    'S59': _r('Jake', 'bedroom'), 'S60': _r('Jake', 'bedroom'),
    'S61': _r('Jake', 'bedroom'),
    # Act 4 (panels 19-22): replay / thought bubble -> brain magnifies -> many eyes ->
    # the audience is imaginary.
    'S62': _r('Jake', 'bedroom'), 'S63': _r('Jake', 'bedroom'),
    'S64': _r('Jake', 'bedroom'), 'S65': _r('Jake', 'bedroom'),
    'S66': _r('Jake', 'bedroom'), 'S67': _r('Jake', 'bedroom'),
    'S68': _r('Jake', 'bedroom'), 'S69': _r('Jake', 'bedroom'),
    'S70': _r('Jake + crowd guests', 'party'), 'S77': _r('Jake', 'party'),
    # Act 5 (panels 23-26): crowd focused on themselves -> "you're not the only one" ->
    # the spotlight fades. The Ch5 desk beats are the wearer + observers, not the Detective.
    'S83': _r('Numbers only', 'schematic'), 'S84': _r('Numbers only', 'schematic'),
    'S85': _r('Numbers only', 'schematic'), 'S86': _r('Numbers only', 'schematic'),
    'S92': _r('student wearer + observers (crowd guests)', 'classroom'),
    'S93': _r('student wearer + observers (crowd guests)', 'classroom'),
    'S94': _r('student wearer + observers (crowd guests)', 'classroom'),
    'S95': _r('student wearer + observers (crowd guests)', 'classroom'),
    'S96': _r('student wearer + observers (crowd guests)', 'classroom'),
    'S97': _r('student wearer + observers (crowd guests)', 'classroom'),
    # Ch6, the twist (no poster act — carried by Jake, NOT the Detective):
    # bedroom reflection, then the judgment beat back at the party with the crowd.
    'S98': _r('Jake', 'bedroom'), 'S99': _r('Jake', 'bedroom'),
    'S100': _r('Jake', 'bedroom'), 'S101': _r('Jake', 'bedroom'),
    'S102': _r('Jake', 'bedroom', 'medium'), 'S103': _r('Jake', 'bedroom'),
    'S104': _r('No character', 'study'), 'S105': _r('Jake', 'bedroom'),
    'S106': _r('Jake', 'bedroom'), 'S107': _r('Jake', 'party'),
    'S108': _r('Jake', 'party'), 'S109': _r('Jake', 'party'),
    'S110': _r('Jake + crowd guests', 'party'), 'S111': _r('Jake', 'party'),
    'S112': _r('Jake', 'party'), 'S113': _r('Jake + crowd guests', 'party'),
    'S114': _r('Jake', 'party'), 'S115': _r('Jake', 'party'),
    'S116': _r('Jake', 'party'), 'S117': _r('Jake + crowd guests', 'party'),
    # Act 6 (panels 27-28) / Ch7 Rule Three: the spotlight dims, silhouettes in light.
    'S122': _r('Numbers only', 'schematic'), 'S125': _r('Numbers only', 'schematic'),
    'S126': _r('Numbers only', 'schematic'), 'S131': _r('Jake', 'party'),
    'S132': _r('Jake', 'party'), 'S133': _r('Jake + crowd guests', 'party'),
    'S134': _r('Jake + crowd guests', 'party'), 'S135': _r('Jake', 'party'),
    'S136': _r('No character', 'study'), 'S137': _r('Jake', 'exterior'),
    'S138': _r('Jake', 'party'), 'S139': _r('Jake', 'party'),
    # Act 7 (panels 29-32) / Ch8 How To Beat It: tips -> breathe -> focus (cat) ->
    # "You're enough."
    'S140': _r('Jake', 'party'), 'S141': _r('Jake', 'party'),
    'S142': _r('Jake + crowd guests', 'party'), 'S143': _r('Jake', 'party'),
    'S144': _r('Jake', 'party'), 'S145': _r('Jake + crowd guests', 'party'),
    'S146': _r('Jake', 'party'), 'S147': _r('Jake', 'party'),
    'S148': _r('Jake', 'party'), 'S149': _r('Jake + crowd guests', 'party'),
    'S150': _r('Jake + crowd guests', 'party'), 'S151': _r('Jake', 'bedroom'),
    'S152': _r('Jake', 'bedroom'),
    # Act 7 (panels 33-34) / Ch9 The Inversion: sunset city -> sitting at sunset -> end card.
    'S153': _r('Jake', 'party'), 'S154': _r('Jake', 'party'),
    'S155': _r('Jake', 'party'), 'S157': _r('Jake', 'kitchen'),
    'S158': _r('Jake + crowd guests', 'party'), 'S159': _r('Jake', 'party'),
    'S160': _r('Jake', 'party'), 'S161': _r('Jake + crowd guests', 'party'),
    'S162': _r('Jake', 'party'), 'S163': _r('Jake', 'party'),
    'S164': _r('Jake', 'party'), 'S171': _r('Numbers only', 'schematic'),
    'S172': _r('Numbers only', 'schematic'), 'S173': _r('Numbers only', 'schematic'),
    'S174': _r('Jake + crowd guests', 'party'), 'S175': _r('Jake', 'party'),
    'S176': _r('Jake', 'party'), 'S177': _r('Jake', 'rooftop'),
    'S178': _r('Detective', 'rooftop'), 'S179': _r('Detective', 'rooftop'),
    'S180': _r('Detective', 'rooftop'), 'S181': _r('Jake + Detective', 'rooftop'),
}
# Note-tail overrides: the tail (after the cast colon) RESTAGE's cast rewrite would
# otherwise preserve verbatim. S4's old DEFECT SCENE text is reversed by the panel-3
# order (poster is the spec, Nov 7 ~3:58am CT) — the big lobster keeps its shades.
NOTE_TAILS = {
    'S4': "A lobster wearing sunglasses, giving a thumbs up. | PANEL 3 — the big lobster keeps its bold shades + thumbs up, full-frame (poster is the spec; the old plain-sign rule is reversed).",
}
# Shots whose staging needs a drawn visual beyond the cast (see emit):
SPOTLIGHT_SHOTS = {'S7', 'S14', 'S76'}   # a Cone beam + floor pool on Jake (poster panels 6-7)
SHADES_SHOTS = {'S43'}                   # BoldShades on Jake's face (S43 cool, poster panel 16); S4 is the BigLobster moment now
NO_CHAR_SHOTS = {'S4', 'S28', 'S84', 'S56', 'S104', 'S136'}  # diagram/object inserts, no character (S4: the full-frame lobster)


def resolve_meta(sid, meta):
    """(size, set, note) for a shot with RESTAGE applied. Idempotent once synced."""
    r = RESTAGE.get(sid, {})
    size = r.get('size', meta['size'])
    set_name = r.get('set', meta['set'])
    note = meta['note']
    if 'cast' in r:
        head, sep, rest = note.partition(' — ')
        if not sep:
            return size, set_name, note
        _cast, _, tail = rest.partition(': ')
        note = f"{head} — {r['cast']}: {tail}"
    if sid in NOTE_TAILS:
        # a note tail the cast rewrite would otherwise preserve stale (S4: the old
        # DEFECT SCENE text is reversed by the panel-3 order).
        head, sep, rest = note.partition(' — ')
        if sep:
            _cast, _, _tail = rest.partition(': ')
            note = f"{head} — {_cast}: {NOTE_TAILS[sid]}"
    return size, set_name, note

# ------------------------------------------------------------------ per-shot design tables
WALK_SHOTS = {'S2', 'S6', 'S120', 'S166'}   # walkPose shots (x0 -> x1, ground, facing)
WALK = {
    'S2': (1564, 1050, 900.5, 1.05, -1),    # Jake in through the party door, leftward
    'S6': (1564, 1250, 900.5, 1.05, -1),    # stepped through the door (two-shot)
    'S120': (500, 1150, 900, 1.0, 1),       # wearer walked into the classroom
    'S166': (1564, 1100, 900.5, 1.05, -1),  # Jake back at the party, relaxed
}
SIGN_SHOTS = {'S3', 'S4', 'S8', 'S71', 'S75', 'S148', 'S156', 'S164', 'S166'}  # the giant sign lobster appears
    # S148/S164 joined at the re-plan: their lines are about the lobster shirt and they are
    # party mediums — the sign on the back wall behind Jake is on-beat set dressing.
GLASS_SHOTS = {'S1', 'S31', 'S178', 'S179', 'S180', 'S181'}  # Detective holds the Magnifier, glass RAISED (cold open + sign beat + sunset teaser + close)
PHONE_SHOT = 'S52'                       # Detective holds the phone (wrong-person text)

# Expression at the shot's key frame, by shot. Everything else falls through to EXPR_RULES.
EXPR_OVERRIDES = {
    'S1': 'puzzled', 'S7': 'worried', 'S8': 'worried', 'S9': 'happy',
    'S10': 'determined', 'S11': 'puzzled', 'S12': 'puzzled', 'S15': 'determined',
    'S18': 'smug', 'S22': 'worried', 'S27': 'smug', 'S31': 'smug', 'S35': 'determined', 'S36': 'determined',
    'S40': 'happy', 'S43': 'smug', 'S44': 'worried', 'S45': 'scared', 'S51': 'oops', 'S53': 'smug',
    'S54': 'smug', 'S57': 'determined', 'S58': 'determined', 'S59': 'determined',
    'S62': 'worried', 'S64': 'worried', 'S67': 'puzzled', 'S71': 'worried', 'S72': 'worried',
    'S73': 'determined', 'S76': 'scared',
    'S77': 'determined', 'S86': 'smug', 'S91': 'happy', 'S99': 'determined', 'S100': 'smug',
    'S104': 'smug', 'S106': 'smug', 'S107': 'smug', 'S115': 'happy', 'S118': 'determined',
    'S122': 'worried', 'S129': 'happy', 'S130': 'happy', 'S136': 'puzzled', 'S139': 'determined',
    'S140': 'determined', 'S142': 'puzzled', 'S146': 'determined', 'S147': 'happy', 'S148': 'happy',
    'S151': 'happy', 'S156': 'puzzled',
    'S160': 'determined', 'S163': 'happy', 'S164': 'happy', 'S166': 'happy',
    'S167': 'happy', 'S168': 'happy', 'S169': 'happy', 'S170': 'happy',
    'S171': 'determined', 'S173': 'determined', 'S175': 'puzzled', 'S176': 'smug',
    'S177': 'happy', 'S178': 'smug', 'S179': 'scared', 'S180': 'scared', 'S181': 'smug',
}
# Extra face swaps after the key frame: shot -> [(frame offset from key, expr)]
FACE_EXTRA = {
    'S51': [(25, 'dizzy')],     # the trip: oops, then dizzy
    'S45': [(-12, 'worried')],  # terror settles into worry at the end (len-relative, fixed in emit)
    'S76': [(-12, 'worried')],
}
# Keyword rules (first match wins) for shots without an override.
EXPR_RULES = [
    (r'terror|scared|fear|afraid|panic|sweat', 'scared'),
    (r'embarrass|awkward|stain|cringe|watched|watching|staring|stare|judg', 'worried'),
    (r'power|belongs to you|remember you|alive', 'smug'),
    (r'free|forgot he was|disappears|relief', 'happy'),
    (r'\?|guess|how many|pick a number', 'puzzled'),
    (r'rule|prove|beat it|turn it down|weapon|remember those|start with you', 'determined'),
    (r'wrong|mistake|stupid|lands flat|trip on', 'sad'),
    (r'worse|trapped|alone|turns on you', 'scared'),
]
# Question popups (screen-space hand font, warm red): shot -> (lines, x, y, size)
# Two-line popups sit top-LEFT (x 330) on Detective mediums/low-angle/party shots so
# the 2nd line clears the centred head/cap; single-line ones sit centred above the head.
POPUPS = {
    'S22': (['HOW MANY PEOPLE', 'COULD TELL?'], 1000, 140, 48),  # x 1000: the board's '?' ends ~x 800; centred 960 grazed it
    'S23': (['PICK A NUMBER!'], 960, 180, 64),
    'S50': (['HOW MANY TIMES', 'THIS WEEK?'], 330, 110, 52),
    'S53': (['REPLAYED 400 TIMES'], 1420, 300, 72),
    'S54': (['REPLAYED 0 TIMES'], 1420, 300, 72),
    'S98': (['WHY DOES IT FEEL', 'LIKE THEY ARE?'], 330, 110, 52),
    'S110': (['DO THEY JUDGE US', 'AS HARSHLY?'], 960, 120, 52),
    'S140': (['HOW DO YOU', 'BEAT IT?'], 330, 110, 52),
    'S156': (["WHAT WAS JAKE'S FRIEND WEARING?"], 900, 110, 40),  # y 110, not 60: the
    # one-line popup sat ~16px from the top edge (borderline note d); glyph tops now ~70px in
    'S174': (['WHICH ONE', 'STUNG THE MOST?'], 960, 120, 52),
}
CHAPTER_LABELS = {  # chapter-opening shots get a small cream chapter label (screen-space)
    # S98/S140 have a popup top-left instead (a label there would collide with it);
    # S118's board already says RULE THREE, so no label there either.
    'S16': 'CHAPTER TWO', 'S40': 'CHAPTER THREE', 'S62': 'CHAPTER FOUR',
    'S78': 'CHAPTER FIVE', 'S153': 'CHAPTER NINE',
}
# Classroom board chalk: shot -> text on the board
# S16's board text sits off-frame in its medium; S22's board collided with its popup.
BOARD = {
    'S78': 'RULE TWO', 'S118': 'RULE THREE',
}
# Schematic numbers: shot -> list of (label, value, suffix, color, x, y, size)
# 'live' = orange #FF8A3D, 'dim' = #7E8DA6
NUMBERS = {
    'S25': [('GUESSED', 46, '%', 'live', 1300, 480, 120)],
    'S26': [('THEY FELT', 46, '%', 'live', 1300, 480, 120), ('ALMOST HALF', None, '', 'dim', 1300, 640, 44)],
    'S27': [('GUESSED', 46, '%', 'dim', 1050, 480, 110), ('REAL', 23, '%', 'live', 1500, 480, 110)],
    'S28': [('GUESSED', 46, '%', 'dim', 740, 560, 150), ('REAL', 23, '%', 'live', 1210, 560, 150)],
    'S29': [('COULD NAME IT', 23, '%', 'live', 1300, 480, 120)],
    'S35': [('×2', None, '', 'live', 950, 560, 150)],
    'S36': [('FACTOR OF TWO', 2, '×', 'live', 1300, 500, 150)],
    'S83': [('GUESSED', 48, '%', 'live', 1300, 480, 120)],
    'S84': [('GUESSED', 48, '%', 'dim', 740, 560, 150), ('REAL', 8, '%', 'live', 1210, 560, 150)],
    'S85': [('THE REAL NUMBER', 8, '%', 'live', 1100, 480, 150)],
    'S86': [('OVERESTIMATED BY', 6, '×', 'live', 1300, 500, 150)],
    'S122': [('GUESSED', 51, '%', 'live', 1300, 480, 120)],
    'S125': [('AFTER 15 MINUTES', 37, '%', 'live', 1300, 480, 120)],
    'S126': [('CUT BY A THIRD', 33, '%', 'live', 1300, 480, 120)],
    'S171': [('FELT', 46, '%', 'live', 1150, 480, 130)],
    'S172': [('REAL', 23, '%', 'live', 1100, 560, 120), ('PROUD', 8, '%', 'live', 1400, 560, 120)],  # y 560, not 450: the low-angle frame top (363) cut the labels off
    'S173': [('TURN IT DOWN', None, '', 'live', 1150, 360, 56)],  # y 360, not 320: the frame top (280) clipped the glyphs
}
LONG_SHOTS = {'S10', 'S15', 'S21', 'S22', 'S27', 'S34', 'S45', 'S72', 'S91', 'S100',
              'S118', 'S125', 'S147', 'S152', 'S160', 'S166', 'S173'}  # > 4 s: action inside

# ------------------------------------------------------------------ gestures (arm angles in degrees, from straight down)
# armR positive swings out to the character's right; armL is mirrored by the rig.
GEST = {
    'idle':   {'armL': (10, -8), 'armR': (10, -8)},
    'point':  {'armR': (-55, -5), 'handR': 'point', 'armL': (10, -8)},
    'open':   {'armL': (40, -10), 'armR': (40, -10)},
    'count':  {'armR': (-70, -10), 'handR': 'point', 'armL': (15, -10)},
    'shrug':  {'armL': (55, -20), 'armR': (55, -20), 'headTilt': 8},
    'lean':   {'armR': (-45, -15), 'handR': 'point', 'tilt': 6, 'armL': (10, -8)},
    'glass':  {'armL': (95, 30), 'armR': (120, 110)},  # cast-sheet pose: glass RAISED in
    # the LEFT hand (armL 95/30), right hand scratching the head (armR 120/110) — never low
    # at his side (S1 + S181 first-pass fail)
    'scratch': {'armR': (-95, -40), 'headTilt': 10, 'armL': (10, -8)},
    'think':  {'armR': (-25, -65), 'armL': (10, -8)},
    'sweep':  {'armR': (65, -5), 'armL': (-15, -10)},
    'wave':   {'armR': (-120, 0), 'armL': (10, -8)},
    'akimbo': {'armL': (35, -55), 'armR': (-35, -55)},
    'cross':  {'armL': (25, -60), 'armR': (-25, -60)},
    'self':   {'armR': (-15, -55), 'handR': 'point', 'armL': (10, -8)},
    'flail':  {'armL': (-70, -10), 'armR': (70, -10)},
    'reach':  {'armR': (-80, -5), 'handR': 'point', 'armL': (10, -8)},
}
DET_CYCLE = ['point', 'open', 'lean', 'think', 'count', 'sweep']


def load():
    ep = json.loads((EP / 'episode.json').read_text())
    tl = json.loads((EP / 'timeline.json').read_text())
    scenes = json.loads((ZENN / 'scenes/zenn_002_scenes.json').read_text())
    rig = (STUDIO / 'src/engine/rig.tsx').read_text()
    looks_region = rig.split('export const LOOKS')[1].split('};', 1)[0]
    looks = set(re.findall(r"^\s{2}(\w+): \{", looks_region, re.M))
    exprs = {e.strip() for e in re.findall(r"export type Expr = ([^;]+);", rig)[0].replace("'", '').split('|')}
    return ep, tl, scenes, looks, exprs


def expr_for(sid, line):
    if sid in EXPR_OVERRIDES:
        return EXPR_OVERRIDES[sid]
    for pat, e in EXPR_RULES:
        if re.search(pat, line, re.I):
            return e
    return 'neutral'


def parse_cast(note):
    """Shot note -> (kind, [roles]). Hard error on an unrecognised note."""
    m = re.match(r'Ch\d+ .*? — (.*)', note)
    if not m:
        return None
    who = m.group(1)
    if who.startswith('Detective + numbers'):
        return ('detective+numbers', ['detective'])
    if who.startswith('Detective'):
        return ('detective', ['detective'])
    if who.startswith('Jake + crowd guests'):
        return ('jake+crowd', ['jake', 'guestA', 'guestB', 'guestC'])
    if who.startswith('Jake + Detective'):
        return ('jake+detective', ['jake', 'detective'])
    if who.startswith('Jake'):
        return ('jake', ['jake'])
    if who.startswith('student wearer + observers'):
        return ('student+observers', ['student', 'guestA', 'guestB'])
    if who.startswith('Numbers only'):
        return ('numbers', [])
    if who.startswith('No character'):
        return ('none', [])
    if who.startswith('End card'):
        return ('endcard', [])
    return None


def check():
    ep, tl, scenes, looks, exprs = load()
    problems = []
    for role, want in ROLE_LOOK.items():
        if want not in looks:
            problems.append(f"ROLE '{role}': mapped to look '{want}' which is not in rig.tsx LOOKS")
    for sid, e in EXPR_OVERRIDES.items():
        if MOOD_MAP.get(e) not in exprs:
            problems.append(f"EXPR override {sid}='{e}': no such rig Expr")
    for pat, e in EXPR_RULES:
        if MOOD_MAP.get(e) not in exprs:
            problems.append(f"EXPR rule '{pat}' -> '{e}': no such rig Expr")
    for sid in RESTAGE:
        if sid != 'S182' and (not sid.startswith('S') or not sid[1:].isdigit()
                               or not 1 <= int(sid[1:]) <= 181):
            problems.append(f"RESTAGE key {sid!r}: not a shot S1..S181")
    shots = {s['id']: s for s in ep['shots']}
    if len(shots) != SHOT_COUNT or len(tl['segments']) != SHOT_COUNT:
        problems.append(f"expected {SHOT_COUNT} shots/segments, got {len(shots)}/{len(tl['segments'])}")
    kinds = {}
    for sid, s in shots.items():
        size, set_name, note = resolve_meta(sid, s)
        c = parse_cast(note)
        if c is None:
            problems.append(f"{sid}: cannot parse cast from note: {note!r}")
        else:
            kinds.setdefault(c[0], []).append(sid)
        if set_name not in ('study', 'party', 'classroom', 'schematic', 'bedroom', 'kitchen',
                            'exterior', 'stairwell', 'rooftop', 'endcard'):
            problems.append(f"{sid}: unknown set {set_name!r}")
        if size not in ('wide', 'medium', 'close-up', 'macro insert', 'high angle', 'low angle', 'over-the-shoulder', 'two-shot'):
            problems.append(f"{sid}: unknown size {size!r}")
    # THE DETECTIVE ANCHORS (poster re-plan): Detective-only shots are exactly S1 (cold
    # open), S31 (the sign beat) and S178-S180 (sunset teaser); S181 is Jake + Detective.
    # Anything else with the Detective in it is a restage miss.
    det_only = set(kinds.get('detective', [])) | set(kinds.get('detective+numbers', []))
    if det_only != {'S1', 'S31', 'S178', 'S179', 'S180'}:
        problems.append(f"Detective-only shots must be exactly S1/S31/S178/S179/S180, got {sorted(det_only)}")
    if kinds.get('jake+detective', []) != ['S181']:
        problems.append(f"Jake+Detective must be exactly S181, got {kinds.get('jake+detective', [])}")
    if kinds.get('endcard', []) != ['S182']:
        problems.append(f"end card must be exactly S182, got {kinds.get('endcard', [])}")
    jake_shots = len(kinds.get('jake', [])) + len(kinds.get('jake+crowd', [])) + len(kinds.get('jake+detective', []))
    # S4 panel-3 check: the note must carry the PANEL 3 order (big lobster, shades +
    # thumbs up, full-frame) — the old DEFECT SCENE text is reversed, never restored.
    if 'S4' not in shots or 'PANEL 3' not in resolve_meta('S4', shots['S4'])[2]:
        problems.append("S4 panel-3 note missing from episode.json")
    # long shots all exist and are > 120 frames
    for sid in LONG_SHOTS:
        seg = tl['segments'][int(sid[1:]) - 1]
        if seg['t1'] - seg['t0'] <= 120:
            problems.append(f"long shot {sid} is only {seg['t1'] - seg['t0']} frames")
    # sign shots: every party shot whose line mentions the lobster gets the sign
    for i, sc in enumerate(scenes):
        sid = f'S{i + 1}'
        if resolve_meta(sid, shots[sid])[1] == 'party' and 'lobster' in sc['text'].lower() and sid not in SIGN_SHOTS:
            problems.append(f"{sid}: line mentions the lobster but the sign is not in SIGN_SHOTS")
    print(f"cast kinds: {{ {', '.join(f'{k}: {len(v)}' for k, v in sorted(kinds.items()))} }}")
    print(f"shots with Jake: {jake_shots}  (Detective-only: {len(det_only)} + S181 with Jake)")
    print(f"rig looks: {sorted(looks)}")
    print(f"rig exprs: {sorted(exprs)}")
    print(f"walk shots: {sorted(WALK_SHOTS)}  sign shots: {sorted(SIGN_SHOTS, key=lambda s: int(s[1:]))}")
    if problems:
        print(f"\nBLOCKED: {len(problems)} problem(s):")
        for p in problems:
            print('  -', p)
        return False
    print('\nCHECK PASSED: cast complete, all mappings valid, defects tabled.')
    return True


def sync():
    """Persist RESTAGE into episode.json + timeline.json (notes/sizes/sets + S182).
    Mechanical only — the table in this file is the source of truth; re-running is a no-op."""
    ep, tl, scenes, looks, exprs = load()
    shots = {s['id']: s for s in ep['shots']}
    changed = []
    for sid, r in sorted(RESTAGE.items(), key=lambda kv: int(kv[0][1:])):
        s = shots[sid]
        size, set_name, note = resolve_meta(sid, s)
        if (s['size'], s['set'], s['note']) != (size, set_name, note):
            s['size'], s['set'], s['note'] = size, set_name, note
            changed.append(sid)
    if 'S182' not in shots:
        ep['shots'].append({
            'id': 'S182', 'size': 'wide', 'set': 'endcard', 'key': 60,
            'note': 'Ch9 The Inversion That Sets You Free — End card: Inkl logo, Curiosity. Explained., Subscribe button.'})
        changed.append('S182')
    (EP / 'episode.json').write_text(json.dumps(ep, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    # timeline.json mirrors the shot table (segments + shots list) and the total
    tl_shots = {s['id']: s for s in tl['shots']}
    for sid, s in shots.items():
        if sid in tl_shots:
            tl_shots[sid]['size'] = s['size']
            tl_shots[sid]['note'] = s['note']
    segs = tl['segments']
    if not any(sg['shot'] == 'S182' for sg in segs):
        a = segs[-1]['b']
        segs.append({'shot': 'S182', 'a': a, 'b': a + ENDCARD_LEN, 't0': 0, 't1': ENDCARD_LEN, 'line': ''})
        tl['shots'].append({'id': 'S182', 'size': 'wide', 'key': 60, 'len': ENDCARD_LEN,
                            'first': a, 'line': '',
                            'note': 'Ch9 The Inversion That Sets You Free — End card: Inkl logo, Curiosity. Explained., Subscribe button.'})
        tl['total'] = a + ENDCARD_LEN
        changed.append('S182-timeline')
    (EP / 'timeline.json').write_text(json.dumps(tl, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f"synced episode.json + timeline.json ({len(changed)} change(s): {', '.join(changed)})")
    print(f"timeline total now {tl['total']} frames = {tl['total'] / 30:.2f}s")
    return 0


def fmt(v):
    if isinstance(v, float):
        return f'{v:.1f}' if abs(v - round(v)) > 0.05 else str(int(round(v)))
    return str(v)


def js_limb(l):
    return f"{{ a: {fmt(l[0])}, b: {fmt(l[1])} }}"


def gesture_pose(gname, x, y, scale, yaw=0.3, look=0.0, glasses=None, blend=1.0):
    """A full pose dict for one gesture; blend 0..1 mixes toward 'idle' (for settle keys)."""
    g = GEST[gname]
    base = GEST['idle']
    def mix(k):
        if k in g:
            return g[k]
        return base.get(k, (10, -8))
    def bl(a, b):
        return (round(a[0] + (b[0] - a[0]) * blend, 1), round(a[1] + (b[1] - a[1]) * blend, 1))
    armL = bl(base['armL'], mix('armL')) if 'armL' in g else base['armL']
    armR = bl(base['armR'], mix('armR')) if 'armR' in g else base['armR']
    p = {
        'x': x, 'y': y, 'scale': scale, 'yaw': yaw, 'look': look,
        'tilt': round(g.get('tilt', 0) * blend, 1),
        'headTilt': round(g.get('headTilt', 0) * blend, 1),
        'armL': armL, 'armR': armR,
        'legL': (5, 0), 'legR': (-5, 0),
        'handL': 'open', 'handR': g.get('handR', 'open'),
    }
    if glasses is not None:
        p['glasses'] = glasses
    return p


def js_pose(p):
    parts = [f"x: {fmt(p['x'])}, y: {fmt(p['y'])}, scale: {fmt(p['scale'])}"]
    if p.get('yaw') is not None:
        parts.append(f"yaw: {fmt(p['yaw'])}")
    if p.get('look'):
        parts.append(f"look: {fmt(p['look'])}")
    if p.get('tilt'):
        parts.append(f"tilt: {fmt(p['tilt'])}")
    if p.get('headTilt'):
        parts.append(f"headTilt: {fmt(p['headTilt'])}")
    parts.append(f"armL: {js_limb(p['armL'])}")
    parts.append(f"armR: {js_limb(p['armR'])}")
    parts.append(f"legL: {js_limb(p['legL'])}")
    parts.append(f"legR: {js_limb(p['legR'])}")
    if p.get('handR') != 'open':
        parts.append(f"handR: '{p['handR']}'")
    if p.get('handL') != 'open':
        parts.append(f"handL: '{p['handL']}'")
    if p.get('glasses') is not None:
        parts.append(f"glasses: {fmt(p['glasses'])}")
    return '{ ' + ', '.join(parts) + ' }'


def det_gesture(sid, line, n):
    if sid == 'S31':
        return 'point'   # the sign beat: pointing at THE SPOTLIGHT EFFECT board
    if sid in ('S178', 'S180'):
        return 'lean'    # the teaser, confiding in the viewer at sunset
        return 'count'
    if '?' in line:
        return 'point'
    if re.search(r'\bnot\b|\bnever\b|no one|nobody', line, re.I):
        return 'sweep'
    if re.search(r'you feel|your brain|imagine|think about', line, re.I):
        return 'open'
    return DET_CYCLE[n % len(DET_CYCLE)]


def jake_gesture(expr):
    return {'smug': 'akimbo', 'worried': 'cross', 'happy': 'wave', 'scared': 'cross',
            'puzzled': 'self', 'determined': 'open'}.get(expr, 'open')

# ------------------------------------------------------------------ emit
SIZE_CAM = {
    'wide': (1.0, 1.06),
    'medium': (1.8, 1.9),
    'close-up': (3.2, 3.35),
    'macro insert': (2.4, 2.5),
    'high angle': (1.25, 1.3),
    'low angle': (1.6, 1.68),
    'over-the-shoulder': (1.5, 1.55),
    'two-shot': (1.35, 1.4),
}
WIDE_CENTER = {
    'study': (960, 560), 'party': (980, 570), 'classroom': (900, 540),
    'schematic': (960, 540), 'bedroom': (940, 560), 'kitchen': (960, 560),
    'exterior': (960, 600), 'stairwell': (960, 600), 'rooftop': (960, 620),
    'endcard': (960, 540),
}


def emit():
    if not check():
        print('\nREFUSING TO EMIT: fix the tables first (see problems above).')
        return 1
    ep, tl, scenes, looks, exprs = load()
    shots = {s['id']: s for s in ep['shots']}
    segs = {s['shot']: s for s in tl['segments']}
    lines = []
    lines.append("import React from 'react';")
    lines.append("import {")
    lines.append("  Hero, basePose, poseAt, faceAt, kf, camT, LOOKS, Foreground, TitleCard,")
    lines.append("  joints, toWorld, walkPose, Magnifier, Study, Desk, Classroom, SchoolDesk,")
    lines.append("  Party, PARTY_SIGN, Schematic, CountUp, SchLabel, Arrow, Gauge, Bedroom,")
    lines.append("  Kitchen, KitchenIsland, Exterior, Stairwell, Banister, Rooftop,")
    lines.append("  Phone, Mug, Cat, Glow, SpotlightBeam, EndCard, FONT, ShotProps,")
    lines.append("} from '../../engine';")
    lines.append("")
    lines.append("// \"The Spotlight Effect\" — 182 shots, one per scene (+ S182, the voiceless end card),")
    lines.append("// generated from episode.json (sizes/sets/keys) + timeline.json + scenes/zenn_002_scenes.json by")
    lines.append("// src/episodes/zenn-002/gen_shots.py. Every shot is a pure function of its own clock t;")
    lines.append("// each is right at its `key` frame first. Review the generated code, then verify on the board.")
    lines.append("// Black silhouettes, rimInkl rim light, Detective's deerstalker + magnifier, Jake's emblem")
    lines.append("// (part of his look). Question popups are screen-space hand text in warm red — never captions.")
    lines.append("// Poster re-plan: Jake carries the story; the Detective appears ONLY at S1 (cold open),")
    lines.append("// S31 (the sign beat) and S178-S181 (sunset finale, closing alongside Jake); S182 is the")
    lines.append("// Inkl end card — the video's ONLY subscribe ask.")
    lines.append("")
    lines.append(f"const RED = '{RED}';")
    lines.append(f"const CREAM = '{CREAM}';")
    lines.append("")
    lines.append("// --- focal props (drawn in shots.tsx, zenn-003 Prop pattern) ---")
    lines.append("")
    lines.append("/** The GIANT LOBSTER SIGN: the poster's big red lobster — bold black shades + a")
    lines.append("    white thumbs-up, on a cream board so it reads at medium distance (the old dark")
    lines.append("    board vanished against the party wall). PANEL 3 order (poster is the spec): the")
    lines.append("    big lobster KEEPS its shades + thumbs up; the old plain-sign rule is reversed. */")
    lines.append("const LobsterSign: React.FC = () => (")
    lines.append("  <g>")
    lines.append("    <rect x={PARTY_SIGN.x} y={PARTY_SIGN.y} width={PARTY_SIGN.w} height={PARTY_SIGN.h} fill=\"#EFE3D0\" stroke=\"#161616\" strokeWidth={6} />")
    lines.append("    <g transform={`translate(${PARTY_SIGN.x + 128} ${PARTY_SIGN.y + 88}) scale(1.15)`}>")
    lines.append("      <ellipse cx={-52} cy={-8} rx={26} ry={18} fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("      <ellipse cx={52} cy={-8} rx={26} ry={18} fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("      <ellipse cx={0} cy={0} rx={34} ry={30} fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("      <rect x={-26} y={-22} width={22} height={18} rx={6} fill=\"#0D0F1C\" stroke=\"#000000\" strokeWidth={3} />")
    lines.append("      <rect x={4} y={-22} width={22} height={18} rx={6} fill=\"#0D0F1C\" stroke=\"#000000\" strokeWidth={3} />")
    lines.append("      <path d=\"M -4 -14 L 4 -14\" stroke=\"#0D0F1C\" strokeWidth={5} strokeLinecap=\"round\" />")
    lines.append("      <path d=\"M -20 -6 L -10 -16 M 10 -6 L 20 -16\" stroke=\"#FFFFFF\" strokeWidth={2.5} strokeLinecap=\"round\" opacity={0.85} />")
    lines.append("      <path d=\"M -14 8 Q 0 20 14 8\" stroke=\"#161616\" strokeWidth={5} fill=\"none\" strokeLinecap=\"round\" />")
    lines.append("      <path d=\"M -20 26 L 20 26 L 28 52 L 0 60 L -20 52 Z\" fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={5} strokeLinejoin=\"round\" />")
    lines.append("      <rect x={34} y={16} width={14} height={32} rx={7} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={4} />")
    lines.append("      <circle cx={41} cy={14} r={9} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={4} />")
    lines.append("    </g>")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** PANEL 3, the full-frame big lobster (S4, macro insert): the poster's lobster as")
    lines.append("    drawn — big red body, bold black shades, wide grin, one claw giving a white")
    lines.append("    thumbs-up — on a deep-red field, like the T-shirt graphic itself. The poster is")
    lines.append("    the spec: do NOT 'fix' this lobster (no plain version, no shades removal). */")
    lines.append("const BigLobster: React.FC = () => (")
    lines.append("  <g>")
    lines.append("    <rect x={340} y={180} width={1240} height={720} rx={32} fill=\"#8E2318\" stroke=\"#161616\" strokeWidth={6} />")
    lines.append("    <path d=\"M 930 400 Q 870 300 830 250\" stroke=\"#D94A3A\" strokeWidth={10} fill=\"none\" strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M 990 400 Q 1050 300 1090 250\" stroke=\"#D94A3A\" strokeWidth={10} fill=\"none\" strokeLinecap=\"round\" />")
    lines.append("    <circle cx={830} cy={250} r={9} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={4} />")
    lines.append("    <circle cx={1090} cy={250} r={9} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={4} />")
    lines.append("    <ellipse cx={960} cy={800} rx={95} ry={42} fill=\"#C0392B\" stroke=\"#161616\" strokeWidth={6} />")
    lines.append("    <ellipse cx={905} cy={845} rx={62} ry={32} fill=\"#C0392B\" stroke=\"#161616\" strokeWidth={6} />")
    lines.append("    <ellipse cx={1015} cy={845} rx={62} ry={32} fill=\"#C0392B\" stroke=\"#161616\" strokeWidth={6} />")
    lines.append("    <path d=\"M 800 780 L 740 800 M 800 810 L 745 835 M 1120 780 L 1180 800 M 1120 810 L 1175 835\" stroke=\"#D94A3A\" strokeWidth={12} strokeLinecap=\"round\" />")
    lines.append("    <ellipse cx={960} cy={580} rx={170} ry={190} fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={7} />")
    lines.append("    <ellipse cx={960} cy={690} rx={95} ry={75} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("    <path d=\"M 882 668 L 1038 668 M 878 698 L 1042 698\" stroke=\"#161616\" strokeWidth={4} strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M 810 620 Q 760 620 740 640\" stroke=\"#D94A3A\" strokeWidth={24} strokeLinecap=\"round\" fill=\"none\" />")
    lines.append("    <ellipse cx={730} cy={650} rx={72} ry={60} fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={7} />")
    lines.append("    <path d=\"M 688 615 Q 715 650 688 685\" stroke=\"#161616\" strokeWidth={5} fill=\"none\" strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M 1110 600 Q 1160 560 1175 520\" stroke=\"#D94A3A\" strokeWidth={24} strokeLinecap=\"round\" fill=\"none\" />")
    lines.append("    <ellipse cx={1180} cy={500} rx={68} ry={56} fill=\"#D94A3A\" stroke=\"#161616\" strokeWidth={7} />")
    lines.append("    <rect x={1162} y={400} width={36} height={80} rx={18} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("    <circle cx={1180} cy={392} r={22} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("    <rect x={852} y={420} width={112} height={72} rx={18} fill=\"#0D0F1C\" stroke=\"#000000\" strokeWidth={5} />")
    lines.append("    <rect x={976} y={420} width={112} height={72} rx={18} fill=\"#0D0F1C\" stroke=\"#000000\" strokeWidth={5} />")
    lines.append("    <path d=\"M 964 452 L 976 452\" stroke=\"#0D0F1C\" strokeWidth={8} strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M 852 450 L 840 448 M 1088 450 L 1100 448\" stroke=\"#0D0F1C\" strokeWidth={8} strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M 880 470 L 920 440 M 1010 470 L 1050 440\" stroke=\"#FFFFFF\" strokeWidth={5} strokeLinecap=\"round\" opacity={0.85} />")
    lines.append("    <path d=\"M 880 540 L 1040 540 Q 1040 610 960 610 Q 880 610 880 540 Z\" fill=\"#5E150C\" stroke=\"#161616\" strokeWidth={5} strokeLinejoin=\"round\" />")
    lines.append("    <rect x={895} y={540} width={130} height={18} rx={8} fill=\"#FFFFFF\" stroke=\"#161616\" strokeWidth={3} />")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** The red lobster T-shirt itself, lying on the desk (macro insert S40).")
    lines.append("    The small emblem on its chest is the rig's emblem, copied once — shades + thumbs-up,")
    lines.append("    as on Jake's shirt. */")
    lines.append("const Tshirt: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (")
    lines.append("  <g transform={`translate(${x} ${y}) scale(${s})`}>")
    lines.append("    <path d=\"M -110 -80 L -170 -40 L -120 0 L -120 110 L 120 110 L 120 0 L 170 -40 L 110 -80 Q 0 -40 -110 -80 Z\" fill=\"#C0392B\" stroke=\"#161616\" strokeWidth={6} strokeLinejoin=\"round\" />")
    lines.append("    <path d=\"M 60 -70 L 120 110 L 120 0 L 170 -40 L 110 -80 Q 90 -60 60 -70 Z\" fill=\"#96281B\" opacity={0.6} />")
    lines.append("    <g transform=\"translate(0 22) scale(1.8)\">")
    lines.append("      <ellipse cx={-16.9} cy={-14.3} rx={7.8} ry={5.85} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <path d=\"M -16.9 -13 L -19.5 -6.5\" stroke=\"#161616\" strokeWidth={2} strokeLinecap=\"round\" />")
    lines.append("      <ellipse cx={19.5} cy={-18.2} rx={6.5} ry={5.5} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <rect x={11.05} y={-30.55} width={6.5} height={11.7} rx={3.25} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <path d=\"M 17.55 -21.45 L 17.55 -16.25 M 21.45 -21.45 L 21.45 -16.25\" stroke=\"#161616\" strokeWidth={2} strokeLinecap=\"round\" />")
    lines.append("      <ellipse cx={0} cy={-0.65} rx={8.45} ry={8.45} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <ellipse cx={-5.2} cy={-5.85} rx={6.5} ry={4.55} fill=\"#161616\" />")
    lines.append("      <ellipse cx={5.2} cy={-5.85} rx={6.5} ry={4.55} fill=\"#161616\" />")
    lines.append("      <circle cx={1.95} cy={-7.8} r={1.3} fill=\"#FFFFFF\" />")
    lines.append("      <circle cx={-8.45} cy={-7.8} r={1.3} fill=\"#FFFFFF\" />")
    lines.append("      <path d=\"M -1.3 -5.85 L 1.3 -5.85\" stroke=\"#161616\" strokeWidth={2.6} strokeLinecap=\"round\" />")
    lines.append("      <path d=\"M -11.7 -5.85 L -15.6 -7.8 M 11.7 -5.85 L 15.6 -7.8\" stroke=\"#161616\" strokeWidth={2.6} strokeLinecap=\"round\" />")
    lines.append("      <path d=\"M -4.55 6.5 L 4.55 6.5 L 8.45 15.6 L 0 18.2 L -4.55 15.6 Z\" fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} strokeLinejoin=\"round\" />")
    lines.append("    </g>")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** A beating heart (S64, 'your heartbeat sounds when you\\'re nervous'): lub-dub,")
    lines.append("    scale 1.00 -> ~1.14, two sharp thumps per second — never a smooth sine. */")
    lines.append("const Heart: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {")
    lines.append("  const ph = t % 30;")
    lines.append("  const thump = Math.max(0, 1 - ph / 5) + 0.6 * Math.max(0, 1 - Math.abs(ph - 9) / 5);")
    lines.append("  const beat = 1 + 0.14 * Math.min(1, thump);")
    lines.append("  return (")
    lines.append("    <g transform={`translate(${x} ${y}) scale(${s * beat})`}>")
    lines.append("      <path d=\"M 0 34 Q -58 -8 -34 -38 Q -12 -58 0 -34 Q 12 -58 34 -38 Q 58 -8 0 34 Z\" fill=\"#C0392B\" stroke=\"#161616\" strokeWidth={5} strokeLinejoin=\"round\" />")
    lines.append("      <g stroke={CREAM} strokeWidth={6} fill=\"none\" strokeLinecap=\"round\" opacity={0.9}>")
    lines.append("        {[0, 1, 2].map((i) => (")
    lines.append("          <path key={i} d={`M ${58 + i * 18} ${-22 + i * 8} Q ${76 + i * 20} 0 ${58 + i * 18} ${22 - i * 8}`} />")
    lines.append("        ))}")
    lines.append("      </g>")
    lines.append("    </g>")
    lines.append("  );")
    lines.append("};")
    lines.append("")
    lines.append("/** Lunch on the desk (S104, 'thinking about lunch'): a sandwich and an apple. */")
    lines.append("const Lunch: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (")
    lines.append("  <g transform={`translate(${x} ${y}) scale(${s})`}>")
    lines.append("    <ellipse cx={0} cy={26} rx={150} ry={14} fill=\"#000\" opacity={0.3} />")
    lines.append("    {/* sandwich: golden bread, lettuce + tomato layers peeking out, bottom slice */}")
    lines.append("    <path d=\"M -110 -12 L -10 -72 L 42 18 Z\" fill=\"#EBCB8B\" stroke=\"#161616\" strokeWidth={5} strokeLinejoin=\"round\" />")
    lines.append("    <path d=\"M -98 -22 L -10 -64 L 30 8 Z\" fill=\"#F6E3B0\" />")
    lines.append("    <path d=\"M -110 -12 L 42 18\" stroke=\"#5A9A4A\" strokeWidth={10} strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M -104 -2 L 36 26\" stroke=\"#C0392B\" strokeWidth={7} strokeLinecap=\"round\" />")
    lines.append("    <path d=\"M -100 6 L 30 32 L 8 40 L -88 20 Z\" fill=\"#EBCB8B\" stroke=\"#161616\" strokeWidth={4} strokeLinejoin=\"round\" />")
    lines.append("    <circle cx={120} cy={-6} r={34} fill=\"#C0392B\" stroke=\"#161616\" strokeWidth={5} />")
    lines.append("    <path d=\"M 120 -40 Q 128 -58 140 -56\" stroke=\"#4A7A3A\" strokeWidth={6} fill=\"none\" strokeLinecap=\"round\" />")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** A messy desk (S136, 'real life is messier than a lab'): scattered papers, a tipped mug. */")
    lines.append("const MessyDesk: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (")
    lines.append("  <g transform={`translate(${x} ${y}) scale(${s})`}>")
    lines.append("    <g transform=\"rotate(-14 -80 0)\"><rect x={-150} y={-34} width={140} height={90} fill=\"#F2EAD8\" stroke=\"#161616\" strokeWidth={4} /><path d=\"M -130 -12 L -40 -12 M -130 8 L -60 8\" stroke=\"#4A4438\" strokeWidth={4} strokeLinecap=\"round\" /></g>")
    lines.append("    <g transform=\"rotate(9 60 10)\"><rect x={-10} y={-28} width={140} height={90} fill=\"#EDE8DE\" stroke=\"#161616\" strokeWidth={4} /><path d=\"M 10 -6 L 100 -6 M 10 14 L 80 14\" stroke=\"#4A4438\" strokeWidth={4} strokeLinecap=\"round\" /></g>")
    lines.append("    <g transform=\"translate(120 40) rotate(78)\"><rect x={-24} y={-52} width={48} height={52} rx={8} fill=\"#F4F1EA\" stroke=\"#161616\" strokeWidth={4} /><rect x={-24} y={-36} width={48} height={10} fill=\"#FF8A3D\" /></g>")
    lines.append("    <ellipse cx={150} cy={58} rx={46} ry={10} fill=\"#5B3A26\" opacity={0.8} />")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** A dark plant silhouette for blurred foreground depth (about a third of shots). */")
    lines.append("const FgPlant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (")
    lines.append("  <g transform={`translate(${x} ${y}) scale(${s})`} fill=\"#0E0C12\">")
    lines.append("    <path d=\"M 0 0 Q -70 -120 -30 -220 Q 10 -120 0 0 Z\" />")
    lines.append("    <path d=\"M 0 0 Q 60 -100 90 -200 Q 20 -110 0 0 Z\" />")
    lines.append("    <path d=\"M 0 0 Q -40 -160 10 -260 Q 30 -140 0 0 Z\" />")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** THE SPOTLIGHT EFFECT sign (S31, poster panel 14): a standing board on an easel,")
    lines.append("    right of the Detective's desk — he points at it. Cream board, hand-lettered caps. */")
    lines.append("const SignBoard: React.FC = () => (")
    lines.append("  <g>")
    lines.append("    <path d=\"M 1420 650 L 1390 850 M 1660 650 L 1690 850 M 1540 650 L 1540 850\" stroke=\"#3A2A22\" strokeWidth={10} strokeLinecap=\"round\" />")
    lines.append("    <rect x={1360} y={380} width={360} height={270} rx={10} fill=\"#F6EFE3\" stroke=\"#161616\" strokeWidth={6} />")
    lines.append("    <text x={1540} y={470} textAnchor=\"middle\" fontFamily={FONT.hand} fontSize={44} fill=\"#161616\">THE</text>")
    lines.append("    <text x={1540} y={540} textAnchor=\"middle\" fontFamily={FONT.hand} fontSize={44} fill=\"#161616\">SPOTLIGHT</text>")
    lines.append("    <text x={1540} y={610} textAnchor=\"middle\" fontFamily={FONT.hand} fontSize={44} fill=\"#161616\">EFFECT</text>")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** Jake's replay thought bubble (S62, poster panel 19): a cloud with the lobster in")
    lines.append("    it — he spent the whole night aware of the lobster. The mini lobster is the rig emblem. */")
    lines.append("const ThoughtBubble: React.FC = () => (")
    lines.append("  <g>")
    lines.append("    <circle cx={1120} cy={470} r={10} fill=\"#F6EFE3\" opacity={0.9} />")
    lines.append("    <circle cx={1160} cy={430} r={14} fill=\"#F6EFE3\" opacity={0.9} />")
    lines.append("    <circle cx={1210} cy={380} r={18} fill=\"#F6EFE3\" opacity={0.9} />")
    lines.append("    <g fill=\"#F6EFE3\" stroke=\"#161616\" strokeWidth={5}>")
    lines.append("      <ellipse cx={1360} cy={300} rx={150} ry={80} />")
    lines.append("      <ellipse cx={1270} cy={330} rx={70} ry={50} />")
    lines.append("      <ellipse cx={1450} cy={330} rx={70} ry={50} />")
    lines.append("    </g>")
    lines.append("    <g transform=\"translate(1360 300) scale(1.6)\">")
    lines.append("      <ellipse cx={-16.9} cy={-14.3} rx={7.8} ry={5.85} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <path d=\"M -16.9 -13 L -19.5 -6.5\" stroke=\"#161616\" strokeWidth={2} strokeLinecap=\"round\" />")
    lines.append("      <ellipse cx={19.5} cy={-18.2} rx={6.5} ry={5.5} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <rect x={11.05} y={-30.55} width={6.5} height={11.7} rx={3.25} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <path d=\"M 17.55 -21.45 L 17.55 -16.25 M 21.45 -21.45 L 21.45 -16.25\" stroke=\"#161616\" strokeWidth={2} strokeLinecap=\"round\" />")
    lines.append("      <ellipse cx={0} cy={-0.65} rx={8.45} ry={8.45} fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} />")
    lines.append("      <ellipse cx={-5.2} cy={-5.85} rx={6.5} ry={4.55} fill=\"#161616\" />")
    lines.append("      <ellipse cx={5.2} cy={-5.85} rx={6.5} ry={4.55} fill=\"#161616\" />")
    lines.append("      <circle cx={1.95} cy={-7.8} r={1.3} fill=\"#FFFFFF\" />")
    lines.append("      <circle cx={-8.45} cy={-7.8} r={1.3} fill=\"#FFFFFF\" />")
    lines.append("      <path d=\"M -1.3 -5.85 L 1.3 -5.85\" stroke=\"#161616\" strokeWidth={2.6} strokeLinecap=\"round\" />")
    lines.append("      <path d=\"M -11.7 -5.85 L -15.6 -7.8 M 11.7 -5.85 L 15.6 -7.8\" stroke=\"#161616\" strokeWidth={2.6} strokeLinecap=\"round\" />")
    lines.append("      <path d=\"M -4.55 6.5 L 4.55 6.5 L 8.45 15.6 L 0 18.2 L -4.55 15.6 Z\" fill=\"#FFF8EB\" stroke=\"#161616\" strokeWidth={2.6} strokeLinejoin=\"round\" />")
    lines.append("    </g>")
    lines.append("  </g>")
    lines.append(");")
    lines.append("")
    lines.append("/** Confidence sparkles (S40, poster panel 15): four-point stars around Jake's head,")
    lines.append("    gently pulsing — always visible at the key frame (no t-window like the ui Sparkle). */")
    lines.append("const Sparkles: React.FC<{ t: number }> = ({ t }) => {")
    lines.append("  const o = 0.55 + 0.35 * Math.sin(t / 6);")
    lines.append("  const star = 'M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z';")
    lines.append("  return (")
    lines.append("    <g opacity={o} fill=\"#FFE27A\">")
    lines.append("      <path transform=\"translate(880 460) scale(0.9)\" d={star} />")
    lines.append("      <path transform=\"translate(1090 440) scale(1.1)\" d={star} />")
    lines.append("      <path transform=\"translate(1150 560) scale(0.7)\" d={star} />")
    lines.append("      <path transform=\"translate(855 580) scale(0.6)\" d={star} />")
    lines.append("    </g>")
    lines.append("  );")
    lines.append("};")
    lines.append("")
    lines.append("/** BOLD DARK SUNGLASSES on Jake's face (S43, poster panel 16). The rig's pose.glasses reads as")
    lines.append("    white-framed CLEAR glasses on a black head (dark lenses vanish, the white glints")
    lines.append("    read as frames — S4 first-pass fail), so the shades are drawn here, AFTER the Hero,")
    lines.append("    tracking the hero's pose: x/y/s/yaw come from p0 (head centre = x + yaw*30*s,")
    lines.append("    y - 176*s). Lenses are solid near-black with a bold black frame and ONE small")
    lines.append("    white glint each. */")
    lines.append("const BoldShades: React.FC<{ x: number; y: number; s: number; yaw: number }> = ({ x, y, s, yaw }) => {")
    lines.append("  const eyeY = y - 4 * s;")
    lines.append("  const dx = 21 * (1 - 0.28 * Math.abs(yaw)) * s;")
    lines.append("  const w = 52 * s;")
    lines.append("  const h = 36 * s;")
    lines.append("  return (")
    lines.append("    <g>")
    lines.append("      <path d={`M ${x - 58 * s} ${eyeY - 14 * s} L ${x + 58 * s} ${eyeY - 14 * s}`} stroke=\"#0D0F1C\" strokeWidth={6 * s} strokeLinecap=\"round\" />")
    lines.append("      {[-1, 1].map((sd) => (")
    lines.append("        <g key={sd}>")
    lines.append("          <rect x={x + sd * dx - w / 2} y={eyeY - h / 2} width={w} height={h} rx={10 * s} fill=\"#0D0F1C\" stroke=\"#000000\" strokeWidth={4 * s} />")
    lines.append("          <path d={`M ${x + sd * dx - 8 * s} ${eyeY + 8 * s} L ${x + sd * dx + 8 * s} ${eyeY - 8 * s}`} stroke=\"#FFFFFF\" strokeWidth={3 * s} strokeLinecap=\"round\" opacity={0.85} />")
    lines.append("        </g>")
    lines.append("      ))}")
    lines.append("    </g>")
    lines.append("  );")
    lines.append("};")
    lines.append("")
    lines.append("/** A screen-space question popup: hand font, warm red, inside the frame. */")
    lines.append("const Popup: React.FC<{ lines: string[]; x: number; y: number; size: number }> = ({ lines, x, y, size }) => (")
    lines.append("  <text x={x} y={y} textAnchor=\"middle\" fontFamily={FONT.hand} fontSize={size} fill={RED}>")
    lines.append("    {lines.map((ln, i) => (")
    lines.append("      <tspan key={i} x={x} dy={i === 0 ? 0 : size + 12}>{ln}</tspan>")
    lines.append("    ))}")
    lines.append("  </text>")
    lines.append(");")
    lines.append("")

    n_fg = 0
    for n in range(1, SHOT_COUNT + 1):
        sid = f'S{n}'
        meta = shots[sid]
        seg = segs[sid]
        size, set_name, note = resolve_meta(sid, meta)
        key_f = meta['key']
        len_f = seg['t1'] - seg['t0']
        line = seg['line']
        kind, roles = parse_cast(note)
        expr = MOOD_MAP[expr_for(sid, line)]
        yaw0 = [0.3, -0.35, 0.45, 0.2][n % 4]
        t_off = 40 + n * 37
        is_long = sid in LONG_SHOTS
        lines.append(f"// ---------- {sid}: {size}, {set_name} — {note.split(' — ')[0]} ----------")
        lines.append(f"export const {sid}: React.FC<ShotProps> = ({{ t, len }}) => {{")
        # ---- staging: list of (var, role, x, y, scale, yaw, gesture, look_dir, glasses)
        chars = []
        if kind == 'detective' or kind == 'detective+numbers':
            if set_name == 'schematic':
                pos, yaw = SCHEM_DET, 0.5
            elif set_name == 'bedroom':
                pos, yaw = (BED_WARDROBE if sid == 'S105' else BED_DET), 0.3
            elif set_name == 'kitchen':
                pos, yaw = KIT_DET, 0.3
            elif set_name == 'exterior':
                pos, yaw = EXT_DET, 0.3
            elif set_name == 'rooftop':
                pos, yaw = ROOF_DET, -0.3   # sunset: facing left, toward Jake / the sun
            elif set_name == 'stairwell':
                pos, yaw = STAIR_DET, 0.45
            else:
                pos, yaw = STUDY_DET, yaw0
            chars.append(('det', 'detective', pos, yaw, det_gesture(sid, line, n)))
        elif kind == 'jake':
            pos = JAKE_POS[set_name]
            chars.append(('jake', 'jake', pos, yaw0, jake_gesture(expr)))
        elif kind == 'jake+detective':
            # S181 ONLY, the sunset close: Jake sits on the deck, the Detective stands
            # beside him, glass raised — he closes the video alongside Jake.
            chars.append(('jake', 'jake', S181_JAKE, 0.8, 'sit'))
            chars.append(('det', 'detective', S181_DET, -0.3, 'glass'))
        elif kind in ('numbers', 'none', 'endcard'):
            chars = []   # number boards, object inserts, the end card: no character
        elif kind == 'jake+crowd':
            if size == 'wide':
                guests = [('guestA', PARTY_A, 0.3), ('guestB', PARTY_B, -0.3), ('guestC', PARTY_C, 0.3)]
            elif size == 'two-shot':
                guests = [('guestA', PARTY_A, 0.3)]
            elif size == 'high angle':
                guests = [('guestA', PARTY_A, 0.3), ('guestB', PARTY_B, -0.3), ('guestC', PARTY_C, 0.3)]
            else:
                guests = [('guestA', PARTY_A, 0.3), ('guestB', PARTY_B, -0.3)]
            if sid == 'S156':
                guests = [('guestA', PARTY_A, 0.3)]  # the friend
            if sid == 'S2':
                guests = [('guestA', PARTY.stand(0.38, 0.45), 0.3), ('guestB', PARTY_B2, -0.3)]
                # guestA moved in from u 0.3: at the walk camera's key frame he sat exactly
                # on the left frame edge, half-cropped (borderline note c); 0.38 clears it.
                # guestB stays at 0.88, clear of Jake's walk path (was PARTY_B, hidden behind him)
            if sid == 'S167':
                guests = [('guestA', PARTY_A, 0.3)]  # the first person he asks
            if sid == 'S168':
                guests = [('guestB', PARTY_B, -0.3)]
            chars.append(('jake', 'jake', PARTY_JAKE, yaw0, jake_gesture(expr)))
            for gr, gp, gy in guests:
                chars.append((gr, gr, gp, gy, 'idle'))
        elif kind == 'student+observers':
            if set_name == 'exterior':
                # S16, the Cornell establishing shot: the wearer + observers on the pavement
                wearer_pos, obs_all = EXT_WEARER, [('guestA', EXT_OBS_A, 0.4), ('guestB', EXT_OBS_B, -0.4)]
                obs = obs_all
            elif size == 'wide' or size == 'high angle':
                wearer_pos = CLASS_WEARER
                obs = [('guestA', CLASS_OBS_A, 0.4), ('guestB', CLASS_OBS_B, -0.4)]
            elif size == 'two-shot':
                wearer_pos = CLASS_WEARER
                obs = [('guestA', (900, 840, 0.95), 0.4)]
            else:
                wearer_pos = CLASS_WEARER
                obs = []
            if sid == 'S120':  # a walk: observer A stands in the walker's path at the key
                obs = [('guestB', CLASS_OBS_B, -0.4)]  # frame — use the far-right observer only
            chars.append(('wearer', 'student', wearer_pos, -0.35, jake_gesture(expr)))
            for gr, gp, gy in obs:
                chars.append((gr, gr, gp, gy, 'idle'))
        # ---- pose keys per character
        # Number boards / object inserts have no character (a sliver of a figure at the
        # frame edge would read as a mistake).
        if sid in NO_CHAR_SHOTS:
            chars = []
        hero = chars[0] if chars else None
        for ci, (var, role, pos, yaw, gest) in enumerate(chars):
            x, y, scale = pos
            # The rig's pose.glasses is NEVER used now: on a black head it reads as
            # white-framed clear glasses (S4 first-pass fail). BoldShades draws the dark
            # sunglasses after the Hero for SHADES_SHOTS instead.
            glasses = None
            if sid in WALK_SHOTS and role in ('jake', 'student'):
                wx0, wx1, ground, wscale, facing = WALK[sid]
                lines.append(f"  const p{ci} = walkPose(kf(t, [[0, {wx0}], [len, {wx1}]]), t * 0.6 + 1.2, {fmt(ground)}, {fmt(wscale)}, {{}}, {facing});")
            elif sid == 'S1' and role == 'detective':
                # cold open, CAST-SHEET pose: glass RAISED in the LEFT hand (armL 95/30),
                # right hand scratching the head (armR 120/110), puzzled. The first pass had
                # it backwards (glass low at his side in the right hand).
                k0 = gesture_pose('idle', x, y, scale, yaw, 0, glasses)
                k1 = dict(gesture_pose('idle', x, y, scale, yaw, 0, glasses))
                k1['armL'] = (95, 30)
                k1['armR'] = (120, 110)
                k1['headTilt'] = 6
                k2 = dict(k1)
                k2['armL'] = (88, 26)
                k2['armR'] = (112, 100)
                k2['headTilt'] = 4
                lines.append("  const p0 = poseAt(t, [")
                lines.append(f"    {{ f: 0, p: {js_pose(k0)} }},")
                lines.append(f"    {{ f: {key_f}, p: {js_pose(k1)} }},")
                lines.append(f"    {{ f: {min(len_f - 8, key_f + 40)}, p: {js_pose(k2)} }},")
                lines.append("  ]);")
            elif sid == 'S181' and role == 'jake':
                # deck-sit in profile, legs stretched forward on the deck toward the sun
                # (feet planted on the deck, not dangling off a parapet — the parapet read
                # as standing with bent knees): thighs near-horizontal (85/80), shins
                # nearly straight (a2 85), so the feet land on the deck line (rig leg math:
                # thigh 72 + shin 68, feet at hip + ~12-18px, not hip + 40-60).
                k0 = gesture_pose('idle', x, y, scale, yaw, 0, glasses)
                k0['legL'] = (85, 0)
                k0['legR'] = (80, 5)
                k0['tilt'] = -10
                k1 = dict(gesture_pose('open', x, y, scale, yaw, 0, glasses))
                k1['legL'] = (85, 0)
                k1['legR'] = (80, 5)
                k1['tilt'] = -10
                k1['headTilt'] = 4
                k2 = dict(k1)
                k2['armL'] = (10, -8)
                k2['armR'] = (10, -8)
                k2['headTilt'] = 2
                lines.append("  const p0 = poseAt(t, [")
                lines.append(f"    {{ f: 0, p: {js_pose(k0)} }},")
                lines.append(f"    {{ f: {key_f}, p: {js_pose(k1)} }},")
                lines.append(f"    {{ f: {min(len_f - 8, key_f + 40)}, p: {js_pose(k2)} }},")
                lines.append("  ]);")
            elif sid == 'S51':
                # the trip on the stairs: standing on the tread, then a jolt — arms flail, tilt, oops
                k0 = gesture_pose('idle', x, y, scale, yaw, 0, glasses)
                k1 = dict(gesture_pose('flail', x, y, scale, yaw, 0, glasses))
                k1['tilt'] = 12
                k2 = dict(gesture_pose('idle', x, y, scale, yaw, 0, glasses))
                k2['tilt'] = 4
                lines.append("  const p0 = poseAt(t, [")
                lines.append(f"    {{ f: 0, p: {js_pose(k0)} }},")
                lines.append(f"    {{ f: {key_f}, p: {js_pose(k1)} }},")
                lines.append(f"    {{ f: {min(len_f - 8, key_f + 30)}, p: {js_pose(k2)} }},")
                lines.append("  ]);")
            elif sid == 'S31' and role == 'detective':
                # the sign beat: right hand keeps POINTING at THE SPOTLIGHT EFFECT
                # board (poster panel 14); the LEFT hand raises the glass (cast-sheet
                # pattern, same armL 95/30 -> 88/26 as S1) — the first pass had no
                # glass at all here, both hands empty below the desk line.
                k0 = gesture_pose('idle', x, y, scale, yaw, 0, glasses)
                k1 = dict(gesture_pose('point', x, y, scale, yaw, 0, glasses))
                k1['armL'] = (95, 30)
                k2 = dict(k1)
                k2['armL'] = (88, 26)
                lines.append(f"  const p{ci} = poseAt(t, [")
                lines.append(f"    {{ f: 0, p: {js_pose(k0)} }},")
                lines.append(f"    {{ f: {key_f}, p: {js_pose(k1)} }},")
                lines.append(f"    {{ f: {min(len_f - 8, key_f + 40)}, p: {js_pose(k2)} }},")
                lines.append("  ]);")
            else:
                main = gest
                if role == 'detective' and sid in ('S178', 'S179', 'S180', 'S181'):
                    # the sunset teaser + the close: cast-sheet pose, glass RAISED in the
                    # left hand (S179 first-pass fail: the 'lean' pose left the glass out
                    # of the close-up entirely — the Detective's signature prop was missing).
                    main = 'glass'
                if sid == 'S8' and role == 'guestA':
                    main = 'point'  # a guest points at the lobster
                if sid == 'S167' and role == 'guestA':
                    main = 'open'   # chatting back
                if sid == 'S52':
                    main = 'think'  # phone in hand, reading the wrong text
                # guests look toward the hero (left-side guests look right, right-side look left)
                look_dir = 0.0
                if role in ('guestA', 'guestB', 'guestC'):
                    look_dir = 0.4 if x < 980 else -0.4
                k0 = gesture_pose('idle', x, y, scale, yaw, 0, glasses)
                k1 = gesture_pose(main, x, y, scale, yaw, look_dir, glasses)
                k2 = gesture_pose(main, x, y, scale, yaw * 0.8, 0, glasses, blend=0.5)
                keys = [(0, k0), (key_f, k1), (min(len_f - 8, key_f + 40), k2)]
                if is_long:
                    g2 = DET_CYCLE[(n + 2) % len(DET_CYCLE)] if role == 'detective' else ('open' if main != 'open' else 'wave')
                    keys.append((int(len_f * 0.6), gesture_pose(g2, x, y, scale, -yaw, 0, glasses)))
                    keys.sort(key=lambda kv: kv[0])
                lines.append(f"  const p{ci} = poseAt(t, [")
                for f, p in keys:
                    lines.append(f"    {{ f: {f}, p: {js_pose(p)} }},")
                lines.append("  ]);")
            # face keys: the hero (chars[0]) and Jake / the Detective take the shot's
            # expression; guests/observers stay neutral.
            char_expr = expr if (ci == 0 or role in ('jake', 'detective')) else 'neutral'
            fk = [[0, 'neutral'], [key_f, char_expr]] if char_expr != 'neutral' else [[0, 'neutral']]
            for off, e2 in FACE_EXTRA.get(sid, []):
                if ci == 0:
                    fk.append([(len_f + off) if off < 0 else (key_f + off), MOOD_MAP[e2]])
            fk_str = ', '.join('[%d, %s]' % (f, repr(e)) for f, e in fk)
            lines.append(f"  const f{ci} = faceAt(t, [{fk_str}]);")
        # hand-held props follow the hand exactly (joints + toWorld). The magnifier lives in
        # the Detective's LEFT hand (cast sheet) — find his pose, not p0 (S181's p0 is Jake).
        if sid in GLASS_SHOTS:
            det_ci = next(i for i, c in enumerate(chars) if c[1] == 'detective')
            lines.append(f"  const mg = toWorld(p{det_ci}, joints(p{det_ci}).armL.end);")
        if sid == PHONE_SHOT:
            lines.append("  const ph = toWorld(p0, joints(p0).armR.end);")
        # ---- camera
        z0, z1 = SIZE_CAM[size]
        hx, hy, hscale = hero[2] if hero else (975, 540, 1.0)
        if size == 'wide':
            cx, cy = WIDE_CENTER[set_name]
        elif size == 'medium':
            if set_name == 'schematic':
                cx, cy = 900, 640
                z0, z1 = 1.5, 1.56
            else:
                cx, cy = hx, hy - 60
        elif size == 'close-up':
            if sid == 'S35':
                cx, cy, z0, z1 = 760, 620, 2.6, 2.7
            elif sid == 'S171':
                cx, cy, z0, z1 = 900, 600, 1.9, 2.0
            else:
                cx, cy = hx, hy - 176 * hscale
        elif size == 'macro insert':
            if sid in ('S28', 'S84'):
                cx, cy = 975, 540
            elif sid == 'S4':
                # panel 3, the full-frame BigLobster: pull the zoom out so the whole
                # lobster (700 tall) fills the frame instead of cropping it.
                cx, cy, z0, z1 = 960, 540, 1.5, 1.55
            elif sid == 'S56':
                cx, cy = 960, 500
            elif sid in ('S104', 'S136'):
                cx, cy = 960, 650
            else:
                cx, cy = hx, hy - 60
        elif size == 'high angle':
            cx, cy = hx, 520
            if set_name == 'schematic':
                cx = 900  # the numbers live at x 1050-1500; hx (560) would cut them off (S25)
            if set_name == 'exterior':
                cy = 600
            if sid == 'S105':
                cx, cy = 1045, 560
        elif size == 'low angle':
            if set_name == 'schematic':
                cx, cy = 900, 700
            else:
                cx, cy = hx, hy + 40
        elif size == 'over-the-shoulder':
            cx, cy = hx, hy - 60
        elif size == 'two-shot':
            if sid == 'S31':
                cx, cy = 1050, 580  # Detective at the desk + the sign board at 1380-1720
            elif set_name == 'schematic':
                cx, cy = 900, 640  # Detective + numbers both in frame
            else:
                xs = [c[2][0] for c in chars[:2]]
                cx, cy = sum(xs) / len(xs), (hero[2][1] + chars[1][2][1]) / 2 - 130 if len(chars) > 1 else hy - 60
        # walk shots: the camera follows the walker (except wides, which see the whole room)
        if sid in WALK_SHOTS and size != 'wide':
            wx0, wx1, ground, _ws, _fc = WALK[sid]
            if sid == 'S2':
                # borderline note (c): at the stock zoom the wall clock's top was sliced by
                # the frame top and guestA sat on the left edge — pull the zoom out and
                # drop the camera so the clock clears the top with room to spare.
                z0, z1 = 1.7, 1.75
            cam_y = ground - 250 if sid == 'S2' else ground - 230
            lines.append(f"  const camX = kf(t, [[0, {wx0 - 200}], [len, {wx1}]]);")
            lines.append(f"  const camY = kf(t, [[0, {fmt(cam_y)}], [len, {fmt(cam_y)}]]);")
            lines.append(f"  const zoom = kf(t, [[0, {z0}], [len, {z1}]]);")
        elif is_long:
            lines.append(f"  const camX = kf(t, [[0, {fmt(cx)}], [len, {fmt(cx)}]]);")
            lines.append(f"  const camY = kf(t, [[0, {fmt(cy)}], [len, {fmt(cy)}]]);")
            lines.append(f"  const zoom = kf(t, [[0, {z0}], [len * 0.5, {fmt(z0 + 0.03)}], [len, {z1}]]);")
        else:
            lines.append(f"  const camX = kf(t, [[0, {fmt(cx)}], [len, {fmt(cx)}]]);")
            lines.append(f"  const camY = kf(t, [[0, {fmt(cy)}], [len, {fmt(cy)}]]);")
            lines.append(f"  const zoom = kf(t, [[0, {z0}], [len, {z1}]]);")
        # ---- body
        lines.append("  return (")
        lines.append("    <g>")
        lines.append("      <g transform={camT(camX, camY, zoom)}>")
        veil = 0.28 if size == 'wide' else 0.44
        if set_name == 'study':
            lines.append(f"        <Study t={{t + {t_off}}} id=\"s{n}\" veil={{{veil}}} />")
        elif set_name == 'party':
            lines.append(f"        <Party t={{t + {t_off}}} id=\"s{n}\" veil={{{veil}}} />")
            if sid in SIGN_SHOTS and sid != 'S4':
                # S4 is the full-frame BigLobster moment (panel 3), not the wall sign.
                lines.append("        <LobsterSign />")
            if sid == 'S4':
                lines.append("        <BigLobster />")
        elif set_name == 'classroom':
            if sid in BOARD:
                lines.append(f"        <Classroom t={{t + {t_off}}} id=\"s{n}\" board={{<text x={{740}} y={{380}} textAnchor=\"middle\" fontFamily={{FONT.hand}} fontSize={{72}} fill=\"#EDEFE6\">{BOARD[sid]}</text>}} />")
            else:
                lines.append(f"        <Classroom t={{t + {t_off}}} id=\"s{n}\" />")
        elif set_name == 'schematic':
            lines.append(f"        <Schematic t={{t + {t_off}}} id=\"s{n}\" />")
        elif set_name == 'bedroom':
            lines.append(f"        <Bedroom t={{t + {t_off}}} id=\"s{n}\" crossed={{0}} />")
        elif set_name == 'kitchen':
            lines.append(f"        <Kitchen t={{t + {t_off}}} id=\"s{n}\" />")
        elif set_name == 'exterior':
            lines.append(f"        <Exterior t={{t + {t_off}}} id=\"s{n}\" />")
        elif set_name == 'stairwell':
            lines.append(f"        <Stairwell t={{t + {t_off}}} id=\"s{n}\" />")
        elif set_name == 'rooftop':
            # Rooftop takes no id prop (fixed DuskSky id "roof3" inside); big low sun at
            # (960, 640), city in three depths, string lights — the poster sunset. The haze
            # is the set's own prop (engine-level, reusable), not a per-shot overlay.
            lines.append(f"        <Rooftop t={{t + {t_off}}} haze={{0.3}} />")
        elif set_name == 'endcard':
            lines.append("        <EndCard />")
        if sid == 'S31':
            lines.append("        <SignBoard />")
        if sid in SPOTLIGHT_SHOTS:
            # the spotlight beam, poster panels 6-7: the engine's SpotlightBeam (Cone +
            # floor pool + dust), drawn after the set, before the characters — the hero
            # stands IN the beam. o 0.65, not the 0.45 default: at 0.30 the cone washed
            # out against the party set and at 0.5 the shaft was still soft against the
            # poster's dramatic beam (S7 second-pass note) — the beam is drawn before the
            # characters, so a stronger cone cannot wash Jake out.
            lines.append("        <SpotlightBeam x={980} poolY={860} t={t} o={0.65} />")
        if is_long:
            lines.append(f"        <Glow x={{{fmt(hx)}}} y={{{fmt(hy - 120)}}} r={{320}} o={{kf(t, [[0, 0.25], [len, 0.5]])}} />")
        for ci, (var, role, pos, yaw, gest) in enumerate(chars):
            look = ROLE_LOOK[role]
            lines.append(f"        <Hero look={{LOOKS.{look}}} pose={{{{ ...p{ci}, ...f{ci} }}}} rimId=\"rimInkl\" shadow={{1}} />")
        if sid in SHADES_SHOTS:
            # bold dark sunglasses on the hero's face, tracking his pose (p0) — see BoldShades.
            lines.append("        <BoldShades x={p0.x + p0.yaw * 30 * p0.scale} y={p0.y - 176 * p0.scale} s={p0.scale} yaw={p0.yaw} />")
        if sid == 'S40':
            lines.append("        <Sparkles t={t} />")
        if sid == 'S62':
            lines.append("        <ThoughtBubble />")
        if sid == 'S151':
            lines.append("        <Cat x={1300} y={820} mood=\"sleep\" f={t} />")
        if set_name == 'study':
            lines.append("        <Desk x0={560} x1={1360} y={700} />")
        if set_name == 'classroom' and kind == 'student+observers':
            lines.append("        <SchoolDesk x={1260} />")
        if set_name == 'kitchen':
            lines.append("        <KitchenIsland />")
            mt = KITCHEN.P(0.65, 0.695, 0.546)  # islandTop(0.65, 0.6): top point on the island
            lines.append(f"        <Mug x={{{fmt(mt[0])}}} y={{{fmt(mt[1])}}} rot={{-8}} f={{t}} />")
        if set_name == 'stairwell':
            lines.append("        <Banister />")
        if sid in GLASS_SHOTS:
            lines.append("        <Magnifier x={mg.x} y={mg.y} s={1} />")
        if sid == PHONE_SHOT:
            lines.append("        <Phone x={ph.x} y={ph.y} w={70} rot={-18} on={1} caller=\"BOSS\" f={t} />")  # w 70, not 110: the phone covered his whole torso (S52)
        if sid == 'S56':
            # labels short enough to fit under each circle inside the macro frame (was
            # 'STARING AT THEMSELVES' at size 30 — cut at both edges on the first pass)
            for i, (cx3, label) in enumerate([(660, 'STARTS WITH YOU'), (960, 'STARING AT THEMSELVES'), (1260, 'DIMS FAST')]):
                lines.append(f"        <circle cx={{{cx3}}} cy={{500}} r={{90}} fill=\"{RED}\" stroke=\"#161616\" strokeWidth={{6}} />")
                lines.append(f"        <text x={{{cx3}}} y={{536}} textAnchor=\"middle\" fontFamily={{FONT.hand}} fontSize={{110}} fill=\"{CREAM}\">{i + 1}</text>")
                lines.append(f"        <text x={{{cx3}}} y={{640}} textAnchor=\"middle\" fontFamily={{FONT.ui}} fontSize={{18}} fill=\"{CREAM}\">{label}</text>")
        if sid == 'S64':
            lines.append("        <Heart x={1260} y={560} s={1} t={t} />")  # was 1330: the sound waves touched the right edge
        if sid == 'S104':
            lines.append("        <Lunch x={960} y={650} s={1.2} />")
        if sid == 'S136':
            lines.append("        <MessyDesk x={960} y={650} s={1.1} />")
        # (S152 had a stray giant Magnifier here — a macro insert is a tight framing on the
        # Detective, not a lens; removed after the first-pass board showed a huge blue disc.)
        # schematic numbers
        if sid in NUMBERS:
            for label, val, suf, col, nx, ny, nsize in NUMBERS[sid]:
                color = '#FF8A3D' if col == 'live' else '#7E8DA6'
                if val is None:
                    lines.append(f"        <SchLabel x={{{nx}}} y={{{ny}}} t={{t}} text=\"{label}\" size={{{nsize}}} color=\"{color}\" />")
                else:
                    # label sits above the number with a real gap: big numbers are tall
                    # enough that ny-90 overlaps their tops (S28/S36/S84/S85/S86); but
                    # S171's close-up frame top is 316, so a size-130 label needs ny-130,
                    # not ny-140, or its own top gets clipped
                    ly = ny - 140 if nsize >= 150 else (ny - 130 if nsize >= 130 else ny - 100)
                    lines.append(f"        <SchLabel x={{{nx}}} y={{{ly}}} t={{t}} text=\"{label}\" size={{36}} color=\"{color}\" />")
                    lines.append(f"        <CountUp x={{{nx}}} y={{{ny}}} t={{t}} to={{{val}}} size={{{nsize}}} color=\"{color}\" suffix=\"{suf}\" />")
            if sid == 'S27':
                lines.append("        <Arrow x0={1180} y0={480} x1={1380} y1={480} t={t} color=\"#FF8A3D\" />")
        if sid == 'S173':
            lines.append("        <Gauge x={1050} y={420} p={0.23} label=\"SPOTLIGHT\" />")
        # foreground depth
        if size == 'over-the-shoulder':
            fg_look = ROLE_LOOK[chars[1][1]] if len(chars) > 1 else 'guestA'
            # first pass put the blurred figure's head half out of the top-left corner
            # (S31): +80 right and +150 down keeps the whole head in frame.
            fg_x = cx - 960 / z0 + 200
            fg_y = cy + 540 / z0 - 130
            lines.append("        <Foreground blur={16}>")
            lines.append(f"          <Hero look={{LOOKS.{fg_look}}} pose={{{{ ...basePose, x: {fmt(fg_x)}, y: {fmt(fg_y)}, scale: 2.0, yaw: -0.5, expr: 'neutral' }}}} rimId=\"rimInkl\" shadow={{0}} />")
            lines.append("        </Foreground>")
        elif n % 3 == 0 and size not in ('macro insert', 'close-up') and sid not in WALK_SHOTS and sid != 'S156':
            # (walk shots skip the foreground: its x is computed from the static two-shot
            # centre, but the walk camera follows the walker — on S120 it landed dead-cent
            # and hid the wearer entirely. S156 skips it too: the popup owns the top of
            # the frame and the blurred guest's head collided with its text even after
            # the borderline-note-(c) nudge — the shot already has Jake + the friend +
            # the sign + the popup, it does not need the depth figure.)
            fg_x = cx - 960 / z0 + 60
            fg_y = cy + 540 / z0 - 10
            n_fg += 1
            if set_name in ('party', 'classroom'):
                lines.append("        <Foreground blur={10}>")
                # teal guestA: the mustard guestC was too bright and pulled the eye (S3/S120)
                lines.append(f"          <Hero look={{LOOKS.guestA}} pose={{{{ ...basePose, x: {fmt(fg_x)}, y: {fmt(fg_y - 280)}, scale: 1.8, yaw: 0.4, expr: 'neutral' }}}} rimId=\"rimInkl\" shadow={{0}} />")
                lines.append("        </Foreground>")
            else:
                lines.append("        <Foreground blur={10}>")
                lines.append(f"          <FgPlant x={{{fmt(fg_x)}}} y={{{fmt(fg_y)}}} s={{1.6}} />")
                lines.append("        </Foreground>")
        # title card
        if sid == 'S1':
            lines.append(f"        <TitleCard t={{t}} lines={{['{ep['title'][0]}', '{ep['title'][1]}']}} accent=\"{ep['accentColor']}\" size={{96}} />")
        lines.append("      </g>")
        # screen-space: popups + chapter labels (no end label any more: S181 is the sunset
        # close now, and the teaser lives in the Detective's S178-S180 voiceover lines)
        if sid in POPUPS:
            pl, px, py, ps = POPUPS[sid]
            pl_js = ', '.join(repr(x) for x in pl)
            lines.append(f"      <Popup lines={{[{pl_js}]}} x={{{px}}} y={{{py}}} size={{{ps}}} />")
        if sid in CHAPTER_LABELS:
            lines.append(f"      <text x={{120}} y={{130}} fontFamily={{FONT.hand}} fontSize={{44}} fill=\"{CREAM}\">{CHAPTER_LABELS[sid]}</text>")
        lines.append("    </g>")
        lines.append("  );")
        lines.append("};")
        lines.append("")
    (EP / 'shots.tsx').write_text('\n'.join(lines), encoding='utf-8')
    print(f"wrote {EP / 'shots.tsx'} ({len(lines)} lines, {n_fg} foregrounds)")
    # index.tsx
    all_ids = ', '.join(f'S{i}' for i in range(1, SHOT_COUNT + 1))
    idx = []
    idx.append("import React from 'react';")
    idx.append("import { defineEpisode, Timeline } from '../../engine';")
    idx.append("import timeline from './timeline.json';")
    idx.append(f"import {{ {all_ids} }} from './shots';")
    idx.append("")
    idx.append("// \"The Spotlight Effect\" — 182 shots, full 619.67s rebuild of zenn_002 in the Remotion")
    idx.append("// engine (614.77s of voiceover + a 4 s voiceless Inkl end card, S182). Same script,")
    idx.append("// same George voiceover (reused, public/zenn-002/voice.wav), same approved")
    idx.append("// black-silhouette look. No looks: the dusk grade + vignette come from the")
    idx.append("// engine defaults.")
    idx.append("export const zenn002 = defineEpisode('Zenn002', {")
    idx.append("  timeline: timeline as Timeline,")
    idx.append(f"  shots: {{ {all_ids} }},")
    idx.append("});")
    (EP / 'index.tsx').write_text('\n'.join(idx), encoding='utf-8')
    print(f"wrote {EP / 'index.tsx'}")
    return 0


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if mode == 'check':
        sys.exit(0 if check() else 1)
    if mode == 'sync':
        sys.exit(sync())
    if mode == 'emit':
        sys.exit(emit())
    print('usage: check | sync | emit')
    sys.exit(2)
