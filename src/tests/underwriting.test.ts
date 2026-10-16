/**
 * Automated Unit Test Suite: Underwriting Engine & Adverse Action Generation
 * Validates Fair Lending, DTI ceilings, minimum income, and state usury logic.
 */

import { evaluateLoanApplication } from '../services/underwritingEngine';
import { INITIAL_STATE_RULES } from '../services/store';

export function runUnderwritingTests(): { passed: number; failed: number; results: string[] } {
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

  // Test 1: Prime borrower should be APPROVED
  const primeResult = evaluateLoanApplication({
    applicationId: 'test-app-01',
    userId: 'usr-test-01',
    requestedAmountUsd: 10000,
    requestedTermMonths: 12,
    income: {
      employmentStatus: 'full_time',
      employerName: 'Alphabet Inc.',
      jobTitle: 'Software Engineer',
      yearsEmployed: 4,
      grossMonthlyIncomeUsd: 12000,
      monthlyHousingExpenseUsd: 2200,
      otherMonthlyDebtPaymentsUsd: 300,
      incomeVerificationMethod: 'instant_payroll_token',
      verifiedMonthlyIncomeUsd: 12000,
    },
    stateCode: 'CA',
    stateRules: INITIAL_STATE_RULES,
    applicantCreditTier: 'Tier 1 (Excellent)',
    estimatedCreditScore: 780,
  });

  assert(
    primeResult.assessment.decision === 'APPROVED',
    'Prime borrower with 28% DTI and $12k/mo verified income must be APPROVED'
  );
  assert(
    primeResult.offer !== undefined,
    'Approved application must generate a valid Loan Offer structure'
  );

  // Test 2: Borrower with insufficient income (<$3,000) must be DECLINED
  const lowIncomeResult = evaluateLoanApplication({
    applicationId: 'test-app-02',
    userId: 'usr-test-02',
    requestedAmountUsd: 5000,
    requestedTermMonths: 12,
    income: {
      employmentStatus: 'part_time',
      employerName: 'Retail Shop',
      jobTitle: 'Clerk',
      yearsEmployed: 1,
      grossMonthlyIncomeUsd: 2100, // Below $3,000 threshold
      monthlyHousingExpenseUsd: 800,
      otherMonthlyDebtPaymentsUsd: 200,
      incomeVerificationMethod: 'paystub_upload',
      verifiedMonthlyIncomeUsd: 2100,
    },
    stateCode: 'TX',
    stateRules: INITIAL_STATE_RULES,
  });

  assert(
    lowIncomeResult.assessment.decision === 'DECLINED',
    'Borrower with $2,100/mo income must be DECLINED for insufficient income'
  );
  assert(
    lowIncomeResult.adverseActionNotice !== undefined,
    'Declined application must produce an FCRA Adverse Action Notice'
  );

  // Test 3: Borrower in prohibited jurisdiction (e.g. New York under current rate model)
  const prohibitedStateResult = evaluateLoanApplication({
    applicationId: 'test-app-03',
    userId: 'usr-test-03',
    requestedAmountUsd: 10000,
    requestedTermMonths: 12,
    income: {
      employmentStatus: 'full_time',
      employerName: 'Finance Corp',
      jobTitle: 'Analyst',
      yearsEmployed: 3,
      grossMonthlyIncomeUsd: 9000,
      monthlyHousingExpenseUsd: 2000,
      otherMonthlyDebtPaymentsUsd: 400,
      incomeVerificationMethod: 'instant_payroll_token',
      verifiedMonthlyIncomeUsd: 9000,
    },
    stateCode: 'NY', // Prohibited state
    stateRules: INITIAL_STATE_RULES,
  });

  assert(
    prohibitedStateResult.assessment.decision === 'DECLINED',
    'Applicant in prohibited state jurisdiction (NY) must be declined'
  );

  return { passed, failed, results };
}
