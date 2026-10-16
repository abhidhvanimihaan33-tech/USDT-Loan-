/**
 * Tickerline — Public & Platform Footer
 * Clean, compliant statutory notices and navigation links.
 */

import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="text-white font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span>
              Tickerline
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institutional non-collateralized digital credit platform for eligible US residents. Evaluated on verified income and legal capacity to repay.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              NMLS ID #998240 (Demonstration Prototype)
            </div>
          </div>

          {/* Borrowing */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Borrowing
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors">
                  Loan Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rates')} className="hover:text-white transition-colors">
                  Rates & Fees
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('eligibility')} className="hover:text-white transition-colors">
                  Eligibility Criteria
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-white transition-colors">
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Legal & Compliance
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('state_availability')} className="hover:text-white transition-colors">
                  State Availability Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Truth in Lending Act (TILA)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Privacy Policy (GLBA)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Equal Credit Opportunity (ECOA)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Digital Asset Risk Disclosures
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate & Support */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Support & Administration
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('security')} className="hover:text-white transition-colors">
                  Security & MPC Custody
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white transition-colors text-indigo-400">
                  Compliance Admin Console
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Regulatory Disclaimer Text */}
        <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 leading-relaxed">
          <p>
            <strong>Important Consumer Notice:</strong> Tickerline is a financial software and credit technology platform. All loan products are subject to underwriting approval, verified income, debt-to-income benchmarks, and program availability in your state of residence. Interest rates and Annual Percentage Rates (APR) are fixed for the life of the loan and range from 8.99% to 29.99%.
          </p>
          <p>
            USDT is a digital stablecoin token. While designed for 1:1 parity with the US Dollar, digital assets are not insured by the Federal Deposit Insurance Corporation (FDIC) or the Securities Investor Protection Corporation (SIPC). Tickerline does not originate live loans or execute real financial transactions in this sandbox demonstration environment.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-between text-slate-400 text-xs gap-4">
            <div>© {new Date().getFullYear()} Tickerline Financial Technologies, Inc. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Equal Housing Lender</span>
              <span aria-hidden="true">·</span>
              <span>Fair Lending Compliant</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
