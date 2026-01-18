/**
 * Test file for error handling utilities
 * Run with: npx tsx src/utils/errorHandling.test.ts
 */

import { getSupabaseErrorMessage } from './errorHandling';

interface TestCase {
  name: string;
  error: unknown;
  expectedIncludes: string[];
}

const testCases: TestCase[] = [
  {
    name: 'Authorization error',
    error: new Error('Unauthorized: Admin access required'),
    expectedIncludes: ['permission', 'Admin access'],
  },
  {
    name: 'Foreign key constraint - rescue',
    error: new Error('foreign key constraint "dogs_rescue_id_fkey" violates foreign key constraint'),
    expectedIncludes: ['rescue organization', 'invalid'],
  },
  {
    name: 'Not null constraint',
    error: new Error('null value in column "name" violates not-null constraint'),
    expectedIncludes: ['Name', 'required', 'cannot be empty'],
  },
  {
    name: 'Check constraint - age',
    error: new Error('new row for relation "dogs" violates check constraint "dogs_age_check"'),
    expectedIncludes: ['age', 'Puppy', 'Young', 'Adult', 'Senior'],
  },
  {
    name: 'Check constraint - size',
    error: new Error('new row for relation "dogs" violates check constraint "dogs_size_check"'),
    expectedIncludes: ['size', 'Small', 'Medium', 'Large'],
  },
  {
    name: 'Check constraint - gender',
    error: new Error('new row for relation "dogs" violates check constraint "dogs_gender_check"'),
    expectedIncludes: ['gender', 'Male', 'Female'],
  },
  {
    name: 'Check constraint - status',
    error: new Error('new row for relation "dogs" violates check constraint "dogs_status_check"'),
    expectedIncludes: ['status', 'valid'],
  },
  {
    name: 'Unique constraint',
    error: new Error('duplicate key value violates unique constraint'),
    expectedIncludes: ['already exists', 'duplicates'],
  },
  {
    name: 'Image upload error',
    error: new Error('Error uploading to storage'),
    expectedIncludes: ['upload image', 'different image'],
  },
  {
    name: 'Network error',
    error: new Error('Network connection timeout'),
    expectedIncludes: ['Network', 'connection'],
  },
  {
    name: 'Generic Error object',
    error: new Error('Some database error occurred'),
    expectedIncludes: ['Some database error'],
  },
  {
    name: 'Unknown error type',
    error: null,
    expectedIncludes: ['unknown error'],
  },
];

function runTests() {
  console.log('Running Error Handling Tests\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = getSupabaseErrorMessage(testCase.error);
    const allIncluded = testCase.expectedIncludes.every(expected =>
      result.toLowerCase().includes(expected.toLowerCase())
    );

    if (allIncluded) {
      console.log(`✓ Test ${index + 1} passed: ${testCase.name}`);
      console.log(`  Error message: "${result}"\n`);
      passed++;
    } else {
      console.log(`✗ Test ${index + 1} failed: ${testCase.name}`);
      console.log(`  Expected to include: ${testCase.expectedIncludes.join(', ')}`);
      console.log(`  Got: "${result}"\n`);
      failed++;
    }
  });

  console.log('='.repeat(60));
  console.log(`\nTest Results: ${passed} passed, ${failed} failed out of ${testCases.length} total`);
  
  if (failed === 0) {
    console.log('✓ All tests passed!');
  } else {
    console.log(`✗ ${failed} test(s) failed`);
  }
}

// Example usage demonstrating the improvement
function demonstrateImprovement() {
  console.log('\n\n' + '='.repeat(60));
  console.log('BEFORE vs AFTER Comparison');
  console.log('='.repeat(60) + '\n');

  const exampleErrors = [
    new Error('null value in column "name" violates not-null constraint'),
    new Error('foreign key constraint "dogs_rescue_id_fkey" violates foreign key constraint'),
    new Error('Unauthorized: Admin access required'),
  ];

  exampleErrors.forEach((error, index) => {
    console.log(`Example ${index + 1}:`);
    console.log(`  Original error: "${error.message}"`);
    console.log(`  BEFORE: "Failed to save dog"`);
    console.log(`  AFTER:  "${getSupabaseErrorMessage(error)}"`);
    console.log();
  });
}

// Run the tests
runTests();
demonstrateImprovement();
