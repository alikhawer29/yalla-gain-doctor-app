/**
 * Applies Android Zoom fixes after `yarn install`:
 * - RNZoomSDKModule.java (MeetingServiceListener + RN addListener/removeListeners)
 * - build.gradle (remove deprecated jcenter(); Gradle 9 has no jcenter())
 *
 * Also patches react-native-reanimated compatibility.json to allow worklets 0.7.x
 * alongside 4.1.x (the published file only lists 0.5.x and 0.6.x).
 */
const fs = require('fs');
const path = require('path');

// --- Patch reanimated compatibility.json ---
(function patchReanimatedCompat() {
  const compatPath = path.join(
    __dirname,
    '..',
    'node_modules',
    'react-native-reanimated',
    'compatibility.json',
  );
  if (!fs.existsSync(compatPath)) {
    console.warn('[postinstall] react-native-reanimated compatibility.json not found, skipping.');
    return;
  }
  const compat = JSON.parse(fs.readFileSync(compatPath, 'utf8'));
  const entry = compat['4.1.x'];
  if (entry && Array.isArray(entry['react-native-worklets'])) {
    if (!entry['react-native-worklets'].includes('0.7.x')) {
      entry['react-native-worklets'].push('0.7.x');
      fs.writeFileSync(compatPath, JSON.stringify(compat, null, 2) + '\n');
      console.log('[postinstall] Patched reanimated compatibility.json to allow worklets 0.7.x');
    } else {
      console.log('[postinstall] reanimated compatibility.json already includes 0.7.x, no change needed.');
    }
  }
})();

const zoomAndroidRoot = path.join(
  __dirname,
  '..',
  'node_modules',
  '@zoom',
  'meetingsdk-react-native',
  'android',
);

const patchesDir = path.join(__dirname, 'zoom-patches', 'android');

const copies = [
  ['RNZoomSDKModule.java', path.join('src', 'main', 'java', 'com', 'reactnativezoom', 'sdk', 'RNZoomSDKModule.java')],
  ['build.gradle', 'build.gradle'],
];

if (!fs.existsSync(zoomAndroidRoot)) {
  console.warn('[apply-zoom-android-patch] Skip: @zoom/meetingsdk-react-native not installed yet.');
  process.exit(0);
}

for (const [name, relDest] of copies) {
  const src = path.join(patchesDir, name);
  const dest = path.join(zoomAndroidRoot, ...relDest.split(path.sep));
  if (!fs.existsSync(src)) {
    console.warn('[apply-zoom-android-patch] Missing patch file:', src);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log('[apply-zoom-android-patch] Applied', name);
}
