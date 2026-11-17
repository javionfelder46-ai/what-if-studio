#!/usr/bin/env python3
"""Phase 1 step 1 for zenn-002: build words.json from the ElevenLabs alignment,
copy the voiceover to public/zenn-002/voice.wav (via ffmpeg, run separately),
and write src/episodes/zenn-002/episode.json (script, science, shots, edit, fx).

Sources (read-only): zenn/alignment/zenn_002_align.json, zenn/scenes/zenn_002_scenes.json,
zenn/scripts/zenn_002_full.txt, zenn/chapters/zenn_002.txt, zenn/scripts/zenn_002_notes.txt.

Run from the studio folder:  python3 src/episodes/zenn-002/build_episode.py
Then:  ffmpeg -y -i <zenn>/audio/zenn_002_vo.mp3 -ac 1 -ar 44100 -sample_fmt s16 public/zenn-002/voice.wav
       python <skill>/scripts/plan.py zenn-002
"""
import json, re
from pathlib import Path

ZENN = Path('/home/hatch/workspace/youtube-shorts/zenn')
STUDIO = Path('/home/hatch/workspace/what-if-studio')
EP = STUDIO / 'src/episodes/zenn-002'
FPS = 30
LEAD = 2

# ------------------------------------------------------------------ words.json
align = json.loads((ZENN / 'alignment/zenn_002_align.json').read_text())
chars = align['characters']
starts = align['character_start_times_seconds']
ends = align['character_end_times_seconds']
assert len(chars) == len(starts) == len(ends), (len(chars), len(starts), len(ends))

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
script = (ZENN / 'scripts/zenn_002_full.txt').read_text()
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
scenes = json.loads((ZENN / 'scenes/zenn_002_scenes.json').read_text())
assert len(scenes) == 181

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
# Chapter boundaries from chapters/zenn_002.txt (seconds).
bounds = [0, 52, 131, 206, 261, 328, 392, 467, 512, 614.77]
chapter_names = [
    'The Lobster Shirt',
    'The Experiment That Measured Embarrassment',
    'The Plus and the Minus of Being Seen',
    'Rule One: Your Brain Starts With You',
    'Rule Two: Everyone Is Staring At Themselves',
    'The Twist Nobody Mentions',
    'Rule Three: The Spotlight Dims',
    'How To Beat It',
    'The Inversion That Sets You Free',
]
script_entries = []
for i in range(9):
    lo, hi = bounds[i], bounds[i + 1]
    text = ' '.join(re.sub(r'\s+', ' ', sc['text']).strip()
                    for sc in scenes if lo <= sc['start'] < hi)
    script_entries.append({'beat': f'{i + 1} {chapter_names[i]}', 'text': text})
print('chapter word counts:', [len(e['text'].split()) for e in script_entries],
      'total', sum(len(e['text'].split()) for e in script_entries))
# sanity: the 9 beats joined must reproduce the full script (modulo whitespace)
beats_joined = ' '.join(e['text'] for e in script_entries)
print('beats-vs-script match:', norm_ws(beats_joined) == norm_ws(script))
if norm_ws(beats_joined) != norm_ws(script):
    a, b = norm_ws(beats_joined), norm_ws(script)
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            print('first diff at char', i, repr(a[max(0,i-60):i+60]), 'VS', repr(b[max(0,i-60):i+60]))
            break
    print('len beats', len(a), 'len script', len(b))

science = [
    {'claim': 'Gilovich, Medvec & Savitsky (2000): students wearing an embarrassing Barry Manilow T-shirt estimated ~46% of observers could identify the face; the actual number was ~23% — a factor of two. Proud shirts (Bob Marley / MLK Jr.) were estimated ~48%, actual ~8% — sixfold. Acclimation: immediate entry guessed 51%, after sitting 15 minutes in the shirt 37%.',
     'working': 'Study 1: 109 Cornell undergrads (15 wearers, 64 observers, 30 controls); 5 studies in the paper. Wearers estimated ~46% could name the face, actual ~23%. Proud-face shirts: estimated ~48%, actual ~8%. Acclimation: immediate entry 51% vs 37% after 15 minutes in the shirt. Group discussions: people overestimated how much others noticed their comments, good and bad.',
     'source': 'Gilovich, T., Medvec, V. H., & Savitsky, K. (2000). The spotlight effect in social judgment. Journal of Personality and Social Psychology, 78(2), 211-222. DOI 10.1037/0022-3514.78.2.211'},
    {'claim': 'Savitsky, Epley & Gilovich (2001): people anticipated harsher judgment for social blunders than observers actually gave.',
     'working': 'Four studies: actors imagining social blunders, public intellectual failure, embarrassing descriptions — anticipated judgment was consistently harsher than the judgment observers actually gave.',
     'source': 'Savitsky, K., Epley, N., & Gilovich, T. (2001). Do others judge us as harshly as we think? Journal of Personality and Social Psychology, 81(1), 44-56. DOI 10.1037/0022-3514.81.1.44'},
    {'claim': 'The honest nuance: small 2000-era US student samples (15 wearers at a time), lab rooms — the effect is a reduction, not an erasure (23% DID notice). Some rooms really are watching; the effect shrinks the audience, it does not erase it.',
     'working': 'Stated in the script itself: 23% did notice the shirt, almost one in four. Studies were small, American college students, year 2000, lab rooms. Real life is messier than a lab — a job interview, a first date, a stage really are watching. Knowing the real size is the whole point.',
     'source': 'Gilovich, T., Medvec, V. H., & Savitsky, K. (2000). The spotlight effect in social judgment. Journal of Personality and Social Psychology, 78(2), 211-222. DOI 10.1037/0022-3514.78.2.211'},
    {'claim': 'Jake and the lobster T-shirt party story is an ORIGINAL fictional illustration, not a real person or event — the experiment numbers around it are the real research.',
     'working': 'Jake is a named fictional hero invented for this video to carry the story frame. No real person, party, or lobster shirt is depicted. The Gilovich et al. (2000) and Savitsky et al. (2001) findings around the story are real, sourced research.',
     'source': 'Original fictional illustration (no source — not a real event)'},
]

# ------------------------------------------------------------------ shots
# Sets that exist in src/engine/sets/: antarctic, bedroom, cave, cell, classroom,
# exterior, kitchen, lab, rooftop, schematic, stairwell, study. There is NO stage
# set, so the title card and the close use the Study (Detective's study).
# The party scenes need a NEW set ('party') — the storyboard phase builds it
# with the room kit.
PARTY = {2, 3, 4, 5, 6, 7, 8, 71, 72, 73, 74, 75, 76, 156, 165, 166, 167, 168, 169, 170}
CLASSROOM = set(range(16, 31)) | set(range(78, 92)) | set(range(118, 131))
SCHEMATIC = {25, 26, 27, 28, 29, 35, 36, 83, 84, 85, 86, 122, 125, 126, 171, 172, 173}
STAIRWELL = {51}
BEDROOM = {52, 105, 106}
KITCHEN = {157}
EXTERIOR = {137}

def set_for(n):
    if n in PARTY:
        return 'party'
    if n in SCHEMATIC:
        return 'schematic'
    if n in CLASSROOM:
        return 'classroom'
    if n in STAIRWELL:
        return 'stairwell'
    if n in BEDROOM:
        return 'bedroom'
    if n in KITCHEN:
        return 'kitchen'
    if n in EXTERIOR:
        return 'exterior'
    return 'study'

def chapter_of(n):
    start = scenes[n - 1]['start']
    for i in range(9):
        if bounds[i] <= start < bounds[i + 1]:
            return i + 1
    return 9

def who_for(n, set_name, text):
    low = text.lower()
    if set_name == 'party':
        return 'Jake + crowd guests'
    if set_name == 'classroom':
        return 'student wearer + observers (crowd guests)'
    if set_name == 'schematic':
        return 'Detective + numbers'
    if n == 1:
        return 'Detective (cold open, title question)'
    if 'jake' in low:
        return 'Jake'
    if 'lobster' in low:
        return 'Jake (lobster shirt)'
    return 'Detective'

# size cycle: neighbours must differ in size and angle
SIZE_CYCLE = ['wide', 'medium', 'close-up', 'medium', 'wide', 'two-shot',
              'medium', 'macro insert', 'high angle', 'medium', 'close-up',
              'low angle', 'medium', 'wide', 'over-the-shoulder', 'medium']
CROWD = PARTY | CLASSROOM  # multi-character scenes: no solo close-up / macro insert
shots = []
prev_size = None
for n, sc in enumerate(scenes, start=1):
    set_name = set_for(n)
    size = SIZE_CYCLE[(n - 1) % len(SIZE_CYCLE)]
    if n in CROWD and size in ('close-up', 'macro insert'):
        size = 'two-shot'
    if size == prev_size:
        size = 'medium' if prev_size != 'medium' else 'wide'
    # the number landings get a macro insert on the CountUp — applied AFTER
    # the crowd rule (a numbers insert is fine in a crowd scene) and after
    # the neighbour check; neighbours are two-shot / wide, so no clash
    if n in (28, 84):
        size = 'macro insert'
    prev_size = size
    ch = chapter_of(n)
    text_snip = re.sub(r'\s+', ' ', sc['text']).strip()
    note = f"Ch{ch} {chapter_names[ch - 1]} — {who_for(n, set_name, text_snip)}: {text_snip[:120]}"
    if n == 4:
        note += (" | DEFECT SCENE — the shades go on JAKE's face via the rig, NEVER on the "
                 "giant sign lobster (the small shirt-emblem lobster wears shades by design; "
                 "the giant sign lobster stays plain).")
    dur_f = round((sc['end'] - sc['start']) * FPS)
    shots.append({
        'id': f'S{n}',
        'size': size,
        'set': set_name,
        'key': max(0, dur_f // 2),
        'note': note,
    })

# ------------------------------------------------------------------ edit cues (word cues, computed #n)
# NOTE: wi_prev must mirror plan.py exactly: plan.py only advances its word
# pointer on word cues, NOT on s:/f:/+ cues. So a hyphenated first word that
# forces an s: fallback leaves wi_prev stale, and the NEXT scene's word cue
# must count occurrences from that stale pointer (e.g. S64 'your' is #2 after
# S63's s: fallback, because 'your' already occurred in S62's tail).
edit = []
wi_prev = 0  # word index after the previous WORD cue (mirrors plan.py)
for n, sc in enumerate(scenes):
    j = scene_first_idx[n]
    if j is None:
        # fall back to an absolute-seconds cue 2 frames before the scene start
        edit.append({'shot': f'S{n + 1}', 'at': f"s:{max(0.0, sc['start'] - LEAD / FPS):.3f}"})
        continue
    target = out_words[j]['w']
    if '-' in target or '+' in target:
        edit.append({'shot': f'S{n + 1}', 'at': f"s:{max(0.0, sc['start'] - LEAD / FPS):.3f}"})
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
reveal_s = find_scene('twenty-three percent')   # the 46%-vs-23% number landing
proud_s = find_scene('real number was about eight')  # the 48%-vs-8% number landing
twist_s = find_scene('here is the inversion')    # inversion twist, last minute
print('fx scenes: 23%% reveal S%s, 8%% reveal S%s, inversion S%s' % (reveal_s, proud_s, twist_s))
fx = []
if reveal_s:
    fx.append({'at': f'S{reveal_s}+2', 'kind': 'flash', 'color': '#C0392B', 'o': 0.5})
if proud_s:
    fx.append({'at': f'S{proud_s}+2', 'kind': 'flash', 'color': '#C0392B', 'o': 0.5})
if twist_s:
    fx.append({'at': f'S{twist_s}+2', 'kind': 'flash', 'color': '#FFD9A0', 'o': 0.5})

ep = {
    'id': 'Zenn002',
    'slug': 'zenn-002',
    'topic': 'The Spotlight Effect: why your brain thinks everyone is watching you',
    'title': ['WHY DOES IT FEEL LIKE', 'EVERYONE IS WATCHING YOU?'],
    'accent': 'SPOTLIGHT',
    'accentColor': '#C0392B',
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
party_shots = [s['id'] for s in shots if s['set'] == 'party']
print('party shots:', ', '.join(party_shots))
print('set counts:', {s: sum(1 for x in shots if x['set'] == s) for s in sorted(set(x['set'] for x in shots))})
