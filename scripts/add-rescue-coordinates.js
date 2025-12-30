#!/usr/bin/env node

/**
 * Generate SQL migration to ADD lat/lon coordinates to existing rescue locations
 * Matches rescue names between existing database and dogadopt.github.io data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data from dogadopt.github.io
const rescuesData = JSON.parse(fs.readFileSync('/tmp/rescues.json', 'utf8'));

console.log('Processing rescue location data...');
console.log(`Total entries from source: ${rescuesData.length}`);

// Read the existing rescues from the migration file
const migrationFile = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'migrations', '2025122802_dogadopt_rescues_and_locations.sql'),
  'utf8'
);

// Extract existing rescue names from the migration
const existingRescues = [];
const rescuePattern = /\('([^']+)',\s*'Full',\s*'([^']+)',\s*'([^']+)'\)/g;
let match;
while ((match = rescuePattern.exec(migrationFile)) !== null) {
  existingRescues.push({
    name: match[1],
    region: match[2],
    website: match[3]
  });
}

console.log(`Existing rescues in database: ${existingRescues.length}`);

// Function to normalize rescue names for matching
function normalizeRescueName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to escape SQL strings
function escapeSql(str) {
  if (!str) return null;
  return str.replace(/'/g, "''");
}

// Try to match rescues from JSON with existing database rescues
const matches = [];
const unmatchedJson = [];
const unmatchedDb = [...existingRescues];

rescuesData.forEach(jsonEntry => {
  const normalizedJsonName = normalizeRescueName(jsonEntry.rescue_name);
  
  // Try to find a match in existing rescues
  const matchIndex = unmatchedDb.findIndex(dbRescue => {
    const normalizedDbName = normalizeRescueName(dbRescue.name);
    
    // Exact match
    if (normalizedDbName === normalizedJsonName) return true;
    
    // Check if one contains the other (for partial matches)
    if (normalizedDbName.includes(normalizedJsonName) || 
        normalizedJsonName.includes(normalizedDbName)) {
      // Only match if similarity is high enough
      const shorter = Math.min(normalizedDbName.length, normalizedJsonName.length);
      const longer = Math.max(normalizedDbName.length, normalizedJsonName.length);
      return shorter / longer > 0.7; // At least 70% match
    }
    
    return false;
  });
  
  if (matchIndex !== -1) {
    const dbRescue = unmatchedDb[matchIndex];
    matches.push({
      dbName: dbRescue.name,
      dbRegion: dbRescue.region,
      jsonEntry: jsonEntry
    });
    unmatchedDb.splice(matchIndex, 1);
  } else {
    unmatchedJson.push(jsonEntry);
  }
});

console.log(`\nMatching results:`);
console.log(`  Matched: ${matches.length}`);
console.log(`  Unmatched from JSON: ${unmatchedJson.length}`);
console.log(`  Unmatched from DB: ${unmatchedDb.length}`);

// Generate SQL migration
let migrationSql = `-- Add latitude and longitude coordinates to existing rescue locations
-- and add new rescue centers from dogadopt.github.io
-- Source: https://github.com/dogadopt/dogadopt.github.io/blob/main/rescues.json
-- Generated: ${new Date().toISOString()}

-- This migration:
-- 1. Adds GPS coordinates to existing rescue locations where data is available
-- 2. Adds new rescue centers that don't exist in the current database
-- All existing rescues are preserved

`;

if (matches.length > 0) {
  migrationSql += `-- Update locations with lat/lon coordinates for ${matches.length} matched rescues\n\n`;
  
  matches.forEach(match => {
    const lat = match.jsonEntry.lat ? parseFloat(match.jsonEntry.lat) : null;
    const lon = match.jsonEntry.lng ? parseFloat(match.jsonEntry.lng) : null;
    
    if (lat && lon) {
      migrationSql += `-- ${match.dbName}\n`;
      migrationSql += `UPDATE dogadopt.locations\n`;
      migrationSql += `SET latitude = ${lat}, longitude = ${lon}\n`;
      migrationSql += `WHERE rescue_id = (SELECT id FROM dogadopt.rescues WHERE name = '${escapeSql(match.dbName)}')\n`;
      migrationSql += `  AND latitude IS NULL;\n\n`;
    }
  });
}

// Add new rescues that don't exist in the database
if (unmatchedJson.length > 0) {
  migrationSql += `\n-- Add ${unmatchedJson.length} new rescue centers from source data\n\n`;
  
  unmatchedJson.forEach(entry => {
    const region = entry.country || 'Unknown';
    let website = entry.website || '';
    
    // Normalize website URL
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      website = 'https://' + website;
    }
    website = website.replace(/\/+$/, '');
    
    migrationSql += `-- ${entry.rescue_name} (${region})\n`;
    migrationSql += `INSERT INTO dogadopt.rescues (name, type, region, website) VALUES\n`;
    migrationSql += `  ('${escapeSql(entry.rescue_name)}', 'Full', '${escapeSql(region)}', `;
    migrationSql += website ? `'${escapeSql(website)}'` : 'NULL';
    migrationSql += `);\n`;
    
    // Add location with coordinates
    const lat = entry.lat ? parseFloat(entry.lat) : null;
    const lon = entry.lng ? parseFloat(entry.lng) : null;
    const city = entry.country || 'Unknown';
    
    let enquiryUrl = null;
    if (entry.website_dogs) {
      let path = entry.website_dogs;
      if (!path.startsWith('/')) path = '/' + path;
      enquiryUrl = website + path;
    }
    
    migrationSql += `INSERT INTO dogadopt.locations (rescue_id, name, city, region, latitude, longitude, enquiry_url, location_type, is_public)\n`;
    migrationSql += `SELECT id, '${escapeSql(entry.rescue_name)}', '${escapeSql(city)}', '${escapeSql(region)}', `;
    migrationSql += lat ? `${lat}` : 'NULL';
    migrationSql += `, `;
    migrationSql += lon ? `${lon}` : 'NULL';
    migrationSql += `, `;
    migrationSql += enquiryUrl ? `'${escapeSql(enquiryUrl)}'` : 'NULL';
    migrationSql += `, 'centre', true\n`;
    migrationSql += `FROM dogadopt.rescues WHERE name = '${escapeSql(entry.rescue_name)}';\n\n`;
  });
}

if (unmatchedDb.length > 0) {
  migrationSql += `\n-- Note: The following ${unmatchedDb.length} existing rescues have no matching coordinate data:\n`;
  unmatchedDb.slice(0, 10).forEach(rescue => {
    migrationSql += `-- - ${rescue.name}\n`;
  });
  if (unmatchedDb.length > 10) {
    migrationSql += `-- ... and ${unmatchedDb.length - 10} more\n`;
  }
  migrationSql += `\n`;
}

migrationSql += `-- Migration complete!\n`;
migrationSql += `-- Locations updated with coordinates: ${matches.filter(m => m.jsonEntry.lat && m.jsonEntry.lng).length}\n`;
migrationSql += `-- New rescues added: ${unmatchedJson.length}\n`;
migrationSql += `-- Total rescues after migration: ${existingRescues.length + unmatchedJson.length}\n`;

// Write the migration file
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', `${timestamp}_add_rescue_coordinates.sql`);

fs.writeFileSync(migrationPath, migrationSql);

console.log(`\nMigration file created: ${migrationPath}`);
console.log(`Total location updates: ${matches.filter(m => m.jsonEntry.lat && m.jsonEntry.lng).length}`);

// Write matching report
const reportPath = path.join(__dirname, '..', 'RESCUE_MATCHING_REPORT.md');
let report = `# Rescue Matching Report\n\n`;
report += `Generated: ${new Date().toISOString()}\n\n`;
report += `## Summary\n\n`;
report += `- Existing rescues in database: ${existingRescues.length}\n`;
report += `- Entries in source data: ${rescuesData.length}\n`;
report += `- Matched (will update coordinates): ${matches.length}\n`;
report += `- New rescues to add: ${unmatchedJson.length}\n`;
report += `- Existing rescues with no coordinate data: ${unmatchedDb.length}\n`;
report += `- **Total rescues after migration: ${existingRescues.length + unmatchedJson.length}**\n\n`;

if (matches.length > 0) {
  report += `## Matched Rescues (${matches.length})\n\n`;
  report += `These rescues were matched and their locations will be updated with coordinates:\n\n`;
  report += `| Database Name | Region | Has Coordinates |\n`;
  report += `|---------------|--------|----------------|\n`;
  matches.forEach(m => {
    const hasCoords = m.jsonEntry.lat && m.jsonEntry.lng ? '✅' : '❌';
    report += `| ${m.dbName} | ${m.dbRegion} | ${hasCoords} |\n`;
  });
  report += `\n`;
}

if (unmatchedJson.length > 0) {
  report += `## New Rescues to Add (${unmatchedJson.length})\n\n`;
  report += `These rescues from the source data will be ADDED as new entries:\n\n`;
  unmatchedJson.forEach(entry => {
    const hasCoords = entry.lat && entry.lng ? '✅' : '❌';
    report += `- ${entry.rescue_name} (${entry.country}) ${hasCoords}\n`;
  });
  report += `\n`;
}

if (unmatchedDb.length > 0) {
  report += `## No Coordinate Data Available (${unmatchedDb.length})\n\n`;
  report += `These rescues are in the database but have no matching coordinate data in the source:\n\n`;
  unmatchedDb.forEach(rescue => {
    report += `- ${rescue.name} (${rescue.region})\n`;
  });
}

fs.writeFileSync(reportPath, report);
console.log(`Matching report created: ${reportPath}`);
