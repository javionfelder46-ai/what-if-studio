// Render a frame range as PNG stills (the FAST renderStill path) with RESUME:
// frames whose PNG already exists are skipped, so a VM reboot / Chrome crash
// only loses the in-flight frame. After the range is complete, encode to mp4.
// Usage (from the studio folder):
//   node scripts/render_frames_png.mjs zenn-002 0 4647 out/zenn-002/chunk1.mp4
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(path.resolve('package.json'));
const { bundle } = require('@remotion/bundler');
const { renderStill, selectComposition } = require('@remotion/renderer');

const [slug, startS, endS, outMp4] = process.argv.slice(2);
const start = Number(startS);
const end = Number(endS);
const ep = JSON.parse(fs.readFileSync(path.resolve('src/episodes', slug, 'episode.json'), 'utf8'));
const framesDir = path.resolve('out', slug, `frames_${start}_${end}`);
fs.mkdirSync(framesDir, { recursive: true });

// Per-episode entry: each episode has its own minimal entry
// (src/index-<slug-no-hyphens>.tsx, e.g. index-zenn006.tsx) so its S1-S43
// scene ids don't collide with another episode's in the shared Root
// (sceneBuilder throws on duplicate ids). Use it when present, else the
// shared src/index.ts.
const perEpEntry = path.resolve(`src/index-${slug.replace(/-/g, '')}.tsx`);
const entryPoint = fs.existsSync(perEpEntry) ? perEpEntry : path.resolve('src/index.ts');
const serveUrl = await bundle({ entryPoint, publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: ep.id });
console.log(`composition ${ep.id}: ${composition.width}x${composition.height} @${composition.fps}fps, frames ${start}-${end} (${end - start + 1} frames) -> ${framesDir}`);

const t0 = Date.now();
let n = 0, skipped = 0;
for (let fr = start; fr <= end; fr++) {
  const out = path.join(framesDir, `f${String(fr).padStart(5, '0')}.png`);
  if (fs.existsSync(out) && fs.statSync(out).size > 10000) { skipped++; continue; }
  await renderStill({ serveUrl, composition, frame: fr, output: out, overwrite: true, scale: 1 });
  n++;
  if (n % 100 === 0) {
    const el = (Date.now() - t0) / 1000;
    console.log(`frame ${fr} (rendered ${n}, skipped ${skipped}) ${el.toFixed(0)}s elapsed, ${(n / el).toFixed(2)} fps`);
  }
}
console.log(`RENDER DONE: ${n} rendered, ${skipped} skipped in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

// Encode the PNG sequence to mp4.
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-framerate', '30', '-start_number', String(start), '-i', path.join(framesDir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-video_track_timescale', '90000', '-crf', '18', '-movflags', '+faststart', outMp4], { stdio: ['ignore', 'inherit', 'inherit'] });
await new Promise((resolve, reject) => { ff.on('close', (c) => (c === 0 ? resolve() : reject(new Error('ffmpeg exit ' + c)))); ff.on('error', reject); });
console.log(`ENCODE DONE ${outMp4}`);
// Free the disk: PNGs are no longer needed once the mp4 exists.
fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`CLEANED ${framesDir}`);
