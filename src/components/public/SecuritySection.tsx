/**
 * Tickerline — Security, Cryptographic Custody & Privacy Architecture
 * Detailed institutional security breakdown adhering to Section 9 & 7 requirements.
 */

import React from 'react';
import { Lock, KeyRound, ShieldCheck, Database, EyeOff, Server } from 'lucide-react';
import securityImg from '../../assets/images/tickerline_security_compliance_1792138958072.jpg';

export const SecuritySection: React.FC = () => {
  return (
    <section id="security" className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header with visual split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Cybersecurity & Cryptographic Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Institutional digital asset custody. Zero exposure of private keys.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tickerline is engineered to institutional financial services standards. We separate hot distribution channels from multi-party computation (MPC) cold vaults, ensuring robust protection against key loss or single-point failure.
            </p>

            <div className="pt-4 space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-200">No Raw Banking Credentials:</strong> Income verification is conducted via tokenized open banking aggregators (Plaid/Finicity equivalent). Tickerline never receives or stores your online banking passwords.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-200">Dual Authorization Controls:</strong> Disbursing loans above $10,000 USDT or modifying underwriting policy thresholds strictly requires independent dual-administrator quorum approval.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EyeOff className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-200">PII Tokenization & Encryption:</strong> All Social Security numbers and government ID credentials are encrypted at rest with AES-256-GCM and masked across all internal consoles.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <img
                src={securityImg}
                alt="Cryptographic Vault & Institutional Security Infrastructure"
                className="w-full h-80 lg:h-96 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-xs">
                <div className="font-semibold text-slate-200">MPC Multi-Signature Protocol</div>
                <div className="text-slate-400 mt-0.5 text-[11px]">
                  Hardware-isolated keys with multi-party quorum computation. Zero client-side private key generation.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Structural Security Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-800">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <KeyRound className="w-5 h-5 text-emerald-400 mb-2.5" />
            <h4 className="text-sm font-semibold text-white">Non-Custodial Borrower Payouts</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              We disburse USDT to your self-sovereign wallet. Tickerline does not hold customer funds in custody after disbursement, eliminating platform bankruptcy rehypothecation risk.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <Database className="w-5 h-5 text-indigo-400 mb-2.5" />
            <h4 className="text-sm font-semibold text-white">Immutable Audit Journal</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Every loan application status transition, underwriter assessment, document signing event, and repayment transaction is timestamped and cryptographically indexed.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <Server className="w-5 h-5 text-cyan-400 mb-2.5" />
            <h4 className="text-sm font-semibold text-white">Network Idempotency</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Disbursement requests carry unique cryptographic idempotency tokens, mathematically preventing duplicate transactions even during network congestion or re-orgs.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
