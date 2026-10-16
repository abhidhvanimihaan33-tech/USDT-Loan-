/**
 * Tickerline — Frequently Asked Questions Component
 * Thorough explanations of non-collateralized borrowing, stablecoin mechanics, and credit reporting.
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      category: 'Credit & Collateral',
      question: 'Why does Tickerline not require cryptocurrency collateral?',
      answer: 'Traditional DeFi platforms require you to lock up 150%–200% in volatile cryptocurrencies (like ETH or BTC), subjecting you to automated liquidations during market drawdowns. Tickerline operates as an unsecured digital lender: we evaluate your real-world ability to repay based on verified monthly income, debt-to-income (DTI) ratio, and credit history under US consumer lending laws.',
    },
    {
      category: 'Disbursement & Networks',
      question: 'How is USDT disbursed to my wallet?',
      answer: 'Once you review and sign your Truth in Lending Act (TILA) loan agreement, our automated custody adapter broadcasts a non-custodial smart contract transfer of USDT to your specified recipient address. You may choose between Polygon PoS, Arbitrum One, or Ethereum (ERC-20). We cover network gas costs for disbursements.',
    },
    {
      category: 'Repayments',
      question: 'How do monthly repayments work?',
      answer: 'Repayments are due on the same calendar day each month. You can make payments directly by sending USDT to the designated repayment vault from your connected wallet, or you can configure automated ACH direct debits from a standard US checking account at a guaranteed 1:1 USD exchange rate.',
    },
    {
      category: 'Stablecoin Economics',
      question: 'What happens if USDT fluctuates or de-pegs from the US Dollar?',
      answer: 'Under your credit agreement, the loan is principal-denominated in USD equivalents. The platform monitors market parity using Chainlink decentralized oracles. In the event of a material de-pegging event, borrowers may always satisfy their obligations in lawful US Dollars via standard ACH bank transfer to avoid market spread risk.',
    },
    {
      category: 'Credit Reporting',
      question: 'Does applying affect my credit score?',
      answer: 'Initial pre-qualification and calculator evaluations utilize soft inquiry models that have zero impact on your credit bureau score. When you choose to finalize an approved offer and sign your promissory note, a standard credit pull is conducted with your explicit consent under FCRA § 604.',
    },
    {
      category: 'Fees & Penalties',
      question: 'Can I pay off my loan early without penalties?',
      answer: 'Yes. Tickerline loans feature zero prepayment penalties. You may pay off any portion or the full remaining principal at any point during your term, immediately reducing future interest charges.',
    },
    {
      category: 'Licensing & Compliance',
      question: 'What is the regulatory status of the Tickerline platform?',
      answer: 'Tickerline is designed for operation in partnership with state-licensed consumer finance lenders and federally insured depository partners. We adhere to the Truth in Lending Act (Regulation Z), Equal Credit Opportunity Act (Regulation B), and applicable state usury regulations. The current environment is a fully functional demonstration and compliance prototype.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Clear, transparent answers about our non-collateralized stablecoin lending architecture.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-900 border border-slate-800 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-emerald-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                    <div className="text-[11px] text-emerald-400/80 uppercase font-mono tracking-wider mb-1.5">
                      {faq.category}
                    </div>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
