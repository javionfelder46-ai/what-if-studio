#!/usr/bin/env python3
"""Regenerate the character-code delivery copies from the studio rig (source of truth).
Run after any rig.tsx change so Javion's copies stay in sync.
  python3 regen_character_copies.py
Outputs (~/workspace/user/files/):
  characters_code.tsx = exact copy of rig.tsx (the full rig)
  jake_code.tsx / jake_code_v3.tsx = rig with LOOKS reduced to Jake only, Hero default LOOKS.jake
  detective_code.tsx = rig with LOOKS reduced to the Detective only, Hero default LOOKS.detective
"""
import re
import shutil
from pathlib import Path

RIG = Path('/home/hatch/workspace/what-if-studio/src/engine/rig.tsx')
OUT = Path('/home/hatch/workspace/user/files')

rig = RIG.read_text()
lines = rig.splitlines(keepends=True)

# Locate the LOOKS block.
start = next(i for i, l in enumerate(lines) if l.startswith('export const LOOKS'))
end = next(i for i in range(start + 1, len(lines)) if lines[i].rstrip() == '};')
header = lines[start]  # 'export const LOOKS: Record<CastName, Look> = {\n'
body = lines[start + 1:end]


def extract_entry(name: str) -> str:
    """Return the target character's comment block + entry line from the LOOKS body."""
    idx = next(i for i, l in enumerate(body) if re.match(rf'^  {name}: \{{', l))
    # Walk up over the consecutive comment lines directly above the entry.
    top = idx
    while top > 0 and body[top - 1].lstrip().startswith('//'):
        top -= 1
    return ''.join(body[top:idx + 1])


def make_single(name: str, default_look: str) -> str:
    entry = extract_entry(name)
    new_body = header + entry + '};\n'
    out_lines = lines[:start] + [new_body] + lines[end + 1:]
    text = ''.join(out_lines)
    # Hero default look -> this character.
    text = text.replace(
        "look = LOOKS.pipHood", f"look = LOOKS.{default_look}")
    return text


# 1. Full rig copy.
shutil.copyfile(RIG, OUT / 'characters_code.tsx')

# 2. Jake (and the fresh v3 delivery, identical).
jake = make_single('jake', 'jake')
(OUT / 'jake_code.tsx').write_text(jake)
(OUT / 'jake_code_v3.tsx').write_text(jake)

# 3. Detective.
det = make_single('detective', 'detective')
(OUT / 'detective_code.tsx').write_text(det)

# Sanity checks.
for name, text in [('jake', jake), ('detective', det)]:
    assert f"LOOKS.{name}" in text, f"Hero default not set for {name}"
    assert 'weather?: Weather' in text and 'season?: Season' in text, "occasion props missing"
    assert 'beanie' in text.lower() and 'Umbrella' in text, "occasion code missing"
    # No Hair component code (comments mentioning hair are fine — the component is gone).
    code_lines = [l for l in text.splitlines() if not l.strip().startswith('//')]
    code = '\n'.join(code_lines)
    assert 'const Hair' not in code and '<Hair' not in code and 'hairStyle' not in code, "hair code leaked into delivery"
    assert 'shirtFace' not in code and 'ShirtFace' not in code, "shirtface code leaked into delivery"
print('regenerated: characters_code.tsx, jake_code.tsx, jake_code_v3.tsx, detective_code.tsx')
