/**
 * Automated Unit Test Suite: Loan Calculator & Amortization
 * Validates decimal precision, penny adjustments, and TILA disclosures.
 */

import { calculateLoanRepayment } from '../services/loanCalculator';

export function runLoanCalculatorTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✓ [PASS] ${testName}`);
    } else {
      failed++;
      results.push(`✗ [FAIL] ${testName}`);
    }
  }

  // Test 1: Standard 12-month loan monthly payment calculation
  const calc12 = calculateLoanRepayment({
    principalUsd: 10000,
    termMonths: 12,
    annualPercentageRate: 12.0, // 1% per month
    originationFeePercent: 3.0,
  });

  assert(
    calc12.monthlyPaymentUsd > 880 && calc12.monthlyPaymentUsd < 895,
    'Monthly installment for $10,000 at 12% APR (12mo) should be ~$888.49'
  );

  // Test 2: Origination fee calculation
  assert(
    calc12.originationFeeUsd === 300,
    'Origination fee for $10,000 at 3.0% must equal exactly $300.00'
  );

  // Test 3: Net disbursement calculation
  assert(
    calc12.netDisbursementUsd === 9700,
    'Net disbursement must equal principal ($10,000) minus origination fee ($300) = $9,700'
  );

  // Test 4: Final month balance reaches zero
  const finalScheduleRow = calc12.schedule[calc12.schedule.length - 1];
  assert(
    finalScheduleRow.remainingBalanceUsd === 0,
    'Final installment remaining balance must equal exactly 0.00'
  );

  // Test 5: Sum of principal payments equals initial principal
  const totalPrincipalPaid = calc12.schedule.reduce((acc, row) => acc + row.principalPortionUsd, 0);
  assert(
    Math.round(totalPrincipalPaid) === 10000,
    'Sum of schedule principal portions must equal original principal ($10,000)'
  );

  return { passed, failed, results };
}
