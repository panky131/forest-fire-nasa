/**
 * One-time build: converts beats_uk.kmz → compact polygons JSON (~3 MB).
 *
 *   node scripts/build-beats-polygons.mjs [path/to/beats_uk.kmz]
 *
 * Upload output to:
 *   https://www.programmingyan.com/forest_fire/map/kmz/beats_uk_polygons_v1.json
 *
 * Or copy to assets/beats/beats_polygons_v1.json for offline bundle.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unzipSync, strFromU8 } from "fflate";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KMZ =
  process.argv[2] ||
  path.join(ROOT, "assets", "beats", "beats_uk.kmz");
const OUT_ASSETS = path.join(ROOT, "assets", "beats", "beats_polygons_v1.json");
const MAX_POINTS = 25;
const VERSION = 2;

function simplify(ring, max) {
  if (ring.length <= max) return ring;
  const step = Math.ceil(ring.length / max);
  const out = [];
  for (let i = 0; i < ring.length; i += step) out.push(ring[i]);
  const last = ring[ring.length - 1];
  const tail = out[out.length - 1];
  if (!tail || tail.latitude !== last.latitude || tail.longitude !== last.longitude) {
    out.push(last);
  }
  return out;
}

function parseCoords(raw) {
  const points = [];
  for (const token of raw.trim().split(/\s+/)) {
    const parts = token.split(",");
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      points.push({ latitude: lat, longitude: lng });
    }
  }
  return points;
}

function bbox(ring) {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;
  for (const p of ring) {
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
  }
  return [minLng, minLat, maxLng, maxLat];
}

if (!fs.existsSync(KMZ)) {
  console.error("KMZ not found:", KMZ);
  console.error("Download beats_uk.kmz first or pass path as argv[2].");
  process.exit(1);
}

console.log("Reading", KMZ);
const zipped = fs.readFileSync(KMZ);
const files = unzipSync(zipped);
const kml = strFromU8(files["doc.kml"]);

const placemarkRe = /<Placemark[\s\S]*?<\/Placemark>/gi;
const coordRe = /<coordinates>([\s\S]*?)<\/coordinates>/i;
const polygons = [];
let m;
let id = 0;

while ((m = placemarkRe.exec(kml)) !== null) {
  const cm = coordRe.exec(m[0]);
  if (!cm) continue;
  const ring = simplify(parseCoords(cm[1]), MAX_POINTS);
  if (ring.length < 3) continue;
  polygons.push({ id: id++, bbox: bbox(ring), ring });
}

const payload = { version: VERSION, polygons };
fs.mkdirSync(path.dirname(OUT_ASSETS), { recursive: true });
fs.writeFileSync(OUT_ASSETS, JSON.stringify(payload));
const mb = (fs.statSync(OUT_ASSETS).size / 1024 / 1024).toFixed(2);
console.log(`Wrote ${polygons.length} polygons → ${OUT_ASSETS} (${mb} MB)`);
