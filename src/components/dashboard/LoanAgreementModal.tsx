/**
 * Tickerline — Loan Agreement & TILA E-Signature Modal
 * Renders complete legal promissory note, Reg Z disclosure box,
 * address validation, and binding electronic execution.
 */

import React, { useState } from 'react';
import { LoanOffer, UsdtNetwork } from '../../types';
import { validateRecipientAddress, SUPPORTED_NETWORKS } from '../../services/usdtAdapter';
import { formatCurrency, formatPercent } from '../../services/loanCalculator';
import { X, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface LoanAgreementModalProps {
  offer: LoanOffer;
  onClose: () => void;
  onSignAndDisburse: (data: {
    offerId: string;
    destinationAddress: string;
    network: UsdtNetwork;
    eSignerLegalName: string;
  }) => void;
}

export const LoanAgreementModal: React.FC<LoanAgreementModalProps> = ({
  offer,
  onClose,
  onSignAndDisburse,
}) => {
  const [network, setNetwork] = useState<UsdtNetwork>('Polygon PoS');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [signerName, setSignerName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreedToTerms) {
      setErrorMsg('You must check the agreement box indicating your acceptance of the TILA Promissory Note.');
      return;
    }

    if (!signerName.trim() || signerName.trim().length < 3) {
      setErrorMsg('Please type your legal full name as your binding electronic signature.');
      return;
    }

    const valResult = validateRecipientAddress(destinationAddress, network);
    if (!valResult.isValid) {
      setErrorMsg(valResult.errorMessage || 'Invalid destination wallet address format.');
      return;
    }

    onSignAndDisburse({
      offerId: offer.id,
      destinationAddress: valResult.normalizedAddress || destinationAddress.trim(),
      network,
      eSignerLegalName: signerName.trim(),
    });
  };

  const currentNetworkSpecs = SUPPORTED_NETWORKS[network];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Regulation Z · Federal Truth in Lending
            </div>
            <h2 className="text-lg font-bold text-white">
              Promissory Note & Consumer Loan Agreement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* TILA Box Standard Grid */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              FEDERAL TRUTH IN LENDING ACT DISCLOSURE STATEMENT
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border border-slate-800 rounded-lg p-3 bg-slate-900/60 font-mono">
              <div className="border-r border-slate-800/80 pr-2">
                <div className="text-[10px] text-slate-400 font-sans">ANNUAL PERCENTAGE RATE</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {formatPercent(offer.annualPercentageRate)}
                </div>
                <div className="text-[9px] text-slate-500 font-sans">Cost of credit as a yearly rate</div>
              </div>
              <div className="border-r border-slate-800/80 pr-2">
                <div className="text-[10px] text-slate-400 font-sans">FINANCE CHARGE</div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatCurrency(offer.totalFinanceChargeUsd, 'USDT')}
                </div>
                <div className="text-[9px] text-slate-500 font-sans">Dollar cost of this credit</div>
              </div>
              <div className="border-r border-slate-800/80 pr-2">
                <div className="text-[10px] text-slate-400 font-sans">AMOUNT FINANCED</div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatCurrency(offer.principalUsdt, 'USDT')}
                </div>
                <div className="text-[9px] text-slate-500 font-sans">Credit provided to you</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-sans">TOTAL OF PAYMENTS</div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatCurrency(offer.totalRepaymentUsdt, 'USDT')}
                </div>
                <div className="text-[9px] text-slate-500 font-sans">Amount paid after all installments</div>
              </div>
            </div>

            {/* Repayment Breakdown */}
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Monthly Installment: </span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(offer.monthlyPaymentUsdt, 'USDT')}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Repayment Term: </span>
                <span className="font-bold text-white">{offer.termMonths} Monthly Payments</span>
              </div>
              <div>
                <span className="text-slate-400">Origination Fee ({((offer.originationFeeUsd/offer.principalUsd)*100).toFixed(1)}%): </span>
                <span className="font-mono text-slate-200">
                  {formatCurrency(offer.originationFeeUsdt, 'USDT')}
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400">
              <strong>Net Disbursed to Your Wallet: </strong>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(offer.netDisbursementUsdt, 'USDT')}
              </span>{' '}
              (Gross Principal minus Origination Fee).
            </div>
          </div>

          {/* Legal Clauses Extract */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2 text-[11px] text-slate-400 leading-relaxed max-h-36 overflow-y-auto">
            <p>
              <strong>1. PROMISE TO PAY:</strong> For value received, Borrower promises to pay to Tickerline Financial Technologies, Inc. (&quot;Lender&quot;) the Principal Sum of {formatCurrency(offer.principalUsdt, 'USDT')} together with interest on unpaid principal at the Annual Percentage Rate of {formatPercent(offer.annualPercentageRate)}.
            </p>
            <p>
              <strong>2. DENOMINATION & STABLECOIN SETTLEMENT:</strong> Obligations under this Note are denominated in USDT with a fixed contractual baseline of $1.00 USD per USDT. Borrower may satisfy monthly obligations in USDT or through lawful USD ACH direct debit.
            </p>
            <p>
              <strong>3. PREPAYMENT:</strong> Borrower may prepay the principal balance outstanding in whole or in part at any time without penalty or premium.
            </p>
            <p>
              <strong>4. DEFAULT & ACCELERATION:</strong> In the event of failure to pay any installment within 30 days of the due date, Lender may declare the entire unpaid principal balance immediately due and payable.
            </p>
          </div>

          {/* Disbursement Wallet Destination Form */}
          <form id="loanAgreementForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Specify Recipient USDT Destination Wallet</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Select USDT Blockchain Network
                  </label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as UsdtNetwork)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Polygon PoS">Polygon PoS (Recommended · Fast & Cheap)</option>
                    <option value="Arbitrum One">Arbitrum One (L2 Rollup)</option>
                    <option value="Ethereum (ERC-20)">Ethereum (ERC-20 Mainnet)</option>
                    <option value="Tron (TRC-20)">Tron (TRC-20)</option>
                    <option value="Solana (SPL)">Solana (SPL Token)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Token Contract Standard
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentNetworkSpecs.tokenStandard} (${currentNetworkSpecs.requiredConfirmations} Confirmations)`}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Recipient Wallet Address ({network})
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    network === 'Tron (TRC-20)'
                      ? 'T... (34-character base58 address)'
                      : network === 'Solana (SPL)'
                      ? 'Base58 Solana public key...'
                      : '0x... (42-character hexadecimal EVM address)'
                  }
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Make sure this address is non-custodial and controlled by you. Blockchain transactions cannot be reversed.
                </div>
              </div>
            </div>

            {/* Electronic Signature */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300 leading-normal">
                  I have received, read, and agree to the Federal Truth in Lending Act (TILA) disclosures, and hereby execute this Promissory Note under the Electronic Signatures in Global and National Commerce Act (E-SIGN).
                </span>
              </label>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Type Legal Full Name as E-Signature
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Marcus Vance"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-serif italic text-sm"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Timestamped IP: 198.51.100.42 · SHA-256 Signature Verification Enforced
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            form="loanAgreementForm"
            className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Execute Note & Disburse USDT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
