#!/usr/bin/env node
/**
 * Build bilingual geo seed data for Paradise.
 *
 * Sources (static / offline — no runtime translation APIs):
 * - country-state-city-translate (countries + states structure, arName)
 * - countries-cities-ar (admin-division Arabic)
 * - GeoNames cities15000 + admin1 ASCII + alternateNames (Arabic)
 *
 * Output: backend/database/data/geo/{countries,states,cities}.json
 *
 * Every record has name_en + name_ar. Gaps without attested Arabic
 * receive a deterministic phonetic Arabic rendering at build time so the
 * database stays complete and monolingual lists never mix scripts.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "backend/database/data/geo");
const CSC_TR = path.join(
  ROOT,
  "node_modules/country-state-city-translate/lib/cjs/assets"
);
const GEONAMES = process.env.GEONAMES_DIR || "/tmp/geonames";
const CCA = require(path.join(ROOT, "node_modules/countries-cities-ar"));

function hasArabic(s) {
  return typeof s === "string" && /[\u0621-\u064A]/.test(s);
}

function cleanLatin(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value) {
  return cleanLatin(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
    .replace(
      /\b(governorate|emirate|municipality|district|region|province|state|county|department|prefecture|parish|division|territory|city|wilaya)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Deterministic Latin → Arabic phonetic (seed-time only, for gaps). */
function phoneticArabic(input) {
  const map = {
    a: "ا",
    b: "ب",
    c: "ك",
    d: "د",
    e: "ي",
    f: "ف",
    g: "ج",
    h: "ه",
    i: "ي",
    j: "ج",
    k: "ك",
    l: "ل",
    m: "م",
    n: "ن",
    o: "و",
    p: "ب",
    q: "ق",
    r: "ر",
    s: "س",
    t: "ت",
    u: "و",
    v: "ف",
    w: "و",
    x: "كس",
    y: "ي",
    z: "ز",
    " ": " ",
    "-": " ",
    "'": "",
  };
  const digraphs = [
    ["ch", "تش"],
    ["sh", "ش"],
    ["th", "ث"],
    ["kh", "خ"],
    ["ph", "ف"],
    ["gh", "غ"],
    ["ee", "ي"],
    ["oo", "و"],
    ["ou", "و"],
    ["ai", "اي"],
    ["ay", "اي"],
    ["ia", "يا"],
    ["ck", "ك"],
  ];
  let s = cleanLatin(input).toLowerCase();
  let out = "";
  let i = 0;
  while (i < s.length) {
    let matched = false;
    for (const [from, to] of digraphs) {
      if (s.startsWith(from, i)) {
        out += to;
        i += from.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = s[i];
    out += map[ch] ?? (/\d/.test(ch) ? ch : "");
    i += 1;
  }
  return out.replace(/\s+/g, " ").trim() || cleanLatin(input);
}

function ensureArabic(en, candidates) {
  for (const c of candidates) {
    if (hasArabic(c)) return c.trim();
  }
  return phoneticArabic(en);
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function buildAdminArabicIndex() {
  const byCountry = new Map(); // cc -> Map(normName -> ar)
  // countries-cities-ar
  for (const country of CCA.allCountries) {
    const cc = String(country.code || "").toUpperCase();
    if (!byCountry.has(cc)) byCountry.set(cc, new Map());
    const bucket = byCountry.get(cc);
    for (const place of country.cities || []) {
      if (!place?.name || !hasArabic(place.nameAr)) continue;
      for (const key of [normalizeKey(place.name), normalizeKey(place.nameAr)]) {
        if (key) bucket.set(key, place.nameAr.trim());
      }
    }
  }

  // GeoNames admin1 + alternateNames ar
  if (!fs.existsSync(path.join(GEONAMES, "admin1CodesASCII.txt"))) {
    console.warn("GeoNames admin1 missing — skipping");
    return byCountry;
  }
  const admin1 = new Map();
  for (const line of fs.readFileSync(path.join(GEONAMES, "admin1CodesASCII.txt"), "utf8").split("\n")) {
    if (!line.trim()) continue;
    const [code, name, ascii, gid] = line.split("\t");
    if (!gid) continue;
    admin1.set(gid, { code, name, ascii, cc: code.split(".")[0] });
  }
  const altZip = path.join(GEONAMES, "alternateNamesV2.zip");
  if (fs.existsSync(altZip)) {
    const res = spawnSync(
      "bash",
      ["-c", `unzip -p '${altZip}' | awk -F'\\t' '$3=="ar" {print $2"\\t"$4}'`],
      { encoding: "utf8", maxBuffer: 1024 * 1024 * 400 }
    );
    if (res.status === 0) {
      for (const line of res.stdout.split("\n")) {
        if (!line) continue;
        const [gid, name] = line.split("\t");
        const info = admin1.get(gid);
        if (!info || !hasArabic(name)) continue;
        if (!byCountry.has(info.cc)) byCountry.set(info.cc, new Map());
        const bucket = byCountry.get(info.cc);
        bucket.set(normalizeKey(info.name), name.trim());
        bucket.set(normalizeKey(info.ascii), name.trim());
        // also map admin1 numeric code for city linking
        bucket.set(`code:${info.code.split(".")[1]}`, name.trim());
      }
    }
  }

  // Store admin1 code -> names for city matching
  const admin1ByCcCode = new Map(); // "EG.11" -> {en, ar, ascii}
  for (const [, info] of admin1) {
    const cc = info.cc;
    const code = info.code.split(".")[1];
    const bucket = byCountry.get(cc);
    const ar =
      (bucket && (bucket.get(normalizeKey(info.name)) || bucket.get(normalizeKey(info.ascii)))) ||
      "";
    admin1ByCcCode.set(info.code, {
      cc,
      code,
      en: cleanLatin(info.name || info.ascii),
      ar: hasArabic(ar) ? ar : "",
      ascii: info.ascii,
    });
  }

  return { byCountry, admin1ByCcCode };
}

function extractArabicFromAlts(alts) {
  if (!alts) return "";
  const parts = String(alts).split(",");
  for (const p of parts) {
    const t = p.trim();
    if (hasArabic(t)) return t;
  }
  return "";
}

function buildCitiesFromGeoNames(admin1ByCcCode, stateIndex) {
  const zip = path.join(GEONAMES, "cities15000.zip");
  if (!fs.existsSync(zip)) {
    console.warn("cities15000.zip missing");
    return [];
  }
  const res = spawnSync("unzip", ["-p", zip], { encoding: "utf8", maxBuffer: 1024 * 1024 * 50 });
  if (res.status !== 0) throw new Error("Failed to read cities15000");

  const cities = [];
  let id = 1;
  const seen = new Set();

  for (const line of res.stdout.split("\n")) {
    if (!line.trim()) continue;
    const p = line.split("\t");
    if (p.length < 11) continue;
    const name = cleanLatin(p[1] || p[2]);
    const ascii = cleanLatin(p[2] || p[1]);
    const arFromAlts = extractArabicFromAlts(p[3]);
    const cc = String(p[8] || "").toUpperCase();
    const admin1Code = String(p[10] || "");
    if (!cc || !name) continue;

    const adminKey = `${cc}.${admin1Code}`;
    const admin = admin1ByCcCode.get(adminKey);
    const state =
      stateIndex.get(`${cc}|${normalizeKey(admin?.en || "")}`) ||
      stateIndex.get(`${cc}|${normalizeKey(admin?.ascii || "")}`) ||
      stateIndex.get(`${cc}|code:${admin1Code}`) ||
      null;

    if (!state) continue;

    const nameEn = ascii || name;
    const nameAr = ensureArabic(nameEn, [arFromAlts]);
    const dedupe = `${state.id}|${normalizeKey(nameEn)}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    cities.push({
      id: id++,
      country_id: state.country_id,
      state_id: state.id,
      name_en: nameEn,
      name_ar: nameAr,
      latitude: p[4] || null,
      longitude: p[5] || null,
      geoname_id: Number(p[0]) || null,
      is_active: true,
    });
  }

  return cities;
}

function main() {
  console.log("Loading country-state-city-translate…");
  const rawCountries = loadJson(path.join(CSC_TR, "country.json"));
  const rawStates = loadJson(path.join(CSC_TR, "state.json"));

  console.log("Building Arabic admin index…");
  const { byCountry: adminAr, admin1ByCcCode } = buildAdminArabicIndex();

  const countries = [];
  const countryIdByIso2 = new Map();
  let countryId = 1;
  for (const c of rawCountries) {
    const iso2 = String(c.isoCode || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(iso2)) continue;
    const nameEn = cleanLatin(c.name || iso2);
    const nameAr = ensureArabic(nameEn, [c.arName]);
    const row = {
      id: countryId,
      iso2,
      name_en: nameEn,
      name_ar: nameAr,
      phonecode: String(c.phonecode || "").replace(/[^\d]/g, "") || null,
      flag: c.flag || null,
      currency: c.currency || null,
      is_active: true,
    };
    countries.push(row);
    countryIdByIso2.set(iso2, countryId);
    countryId += 1;
  }

  const states = [];
  const stateIndex = new Map(); // lookup keys -> state row
  let stateId = 1;
  for (const s of rawStates) {
    const cc = String(s.countryCode || "").toUpperCase();
    const country_id = countryIdByIso2.get(cc);
    if (!country_id) continue;
    const nameEn = cleanLatin(s.name || s.isoCode || `State ${stateId}`);
    const bucket = adminAr.get(cc);
    const nameAr = ensureArabic(nameEn, [
      s.arName,
      bucket?.get(normalizeKey(s.name)),
      bucket?.get(normalizeKey(nameEn)),
    ]);
    const code = s.isoCode ? String(s.isoCode) : null;
    const row = {
      id: stateId,
      country_id,
      country_iso2: cc,
      code,
      name_en: nameEn,
      name_ar: nameAr,
      is_active: true,
    };
    states.push(row);
    stateIndex.set(`${cc}|${normalizeKey(nameEn)}`, row);
    if (code) stateIndex.set(`${cc}|code:${code}`, row);
    // Also index without admin suffixes already in normalizeKey
    stateId += 1;
  }

  // Link GeoNames admin1 codes to states by name for city import
  for (const [fullCode, admin] of admin1ByCcCode) {
    const cc = admin.cc;
    const hit =
      stateIndex.get(`${cc}|${normalizeKey(admin.en)}`) ||
      stateIndex.get(`${cc}|${normalizeKey(admin.ascii)}`) ||
      stateIndex.get(`${cc}|code:${admin.code}`);
    if (hit) {
      stateIndex.set(`${cc}|code:${admin.code}`, hit);
      stateIndex.set(`geoname:${fullCode}`, hit);
    }
  }

  console.log("Importing GeoNames cities…");
  let cities = buildCitiesFromGeoNames(admin1ByCcCode, stateIndex);

  // Ensure every state has at least one city (use state names — keeps cascade usable).
  const citiesByState = new Set(cities.map((c) => c.state_id));
  let nextCityId = cities.reduce((m, c) => Math.max(m, c.id), 0) + 1;
  for (const st of states) {
    if (citiesByState.has(st.id)) continue;
    cities.push({
      id: nextCityId++,
      country_id: st.country_id,
      state_id: st.id,
      name_en: st.name_en,
      name_ar: st.name_ar,
      latitude: null,
      longitude: null,
      geoname_id: null,
      is_active: true,
    });
  }

  // Drop helper fields before write
  const statesOut = states.map(({ country_iso2, ...rest }) => rest);

  // Countries with no states still need a cascade path.
  const statesByCountry = new Set(statesOut.map((s) => s.country_id));
  let nextStateId = statesOut.reduce((m, s) => Math.max(m, s.id), 0) + 1;
  let nextCityId2 = cities.reduce((m, c) => Math.max(m, c.id), 0) + 1;
  for (const country of countries) {
    if (statesByCountry.has(country.id)) continue;
    const st = {
      id: nextStateId++,
      country_id: country.id,
      code: "00",
      name_en: country.name_en,
      name_ar: country.name_ar,
      is_active: true,
    };
    statesOut.push(st);
    cities.push({
      id: nextCityId2++,
      country_id: country.id,
      state_id: st.id,
      name_en: country.name_en,
      name_ar: country.name_ar,
      latitude: null,
      longitude: null,
      geoname_id: null,
      is_active: true,
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "countries.json"), JSON.stringify(countries));
  fs.writeFileSync(path.join(OUT_DIR, "states.json"), JSON.stringify(statesOut));
  fs.writeFileSync(path.join(OUT_DIR, "cities.json"), JSON.stringify(cities));

  const meta = {
    generated_at: new Date().toISOString(),
    counts: {
      countries: countries.length,
      states: statesOut.length,
      cities: cities.length,
    },
    notes:
      "Bilingual geo seed. Attested Arabic preferred; phonetic Arabic used only for gaps.",
  };
  fs.writeFileSync(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
  console.log("Wrote", meta.counts, "→", OUT_DIR);

  // Validate monolingual completeness
  const badCountry = countries.filter((c) => !c.name_en || !hasArabic(c.name_ar));
  const badState = statesOut.filter((s) => !s.name_en || !hasArabic(s.name_ar));
  const badCity = cities.filter((c) => !c.name_en || !hasArabic(c.name_ar));
  console.log("validation gaps", {
    countries: badCountry.length,
    states: badState.length,
    cities: badCity.length,
  });
}

main();
