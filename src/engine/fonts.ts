import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { STUDIO } from '../studio.config';

// Three faces: a heavy display face for the title card, a mono for on-screen readouts (timers, labels, chips),
// and a handwriting face for chalk and notes. The Google faces load at render time and FAIL on this machine
// (the egress proxy breaks TLS to fonts.gstatic.com — ERR_SSL_PROTOCOL_ERROR), so all three load from local
// woff2 files in public/fonts/ (installed via @fontsource through the npm registry, which works). Family names
// are kept identical to the Google faces so the rest of the engine is untouched.
loadFont({ family: 'Bricolage Grotesque', url: staticFile('fonts/bricolage-grotesque-latin-600-normal.woff2'), weight: '600' });
loadFont({ family: 'Bricolage Grotesque', url: staticFile('fonts/bricolage-grotesque-latin-700-normal.woff2'), weight: '700' });
loadFont({ family: 'Bricolage Grotesque', url: staticFile('fonts/bricolage-grotesque-latin-800-normal.woff2'), weight: '800' });
loadFont({ family: 'Fragment Mono', url: staticFile('fonts/fragment-mono-latin-400-normal.woff2'), weight: '400' });
loadFont({ family: 'Kalam', url: staticFile('fonts/kalam-latin-400-normal.woff2'), weight: '400' });
loadFont({ family: 'Kalam', url: staticFile('fonts/kalam-latin-700-normal.woff2'), weight: '700' });
loadFont({ family: 'Permanent Marker', url: staticFile('fonts/permanent-marker-regular.ttf'), weight: '400' });
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  title: STUDIO.titleFont ? STUDIO.titleFont.family : 'Bricolage Grotesque',
  ui: 'Fragment Mono',
  hand: 'Kalam',
};
