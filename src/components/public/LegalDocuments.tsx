/**
 * Tickerline — Comprehensive Legal, Compliance & Risk Disclosures
 * Covers TILA/Reg Z, FCRA, ECOA, Privacy Policy, Terms of Service, and Digital Asset Risks.
 */

import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertTriangle, Scale, Lock } from 'lucide-react';

export const LegalDocumentsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tila' | 'risk' | 'privacy' | 'terms' | 'responsible'>('tila');

  return (
    <section id="legal" className="py-20 bg-slate-900/40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Compliance & Consumer Protection
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Regulatory Disclosures & Legal Framework
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Read our statutory disclosures governing digital credit origination, data privacy, and digital asset risks.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
          {[
            { id: 'tila', label: 'TILA & Reg Z Disclosures', icon: Scale },
            { id: 'risk', label: 'Digital Asset Risk Disclosures', icon: AlertTriangle },
            { id: 'privacy', label: 'Privacy Policy (GLBA)', icon: Lock },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'responsible', label: 'Responsible Lending & MLA', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="mt-6 bg-slate-900 p-8 rounded-2xl border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-4">
          
          {activeTab === 'tila' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Truth in Lending Act (Regulation Z) Disclosures</h3>
              <p>
                In accordance with 12 CFR Part 1026, creditors originating consumer credit in the United States must provide clear, conspicuous disclosures of key credit terms prior to consummation of the credit agreement.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center">
                <div className="p-3 border-r border-slate-800/80 last:border-none">
                  <div className="text-[11px] text-slate-400 font-sans">ANNUAL PERCENTAGE RATE</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">8.99% – 29.99%</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Cost of your credit as a yearly rate</div>
                </div>
                <div className="p-3 border-r border-slate-800/80 last:border-none">
                  <div className="text-[11px] text-slate-400 font-sans">FINANCE CHARGE</div>
                  <div className="text-xl font-bold text-white mt-1">Disclosed Prior</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Dollar amount the credit will cost you</div>
                </div>
                <div className="p-3 border-r border-slate-800/80 last:border-none">
                  <div className="text-[11px] text-slate-400 font-sans">AMOUNT FINANCED</div>
                  <div className="text-xl font-bold text-white mt-1">$1,000 – $35,000</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Amount of credit provided to you</div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] text-slate-400 font-sans">TOTAL OF PAYMENTS</div>
                  <div className="text-xl font-bold text-white mt-1">Principal + Interest</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Amount paid after all scheduled payments</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-slate-400">
                <p>
                  <strong>Prepayment:</strong> If you pay off your loan early, you will NOT have to pay any prepayment penalty or fee. Interest is calculated on an amortized basis and ceases to accrue on any satisfied principal.
                </p>
                <p>
                  <strong>Late Charges:</strong> If a payment is not received within 15 calendar days of its scheduled due date, you may be assessed a late fee equal to the lesser of $15.00 or 5.0% of the delinquent payment installment, subject to applicable state law.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Digital Asset & Stablecoin Risk Disclosures</h3>
              <p>
                Borrowing funds denominated in digital stablecoins (USDT) carries unique characteristics distinct from conventional fiat currency disbursements. Borrowers should review the following critical disclosures carefully:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>USD Parity Risk:</strong> Tether USD (USDT) is a digital token intended to maintain a 1:1 value parity with the US Dollar. However, stablecoins are not legal tender, are not backed by the full faith and credit of the United States Government, and are not FDIC or SIPC insured. If USDT trades below $1.00 on secondary markets, your contracted repayment obligation remains pegged to the contracted legal USD par value.
                </li>
                <li>
                  <strong>Blockchain Network Irreversibility:</strong> Transactions executed on public blockchain networks (Ethereum, Polygon, Arbitrum, Tron, Solana) are irreversible. Providing an inaccurate, incompatible, or non-custodial wallet address may result in total loss of disbursed digital assets. Tickerline cannot reverse or recover funds transmitted to an erroneous user-provided destination.
                </li>
                <li>
                  <strong>Tax Treatment:</strong> The Internal Revenue Service (IRS) treats cryptocurrency transactions as property for federal tax purposes (IRS Notice 2014-21). Loan disbursements generally do not constitute taxable gross income; however, subsequent disposition, exchange, or conversion of USDT into other assets or fiat currency may generate taxable capital gains or losses.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Gramm-Leach-Bliley Act (GLBA) Privacy Policy</h3>
              <p>
                Tickerline is committed to protecting your nonpublic personal information (NPI). We maintain administrative, physical, and technical safeguards that comply with federal standards to protect consumer financial records.
              </p>
              <div className="space-y-2 text-slate-300">
                <p>
                  <strong>Information We Collect:</strong> We collect information you provide on applications (name, address, date of birth, income), transaction history with us, and consumer report information from credit bureaus with your express authorization.
                </p>
                <p>
                  <strong>Zero Sale of Personal Data:</strong> Tickerline does NOT sell or rent your personal information to third-party marketers or advertisers under any circumstances.
                </p>
                <p>
                  <strong>Tokenized Verification:</strong> Bank account and payroll credentials are processed exclusively via tokenized, encrypted interfaces. We never store your online banking credentials in plaintext.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Platform Terms of Service & Electronic Contracting</h3>
              <p>
                By using Tickerline, you consent to enter into electronic transactions under the federal Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.) and the Uniform Electronic Transactions Act (UETA).
              </p>
              <p>
                You agree that all disclosures, agreements, and notices provided electronically satisfy any legal requirement that such communications be in writing. You must maintain an active email address and hardware capable of viewing PDF documents.
              </p>
            </div>
          )}

          {activeTab === 'responsible' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Responsible Borrowing & Military Lending Act (MLA) Statement</h3>
              <p>
                Tickerline strictly adheres to responsible consumer lending standards, the Equal Credit Opportunity Act, and the Military Lending Act (10 U.S.C. § 987).
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2">
                <div className="font-semibold text-emerald-400">Military Lending Act Protections:</div>
                <p>
                  Federal law provides important protections to active duty service members and their dependents. The Military Annual Percentage Rate (MAPR) for any credit extended to a covered borrower cannot exceed 36%. Tickerline verifies MLA eligibility through the Defense Manpower Data Center (DMDC) database.
                </p>
              </div>
              <p>
                If you are experiencing financial hardship, please contact our Support Center to discuss temporary payment deferral or hardship mitigation options before incurring delinquency.
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
