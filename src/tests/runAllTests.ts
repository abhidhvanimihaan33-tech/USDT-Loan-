/**
 * Tickerline — Automated Test Runner
 * Executes all financial calculation, underwriting, and crypto address validation suites.
 */

import { runLoanCalculatorTests } from './loanCalculator.test';
import { runUnderwritingTests } from './underwriting.test';
import { runUsdtAdapterTests } from './usdtAdapter.test';

console.log('=====================================================');
console.log('  TICKERLINE TEST SUITE: PRE-DEPLOYMENT VERIFICATION');
console.log('=====================================================\n');

let totalPassed = 0;
let totalFailed = 0;

console.log('--- 1. Loan Calculator & Amortization Precision ---');
const calcTests = runLoanCalculatorTests();
calcTests.results.forEach((r) => console.log(r));
totalPassed += calcTests.passed;
totalFailed += calcTests.failed;

console.log('\n--- 2. Underwriting, DTI, & Adverse Action Rules ---');
const uwTests = runUnderwritingTests();
uwTests.results.forEach((r) => console.log(r));
totalPassed += uwTests.passed;
totalFailed += uwTests.failed;

console.log('\n--- 3. Multi-Network USDT Recipient Address Validation ---');
const usdtTests = runUsdtAdapterTests();
usdtTests.results.forEach((r) => console.log(r));
totalPassed += usdtTests.passed;
totalFailed += usdtTests.failed;

console.log('\n=====================================================');
console.log(`  SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('=====================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully.\n');
  process.exit(0);
}
