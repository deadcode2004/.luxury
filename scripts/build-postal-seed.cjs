#!/usr/bin/env node
/**
 * Build postal_codes seed JSON from GeoNames allCountries.zip + curated MENA files.
 * Matching: Country → name/admin match to City, else nearest city by lat/lng (grid).
 * Output: backend/database/data/geo/postal-codes.json (+ meta)
 *
 * Usage: node scripts/build-postal-seed.cjs
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const GEO_DIR = path.join(ROOT, "backend/database/data/geo");
const POSTAL_DIR = path.join(GEO_DIR, "postal");
const ZIP_PATH = path.join(POSTAL_DIR, "allCountries.zip");
const OUT_PATH = path.join(GEO_DIR, "postal-codes.ndjson");
const META_PATH = path.join(GEO_DIR, "postal-meta.json");

function normalize(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cellKey(lat, lng, scale = 2) {
  return `${Math.floor(lat * scale)}_${Math.floor(lng * scale)}`;
}

function dist2(aLat, aLng, bLat, bLng) {
  const dLat = aLat - bLat;
  const dLng = aLng - bLng;
  return dLat * dLat + dLng * dLng;
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureUnzippedTxt() {
  const txt = path.join(POSTAL_DIR, "allCountries.txt");
  if (fs.existsSync(txt) && fs.statSync(txt).size > 1_000_000) return txt;
  if (!fs.existsSync(ZIP_PATH)) {
    fs.mkdirSync(POSTAL_DIR, { recursive: true });
    const url = "https://download.geonames.org/export/zip/allCountries.zip";
    console.log(`Downloading ${url} …`);
    execSync(`curl -L --fail --retry 3 -o "${ZIP_PATH}" "${url}"`, { stdio: "inherit" });
  }
  console.log("Extracting allCountries.zip…");
  execSync(`unzip -o -q "${ZIP_PATH}" -d "${POSTAL_DIR}"`, { stdio: "inherit" });
  return txt;
}

function buildCityIndex(countries, cities) {
  const byIso = new Map();
  for (const c of countries) byIso.set(String(c.iso2).toUpperCase(), c);

  /** @type {Map<number, { byName: Map<string, any[]>, grid: Map<string, any[]>, list: any[] }>} */
  const byCountry = new Map();

  for (const city of cities) {
    if (!byCountry.has(city.country_id)) {
      byCountry.set(city.country_id, { byName: new Map(), grid: new Map(), list: [] });
    }
    const idx = byCountry.get(city.country_id);
    idx.list.push(city);
    const n = normalize(city.name_en);
    if (n) {
      if (!idx.byName.has(n)) idx.byName.set(n, []);
      idx.byName.get(n).push(city);
    }
    const nAr = normalize(city.name_ar);
    if (nAr && nAr !== n) {
      if (!idx.byName.has(nAr)) idx.byName.set(nAr, []);
      idx.byName.get(nAr).push(city);
    }
    if (city.latitude != null && city.longitude != null) {
      const key = cellKey(Number(city.latitude), Number(city.longitude));
      if (!idx.grid.has(key)) idx.grid.set(key, []);
      idx.grid.get(key).push(city);
    }
  }

  return { byIso, byCountry };
}

function findByName(idx, ...names) {
  for (const raw of names) {
    const n = normalize(raw);
    if (!n) continue;
    const hits = idx.byName.get(n);
    if (hits && hits.length) return hits[0];
  }
  return null;
}

function findNearest(idx, lat, lng) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;
  const scale = 2;
  const baseLat = Math.floor(lat * scale);
  const baseLng = Math.floor(lng * scale);
  let best = null;
  let bestD = Infinity;
  for (let dLat = -1; dLat <= 1; dLat++) {
    for (let dLng = -1; dLng <= 1; dLng++) {
      const key = `${baseLat + dLat}_${baseLng + dLng}`;
      const bucket = idx.grid.get(key);
      if (!bucket) continue;
      for (const city of bucket) {
        const d = dist2(lat, lng, Number(city.latitude), Number(city.longitude));
        if (d < bestD) {
          bestD = d;
          best = city;
        }
      }
    }
  }
  // ~1 degree² fallback radius (~111km); reject farther matches
  if (best && bestD > 1.0) return null;
  return best;
}

function addRow(map, row) {
  const key = `${row.city_id}|${row.code}`;
  if (map.has(key)) return false;
  map.set(key, row);
  return true;
}

function applyCurated(map, countries, cities, iso2, fileName) {
  const country = countries.find((c) => String(c.iso2).toUpperCase() === iso2);
  if (!country) {
    console.warn(`Curated ${iso2}: country missing`);
    return 0;
  }
  const file = path.join(POSTAL_DIR, fileName);
  if (!fs.existsSync(file)) {
    console.warn(`Curated file missing: ${file}`);
    return 0;
  }
  const rows = loadJson(file);
  const cityList = cities.filter((c) => c.country_id === country.id);
  const byName = new Map();
  for (const c of cityList) {
    const n = normalize(c.name_en);
    if (n) byName.set(n, c);
  }
  let added = 0;
  for (const r of rows) {
    const city = byName.get(normalize(r.city_name_en));
    if (!city) continue;
    if (
      addRow(map, {
        country_id: country.id,
        state_id: city.state_id,
        city_id: city.id,
        code: String(r.code).trim(),
        place_name_en: r.place_name_en || null,
        place_name_ar: r.place_name_ar || null,
        is_active: true,
      })
    ) {
      added++;
    }
  }
  console.log(`Curated ${iso2}: +${added}`);
  return added;
}

function fillNearestNeighbor(map, cities, countriesWithPostal) {
  /** city_id -> first postal row */
  const byCity = new Map();
  for (const row of map.values()) {
    if (!byCity.has(row.city_id)) byCity.set(row.city_id, row);
  }

  const citiesByCountry = new Map();
  for (const city of cities) {
    if (!citiesByCountry.has(city.country_id)) citiesByCountry.set(city.country_id, []);
    citiesByCountry.get(city.country_id).push(city);
  }

  let filled = 0;
  for (const countryId of countriesWithPostal) {
    const list = citiesByCountry.get(countryId) || [];
    const withPostal = list.filter((c) => byCity.has(c.id) && c.latitude != null);
    if (!withPostal.length) continue;

    for (const city of list) {
      if (byCity.has(city.id)) continue;
      if (city.latitude == null || city.longitude == null) {
        // copy any code from same state, else country
        const donor =
          withPostal.find((c) => c.state_id === city.state_id) || withPostal[0];
        const src = byCity.get(donor.id);
        addRow(map, {
          country_id: city.country_id,
          state_id: city.state_id,
          city_id: city.id,
          code: src.code,
          place_name_en: src.place_name_en,
          place_name_ar: src.place_name_ar,
          is_active: true,
        });
        byCity.set(city.id, src);
        filled++;
        continue;
      }
      let best = null;
      let bestD = Infinity;
      for (const other of withPostal) {
        const d = dist2(
          Number(city.latitude),
          Number(city.longitude),
          Number(other.latitude),
          Number(other.longitude)
        );
        if (d < bestD) {
          bestD = d;
          best = other;
        }
      }
      if (!best) continue;
      const src = byCity.get(best.id);
      addRow(map, {
        country_id: city.country_id,
        state_id: city.state_id,
        city_id: city.id,
        code: src.code,
        place_name_en: src.place_name_en,
        place_name_ar: src.place_name_ar,
        is_active: true,
      });
      byCity.set(city.id, src);
      filled++;
    }
  }
  console.log(`Nearest-neighbor city fill: +${filled}`);
  return filled;
}

async function main() {
  console.log("Loading countries/cities…");
  const countries = loadJson(path.join(GEO_DIR, "countries.json"));
  const cities = loadJson(path.join(GEO_DIR, "cities.json"));
  const { byIso, byCountry } = buildCityIndex(countries, cities);

  const txtPath = ensureUnzippedTxt();
  /** @type {Map<string, any>} */
  const map = new Map();
  const countriesWithPostal = new Set();

  console.log("Streaming GeoNames postal dump…");
  const rl = require("readline").createInterface({
    input: fs.createReadStream(txtPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  let matched = 0;
  let skipped = 0;

  for await (const line of rl) {
    lineNo++;
    if (!line) continue;
    const parts = line.split("\t");
    // country code, postal code, place name, admin name1, admin code1, admin name2, admin code2, admin name3, admin code3, latitude, longitude, accuracy
    const iso = (parts[0] || "").toUpperCase();
    const code = (parts[1] || "").trim();
    if (!iso || !code) {
      skipped++;
      continue;
    }
    const country = byIso.get(iso);
    if (!country) {
      skipped++;
      continue;
    }
    const idx = byCountry.get(country.id);
    if (!idx) {
      skipped++;
      continue;
    }

    const place = parts[2] || "";
    const admin1 = parts[3] || "";
    const admin2 = parts[5] || "";
    const lat = parts[9] ? Number(parts[9]) : null;
    const lng = parts[10] ? Number(parts[10]) : null;

    let city =
      findByName(idx, place, admin2, admin1) ||
      (lat != null && lng != null ? findNearest(idx, lat, lng) : null);

    if (!city) {
      skipped++;
      continue;
    }

    if (
      addRow(map, {
        country_id: country.id,
        state_id: city.state_id,
        city_id: city.id,
        code,
        place_name_en: place || null,
        place_name_ar: null,
        is_active: true,
      })
    ) {
      matched++;
      countriesWithPostal.add(country.id);
    }

    if (lineNo % 200000 === 0) {
      console.log(`  … ${lineNo} lines, ${map.size} unique city+code`);
    }
  }

  console.log(`GeoNames matched unique: ${matched} (lines ${lineNo}, skipped ${skipped})`);

  applyCurated(map, countries, cities, "EG", "curated-EG.json");
  applyCurated(map, countries, cities, "SA", "curated-SA.json");
  applyCurated(map, countries, cities, "JO", "curated-JO.json");
  for (const iso of ["EG", "SA", "JO"]) {
    const c = countries.find((x) => String(x.iso2).toUpperCase() === iso);
    if (c) countriesWithPostal.add(c.id);
  }

  fillNearestNeighbor(map, cities, countriesWithPostal);

  const rows = Array.from(map.values());
  // Assign sequential ids starting at 1 for stable upserts
  rows.sort((a, b) => a.city_id - b.city_id || a.code.localeCompare(b.code));
  rows.forEach((r, i) => {
    r.id = i + 1;
  });

  console.log(`Writing ${rows.length} postal codes → ${OUT_PATH}`);
  const out = fs.createWriteStream(OUT_PATH, { encoding: "utf8" });
  for (const row of rows) {
    out.write(JSON.stringify(row) + "\n");
  }
  await new Promise((resolve, reject) => {
    out.end(() => resolve());
    out.on("error", reject);
  });

  const meta = {
    generated_at: new Date().toISOString(),
    source_lines: lineNo,
    postal_codes: rows.length,
    countries_with_postal: countriesWithPostal.size,
    country_ids_with_postal: Array.from(countriesWithPostal).sort((a, b) => a - b),
  };
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
  console.log("Done.", meta);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
