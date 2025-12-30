#!/usr/bin/env node

/**
 * Update seed.sql to add lat/lon coordinates to existing rescues
 * Only updates existing rescues, does not add new ones
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data from dogadopt.github.io
const rescuesData = JSON.parse(fs.readFileSync('/tmp/rescues.json', 'utf8'));

console.log('Processing rescue coordinate data...');
console.log(`Total entries from source: ${rescuesData.length}`);

// Read the seed.sql file
const seedFilePath = path.join(__dirname, '..', 'supabase', 'seed.sql');
const seedContent = fs.readFileSync(seedFilePath, 'utf8');

// Extract existing rescue names from seed.sql
const existingRescues = [];
const rescuePattern = /\('([^']+)',\s*'Full',\s*'[^']+',\s*'[^']+'\)/g;
let match;
while ((match = rescuePattern.exec(seedContent)) !== null) {
  existingRescues.push(match[1]);
}

console.log(`Existing rescues in seed.sql: ${existingRescues.length}`);

// Function to normalize rescue names for matching
function normalizeRescueName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Create a map of rescue names to coordinates
const coordinateMap = new Map();
rescuesData.forEach(entry => {
  const normalizedName = normalizeRescueName(entry.rescue_name);
  if (entry.lat && entry.lng) {
    coordinateMap.set(normalizedName, {
      lat: parseFloat(entry.lat),
      lng: parseFloat(entry.lng),
      originalName: entry.rescue_name
    });
  }
});

// Match existing rescues with coordinate data
const matches = [];
existingRescues.forEach(rescueName => {
  const normalized = normalizeRescueName(rescueName);
  
  // Try exact match first
  if (coordinateMap.has(normalized)) {
    matches.push({
      name: rescueName,
      ...coordinateMap.get(normalized)
    });
  } else {
    // Try fuzzy match
    for (const [key, value] of coordinateMap.entries()) {
      if (key.includes(normalized) || normalized.includes(key)) {
        const shorter = Math.min(key.length, normalized.length);
        const longer = Math.max(key.length, normalized.length);
        if (shorter / longer > 0.7) {
          matches.push({
            name: rescueName,
            ...value
          });
          break;
        }
      }
    }
  }
});

console.log(`Matched rescues with coordinates: ${matches.length}`);

// Update the INSERT INTO locations statement
const locationInsertStart = seedContent.indexOf('INSERT INTO dogadopt.locations (rescue_id, name, city, region, location_type, is_public)');
const locationInsertEnd = seedContent.indexOf('WHERE NOT EXISTS (', locationInsertStart);

if (locationInsertStart === -1 || locationInsertEnd === -1) {
  console.error('Could not find location INSERT statement in seed.sql');
  process.exit(1);
}

// Build the new location insert with lat/lon
const newLocationInsert = `INSERT INTO dogadopt.locations (rescue_id, name, city, region, location_type, is_public, latitude, longitude)
SELECT 
  r.id,
  r.name || ' - ' || r.region,
  COALESCE(
    CASE 
      WHEN r.region LIKE '%London%' THEN 'London'
      WHEN r.region LIKE '%Edinburgh%' THEN 'Edinburgh'
      WHEN r.region LIKE '%Cardiff%' THEN 'Cardiff'
      WHEN r.region LIKE '%Belfast%' THEN 'Belfast'
      WHEN r.region LIKE '%Birmingham%' THEN 'Birmingham'
      WHEN r.region LIKE '%Manchester%' THEN 'Manchester'
      WHEN r.region LIKE '%Leeds%' THEN 'Leeds'
      WHEN r.region LIKE '%Bristol%' THEN 'Bristol'
      ELSE SPLIT_PART(r.region, ' ', 1)
    END,
    r.region
  ),
  r.region,
  'centre',
  true,
  CASE r.name
${matches.map(m => `    WHEN '${m.name.replace(/'/g, "''")}' THEN ${m.lat}`).join('\n')}
    ELSE NULL
  END,
  CASE r.name
${matches.map(m => `    WHEN '${m.name.replace(/'/g, "''")}' THEN ${m.lng}`).join('\n')}
    ELSE NULL
  END
FROM dogadopt.rescues r
`;

// Replace the old INSERT with the new one
const beforeInsert = seedContent.substring(0, locationInsertStart);
const afterInsert = seedContent.substring(locationInsertEnd);
const updatedContent = beforeInsert + newLocationInsert + afterInsert;

// Write back to seed.sql
fs.writeFileSync(seedFilePath, updatedContent);

console.log(`\nUpdated seed.sql with ${matches.length} rescue coordinates`);
console.log('\nMatched rescues:');
matches.forEach(m => {
  console.log(`  - ${m.name}`);
});
