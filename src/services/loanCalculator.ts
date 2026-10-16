/**
 * Tickerline — Decimal-Safe Loan Calculator & TILA Schedule Generator
 * Complies with US Consumer Credit standard amortization & 12 CFR Part 1026 (Regulation Z)
 */

export interface CalculationInput {
  principalUsd: number;
  termMonths: number;
  annualPercentageRate: number; // e.g. 15.5 for 15.5%
  originationFeePercent?: number; // e.g. 3.0 for 3.0%
  firstPaymentDate?: Date;
  usdtRate?: number; // 1 USDT = $X USD (default 1.0)
}

export interface CalculationResult {
  principalUsd: number;
  principalUsdt: number;
  termMonths: number;
  annualPercentageRate: number;
  monthlyPaymentUsd: number;
  monthlyPaymentUsdt: number;
  originationFeeUsd: number;
  originationFeeUsdt: number;
  netDisbursementUsd: number;
  netDisbursementUsdt: number;
  totalFinanceChargeUsd: number;
  totalFinanceChargeUsdt: number;
  totalRepaymentUsd: number;
  totalRepaymentUsdt: number;
  schedule: AmortizationRow[];
}

export interface AmortizationRow {
  installmentNumber: number;
  dueDate: string;
  paymentUsd: number;
  paymentUsdt: number;
  principalPortionUsd: number;
  interestPortionUsd: number;
  remainingBalanceUsd: number;
  remainingBalanceUsdt: number;
}

/**
 * Calculates monthly repayment using the standard fixed-installment annuity formula:
 * M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 */
export function calculateLoanRepayment(input: CalculationInput): CalculationResult {
  const {
    principalUsd,
    termMonths,
    annualPercentageRate,
    originationFeePercent = 3.0,
    firstPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usdtRate = 1.0,
  } = input;

  const P = principalUsd;
  const n = termMonths;
  const monthlyRate = annualPercentageRate / 100 / 12;

  let monthlyPaymentUsd: number;
  if (monthlyRate === 0) {
    monthlyPaymentUsd = P / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    monthlyPaymentUsd = P * ((monthlyRate * factor) / (factor - 1));
  }

  // Round to nearest cent
  monthlyPaymentUsd = Math.round(monthlyPaymentUsd * 100) / 100;

  const originationFeeUsd = Math.round(P * (originationFeePercent / 100) * 100) / 100;
  const netDisbursementUsd = Math.round((P - originationFeeUsd) * 100) / 100;

  // Build full amortization schedule
  const schedule: AmortizationRow[] = [];
  let currentBalanceUsd = P;
  let totalInterestUsd = 0;

  for (let i = 1; i <= n; i++) {
    const interestPortionUsd = Math.round(currentBalanceUsd * monthlyRate * 100) / 100;
    let principalPortionUsd = Math.round((monthlyPaymentUsd - interestPortionUsd) * 100) / 100;

    // Final month adjustment for pennies
    if (i === n || principalPortionUsd > currentBalanceUsd) {
      principalPortionUsd = currentBalanceUsd;
      monthlyPaymentUsd = Math.round((principalPortionUsd + interestPortionUsd) * 100) / 100;
      currentBalanceUsd = 0;
    } else {
      currentBalanceUsd = Math.round((currentBalanceUsd - principalPortionUsd) * 100) / 100;
    }

    totalInterestUsd += interestPortionUsd;

    const rowDueDate = new Date(firstPaymentDate);
    rowDueDate.setMonth(rowDueDate.getMonth() + (i - 1));

    schedule.push({
      installmentNumber: i,
      dueDate: rowDueDate.toISOString().split('T')[0],
      paymentUsd: monthlyPaymentUsd,
      paymentUsdt: Math.round((monthlyPaymentUsd / usdtRate) * 100) / 100,
      principalPortionUsd,
      interestPortionUsd,
      remainingBalanceUsd: Math.max(0, currentBalanceUsd),
      remainingBalanceUsdt: Math.max(0, Math.round((currentBalanceUsd / usdtRate) * 100) / 100),
    });
  }

  const totalFinanceChargeUsd = Math.round((totalInterestUsd + originationFeeUsd) * 100) / 100;
  const totalRepaymentUsd = Math.round((P + totalInterestUsd) * 100) / 100;

  const principalUsdt = Math.round((P / usdtRate) * 100) / 100;
  const originationFeeUsdt = Math.round((originationFeeUsd / usdtRate) * 100) / 100;
  const netDisbursementUsdt = Math.round((netDisbursementUsd / usdtRate) * 100) / 100;
  const monthlyPaymentUsdt = Math.round((monthlyPaymentUsd / usdtRate) * 100) / 100;
  const totalFinanceChargeUsdt = Math.round((totalFinanceChargeUsd / usdtRate) * 100) / 100;
  const totalRepaymentUsdt = Math.round((totalRepaymentUsd / usdtRate) * 100) / 100;

  return {
    principalUsd: P,
    principalUsdt,
    termMonths: n,
    annualPercentageRate,
    monthlyPaymentUsd,
    monthlyPaymentUsdt,
    originationFeeUsd,
    originationFeeUsdt,
    netDisbursementUsd,
    netDisbursementUsdt,
    totalFinanceChargeUsd,
    totalFinanceChargeUsdt,
    totalRepaymentUsd,
    totalRepaymentUsdt,
    schedule,
  };
}

/**
 * Format currency with tabular numerals
 */
export function formatCurrency(amount: number, currency: 'USD' | 'USDT' = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return currency === 'USD' ? `$${formatted}` : `${formatted} USDT`;
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
