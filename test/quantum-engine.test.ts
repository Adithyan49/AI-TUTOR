/**
 * Automated Quantum Test Runner for Node/CI
 * Tests all 14 required capabilities from Section 23
 */

import { QuantumTestSuite } from '../src/engine/quantumTester';

async function runCliTests() {
  console.log('====================================================');
  console.log('AI QUANTUM TUTOR: AUTOMATED TEST SUITE (SECTION 23)');
  console.log('====================================================\n');

  const suite = await QuantumTestSuite.runAllTests();

  for (let i = 0; i < suite.results.length; i++) {
    const test = suite.results[i];
    const icon = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} [${test.category}] ${i + 1}. ${test.name} (${test.durationMs.toFixed(2)}ms)`);
    console.log(`   Assertion: ${test.assertion}`);
    if (test.details) {
      console.log(`   Details: ${test.details}`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Total Passed: ${suite.totalPassed} / ${suite.results.length}`);
  console.log(`Total Failed: ${suite.totalFailed}`);
  console.log(`Duration:     ${suite.totalDurationMs.toFixed(2)}ms`);
  console.log('----------------------------------------------------');

  if (suite.totalFailed > 0) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('All 14 quantum tests passed successfully!\n');
  }
}

runCliTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
