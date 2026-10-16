/**
 * Tickerline — Loan Eligibility Criteria
 * Objective standards for US resident non-collateralized borrowing.
 */

import React from 'react';
import { Check, X, Shield, Users, Landmark, Wallet } from 'lucide-react';

export const EligibilitySection: React.FC<{ onApplyClick: () => void }> = ({ onApplyClick }) => {
  return (
    <section id="eligibility" className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Underwriting Benchmarks
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Who Is Eligible for Tickerline Credit?
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            We evaluate your ability to repay using verifiable income, bank aggregate data, and fair debt-to-income models rather than asking you to lock up cryptocurrency.
          </p>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Users className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-base font-semibold text-white">US Residency & Age 18+</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Must be a legal US Citizen or Permanent Resident residing in an authorized state, with a verified physical residential address (P.O. boxes are not permitted).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Landmark className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Verifiable Income ($3,000+/mo)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Minimum $36,000 annual gross income verifiable through automated payroll credentials, direct bank deposit aggregates, or recent W-2/1099 documentation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Shield className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Debt-to-Income (DTI) ≤ 45%</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Existing recurring debt obligations (rent/mortgage, auto loans, credit card minimums) plus proposed Tickerline loan installment should not exceed 45% of gross monthly income.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Wallet className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Self-Custody USDT Wallet</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Must provide a compatible non-custodial address (e.g., hardware wallet, MetaMask, Safe) on Polygon PoS, Arbitrum One, or Ethereum for direct smart contract transfer.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
              ✓
            </div>
            <h3 className="text-base font-semibold text-white">Fair Credit Bureau History</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              VantageScore or FICO score generally 620 or higher, with no active bankruptcies, severe recent charge-offs, or open federal tax liens.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Ready to Check?
              </div>
              <h3 className="text-base font-semibold text-white mt-1">Pre-Qualification</h3>
              <p className="text-xs text-slate-400 mt-1">
                Submitting a test application runs algorithmic assessment without impacting actual bureau scores in demo mode.
              </p>
            </div>
            <button
              onClick={onApplyClick}
              className="mt-4 w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors text-center"
            >
              Start Application
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
