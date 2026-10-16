/**
 * Tickerline — Borrower Dashboard
 * Full non-collateralized loan lifecycle management: active balances,
 * repayments, offers, TILA contracts, and audit receipts.
 */

import React, { useState, useEffect } from 'react';
import { platformStore } from '../../services/store';
import { ActiveLoan, LoanOffer, UsdtDisbursement, RepaymentScheduleItem } from '../../types';
import { formatCurrency, formatPercent } from '../../services/loanCalculator';
import { LoanAgreementModal } from './LoanAgreementModal';
import { RepaymentModal } from './RepaymentModal';
import { DisbursementTracker } from './DisbursementTracker';
import { LoanApplicationWizard } from './LoanApplicationWizard';
import {
  Wallet,
  Clock,
  CheckCircle,
  FileText,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Download,
  AlertCircle,
  Lock,
  Layers,
  Receipt,
  MessageSquare,
} from 'lucide-react';

interface BorrowerDashboardProps {
  onStartNewApplication: () => void;
}

export const BorrowerDashboard: React.FC<BorrowerDashboardProps> = () => {
  const [platformState, setPlatformState] = useState(platformStore.getState());
  const [activeTab, setActiveTab] = useState<'loans' | 'offers' | 'history' | 'documents' | 'security' | 'support'>('loans');

  // Modals state
  const [selectedOfferForSigning, setSelectedOfferForSigning] = useState<LoanOffer | null>(null);
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<ActiveLoan | null>(null);
  const [selectedDisbursement, setSelectedDisbursement] = useState<UsdtDisbursement | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      setPlatformState(platformStore.getState());
    });
    return unsubscribe;
  }, []);

  const currentUser = platformState.currentUser;

  // Filter items for current user
  const userActiveLoans = platformState.activeLoans.filter((l) => l.userId === currentUser.id);
  const primaryLoan = userActiveLoans[0]; // main active loan
  const userOffers = platformState.offers.filter((o) => o.userId === currentUser.id && o.status === 'active');
  const userApplications = platformState.applications.filter((a) => a.userId === currentUser.id);
  const userRepayments = platformState.repaymentTransactions.filter((r) => r.userId === currentUser.id);
  const userDisbursements = platformState.disbursements.filter((d) => d.userId === currentUser.id);
  const userSchedule: RepaymentScheduleItem[] = primaryLoan
    ? platformState.repaymentSchedules[primaryLoan.id] || []
    : [];

  const handleSignAgreement = (data: {
    offerId: string;
    destinationAddress: string;
    network: any;
    eSignerLegalName: string;
  }) => {
    try {
      const result = platformStore.acceptOfferAndSignAgreement(data);
      setSelectedOfferForSigning(null);
      setSelectedDisbursement(result.disbursement);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Agreement execution failed');
    }
  };

  const handlePaymentSuccess = (receiptNumber: string) => {
    setSelectedLoanForRepayment(null);
    alert(`Repayment successfully processed! Receipt #${receiptNumber} logged.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      
      {/* Dashboard Header & Persona Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Borrower Account</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-400">{currentUser.residentialState} Resident</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Welcome back, {currentUser.firstName} {currentUser.lastName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsApplying(true)}
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for New Loan</span>
          </button>
        </div>
      </div>

      {/* Application Wizard Modal / Section */}
      {isApplying && (
        <div className="mb-10">
          <LoanApplicationWizard
            onCancel={() => setIsApplying(false)}
            onOfferReadyToSign={(offer) => {
              setIsApplying(false);
              setSelectedOfferForSigning(offer);
            }}
          />
        </div>
      )}

      {/* If Marcus Vance (or anyone) has an approved offer ready */}
      {userOffers.length > 0 && !isApplying && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" />
              <span>Loan Offer Approved &amp; Ready for Execution</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {formatCurrency(userOffers[0].principalUsdt, 'USDT')} Non-Collateralized Loan Approved
            </h2>
            <p className="text-xs text-slate-300">
              Fixed {formatPercent(userOffers[0].annualPercentageRate)} APR · {formatCurrency(userOffers[0].monthlyPaymentUsdt, 'USDT')} / month for {userOffers[0].termMonths} months · No prepayment penalties.
            </p>
          </div>

          <button
            onClick={() => setSelectedOfferForSigning(userOffers[0])}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Review &amp; E-Sign Promissory Note</span>
          </button>
        </div>
      )}

      {/* Primary Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'loans', label: 'Active Loan & Schedule', count: userActiveLoans.length },
          { id: 'offers', label: 'Applications & Decisions', count: userApplications.length },
          { id: 'history', label: 'Payment Receipts', count: userRepayments.length },
          { id: 'documents', label: 'Agreements & Disclosures', count: 3 },
          { id: 'security', label: 'Security & Custody', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-950 rounded text-slate-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Active Loan & Amortization Schedule */}
      {activeTab === 'loans' && (
        <div className="space-y-8">
          {primaryLoan ? (
            <>
              {/* Active Loan Hero Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                
                {/* Left side: Balance figures (7 cols) */}
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>Loan #{primaryLoan.loanNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-sans font-medium">Status: Active &amp; Good Standing</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1 tabular-nums">
                      {formatCurrency(primaryLoan.remainingBalanceUsdt, 'USDT')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Outstanding Principal Balance (Originated at {formatCurrency(primaryLoan.principalUsdt, 'USDT')})
                    </div>
                  </div>

                  {/* Amortization Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                      <span>Total Repaid: {formatCurrency(primaryLoan.totalPaidUsdt, 'USDT')}</span>
                      <span>
                        {Math.round((primaryLoan.totalPaidUsdt / (primaryLoan.principalUsdt * 1.1)) * 100)}% of Total
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-400"
                        style={{
                          width: `${Math.min(
                            100,
                            (primaryLoan.totalPaidUsdt / (primaryLoan.principalUsdt * 1.1)) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-slate-500 text-[11px]">Interest Rate (APR)</div>
                      <div className="font-mono font-semibold text-white mt-0.5">
                        {formatPercent(primaryLoan.annualPercentageRate)} Fixed
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[11px]">Disbursement Network</div>
                      <div className="font-mono text-emerald-400 mt-0.5">
                        {primaryLoan.disbursementNetwork}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[11px]">Maturity Date</div>
                      <div className="font-mono text-slate-200 mt-0.5">
                        {primaryLoan.maturityDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Next Payment Callout (5 cols) */}
                <div className="md:col-span-5 p-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                      <span className="text-slate-400">Next Installment Due</span>
                      <span className="font-mono text-amber-400 font-semibold">{primaryLoan.nextPaymentDueDate}</span>
                    </div>
                    
                    <div className="py-4">
                      <div className="text-xs text-slate-400">Scheduled Amount Due</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                        {formatCurrency(primaryLoan.nextPaymentAmountUsdt, 'USDT')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Grace Period: 15 Calendar Days · No Late Fee Assessed
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setSelectedLoanForRepayment(primaryLoan)}
                      className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Make Repayment</span>
                    </button>

                    {userDisbursements.length > 0 && (
                      <button
                        onClick={() => setSelectedDisbursement(userDisbursements[0])}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect USDT Disbursement Tx</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Repayment Amortization Schedule Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Promissory Note Repayment Schedule</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fixed monthly installments with explicit principal and interest itemization.
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {userSchedule.length} Scheduled Installments
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-3">Due Date</th>
                        <th className="py-3 px-3 text-right">Payment</th>
                        <th className="py-3 px-3 text-right">Principal</th>
                        <th className="py-3 px-3 text-right">Interest</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono tabular-nums text-slate-300">
                      {userSchedule.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 text-slate-500">{item.installmentNumber}</td>
                          <td className="py-3 px-3 text-slate-200">{item.dueDate}</td>
                          <td className="py-3 px-3 text-right font-bold text-white">
                            {formatCurrency(item.totalDueUsdt, 'USDT')}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300">
                            {item.principalAmountUsdt.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-400/90">
                            {item.interestAmountUsdt.toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            {item.status === 'paid' ? (
                              <span className="text-emerald-400 font-sans font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Paid</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-sans font-medium">
                                Scheduled
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-[11px] text-slate-500 truncate max-w-xs">
                            {item.transactionRef || 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Active Loan Balance</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You do not currently have an active non-collateralized USDT loan obligation. You may submit an application to verify eligibility.
              </p>
              <button
                onClick={() => setIsApplying(true)}
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <span>Start Loan Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Applications & Underwriting Decisions */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Application History &amp; Decisions</h3>
            <div className="space-y-4">
              {userApplications.map((app) => (
                <div key={app.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">Application #{app.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-200">{app.submittedAt.split('T')[0]}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[11px] font-medium uppercase font-mono ${
                      app.status === 'disbursed'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : app.status === 'approved'
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        : app.status === 'underwriting_review'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Requested Amount</span>
                      <span className="font-bold text-white">${app.requestedAmountUsd.toLocaleString()} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Term</span>
                      <span>{app.requestedTermMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Purpose</span>
                      <span className="truncate block font-sans">{app.loanPurpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Verified Income</span>
                      <span>${app.income.grossMonthlyIncomeUsd.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment History & Receipts */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Repayment History &amp; Receipts</h3>
          {userRepayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Receipt #</th>
                    <th className="py-3 px-3 text-right">Amount (USDT)</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Tx Hash</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono tabular-nums text-slate-300">
                  {userRepayments.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-slate-300">{rep.timestamp.split('T')[0]}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{rep.receiptNumber}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatCurrency(rep.amountUsdt, 'USDT')}
                      </td>
                      <td className="py-3 px-3 font-sans">{rep.method.replace('_', ' ')}</td>
                      <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{rep.txHash || 'ACH Direct'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => alert(`Simulated PDF receipt download for ${rep.receiptNumber}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-sans text-[11px] inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No repayment transactions on file yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Legal Documents Vault */}
      {activeTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Executed Loan Documents &amp; Regulatory Disclosures</h3>
          <div className="space-y-3">
            {[
              {
                title: 'Consumer Promissory Note & Security Agreement',
                date: 'Executed on Origination',
                desc: 'Binding electronic contract executed pursuant to the E-SIGN Act (15 U.S.C. § 7001).',
              },
              {
                title: 'Federal Truth in Lending Act (Regulation Z) Disclosure Schedule',
                date: 'Provided Prior to Consummation',
                desc: 'Detailed itemization of Amount Financed, Finance Charge, APR, and Payment Schedule.',
              },
              {
                title: 'Fair Credit Reporting Act (FCRA) Notice of Rights',
                date: 'Recorded',
                desc: 'Summary of your rights to credit bureau dispute procedures and score disclosures.',
              },
            ].map((doc, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-semibold text-white">{doc.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{doc.desc}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{doc.date}</div>
                </div>
                <button
                  onClick={() => alert(`Viewing copy of ${doc.title}`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  View Document
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Security & Custody */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs text-slate-300">
          <h3 className="text-base font-semibold text-white">Account Security &amp; Wallet Whitelisting</h3>
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Multi-Factor Authentication (MFA)</div>
                <div className="text-slate-400 text-[11px]">Time-based one-time password (TOTP) verification</div>
              </div>
              <span className="font-mono text-emerald-400 font-semibold">ENABLED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">FIDO2 / WebAuthn Passkey</div>
                <div className="text-slate-400 text-[11px]">Biometric touch or hardware security key authentication</div>
              </div>
              <span className="font-mono text-emerald-400 font-semibold">
                {currentUser.hasPasskey ? 'REGISTERED' : 'AVAILABLE'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-white">Non-Custodial Destination Policy</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Tickerline requires all loan disbursements to be sent to user-controlled self-custody wallets. Disbursements to high-risk mixing protocols or unsanctioned smart contracts are blocked automatically by our compliance screening adapter.
            </p>
          </div>
        </div>
      )}

      {/* Agreement Modal */}
      {selectedOfferForSigning && (
        <LoanAgreementModal
          offer={selectedOfferForSigning}
          onClose={() => setSelectedOfferForSigning(null)}
          onSignAndDisburse={handleSignAgreement}
        />
      )}

      {/* Repayment Modal */}
      {selectedLoanForRepayment && (
        <RepaymentModal
          loan={selectedLoanForRepayment}
          onClose={() => setSelectedLoanForRepayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Disbursement Tracker Modal */}
      {selectedDisbursement && (
        <DisbursementTracker
          disbursement={selectedDisbursement}
          onClose={() => setSelectedDisbursement(null)}
        />
      )}

    </div>
  );
};
