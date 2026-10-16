/**
 * Tickerline — Public Hero Component
 * Domain-native fintech presentation with verified claims,
 * high-fidelity visual asset integration, and zero-pill discipline.
 */

import React from 'react';
import { ArrowRight, ShieldCheck, Scale, FileText, Zap } from 'lucide-react';
import heroImg from '../../assets/images/tickerline_hero_fintech_1792138959442.jpg';

interface HeroProps {
  onStartApplication: () => void;
  onOpenCalculator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartApplication, onOpenCalculator }) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Positioning & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              US Consumer Digital Asset Lending
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight max-w-2xl">
              USDT loans based on verified income. Zero crypto collateral.
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Tickerline bridges traditional US consumer credit underwriting with stablecoin liquidity. Apply for fixed-term, non-collateralized USDT loans evaluated strictly on verified income, debt capacity, and regulatory guidelines.
            </p>

            {/* Primary Action Zone */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartApplication}
                className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-950/40"
              >
                <span>Apply for a Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCalculator}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
              >
                Open Loan Calculator
              </button>
            </div>

            {/* Unboxed Metadata with Typographic Separators */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-medium text-slate-300">Amounts $1,000 – $35,000</span>
              <span aria-hidden="true">·</span>
              <span>Terms 6 – 36 Months</span>
              <span aria-hidden="true">·</span>
              <span>Fixed APR 8.99% – 29.99%</span>
              <span aria-hidden="true">·</span>
              <span>No Prepayment Penalty</span>
            </div>
          </div>

          {/* Right Column: Institutional Facility Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <img
                src={heroImg}
                alt="Tickerline Institutional Technology & Underwriting Headquarters"
                className="w-full h-80 lg:h-96 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs">
                <div className="text-slate-400">Institutional Credit Architecture</div>
                <div className="text-slate-200 font-medium mt-0.5">
                  Decoupling stablecoin borrowing from crypto collateral liquidation risk.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Quantitative Rigor Pillars Below Hero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-slate-800">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-3" />
            <div className="text-sm font-semibold text-white">No Crypto Liquidation Risk</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Unlike DeFi lending, your position cannot be liquidated by market volatility. Credit is evaluated on your verified US earnings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Scale className="w-5 h-5 text-indigo-400 mb-3" />
            <div className="text-sm font-semibold text-white">Truth in Lending Act (TILA)</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Transparent Regulation Z disclosure schedules. All interest rates, APRs, origination fees, and payment dates are disclosed prior to signing.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Zap className="w-5 h-5 text-cyan-400 mb-3" />
            <div className="text-sm font-semibold text-white">Direct Non-Custodial Payout</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Approved loans disburse USDT directly to your self-custody wallet across Polygon PoS, Arbitrum One, or Ethereum.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <FileText className="w-5 h-5 text-amber-400 mb-3" />
            <div className="text-sm font-semibold text-white">Fair Lending & ECOA Compliance</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Standardized objective underwriting rules with automated Adverse Action notices adhering to Equal Credit Opportunity Act requirements.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
