#!/usr/bin/env python3
"""Phase 1 step 1 for zenn-003: build words.json from the ElevenLabs alignment,
copy the voiceover to public/zenn-003/voice.wav (via ffmpeg, run separately),
and write src/episodes/zenn-003/episode.json (script, science, shots, edit, fx).

Sources (read-only): zenn/alignment/zenn_003_align.json, zenn/scenes/zenn_003_scenes.json,
zenn/scenes/zenn_003_v2_specs.json, zenn/scripts/zenn_003_full.txt, zenn/chapters/zenn_003.txt.

Run from the studio folder:  python3 src/episodes/zenn-003/build_episode.py
Then:  ffmpeg -y -i <zenn>/audio/zenn_003_vo.mp3 -ac 1 -ar 44100 -sample_fmt s16 public/zenn-003/voice.wav
       python <skill>/scripts/plan.py zenn-003
"""
import json, re, sys
from pathlib import Path

ZENN = Path('/home/hatch/workspace/youtube-shorts/zenn')
STUDIO = Path('/home/hatch/workspace/what-if-studio')
EP = STUDIO / 'src/episodes/zenn-003'
FPS = 30
LEAD = 2

# ------------------------------------------------------------------ words.json
align = json.loads((ZENN / 'alignment/zenn_003_align.json').read_text())
chars = align['characters']
starts = align['character_start_times_seconds']
ends = align['character_end_times_seconds']
assert len(chars) == len(starts) == len(ends) == 7990, len(chars)

PUNCT = set('.,;:!?…')
words = []
cur = []  # (char, s, e)
for ch, s, e in zip(chars, starts, ends):
    if ch.isspace():  # spaces AND the '\n\n' paragraph breaks in the take
        if cur:
            words.append(cur); cur = []
    else:
        cur.append((ch, s, e))
if cur:
    words.append(cur)

out_words = []
for wchars in words:
    text = ''.join(c for c, _, _ in wchars)
    p = ''
    while text and text[-1] in PUNCT:
        p = text[-1] + p
        text = text[:-1]
    out_words.append({'w': text, 's': wchars[0][1], 'e': wchars[-1][2], 'p': p})
print(f'words: {len(out_words)}, first={out_words[0]}, last={out_words[-1]}')

# sanity: joined words must reproduce the script text (modulo whitespace)
script = (ZENN / 'scripts/zenn_003_full.txt').read_text()
joined = ' '.join(w['w'] + w['p'] for w in out_words)
def norm_ws(t):
    return re.sub(r'\s+', ' ', t).strip()
print('words-vs-script match:', norm_ws(joined) == norm_ws(script))
if norm_ws(joined) != norm_ws(script):
    a, b = norm_ws(joined), norm_ws(script)
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            print('first diff at char', i, repr(a[max(0,i-60):i+60]), 'VS', repr(b[max(0,i-60):i+60]))
            break
    print('len joined', len(a), 'len script', len(b))

EP.mkdir(parents=True, exist_ok=True)
(EP / 'words.json').write_text(json.dumps(out_words, indent=1, ensure_ascii=False) + '\n')
print('wrote', EP / 'words.json')

# ------------------------------------------------------------------ scene/word alignment
scenes = json.loads((ZENN / 'scenes/zenn_003_scenes.json').read_text())
specs = json.loads((ZENN / 'scenes/zenn_003_v2_specs.json').read_text())
assert len(scenes) == len(specs) == 158

def norm(w):
    return re.sub(r"[^\w']", '', w.lower().replace('’', "'"))

w_norm = [norm(w['w']) for w in out_words]
# walk words.json sequentially, matching each scene's words in order
wi = 0
scene_first_idx = []  # word index of each scene's first word
problems = []
for n, sc in enumerate(scenes):
    toks = [t for t in re.split(r'\s+', sc['text'].strip()) if t]
    toks_n = [norm(t) for t in toks]
    if not toks_n:
        problems.append((n, 'empty text')); scene_first_idx.append(None); continue
    # find toks_n[0] at or after wi
    j = wi
    while j < len(w_norm) and w_norm[j] != toks_n[0]:
        j += 1
    if j >= len(w_norm):
        problems.append((n, f"first word {toks[0]!r} not found after word {wi}"))
        scene_first_idx.append(None); continue
    # verify the whole scene matches forward (allow a few trailing mismatches)
    k, ok = j, True
    for tn in toks_n:
        if k >= len(w_norm) or w_norm[k] != tn:
            ok = False; break
        k += 1
    if not ok:
        problems.append((n, f"mismatch after {toks[0]!r} at word {j}: scene={toks[:6]} words={ [out_words[x]['w'] for x in range(j, min(j+6, len(out_words)))]}"))
        scene_first_idx.append(None); continue
    scene_first_idx.append(j)
    wi = k
print('scene alignment problems:', len(problems))
for p in problems[:20]:
    print('  ', p)

# ------------------------------------------------------------------ episode.json: script (9 chapters, verbatim)
bounds = [0, 783, 1776, 2796, 3963, 4826, 5954, 6629, 7271, len(script)]
chapter_names = [
    'Day One: The Door Locks',
    'Problem One: The Clock Breaks',
    'Problem Two: Sleep Stops Working',
    'Problem Three: The Silence Gets Loud',
    'Problem Four: The Voices Move In',
    'Problem Five: Your Brain Shrinks',
    'The Honest Part',
    'Day Thirty: The Door Opens',
    'What 30 Days Really Does',
]
script_entries = []
for i in range(9):
    text = script[bounds[i]:bounds[i + 1]].strip()
    # collapse internal blank-line paragraph breaks to single spaces (voice.py joins beats with spaces)
    text = re.sub(r'\s+', ' ', text)
    script_entries.append({'beat': f'{i + 1} {chapter_names[i]}', 'text': text})
print('chapter word counts:', [len(e['text'].split()) for e in script_entries],
      'total', sum(len(e['text'].split()) for e in script_entries))

science = [
    {'claim': 'Nine Antarctic researchers spent 14 months cut off, and part of their brains shrank about 7%.',
     'working': 'Stahn et al. scanned 9 expeditioners at Neumayer III before and after 14 months (9 in isolation): the dentate gyrus of the hippocampus shrank ~7% on average (range ~4-10%). BDNF fell within 3 months and had not recovered 1.5 months after return. Greater volume loss tracked worse attention and spatial test performance. Small sample (n=9), preliminary.',
     'source': 'Stahn, A. C., et al. (2019). Brain Changes in Response to Long Antarctic Expeditions. New England Journal of Medicine, 381(23), 2275-2276. DOI 10.1056/NEJMc1904905'},
    {'claim': 'Michel Siffre spent 63 days in a cave with no clock and lost 25 days; his body clock stretched to about 24.5 hours, and counting to 120 took him 5 minutes instead of 2.',
     'working': 'Siffre surfaced Sep 14 believing it was Aug 20 (25 days lost). Free-running sleep-wake cycle ~24.5 h. Counting to 120 at one per second took 5 minutes instead of 2. 30 days x 30 min/day drift = 15 hours.',
     'source': 'Siffre, M. (1962). Scarasson cave self-experiment (documented case study, not a peer-reviewed trial)'},
    {'claim': '17-19 hours awake matches a blood alcohol level of 0.05; 24 hours awake matches 0.10 - legally drunk in every American state.',
     'working': 'Williamson & Feyer tested sleep-deprived people against alcohol: 17-19 h awake = performance equivalent to 0.05% BAC; 24 h = 0.10% BAC, above the US legal driving limit of 0.08%.',
     'source': 'Williamson, A. M., & Feyer, A.-M. (2000). Moderate sleep deprivation produces impairments equivalent to legally prescribed levels of alcohol intoxication. Occupational and Environmental Medicine, 57(10), 649-655. DOI 10.1136/oem.57.10.649'},
    {'claim': 'Randy Gardner stayed awake 264 hours (11 days); by day 11 he slurred, forgot things, got paranoid, mistook a street sign for a person, and could not subtract 7 from 100 past 65. He then slept 14 hours 40 minutes and mostly bounced back.',
     'working': '17-year-old Gardner, 1964, monitored by Stanford sleep researcher William Dement and US Navy medic John J. Ross. 264 hours awake, no stimulants. Slept 14h 40m after, mostly recovered.',
     'source': 'Randy Gardner (1963-64), documented case, monitored by William Dement (Stanford) and John J. Ross (US Navy)'},
    {'claim': 'In 1954, McGill researchers paid 14 students to lie in soundproof cubicles; most quit within 2-3 days, more than half hallucinated, some could not count to 30, one felt like there were two of him in the room.',
     'working': 'Bexton, Heron & Scott: translucent goggles (light, no pattern vision), gloves and cardboard cuffs. More than half hallucinated (dots/lines/geometric patterns, then complex dreamlike scenes); after hours, some could not count to 30.',
     'source': 'Bexton, W. H., Heron, W., & Scott, T. H. (1954). Effects of decreased variation in the sensory environment. Canadian Journal of Psychology, 8(2), 70-76.'},
    {'claim': 'Being ignored registers in the brain where physical pain does: the anterior cingulate cortex.',
     'working': 'Eisenberger et al. (2003): 13 undergrads in a Cyberball ball-tossing game; exclusion activated the dorsal anterior cingulate cortex (dACC), the same region as physical pain distress.',
     'source': 'Eisenberger, N. I., Lieberman, M. D., & Williams, K. D. (2003). Does Rejection Hurt? An fMRI Study of Social Exclusion. Science, 302(5643), 290-292. DOI 10.1126/science.1089134'},
    {'claim': 'In solitary confinement, two out of three prisoners became hypersensitive to sound and smell, about half had perceptual distortions including hallucinations, about half could not concentrate or remember, a third became paranoid, and 3 of 15 hurt themselves.',
     'working': 'Grassian (1983): 15 prisoners in solitary, SHU syndrome. Two-thirds hypersensitive, ~half perceptual disturbances, ~half cognitive difficulties, ~a third thought disturbances. None had these reactions before isolation. Long-term: prisoners shifted from craving contact to fearing it.',
     'source': 'Grassian, S. (1983). Psychopathological effects of solitary confinement. American Journal of Psychiatry, 140(11), 1450-1454. DOI 10.1176/ajp.140.11.1450'},
    {'claim': 'Loneliness raised the chance of dying early 26%, isolation 29%, living alone 32% - about the same size as smoking.',
     'working': 'Holt-Lunstad et al. (2015) meta-analysis: 70 prospective studies, ~3.4 million participants, avg ~7 years follow-up. Loneliness OR 1.26, social isolation OR 1.29, living alone OR 1.32.',
     'source': 'Holt-Lunstad, J., et al. (2015). Loneliness and Social Isolation as Risk Factors for Mortality. Perspectives on Psychological Science, 10(2), 227-237. DOI 10.1177/1745691614568352'},
]

# ------------------------------------------------------------------ shots
SET_MAP = {
    'room_bare': 'cell', 'room_door': 'cell (door)', 'room_bed': 'cell (bed)',
    'room_window': 'cell (window)', 'wall_closeup': 'cell (wall)', 'prison': 'cell (prison)',
    'lab': 'lab', 'antarctic': 'antarctic', 'cave': 'cave', 'classroom': 'classroom',
    'outside': 'outside', 'stage': 'stage',
}
# size cycle: neighbours must differ in size and angle
SIZE_CYCLE = ['wide', 'medium', 'close-up', 'medium', 'wide', 'two-shot',
              'medium', 'macro insert', 'high angle', 'medium', 'close-up',
              'low angle', 'medium', 'wide', 'over-the-shoulder', 'medium']
shots = []
prev_size = None
for n, (sc, sp) in enumerate(zip(scenes, specs)):
    bg = sp['background']
    chars_here = [c['id'] for c in sp.get('characters', [])]
    size = SIZE_CYCLE[n % len(SIZE_CYCLE)]
    if bg == 'wall_closeup' and size not in ('close-up', 'macro insert'):
        size = 'close-up' if n % 2 == 0 else 'macro insert'
    if len(chars_here) >= 2 and size in ('close-up', 'macro insert'):
        size = 'two-shot'
    if size == prev_size:
        size = 'medium' if prev_size != 'medium' else 'wide'
    prev_size = size
    labels = [l['text'] for l in sp.get('labels', [])]
    props = [p['kind'] for p in sp.get('props', [])]
    note_bits = [f"{sp['day']}"]
    if chars_here:
        note_bits.append(' + '.join(chars_here))
    if labels:
        note_bits.append('label: ' + ' / '.join(labels))
    if props:
        note_bits.append('props: ' + ', '.join(props))
    if sp.get('notes'):
        note_bits.append(sp['notes'][:160])
    note = f"{sp['chapter']} - " + '; '.join(note_bits)
    dur_f = round((sc['end'] - sc['start']) * FPS)
    shots.append({
        'id': f'S{n + 1}',
        'size': size,
        'set': SET_MAP[bg],
        'key': max(0, dur_f // 2),
        'note': note,
    })

# ------------------------------------------------------------------ edit cues (word cues, computed #n)
edit = []
wi_prev = 0  # word index after the previous cue
for n, sc in enumerate(scenes):
    j = scene_first_idx[n]
    if j is None:
        # fall back to an absolute-seconds cue 2 frames before the scene start
        edit.append({'shot': f'S{n + 1}', 'at': f"s:{max(0.0, sc['start'] - LEAD / FPS):.3f}"})
        continue
    target = out_words[j]['w']
    if '-' in target or '+' in target:
        edit.append({'shot': f'S{n + 1}', 'at': f"s:{max(0.0, sc['start'] - LEAD / FPS):.3f}"})
        wi_prev = j + 1
        continue
    nth = sum(1 for x in range(wi_prev, j + 1) if w_norm[x] == norm(target))
    at = target if nth == 1 else f'{target}#{nth}'
    edit.append({'shot': f'S{n + 1}', 'at': at})
    wi_prev = j + 1

# ------------------------------------------------------------------ fx (shot-relative cues)
def find_scene(substr):
    for n, sc in enumerate(scenes):
        if substr.lower() in sc['text'].lower():
            return n + 1
    return None
lock_s = find_scene('locked from outside')
twist_s = find_scene("isn't the danger")
click_s = find_scene('lock clicks')
print('fx scenes: lock S%s, twist S%s, door-open S%s' % (lock_s, twist_s, click_s))
fx = []
if lock_s:
    fx.append({'at': f'S{lock_s}+2', 'kind': 'flash', 'color': '#FFD9A0', 'o': 0.5})
if twist_s:
    fx.append({'at': f'S{twist_s}+2', 'kind': 'flash', 'color': '#FF5A7A', 'o': 0.45})
    fx.append({'at': f'S{twist_s}+2', 'kind': 'shake', 'len': 8, 'amp': 6})
if click_s:
    fx.append({'at': f'S{click_s}+2', 'kind': 'flash', 'color': '#FFF3D6', 'o': 0.6})

ep = {
    'id': 'Zenn003',
    'slug': 'zenn-003',
    'topic': "You're trapped in a room for 30 days - what does that do to your brain?",
    'title': ["YOU'RE TRAPPED FOR 30 DAYS", 'WHAT DOES IT DO TO YOUR BRAIN?'],
    'accent': 'BRAIN',
    'script': script_entries,
    'science': science,
    'cast': ['detective', 'jake'],
    'shots': shots,
    'edit': edit,
    'fx': fx,
}
(EP / 'episode.json').write_text(json.dumps(ep, indent=1, ensure_ascii=False) + '\n')
print('wrote', EP / 'episode.json')
print('shots:', len(shots), 'edit:', len(edit), 'fx:', len(fx))
print('size counts:', {s: sum(1 for x in shots if x['size'] == s) for s in sorted(set(x['size'] for x in shots))})
adj_same = sum(1 for a, b in zip(shots, shots[1:]) if a['size'] == b['size'])
print('adjacent same-size pairs:', adj_same)
