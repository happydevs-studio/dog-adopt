#!/usr/bin/env node

/**
 * Manual verification script for breed size mapping
 * Run with: node scripts/verify-breed-sizes.js
 */

import { getBreedSize, getDefaultSizeForBreeds, BREED_SIZE_MAP } from '../src/data/breedSizes.ts';

console.log('🐕 Testing Breed Size Mapping\n');

// Test cases from the issue
const testCases = [
  { breed: 'Jack Russell Terrier', expected: 'Small' },
  { breed: 'Golden Retriever', expected: 'Large' },
  { breed: 'Border Collie', expected: 'Medium' },
  { breed: 'Great Dane', expected: 'Large' },
  { breed: 'Chihuahua', expected: 'Small' },
  { breed: 'Labrador Retriever', expected: 'Large' },
  { breed: 'Beagle', expected: 'Medium' },
  { breed: 'Yorkshire Terrier', expected: 'Small' },
];

console.log('✓ Single Breed Tests:');
let passed = 0;
let failed = 0;

testCases.forEach(({ breed, expected }) => {
  const result = getBreedSize(breed);
  const status = result === expected ? '✓' : '✗';
  if (result === expected) {
    passed++;
    console.log(`  ${status} ${breed} → ${result}`);
  } else {
    failed++;
    console.log(`  ${status} ${breed} → ${result} (expected ${expected})`);
  }
});

console.log('\n✓ Multiple Breed Tests:');
const multiBreedTests = [
  { breeds: ['Jack Russell Terrier', 'Chihuahua'], expected: 'Small' },
  { breeds: ['Golden Retriever', 'Labrador Retriever'], expected: 'Large' },
  { breeds: ['Border Collie', 'Beagle'], expected: 'Medium' },
];

multiBreedTests.forEach(({ breeds, expected }) => {
  const result = getDefaultSizeForBreeds(breeds);
  const status = result === expected ? '✓' : '✗';
  if (result === expected) {
    passed++;
    console.log(`  ${status} ${breeds.join(' + ')} → ${result}`);
  } else {
    failed++;
    console.log(`  ${status} ${breeds.join(' + ')} → ${result} (expected ${expected})`);
  }
});

console.log('\n✓ Edge Cases:');
const edgeCases = [
  { test: 'Empty array', result: getDefaultSizeForBreeds([]), expected: 'Medium' },
  { test: 'Unknown breed', result: getBreedSize('Unknown Breed'), expected: 'Medium' },
  { test: 'Case insensitive', result: getBreedSize('JACK RUSSELL TERRIER'), expected: 'Small' },
];

edgeCases.forEach(({ test, result, expected }) => {
  const status = result === expected ? '✓' : '✗';
  if (result === expected) {
    passed++;
    console.log(`  ${status} ${test} → ${result}`);
  } else {
    failed++;
    console.log(`  ${status} ${test} → ${result} (expected ${expected})`);
  }
});

// Summary
console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
console.log(`📦 Total breeds in mapping: ${Object.keys(BREED_SIZE_MAP).length}`);

if (failed === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
}
