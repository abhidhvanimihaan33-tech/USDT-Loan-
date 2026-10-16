/**
 * Tickerline — How It Works Component
 * Transparent 4-step consumer workflow from verification to stablecoin disbursement.
 */

import React from 'react';
import { UserCheck, Activity, FileCheck, ArrowDownCircle, ShieldCheck } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Identity Verification & Capacity Profile',
      desc: 'Verify US citizenship or permanent residency, residential address, and date of birth (18+). We use tokenized verification to safeguard your sensitive PII without storing raw credentials.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Algorithmic & Documented Underwriting',
      desc: 'Our underwriting engine verifies your monthly income and current obligations to assess a documented Debt-to-Income (DTI) ratio. No cryptocurrency collateral is required or pledged.',
      icon: Activity,
    },
    {
      num: '03',
      title: 'Truth in Lending Disclosure & E-Sign Note',
      desc: 'Eligible borrowers receive a formal loan offer with transparent TILA Regulation Z disclosures, fixed APR, payment dates, and clear fee itemization. E-sign your promissory note securely.',
      icon: FileCheck,
    },
    {
      num: '04',
      title: 'Direct Non-Custodial USDT Disbursement',
      desc: 'Following legal execution, the approved USDT amount is transferred directly to your verified self-custody wallet across Polygon PoS, Arbitrum One, or Ethereum.',
      icon: ArrowDownCircle,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Operational Blueprint
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            How Non-Collateralized Digital Lending Operates
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Unlike DeFi protocols that require 150%+ crypto collateral and risk liquidation during market dips, Tickerline evaluates your real-world ability to repay under established US consumer lending frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xl font-bold text-slate-600">{s.num}</span>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
                  <span>Audited Compliance Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
