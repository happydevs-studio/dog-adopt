/**
 * Test file for Admin helpers - Dog image optional feature
 * Run with: npx tsx src/pages/Admin.helpers.test.ts
 */

import { validateDogForm, buildDogDataPayload } from './Admin.helpers';
import type { DogFormData } from './Admin.types';
import { DEFAULT_DOG_IMAGE } from '@/lib/constants';

interface TestCase {
  name: string;
  formData: DogFormData;
  imageUrl: string;
  expectValid: boolean;
  expectImageInPayload?: string;
}

const baseFormData: DogFormData = {
  name: 'Test Dog',
  breeds: ['Labrador'],
  age: 'Adult',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  rescueSinceDate: '',
  size: 'Medium',
  gender: 'Male',
  status: 'available',
  status_notes: '',
  location: 'London',
  rescue_id: 'test-rescue-id',
  image: '',
  profileUrl: '',
  description: 'A lovely dog',
  good_with_kids: false,
  good_with_dogs: false,
  good_with_cats: false,
};

const testCases: TestCase[] = [
  {
    name: 'Valid form with image URL',
    formData: { ...baseFormData, image: 'https://example.com/dog.jpg' },
    imageUrl: 'https://example.com/dog.jpg',
    expectValid: true,
    expectImageInPayload: 'https://example.com/dog.jpg',
  },
  {
    name: 'Valid form without image - should use default',
    formData: { ...baseFormData, image: '' },
    imageUrl: '',
    expectValid: true,
    expectImageInPayload: DEFAULT_DOG_IMAGE,
  },
  {
    name: 'Valid form with no imageUrl - should use default',
    formData: { ...baseFormData, image: '' },
    imageUrl: '',
    expectValid: true,
    expectImageInPayload: DEFAULT_DOG_IMAGE,
  },
  {
    name: 'Invalid form - missing name',
    formData: { ...baseFormData, name: '' },
    imageUrl: '',
    expectValid: false,
  },
  {
    name: 'Invalid form - missing description',
    formData: { ...baseFormData, description: '' },
    imageUrl: '',
    expectValid: false,
  },
];

function runTests() {
  console.log('Running Admin Helpers Tests - Dog Image Optional Feature\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    // Test validation
    const validation = validateDogForm(testCase.formData);
    const validationPassed = validation.isValid === testCase.expectValid;
    
    let payloadPassed = true;
    if (testCase.expectValid && testCase.expectImageInPayload !== undefined) {
      // Test payload building
      const payload = buildDogDataPayload(testCase.formData, testCase.imageUrl);
      payloadPassed = payload.image === testCase.expectImageInPayload;
      
      if (validationPassed && payloadPassed) {
        console.log(`✓ Test ${index + 1} passed: ${testCase.name}`);
        console.log(`  Expected valid: ${testCase.expectValid}, Got valid: ${validation.isValid}`);
        console.log(`  Expected image: "${testCase.expectImageInPayload}"`);
        console.log(`  Got image: "${payload.image}"\n`);
        passed++;
      } else {
        console.log(`✗ Test ${index + 1} failed: ${testCase.name}`);
        if (!validationPassed) {
          console.log(`  Validation: Expected valid=${testCase.expectValid}, Got valid=${validation.isValid}`);
          if (!validation.isValid) {
            console.log(`  Validation error: ${validation.error}`);
          }
        }
        if (!payloadPassed) {
          console.log(`  Payload: Expected image="${testCase.expectImageInPayload}", Got image="${payload.image}"`);
        }
        console.log();
        failed++;
      }
    } else {
      if (validationPassed) {
        console.log(`✓ Test ${index + 1} passed: ${testCase.name}`);
        console.log(`  Expected valid: ${testCase.expectValid}, Got valid: ${validation.isValid}`);
        if (!validation.isValid) {
          console.log(`  Error message: "${validation.error}"`);
        }
        console.log();
        passed++;
      } else {
        console.log(`✗ Test ${index + 1} failed: ${testCase.name}`);
        console.log(`  Expected valid: ${testCase.expectValid}, Got valid: ${validation.isValid}`);
        if (validation.error) {
          console.log(`  Validation error: ${validation.error}`);
        }
        console.log();
        failed++;
      }
    }
  });

  console.log('='.repeat(60));
  console.log(`\nTest Results: ${passed} passed, ${failed} failed out of ${testCases.length} total`);
  
  if (failed === 0) {
    console.log('✓ All tests passed!');
  } else {
    console.log(`✗ ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Run the tests
runTests();
