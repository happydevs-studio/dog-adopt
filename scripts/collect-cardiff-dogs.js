#!/usr/bin/env node

/**
 * Cardiff Dogs Home — Factual Data Collector
 *
 * Extracts ONLY non-copyrightable factual data (name, age, gender, size,
 * compatibility flags) from locally-cached HTML pages and outputs a JSON
 * file ready for upload to the Adopt-a-Dog database.
 *
 * Usage:
 *   1. Cache the listing page and all individual dog pages locally:
 *        node collect-cardiff-dogs.js --download
 *      (This makes ONE request per page, then the script works offline.)
 *
 *   2. Parse the cached HTML and produce cardiff-dogs.json:
 *        node collect-cardiff-dogs.js --parse
 *
 *   3. Sync to Supabase (inserts new, updates existing, marks removed as withdrawn):
 *        node collect-cardiff-dogs.js --upload
 *
 *   4. Run all steps at once (for CI/scheduled runs):
 *        node collect-cardiff-dogs.js --sync
 *
 * Environment variables (for production/CI):
 *   SUPABASE_URL             — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key (bypasses RLS, for writes)
 *
 * All intermediate HTML files are stored in scripts/cardiff-cache/.
 * The output JSON is written to scripts/cardiff-cache/cardiff-dogs.json.
 *
 * IMPORTANT: This script deliberately does NOT copy descriptions or photos.
 * It only extracts factual data (name, gender, age category, size, compatibility)
 * and links back to the original profile on cardiffdogshome.co.uk.
 */

import { load } from 'cheerio';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_DIR = join(__dirname, 'cardiff-cache');
const LISTING_URL = 'https://www.cardiffdogshome.co.uk/give-a-dog-a-home/dogs-available-for-rehoming/';
const OUTPUT_FILE = join(CACHE_DIR, 'cardiff-dogs.json');
const USER_AGENT = 'AdoptADogUK/1.0 (+https://www.dogadopt.co.uk; https://github.com/happydevs-studio/dog-adopt)';

/** Fetch wrapper that includes a polite User-Agent header */
function politelyfetch(url) {
  return fetch(url, { headers: { 'User-Agent': USER_AGENT } });
}

// ---------------------------------------------------------------------------
// Step 1: Download pages to local cache
// ---------------------------------------------------------------------------
async function downloadPages() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  console.log('📥 Downloading listing page…');
  const listingResp = await politelyfetch(LISTING_URL);
  if (!listingResp.ok) throw new Error(`Failed to fetch listing: ${listingResp.status}`);
  const listingHtml = await listingResp.text();
  writeFileSync(join(CACHE_DIR, 'listing.html'), listingHtml);

  // Extract dog profile URLs from listing
  const dogUrls = extractDogUrlsFromHtml(listingHtml);
  console.log(`🐕 Found ${dogUrls.length} dogs on listing page`);

  // Download each dog page with a polite delay
  for (const { name, url } of dogUrls) {
    const safeFilename = `dog-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    const filepath = join(CACHE_DIR, safeFilename);
    if (existsSync(filepath)) {
      console.log(`  ⏭️  ${name} — already cached`);
      continue;
    }
    console.log(`  ⬇️  ${name}…`);
    const resp = await politelyfetch(url);
    if (!resp.ok) {
      console.warn(`  ⚠️  Failed to fetch ${name}: ${resp.status}`);
      continue;
    }
    writeFileSync(filepath, await resp.text());
    // Be polite — 1 second between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('✅ All pages cached locally in scripts/cardiff-cache/');
}

// ---------------------------------------------------------------------------
// Step 2: Parse cached HTML files into factual JSON
// ---------------------------------------------------------------------------
function parseAllDogs() {
  const listingPath = join(CACHE_DIR, 'listing.html');
  if (!existsSync(listingPath)) {
    console.error('❌ No cached listing.html found. Run with --download first.');
    process.exit(1);
  }

  const listingHtml = readFileSync(listingPath, 'utf-8');
  const dogUrls = extractDogUrlsFromHtml(listingHtml);
  console.log(`📋 Parsing ${dogUrls.length} cached dog pages…`);

  const dogs = [];
  for (const { name, url } of dogUrls) {
    const safeFilename = `dog-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    const filepath = join(CACHE_DIR, safeFilename);
    if (!existsSync(filepath)) {
      console.warn(`  ⚠️  No cache for ${name} — skipping`);
      continue;
    }
    const html = readFileSync(filepath, 'utf-8');
    const dog = parseDogPage(html, name, url);
    if (dog) {
      dogs.push(dog);
      console.log(`  ✅ ${dog.name} — ${dog.gender} ${dog.age} (${dog.size})`);
    } else {
      console.warn(`  ⚠️  Could not parse ${name}`);
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(dogs, null, 2));
  console.log(`\n📄 Wrote ${dogs.length} dogs to cardiff-cache/cardiff-dogs.json`);
  return dogs;
}

// ---------------------------------------------------------------------------
// Step 3: Sync to Supabase (upsert new, update existing, mark removed)
// ---------------------------------------------------------------------------
async function uploadToSupabase() {
  if (!existsSync(OUTPUT_FILE)) {
    console.error('❌ No cardiff-dogs.json found. Run with --parse first.');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');

  // Use service role key for production (bypasses RLS), fall back to anon for local
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

  const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(`🔑 Using ${isServiceRole ? 'service role' : 'anon'} key`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: 'dogadopt' }
  });

  // Find Cardiff Dogs Home rescue
  const { data: rescues, error: rescueError } = await supabase
    .from('rescues')
    .select('id, name')
    .ilike('name', '%cardiff%');

  if (rescueError || !rescues?.length) {
    console.error('❌ Cardiff Dogs Home not found in rescues table.', rescueError);
    process.exit(1);
  }

  const rescue = rescues[0];
  console.log(`🏠 Found rescue: ${rescue.name} (${rescue.id})`);

  // Load existing Cardiff dogs from DB (keyed by profile_url)
  const { data: existingDogs } = await supabase
    .from('dogs')
    .select('id, name, profile_url, status')
    .eq('rescue_id', rescue.id)
    .not('profile_url', 'is', null);

  const existingByUrl = new Map(
    (existingDogs ?? []).map(d => [d.profile_url, d])
  );
  console.log(`📊 ${existingByUrl.size} existing Cardiff dogs in DB`);

  // Load breeds table for mapping
  const { data: allBreeds } = await supabase.from('breeds').select('id, name');
  const breedMap = new Map(allBreeds?.map(b => [b.name.toLowerCase(), b.id]) ?? []);

  const dogs = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log(`🐕 Syncing ${dogs.length} dogs from website…`);

  const scrapedUrls = new Set();
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const dog of dogs) {
    scrapedUrls.add(dog.profileUrl);
    const existing = existingByUrl.get(dog.profileUrl);

    const dogRow = {
      name: dog.name,
      age: dog.age,
      size: dog.size,
      gender: dog.gender,
      rescue_id: rescue.id,
      image: '', // Default placeholder
      profile_url: dog.profileUrl,
      description: `View ${dog.name}'s full profile on Cardiff Dogs Home website.`,
      good_with_kids: dog.goodWithKids,
      good_with_dogs: dog.goodWithDogs,
      good_with_cats: dog.goodWithCats,
    };

    if (existing) {
      // Dog already in DB — update factual fields, re-mark as available if withdrawn
      const updates = { ...dogRow, status: 'available' };
      delete updates.image; // Don't overwrite if admin set a photo
      const { error } = await supabase
        .from('dogs')
        .update(updates)
        .eq('id', existing.id);

      if (error) {
        console.warn(`  ⚠️  Failed to update ${dog.name}: ${error.message}`);
      } else {
        updated++;
        console.log(`  🔄 ${dog.name} — updated`);
      }
    } else {
      // New dog — insert
      const { data: newDog, error } = await supabase
        .from('dogs')
        .insert({ ...dogRow, status: 'available' })
        .select('id')
        .single();

      if (error) {
        console.warn(`  ⚠️  Failed to insert ${dog.name}: ${error.message}`);
        continue;
      }

      // Link breeds via junction table
      if (dog.breeds?.length && newDog) {
        for (let i = 0; i < dog.breeds.length; i++) {
          const breedName = dog.breeds[i];
          let breedId = breedMap.get(breedName.toLowerCase());

          if (!breedId) {
            const { data: created } = await supabase
              .from('breeds')
              .insert({ name: breedName })
              .select('id')
              .single();
            if (created) {
              breedId = created.id;
              breedMap.set(breedName.toLowerCase(), breedId);
            }
          }

          if (breedId) {
            await supabase.from('dogs_breeds').insert({
              dog_id: newDog.id,
              breed_id: breedId,
              display_order: i + 1,
            });
          }
        }
      }

      inserted++;
      console.log(`  ✅ ${dog.name} — new`);
    }
  }

  // Mark dogs no longer on the website as withdrawn
  let withdrawn = 0;
  for (const [url, existing] of existingByUrl) {
    if (!scrapedUrls.has(url) && existing.status === 'available') {
      const { error } = await supabase
        .from('dogs')
        .update({
          status: 'withdrawn',
          status_notes: 'No longer listed on Cardiff Dogs Home website',
        })
        .eq('id', existing.id);

      if (!error) {
        withdrawn++;
        console.log(`  🏠 ${existing.name} — marked withdrawn (no longer listed)`);
      }
    }
  }

  console.log(`\n🎉 Sync complete for ${rescue.name}:`);
  console.log(`   ${inserted} new, ${updated} updated, ${withdrawn} withdrawn`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract dog URLs from the listing page HTML */
function extractDogUrlsFromHtml(html) {
  const $ = load(html);
  const dogs = [];
  const seen = new Set();

  // Each dog is in a vc_grid-item with a .doglink h3 > a
  $('.vc_gitem-post-data-source-post_title a').each((_, el) => {
    const url = $(el).attr('href');
    const name = $(el).text().trim();
    if (url && name && !seen.has(url)) {
      seen.add(url);
      dogs.push({ name, url });
    }
  });

  return dogs;
}

/** Parse factual data from an individual dog page */
function parseDogPage(html, fallbackName, profileUrl) {
  const $ = load(html);

  // Name from the title "Hello, I'm <Name>"
  const titleText = $('h1').first().text().trim();
  const nameMatch = titleText.match(/Hello,?\s+I['']m\s+(.+)/i);
  const name = nameMatch ? nameMatch[1].trim() : fallbackName;

  // Structured facts from divTableCell elements
  const cells = [];
  $('.divTableCell').each((_, el) => {
    cells.push($(el).text().trim());
  });

  // Cell 0: "I'm a young adult girl" / "I'm a male puppy"
  const identityText = cells[0] || '';
  const gender = parseGender(identityText);
  const age = parseAge(identityText);

  // Cell 1: "Small sized" / "Medium sized" / "Large sized"
  const sizeText = cells[1] || '';
  const size = parseSize(sizeText);

  // Cell 2: children compatibility
  const kidsText = cells[2] || '';
  const goodWithKids = parseKids(kidsText);

  // Cell 3: cats compatibility
  const catsText = cells[3] || '';
  const goodWithCats = parseCats(catsText);

  // Cell 4: dogs compatibility
  const dogsText = cells[4] || '';
  const goodWithDogs = parseDogs(dogsText);

  // Try to extract breed from the first paragraph of entry-content
  // Often format: "Name – 3 Year Old Terrier Girl" or description mentions breed
  const breeds = parseBreeds($);

  return {
    name,
    gender,
    age,
    size,
    breeds,
    goodWithKids,
    goodWithCats,
    goodWithDogs,
    profileUrl,
  };
}

function parseGender(text) {
  const lower = text.toLowerCase();
  if (lower.includes('girl') || lower.includes('female')) return 'Female';
  if (lower.includes('boy') || lower.includes('male')) return 'Male';
  return 'Male'; // default
}

function parseAge(text) {
  const lower = text.toLowerCase();
  if (lower.includes('puppy')) return 'Puppy';
  if (lower.includes('young adult')) return 'Adult'; // Cardiff's "young adult" = our Adult
  if (lower.includes('young')) return 'Young';
  if (lower.includes('senior') || lower.includes('older')) return 'Senior';
  return 'Adult'; // default
}

function parseSize(text) {
  const lower = text.toLowerCase();
  if (lower.includes('small')) return 'Small';
  if (lower.includes('large')) return 'Large';
  return 'Medium'; // default
}

function parseKids(text) {
  const lower = text.toLowerCase();
  if (lower.includes('adults only') || lower.includes("can't live with children")) return false;
  if (lower.includes('suitable to live with children') || lower.includes('suitable to live with older children')) return true;
  return false; // conservative default
}

function parseCats(text) {
  const lower = text.toLowerCase();
  if (lower.includes("can't live with cats") || lower.includes('cannot live with cats')) return false;
  if (lower.includes('able to live with cats') || lower.includes('may be able to live with cats')) return true;
  return false;
}

function parseDogs(text) {
  const lower = text.toLowerCase();
  if (lower.includes("can't live with") || lower.includes('cannot live with')) return false;
  if (lower.includes('able to live with other dogs') || lower.includes('may be able to live with other dogs')) return true;
  return false;
}

/**
 * Attempt to extract breed names from the first paragraph.
 * Cardiff Dogs Home often uses: "Name – 3 Year Old Terrier Girl"
 * or mentions breed types in the description text.
 * Returns "Crossbreed" if no specific breed can be identified.
 */
function parseBreeds($) {
  const firstParagraph = $('.entry-content p').first().text().trim();

  // Common pattern: "Name – <age> Year Old <Breed> <Gender>"
  const dashPattern = firstParagraph.match(/[\u2013\u2014–-]\s*\d+\s*(?:Year|Month)s?\s+Old\s+(.+?)(?:\s+(?:Girl|Boy|Male|Female))/i);
  if (dashPattern) {
    return cleanBreedNames(dashPattern[1]);
  }

  // Look for "is a <size> <breed>" pattern
  const isAPattern = firstParagraph.match(/is\s+(?:a|an)\s+(?:small|medium|large)?\s*(.+?)(?:\s+(?:and|who|that|aged|around|,))/i);
  if (isAPattern) {
    const breedText = isAPattern[1].replace(/\b(small|medium|large|sized|male|female|boy|girl|puppy|young|adult|senior)\b/gi, '').trim();
    if (breedText.length > 2) {
      return cleanBreedNames(breedText);
    }
  }

  return ['Crossbreed'];
}

/** Clean up breed text into an array of breed names */
function cleanBreedNames(raw) {
  // Handle "cross breed" / "crossbreed" explicitly
  if (/^\s*cross\s*breed\s*$/i.test(raw)) return ['Crossbreed'];

  // Remove filler words
  let cleaned = raw
    .replace(/\btype\b/gi, '')
    .replace(/\bmix\b/gi, '')
    .replace(/\bcross\s*breed\b/gi, '')
    .replace(/\bcross\b/gi, '')
    .replace(/\bbred\b/gi, '')
    .trim();

  // Split on / or , for multi-breed
  const parts = cleaned.split(/[\/,]/).map(s => s.trim()).filter(s => s.length > 1);

  if (parts.length === 0) return ['Crossbreed'];

  // Capitalize each breed name properly
  return parts.map(breed =>
    breed.replace(/\b\w/g, c => c.toUpperCase()).replace(/\s+/g, ' ').trim()
  ).filter(b => b.length > 1);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args.includes('--sync')) {
  // Full pipeline: download → parse → upload (for CI/scheduled runs)
  (async () => {
    await downloadPages();
    parseAllDogs();
    await uploadToSupabase();
  })().catch(err => {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  });
} else if (args.includes('--download')) {
  downloadPages().catch(err => {
    console.error('❌ Download failed:', err.message);
    process.exit(1);
  });
} else if (args.includes('--parse')) {
  parseAllDogs();
} else if (args.includes('--upload')) {
  uploadToSupabase().catch(err => {
    console.error('❌ Upload failed:', err.message);
    process.exit(1);
  });
} else {
  console.log(`
Cardiff Dogs Home — Factual Data Collector

Usage:
  node collect-cardiff-dogs.js --download   Download pages to local cache
  node collect-cardiff-dogs.js --parse      Parse cached HTML → cardiff-dogs.json
  node collect-cardiff-dogs.js --upload     Sync JSON to Supabase (upsert + withdraw)
  node collect-cardiff-dogs.js --sync       Run all steps (for CI/cron)

Steps:
  1. Run --download to cache all pages locally
  2. Run --parse to extract factual data (works offline)
  3. Review cardiff-cache/cardiff-dogs.json
  4. Run --upload when ready (requires local Supabase)
  `);
}
