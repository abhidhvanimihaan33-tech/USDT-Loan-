/**
 * Tickerline — Repayment Processing Modal
 * Handles monthly installments or early principal payoff via USDT smart vault transfer or ACH debit.
 */

import React, { useState } from 'react';
import { ActiveLoan, UsdtNetwork } from '../../types';
import { platformStore } from '../../services/store';
import { formatCurrency } from '../../services/loanCalculator';
import { X, CheckCircle, Landmark, Wallet, ArrowRight, Copy, Check } from 'lucide-react';

interface RepaymentModalProps {
  loan: ActiveLoan;
  onClose: () => void;
  onPaymentSuccess: (receiptNumber: string) => void;
}

export const RepaymentModal: React.FC<RepaymentModalProps> = ({
  loan,
  onClose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'USDT_TRANSFER' | 'ACH_DEBIT'>('USDT_TRANSFER');
  const [network, setNetwork] = useState<UsdtNetwork>(loan.disbursementNetwork || 'Polygon PoS');
  const [amountType, setAmountType] = useState<'scheduled' | 'payoff' | 'custom'>('scheduled');
  const [customAmount, setCustomAmount] = useState<number>(loan.nextPaymentAmountUsdt);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const effectiveAmount = 
    amountType === 'scheduled' ? loan.nextPaymentAmountUsdt :
    amountType === 'payoff' ? loan.remainingBalanceUsdt :
    customAmount;

  const VAULT_ADDRESSES: Record<string, string> = {
    'Polygon PoS': '0x71a2B8b832F249925E1d5757049D94553878b309',
    'Arbitrum One': '0x99a8f4c21e67049D94553878b30971a2B8b832F2',
    'Ethereum (ERC-20)': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'Tron (TRC-20)': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    'Solana (SPL)': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(VAULT_ADDRESSES[network] || VAULT_ADDRESSES['Polygon PoS']);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const tx = platformStore.makeRepayment({
          loanId: loan.id,
          amountUsdt: effectiveAmount,
          method,
          network: method === 'USDT_TRANSFER' ? network : undefined,
        });
        setIsProcessing(false);
        onPaymentSuccess(tx.receiptNumber);
      } catch (err) {
        setIsProcessing(false);
        alert(err instanceof Error ? err.message : 'Repayment error');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Loan #{loan.loanNumber}
            </div>
            <h2 className="text-lg font-bold text-white">Make a Loan Repayment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          
          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Repayment Amount
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAmountType('scheduled')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  amountType === 'scheduled'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] text-slate-400">Monthly Due</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                  {formatCurrency(loan.nextPaymentAmountUsdt, 'USDT')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAmountType('payoff')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  amountType === 'payoff'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] text-slate-400">Full Payoff</div>
                <div className="font-mono font-bold text-sm text-white mt-0.5">
                  {formatCurrency(loan.remainingBalanceUsdt, 'USDT')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAmountType('custom')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  amountType === 'custom'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] text-slate-400">Custom</div>
                <div className="font-mono font-bold text-sm text-white mt-0.5">Other Amount</div>
              </button>
            </div>

            {amountType === 'custom' && (
              <div className="mt-3">
                <input
                  type="number"
                  min="10"
                  max={loan.remainingBalanceUsdt}
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('USDT_TRANSFER')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  method === 'USDT_TRANSFER'
                    ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="font-semibold text-xs">USDT Blockchain Transfer</div>
                  <div className="text-[10px] text-slate-500">Non-custodial smart vault</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('ACH_DEBIT')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  method === 'ACH_DEBIT'
                    ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Landmark className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Bank ACH Debit</div>
                  <div className="text-[10px] text-slate-500">1:1 USD Par Equivalent</div>
                </div>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {method === 'USDT_TRANSFER' ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Repayment Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as UsdtNetwork)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Polygon PoS">Polygon PoS (~$0.02 gas)</option>
                  <option value="Arbitrum One">Arbitrum One (~$0.10 gas)</option>
                  <option value="Ethereum (ERC-20)">Ethereum ERC-20 Mainnet</option>
                  <option value="Tron (TRC-20)">Tron TRC-20</option>
                  <option value="Solana (SPL)">Solana SPL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Dedicated Repayment Smart Vault Address ({network})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={VAULT_ADDRESSES[network] || VAULT_ADDRESSES['Polygon PoS']}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal">
                In this demo environment, clicking &quot;Simulate USDT Repayment&quot; creates an instantaneous synthetic transaction, advances your amortization schedule, and logs a verified receipt.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Linked Account:</span>
                <span className="font-mono text-white">Chase Checking (•••• 4921)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Exchange Baseline:</span>
                <span className="font-mono text-emerald-400">1.0000 USD / USDT Par</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="font-medium text-slate-300">Total ACH Debit:</span>
                <span className="font-mono font-bold text-white">${effectiveAmount.toFixed(2)} USD</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcessPayment}
            className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>{isProcessing ? 'Processing Transaction...' : `Confirm & Pay ${formatCurrency(effectiveAmount, 'USDT')}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
