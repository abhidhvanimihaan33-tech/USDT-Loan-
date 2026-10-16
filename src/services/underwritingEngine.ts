/**
 * Tickerline — Underwriting & Credit Capacity Assessment Engine
 * Enforces Fair Lending (ECOA/Reg B), FCRA Adverse Action generation,
 * and state-specific statutory caps.
 */

import { IncomeInformation, UnderwritingAssessment, StateRegulatoryRule, LoanOffer } from '../types';
import { calculateLoanRepayment } from './loanCalculator';

export interface UnderwritingInput {
  applicationId: string;
  userId: string;
  requestedAmountUsd: number;
  requestedTermMonths: number;
  income: IncomeInformation;
  stateCode: string;
  stateRules?: StateRegulatoryRule[];
  applicantCreditTier?: 'Tier 1 (Excellent)' | 'Tier 2 (Good)' | 'Tier 3 (Fair)' | 'Tier 4 (High Risk)';
  estimatedCreditScore?: number;
}

export interface UnderwritingResult {
  assessment: UnderwritingAssessment;
  offer?: LoanOffer;
  adverseActionNotice?: {
    noticeDate: string;
    applicantId: string;
    denialReasons: string[];
    creditScoreInfo: {
      score: number;
      source: string;
      datePulled: string;
    };
    fcraDisclosures: string;
    equalCreditOpportunityActNotice: string;
  };
}

// Configurable underwriting thresholds
const CONFIG = {
  MIN_MONTHLY_INCOME_USD: 3000,
  MAX_ACCEPTABLE_DTI_PERCENT: 45.0,
  MANUAL_REVIEW_DTI_CEILING: 52.0,
  MAX_LOAN_AMOUNT_BASE: 35000,
  MIN_LOAN_AMOUNT: 1000,
  BASE_ORIGINATION_FEE_PERCENT: 3.5,
  POLICY_VERSION: 'TL-UW-2026.4',
};

// Credit Tier APR Matrix based on risk profile
const APR_TIERS = {
  'Tier 1 (Excellent)': { apr: 9.99, nominalRate: 8.95, feeDiscount: 0.5 },
  'Tier 2 (Good)': { apr: 14.50, nominalRate: 13.10, feeDiscount: 0.0 },
  'Tier 3 (Fair)': { apr: 21.90, nominalRate: 19.80, feeDiscount: -0.5 },
  'Tier 4 (High Risk)': { apr: 29.90, nominalRate: 26.50, feeDiscount: -1.0 },
};

export function evaluateLoanApplication(input: UnderwritingInput): UnderwritingResult {
  const {
    applicationId,
    userId,
    requestedAmountUsd,
    requestedTermMonths,
    income,
    stateCode,
    applicantCreditTier = 'Tier 2 (Good)',
    estimatedCreditScore = 710,
  } = input;

  const reasons: string[] = [];
  const adverseCodes: string[] = [];
  let isDeclined = false;
  let isManualReview = false;

  // 1. Jurisdictional / State Law Compliance Check
  const stateRule = input.stateRules?.find(s => s.stateCode === stateCode);
  if (stateRule) {
    if (stateRule.status === 'prohibited') {
      isDeclined = true;
      reasons.push(`State of residence (${stateCode}) does not permit digital unsecured credit under current statutory usury limits.`);
      adverseCodes.push('PROHIBITED_STATE_JURISDICTION');
    } else if (stateRule.status === 'in_review') {
      isManualReview = true;
      reasons.push(`State of residence (${stateCode}) requires secondary regulatory review.`);
    } else if (requestedAmountUsd > stateRule.maxLoanAmountUsd) {
      isDeclined = true;
      reasons.push(`Requested amount ($${requestedAmountUsd}) exceeds maximum legal limit for ${stateCode} ($${stateRule.maxLoanAmountUsd}).`);
      adverseCodes.push('EXCEEDS_STATE_MAX_LOAN_CAP');
    }
  }

  // 2. Minimum Income Verification
  const verifiedIncome = income.verifiedMonthlyIncomeUsd || income.grossMonthlyIncomeUsd;
  if (verifiedIncome < CONFIG.MIN_MONTHLY_INCOME_USD) {
    isDeclined = true;
    reasons.push(`Verified monthly income ($${verifiedIncome.toLocaleString()}) falls below the minimum institutional underwriting threshold ($${CONFIG.MIN_MONTHLY_INCOME_USD.toLocaleString()}).`);
    adverseCodes.push('INSUFFICIENT_VERIFIED_INCOME');
  }

  // 3. Estimate monthly repayment at the tier APR
  const tierSettings = APR_TIERS[applicantCreditTier] || APR_TIERS['Tier 2 (Good)'];
  let effectiveApr = tierSettings.apr;

  // Enforce state APR cap if present
  if (stateRule && effectiveApr > stateRule.maxAprCapPercent) {
    effectiveApr = stateRule.maxAprCapPercent;
  }

  const initialCalc = calculateLoanRepayment({
    principalUsd: requestedAmountUsd,
    termMonths: requestedTermMonths,
    annualPercentageRate: effectiveApr,
  });

  // 4. Calculate Documented Debt-To-Income (DTI) Ratio
  const totalMonthlyDebtObligations = 
    income.monthlyHousingExpenseUsd + 
    income.otherMonthlyDebtPaymentsUsd + 
    initialCalc.monthlyPaymentUsd;

  const calculatedDtiPercent = Math.round((totalMonthlyDebtObligations / verifiedIncome) * 1000) / 10;
  const disposableMonthlyIncome = Math.round((verifiedIncome - totalMonthlyDebtObligations) * 100) / 100;

  if (calculatedDtiPercent > CONFIG.MANUAL_REVIEW_DTI_CEILING) {
    isDeclined = true;
    reasons.push(`Calculated Debt-to-Income ratio (${calculatedDtiPercent}%) exceeds maximum permissible underwriting tolerance (${CONFIG.MAX_ACCEPTABLE_DTI_PERCENT}%).`);
    adverseCodes.push('EXCESSIVE_DEBT_TO_INCOME_RATIO');
  } else if (calculatedDtiPercent > CONFIG.MAX_ACCEPTABLE_DTI_PERCENT) {
    isManualReview = true;
    reasons.push(`Calculated DTI (${calculatedDtiPercent}%) is between 45% and 52%, requiring loan officer manual review.`);
  }

  // 5. Credit Profile Assessment
  if (applicantCreditTier === 'Tier 4 (High Risk)' || estimatedCreditScore < 600) {
    isDeclined = true;
    reasons.push('Credit bureau score and delinquency history do not meet prime credit threshold.');
    adverseCodes.push('CREDIT_BUREAU_SCORE_BELOW_STANDARD');
  }

  // Decision compilation
  let finalDecision: 'APPROVED' | 'MANUAL_REVIEW' | 'DECLINED' = 'APPROVED';
  if (isDeclined) {
    finalDecision = 'DECLINED';
  } else if (isManualReview) {
    finalDecision = 'MANUAL_REVIEW';
  } else {
    reasons.push('Applicant meets all verified income, capacity-to-repay, and debt-to-income benchmarks.');
  }

  const assessment: UnderwritingAssessment = {
    id: `uw-asm-${Date.now().toString(36)}`,
    applicationId,
    createdAt: new Date().toISOString(),
    calculatedDtiPercent,
    disposableMonthlyIncomeUsd: disposableMonthlyIncome,
    creditTier: applicantCreditTier,
    estimatedCreditScore,
    decision: finalDecision,
    decisionReasons: reasons,
    adverseActionCodes: adverseCodes.length > 0 ? adverseCodes : undefined,
    policyVersion: CONFIG.POLICY_VERSION,
  };

  // If approved or manual review, generate Loan Offer structure
  let offer: LoanOffer | undefined;
  if (finalDecision === 'APPROVED' || finalDecision === 'MANUAL_REVIEW') {
    const originationFeePercent = Math.max(1.0, CONFIG.BASE_ORIGINATION_FEE_PERCENT - tierSettings.feeDiscount);
    const finalCalc = calculateLoanRepayment({
      principalUsd: requestedAmountUsd,
      termMonths: requestedTermMonths,
      annualPercentageRate: effectiveApr,
      originationFeePercent,
    });

    const firstDueDate = new Date();
    firstDueDate.setDate(firstDueDate.getDate() + 30);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day offer window

    offer = {
      id: `off-${Date.now().toString(36)}`,
      applicationId,
      userId,
      principalUsd: finalCalc.principalUsd,
      principalUsdt: finalCalc.principalUsdt,
      termMonths: finalCalc.termMonths,
      annualPercentageRate: finalCalc.annualPercentageRate,
      nominalInterestRate: tierSettings.nominalRate,
      originationFeeUsd: finalCalc.originationFeeUsd,
      originationFeeUsdt: finalCalc.originationFeeUsdt,
      netDisbursementUsdt: finalCalc.netDisbursementUsdt,
      monthlyPaymentUsd: finalCalc.monthlyPaymentUsd,
      monthlyPaymentUsdt: finalCalc.monthlyPaymentUsdt,
      totalRepaymentUsd: finalCalc.totalRepaymentUsd,
      totalRepaymentUsdt: finalCalc.totalRepaymentUsdt,
      totalFinanceChargeUsd: finalCalc.totalFinanceChargeUsd,
      paymentFrequency: 'monthly',
      firstPaymentDueDate: firstDueDate.toISOString().split('T')[0],
      expiresAt: expiresAt.toISOString(),
      status: 'active',
    };
  }

  // Generate Adverse Action Notice if declined
  let adverseActionNotice;
  if (finalDecision === 'DECLINED') {
    adverseActionNotice = {
      noticeDate: new Date().toISOString().split('T')[0],
      applicantId: userId,
      denialReasons: reasons,
      creditScoreInfo: {
        score: estimatedCreditScore,
        source: 'Experian Consumer VantageScore 4.0 / Verified Financial Bureau',
        datePulled: new Date().toISOString().split('T')[0],
      },
      fcraDisclosures: 'Under the Fair Credit Reporting Act (15 U.S.C. § 1681m), you have the right to obtain a free copy of your credit report from the reporting agency within 60 days of receiving this notice and to dispute the accuracy or completeness of any information provided.',
      equalCreditOpportunityActNotice: 'The federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants on the basis of race, color, religion, national origin, sex, marital status, or age (provided the applicant has the capacity to contract).',
    };
  }

  return { assessment, offer, adverseActionNotice };
}
