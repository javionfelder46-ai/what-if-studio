"""Contact sheets for the board sweep: tiles every board still small (320x180) so the
whole 158-shot board can be scanned for layout defects at a glance. Suspects get a
full-size read afterwards. Usage: python3 sweep_sheets.py [outdir]"""
import json, pathlib, sys
from PIL import Image

STUDIO = pathlib.Path('/home/hatch/workspace/what-if-studio')
BOARD = STUDIO / 'out' / 'zenn-003' / 'board'
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path('/tmp/v6_sheets')
OUT.mkdir(parents=True, exist_ok=True)

tl = json.loads((STUDIO / 'src/episodes/zenn-003/timeline.json').read_text())
ids = [s['id'] for s in tl['shots']]
TW, TH = 320, 180
COLS = 4
ROWS = 8
for sheet_i in range(0, len(ids), COLS * ROWS):
    chunk = ids[sheet_i:sheet_i + COLS * ROWS]
    sheet = Image.new('RGB', (COLS * TW, ROWS * TH), (20, 17, 26))
    for j, sid in enumerate(chunk):
        p = BOARD / f'{sid}.png'
        if not p.exists():
            print(f'MISSING {sid}')
            continue
        im = Image.open(p).resize((TW, TH))
        sheet.paste(im, ((j % COLS) * TW, (j // COLS) * TH))
    out = OUT / f'sheet_{sheet_i // (COLS * ROWS) + 1:02d}.png'
    sheet.save(out)
    print(f'{out}  shots {chunk[0]}..{chunk[-1]}')
print(f'{len(ids)} shots, {OUT}')
