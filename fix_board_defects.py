#!/usr/bin/env python3
"""fix_board_defects.py — Bug/glitch FIXING script for the DoodleVerse/INKL Remotion studio.

FOUNDATION, not a one-off patch: the global fixes live in the shared studio code
(src/engine/rig.tsx, src/engine/kit.tsx, shared sets/props) so every episode —
#2, #3, #4 and all future ones — inherits them automatically. The audit/review
steps work on ANY episode's shots file (pass --episode or --shots).

FIX-ONLY: this script patches existing code, removes defects, and audits existing
shots. It NEVER creates scenes, shots, or new content. There is no scene-creation
or shot-generation logic in this file, by design (Javion, Nov 11).

What it fixes (Javion, Nov 11):
  - HAIR — main cast bald / deerstalker, pedestrians get NATURAL hair: the old
    Hair component, hairStyle/hairTuft/hair Look fields, head-hair extras and
    the hairOn gate are removed from rig.tsx and all call sites (Nov 11, "get
    rid of the hair command entirely"). Sleeves/gear/hem/watch/earrings are
    decoupled from hairOn so they render unconditionally (that gate was why
    sleeves vanished). PEDESTRIAN HAIR (Nov 11, "every pedestrian gets hair —
    natural hair, nothing that looks like a hat"): every pedestrian
    (guests/crowd — researcher, student, prisoner, teenager, scientist,
    teacher, guestA/B/C, PartyGuest) gets a PedHair style (crop / sidepart /
    afro / bun / ponytail / curly) in a natural brown. The Detective keeps his
    deerstalker, Jake / the hero / the professors stay bald, the classroom
    kids keep their KidLook hair (bun/pony/cap/curly) — those are the ONLY
    exceptions to the no-hair rule. A style that reads as a hat (smooth dome +
    brim/band, flat crown, pom/button) is a defect, not hair.
  - POPUP words -> moonlight blue (MOONLIGHT in kit.tsx; matches the rimBlue rim).
  - GLOW/RIM -> moonlight blue (rimBlue everywhere; rimInkl retired).
  - SLEEVES connected to the shirt (rendered unconditionally; wider root overlap).
  - LEGS straight/vertical when standing (basePose + shot defaults {a:0,b:0});
    feet stay apart via a wider hip stance (HIP.x 26) and narrower shoes (rx 14).
  - ARMS straight down at the sides by default ({a:5,b:0}); gestures untouched.
  - DUPLICATES + FLOATING ITEMS: audit flags them per shot; the fix removes the
    confirmed ones (oversized phone in S52, edge-cropped crowd figure in Party).
  - LEGS (Nov 12, Javion: "the clothes look disgusting" fix pass): dancing legs —
    a pose key with BOTH legs |b| > 25 (both knees deeply bent at once) — and
    standing poses (x-range < ~40px across the shot's keys) with non-zero leg
    angles. Fix: standing legs -> {a:0,b:0}; walking poses -> an alternating
    walk (one leg near-straight, the other a moderate swing, never both deeply
    bent). Only the flagged (both-deeply-bent) keys are rewritten; single-leg
    bends are left for a human to judge, so a second run changes nothing.
  - DUPLICATES (Nov 12): two Heroes with the identical look (same hair +
    jacket + gear) in one shot. Fix: a later pedestrian duplicate gets its
    look swapped to an unused pedestrian look and a varied arm gesture; a
    main-cast duplicate is NOT auto-changed (removing the Detective/Jake/hero
    is a human call) — it is logged NOT APPLIED.
  - CLOTHES FIT (Nov 12): garments that read as wrong — code proxies only: a
    'jacket' gear whose two front panels do not connect (no shoulder bridge,
    panels ending mid-torso), sleeves too short/narrow to cover the upper arm
    or overlap the torso, a hem that does not sit at the waist/hips, a hood
    wider than a hood (reads as a cape). Fix: the sleeve length/width is
    auto-corrected in rig.tsx; jacket/hood/hem geometry is verified and, if
    it fails, logged NOT APPLIED for a hand edit. Floating/clipping fabric
    CANNOT be proven from code — the audit says so, and a render check is
    still required after any rig change.
  - ARMS (Nov 12): elbow bend b >= 90 (hyper-bent), the odd back-swing
    {a:-60,b:30}, and group shots where every member shares the identical
    NON-neutral arm pose (copying — the neutral hang shared by all members
    is the correct idle pose, not copying, and is never flagged). Fix:
    hyper-bent/back-swung arms -> the hang default {a:4,b:8}; group members
    get varied gestures from a fixed cycle.
  - PLACEMENT: audit reports every character/prop location per shot; fixes move
    items to where they belong (feet on the floor, props on surfaces).
  - DISPLACEMENT (Javion, Nov 11 — "a door in the wrong place"): a set piece in
    the WRONG PLACE in real-life logic is a defect. Doors must sit on a wall
    edge with their bottom on the floor (never floating mid-room, never past a
    wall edge, never overlapping another door); windows must be on a wall;
    furniture must sit on the floor against a wall or in a sensible spot, never
    overlapping a wall or blocking a doorway; wall items (calendars, clocks)
    must be inside the back-wall box and must not cover another wall item
    (vent, picture frame, tallies, door, window). A displaced item is either
    MOVED to the right place by `fix` (the correct spot is computed from the
    set's geometry, never guessed) or, where the right place is ambiguous from
    code alone, REPORTED with its suggested location and left in place — a bad
    auto-move is worse than a flag. Symbolic items are NOT displacement:
    a floating brain/lightbulb/question mark is a symbol by design, and a
    close-up or a deliberate comparison graphic (two calendars side by side,
    a clock in the sky, a calendar filling the frame) is intentional framing.

Modes:
  audit  --episode NAME | --shots PATH [--report PATH]
           Scan the episode's shots file + shared studio files and write a
           PER-SHOT defect report (one section per shot, not summarized).
  fix    [--episode NAME] [--dry-run]
           Apply the global code fixes. Idempotent: a second run changes
           nothing and says so. Prints exactly what changed per file.
  render --episode NAME --shots S4,S5,... --frames 356,459,... --out-dir DIR
           Re-render the given board shots to a FRESH directory (never
           overwrites the board in place). Uses the repo's renderStill path.
  review --episode NAME --board-dir DIR --out PATH
           Write the storyboard-review gate checklist: one section per shot
           (render still -> visual review -> defect list -> fix ->
           re-render -> re-check). No shot moves to animation with a known
           defect still in it.

Usage examples:
  python3 fix_board_defects.py audit --episode zenn-002
  python3 fix_board_defects.py fix --episode zenn-002
  python3 fix_board_defects.py render --episode zenn-002 --shots S4,S5,S6 --frames 356,459,561 --out-dir out/zenn-002/board_fixed_v1
  python3 fix_board_defects.py review --episode zenn-002 --board-dir out/zenn-002/board_fixed_v1 --out review_zenn-002.md
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

STUDIO = Path(__file__).resolve().parent
MOONLIGHT = "#A9C6FF"  # moonlight blue — matches N.rim, the rimBlue rim light

# Pedestrian hair (Nov 11, Javion: every pedestrian gets natural hair, nothing
# that looks like a hat). PedHairStyle + natural browns, from rig.tsx.
PED_HAIR_STYLES = ["crop", "sidepart", "afro", "bun", "ponytail", "curly"]
PED_HAIR_COLORS = ["#3A2420", "#2A1E14", "#5A3A28", "#4A3226", "#6A4A2E", "#241A12", "#8A5A3A", "#3A2A1A"]
# Looks that MUST have PedHair (pedestrians / guests / crowd).
PED_LOOKS = ["researcher", "student", "prisoner", "teenager", "scientist",
             "teacher", "guestA", "guestB", "guestC"]
# Looks that must NEVER have hair (main cast: deerstalker / bald).
BALD_LOOKS = ["detective", "jake", "hero", "profA", "profB", "profC"]

# Episode registry: shots file, board dir, render entry + composition.
# Audit/fix/review work for ANY episode; add a row here to register a new one.
EPISODES = {
    "zenn-002": {
        "shots": STUDIO / "src/episodes/zenn-002/shots.tsx",
        "board": STUDIO / "out/zenn-002/board",
        "entry": "src/index-zenn002.tsx",
        "composition": "Zenn002",
        # Board keyframes for the 14 shots Javion flagged (fix-ranges-board.json).
        "frames": {"S4": 356, "S5": 459, "S6": 561, "S37": 3752, "S38": 3847,
                   "S41": 4144, "S46": 4686, "S48": 4897, "S49": 5008,
                   "S50": 5117, "S51": 5229, "S52": 5316, "S53": 5392, "S55": 5583},
    },
    "zenn-003": {
        "shots": STUDIO / "src/episodes/zenn-003/shots.tsx",
        "board": STUDIO / "out/zenn-003/board",
        "entry": "src/index-zenn003.tsx",
        "composition": "Zenn003",
        "frames": {},
    },
}

# ---------------------------------------------------------------- displacement
# Back-wall boxes per set (code space, from src/engine/sets/*.tsx): (x0, y0, x1, y1).
# A wall item (door, window, calendar, clock) must sit INSIDE its set's back wall.
WALL_BOXES = {
    "Cell": (520, 330, 1400, 740),
    "Classroom": (300, 130, 1500, 720),
    "Study": (530, 335, 1430, 740),
    "Bedroom": (480, 320, 1440, 742),
    "Kitchen": (500, 330, 1420, 745),
    "Lab": (500, 330, 1420, 745),
    "Party": (520, 330, 1440, 745),
}
# The Cell's back-wall floor line (a door's bottom must land on it, +/-12px).
CELL_FLOOR_Y = 740
CLASSROOM_FLOOR_Y = 720
# Items the Cell set itself always renders on its back wall (cell.tsx), as
# (name, x0, y0, x1, y1). A Prop wall item must not cover one of these.
CELL_BUILTIN = [
    ("tallies", 600, 560, 804, 630),
    ("vent", 1330, 420, 1386, 460),
    ("light switch", 560, 640, 586, 680),
    ("wall picture frame", 560, 520, 624, 600),
]
# The Cell's built-in door and window (cell.tsx), rendered only when the shot
# passes the matching flag: door x 1060..1290 y 380..740; window x 640..830 y 370..490.
CELL_DOOR = ("built-in door", 1060, 380, 1290, 740)
CELL_WINDOW = ("built-in window", 640, 370, 830, 490)
# The Classroom's built-in wall items (classroom.tsx): board, pinboard, clock.
CLASSROOM_BUILTIN = [
    ("board", 410, 290, 1070, 570),
    ("pinboard", 1110, 300, 1350, 540),
    ("wall clock", 1362, 282, 1478, 398),
]


def prop_box(kind, x, y, s):
    """Screen box (x0, y0, x1, y1) of a <Prop> from props.tsx / the local Prop
    switch in the shots file:
    door rect x +/-110*s, y +/-180*s; calendar box x +/-130*s, y -170*s..+173*s;
    wall clock circle r=44*s; wall-hung cards/frames (mirror, checklist, note,
    number_card, test_paper, picture_frames, photos, recap_board,
    whisper_walls, brick_wall) use their rect half-width and y offsets."""
    if kind == "door":
        return (x - 110 * s, y - 180 * s, x + 110 * s, y + 180 * s)
    if kind == "calendar":
        return (x - 130 * s, y - 170 * s, x + 130 * s, y + 173 * s)
    if kind == "wall_clock":
        return (x - 44 * s, y - 44 * s, x + 44 * s, y + 44 * s)
    # (half-width, top offset, bottom offset) before scale — from the local
    # Prop switch in the shots file.
    wall_hung = {
        "mirror": (62, -70, 86), "checklist": (70, -90, 90), "note": (80, -70, 70),
        "number_card": (80, -70, 70), "test_paper": (70, -70, 70),
        "picture_frames": (100, -60, 40), "photos": (96, -62, 42),
        "recap_board": (105, -70, 70), "whisper_walls": (105, -60, 60),
        "brick_wall": (110, -70, 70),
    }
    if kind in wall_hung:
        hx, hy0, hy1 = wall_hung[kind]
        return (x - hx * s, y + hy0 * s, x + hx * s, y + hy1 * s)
    return (x, y, x, y)


# Wall-hung Prop kinds the displacement check covers (their rect geometry is
# in prop_box). Symbolic door graphics (door_row, memory_door) are NOT in this
# list: they hang on the wall as pictures, so only the wall-bounds check
# applies to them — they never have to reach the floor and their overlap with
# a wall item is layering, not displacement.
WALL_HUNG_KINDS = ("mirror", "checklist", "note", "number_card", "test_paper",
                   "picture_frames", "photos", "recap_board", "whisper_walls",
                   "brick_wall")
# A wall item covering a STORY element (tallies, built-in door, built-in
# window) hides information the story needs — that is displacement. Covering a
# piece of decor (vent, picture frame, light switch) is only displacement when
# it is substantial (>3000px2): a card pinned over a vent is clutter, a card
# swallowing two-thirds of the picture frame is a misplaced item.
STORY_ITEMS = ("tallies", "built-in door", "built-in window")
DECOR_OVERLAP_LIMIT = 3000


def rect_overlap(a, b):
    """Overlap area in px^2 of two (x0, y0, x1, y1) boxes (0 if they do not touch)."""
    ox = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    oy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    return ox * oy


# Displaced items whose correct place is AMBIGUOUS from code alone: the audit
# flags them with the suggested location and `fix` does NOT move them.
# (shot, item, where it is, where it should be)
DISPLACEMENT_FLAGS = {
    "zenn-003": [
        ("S23", "calendar", "floating in open cave air at x=1300 y=578 (the Cave has no back wall)",
         "hang it from the cave rope at x~1330 y~500, or lean it against the right rock mass"),
        ("S24", "calendar", "floating in open cave air at x=1272 y=460 (the Cave has no back wall)",
         "hang it from the cave rope at x~1330 y~500, or lean it against the right rock mass"),
        ("S103", "mirror", "at x=1347 y=507, covering part of the vent and 9px past the wall edge (the picture moved to x=560 in v14, so the mirror no longer covers it)",
         "there is no clean free span on this wall — left hits the calendar, up hits the vent, down to y~663 reads as a full-length mirror; or remove it, since the shot is about the calendar"),
    ],
    "zenn-002": [],
}
# Intentional framing that LOOKS like displacement but is not — the audit must
# never flag these: S123 is a deliberate two-calendar comparison ("NOT THE
# SAME": 3 months vs 14 months); S139 is a calendar close-up (the calendar IS
# the subject, filling the frame); S131 is a symbolic clock floating in the
# dusk sky ("NOT ON YOUR SCHEDULE" — time in the sky is the point).
DISPLACEMENT_EXCEPTIONS = {
    "zenn-003": {"S123": "two calendars — deliberate comparison graphic", "S139": "calendar close-up",
                 "S131": "wall clock in the sky — symbolic, the point of the shot"},
    "zenn-002": {},
}
# Confirmed displacements `fix` moves, per episode and shot:
# (kind, old x, old y, old s, new x, new y, new s, why).
# Every new position was computed from the set's wall geometry (free span that
# clears the vent, picture frame, tallies and the pendant lamp) — never guessed.
# The Cell's built-in door lives at x 1060..1290, y 380..740 (centre 1175, bottom
# 740); a Prop door belongs exactly on that spot. The classroom's only free wall
# span is the back wall's right end, under the clock.
DISPLACEMENT_FIXES = {
    "zenn-003": {
        "S5": [("calendar", 1420, 420, 0.9, 1170, 520, 0.9, "was off the wall top-right (top 267 < 330, right 1537 > 1400) and covered the vent + picture frame; moved onto the free wall span")],
        "S12": [("note", 928.6, 700, 1.1, 928.6, 640, 1.1, "the note straddled the wall/floor line (bottom 777, 37px below the floor) — neither on the wall nor on the floor; moved up so it hangs fully on the wall")],
        "S21": [("wall_clock", 1300, 460, 1, 1280, 460, 1, "clock covered the vent's left edge (560px2 overlap); shifted 20px left, clear of the vent")],
        "S25": [("calendar", 1300, 460, 1.1, 1170, 520, 1.0, "was off the wall top-right and covered the vent + picture frame; s 1.1 -> 1.0 so it fits the free span clear of the pendant lamp and the frame")],
        "S26": [("calendar", 966.3, 594.8, 1.1, 1170, 520, 1.0, "bottom 785 was 45px below the floor line (a wall calendar cannot hang past the floor); s 1.1 -> 1.0 so it fits the free span")],
        "S31": [("calendar", 1300, 577.8, 1, 1170, 520, 1, "was off the wall top-right (top 273 < 330, right 1443 > 1400) and covered the vent + picture frame; moved onto the free wall span")],
        "S33": [("wall_clock", 1300, 460, 1, 1280, 460, 1, "clock covered the vent's left edge (560px2 overlap); shifted 20px left, clear of the vent")],
        "S46": [("calendar", 1300, 460, 1, 1170, 520, 1, "was off the wall top-right (top 290 < 330, right 1430 > 1400) and covered the vent + picture frame; moved onto the free wall span")],
        "S53": [("wall_clock", 1350, 420, 0.9, 1280, 460, 0.9, "clock sat almost entirely on the vent (2240px2 overlap — the vent was hidden behind it); moved down-left, clear of the vent")],
        "S102": [("calendar", 733.7, 500, 1, 1170, 520, 1, "calendar covered the day-count tallies (14000px2 overlap — the tallies were hidden); moved onto the free wall span")],
        "S103": [("calendar", 700, 639, 0.9, 1170, 520, 0.9, "bottom 795 was 55px below the floor line and it covered the tallies; moved onto the free wall span")],
        "S129": [("wall_clock", 1300, 480, 0.9, 1280, 480, 0.9, "clock's right edge touched the vent (200px2 overlap); shifted 20px left, clear of the vent")],
        "S150": [("photos", 1400, 480, 0.7, 1230, 520, 0.7, "the photos stuck 67px past the wall's right edge (1467 > 1400), pinned across the wall corner onto the side wall; moved left and down onto the wall, clear of the vent and the picture frame")],
        "S133": [("door", 1300, 500, 1, 1175, 560, 1, "DUPLICATE door: the Prop door overlapped the built-in Cell door by 30000px2, floated 60px above the floor and stuck past the wall edge; aligned onto the built-in door's spot so it reads as the SAME door, open")],
        "S134": [("door", 1265.7, 500, 1, 1175, 560, 1, "DUPLICATE door: the Prop door overlapped the built-in Cell door by 40200px2 and floated 60px above the floor; aligned onto the built-in door's spot")],
        "S136": [("door", 1300, 500, 0.9, 1175, 578, 0.9, "DUPLICATE door: the Prop door overlapped the built-in Cell door by 25098px2 and floated 78px above the floor; aligned onto the built-in door's spot (y=578 so its bottom lands on the floor at s=0.9)")],
        "S143": [("door", 1073.3, 583.8, 1, 1175, 560, 1, "DUPLICATE door: the Prop door overlapped the built-in Cell door by 41328px2 and sank 24px below the floor; aligned onto the built-in door's spot")],
        "S144": [("door", 1139.3, 587.8, 1, 1175, 560, 1, "door sank 28px below the floor (bottom 768 vs 740); moved onto the Cell door's standard spot so its bottom lands on the floor")],
        "S156": [("door", 860.6, 661, 1, 1434, 612, 0.6, "door stood in the middle of the classroom, bottom 121px below the floor line; moved to the back wall's right end (the only free span, under the clock) at s=0.6 so it fits")],
        "S158": [("door", 1300, 500, 1, 1175, 560, 1, "door stuck past the wall's right edge (1410 > 1400) and floated 60px above the floor; moved onto the Cell door's standard spot so its bottom lands on the floor")],
    },
    "zenn-002": {},
}


def _door_aligned(box, door_rect):
    """A Prop door drawn exactly on the built-in door's spot IS the same door
    (the open-door overlay over the closed built-in door), not a duplicate.
    Aligned = same centre x and same bottom, within 12px."""
    cx = (box[0] + box[2]) / 2
    dcx = (door_rect[0] + door_rect[2]) / 2
    return abs(cx - dcx) <= 12 and abs(box[3] - door_rect[3]) <= 12


def audit_displacement(block, shot_name, episode):
    """DISPLACEMENT check (new audit category, alongside duplicates/floating/
    location): doors on walls, windows on walls, furniture on the floor in a
    sensible spot, nothing blocking a doorway, nothing outside the set bounds.
    Returns (flags, notes): flags are defects to fix or flag; notes are
    intentional-framing exceptions (not defects, not counted as flagged)."""
    flags = []
    notes = []
    if shot_name in DISPLACEMENT_EXCEPTIONS.get(episode, {}):
        notes.append(f"DISPLACEMENT (exception, not a defect): {DISPLACEMENT_EXCEPTIONS[episode][shot_name]}")
        return flags, notes
    setm = re.search(r"<(Cell|Cave|Classroom|Exterior|Lab|Party|Study|Bedroom|Kitchen)\b", block)
    if not setm:
        return flags, notes  # abstract/graphic shot with no set — nothing to displace
    set_name = setm.group(1)
    wall = WALL_BOXES.get(set_name)
    # Built-in wall items for this shot's set.
    builtin = []
    cell_tag = re.search(r"<Cell[^>]*>", block) if set_name == "Cell" else None
    if cell_tag:
        builtin = list(CELL_BUILTIN)
        if re.search(r"\bdoor\b", cell_tag.group(0)):
            builtin.append(CELL_DOOR)
        if re.search(r"\bwindow\b", cell_tag.group(0)):
            builtin.append(CELL_WINDOW)
    elif set_name == "Classroom":
        builtin = list(CLASSROOM_BUILTIN)
    # --- Prop wall items: doors, calendars, clocks, and wall-hung cards/frames
    #     with explicit positions. Symbolic door graphics (door_row, memory_door)
    #     hang on the wall as pictures, so only the wall-bounds check applies.
    prop_kinds = "door|calendar|wall_clock|" + "|".join(WALL_HUNG_KINDS) + "|door_row|memory_door"
    for m in re.finditer(r'<Prop kind="(' + prop_kinds + r')"[^>]*?x=\{([\d.]+)\}[^>]*?y=\{([\d.]+)\}[^>]*?s=\{([\d.]+)\}', block):
        kind, x, y, s = m.group(1), float(m.group(2)), float(m.group(3)), float(m.group(4))
        box = prop_box(kind, x, y, s)
        box_r = tuple(round(v) for v in box)
        if set_name in ("Cave", "Exterior"):
            # No back wall exists here; a wall item can only be a deliberate
            # symbol/close-up (recorded as an exception above) or a flag.
            flags.append(f"DISPLACEMENT: {kind} at x={x} y={y} s={s} (box {box_r}) — the {set_name} has no back wall, so a wall item floats in open air; see the flagged-item list for its suggested location")
            continue
        if wall is None:
            continue
        # (a) inside the back-wall box?
        if box[0] < wall[0] - 1 or box[2] > wall[2] + 1 or box[1] < wall[1] - 1 or box[3] > wall[3] + 1:
            flags.append(f"DISPLACEMENT: {kind} at x={x} y={y} s={s} (box {box_r}) is OUTSIDE the {set_name} back wall {wall}")
        # (b) a door's bottom must land on the floor line.
        floor_y = CELL_FLOOR_Y if set_name == "Cell" else (CLASSROOM_FLOOR_Y if set_name == "Classroom" else wall[3])
        if kind == "door" and abs(box[3] - floor_y) > 12:
            flags.append(f"DISPLACEMENT: door at x={x} y={y} s={s} — bottom {round(box[3])} vs floor {floor_y} (off by {round(box[3] - floor_y)}px); a door must reach the floor")
        if kind in ("door_row", "memory_door"):
            continue  # symbolic graphics: bounds only, no overlap rules
        # (c) must not cover another wall item. Standard fixtures (door,
        #     calendar, clock) must not touch anything; beat cards may layer
        #     over decor a little, but covering a story element (tallies, door,
        #     window) or swallowing decor (>3000px2) is displacement.
        for name, bx0, by0, bx1, by1 in builtin:
            if kind == "door" and name == "built-in door":
                continue  # the duplicate check (d) below is the authoritative one for doors
            ov = rect_overlap(box, (bx0, by0, bx1, by1))
            if kind in ("door", "calendar", "wall_clock"):
                if ov > 500:
                    flags.append(f"DISPLACEMENT: {kind} at x={x} y={y} s={s} covers the {name} ({round(ov)}px2 overlap) — wall items must not sit on top of each other")
            elif name in STORY_ITEMS:
                if ov > 500:
                    flags.append(f"DISPLACEMENT: {kind} at x={x} y={y} s={s} covers the {name} ({round(ov)}px2 overlap) — it hides a story element")
            elif ov > DECOR_OVERLAP_LIMIT:
                flags.append(f"DISPLACEMENT: {kind} at x={x} y={y} s={s} covers the {name} ({round(ov)}px2 overlap) — a wall item swallowing another wall item is misplaced")
        # (d) a Prop door must never duplicate the built-in door — unless it is
        #     aligned onto it, in which case it IS the same door, open.
        if kind == "door" and cell_tag and re.search(r"\bdoor\b", cell_tag.group(0)):
            ov = rect_overlap(box, CELL_DOOR[1:])
            if ov > 500 and not _door_aligned(box, CELL_DOOR[1:]):
                flags.append(f"DISPLACEMENT: DUPLICATE door — the Prop door overlaps the built-in Cell door by {round(ov)}px2 (two doors in one doorway); align the Prop door onto the built-in door's spot (x=1175, y=560) so it reads as the SAME door, open")
    # --- Furniture (Box): its u/v/w ranges must stay inside the room [0,1].
    for m in re.finditer(r"<Box\b[^>]*?\bu=\{\[([\d.,\s-]+)\]\}\s*v=\{\[([\d.,\s-]+)\]\}\s*w=\{\[([\d.,\s-]+)\]\}", block):
        for label, vals in zip(("u", "v", "w"), m.groups()):
            nums = [float(v) for v in vals.split(",") if v.strip()]
            if nums and (min(nums) < 0 or max(nums) > 1):
                flags.append(f"DISPLACEMENT: furniture Box {label}={nums} leaves the room [0,1] — a piece of furniture cannot sit outside the set bounds")
    # --- Nobody stands inside a doorway opening: a character whose whole figure
    #     (head top to feet) fits inside the door rect is standing IN the doorway.
    #     (Characters drawn in front of a door are taller than the doorway, so
    #     their head top is above the door's top — that is normal, not a flag.)
    door_rect = None
    if cell_tag and re.search(r"\bdoor\b", cell_tag.group(0)):
        door_rect = CELL_DOOR[1:]
    elif re.search(r'<Prop kind="door"', block):
        dm = re.search(r'<Prop kind="door"[^>]*?x=\{([\d.]+)\}[^>]*?y=\{([\d.]+)\}[^>]*?s=\{([\d.]+)\}', block)
        if dm:
            door_rect = prop_box("door", float(dm.group(1)), float(dm.group(2)), float(dm.group(3)))
    if door_rect is not None:
        for m in re.finditer(r"\{ f: \d+, p: \{ x: ([\d.]+), y: ([\d.]+), scale: ([\d.]+)", block):
            px, py, ps = float(m.group(1)), float(m.group(2)), float(m.group(3))
            head_top = py - 378 * ps
            if (door_rect[0] <= px <= door_rect[2] and door_rect[1] <= head_top
                    and py <= door_rect[3]):
                flags.append(f"DISPLACEMENT: a character at ({px},{py}) s={ps} stands INSIDE the doorway opening (whole figure fits in the door rect) — nobody stands inside a doorway")
    # --- Ambiguous flagged items (correct place not determinable from code alone).
    for (shot, item, where, should) in DISPLACEMENT_FLAGS.get(episode, []):
        if shot == shot_name:
            flags.append(f"DISPLACEMENT (flagged, NOT auto-moved): {item} — {where}; should be: {should}")
    return flags, notes

class ChangeLog:
    """Collects exactly what changed per file, for the printed report.

    Two buckets: `files` counts CHANGES (a second run must report 0 of
    these — idempotent); `notes` are findings that needed NO change and
    need a human call (NOT APPLIED items). Notes are printed separately and
    never counted as changes, so a re-run that only re-notes them still
    reports 0 changes."""

    def __init__(self):
        self.files = {}  # path -> list of change descriptions
        self.notes = {}  # path -> list of NOT APPLIED / informational notes

    def add(self, path, desc):
        self.files.setdefault(str(path), []).append(desc)

    def note(self, path, desc):
        self.notes.setdefault(str(path), []).append(desc)

    def print(self):
        total = 0
        for path, descs in self.files.items():
            print(f"\n{path}:")
            for d in descs:
                print(f"  - {d}")
                total += 1
        if total == 0:
            print("  (no changes — everything already applied)")
        return total

    def print_notes(self):
        total = 0
        for path, descs in self.notes.items():
            print(f"\n{path}:")
            for d in descs:
                print(f"  - {d}")
                total += 1
        return total


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write_verified(path, text):
    """Write via a plain write, then read back and verify byte-for-byte."""
    path = Path(path)
    path.write_text(text, encoding="utf-8")
    back = path.read_text(encoding="utf-8")
    if back != text:
        raise IOError(f"VERIFY FAILED after writing {path}: read-back differs")
    return True


def sub_count(text, pattern, repl, flags=0):
    """re.subn wrapper returning (new_text, count)."""
    return re.subn(pattern, repl, text, flags=flags)


def replace_exact(text, old, new):
    """Exact-string replacement; returns (new_text, count)."""
    n = text.count(old)
    return text.replace(old, new), n


def split_shots(shots_text):
    """Split a shots.tsx into {shot_name: block_text} on `export const S{n}:`."""
    pat = re.compile(r"^export const (S\d+): React\.FC<ShotProps>", re.M)
    matches = list(pat.finditer(shots_text))
    out = {}
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(shots_text)
        out[m.group(1)] = shots_text[start:end]
    return out


# ---------------------------------------------------------------- legs / arms / duplicates / clothes
# Pose-key parsing (Nov 12 fix pass): shots write poses as poseAt(t, [{ f, p: { x,
# y, scale, ..., armL: {a,b}, armR: {a,b}, legL: {a,b}, legR: {a,b} } }, ...]).
# A key may omit a limb (it inherits basePose), so each key's fields are
# extracted individually and a missing limb is None, never assumed.
ARM_HANG = "{ a: 4, b: 8 }"  # the hang default a hyper-bent / back-swung arm is restored to
BACK_SWING = (-60.0, 30.0)  # the odd back-swing arm pose
WALK_SWING = "{ a: 14, b: -12 }"  # moderate swing leg for the alternating-walk rewrite
UPPER_ARM_LEN = 62  # rig.tsx UPPER_ARM — a sleeve must cover most of this to read as clothed
# Varied arm gestures, one per group member (hang, small raises, a point) — the
# group-copying fix cycles through these so no two members share a pose.
ARM_GESTURE_CYCLE = [
    ("{ a: 4, b: 8 }", "{ a: 4, b: 8 }"),
    ("{ a: 20, b: 8 }", "{ a: 35, b: 15 }"),
    ("{ a: 35, b: 15 }", "{ a: 20, b: 8 }"),
    ("{ a: -20, b: 8 }", "{ a: 20, b: 8 }"),
    ("{ a: 55, b: 20 }", "{ a: 4, b: 8 }"),
    ("{ a: 4, b: 8 }", "{ a: 55, b: 20 }"),
]


def _brace_match(text, open_idx):
    """Index of the `}` that closes the `{` at open_idx (brace counting)."""
    depth = 0
    for i in range(open_idx, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                return i
    return -1


def _pbody_spans(body):
    """[(f, pbody_start, pbody_end), ...] for each pose key in a poseAt body.

    Brace matching, not a regex: a non-greedy `p: {(.*?)} }` regex stops one
    brace early and drops the key's LAST limb (legR) — that silently broke
    the both-legs-bent check. The p dict's closing brace is found by
    counting, so every limb dict in the key is complete."""
    out = []
    for sm in re.finditer(r"\{ f: (\d+), p: \{", body):
        open_idx = sm.end() - 1  # the `{` that opens the p dict
        close_idx = _brace_match(body, open_idx)
        if close_idx == -1:
            continue
        out.append((int(sm.group(1)), sm.end(), close_idx))
    return out


def _key_from_pbody(f, pbody):
    """Parse one key's p dict into {'f', 'x', 'armL', 'armR', 'legL', 'legR'}."""
    key = {"f": f}
    xm = re.search(r"x: ([\d.]+)", pbody)
    key["x"] = float(xm.group(1)) if xm else None
    for limb in ("armL", "armR", "legL", "legR"):
        lm = re.search(limb + r": \{ a: ([-\d.]+), b: ([-\d.]+) \}", pbody)
        key[limb] = (float(lm.group(1)), float(lm.group(2))) if lm else None
    return key


def parse_pose_blocks(block):
    """Parse every `const pN = poseAt(t, [...]);` in a shot block.

    Returns {pose_var: [key, ...]} where a key is {'f': int, 'x': float|None,
    'armL'/'armR'/'legL'/'legR': (a, b)|None}."""
    out = {}
    for m in re.finditer(r"const (p\d+) = poseAt\(t, \[(.*?)\]\);", block, flags=re.DOTALL):
        body = m.group(2)
        out[m.group(1)] = [_key_from_pbody(f, body[s:e]) for (f, s, e) in _pbody_spans(body)]
    return out


def shot_heroes(block):
    """[(identity, pose_var, span_start), ...] for every <Hero>/<Actor> in a
    shot block, in JSX order. Only the `pose={{ ...pN, ...}}` form is mapped
    (the form every episode uses); anything else is skipped, never guessed.

    Identity is (base look, overrides): a plain `look={LOOKS.x}` and a
    spread `look={{...LOOKS.x, hair: 'crop', ...}}` are different identities
    — the spread overrides (hair / jacket / gear) are exactly what makes two
    same-base characters different people, so they must not count as a
    duplicate of each other."""
    out = []
    pat = re.compile(r"<(?:Hero|Actor) look=\{(?:LOOKS\.(\w+)|\{\.\.\.LOOKS\.(\w+),([^}]*)\})\} pose=\{\{ \.\.\.(p\d+)")
    for m in pat.finditer(block):
        if m.group(1):
            ident = (m.group(1), "")
        else:
            ident = (m.group(2), re.sub(r"\s+", "", m.group(3) or ""))
        out.append((ident, m.group(4), m.start()))
    return out


def _path_extents(d):
    """(xmin, xmax, ymin, ymax) of an SVG path's coordinate numbers, or None."""
    nums = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d)]
    if len(nums) < 4:
        return None
    xs, ys = nums[0::2], nums[1::2]
    return (min(xs), max(xs), min(ys), max(ys))


def audit_clothes_fit(rig_text):
    """CLOTHES-FIT check on rig.tsx (Nov 12, v7). Code proxies ONLY — a render
    check is still required (see the note in the returned flags): the script
    cannot see floating or clipping fabric. Returns a list of flags.
    v7 (Javion: "just take the fucking rectangle sleeves off and leave the shirt"):
    SLEEVES WERE GONE ENTIRELY. Every sleeve shape tried — v6 quad, v7 torso-stub,
    v7 stroke tube, v7 tapered tube — still read as a rectangle/tab pasted on the
    shoulder. The shirt is the torso only; arms are bare black stick arms.
    v17 EXCEPTION (Javion: "put long sleeves on the ppl in snow? you know like a
    sweater?"): the snow researchers (LOOKS.researcher) DO get long sleeves — a
    sleeve() helper gated on the look's sleeve field, drawn BEFORE the torso with
    its start buried 24px inside the torso, so the join is hidden and the sleeve
    reads as ONE sweater with the torso.
    v18 (Javion: "do the same thing for T-Shirts? for the other ppl... the ones
    thats not in snow"): the same technique now covers EVERYONE — shirt-wearers
    get SHORT sleeves (sleeve: 'tshirt', upper arm only, forearm bare, via
    tshirtSleeve() + bareFrom()) and jacket/coat-wearers get FULL sleeves
    (sleeve: 'long', shoulder to wrist, via sleeve()). Both helpers must be gated
    on the look's sleeve field and drawn BEFORE the torso with the start buried
    24px inside it. So this check flags: a sleeve()/tshirtSleeve() that is NOT
    gated on L.sleeve, a sleeve call outside the gate, a look with the WRONG
    sleeve for its garment, a look with NO sleeve that should have one, or the
    old `sweater:` field (migrated to sleeve: 'long' in v18). The v5 shoulder
    caps and jacket panels are GONE by design — this check flags them if they
    come back. The legacy puppet cast (pip, pipHood, pipInk, mo, sis, mom, suit)
    has no sleeve field and stays bare-armed — they are not in video #3."""
    flags = []
    # --- SLEEVES (Nov 12 v17+v18). A sleeve()/tshirtSleeve() helper is allowed
    #     ONLY if it is gated on L.sleeve and drawn before the torso, with the
    #     start buried 24px inside the torso.
    if re.search(r"const sleeve\s*=", rig_text):
        if not re.search(r"\{L\.sleeve === 'long' \? <>\{sleeve\(j\.armL\)\}\{sleeve\(j\.armR\)\}</> : null\}", rig_text):
            flags.append("SLEEVE: a sleeve() function is in rig.tsx but its calls are NOT gated on L.sleeve === 'long' before the torso — an ungated sleeve is the v7 tab defect (its top shows on the shoulder); gate both sleeve() calls on L.sleeve === 'long' and draw them before the torso with the start buried inside it (code proxy — confirm on a render)")
        if not re.search(r"inward \* 24", rig_text):
            flags.append("SLEEVE: the sleeve() start is NOT buried 24px inside the torso — without the buried start the sleeve's round cap shows on the shoulder and reads as a tab (the v7 failure); bury the start toward the body centre (code proxy — confirm on a render)")
    elif re.search(r"\{sleeve\(j\.arm[LR]\)\}", rig_text):
        flags.append("SLEEVE: a sleeve() call is in rig.tsx but there is no sleeve() function — check by hand")
    if re.search(r"const tshirtSleeve\s*=", rig_text):
        if not re.search(r"\{L\.sleeve === 'tshirt' \? <>\{tshirtSleeve\(j\.armL\)\}\{tshirtSleeve\(j\.armR\)\}</> : null\}", rig_text):
            flags.append("SLEEVE: a tshirtSleeve() function is in rig.tsx but its calls are NOT gated on L.sleeve === 'tshirt' before the torso — an ungated sleeve is the v7 tab defect (its top shows on the shoulder); gate both tshirtSleeve() calls on L.sleeve === 'tshirt' and draw them before the torso with the start buried inside it (code proxy — confirm on a render)")
        if not re.search(r'strokeLinecap="butt"', rig_text):
            flags.append("SLEEVE: the tshirtSleeve() has no flat hem (butt caps) — a round cap at mid-upper-arm reads as a tube end, not a sleeve hem; give the t-shirt sleeve flat butt-cap ends (code proxy — confirm on a render)")
    elif re.search(r"\{tshirtSleeve\(j\.arm[LR]\)\}", rig_text):
        flags.append("SLEEVE: a tshirtSleeve() call is in rig.tsx but there is no tshirtSleeve() function — check by hand")
    if re.search(r"const L1 = \d+;", rig_text) or re.search(r"const WT = \d+;", rig_text) or re.search(r"const WB = \d+;", rig_text):
        flags.append("SLEEVE: sleeve geometry constants (L1 / WT / WB) are back in rig.tsx — the v7 tab shapes are gone by Javion's order; remove them with the sleeve function (code proxy — confirm on a render)")
    # --- the old `sweater:` field is GONE (migrated to sleeve: 'long' in v18).
    if re.search(r"sweater: true", rig_text):
        flags.append("SLEEVE: the old `sweater: true` field is still in rig.tsx — it was migrated to sleeve: 'long' in v18; replace it (the researcher keeps long sleeves, same garment, new field name)")
    # --- every look must carry the sleeve that matches its garment (Nov 12 v18).
    #     Shirt-wearers get 'tshirt' (short), jacket/coat-wearers get 'long'.
    #     v19 (Javion, looking at S52: "he has a jacket on put longer sleeves on
    #     him"): the S52 teacher wears a yellow hoodie (LOOKS.teenager) and the
    #     teacher look is a cardigan — both are long-sleeved jackets, so teenager
    #     and teacher are 'long', not 'tshirt'. The sleeve length matches the
    #     GARMENT: hoodie/cardigan/jacket/labcoat/sweater = long, shirt = tshirt.
    #     The legacy puppet cast (pip, pipHood, pipInk, mo, sis, mom, suit) is
    #     exempt — not in video #3, stays bare-armed.
    _want_sleeve = {
        'hero': 'tshirt', 'jake': 'tshirt', 'student': 'tshirt', 'prisoner': 'tshirt',
        'teenager': 'long', 'teacher': 'long', 'guestA': 'tshirt', 'guestB': 'tshirt',
        'guestC': 'tshirt', 'detective': 'long', 'scientist': 'long', 'profA': 'long',
        'profB': 'long', 'profC': 'long', 'researcher': 'long',
    }
    _found = {}
    for m in re.finditer(r"(\w+): \{[^}]*sleeve: '(\w+)'[^}]*\}", rig_text):
        _found[m.group(1)] = m.group(2)
    for _look, _want in _want_sleeve.items():
        if _look not in _found:
            flags.append(f"SLEEVE: LOOKS.{_look} has NO sleeve field — {_look} must wear sleeve: '{_want}' ({'a T-shirt, short sleeves' if _want == 'tshirt' else 'long sleeves in the garment colour'}, Javion v18); add it to the look")
        elif _found[_look] != _want:
            flags.append(f"SLEEVE: LOOKS.{_look} has sleeve: '{_found[_look]}' but must wear sleeve: '{_want}' ({'a T-shirt, short sleeves' if _want == 'tshirt' else 'long sleeves in the garment colour'}, Javion v18); fix the look")
    if re.search(r"<ellipse cx=\{-42\} cy=\{-108\}", rig_text) or re.search(r"<ellipse cx=\{42\} cy=\{-108\}", rig_text):
        flags.append("SHOULDER: a shoulder-cap ellipse is back at (±42,-108) — the v5 caps read as separate round caps pasted on the shoulders; remove the cap, the bare shoulder is the shirt's own edge (code proxy — confirm on a render)")
    # --- the v7 torso STUB must not come back: a stub (the torso path jutting
    #     out to x=±58) is a rectangular protrusion and reads as a tab, exactly
    #     like the quad did. The torso path must end at x=±46 at the shoulder.
    torso_m = re.search(r"<path d=\"(M -46 -112[^\"]*)\" fill=\{L\.jacket\} stroke=\{L\.line\}", rig_text)
    if torso_m:
        if "L 58 -106" in torso_m.group(1) or "L -58 -106" in torso_m.group(1):
            flags.append("SLEEVE: the torso path carries sleeve stubs (jutting to x=±58) — the v7 stub failed: a stub is a rectangular protrusion and reads as a tab pasted on the shoulder, exactly like the quad; remove the stubs, sleeves are OFF entirely now (code proxy — confirm on a render)")
    # --- STACKED CLOTHING (Nov 12 v6, Javion: "multiple clothing stacked on
    #     top of everyone"). One clean top per character: the hero's 'jacket'
    #     gear must be ONLY the cream shirt V + a centre seam — the v5 yoke
    #     and two full-length panels (each outlined, darker shade) piled on
    #     the torso and read as separate layers. If a jacketShade panel is
    #     back in the 'jacket' gear, that is a defect. Likewise the filled
    #     collar band (drawn for every non-suit look on top of the gear's own
    #     neckline) read as a second collar — it must be gone.
    jm = re.search(r"\{L\.gear === 'jacket' \? \((.*?)\) : null\}", rig_text, flags=re.DOTALL)
    if not jm:
        flags.append("CLOTHES: could not find the gear 'jacket' block in rig.tsx — check by hand")
    else:
        jblock = jm.group(1)
        if "L.jacketShade" in jblock:
            flags.append("CLOTHES (stacked): the 'jacket' gear contains a jacketShade piece (yoke/panel) — the jacket is the torso itself now; a shade panel on top of it reads as a second garment stacked on the chest. Keep only the cream shirt V + centre seam (code proxy — confirm on a render)")
        if "M -22 -116 L 0 -52 L 22 -116" not in jblock:
            flags.append("CLOTHES: the 'jacket' gear has no cream shirt V — the open front needs the shirt inset, or the jacket reads as a solid bib")
        if "M 0 -52 L 0 4" not in jblock:
            flags.append("CLOTHES: the 'jacket' gear has no centre seam below the shirt V — without it the open front reads as a gap, not one jacket (code proxy — confirm on a render)")
    if re.search(r'M -26 -118 Q 0 -100 26 -118 L 20 -106 Q 0 -92 -20 -106 Z', rig_text):
        flags.append("CLOTHES (stacked): the filled collar band is back (M -26 -118 ...) — it is drawn for every non-suit look on top of the gear's own neckline, so it reads as a second collar layered over a hoodie/cardigan/jacket. Remove it; the torso's own top edge is the neckline (code proxy — confirm on a render)")
    # --- the hem must sit at the waist/hips (y within [-10, 14]).
    hm = re.search(r'<path d="(M -40[^"]*)" fill=\{L\.jacketShade\} opacity=\{0\.65\}', rig_text)
    if hm:
        ext = _path_extents(hm.group(1))
        if ext and (ext[2] < -10 or ext[3] > 14):
            flags.append(f"CLOTHES: the hem band sits at y={ext[2]:g}..{ext[3]:g} — outside the waist/hips band [-10, 14], so the shirt rides up or hangs past the hips (code proxy — confirm on a render)")
    # --- the hoodie hood must be a HOOD, not a cape: no wider than ~150px.
    hm2 = re.search(r"\{L\.gear === 'hoodie' \? \((.*?)\) : null\}", rig_text, flags=re.DOTALL)
    if hm2:
        for pm in re.finditer(r'<path d="([^"]+)"', hm2.group(1)):
            ext = _path_extents(pm.group(1))
            if ext and (ext[1] - ext[0]) > 150:
                flags.append(f"CLOTHES: the hoodie hood is {ext[1] - ext[0]:g}px wide — wider than a hood resting behind the neck, it reads as a cape (code proxy — confirm on a render)")
    return flags


# ---------------------------------------------------------------- audit

def audit_shots_file(shots_path, episode="zenn-002"):
    """Audit one episode's shots file. Returns a list of per-shot finding dicts."""
    text = read(shots_path)
    shots = split_shots(text)
    findings = []
    for name in sorted(shots, key=lambda s: int(s[1:])):
        block = shots[name]
        f = {"shot": name, "flags": [], "counts": {}}
        # --- rim: must be moonlight (rimBlue), never the retired warm rimInkl
        n_inkl = len(re.findall(r'rimId="rimInkl"|rimId=\'rimInkl\'', block))
        n_blue = len(re.findall(r'rimId="rimBlue"|rimId=\'rimBlue\'', block))
        f["counts"]["rimInkl"] = n_inkl
        f["counts"]["rimBlue"] = n_blue
        if n_inkl:
            f["flags"].append(f"RIM: {n_inkl}x rimInkl (warm, retired) — must be rimBlue")
        # --- popup text colour (zenn-002 Popup uses RED; must be MOONLIGHT)
        if re.search(r"fill=\{RED\}", block):
            f["flags"].append("POPUP: popup text still uses RED — must be MOONLIGHT")
        # --- hair references must not exist in a shots file
        hair_refs = len(re.findall(r"hairOn|hairStyle|hairTuft|<Hair\b", block))
        if hair_refs:
            f["flags"].append(f"HAIR: {hair_refs} hair reference(s) in this shot file")
        # --- pedestrian hair: any hair style named in a shot must be a real
        #     PedHairStyle. Anything else (an old style name, a colour, a hat-like
        #     shape) is a defect — it reads as a hat or is a retired style.
        #     (PedHair itself is <PedHair, which the <Hair\b pattern above does
        #     not match; hair lives on the Look in rig.tsx, not in the shot.)
        for m in re.finditer(r"hair: '([^']*)'", block):
            if m.group(1) not in PED_HAIR_STYLES:
                f["flags"].append(f"PEDHAIR: hair style '{m.group(1)}' is not a PedHairStyle — must be one of {', '.join(PED_HAIR_STYLES)}")
        # --- which pedestrian looks appear in this shot (their hair comes from
        #     the LOOKS table in rig.tsx — the foundation audit checks it there)
        f["counts"]["pedestrians"] = len(re.findall(r"LOOKS\.(?:researcher|student|prisoner|teenager|scientist|teacher|guestA|guestB|guestC)\b", block))
        # --- duplicate / floating-item heuristics
        # (a) more than one wall calendar in a single shot = duplicate
        n_cal = len(re.findall(r"<WallCalendar\b", block))
        f["counts"]["WallCalendar"] = n_cal
        if n_cal > 1:
            f["flags"].append(f"DUPLICATE: {n_cal}x WallCalendar in one shot (a room has one)")
        # (a2) DUPLICATE PROPS (Nov 12 v6, Javion: "2 CALENDARS — remove the
        #     duplicate"). In zenn-003 the calendars are <Prop kind="calendar">,
        #     not <WallCalendar>, so the check above misses them. Any Prop kind
        #     appearing twice in one shot is a duplicate item (calendar, clock,
        #     tray, bed, ...) — each item appears once. The S123 pair was the
        #     case that caught this: two calendars, one shot.
        #     EXCEPTIONS (deliberate, not duplicates): 'speech_bubble' — a
        #     dialogue legitimately has two bubbles with different text
        #     (S59: "DID I SAY THAT?" / "YES, YOU DID."); 'brain' — two brains
        #     with DIFFERENT variants are a comparison of two states (S4:
        #     "beating" vs "shrinking"), not a copy. Two brains with the SAME
        #     variant are a duplicate.
        prop_kinds = re.findall(r'<Prop kind="([^"]+)"', block)
        f["counts"]["props"] = len(prop_kinds)
        for kind in sorted(set(prop_kinds)):
            if kind == "speech_bubble":
                continue
            n = prop_kinds.count(kind)
            if kind == "brain" and n > 1:
                variants = re.findall(r'<Prop kind="brain"[^>]*"variant":\s*"([^"]+)"', block)
                if len(set(variants)) == n:
                    continue  # every brain is a different variant — a comparison
            if n > 1:
                f["flags"].append(f"DUPLICATE: {n}x <Prop kind=\"{kind}\"> in one shot — remove the duplicate so the item appears exactly once")
        # (b) same component placed at the exact same x,y twice in one shot
        placed = re.findall(r"<(Phone|Mug|Cat|Glow|WallCalendar|WallClock)\b[^>]*\bx=\{?([\d.]+)\}?[^>]*\by=\{?([\d.]+)\}?", block)
        seen = {}
        for comp, x, y in placed:
            key = (comp, x, y)
            if key in seen:
                f["flags"].append(f"DUPLICATE: <{comp}> at x={x} y={y} appears twice in this shot")
            seen[key] = True
        # (b2) TWO BEDS (Nov 12 v7, Javion: "still reads as two beds" — S39).
        #     A shot with a <Prop kind="bed"> AND a <Cell> that renders its
        #     floor mattress (no `bed` flag, no `mattress={false}`) shows TWO
        #     beds: the centre bed Prop plus the Cell's floor mattress at
        #     bottom left. The floor mattress reads as a second bed to a
        #     viewer — "it's the set's mattress, not a bed" does not matter.
        #     One bed per shot: either the Cell has `bed` (bed frame, no
        #     Prop) or the Cell has `mattress={false}` (Prop only).
        if '<Prop kind="bed"' in block:
            for cm in re.finditer(r"<Cell\b[^>]*>", block):
                ctag = cm.group(0)
                has_bed = re.search(r"\bbed\b", ctag) is not None
                no_mattress = "mattress={false}" in ctag
                if has_bed or not no_mattress:
                    f["flags"].append("DUPLICATE: this shot has a <Prop kind=\"bed\"> AND a <Cell> rendering a bed of its own (bed frame if `bed`, floor mattress otherwise) — two beds in one frame; pass mattress={false} to the Cell (Prop only) or drop the Prop and use the Cell's bed frame")
        # (c) oversized phone (a hand-held phone is w<=50; w=70 reads torso-sized/floating)
        for m in re.finditer(r"<Phone\b[^>]*\bw=\{(\d+)\}", block):
            if int(m.group(1)) > 50:
                f["flags"].append(f"FLOATING/SCALE: Phone w={m.group(1)} — torso-sized, no visible grip; use w<=42")
        # (e) PROP SCALE — wall calendar (Nov 12, Javion: "THE CALENDAR IS
        #     GIGANTIC"). A wall calendar is a fraction of a person's height,
        #     not as tall as one: at s=1 it is 260x343, the height of a whole
        #     character, and it dominates the wall. Regular wall calendars
        #     must be s<=0.55 (about a third of a character tall). The S139
        #     close-up is the deliberate exception (the calendar IS the focus,
        #     zoom ~2.7) and keeps s=1. (Nov 12 v6: the S123 comparison pair is
        #     gone — S123 has exactly ONE calendar now, so there is no pair
        #     exception any more.)
        for m in re.finditer(r'<Prop kind="calendar"[^>]*\bs=\{([\d.]+)\}', block):
            s = float(m.group(1))
            if s > 0.55 and name != "S139":
                f["flags"].append(f"PROP-SCALE: wall calendar s={s} — gigantic (260x343 at s=1 is a whole character tall); a normal wall calendar is s<=0.55, about a third of a character tall")
        # (d) NOTE: foreground plants (FgPlant) at the frame edge are INTENTIONAL
        #     depth — a blurred plant half-cropped at the edge is a standard
        #     foreground-framing device, not a defect, so they are not flagged.
        #     The real edge-crop defect (S48: a crowd figure's eyes reading as
        #     floating) was the Party set's leftmost figure, fixed in party.tsx.
        # --- standing pose defaults (legs/arms must be straight, not splayed/bent)
        n_arm_def = len(re.findall(r"arm[LR]: \{ a: 10, b: -8 \}", block))
        n_leg_splay = len(re.findall(r"leg[LR]: \{ a: [+-]?(?:5|8|10), b: 0 \}", block))
        f["counts"]["arm_default_bent"] = n_arm_def
        f["counts"]["leg_splay"] = n_leg_splay
        if n_arm_def:
            f["flags"].append(f"ARMS: {n_arm_def}x default arm {{a:10,b:-8}} (bent) — should be {{a:5,b:0}}")
        if n_leg_splay:
            f["flags"].append(f"LEGS: {n_leg_splay}x splayed leg (a=+/-5/8/10) — standing legs should be {{a:0,b:0}}")
        # --- dancing legs / standing legs (Nov 12): a key with BOTH legs |b|>25
        #     is dancing, not walking or standing; a standing poseAt block
        #     (x-range < 40px across its keys) with non-zero leg angles is a
        #     stance that never settles. One flag per shot, with key counts.
        pose_blocks = parse_pose_blocks(block)
        n_dance = 0
        n_stand_nz = 0
        for var, keys in pose_blocks.items():
            xs = [k["x"] for k in keys if k["x"] is not None]
            xr = (max(xs) - min(xs)) if xs else 0
            for k in keys:
                ll, lr = k.get("legL"), k.get("legR")
                if ll and lr and abs(ll[1]) > 25 and abs(lr[1]) > 25:
                    n_dance += 1
            if xr < 40:
                for k in keys:
                    for limb in ("legL", "legR"):
                        v = k.get(limb)
                        if v is not None and (v[0] != 0 or v[1] != 0):
                            n_stand_nz += 1
                            break
        f["counts"]["dancing_leg_keys"] = n_dance
        f["counts"]["standing_nonzero_legs"] = n_stand_nz
        if n_dance:
            f["flags"].append(f"LEGS (dancing): {n_dance} pose key(s) with BOTH legs |b|>25 (both knees deeply bent at once) — a walk alternates (one leg planted, one swinging); standing legs are {{a:0,b:0}}")
        if n_stand_nz:
            f["flags"].append(f"LEGS (standing): {n_stand_nz} key(s) in standing pose(s) (x-range <40px) with non-zero leg angles — standing legs should be {{a:0,b:0}}")
        # --- duplicates (Nov 12): two Heroes with the identical look in one shot.
        #     Identity = base LOOKS name + spread overrides: two researchers
        #     with different hair/jacket overrides are different people, not
        #     duplicates; the same base with the same (or no) overrides is.
        heroes = shot_heroes(block)
        idents = [h[0] for h in heroes]
        dups = sorted({b for (b, _o) in idents if idents.count((b, _o)) > 1})
        f["counts"]["duplicate_looks"] = len(dups)
        if dups:
            f["flags"].append(f"DUPLICATES: {len(heroes)} character(s), look(s) repeated in this shot: {', '.join(dups)} — never two identical characters in one shot; vary hair/clothes/pose per person")
        # --- clothes variation (Nov 12, Javion: "you did was change the hair,
        #     they are still standing weird" / "didnt change their clothes").
        #     In a group shot, members sharing a base look must differ in
        #     CLOTHES (jacket colour), not just hair. Hair alone does not make
        #     them read as different people — the same shirt on everyone reads
        #     as the same person copied. Each member needs a distinct top.
        if len(heroes) >= 2:
            by_base = {}
            for (base, overrides) in idents:
                by_base.setdefault(base, []).append(overrides)
            for base, ovs in by_base.items():
                if len(ovs) < 2:
                    continue
                jackets = []
                for o in ovs:
                    # NOTE: shot_heroes strips ALL whitespace from the
                    # overrides, so the jacket reads as jacket:'#...' with
                    # no space after the colon.
                    jm = re.search(r"jacket:'([^']*)'", o or "")
                    jackets.append(jm.group(1) if jm else None)
                # Only members who are DIFFERENT people (different override
                # strings) count: two heroes with the identical identity are
                # the same person by design (a ghost echo / PLUS-MINUS split
                # — the DUPLICATES check already flags those, and sharing a
                # top is correct for them). The defect is different people
                # sharing a top: same jacket, different hair/overrides.
                seen_jacket = {}
                shared = set()
                for o, j in zip(ovs, jackets):
                    if j in seen_jacket and seen_jacket[j] != o:
                        shared.add(j)
                    seen_jacket.setdefault(j, o)
                if shared:
                    f["flags"].append(f"CLOTHES (variation): {len(ovs)}x '{base}' in this shot share jacket colour(s) {', '.join(str(s) for s in sorted(shared, key=str))} across different people — varying hair alone does not distinguish them; give each member a clearly different top colour")
        # --- arms (Nov 12): hyper-bent elbows, the odd back-swing, group copying.
        n_hyper = 0
        n_back = 0
        for var, keys in pose_blocks.items():
            for k in keys:
                for limb in ("armL", "armR"):
                    v = k.get(limb)
                    if v is None:
                        continue
                    if v[1] >= 90:
                        n_hyper += 1
                    if v == BACK_SWING:
                        n_back += 1
        f["counts"]["arm_hyperbent"] = n_hyper
        f["counts"]["arm_backswing"] = n_back
        if n_hyper:
            f["flags"].append(f"ARMS: {n_hyper} arm pose(s) with elbow bend b>=90 (hyper-bent) — restore the hang default {{a:4,b:8}}")
        if n_back:
            f["flags"].append(f"ARMS: {n_back} back-swung arm(s) {{a:-60,b:30}} — restore the hang default {{a:4,b:8}}")
        if len(heroes) >= 2:
            arm_pairs = []
            for look, var, _ in heroes:
                keys = pose_blocks.get(var) or []
                if keys and keys[0].get("armL") is not None and keys[0].get("armR") is not None:
                    arm_pairs.append((keys[0]["armL"], keys[0]["armR"]))
                else:
                    arm_pairs.append(None)
            # The neutral hang is the CORRECT idle pose, not copying: two people
            # both hanging their arms ({a:4,b:8} or the older {a:5,b:0}) are
            # standing normally, not copying each other. Only a shared
            # NON-neutral gesture (a raise, a point, a swing) is copying.
            neutral = [((4.0, 8.0), (4.0, 8.0)), ((5.0, 0.0), (5.0, 0.0))]
            if (all(p is not None for p in arm_pairs) and len(set(arm_pairs)) == 1
                    and arm_pairs[0] not in neutral):
                f["flags"].append(f"ARMS (copying): all {len(heroes)} characters in this group shot share the identical arm pose {arm_pairs[0]} — vary the gesture per member")
            # (Nov 12 v20) STRONGER duplicate-pose: the all-share check above
            # misses the common case — a MAJORITY sharing one pose while one
            # member differs. S3/S60/S69/S82/S96/S97/S120/S121/S122/S124/S152
            # all had 5-6 of 6-9 members in the identical (armL,armR) pose
            # with only one member different, so the all-share check stayed
            # silent. Three or more members sharing one NON-neutral first-key
            # arm pose is copying, even if the whole group does not match.
            # (The neutral hang {a:4,b:8} / {a:5,b:0} is standing normally,
            # not copying, so it is excluded here too.)
            pose_counts = {}
            for p in arm_pairs:
                if p is not None and p not in neutral:
                    pose_counts[p] = pose_counts.get(p, 0) + 1
            for pose, cnt in sorted(pose_counts.items(), key=lambda kv: -kv[1]):
                if cnt >= 3:
                    f["flags"].append(f"ARMS (copying): {cnt} of {len(heroes)} characters in this group shot share the identical arm pose {pose} — give each member a distinct gesture (v20: S60/S62/S69/S82/S97/S121/S122 were fixed this way)")
                    break
        # --- SIGN POLES (Nov 12 v20): the street_sign / road_sign Props draw
        #     a pole under the sign. The pole must reach the floor (y≈886);
        #     the signs sit at y≈500-530, so the pole's V length must be
        #     >=300. The original V=78 ended mid-air in S50/S51/S127 — a
        #     signpost floating with no ground. Fixed to V=367 (street_sign)
        #     and V=383 (road_sign) in v20.
        for kind in ("street_sign", "road_sign"):
            dm = re.search(r"case '" + kind + r"': return \(.*?M 0 -?\d+ V (\d+)", text, flags=re.DOTALL)
            if dm and int(dm.group(1)) < 300:
                f["flags"].append(f"SIGN-POLE: '{kind}' Prop pole V={dm.group(1)} — too short to reach the floor from y≈500 (needs V>=300); the sign floats with its pole ending mid-air (v20: S50/S51/S127)")
        # --- placement: list every character's (x, y, scale) so a reviewer can check
        #     feet-on-floor / seated-at-desk / doorway placement per shot.
        poses = re.findall(r"\{ f: \d+, p: \{ x: ([\d.]+), y: ([\d.]+), scale: ([\d.]+)", block)
        f["counts"]["characters"] = len(re.findall(r"<(?:Hero|Actor)\b", block))
        f["placements"] = [{"x": x, "y": y, "scale": s} for x, y, s in poses]
        # --- DISPLACEMENT: doors on walls, windows on walls, furniture on the
        #     floor in sensible spots, nothing blocking a doorway, nothing
        #     outside the set bounds. (New category, Javion Nov 11.)
        disp_flags, disp_notes = audit_displacement(block, name, episode)
        f["flags"].extend(disp_flags)
        f["displacement_notes"] = disp_notes
        findings.append(f)
    return findings


def parse_looks(rig_text):
    """Parse the LOOKS record in rig.tsx -> {look_name: entry_body}."""
    m = re.search(r"export const LOOKS: Record<CastName, Look> = \{(.*?)\n\};", rig_text, flags=re.DOTALL)
    if not m:
        return {}
    out = {}
    for name, body in re.findall(r"(\w+): \{([^{}]*)\}", m.group(1)):
        out[name] = body
    return out


def audit_shared():
    """Audit the shared studio files (foundation): hair, rim, popup, sleeves,
    pedestrian hair."""
    flags = []
    rig = read(STUDIO / "src/engine/rig.tsx")
    # Code patterns only (comments that merely mention hair do not count).
    for pat, label in [
        (r"hairOn\?:", "rig.tsx: hairOn prop still in the Hero type"),
        (r"hairOn =", "rig.tsx: hairOn default still in Hero"),
        (r"hairOn &&", "rig.tsx: a hairOn gate still present"),
        (r"hairOn \?", "rig.tsx: a hairOn ternary still present"),
        (r"hairStyle\?:", "rig.tsx: hairStyle still in the Look type"),
        (r"hairStyle:", "rig.tsx: a Look still has a hairStyle field"),
        (r"L\.hairStyle", "rig.tsx: code still reads L.hairStyle"),
        (r"hairTuft\?:", "rig.tsx: hairTuft still in the Look type"),
        (r"hairTuft:", "rig.tsx: a Look still has a hairTuft field"),
        (r"L\.hairTuft", "rig.tsx: code still reads L.hairTuft"),
        (r"<Hair\b", "rig.tsx: <Hair> render still present"),
        (r"const Hair:", "rig.tsx: Hair component still defined"),
        # Old hair COLOUR field (a #hex literal). The new pedestrian-hair field
        # is a STYLE name (hair: 'bun') — that is required, not a defect, so
        # this pattern only matches a #hex colour, never a style name.
        (r"hair: '#", "rig.tsx: a Look still has an old hair colour field (#hex)"),
        (r"hair: C\.ink", "rig.tsx: a Look still has a hair colour field"),
        (r"extra: 'bunches'", "rig.tsx: 'bunches' hair extra still present"),
        (r"extra: 'bob'", "rig.tsx: 'bob' hair extra still present"),
        # NOTE: L.hair is the LEGITIMATE PedHair read now (Hero renders PedHair
        # when L.hair is set, guarded off the deerstalker) — it is not flagged.
    ]:
        if re.search(pat, rig):
            flags.append(label)
    # --- PEDESTRIAN HAIR (Nov 11, Javion: every pedestrian gets natural hair).
    # PedHair + the style list must exist; every pedestrian look must have a
    # valid PedHairStyle in a natural brown; the main cast must have NO hair.
    if "export const PedHair" not in rig:
        flags.append("rig.tsx: PedHair component missing — pedestrians have no hair system")
    if "export type PedHairStyle" not in rig:
        flags.append("rig.tsx: PedHairStyle type missing")
    looks = parse_looks(rig)
    if not looks:
        flags.append("rig.tsx: could not parse the LOOKS record")
    for name in PED_LOOKS:
        body = looks.get(name)
        if body is None:
            flags.append(f"rig.tsx: pedestrian look '{name}' missing from LOOKS")
            continue
        m = re.search(r"hair: '([^']*)'", body)
        if not m:
            flags.append(f"PEDHAIR: pedestrian look '{name}' has NO hair — every pedestrian gets natural hair")
        elif m.group(1) not in PED_HAIR_STYLES:
            flags.append(f"PEDHAIR: pedestrian look '{name}' has hair style '{m.group(1)}' — must be one of {', '.join(PED_HAIR_STYLES)}")
        c = re.search(r"hairC: '([^']*)'", body)
        if c and c.group(1) not in PED_HAIR_COLORS:
            flags.append(f"PEDHAIR: pedestrian look '{name}' has hairC '{c.group(1)}' — must be a natural brown ({', '.join(PED_HAIR_COLORS)})")
    for name in BALD_LOOKS:
        body = looks.get(name)
        if body is None:
            continue
        if re.search(r"hair: '", body):
            flags.append(f"PEDHAIR: main-cast look '{name}' HAS hair — the Detective (deerstalker), Jake, the hero and the professors stay bald")
    # The Hero must render PedHair off the look (guarded off the deerstalker).
    if "L.hair && L.extra !== 'deerstalker'" not in rig:
        flags.append("rig.tsx: Hero does not render PedHair from L.hair (deerstalker-guarded)")
    # Sleeves must render unconditionally (no hairOn gate on sleeve()).
    if re.search(r"hairOn \? sleeve\(", rig):
        flags.append("rig.tsx: sleeves still gated on hairOn (they vanish when hair is off)")
    if "legL: { a: -5, b: 0 }" in rig or "legR: { a: 5, b: 0 }" in rig:
        flags.append("rig.tsx: basePose legs still splayed — should be {a:0,b:0}")
    if "armL: { a: 10, b: -8 }" in rig:
        flags.append("rig.tsx: basePose arms still bent {a:10,b:-8} — should be {a:5,b:0}")
    # --- CLOTHES FIT (Nov 12): jacket panels connected, sleeves covering the
    #     upper arm and overlapping the torso, hem at the waist/hips, hood a
    #     hood not a cape. Code proxies only — floating/clipping fabric can
    #     only be proven by looking at a render, never by this check.
    flags.extend(audit_clothes_fit(rig))
    if "const HIP = { x: 17" in rig:
        flags.append("rig.tsx: HIP.x still 17 (narrow stance — straight legs would merge feet)")
    kit = read(STUDIO / "src/engine/kit.tsx")
    if "MOONLIGHT" not in kit:
        flags.append("kit.tsx: no shared MOONLIGHT constant for popup text")
    party = read(STUDIO / "src/engine/sets/party.tsx")
    # Pedestrian hair on the crowd (Nov 11): every PARTY_GUESTS entry must have
    # a valid PedHairStyle, and PartyGuest must render PedHair. The OLD hair
    # shapes (look.hair === 'bun' renders) must be gone.
    if "<PedHair" not in party:
        flags.append("party.tsx: PartyGuest does not render PedHair — the crowd has no hair")
    for i, entry in enumerate(re.findall(r"\{ top: '[^']*'[^{}]*\}", party)):
        m = re.search(r"hair: '([^']*)'", entry)
        if not m:
            flags.append(f"PEDHAIR: PARTY_GUESTS[{i}] has NO hair — every crowd figure gets natural hair")
        elif m.group(1) not in PED_HAIR_STYLES:
            flags.append(f"PEDHAIR: PARTY_GUESTS[{i}] has hair style '{m.group(1)}' — must be one of {', '.join(PED_HAIR_STYLES)}")
        c = re.search(r"hairC: '([^']*)'", entry)
        if c and c.group(1) not in PED_HAIR_COLORS:
            flags.append(f"PEDHAIR: PARTY_GUESTS[{i}] has hairC '{c.group(1)}' — must be a natural brown")
    if re.search(r"look\.hair ===", party):
        flags.append("party.tsx: PartyGuest still renders old hair shapes (look.hair === ...) — must use PedHair")
    if re.search(r"\{ u: 0\.06,", party):
        flags.append("party.tsx: leftmost crowd figure still at u=0.06 (frame-edge crop in tight cameras)")
    props = read(STUDIO / "src/engine/props.tsx")
    if '#5A3226' in props:
        flags.append("props.tsx: Phone caller avatar still has a hair bob")
    cast = read(STUDIO / "src/CastSheet.tsx")
    if "hairOn" in cast or "CastHairSheet" in cast:
        flags.append("CastSheet.tsx: hair flag / CastHairSheet still present")
    hms = read(STUDIO / "src/HairMotionSample.tsx")
    if "rimInkl" in hms or "hairOn" in hms:
        flags.append("HairMotionSample.tsx: still uses rimInkl and/or hairOn")
    # --- SEATED FULL BODY (Nov 12, Javion: "THE KIDS SITTING IN CHAIRS ARE
    #     JUST A FLOATING TORSO WITH A HEAD"). A seated Kid must be a whole
    #     person in a chair — shaped torso, arms, head, and a chair (solid chair
    #     back + seat + legs) holding them — never a torso and head floating
    #     above the floor. Code proxies: the Kid component must draw a solid
    #     chair backrest behind the kid, a seat, and chair legs reaching the floor.
    #     Nov 12 v12 (Javion: "Can you put the kids infront of the chairs back?
    #     So that the back of the chair is visible and that we can see the back
    #     of their head and the back of the chair"): the kid sits IN FRONT OF a
    #     solid, visible chair back at REGULAR height — the backrest top at
    #     mid-back level (y=-64), the sides beyond the torso, the head/neck/
    #     shoulders all ABOVE it. Nov 12 v13 (Javion: the v12 backrest towered
    #     over the kids' heads like a high wall — "make them look regular in
    #     the chair", a viewer would question it): the v12 panel was 156x206,
    #     y=-214..-8, top 24px ABOVE the head. The v11 open frame failed the
    #     other way (thin outline, no visible chair back); the v10 solid panel
    #     failed because it was only y=-112..+6, its top 4px above the torso
    #     crown and its bottom below the torso hem, so the torso filled it and
    #     read as GLUED. The v13 panel is 156x70, y=-64..+6: top 32px below the
    #     shoulders, 126px below the head top.
    #     Nov 12 v10 (Javion: "get rid of the fuckin legs going through the
    #     chair"): the legs are GONE by his order — every leg version (v6 thigh
    #     bars, v7/v8 shins, v9 hips block) put a dark pants shape across or
    #     under the seat and read as legs through the chair. The Kid is torso +
    #     head + arms sitting on a whole visible chair; there must be NO leg /
    #     hips / shin / foot shape in the Kid at all.
    cls = read(STUDIO / "src/engine/sets/classroom.tsx")
    kid_m = re.search(r"export const Kid.*?(?=\n/\*\*|\nexport const KidDesk)", cls, flags=re.DOTALL)
    kid_body = kid_m.group(0) if kid_m else ""
    if not kid_body:
        flags.append("classroom.tsx: could not find the Kid component — check by hand")
    else:
        if "chair" not in kid_body.lower() and "backrest" not in kid_body.lower():
            flags.append("SEATED: Kid draws no chair backrest — a seated kid needs a chair behind them, not a floating torso")
        # Nov 12 v13 (Javion: the v12 backrest towered over the kids' heads
        # like a high wall — "make them look regular in the chair", a viewer
        # would question it): the kid sits IN FRONT OF a SOLID chair back at
        # REGULAR height. Require the solid backrest panel (156 wide,
        # y=-64..+6, 70 tall): its top at mid-back level (y=-64), 32px BELOW
        # the shoulders (y=-96) and 126px below the head top (y=-190), so the
        # head, neck, shoulders and upper torso are all ABOVE the chair back,
        # exactly like a real person in a school chair. The v12 panel
        # (156x206, y=-214..-8, top 24px ABOVE the head) is the HIGH WALL —
        # flag any panel whose top is above the shoulders. The v10 panel
        # (156x118, y=-112..+6) is the GLUED geometry: top 4px above the torso
        # crown, bottom below the torso hem — flag any panel whose top is
        # within 10px of the torso crown (-108) or whose bottom runs below
        # the torso hem.
        back_m = re.search(r"<rect x=\{-78\} y=\{(-?[\d.]+)\} width=\{156\} height=\{(\d+)\} rx=\{10\} fill=\{CHAIR\}", kid_body)
        if not back_m:
            flags.append("KID: the Kid has no solid chair backrest panel behind the kid (expected <rect x={-78} y={-64} width={156} height={70}> + top rail) — a seated kid needs a chair back behind them at regular height; a thin frame outline is not enough, and no backrest at all reads as a floating torso")
        else:
            back_top = float(back_m.group(1))
            back_h = float(back_m.group(2))
            back_bottom = back_top + back_h
            if back_top < -80 or back_top > -50:
                flags.append(f"KID: the Kid chair backrest top (y={back_top}) is not at mid-back level — a regular school-chair back tops out at y=-64 (between -80 and -50), below the shoulders (y=-96) and well below the head top (y=-190); the head, neck and shoulders must be ABOVE the chair back")
            if back_top <= -96:
                flags.append(f"KID: the Kid chair backrest top (y={back_top}) is above the shoulders (y=-96) — that is the v12 HIGH WALL, the backrest towers over the kid and a viewer would question it; lower the backrest top to mid-back level (y=-64)")
            if back_bottom > 10 or back_bottom < -2:
                flags.append(f"KID: the Kid chair backrest bottom (y={back_bottom}) does not meet the seat — a regular chair back runs down to the seat slab (y=-2..+10); below it hangs under the seat, above it leaves the backrest floating")
        if re.search(r"<rect x=\{-78\} y=\{-112\} width=\{14\} height=\{118\}", kid_body) or re.search(r"<rect x=\{64\} y=\{-112\} width=\{14\} height=\{118\}", kid_body):
            flags.append("KID: the Kid chair back is still the v11 OPEN FRAME (side posts, no solid panel) — replace the frame posts with the solid 156x70 backrest panel at regular height, top y=-64, bottom y=+6")
        if not re.search(r"seat", kid_body, flags=re.IGNORECASE):
            flags.append("SEATED: Kid draws no chair seat — the torso must sit ON a seat")
        # Nov 12 v10 (Javion: "get rid of the fuckin legs going through the chair"):
        # the legs are GONE by his order — the Kid is torso + head + arms sitting
        # on a whole visible chair; there must be NO leg/hips/shin/foot shape in
        # the Kid at all. Flag any PANTS/SHOE shape or constant (they only exist
        # if someone re-added legs).
        if re.search(r"fill=\{PANTS\}|fill=\{SHOE\}|const PANTS|const SHOE", kid_body):
            flags.append("KID: the Kid has leg shapes back (PANTS/SHOE) — Javion ordered the legs REMOVED entirely (Nov 12 v10, 'get rid of the fuckin legs going through the chair'); delete the hips block, shins and feet, do NOT re-add legs without his say-so")
        # with no legs, the CHAIR legs are what reach the floor (y=10..74) — the
        # chair must be whole below the torso, backrest + seat + legs to the floor.
        if not re.search(r"<rect x=\{-72\} y=\{10\} width=\{10\} height=\{64\} fill=\{CHAIR_DK\}", kid_body) or not re.search(r"<rect x=\{62\} y=\{10\} width=\{10\} height=\{64\} fill=\{CHAIR_DK\}", kid_body):
            flags.append("SEATED: Kid chair legs do not reach the floor — with no legs on the kid, the chair legs (y=10..74) are what hold the seat up; both corner legs must be present")
        # --- PHASING (Nov 12 v6, Javion: "kids legs are phasing through the
        #     chair — ZERO phasing"). The Kid's legs must not intersect the
        #     chair: no leg bar may cross the seat slab, the shin's top must be
        #     at or below the seat slab's bottom (the shin drops from the seat,
        #     it never starts inside the seat), and the shins must not overlap
        #     the chair legs in x. Parse the rects and check the geometry — a
        #     render still has to confirm it by eye.
        #     Nov 12 v8 (Javion: "their legs are going through the fuckin
        #     chair"): the v7 wide thigh bars (42x24, y=-14..+10) overlapped the
        #     ENTIRE seat slab (y=-2..+10) and were drawn after it, so they
        #     covered the seat and read as the legs going THROUGH the chair.
        #     From a rear view the thighs are hidden (they sit on top of the
        #     seat, facing forward, behind the torso and the seat), so there is
        #     NO thigh bar at all now — the visible legs are the shins only.
        #     Any PANTS rect whose y-range overlaps the seat slab y-range is a
        #     thigh bar crossing the seat = phasing, flag it.
        #     Nov 12 v7 (Javion: "the kids still aren't sitting"): the seat must
        #     also be WIDER than the torso — the v6 seat (120) was narrower than
        #     the torso (124), so from behind the chair was invisible and the kid
        #     read as standing with straight legs. The seat is 156 wide now, 26px
        #     sticking out on each side of the 104-wide v9 torso, so a viewer can SEE
        #     the kid sitting ON a seat. If the seat is ever narrower than the
        #     torso again, that is a defect.
        seat_m = re.search(r"chair seat slab[^*]*\*/\}\s*<rect x=\{(-?[\d.]+)\} y=\{(-?[\d.]+)\} width=\{(\d+)\} height=\{(\d+)\}", kid_body)
        # any PANTS leg bar (thigh or otherwise) that crosses the seat slab:
        pants_ms = re.findall(r"<rect x=\{(-?[\d.]+)\} y=\{(-?[\d.]+)\} width=\{(\d+)\} height=\{(\d+)\}[^>]*fill=\{PANTS\}", kid_body)
        shin_ms = re.findall(r"<rect x=\{(-?[\d.]+)\} y=\{(-?[\d.]+)\} width=\{18\} height=\{(\d+)\} rx=\{8\} fill=\{PANTS\}", kid_body)
        # --- KID TORSO / NECK (Nov 12 v7, Javion: "the torso is split black/blue" + "the head
        #     floats above the chair"). The Kid torso must be ONE solid shirt color — the old
        #     left-half black shading overlay rendered as solid black and split the shirt down
        #     the middle. And the head must connect to the torso with a neck — the head only
        #     touched the torso at one point and read as a ball sitting on the chair back.
        #     Nov 12 v9 (Javion: "make them 2d people? they are just floating with a torso"):
        #     the torso must be a SHAPED shirt with shoulders (sloped top edge, waist taper,
        #     hem) — the old half-circle dome read as a blob, not a person. And the kid must
        #     have T-shirt sleeves (v18) + bare black stick forearms at the sides, attached at
        #     the shoulders.
        if 'M -62 0 Q -64 -96 0 -100' in kid_body:
            flags.append("KID: the Kid torso is still the old half-circle dome (M -62 0 Q -64 -96 0 -100) — no shoulders, no waist, no hem, it reads as a coloured blob, not a person; redraw it as a shaped shirt (shoulders at ±52,-96, crown 0,-108, waist taper, hem at y=0)")
        if 'M -52 -96' not in kid_body:
            flags.append("KID: the Kid torso has no shaped shoulder line (expected the v9 shaped shirt starting M -52 -96) — the torso must have visible sloped shoulders, not a dome")
        if kid_body.count('stroke="#161616"') < 2:
            flags.append("KID: the Kid has no bare black stick forearms at the sides — the T-shirt sleeve covers the upper arm and the forearm below it must be a bare black stick arm (stroke=\"#161616\", width 13) + hand circles, hands ending above the seat top")
        # --- KID T-SHIRT SLEEVES (Nov 12 v18, Javion: "do the same thing for
        #     T-Shirts?"). The kids wear SHORT sleeves in their shirt colour
        #     (look.top), same v17 technique as the Hero sleeves: the stroke
        #     starts buried inside the torso and is drawn BEFORE the torso, so
        #     the torso covers the join and the sleeve emerges from the shoulder
        #     with no gap, no tab. The sleeve ends at mid-upper-arm (y=-53);
        #     the forearm below stays bare. Flag a Kid with no sleeve paths, or
        #     with the old full bare arm back (shoulder→hand in one black stroke).
        if not re.search(r'stroke=\{look\.top\} strokeWidth=\{20\}', kid_body):
            flags.append("KID: the Kid has no T-shirt sleeve (expected two sleeve strokes in look.top, width 20, from a buried start inside the torso to mid-upper-arm, drawn BEFORE the torso) — the kids wear short sleeves in their shirt colour (Javion v18); add them with the v17 buried-start + draw-before-torso technique")
        if re.search(r'M -46 -90 L -53 -16', kid_body) or re.search(r'M 46 -90 L 53 -16', kid_body):
            flags.append("KID: the Kid still has the old full bare arm (shoulder→hand in one black stroke) — the upper arm must be covered by the T-shirt sleeve (look.top, to mid-upper-arm y=-53) and only the forearm below it stays bare; replace the full arm with sleeve + bare forearm")
        if len(re.findall(r"<circle cx=\{(-?61|61)\} cy=\{-12\} r=\{8\} fill=\"#161616\"", kid_body)) < 2:
            flags.append("KID: the Kid arm hands are missing — each arm needs a hand circle at hip level (cy=-12, above the seat top) or the arms read as sticks ending mid-air")
        if re.search(r'fill="#000" opacity=\{0\.12\}', kid_body):
            flags.append("KID: the Kid torso carries a black shading overlay (fill=\"#000\" opacity={0.12}) on its left half — it renders as solid black and splits the shirt down the middle; the torso must be ONE solid shirt color, remove the overlay (code proxy — confirm on a render)")
        if not re.search(r"\{/\* neck: connects the head to the torso", kid_body):
            flags.append("KID: the Kid has no neck connecting the head to the torso — the head only touches the torso at one point and reads as a ball sitting on the chair back; add a neck (hair color) anchored into the torso and up into the head, and lower the head so it overlaps the shoulders (code proxy — confirm on a render)")
        if not re.search(r"translate\(0 -138\)", kid_body):
            flags.append("KID: the Kid head is not lowered to translate(0 -138) — at -150 it only touches the torso at one point and floats above the chair; lower it so it overlaps the shoulders (code proxy — confirm on a render)")
        chair_leg_ms = re.findall(r"<rect x=\{(-?[\d.]+)\} y=\{10\} width=\{(9|10)\} height=\{64\} fill=\{CHAIR_DK\}", kid_body)
        if seat_m:
            seat_x = float(seat_m.group(1))
            seat_y = float(seat_m.group(2))
            seat_w = float(seat_m.group(3))
            seat_bottom = seat_y + float(seat_m.group(4))
            seat_half = seat_w / 2
            if seat_half <= 52:
                flags.append(f"SEATED: the Kid chair seat is {seat_w:g}px wide (half {seat_half:g}), no wider than the 104-wide torso — from behind the seat is invisible and the kid reads as standing, not sitting; the seat must stick out past the torso on both sides (156 wide)")
            if abs(seat_x) + seat_w / 2 < 52:
                flags.append(f"SEATED: the Kid chair seat (x={seat_x:g}..{seat_x + seat_w:g}) does not span past the torso (±52) — the seat must stick out on both sides or it reads as no chair at all")
        else:
            seat_bottom = None
        if pants_ms:
            # Nov 12 v10 (Javion: legs removed entirely) — ANY PANTS rect in the Kid
            # means legs are back. The v9 hips block is gone too: it covered the seat
            # slab's middle and read as legs through the chair, same as every leg
            # version before it. No PANTS shape may exist in the Kid.
            flags.append(f"KID: the Kid has {len(pants_ms)} PANTS leg/hips shape(s) back — Javion ordered the legs REMOVED entirely (Nov 12 v10); delete all PANTS rects (hips block, shins, thighs), do NOT re-add legs without his say-so")
        # (Nov 12 v10: the shin-start and shin/chair-leg overlap checks are gone —
        # shins do not exist anymore, and any re-added shin is a PANTS rect caught
        # by the legs-gone flag above.)
    # --- CELL DOOR (Nov 12 v14, Javion: "look at the door it's glitched").
    #     The S133 door was a double-draw: the Cell's padlocked door underneath,
    #     plus a Prop "open" door on top that was just a translucent warm wash
    #     over the same slab — a flat tan board that hid the padlock, cut the
    #     picture in half and sat on the bowl, closed while the caption said
    #     "SUNLIGHT". The Prop open_ branch must now draw a REAL open doorway:
    #     a sunlit opening inset in the frame, the door swung open toward the
    #     viewer (foreshortened panel, recessed panels + knob), sunlight spilling
    #     on the floor. And the Cell set must keep the picture and the food tray
    #     clear of the doorway (door spans x=1060..1290).
    s133 = read(STUDIO / "src/episodes/zenn-003/shots.tsx")
    door_m = re.search(r"case 'door': return .*", s133)
    if not door_m:
        flags.append("shots.tsx: could not find the Prop 'door' case — check by hand")
    else:
        door_case = door_m.group(0)
        if 'fill="#FFE2B0" opacity={0.35}' in door_case:
            flags.append("DOOR: the Prop 'door' open_ branch is still the old flat warm wash over the closed slab — a tan board that hides the padlock and reads as glitched; the open_ branch must draw a real open doorway (sunlit opening + swung-open panel + floor spill)")
        if 'fill="#FFE9BE"' not in door_case:
            flags.append("DOOR: the Prop 'door' open_ branch has no sunlit opening (expected a bright #FFE9BE opening inset in the frame) — the doorway must show sunlight coming through, not the lamp's cone")
        if not re.search(r"<rect x=\{98\} y=\{-168\} width=\{68\} height=\{336\}", door_case):
            flags.append("DOOR: the Prop 'door' open_ branch has no swung-open door panel (expected the foreshortened panel hinged on the right jamb, x={98} width={68}, with recessed panels + knob) — the door must be visibly open, not a closed slab")
    cell = read(STUDIO / "src/engine/sets/cell.tsx")
    pic_m = re.search(r"<WallFrame x=\{(\d+)\} y=\{520\} w=\{64\} h=\{80\}", cell)
    if not pic_m:
        flags.append("cell.tsx: could not find the wall picture frame — check by hand")
    elif not (int(pic_m.group(1)) + 64 <= 1060 or int(pic_m.group(1)) >= 1290):
        flags.append(f"DOOR: the Cell wall picture (x={pic_m.group(1)}..{int(pic_m.group(1)) + 64}) overlaps the doorway (x=1060..1290) — the door cuts through it; move the picture clear of the doorway (x=560, on the free left span, clear of the centred wall items, the tallies and the note)")
    tray_m = re.search(r"<ellipse cx=\{(\d+)\} cy=\{772\}", cell)
    if not tray_m:
        flags.append("cell.tsx: could not find the food tray — check by hand")
    elif not (int(tray_m.group(1)) + 70 <= 1060 or int(tray_m.group(1)) - 70 >= 1290):
        flags.append(f"DOOR: the Cell food tray (cx={tray_m.group(1)}) sits under the doorway (x=1060..1290) — the door sits on the bowl; move the tray onto the open floor left of the doorway (cx=950, clear of the mattress)")
    # S133 hero must stand on the BARE floor, not the mattress: the floor
    # mattress spans x≈380..830 on screen (measured from the S133 still) — the
    # v13 hero at x≈700 stood ON it. Flag any S133 keyframe x below 860.
    # --- BRAIN SCAN (Nov 12 v15, Javion: "Can you fix S96 then?"; v16 reframe).
    #     The S96 brain_scan was at (715.3, 552.8) — dead-centre on the
    #     Antarctic station roofline (roof x=600..1280, y=540..566), with the
    #     satellite dish (x=660..740, y=460..540) right above it, so the arch
    #     + brain + scan lines straddled the roof and garbled into an
    #     unreadable mess. v15 moved it to (265, 505); v16 reframed the camera
    #     to the S3 wide shot, which would clip (265, 505) at the left edge, so
    #     it now sits at (1050, 450, s=0.7) on the mountain face (ridgeline
    #     y≈375 at x=1050), clear of the roof, the dish, the (900,300) snow cap
    #     and the antenna. Its box (centre ± 62*s) must overlap NONE of those.
    s96_m = re.search(r"export const S96.*?export const S97", s133, flags=re.DOTALL)
    if not s96_m:
        flags.append("shots.tsx: could not find the S96 shot block — check by hand")
    else:
        bs_m = re.search(r'kind="brain_scan" x=\{([\d.]+)\} y=\{([\d.]+)\} s=\{([\d.]+)\}', s96_m.group(0))
        if not bs_m:
            flags.append("shots.tsx: could not find the S96 brain_scan prop — check by hand")
        else:
            bx, by, bs = float(bs_m.group(1)), float(bs_m.group(2)), float(bs_m.group(3))
            half = 62 * bs
            box = (bx - half, by - half, bx + half, by + half)
            for name, rect in (("station roof", (600, 540, 1280, 566)), ("satellite dish", (660, 460, 740, 540)), ("(900,300) snow cap", (840, 300, 980, 375)), ("antenna", (1120, 380, 1240, 540))):
                if box[0] < rect[2] and box[2] > rect[0] and box[1] < rect[3] and box[3] > rect[1]:
                    flags.append(f"BRAIN_SCAN: the S96 brain_scan at ({bx}, {by}) s={bs} overlaps the {name} (rect x={rect[0]}..{rect[2]}, y={rect[1]}..{rect[3]}) — it straddles the roofline and garbles into an unreadable mess; move it to clear open sky on the mountain face (1050, 450, s=0.7), clear of the roof, the dish, the snow cap, the antenna, the DAY 21 chip and the station")
        # --- S96 CAMERA (Nov 12 v16, Javion: "We'll fix it").
        #     The v13–v15 camera (camX 324, zoom 1.8–1.9) showed only 4 of the
        #     9 researchers (world x=330..1590) — the group read as a sparse
        #     half-team. The fix pulls back to the S3 wide framing (camX 954,
        #     camY 580, zoom 1.35–1.4), which shows all 9. Flag a zoom above
        #     1.45 (the full 1260-wide group no longer fits) or a camX off the
        #     group centre (960 ± 60).
        camx_m = re.search(r"const camX = kf\(t, \[\[0, ([\d.]+)\]", s96_m.group(0))
        zoom_m = re.search(r"const zoom = kf\(t, \[\[0, ([\d.]+)\]", s96_m.group(0))
        if not camx_m or not zoom_m:
            flags.append("shots.tsx: could not find the S96 camera (camX/zoom) — check by hand")
        else:
            if float(zoom_m.group(1)) > 1.45:
                flags.append(f"S96 CAMERA: zoom starts at {zoom_m.group(1)} — the 9-researcher group (world x=330..1590, 1260 wide) no longer fits; only ~4 show and the group reads as a sparse half-team; pull back to the S3 wide framing (zoom 1.35, camX 954, camY 580)")
            if not (900 <= float(camx_m.group(1)) <= 1020):
                flags.append(f"S96 CAMERA: camX is {camx_m.group(1)} — off the researcher-group centre (960); the group is cut off on one side; re-centre to camX 954")
    # --- ANTARCTIC SET GAP (Nov 12 v16, Javion: "We'll fix it").
    #     The far-mountains path used to end at y=560 while the snow field
    #     starts at y=760 — a 200px undrawn gap (560..760) that read as a dark
    #     void band behind the researchers in S96 (and S3/S120/S124/S152). The
    #     mountains bottom must meet the snow top (both y=760).
    ant = read(STUDIO / "src/engine/sets/antarctic.tsx")
    mtn_m = re.search(r'L 2120 ([\d.]+) L -200 ([\d.]+) Z" fill="#8FA8C4"', ant)
    snow_m = re.search(r'points="0,([\d.]+) 1920,[\d.]+', ant)
    if not mtn_m or not snow_m:
        flags.append("antarctic.tsx: could not find the mountains path or snow polygon — check by hand")
    elif float(mtn_m.group(1)) != float(snow_m.group(1)) or float(mtn_m.group(2)) != float(snow_m.group(1)):
        flags.append(f"ANTARCTIC GAP: the far-mountains bottom (y={mtn_m.group(1)}/{mtn_m.group(2)}) does not meet the snow-field top (y={snow_m.group(1)}) — the undrawn gap reads as a dark void band behind the researchers; extend the mountains path down to y={snow_m.group(1)}")
    return flags


def cmd_audit(args):
    shots_path = Path(args.shots) if args.shots else EPISODES[args.episode]["shots"]
    episode = args.episode
    findings = audit_shots_file(shots_path, episode)
    shared = audit_shared()
    flagged = [f for f in findings if f["flags"]]
    lines = []
    lines.append(f"# Board-defect audit — {episode} — {shots_path}")
    lines.append("")
    lines.append(f"Shots scanned: {len(findings)}. Shots with flags: {len(flagged)}.")
    lines.append("")
    lines.append("## Shared foundation (rig / kit / sets / props / cast sheet)")
    lines.append("")
    if shared:
        for s in shared:
            lines.append(f"- [ ] {s}")
    else:
        lines.append("- [x] Clean — old hair system gone, pedestrians have natural PedHair, main cast bald/deerstalker, no warm rim, sleeves match the garment (T-shirts short, jackets/coats/sweaters long, Javion v17 + v18), MOONLIGHT defined, clothes-fit proxies pass (jacket connected, hem at the waist, hood compact).")
    lines.append("- (note) CLOTHES: the clothes-fit checks above are code proxies (panel connection, sleeve length, hem position, hood width) — floating/clipping fabric can only be proven by looking at a render; re-render and look after any rig change.")
    lines.append("")
    lines.append("## Per-shot findings (one section per shot — not summarized)")
    lines.append("")
    for f in findings:
        lines.append(f"### {f['shot']}")
        lines.append(f"- Characters in shot: {f['counts']['characters']} (pedestrians: {f['counts'].get('pedestrians', 0)}); rimBlue {f['counts']['rimBlue']}, rimInkl {f['counts']['rimInkl']}.")
        if f["placements"]:
            pos = "; ".join(f"({p['x']},{p['y']}) s={p['scale']}" for p in f["placements"][:8])
            lines.append(f"- Poses (x,y,scale): {pos}")
            lines.append("  Placement check: feet must be on the floor (y = floor), seated figures must reach the desk, nothing inside a doorway opening.")
        if f["flags"]:
            for fl in f["flags"]:
                lines.append(f"- [ ] {fl}")
        else:
            lines.append("- [x] Clean — no duplicate, floating-item, rim, popup, hair, leg, dancing-leg, duplicate-look, clothes, or arm flag.")
        for note in f.get("displacement_notes", []):
            lines.append(f"- (note) {note}")
        lines.append("")
    report = "\n".join(lines)
    if args.report:
        write_verified(args.report, report)
        print(f"audit: wrote {args.report}")
    else:
        print(report)
    print(f"audit: {len(findings)} shots, {len(flagged)} flagged, {len(shared)} shared-foundation flags")
    return 0


def _fix_pose_blocks(block, counts):
    """DANCING-LEGS fix (Nov 12), per poseAt block in one shot block.

    Standing block (x-range < 40px): a key with BOTH legs |b|>25 is dancing —
    both legs go to {a:0,b:0}. Walking block: the same flagged keys are
    rewritten as an alternating walk (one leg near-straight, the other a
    moderate swing, alternating across the flagged keys, never both deeply
    bent). Only the flagged keys are rewritten: a single-leg bend is left for
    a human to judge, so a second run changes nothing (idempotent)."""
    out = block
    pat = re.compile(r"const (p\d+) = poseAt\(t, \[(.*?)\]\);", re.DOTALL)
    for m in reversed(list(pat.finditer(out))):
        body = m.group(2)
        spans = _pbody_spans(body)
        xs = []
        for (_f, s, e) in spans:
            xm = re.search(r"x: ([\d.]+)", body[s:e])
            if xm:
                xs.append(float(xm.group(1)))
        xr = (max(xs) - min(xs)) if xs else 0
        new_body = body
        flagged_i = 0
        for idx in range(len(spans) - 1, -1, -1):
            _f, s, e = spans[idx]
            # Spans were computed on the original body; keys are processed
            # last-to-first and each replacement stays inside its own key, so
            # earlier spans stay valid.
            pbody = body[s:e]
            legL = re.search(r"legL: \{ a: ([-\d.]+), b: ([-\d.]+) \}", pbody)
            legR = re.search(r"legR: \{ a: ([-\d.]+), b: ([-\d.]+) \}", pbody)
            if not (legL and legR):
                continue
            if not (abs(float(legL.group(2))) > 25 and abs(float(legR.group(2))) > 25):
                continue
            if xr < 40:
                new_pbody = re.sub(r"legL: \{ a: [-\d.]+, b: [-\d.]+ \}", "legL: { a: 0, b: 0 }", pbody)
                new_pbody = re.sub(r"legR: \{ a: [-\d.]+, b: [-\d.]+ \}", "legR: { a: 0, b: 0 }", new_pbody)
                counts["legs_standing"] = counts.get("legs_standing", 0) + 1
            else:
                if flagged_i % 2 == 0:
                    new_pbody = re.sub(r"legL: \{ a: [-\d.]+, b: [-\d.]+ \}", "legL: { a: 0, b: 0 }", pbody)
                    new_pbody = re.sub(r"legR: \{ a: [-\d.]+, b: [-\d.]+ \}", "legR: " + WALK_SWING, new_pbody)
                else:
                    new_pbody = re.sub(r"legL: \{ a: [-\d.]+, b: [-\d.]+ \}", "legL: " + WALK_SWING, pbody)
                    new_pbody = re.sub(r"legR: \{ a: [-\d.]+, b: [-\d.]+ \}", "legR: { a: 0, b: 0 }", new_pbody)
                counts["legs_walk"] = counts.get("legs_walk", 0) + 1
            flagged_i += 1
            new_body = new_body[:s] + new_pbody + new_body[e:]
        out = out[:m.start(2)] + new_body + out[m.end(2):]
    return out


def _set_first_key_arms(block, var, armL, armR):
    """Rewrite the FIRST key's armL/armR of poseAt block `var` (used to vary a
    group member's gesture). Returns (new_block, True) or (block, False)."""
    m = re.search(r"const " + var + r" = poseAt\(t, \[(.*?)\]\);", block, flags=re.DOTALL)
    if not m:
        return block, False
    body = m.group(1)
    spans = _pbody_spans(body)
    if not spans:
        return block, False
    _f, s, e = spans[0]
    pbody = body[s:e]
    new_pbody = re.sub(r"armL: \{ a: [-\d.]+, b: [-\d.]+ \}", "armL: " + armL, pbody, count=1)
    new_pbody = re.sub(r"armR: \{ a: [-\d.]+, b: [-\d.]+ \}", "armR: " + armR, new_pbody, count=1)
    if new_pbody == pbody:
        return block, False
    new_body = body[:s] + new_pbody + body[e:]
    return block[:m.start(1)] + new_body + block[m.end(1):], True


def _fix_group_and_duplicates(block, shot, counts, log, path):
    """DUPLICATES + ARMS-copying fix (Nov 12), per shot block.

    Duplicates: a later Hero with a look already used in the shot gets its
    look swapped to the first unused pedestrian look (hair/jacket/gear all
    change with it) and a varied arm gesture. A main-cast duplicate
    (detective / jake / hero / professors) is NOT auto-changed — removing or
    re-casting them is a human call — it is logged NOT APPLIED.
    Group copying: if every Hero's first-key arm pose is identical, members
    2+ get varied gestures from ARM_GESTURE_CYCLE."""
    out = block
    heroes = shot_heroes(out)
    if not heroes:
        return out
    pose_blocks = parse_pose_blocks(out)
    # --- group copying: all first-key arm poses identical AND non-neutral?
    #     (The neutral hang is the correct idle pose, not copying — see the
    #     audit; only a shared gesture gets varied.)
    if len(heroes) >= 2:
        arm_pairs = []
        for look, var, _ in heroes:
            keys = pose_blocks.get(var) or []
            if keys and keys[0].get("armL") is not None and keys[0].get("armR") is not None:
                arm_pairs.append((keys[0]["armL"], keys[0]["armR"]))
            else:
                arm_pairs.append(None)
        neutral = [((4.0, 8.0), (4.0, 8.0)), ((5.0, 0.0), (5.0, 0.0))]
        if (all(p is not None for p in arm_pairs) and len(set(arm_pairs)) == 1
                and arm_pairs[0] not in neutral):
            varied_before = counts.get("arms_varied", 0)
            for i in range(1, len(heroes)):
                armL, armR = ARM_GESTURE_CYCLE[i % len(ARM_GESTURE_CYCLE)]
                new_out, ok = _set_first_key_arms(out, heroes[i][1], armL, armR)
                if ok:
                    out = new_out
                    counts["arms_varied"] = counts.get("arms_varied", 0) + 1
            if counts.get("arms_varied", 0) > varied_before:
                log.add(path, f"ARMS (copying) {shot}: all {len(heroes)} members shared one arm pose — varied members 2+ from the gesture cycle")
    # --- duplicates: the FIRST Hero with an identity keeps it; LATER ones
    #     are differentiated. Decisions are made in file order, then applied
    #     from the last hero backwards so JSX offsets stay valid.
    heroes = shot_heroes(out)
    seen = set()
    dup_idx = []
    for idx, (ident, var, _) in enumerate(heroes):
        if ident in seen:
            dup_idx.append(idx)
        else:
            seen.add(ident)
    used_bases = {ident[0] for ident, _, _ in heroes}
    for idx in reversed(dup_idx):
        ident, var, start = heroes[idx]
        base = ident[0]
        if base in PED_LOOKS:
            repl = next((c for c in PED_LOOKS if c not in used_bases), None)
            if repl is None:
                log.note(path, f"DUPLICATES {shot}: NOT APPLIED — '{base}' repeats but no unused pedestrian look is left to swap to; remove or re-cast by hand")
                continue
            # Replace the whole look expression (plain `look={LOOKS.x}` or
            # spread `look={{...LOOKS.x, ...}}`) with the plain new look.
            lm = re.search(r"look=\{(?:LOOKS\.\w+|\{\.\.\.LOOKS\.\w+[^}]*\})\}", out[start:])
            if not lm:
                log.note(path, f"DUPLICATES {shot}: NOT APPLIED — could not find the '{base}' Hero's look expression to swap; check by hand")
                continue
            ls, le = start + lm.start(), start + lm.end()
            out = out[:ls] + "look={LOOKS." + repl + "}" + out[le:]
            used_bases.add(repl)
            counts["duplicates"] = counts.get("duplicates", 0) + 1
            log.add(path, f"DUPLICATES {shot}: '{base}' repeated — later one swapped to '{repl}' (different hair + jacket + gear)")
            armL, armR = ARM_GESTURE_CYCLE[(counts["duplicates"]) % len(ARM_GESTURE_CYCLE)]
            new_out, ok = _set_first_key_arms(out, var, armL, armR)
            if ok:
                out = new_out
                counts["arms_varied"] = counts.get("arms_varied", 0) + 1
        else:
            log.note(path, f"DUPLICATES {shot}: NOT APPLIED — main-cast look '{base}' appears twice; removing or re-casting the Detective/Jake/hero/professors is a human call")
    return out


def fix_clothes_fit(log):
    """CLOTHES-FIT fix (Nov 12) on rig.tsx: the sleeve length/width is
    auto-corrected (a short/narrow sleeve is a one-number fix); the
    jacket/hood/hem geometry is VERIFIED against the same proxies the audit
    uses and, if it fails, logged NOT APPLIED — re-cutting a jacket panel or
    a hood by script is not safe, that is a hand edit in rig.tsx.
    Idempotent: a second run finds the numbers already right and the proxies
    already passing."""
    p = STUDIO / "src/engine/rig.tsx"
    t = read(p)
    orig = t

    def bump(m):
        n = int(m.group(1))
        return m.group(0) if n >= 58 else m.group(0).replace(m.group(1), "58", 1)

    t, n = sub_count(t, r"const L1 = (\d+);", bump)
    if n and "const L1 = 58;" in t and "const L1 = 58;" not in orig:
        log.add(p, "CLOTHES: sleeve length L1 -> 58 (covers the upper arm to just above the elbow)")
    elif n:
        pass  # already 58+: idempotent, nothing to do

    def bump_w0(m):
        n = int(m.group(1))
        return m.group(0) if n >= 17 else m.group(0).replace(m.group(1), "17", 1)

    t, n = sub_count(t, r"const w0 = (\d+);", bump_w0)
    if "const w0 = 17;" in t and "const w0 = 17;" not in orig:
        log.add(p, "CLOTHES: sleeve shoulder half-width w0 -> 17 (root overlaps the torso)")
    elif n:
        pass

    def bump_w1(m):
        n = int(m.group(1))
        return m.group(0) if n >= 13 else m.group(0).replace(m.group(1), "13", 1)

    t, n = sub_count(t, r"const w1 = (\d+);", bump_w1)
    if "const w1 = 13;" in t and "const w1 = 13;" not in orig:
        log.add(p, "CLOTHES: sleeve cuff half-width w1 -> 13 (sleeve-to-arm transition reads at small scale)")
    elif n:
        pass
    if t != orig:
        write_verified(p, t)
    # Verify the jacket/hood/hem proxies on the (possibly updated) rig text.
    remaining = audit_clothes_fit(read(p))
    if remaining:
        for f in remaining:
            log.note(p, f"CLOTHES NOT APPLIED: {f} — re-cut the garment by hand in rig.tsx")
    else:
        log.note(p, "CLOTHES: rig proxies pass (jacket panels connected to the hem, sleeves cover the upper arm, hem at the waist, hood compact)")
    return log


# ---------------------------------------------------------------- fix

def fix_rig(log):
    """Foundation fix 1: rig.tsx — remove hair entirely, straighten legs/arms,
    connect sleeves, widen the stance so straight legs keep two feet."""
    p = STUDIO / "src/engine/rig.tsx"
    t = read(p)
    orig = t

    # --- Look type: drop the hair fields + their comments.
    t, n = replace_exact(t, "  hair: string;\n", "")
    if n: log.add(p, f"Look type: removed `hair: string` field ({n})")
    old = ("  /** Pip's hair tuft on top of the head: the skill's looks keep it (default true). INKL looks set false —\n"
           "      the approved black-silhouette standard is plain smooth round heads, no spikes, on everyone. */\n"
           "  hairTuft?: boolean;\n")
    t, n = replace_exact(t, old, "")
    if n: log.add(p, "Look type: removed hairTuft field + comment")
    old = ("  /** Hair style for the HAIR_SAMPLE flag (Nov 8, Javion: hair on all characters, like real people).\n"
           "      Only drawn when the sample flag is on; default-off the look is byte-identical. */\n"
           "  hairStyle?: 'sideburns' | 'crop' | 'long' | 'afro' | 'bun' | 'sidebun' | 'sidepart' | 'ponytail' | 'curls' | 'flattop' | 'spiky' | 'bob';\n")
    t, n = replace_exact(t, old, "")
    if n: log.add(p, "Look type: removed hairStyle field + comment")
    t, n = replace_exact(t, "extra?: 'hood' | 'curls' | 'bunches' | 'bob' | 'suit' | 'deerstalker' | 'specs';",
                         "extra?: 'hood' | 'curls' | 'suit' | 'deerstalker' | 'specs';")
    if n: log.add(p, "Look type: removed hair-only extras 'bunches'/'bob' from the extra union ('curls' stays — it also drives the headphones; 'suit' stays — it drives shirt+tie)")
    t, n = replace_exact(t, "/** One distinct human item per character for the HAIR_SAMPLE flag (a watch, a scarf, earrings...). */",
                         "/** One distinct human item per character (a watch, a scarf, earrings...). */")
    if n: log.add(p, "Look type: dropped the HAIR_SAMPLE flag mention from the gear comment")

    # --- LOOKS entries: strip OLD hair fields from every costume.
    # Colour literals only (hair: '#...'): the new pedestrian-hair field is a
    # STYLE name (hair: 'bun') and must NEVER be stripped — it is required
    # (see fix_ped_hair). An old colour field is a stale defect.
    for pat, label in [
        (r", hair: '#[^']*'", "hair colour field (old #hex)"),
        (r", hair: C\.ink", "hair colour field (C.ink)"),
        (r", hairTuft: false", "hairTuft field"),
        (r", hairStyle: '[^']*'", "hairStyle field"),
        (r", extra: 'bunches'", "'bunches' extra (sis)"),
        (r", extra: 'bob'", "'bob' extra (mom)"),
    ]:
        t, n = sub_count(t, pat, "")
        if n: log.add(p, f"LOOKS: removed {n}x {label}")

    # --- basePose: arms straight down, legs straight/vertical.
    t, n = replace_exact(t, "  armL: { a: 10, b: -8 },", "  armL: { a: 5, b: 0 },")
    if n: log.add(p, "basePose: armL {a:10,b:-8} -> {a:5,b:0} (straight down, no bend)")
    t, n = replace_exact(t, "  armR: { a: 10, b: -8 },", "  armR: { a: 5, b: 0 },")
    if n: log.add(p, "basePose: armR {a:10,b:-8} -> {a:5,b:0} (straight down, no bend)")
    old_legs = ("  // v8: standing legs SPLAY ({legL:-5, legR:+5}) — the old {+5,-5} converged in front\n"
                "  // view (feet at +/-4.8, shoes 44 wide overlapping into one oval = \"single leg\").\n"
                "  legL: { a: -5, b: 0 },\n"
                "  legR: { a: 5, b: 0 },\n")
    new_legs = ("  // Nov 11 (Javion: legs straight, not bent/dancing): standing legs are VERTICAL\n"
                "  // ({a:0, b:0}). The feet stay apart because the hip stance is wide (HIP.x 26)\n"
                "  // and the shoes are narrow (rx 14) — no splay, and the feet can never merge\n"
                "  // into one oval again.\n"
                "  legL: { a: 0, b: 0 },\n"
                "  legR: { a: 0, b: 0 },\n")
    t, n = replace_exact(t, old_legs, new_legs)
    if n: log.add(p, "basePose: legs {a:-5/+5,b:0} (splay) -> {a:0,b:0} (straight/vertical)")

    # --- stance + shoes: keep two distinct feet with straight legs.
    t, n = replace_exact(t, "const HIP = { x: 17, y: 0 };", "const HIP = { x: 26, y: 0 };")
    if n: log.add(p, "HIP.x 17 -> 26 (wider stance, so vertical legs still land feet apart)")
    t, n = replace_exact(t, "<ellipse cx={o.end.x + pose.yaw * 9} cy={o.end.y + 4} rx={18} ry={11}",
                         "<ellipse cx={o.end.x + pose.yaw * 9} cy={o.end.y + 4} rx={14} ry={11}")
    if n: log.add(p, "shoe: rx 18 -> 14 (narrower shoes, so the two feet read as two)")

    # --- sleeve: wider root so it overlaps the torso and reads as connected.
    t, n = replace_exact(t, "    const w0 = 14; // half-width at the shoulder",
                         "    const w0 = 16; // half-width at the shoulder (Nov 11: wider root so the sleeve overlaps the torso and reads as connected to the shirt)")
    if n: log.add(p, "sleeve: shoulder half-width 14 -> 16 (root overlaps the torso = connected)")

    # --- Delete the Hair component entirely (it ends just before the ShirtFace comment).
    start = t.find("const Hair: React.FC<{ style: NonNullable<Look['hairStyle']")
    anchor = "/** A face printed on a T-shirt chest"
    end = t.find(anchor)
    if start != -1 and end != -1 and start < end:
        removed = t[start:end]
        n_lines = removed.count("\n")
        t = t[:start] + ("// Nov 11 (Javion: \"get rid of the hair command entirely\"): the Hair\n"
                          "// component is REMOVED — no hair on any character in any scene, ever.\n"
                          "// Heads are plain smooth round silhouettes. (The ShirtFace prints below\n"
                          "// are pictures printed on a T-shirt, not a character's hair — left alone.)\n\n") + t[end:]
        log.add(p, f"Deleted the entire Hair component ({n_lines} lines, all 12 styles)")
    elif "const Hair:" in t:
        log.add(p, "NOT APPLIED: Hair component anchors not found — check by hand")

    # --- Hero signature: drop the hairOn prop.
    t, n = replace_exact(
        t,
        "export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look; hairOn?: boolean; shirtFace?: ShirtFaceWho }> = ({ pose, shadow = 1, rimId = 'rimBlue', look = LOOKS.pipHood, hairOn = true, shirtFace }) => {",
        "export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look; shirtFace?: ShirtFaceWho }> = ({ pose, shadow = 1, rimId = 'rimBlue', look = LOOKS.pipHood, shirtFace }) => {")
    if n: log.add(p, "Hero: removed the hairOn prop (signature + default)")

    # --- Replace the HAIR_SAMPLE comment block above the sleeve with the no-hair note.
    old = ("  // ---- HAIR_SAMPLE cloth motion (Nov 8, Javion: clothes must MOVE, not sit stiff) ----\n"
           "  // Every block in this section is gated on `hairOn`. HAIR IS THE STANDARD (Nov 9,\n"
           "  // Javion: \"we gone continue to this for every video\") — hairOn now defaults TRUE, so\n"
           "  // every video renders hair + moving clothes + accessories unless a composition opts\n"
           "  // out explicitly with hairOn={false}. Characters without a hairStyle/gear defined\n"
           "  // (e.g. pipHood) are unaffected. The plain Cast sheet still passes hairOn={false}.\n")
    new = ("  // ---- Cloth motion (Nov 8, Javion: clothes must MOVE, not sit stiff) ----\n"
           "  // Nov 11 (Javion: no hair, ever): the old hairOn gate is GONE. Sleeves, gear,\n"
           "  // hem, watch and earrings render UNCONDITIONALLY — the gate was the reason\n"
           "  // sleeves vanished whenever hair was off. Every character is a plain smooth\n"
           "  // round-headed silhouette; costume details are what tell them apart.\n")
    t, n = replace_exact(t, old, new)
    if n: log.add(p, "Hero: replaced the HAIR_SAMPLE comment block with the no-hair note")

    # --- Decouple every gear/sleeve/hem/watch/earrings gate from hairOn.
    # (Plain applications below; each logs how many it changed, 0 = already done.)
    t, n = sub_count(t, r"\{hairOn && (L\.gear === '[a-z]+') \? \(", r"{\1 ? (")
    if n: log.add(p, f"Hero: decoupled {n}x gear block(s) from hairOn (now render unconditionally)")
    t, n = sub_count(t, r"\{hairOn \? (sleeve\(j\.arm[LR]\)) : null\}", r"{\1}")
    if n: log.add(p, f"Hero: decoupled {n}x sleeve render(s) from hairOn (sleeves always render)")
    t, n = sub_count(t, r"\{hairOn && (L\.gear === 'watch') \? (watch\(j\.armL\)) : null\}", r"{\1 ? \2 : null}")
    if n: log.add(p, f"Hero: decoupled {n}x watch render(s) from hairOn")

    # --- Hem: the one bare `{hairOn ? (` ternary. Unwrap it by index (robust).
    marker = "{hairOn ? ("
    idx = t.find(marker)
    if idx != -1:
        inner_open = t.find("<g transform={`rotate(${(avgArmA", idx)
        inner_close = t.find("</g>", inner_open)
        tail = t.find(") : null}", inner_close)
        if inner_open != -1 and inner_close != -1 and tail != -1:
            inner = t[inner_open:inner_close + len("</g>")]
            # dedent the inner group by 2 spaces to match its new nesting level
            inner = "\n".join((ln[2:] if ln.startswith("  ") else ln) for ln in inner.split("\n"))
            t = t[:idx] + inner + t[tail + len(") : null}"):]
            log.add(p, "Hero: unwrapped the hem from hairOn (hem now always renders)")
        else:
            log.add(p, "NOT APPLIED: hem block anchors not found — check by hand")
    # (if idx == -1 the hem is already unwrapped: idempotent, nothing to do.)

    # --- Delete the Hair render line.
    t, n = sub_count(t, r"      \{hairOn && L\.hairStyle \? <Hair style=\{L\.hairStyle\} L=\{L\} yaw=\{pose\.yaw\} sway=\{pose\.sway\} /> : null\}\n", "")
    if n: log.add(p, "Hero: deleted the <Hair> render line")

    # --- Delete the head-hair blocks (KEEP the deerstalker cap + torso suit/curls).
    t, n = sub_count(t, r"      \{L\.extra === 'bunches' \|\| L\.extra === 'bob' \|\| L\.extra === 'suit' \|\| L\.extra === 'deerstalker' \|\| L\.extra === 'specs' \|\| L\.hairTuft === false \? null : \(\n.*?fill=\{L\.hair\} />\n\s*\)\}\n", "", flags=re.DOTALL)
    if n: log.add(p, "Hero head: deleted the hair-tuft path")
    for extra in ("bunches", "bob", "suit"):
        t, n = sub_count(t, r"      \{L\.extra === '" + extra + r"' \? \(.*?\) : null\}\n", "", flags=re.DOTALL)
        if n: log.add(p, f"Hero head: deleted the '{extra}' hair block (KEPT the torso shirt+tie / headphones that share the name)")
    t, n = sub_count(t, r"      \{L\.extra === 'curls'\n\s*\? \[.*?\.map\(.*?\)\n\s*: null\}\n", "", flags=re.DOTALL)
    if n: log.add(p, "Hero head: deleted the 'curls' head-circles block (KEPT the torso headphones)")

    # --- Magnifier doc comment: warm rimInkl -> moonlight rimBlue.
    t, n = replace_exact(t, 'Wrap it in filter="url(#rimInkl)"', 'Wrap it in filter="url(#rimBlue)"')
    if n: log.add(p, "Magnifier doc: rimInkl -> rimBlue in the comment")

    if t != orig:
        write_verified(p, t)
    return log


def fix_ped_hair(log):
    """Foundation fix: pedestrian hair (Nov 11, Javion: every pedestrian gets
    natural hair, nothing that looks like a hat).
    - rig.tsx LOOKS: every pedestrian look gets a PedHairStyle + a natural
      brown hairC if it lacks one (styles/colours cycle deterministically by
      the look's position, so the fix is stable). Any hair on a main-cast look
      (detective / jake / hero / professors) is REMOVED — they stay
      bald / deerstalker.
    - party.tsx PARTY_GUESTS: every entry gets a PedHairStyle + hairC if it
      lacks one. PartyGuest must render PedHair; if the render is missing it
      is flagged, not guessed — inserting JSX by script is not safe.
    Idempotent: a second run changes nothing."""
    # --- rig.tsx LOOKS
    p = STUDIO / "src/engine/rig.tsx"
    t = read(p)
    orig = t
    looks = parse_looks(t)
    for i, name in enumerate(PED_LOOKS):
        body = looks.get(name)
        if body is None:
            log.add(p, f"NOT APPLIED: pedestrian look '{name}' missing from LOOKS — check by hand")
            continue
        if re.search(r"hair: '", body):
            continue  # already has hair (style validated by the audit)
        style = PED_HAIR_STYLES[i % len(PED_HAIR_STYLES)]
        colour = PED_HAIR_COLORS[i % len(PED_HAIR_COLORS)]
        old_entry = f"  {name}: {{{body}}},"
        new_body = body.rstrip() + f", hair: '{style}', hairC: '{colour}' "
        new_entry = f"  {name}: {{{new_body}}},"
        t, n = replace_exact(t, old_entry, new_entry)
        if n:
            log.add(p, f"LOOKS: pedestrian '{name}' had no hair — added hair: '{style}', hairC: '{colour}'")
        else:
            log.add(p, f"NOT APPLIED: could not find the '{name}' LOOKS entry to add hair — check by hand")
    for name in BALD_LOOKS:
        body = looks.get(name)
        if body is None:
            continue
        if not re.search(r"hair: '", body):
            continue
        new_body = re.sub(r", hair: '[^']*'", "", body)
        new_body = re.sub(r", hairC: '[^']*'", "", new_body)
        old_entry = f"  {name}: {{{body}}},"
        new_entry = f"  {name}: {{{new_body}}},"
        t, n = replace_exact(t, old_entry, new_entry)
        if n:
            log.add(p, f"LOOKS: main-cast '{name}' had hair — removed it (stays bald / deerstalker)")
        else:
            log.add(p, f"NOT APPLIED: could not find the '{name}' LOOKS entry to remove hair — check by hand")
    if t != orig:
        write_verified(p, t)
    # --- party.tsx PARTY_GUESTS
    p = STUDIO / "src/engine/sets/party.tsx"
    t = read(p)
    orig = t
    entries = re.findall(r"\{ top: '[^']*'[^{}]*\}", t)
    for i, entry in enumerate(entries):
        if re.search(r"hair: '", entry):
            continue
        style = PED_HAIR_STYLES[i % len(PED_HAIR_STYLES)]
        colour = PED_HAIR_COLORS[i % len(PED_HAIR_COLORS)]
        new_entry = entry[:-1].rstrip() + f", hair: '{style}', hairC: '{colour}' }}"
        t, n = replace_exact(t, entry, new_entry)
        if n:
            log.add(p, f"PARTY_GUESTS[{i}] had no hair — added hair: '{style}', hairC: '{colour}'")
        else:
            log.add(p, f"NOT APPLIED: could not find PARTY_GUESTS[{i}] to add hair — check by hand")
    if "<PedHair" not in t:
        log.add(p, "NOT APPLIED: PartyGuest does not render PedHair — add the <PedHair> render by hand (do not guess JSX)")
    if t != orig:
        write_verified(p, t)
    return log


def fix_kit(log):
    """Foundation fix 2: kit.tsx — one shared MOONLIGHT constant for popup text."""
    p = STUDIO / "src/engine/kit.tsx"
    t = read(p)
    orig = t
    if "MOONLIGHT" not in t:
        anchor = """  glow: '#9FC0FF',
  rim: '#A9C6FF',
};"""
        repl = """  glow: '#9FC0FF',
  rim: '#A9C6FF',
};

/** Moonlight blue — the ONE popup/callout text colour (Nov 11, Javion: popup words
    in moonlight blue). Same tone as N.rim, the rimBlue rim light, so popups and
    rim light read as one moonlight look across every episode. */
export const MOONLIGHT = '#A9C6FF';"""
        t, n = replace_exact(t, anchor, repl)
        if n:
            log.add(p, "Added the shared MOONLIGHT constant ('#A9C6FF', = N.rim) for popup text")
        else:
            log.add(p, "NOT APPLIED: N-palette anchor not found — check by hand")
    if t != orig:
        write_verified(p, t)
    return log


def fix_shots(episode, log):
    """Episode-level fixes on a shots file: rim -> rimBlue, popup -> MOONLIGHT,
    oversized phone -> hand-held, standing arms/legs -> straight. Works for ANY
    episode (the patterns are the same); counts of 0 mean 'not present here'."""
    cfg = EPISODES[episode]
    p = cfg["shots"]
    t = read(p)
    orig = t

    # --- rim: every shot uses the moonlight rim.
    t, n = sub_count(t, r'rimId="rimInkl"', 'rimId="rimBlue"')
    t, n2 = sub_count(t, r"rimId='rimInkl'", "rimId='rimBlue'")
    if n + n2:
        log.add(p, f"rim: {n + n2}x rimInkl -> rimBlue (moonlight)")

    # --- popup text -> moonlight blue (zenn-002 has the Popup + RED const).
    if "fill={RED}" in t:
        t, n = replace_exact(t, "fill={RED}", "fill={MOONLIGHT}")
        if n: log.add(p, f"Popup: fill RED -> MOONLIGHT ({n}x)")
    if "const RED = '#C0392B';" in t and "RED" not in t.replace("const RED = '#C0392B';", ""):
        t, n = replace_exact(t, "const RED = '#C0392B';\n", "")
        if n: log.add(p, "Removed the now-unused RED const")
    # Add MOONLIGHT to the engine import if it is used but not imported yet.
    if "fill={MOONLIGHT}" in t:
        import_block = t.split("from '../../engine'")[0]
        if "MOONLIGHT" not in import_block:
            t, n = replace_exact(t, "RewindOverlay, clamp,", "RewindOverlay, clamp, MOONLIGHT,")
            if n: log.add(p, "Added MOONLIGHT to the engine import")
    # Stale header comments in zenn-002.
    t, n = replace_exact(t, "// Black silhouettes, rimInkl rim light, Detective's deerstalker + magnifier, Jake's emblem\n// (part of his look). Question popups are screen-space hand text in warm red — never captions.",
                         "// Black silhouettes, rimBlue (moonlight) rim light, Detective's deerstalker + magnifier, Jake's plain\n// red shirt (lobster emblem removed Nov 11 — it was video #2 only). Question popups are screen-space\n// hand text in moonlight blue — never captions.")
    if n: log.add(p, "Updated the stale header comment (rimInkl/red/emblem -> rimBlue/moonlight/plain shirt)")

    # --- Oversized phones -> hand-held (w<=42). A w=70 phone is torso-sized and
    #     reads as floating/propped because no hand can visibly grip it.
    def shrink_phone(m):
        w = int(m.group(2))
        if w > 50:
            return m.group(0).replace("w={%d}" % w, "w={42}")
        return m.group(0)

    big_before = [int(w) for w in re.findall(r"<Phone\b[^>]*\bw=\{(\d+)\}", t) if int(w) > 50]
    t, _ = sub_count(t, r"<Phone\b([^>]*?)w=\{(\d+)\}", shrink_phone)
    if big_before:
        log.add(p, f"Phone: shrank {len(big_before)} oversized phone(s) w={big_before} -> w=42 (hand-held; torso-sized phones read as floating)")

    # --- Standing arms/legs -> straight (gestures and walks untouched: they use
    #     other values / b != 0, so these patterns only match the standing defaults).
    for pat, repl, label in [
        (r"armL: \{ a: 10, b: -8 \}", "armL: { a: 5, b: 0 }", "armL default bent"),
        (r"armR: \{ a: 10, b: -8 \}", "armR: { a: 5, b: 0 }", "armR default bent"),
        (r"legL: \{ a: -5, b: 0 \}", "legL: { a: 0, b: 0 }", "legL splay -5"),
        (r"legR: \{ a: 5, b: 0 \}", "legR: { a: 0, b: 0 }", "legR splay +5"),
        (r"legL: \{ a: -8, b: 0 \}", "legL: { a: 0, b: 0 }", "legL splay -8"),
        (r"legR: \{ a: 8, b: 0 \}", "legR: { a: 0, b: 0 }", "legR splay +8"),
        (r"legL: \{ a: -10, b: 0 \}", "legL: { a: 0, b: 0 }", "legL splay -10"),
        (r"legR: \{ a: 10, b: 0 \}", "legR: { a: 0, b: 0 }", "legR splay +10"),
    ]:
        t, n = sub_count(t, pat, repl)
        if n: log.add(p, f"Poses: {n}x {label} -> straight")

    # --- ARMS (Nov 12): hyper-bent elbows (b>=90) and the odd back-swing
    #     {a:-60,b:30} -> the hang default {a:4,b:8}. Whole-file patterns:
    #     only pose keys write `armL: { a: ..., b: ... }` in a shots file.
    #     (re.subn counts every match the function sees, even unchanged ones,
    #     so the hyper-bent count is tracked in a counter, not from n.)
    hyper_n = [0]

    def _hyper(m):
        side, a, b = m.group(1), m.group(2), float(m.group(3))
        if b >= 90:
            hyper_n[0] += 1
            return f"arm{side}: {{ a: 4, b: 8 }}"
        return m.group(0)

    t, _ = sub_count(t, r"arm([LR]): \{ a: ([-\d.]+), b: (\d+(?:\.\d+)?) \}", _hyper)
    if hyper_n[0] > 0:
        log.add(p, f"ARMS: {hyper_n[0]}x hyper-bent arm (b>=90) -> hang default {{a:4,b:8}}")
    t, n = sub_count(t, r"arm([LR]): \{ a: -60, b: 30 \}", r"arm\1: { a: 4, b: 8 }")
    if n: log.add(p, f"ARMS: {n}x back-swung arm {{a:-60,b:30}} -> hang default {{a:4,b:8}}")

    # --- LEGS (dancing) + DUPLICATES + ARMS (copying) — per shot block, so a
    #     fix never lands in the wrong shot (several shots share identical
    #     pose lines). The file header is preserved byte-for-byte.
    counts = {}
    pat_shot = re.compile(r"^export const (S\d+): React\.FC<ShotProps>", re.M)
    matches = list(pat_shot.finditer(t))
    spans = {}
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(t)
        spans[m.group(1)] = (m.start(), end)
    for shot in sorted(spans, key=lambda s: int(s[1:]), reverse=True):
        s0, s1 = spans[shot]
        block = t[s0:s1]
        new_block = _fix_pose_blocks(block, counts)
        new_block = _fix_group_and_duplicates(new_block, shot, counts, log, p)
        t = t[:s0] + new_block + t[s1:]
    if counts.get("legs_standing"):
        log.add(p, f"LEGS (dancing, standing): {counts['legs_standing']} key(s) with both legs |b|>25 -> {{a:0,b:0}}")
    if counts.get("legs_walk"):
        log.add(p, f"LEGS (dancing, walking): {counts['legs_walk']} key(s) with both legs |b|>25 -> alternating walk (one leg planted, one moderate swing)")
    if counts.get("duplicates"):
        log.add(p, f"DUPLICATES: {counts['duplicates']} later duplicate(s) swapped to unused pedestrian looks")

    if t != orig:
        write_verified(p, t)
    return log


def fix_displacement(episode, log):
    """DISPLACEMENT fixes (Javion, Nov 11): move each confirmed displaced item
    to the right place in the shot code. Works per SHOT BLOCK, not on the whole
    file — several shots share an identical Prop line (e.g. S21 and S33 both
    have the wall clock at x=1300 y=460), so a whole-file replace would move
    the wrong shot's item. The file header (imports, helpers) is preserved
    byte-for-byte; only the shot blocks are touched. A second run finds the
    new values already in place and reports 0 changes (idempotent). Items
    whose correct place is ambiguous (DISPLACEMENT_FLAGS) are NOT moved —
    they are returned as a flagged list for the caller to print (they are
    reports, not changes, so they do not count toward 'Total changes')."""
    cfg = EPISODES[episode]
    p = cfg["shots"]
    t = read(p)
    orig = t
    fixes = DISPLACEMENT_FIXES.get(episode, {})
    flagged = list(DISPLACEMENT_FLAGS.get(episode, []))
    if not fixes:
        return flagged
    # Shot block spans, so replacements stay inside the right shot.
    pat = re.compile(r"^export const (S\d+): React\.FC<ShotProps>", re.M)
    matches = list(pat.finditer(t))
    spans = {}
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(t)
        spans[m.group(1)] = (m.start(), end)
    # Apply per shot, from the END of the file backwards so earlier offsets
    # stay valid while we edit.
    for shot, items in sorted(fixes.items(), key=lambda kv: int(kv[0][1:]), reverse=True):
        if shot not in spans:
            log.add(p, f"DISPLACEMENT {shot}: NOT APPLIED — shot not found in {episode}")
            continue
        s0, s1 = spans[shot]
        block = t[s0:s1]
        new_block = block
        for (kind, ox, oy, os_, nx, ny, ns, why) in items:
            def fmt(v):
                return ('%g' % v) if isinstance(v, float) else str(v)
            pat_prop = (r'(<Prop kind="' + kind + r'"[^>]*?x=\{)' + re.escape(fmt(ox))
                        + r'(\}[^>]*?y=\{)' + re.escape(fmt(oy))
                        + r'(\}[^>]*?s=\{)' + re.escape(fmt(os_)) + r'(\})')
            repl = r'\g<1>' + fmt(nx) + r'\g<2>' + fmt(ny) + r'\g<3>' + fmt(ns) + r'\g<4>'
            new_block, n = re.subn(pat_prop, repl, new_block, count=1)
            if n:
                log.add(p, f"DISPLACEMENT {shot}: {kind} ({fmt(ox)},{fmt(oy)}) s={fmt(os_)} -> ({fmt(nx)},{fmt(ny)}) s={fmt(ns)} — {why}")
            elif re.search(r'<Prop kind="' + kind + r'"[^>]*?x=\{' + re.escape(fmt(nx)) + r'\}', new_block):
                pass  # idempotent: already at the new position, nothing to do
            else:
                log.add(p, f"DISPLACEMENT {shot}: NOT APPLIED — {kind} at ({fmt(ox)},{fmt(oy)}) s={fmt(os_)} not found in the shot block; check by hand")
        t = t[:s0] + new_block + t[s1:]
    if t != orig:
        write_verified(p, t)
    return flagged


def fix_party(log):
    """Foundation fix 3: party.tsx — the leftmost crowd figure moves inward so
    it is never half-cropped at the edge. (Nov 11, pedestrian hair: the crowd
    guests HAVE natural PedHair now — the hair-ensuring lives in fix_ped_hair,
    not here; the old hair-shape deletions below are no-ops on the new code.)"""
    p = STUDIO / "src/engine/sets/party.tsx"
    t = read(p)
    orig = t
    t, n = replace_exact(t, "Looks cycle through varied tops + hair shapes;",
                         "Looks cycle through varied tops;")
    if n: log.add(p, "Comment: dropped 'hair shapes' from the crowd description")
    t, n = replace_exact(t, "  hair: 'short' | 'bun' | 'pony' | 'curly' | 'long' | 'cap';\n", "")
    if n: log.add(p, "PartyGuestLook: removed the hair field from the type")
    for h in ("'short'", "'bun'", "'pony'", "'curly'", "'long'", "'cap'"):
        t, n = sub_count(t, r"\{ hair: " + h + r", ", "{ ")
        if n: log.add(p, f"PARTY_GUESTS: removed {n}x hair: {h}")
    # Delete the six hair-shape render blocks (head circle + faces stay).
    for pat, label in [
        (r"        \{look\.hair === 'bun' \? <circle cx=\{0\} cy=\{-28\} r=\{11\} fill=\"#161616\" /> : null\}\n", "bun"),
        (r"        \{look\.hair === 'pony' \? <path d=\"M 20 -8 Q 34 22 24 52 Q 12 26 10 -12 Z\" fill=\"#161616\" /> : null\}\n", "pony"),
        (r"        \{look\.hair === 'curly' \? \[-18, 0, 18\]\.map\(\(cx, i\) => <circle key=\{i\} cx=\{cx\} cy=\{-22 \+ Math\.abs\(cx\) \* 0\.3\} r=\{10\} fill=\"#161616\" />\) : null\}\n", "curly"),
        (r"        \{look\.hair === 'long' \? \(\n.*?\n.*?\n.*?\n        \) : null\}\n", "long"),
        (r"        \{look\.hair === 'cap' \? <path d=\"M -27 -4 Q -26 -30 0 -31 Q 26 -30 27 -4 Z M 14 -12 L 34 -8 L 34 -2 L 14 -4 Z\" fill=\"#161616\" /> : null\}\n", "cap"),
        (r"        \{look\.hair === 'short' \? <path d=\"M -26 -4 Q -24 -28 0 -29 Q 24 -28 26 -4 Q 12 -14 0 -14 Q -12 -14 -26 -4 Z\" fill=\"#161616\" /> : null\}\n", "short"),
    ]:
        t, n = sub_count(t, pat, "", flags=re.DOTALL)
        if n: log.add(p, f"PartyGuest: deleted the '{label}' hair shape")
    t, n = replace_exact(t, "      {/* head + hair shape (black silhouette; the SHAPE varies, not the colour) */}",
                         "      {/* head (plain smooth round black silhouette — no hair on anyone) */}")
    if n: log.add(p, "PartyGuest: updated the head comment (no hair)")
    # Leftmost crowd figure: u 0.06 -> 0.11 so its head is fully in frame in tight cameras.
    t, n = replace_exact(t, "        { u: 0.06, w: 0.14 },", "        { u: 0.11, w: 0.14 }, // Nov 11: was u 0.06 — half-cropped at the left edge in tight cameras (S48), its eyes read as floating")
    if n: log.add(p, "Crowd: leftmost figure u 0.06 -> 0.11 (fully in frame; its edge-cropped eyes read as floating)")
    if t != orig:
        write_verified(p, t)
    return log


def fix_props(log):
    """Foundation fix 4: props.tsx — the Phone caller avatar loses its hair bob
    (a person depicted on a phone screen is still a depiction of hair)."""
    p = STUDIO / "src/engine/props.tsx"
    t = read(p)
    orig = t
    t, n = replace_exact(t, "          {/* the caller: a round avatar with a bob of hair */}",
                         "          {/* the caller: a round avatar (plain, no hair — Nov 11) */}")
    if n: log.add(p, "Phone: updated the avatar comment (no hair)")
    old = ("          <path d={`M ${-w * 0.22} ${-h * 0.12} Q ${-w * 0.26} ${-h * 0.33} 0 ${-h * 0.33} Q ${w * 0.26} ${-h * 0.33} ${w * 0.22} ${-h * 0.12} L ${w * 0.15} ${-h * 0.12} Q ${w * 0.14} ${-h * 0.24} ${w * 0.04} ${-h * 0.26} Q ${-w * 0.1} ${-h * 0.22} ${-w * 0.15} ${-h * 0.12} Z`} fill=\"#5A3226\" />\n")
    t, n = replace_exact(t, old, "")
    if n: log.add(p, "Phone: deleted the caller avatar's hair bob")
    if t != orig:
        write_verified(p, t)
    return log


def fix_root(log):
    """Foundation fix 5b: Root.tsx — drop the CastHair composition registration
    (its only component, CastHairSheet, existed to force hair on)."""
    p = STUDIO / "src/Root.tsx"
    t = read(p)
    orig = t
    t, n = replace_exact(t, "import { CastSheet, CastHairSheet } from './CastSheet';",
                         "import { CastSheet } from './CastSheet';")
    if n: log.add(p, "Root: dropped CastHairSheet from the CastSheet import")
    t, n = replace_exact(t, '      <Composition id="CastHair" component={CastHairSheet} durationInFrames={1} {...common} />\n', "")
    if n: log.add(p, "Root: removed the CastHair composition registration")
    if t != orig:
        write_verified(p, t)
    return log


def fix_castsheet(log):
    """Foundation fix 5: CastSheet.tsx — drop the hair flag and the hair-only sheet."""
    p = STUDIO / "src/CastSheet.tsx"
    t = read(p)
    orig = t
    t, n = replace_exact(t, "import { AbsoluteFill, getInputProps } from 'remotion';",
                         "import { AbsoluteFill } from 'remotion';")
    if n: log.add(p, "CastSheet: dropped the getInputProps import (only used for hair)")
    old = ("export const CastSheet: React.FC<{ hair?: boolean }> = ({ hair: hairProp }) => {\n"
           "  // HAIR_SAMPLE flag (Nov 8, Javion: hair + human clothes on every character). Render the\n"
           "  // sample with --props='{\"hair\":true}'; default (no props) is the approved plain look,\n"
           "  // byte-identical to the in-flight video #2 render.\n"
           "  // NOTE (Nov 9): getInputProps() does NOT reliably return a composition's defaultProps\n"
           "  // through the Cloud renderStill path (the first CastHair run rendered with NO hair),\n"
           "  // so CastHairSheet below forces hair on via a prop instead of relying on defaultProps.\n"
           "  const { hair: hairInput } = getInputProps() as { hair?: boolean };\n"
           "  const hairOn = hairProp ?? !!hairInput;\n")
    new = ("export const CastSheet: React.FC = () => {\n"
           "  // Nov 11 (Javion: no hair, ever): the old hair flag is gone. Every head is a\n"
           "  // plain smooth round black silhouette; costume details tell characters apart.\n")
    t, n = replace_exact(t, old, new)
    if n: log.add(p, "CastSheet: removed the hair prop + flag (signature, comment, getInputProps)")
    t, n = sub_count(t, r' hairOn=\{hairOn\}', "")
    if n: log.add(p, f"CastSheet: removed {n}x hairOn= from Hero usages")
    old_tail = ("\n/** Hair-sample entry point (Nov 9): forces hair on via a prop, bypassing the\n"
                "    unreliable getInputProps/defaultProps path in the Cloud renderStill flow. */\n"
                "export const CastHairSheet: React.FC = () => <CastSheet hair={true} />;\n")
    t, n = replace_exact(t, old_tail, "\n")
    if n: log.add(p, "CastSheet: deleted CastHairSheet (it existed only to force hair on)")
    if t != orig:
        write_verified(p, t)
    return log


def fix_hair_motion_sample(log):
    """Foundation fix 6: HairMotionSample.tsx — moonlight rim, no hairOn; it is now
    a sleeves/hem/watch motion proof (the composition name stays, so the entry
    point registration does not break)."""
    p = STUDIO / "src/HairMotionSample.tsx"
    t = read(p)
    orig = t
    t, n = replace_exact(t, '<Hero look={LOOKS.jake} pose={pose} shadow={0.6} rimId="rimInkl" hairOn />',
                         '<Hero look={LOOKS.jake} pose={pose} shadow={0.6} rimId="rimBlue" />')
    if n: log.add(p, "HairMotionSample: rimInkl -> rimBlue, removed hairOn")
    t, n = replace_exact(t, "HAIR + CLOTHES SAMPLE — SLEEVES, HEM AND WATCH MOVE WITH THE POSE",
                         "CLOTHES SAMPLE — SLEEVES, HEM AND WATCH MOVE WITH THE POSE")
    if n: log.add(p, "HairMotionSample: updated the on-screen label (no hair)")
    t, n = replace_exact(t, "// HAIR_SAMPLE motion proof (Nov 8, Javion: clothes must MOVE, not sit stiff). One still\n// can't prove motion, so this composition renders Jake in three poses — standing with\n// arms down, arms raised cheering, mid-walk — with the hair/clothes flag ON. Across the\n// three frames the sleeves point in different directions, the hem rides up and skews,\n// and the watch travels with the wrist. Render each variant:",
                         "// Clothes-motion proof (Nov 8, Javion: clothes must MOVE, not sit stiff). One still\n// can't prove motion, so this composition renders Jake in three poses — standing with\n// arms down, arms raised cheering, mid-walk. Across the three frames the sleeves point\n// in different directions, the hem rides up and skews, and the watch travels with the\n// wrist. (Nov 11: the hair part of this sample is gone — no hair, ever.) Render each variant:")
    if n: log.add(p, "HairMotionSample: updated the header comment (no hair)")
    if t != orig:
        write_verified(p, t)
    return log


def cmd_fix(args):
    log = ChangeLog()
    fix_rig(log)
    fix_clothes_fit(log)
    fix_ped_hair(log)
    fix_kit(log)
    fix_shots(args.episode, log)
    flagged = fix_displacement(args.episode, log)
    # The other episode's shots file gets the same rim/pose treatment when it is
    # the target; the shared files are fixed once either way.
    fix_party(log)
    fix_props(log)
    fix_castsheet(log)
    fix_root(log)
    fix_hair_motion_sample(log)
    print("=== fix_board_defects.py: fix ===")
    total = log.print()
    print(f"\nTotal changes: {total} (a second run should report 0 — idempotent).")
    if log.notes:
        print("\nNoted, NOT changed (needs a human call — not counted above):")
        log.print_notes()
    if flagged:
        print("\nFlagged, NOT moved (correct place ambiguous — needs a human call):")
        for (shot, item, where, should) in flagged:
            print(f"  - {shot}: {item} — {where}; suggested: {should}")
    print("Next: run `npx tsc --noEmit` in the studio, then re-render the affected")
    print("board shots and LOOK at each one before anything reaches Javion.")
    return 0


# ---------------------------------------------------------------- render

RENDER_HELPER = r"""
// Render helper written by fix_board_defects.py (render mode). Bundles ONCE and
// renders the requested board stills to a FRESH directory — it never overwrites
// the board in place. Aborts on the first render error (disk fault) instead of
// burning frames. Usage: node <this file> <entry> <composition> <outdir> <shot:frame,...>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('package.json'));
const { bundle } = require('@remotion/bundler');
const { renderStill, selectComposition } = require('@remotion/renderer');
const [entry, compId, outdir, jobsArg] = process.argv.slice(2);
const jobs = jobsArg.split(',').map((j) => {
  const [shot, frame] = j.split(':');
  return { shot, frame: Number(frame), target: path.join(outdir, `board_${shot}_fixed_v1.jpg`) };
});
fs.mkdirSync(outdir, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve(entry),
  publicDir: '/dev/shm/min-public',
  enableCaching: false,
});
const composition = await selectComposition({ serveUrl, id: compId });
console.log(`composition ${compId}: ${composition.width}x${composition.height} @${composition.fps}fps`);
for (const j of jobs) {
  try {
    await renderStill({ serveUrl, composition, frame: j.frame, output: j.target, overwrite: true, scale: 1 });
    console.log(`rendered ${j.shot} frame ${j.frame} -> ${j.target}`);
  } catch (e) {
    console.error(`ABORT at ${j.shot} frame ${j.frame}: ${e.message}`);
    process.exit(1);
  }
}
console.log(`done: ${jobs.length} still(s)`);
"""


def cmd_render(args):
    cfg = EPISODES[args.episode]
    shots = [s.strip() for s in args.shots.split(",") if s.strip()]
    if args.frames:
        frames = [int(f) for f in args.frames.split(",")]
        if len(frames) != len(shots):
            print("render: --frames must have exactly one frame per --shots entry")
            return 2
        job_map = dict(zip(shots, frames))
    else:
        missing = [s for s in shots if s not in cfg["frames"]]
        if missing:
            print(f"render: no board frame map for {missing} in {args.episode} — pass --frames")
            return 2
        job_map = {s: cfg["frames"][s] for s in shots}
    outdir = Path(args.out_dir)
    outdir.mkdir(parents=True, exist_ok=True)
    helper = Path("/tmp/fix_board_render_helper.mjs")
    helper.write_text(RENDER_HELPER, encoding="utf-8")
    jobs_arg = ",".join(f"{s}:{f}" for s, f in job_map.items())
    env = dict(os.environ)
    env["TMPDIR"] = str(STUDIO / ".tmp")
    print(f"render: {args.episode} {len(shots)} shot(s) -> {outdir}")
    r = subprocess.run(
        ["node", str(helper), cfg["entry"], cfg["composition"], str(outdir), jobs_arg],
        cwd=str(STUDIO), env=env, text=True)
    if r.returncode != 0:
        print("render: FAILED (see above) — nothing was claimed as fixed")
        return r.returncode
    # Verify every output exists and is non-trivial.
    ok = True
    for s in shots:
        f = outdir / f"board_{s}_fixed_v1.jpg"
        if not f.exists() or f.stat().st_size < 10000:
            print(f"render: MISSING/SMALL output for {s}: {f}")
            ok = False
    if not ok:
        return 1
    print(f"render: verified {len(shots)} still(s) in {outdir} (fresh filenames, board untouched)")
    return 0


# ---------------------------------------------------------------- review

def cmd_review(args):
    """Write the storyboard-review gate checklist: one section per shot."""
    cfg = EPISODES[args.episode]
    shots = sorted(cfg["frames"], key=lambda s: int(s[1:])) if args.episode == "zenn-002" else []
    if args.shots:
        shots = [s.strip() for s in args.shots.split(",") if s.strip()]
    board = Path(args.board_dir)
    lines = []
    lines.append(f"# Storyboard review gate — {args.episode}")
    lines.append("")
    lines.append("Rule (Javion, Nov 9 — standing): render EVERY shot as an image, look at each")
    lines.append("one like a viewer would, LIST what looks wrong per shot, and fix it BEFORE")
    lines.append("anything animates. No shot moves to animation with a known defect still in it.")
    lines.append("Defect list is written out PER SHOT below, not summarized.")
    lines.append("")
    lines.append("Gate steps per shot: render still -> visual review -> defect list -> fix ->")
    lines.append("re-render -> re-check. A fix is done only when the NEW render was looked at")
    lines.append("and is clean. Same shot, same frame, before and after.")
    lines.append("")
    for s in shots:
        frame = cfg["frames"].get(s, "?")
        img = board / f"board_{s}_fixed_v1.jpg"
        lines.append(f"## {s} (frame {frame})")
        lines.append(f"- Still: `{img}`")
        lines.append("- [ ] Looked at the still like a viewer (whole frame, every character, prop, set piece; zoomed crops for faces/hats/hands/small props)")
        lines.append("- [ ] Orientation: nobody upside down, sideways, floating, or detached from the floor")
        lines.append("- [ ] Heads: plain smooth round silhouettes, NO hair, NO hat-like hair; Detective reads as the Detective (deerstalker + slate jacket + white shirt + dark tie)")
        lines.append("- [ ] Crowd reads as a crowd: dense, visible, upright, spread (empty middle is a defect)")
        lines.append("- [ ] Arms/gestures purposeful, no defaults, no copying; legs straight/vertical when standing; sleeves connected to the shirt")
        lines.append("- [ ] LEGS (Nov 12): no dancing legs — never both knees deeply bent (|b|>25) in one key; standing legs straight {a:0,b:0}; walks alternate (one leg planted, one swinging)")
        lines.append("- [ ] DUPLICATES (Nov 12): no two identical characters in one shot — hair, clothes and pose vary per person")
        lines.append("- [ ] CLOTHES (Nov 12): garments fit — shoulders/waist/hem shaped, sleeves cover the upper arm, jacket reads as one garment, hood reads as a hood behind the neck, no clipping or floating fabric")
        lines.append("- [ ] ARMS (Nov 12): hang straight by default, gestures purposeful and matching the beat, no hyper-bent elbows (b>=90), no back-swing {a:-60,b:30}, no copying in groups")
        lines.append("- [ ] Sets read correctly: doors are doors, nobody stands inside a doorway opening, nothing floats/clips; props on the surfaces they belong on")
        lines.append("- [ ] DISPLACEMENT: every door is on a wall edge with its bottom on the floor, every window is on a wall, furniture sits on the floor in a sensible spot, nothing blocks a doorway, nothing sits outside the set bounds (a wall item covering another wall item is displaced)")
        lines.append("- [ ] No duplicates: no item, person, or prop appears twice without a reason")
        lines.append("- [ ] Popup words (if any) are moonlight blue; rim/glow is moonlight blue")
        lines.append("- Defects found in this shot:")
        lines.append("  - (none — or list each one here, then fix and re-render before animation)")
        lines.append("- [ ] Re-rendered after fixes and re-checked clean (new render looked at)")
        lines.append("")
    out = Path(args.out)
    write_verified(out, "\n".join(lines))
    print(f"review: wrote {out} ({len(shots)} shot sections)")
    return 0


# ---------------------------------------------------------------- cli

def main():
    ap = argparse.ArgumentParser(description="Bug/glitch fixing script (fix-only, foundation) for the INKL Remotion studio.")
    sub = ap.add_subparsers(dest="mode", required=True)
    a = sub.add_parser("audit", help="Scan an episode + shared files; write a per-shot defect report.")
    a.add_argument("--episode", default="zenn-002", choices=list(EPISODES))
    a.add_argument("--shots", default=None, help="Path to a shots.tsx (overrides --episode).")
    a.add_argument("--report", default=None, help="Write the report here (else stdout).")
    a.set_defaults(fn=cmd_audit)
    f = sub.add_parser("fix", help="Apply the global code fixes (idempotent).")
    f.add_argument("--episode", default="zenn-002", choices=list(EPISODES))
    f.add_argument("--dry-run", action="store_true", help="Reserved: reports what would change (currently still applies; use git diff to review).")
    f.set_defaults(fn=cmd_fix)
    r = sub.add_parser("render", help="Re-render board stills to a fresh directory.")
    r.add_argument("--episode", default="zenn-002", choices=list(EPISODES))
    r.add_argument("--shots", required=True, help="Comma list, e.g. S4,S5,S6.")
    r.add_argument("--frames", default=None, help="Comma list of frame numbers, same order as --shots (defaults to the episode frame map).")
    r.add_argument("--out-dir", required=True, help="Fresh output directory (never the board itself).")
    r.set_defaults(fn=cmd_render)
    v = sub.add_parser("review", help="Write the per-shot storyboard-review gate checklist.")
    v.add_argument("--episode", default="zenn-002", choices=list(EPISODES))
    v.add_argument("--shots", default=None, help="Comma list of shots (defaults to the episode frame map).")
    v.add_argument("--board-dir", required=True, help="Directory holding the rendered stills.")
    v.add_argument("--out", required=True, help="Write the checklist markdown here.")
    v.set_defaults(fn=cmd_review)
    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
