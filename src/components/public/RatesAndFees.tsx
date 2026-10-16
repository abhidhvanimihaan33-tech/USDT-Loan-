/**
 * Tickerline — Rates & Fees Transparency
 * Clear disclosures of APRs, origination fees, late policies, and blockchain costs.
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Percent, ShieldCheck } from 'lucide-react';

export const RatesAndFeesSection: React.FC = () => {
  return (
    <section id="rates" className="py-20 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Fee Schedule & Cost Transparency
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Simple, Fixed Rates. Zero Hidden Add-Ons.
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Every cost associated with your credit agreement is disclosed upfront in your Truth in Lending disclosure. We believe in clear, predictable loan pricing.
          </p>
        </div>

        {/* Pricing Tiers Table */}
        <div className="mt-12 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">Underwriting Credit Tiers & APR Ranges</h3>
            <p className="text-xs text-slate-400 mt-1">
              Fixed Annual Percentage Rates determined by capacity to repay, income verification, and bureau history.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
                  <th className="py-3 px-4">Credit Tier</th>
                  <th className="py-3 px-4">Indicative VantageScore</th>
                  <th className="py-3 px-4 text-right">Fixed APR Range</th>
                  <th className="py-3 px-4 text-right">Origination Fee</th>
                  <th className="py-3 px-4">Available Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono tabular-nums text-slate-300">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-sans font-semibold text-white">Tier 1 (Prime)</td>
                  <td className="py-4 px-4 text-slate-400">740+</td>
                  <td className="py-4 px-4 text-right text-emerald-400 font-bold">8.99% – 12.99%</td>
                  <td className="py-4 px-4 text-right text-slate-300">1.0% – 3.0%</td>
                  <td className="py-4 px-4 font-sans text-slate-400">12, 24, 36 Months</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-sans font-semibold text-white">Tier 2 (Good)</td>
                  <td className="py-4 px-4 text-slate-400">680 – 739</td>
                  <td className="py-4 px-4 text-right text-emerald-400 font-bold">13.00% – 18.99%</td>
                  <td className="py-4 px-4 text-right text-slate-300">3.0% – 4.5%</td>
                  <td className="py-4 px-4 font-sans text-slate-400">6, 12, 24, 36 Months</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-sans font-semibold text-white">Tier 3 (Fair)</td>
                  <td className="py-4 px-4 text-slate-400">620 – 679</td>
                  <td className="py-4 px-4 text-right text-emerald-400 font-bold">19.00% – 29.99%</td>
                  <td className="py-4 px-4 text-right text-slate-300">4.0% – 5.0%</td>
                  <td className="py-4 px-4 font-sans text-slate-400">6, 12, 24 Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Detailed Fee Policies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero Prepayment Penalties</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay off your loan balance at any time, in full or in part, with no early repayment penalty. Any excess payment is applied directly to reducing your principal balance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2">
              <Percent className="w-4 h-4" />
              <span>15-Day Late Grace Period</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We provide a full 15 calendar day grace period following the scheduled monthly due date before any late fee is assessed (maximum of $15 or 5% of unpaid portion, subject to state law).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparent Network Gas Fees</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Blockchain gas costs for disbursement are absorbed by Tickerline. When you make repayments in USDT, you only pay the native blockchain miner fee (e.g. ~$0.02 on Polygon PoS).
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
