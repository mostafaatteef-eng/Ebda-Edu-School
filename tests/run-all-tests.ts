/**
 * Master Test Runner: EBDA EDU Test Suite
 * Executes Unit, Integration, and End-to-End test suites in sequence.
 */

import { execSync } from 'child_process';

console.log('===============================================================');
console.log('       EBDA EDU — MASTER TEST SUITE EXECUTION                 ');
console.log('===============================================================');

const testSuites = [
  { name: 'Unit Tests (Business Rules & 60-Min Duration)', script: 'tests/unit/business-rules.test.ts' },
  { name: 'Integration Tests (Timetable Conflict Engine)', script: 'tests/integration/timetable-conflict.test.ts' },
  { name: 'End-to-End Workflow (Full 18-Step Lifecycle)', script: 'tests/e2e/e2e-workflow.test.ts' },
];

let allPassed = true;

for (const suite of testSuites) {
  try {
    console.log(`\n▶️ Executing: ${suite.name}...`);
    execSync(`tsx ${suite.script}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Test Suite Failed: ${suite.name}`);
    allPassed = false;
    break;
  }
}

console.log('===============================================================');
if (allPassed) {
  console.log('✨ ALL TEST SUITES PASSED SUCCESSFULLY! System is 100% Verified.');
  console.log('===============================================================');
  process.exit(0);
} else {
  console.error('💥 ONE OR MORE TEST SUITES FAILED.');
  console.log('===============================================================');
  process.exit(1);
}
