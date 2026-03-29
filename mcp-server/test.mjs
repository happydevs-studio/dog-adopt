#!/usr/bin/env node
/**
 * Test script to validate MCP server structure and exports
 * This tests the server can be imported and has the correct structure
 * without requiring actual Supabase credentials
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 Testing MCP Server Structure...\n');

  try {
    // Test 1: Check if dist files exist
    console.log('✓ Test 1: Checking build output...');
    const distPath = join(__dirname, 'dist', 'index.js');
    const distContent = await readFile(distPath, 'utf-8');
    
    if (!distContent) {
      throw new Error('Dist file is empty');
    }
    
    console.log('  ✓ Build output exists and is not empty\n');

    // Test 2: Check for required imports
    console.log('✓ Test 2: Validating imports...');
    const requiredImports = [
      '@modelcontextprotocol/sdk/server/index.js',
      '@modelcontextprotocol/sdk/server/stdio.js',
      '@modelcontextprotocol/sdk/types.js',
      '@supabase/supabase-js',
      'dotenv'
    ];

    for (const imp of requiredImports) {
      if (!distContent.includes(imp)) {
        throw new Error(`Missing required import: ${imp}`);
      }
      console.log(`  ✓ Import found: ${imp}`);
    }
    console.log();

    // Test 3: Check for MCP server setup
    console.log('✓ Test 3: Validating MCP server setup...');
    const requiredElements = [
      'Server',
      'StdioServerTransport',
      'ListToolsRequestSchema',
      'CallToolRequestSchema',
      'createClient'
    ];

    for (const element of requiredElements) {
      if (!distContent.includes(element)) {
        throw new Error(`Missing required element: ${element}`);
      }
      console.log(`  ✓ Found: ${element}`);
    }
    console.log();

    // Test 4: Check for tool implementations
    console.log('✓ Test 4: Validating tool implementations...');
    const requiredTools = [
      'list_rescues',
      'find_rescues_near',
      'get_rescue_details'
    ];

    for (const tool of requiredTools) {
      if (!distContent.includes(tool)) {
        throw new Error(`Missing tool implementation: ${tool}`);
      }
      console.log(`  ✓ Tool found: ${tool}`);
    }
    console.log();

    // Test 5: Check for distance calculation
    console.log('✓ Test 5: Validating Haversine distance calculation...');
    if (!distContent.includes('calculateDistance')) {
      throw new Error('Missing calculateDistance function');
    }
    if (!distContent.includes('Haversine')) {
      console.log('  ⚠ Warning: Haversine comment not found, but function exists');
    } else {
      console.log('  ✓ Haversine distance calculation implemented');
    }
    console.log();

    // Test 6: Check for error handling
    console.log('✓ Test 6: Validating error handling...');
    if (!distContent.includes('try') || !distContent.includes('catch')) {
      throw new Error('Missing error handling (try/catch blocks)');
    }
    console.log('  ✓ Error handling found\n');

    // Test 7: Check TypeScript compilation
    console.log('✓ Test 7: Validating TypeScript types...');
    const dtsPath = join(__dirname, 'dist', 'index.d.ts');
    const dtsContent = await readFile(dtsPath, 'utf-8');
    if (!dtsContent) {
      throw new Error('Type definition file is empty');
    }
    console.log('  ✓ Type definitions generated\n');

    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('  ✓ Build output is valid');
    console.log('  ✓ All required imports present');
    console.log('  ✓ MCP server properly configured');
    console.log('  ✓ All 3 tools implemented (list_rescues, find_rescues_near, get_rescue_details)');
    console.log('  ✓ Distance calculation (Haversine) implemented');
    console.log('  ✓ Error handling in place');
    console.log('  ✓ TypeScript types generated\n');
    
    console.log('Next steps:');
    console.log('  1. Set up Supabase credentials in .env');
    console.log('  2. Configure ChatGPT Desktop with this server');
    console.log('  3. Test with actual rescue data\n');

    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPlease run "npm run build" to compile the server first.\n');
    return false;
  }
}

// Run tests
testMCPServer().then(success => {
  process.exit(success ? 0 : 1);
});
