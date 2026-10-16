/**
 * Tickerline — Decimal-Safe Loan Calculator & Amortization Engine
 * Complies with Section 6 specifications:
 * Decimal-safe calculations, TILA disclosures, USD vs USDT breakdown,
 * and comprehensive payment schedule preview.
 */

import React, { useState, useMemo } from 'react';
import { calculateLoanRepayment, formatCurrency, formatPercent } from '../../services/loanCalculator';
import { platformStore } from '../../services/store';
import { Calculator, Calendar, DollarSign, Info, ArrowRight, Layers } from 'lucide-react';

interface CalculatorProps {
  onApplyWithTerms?: (amount: number, term: number) => void;
}

export const LoanCalculatorSection: React.FC<CalculatorProps> = ({ onApplyWithTerms }) => {
  const systemConfig = platformStore.getState().systemConfig;

  const [principal, setPrincipal] = useState<number>(10000);
  const [termMonths, setTermMonths] = useState<number>(12);
  const [tier, setTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier2');
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  const aprByTier = {
    tier1: { label: 'Tier 1 (Prime 740+)', apr: 9.99, feePercent: 3.0 },
    tier2: { label: 'Tier 2 (Good 680-739)', apr: 14.50, feePercent: 3.5 },
    tier3: { label: 'Tier 3 (Fair 620-679)', apr: 21.90, feePercent: 4.5 },
  };

  const currentTierInfo = aprByTier[tier];

  const calcResult = useMemo(() => {
    return calculateLoanRepayment({
      principalUsd: principal,
      termMonths,
      annualPercentageRate: currentTierInfo.apr,
      originationFeePercent: currentTierInfo.feePercent,
      usdtRate: systemConfig.usdtUsdExchangeRate,
    });
  }, [principal, termMonths, currentTierInfo, systemConfig.usdtUsdExchangeRate]);

  return (
    <section id="calculator" className="py-16 bg-slate-900/50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Financial Transparency
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Interactive Loan & Repayment Calculator
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Estimate your monthly fixed installments, origination fee, and total borrowing costs. Actual offers depend on state licensing, verified income, and underwriting assessment.
          </p>
        </div>

        {/* 2-Column Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800">
            
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Requested Loan Amount</label>
                <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  {formatCurrency(principal, 'USD')}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="35000"
                step="500"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono tabular-nums">
                <span>$1,000</span>
                <span>$10,000</span>
                <span>$20,000</span>
                <span>$35,000</span>
              </div>
            </div>

            {/* Term Selector */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Repayment Term
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 12, 24, 36].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setTermMonths(months)}
                    className={`py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                      termMonths === months
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {months} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Credit Tier */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Credit Rating Estimate (For illustrative APR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['tier1', 'tier2', 'tier3'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      tier === t
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-medium">{aprByTier[t].label}</div>
                    <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                      {formatPercent(aprByTier[t].apr)} APR
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Peg & Oracle Source Disclosure */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>Oracle Peg Source & Exchange Reference</span>
              </div>
              <p>
                1 USDT = ${systemConfig.usdtUsdExchangeRate.toFixed(4)} USD · Chainlink Decentralized Aggregator feed updated at {systemConfig.oracleLastUpdated}. All USDT loan principals are distributed at a strictly verified 1:1 USD-equivalent baseline.
              </p>
            </div>

          </div>

          {/* Results Column: Truth in Lending Summary (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Illustrative TILA Box
                </div>
                <div className="text-xs text-emerald-400 font-mono font-medium">
                  Reg Z Truth in Lending
                </div>
              </div>

              {/* Monthly Repayment Hero Figure */}
              <div className="py-6 border-b border-slate-800">
                <div className="text-xs text-slate-400">Estimated Monthly Repayment</div>
                <div className="text-4xl font-extrabold font-mono text-white mt-1 tabular-nums">
                  {formatCurrency(calcResult.monthlyPaymentUsdt, 'USDT')}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Equivalent to {formatCurrency(calcResult.monthlyPaymentUsd, 'USD')} / month
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Annual Percentage Rate (APR)</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {formatPercent(calcResult.annualPercentageRate)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Origination Fee ({currentTierInfo.feePercent}%)</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(calcResult.originationFeeUsdt, 'USDT')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Net Disbursed to Wallet</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {formatCurrency(calcResult.netDisbursementUsdt, 'USDT')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Finance Charge</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(calcResult.totalFinanceChargeUsdt, 'USDT')}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="font-medium text-slate-300">Total Amount Repaid ({termMonths} mos)</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(calcResult.totalRepaymentUsdt, 'USDT')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3">
              <button
                type="button"
                onClick={() => onApplyWithTerms?.(principal, termMonths)}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
              >
                <span>Proceed to Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showAmortization ? 'Hide' : 'View'} Amortization Schedule</span>
              </button>
            </div>

          </div>

        </div>

        {/* Collapsible Amortization Table */}
        {showAmortization && (
          <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Full Repayment Amortization Schedule</h3>
              <div className="text-xs text-slate-400 font-mono">
                {termMonths} Installments · Fixed Monthly Rate
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Estimated Due Date</th>
                    <th className="py-3 px-3 text-right">Payment (USDT)</th>
                    <th className="py-3 px-3 text-right">Principal</th>
                    <th className="py-3 px-3 text-right">Interest</th>
                    <th className="py-3 px-3 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                  {calcResult.schedule.map((row) => (
                    <tr key={row.installmentNumber} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-500">{row.installmentNumber}</td>
                      <td className="py-2.5 px-3 text-slate-300">{row.dueDate}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                        {row.paymentUsdt.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {row.principalPortionUsd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-400/90">
                        {row.interestPortionUsd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {row.remainingBalanceUsdt.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
