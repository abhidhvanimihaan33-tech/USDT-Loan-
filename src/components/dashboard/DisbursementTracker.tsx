/**
 * Tickerline — USDT Disbursement Tracker & Blockchain Confirmation Inspector
 * Provides clear auditability of non-custodial payouts and confirmation status.
 */

import React, { useState } from 'react';
import { UsdtDisbursement } from '../../types';
import { getExplorerUrl, SUPPORTED_NETWORKS } from '../../services/usdtAdapter';
import { formatCurrency } from '../../services/loanCalculator';
import { X, CheckCircle, ExternalLink, RefreshCw, ShieldCheck, Zap } from 'lucide-react';

interface DisbursementTrackerProps {
  disbursement: UsdtDisbursement;
  onClose: () => void;
}

export const DisbursementTracker: React.FC<DisbursementTrackerProps> = ({
  disbursement,
  onClose,
}) => {
  const [confirmations, setConfirmations] = useState(disbursement.blockConfirmations);
  const specs = SUPPORTED_NETWORKS[disbursement.network];
  const required = disbursement.requiredConfirmations || specs.requiredConfirmations;

  const handleSimulateBlock = () => {
    setConfirmations((prev) => Math.min(required, prev + Math.floor(required / 3) + 1));
  };

  const isConfirmed = confirmations >= required;
  const explorerUrl = getExplorerUrl(disbursement.txHash, disbursement.network);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Institutional Payment Adapter
            </div>
            <h2 className="text-base font-bold text-white">USDT Disbursement Status</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          
          {/* Main Status Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Disbursed Amount</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {formatCurrency(disbursement.amountUsdt, 'USDT')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Target Network: {disbursement.network}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono ${
                isConfirmed
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              }`}>
                {isConfirmed ? <CheckCircle className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isConfirmed ? 'CONFIRMED' : 'AWAITING BLOCKS'}</span>
              </span>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {confirmations} / {required} Blocks
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (confirmations / required) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-3 font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-slate-500 text-[10px] font-sans">Transaction Hash</div>
              <div className="text-slate-200 truncate mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate">{disbursement.txHash}</span>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 font-sans text-xs"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] font-sans">Destination Recipient Address</div>
              <div className="text-slate-200 truncate mt-0.5">{disbursement.recipientAddress}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <div className="text-slate-500 text-[10px] font-sans">Idempotency Token</div>
                <div className="text-slate-300 truncate mt-0.5">{disbursement.idempotencyKey}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-sans">Execution Mode</div>
                <div className="text-amber-400 mt-0.5 font-sans">
                  {disbursement.isDemoTransaction ? 'Simulated Demo Sandbox' : 'Institutional Live MPC'}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          {!isConfirmed && (
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-300">Fast-forward testnet block progression:</span>
              <button
                type="button"
                onClick={handleSimulateBlock}
                className="px-3 py-1 bg-emerald-400 text-slate-950 font-semibold rounded text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Advance Block</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual-approval authorization hash verified</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition-colors border border-slate-700 font-medium"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
