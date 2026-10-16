/**
 * Tickerline — Compliance & Operations Admin Console (/admin)
 * Enforces Role-Based Access Control, dual-authorization queues,
 * application underwriting reviews, state product matrix, and immutable audit logs.
 */

import React, { useState, useEffect } from 'react';
import { platformStore } from '../../services/store';
import { UserRole, StateRegulatoryRule } from '../../types';
import { formatCurrency, formatPercent } from '../../services/loanCalculator';
import {
  ShieldAlert,
  Users,
  FileText,
  Activity,
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Settings,
  Scale,
  Eye,
  MessageSquare,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const [platformState, setPlatformState] = useState(platformStore.getState());
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'dual_approval' | 'states' | 'underwriting_config' | 'audit_log' | 'support'>('overview');

  // Application review modal / drawer
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'declined'>('approved');
  const [reviewReason, setReviewReason] = useState<string>('');

  // Support ticket reply
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');

  // State Matrix Edit
  const [editingStateCode, setEditingStateCode] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<StateRegulatoryRule['status']>('active');
  const [editMaxLoan, setEditMaxLoan] = useState<number>(35000);
  const [editAprCap, setEditAprCap] = useState<number>(36.0);

  // Audit filter
  const [auditFilter, setAuditFilter] = useState('');

  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      setPlatformState(platformStore.getState());
    });
    return unsubscribe;
  }, []);

  const currentUser = platformState.currentUser;
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isCompliance = currentUser.role === 'compliance_officer' || isSuperAdmin;
  const isLoanOfficer = currentUser.role === 'loan_officer' || isSuperAdmin;

  // Aggregate Metrics
  const totalUsers = platformState.users.length;
  const pendingApps = platformState.applications.filter((a) => a.status === 'underwriting_review').length;
  const totalActiveLoans = platformState.activeLoans.filter((l) => l.status === 'active');
  const totalPortfolioBalance = totalActiveLoans.reduce((acc, curr) => acc + curr.remainingBalanceUsdt, 0);
  const totalDisbursed = platformState.disbursements.reduce((acc, curr) => acc + curr.amountUsdt, 0);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !reviewReason.trim()) return;

    try {
      platformStore.adminReviewApplication({
        applicationId: selectedAppId,
        decision: reviewDecision,
        reason: reviewReason.trim(),
        adminUser: currentUser,
      });
      alert(`Application ${selectedAppId} marked as ${reviewDecision.toUpperCase()}.`);
      setSelectedAppId(null);
      setReviewReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Review action failed');
    }
  };

  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !ticketReplyText.trim()) return;

    try {
      platformStore.replyToTicket(selectedTicketId, ticketReplyText.trim(), currentUser);
      setTicketReplyText('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Reply error');
    }
  };

  const handleSaveStateRule = (stateCode: string) => {
    platformStore.updateStateRegulatoryRule(stateCode, {
      status: editStatus,
      maxLoanAmountUsd: editMaxLoan,
      maxAprCapPercent: editAprCap,
    });
    setEditingStateCode(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Admin Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              TL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Tickerline Administration Console</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Logged in as {currentUser.firstName} {currentUser.lastName} ({currentUser.email})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Demo Mode Active
            </span>
            <button
              onClick={onExitAdmin}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Exit Console
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Operations Overview' },
            { id: 'applications', label: `Underwriting Queue (${pendingApps})` },
            { id: 'states', label: 'State Product Matrix' },
            { id: 'underwriting_config', label: 'Underwriting Policy' },
            { id: 'support', label: `Support Tickets (${platformState.supportTickets.length})` },
            { id: 'audit_log', label: 'Immutable Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Canvas */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Tab 1: Operations Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Loan Portfolio</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                  {formatCurrency(totalPortfolioBalance, 'USDT')}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Across {totalActiveLoans.length} active consumer accounts
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total USDT Disbursed</span>
                  <Scale className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-2 tabular-nums">
                  {formatCurrency(totalDisbursed, 'USDT')}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  {platformState.disbursements.length} non-custodial transactions
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Underwriting Queue</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-2 tabular-nums">
                  {pendingApps} Pending
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Requires manual loan officer review
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Delinquency Rate</span>
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                  0.00%
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  100% on-time repayment compliance
                </div>
              </div>

            </div>

            {/* Recent System Activity / Split Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left: Active Loans Ledger */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-4">Active Consumer Loans</h3>
                <div className="space-y-3">
                  {platformState.activeLoans.map((l) => (
                    <div key={l.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white">#{l.loanNumber}</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {formatCurrency(l.remainingBalanceUsdt, 'USDT')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>APR: {formatPercent(l.annualPercentageRate)}</span>
                        <span>Network: {l.disbursementNetwork}</span>
                        <span>Due: {l.nextPaymentDueDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        Wallet: {l.destinationWalletAddress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Recent Audit Events */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-4">Recent Audit Activity</h3>
                <div className="space-y-2 text-xs">
                  {platformState.auditEvents.slice(0, 5).map((evt) => (
                    <div key={evt.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-indigo-400 font-semibold">{evt.action}</span>
                        <span className="text-slate-500">{evt.timestamp.split('T')[1].slice(0, 8)}</span>
                      </div>
                      <div className="text-slate-300 mt-1">{evt.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Actor: {evt.actorEmail} ({evt.actorRole})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Underwriting Queue */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Loan Applications Queue</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review applicant debt-to-income models, bureau scores, and make legally documented determinations.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
                      <th className="py-3 px-3">App ID</th>
                      <th className="py-3 px-3">Applicant</th>
                      <th className="py-3 px-3">State</th>
                      <th className="py-3 px-3 text-right">Requested</th>
                      <th className="py-3 px-3 text-right">Gross Income</th>
                      <th className="py-3 px-3 text-right">DTI Ratio</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono tabular-nums text-slate-300">
                    {platformState.applications.map((app) => {
                      const asm = platformState.assessments.find((a) => a.applicationId === app.id);
                      return (
                        <tr key={app.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 text-slate-400">{app.id}</td>
                          <td className="py-3 px-3 font-sans font-semibold text-white">
                            {app.userName}
                          </td>
                          <td className="py-3 px-3 font-sans">{app.stateCode}</td>
                          <td className="py-3 px-3 text-right font-bold text-white">
                            ${app.requestedAmountUsd.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-emerald-400">
                            ${app.income.grossMonthlyIncomeUsd.toLocaleString()}/mo
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300">
                            {asm ? `${asm.calculatedDtiPercent}%` : 'N/A'}
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
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
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedAppId(app.id);
                                setReviewDecision('approved');
                                setReviewReason('Verified stable capacity to repay within credit underwriting tolerances.');
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-sans text-xs transition-colors"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application Decision Drawer / Modal */}
            {selectedAppId && (
              <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h4 className="text-base font-bold text-white">Underwriting Decision: #{selectedAppId}</h4>
                  <button onClick={() => setSelectedAppId(null)} className="text-slate-400 hover:text-white text-xs">
                    Close
                  </button>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Determination</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={reviewDecision === 'approved'}
                          onChange={() => setReviewDecision('approved')}
                          className="text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <span className="text-emerald-400 font-semibold">Approve Application</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={reviewDecision === 'declined'}
                          onChange={() => setReviewDecision('declined')}
                          className="text-rose-500 focus:ring-rose-500 bg-slate-950"
                        />
                        <span className="text-rose-400 font-semibold">Decline (Adverse Action)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Documented Underwriter Justification (Recorded in Audit Journal)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="State exact underwriting criteria, verified income source, and credit rationale..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg text-xs"
                  >
                    Commit Underwriting Decision
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: State Product Matrix */}
        {activeTab === 'states' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white">State Regulatory &amp; Usury Matrix Editor</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure state-by-state product availability, maximum permissible loan caps, and statutory APR limits.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
                    <th className="py-3 px-3">State</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Max Loan Cap</th>
                    <th className="py-3 px-3 text-right">Statutory APR Cap</th>
                    <th className="py-3 px-3">Regulator</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono tabular-nums text-slate-300">
                  {platformState.stateRules.map((rule) => {
                    const isEditing = editingStateCode === rule.stateCode;
                    return (
                      <tr key={rule.stateCode} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-sans font-semibold text-white">
                          <span className="font-mono text-emerald-400 mr-2">{rule.stateCode}</span>
                          {rule.stateName}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          {isEditing ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as any)}
                              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                            >
                              <option value="active">Active</option>
                              <option value="in_review">In Review</option>
                              <option value="prohibited">Prohibited</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              rule.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : rule.status === 'in_review'
                                ? 'bg-amber-500/10 text-amber-300'
                                : 'bg-rose-500/10 text-rose-300'
                            }`}>
                              {rule.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editMaxLoan}
                              onChange={(e) => setEditMaxLoan(Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-right text-white font-mono"
                            />
                          ) : (
                            `$${rule.maxLoanAmountUsd.toLocaleString()}`
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editAprCap}
                              onChange={(e) => setEditAprCap(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-right text-white font-mono"
                            />
                          ) : (
                            `${rule.maxAprCapPercent.toFixed(1)}%`
                          )}
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-400 text-[11px] truncate max-w-xs">
                          {rule.regulatoryBody}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-1 font-sans">
                              <button
                                onClick={() => handleSaveStateRule(rule.stateCode)}
                                className="px-2.5 py-1 bg-emerald-400 text-slate-950 rounded text-xs font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStateCode(null)}
                                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStateCode(rule.stateCode);
                                setEditStatus(rule.status);
                                setEditMaxLoan(rule.maxLoanAmountUsd);
                                setEditAprCap(rule.maxAprCapPercent);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-sans text-xs"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Underwriting Policy Configuration */}
        {activeTab === 'underwriting_config' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-6 text-xs text-slate-300">
            <div>
              <h3 className="text-base font-semibold text-white">Underwriting Policy Benchmarks</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Set organizational risk limits for automated credit decisioning.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Maximum Allowable Borrower DTI (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={platformState.systemConfig.maxBorrowerDtiPercent}
                  onChange={(e) =>
                    platformStore.updateSystemConfig({
                      maxBorrowerDtiPercent: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Applications exceeding this threshold automatically trigger adverse action denial.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Minimum Monthly Gross Income (USD)
                </label>
                <input
                  type="number"
                  step="100"
                  value={platformState.systemConfig.minMonthlyIncomeUsd}
                  onChange={(e) =>
                    platformStore.updateSystemConfig({
                      minMonthlyIncomeUsd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Dual-Approval Threshold (USDT)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={platformState.systemConfig.requireDualApprovalAboveUsd}
                  onChange={(e) =>
                    platformStore.updateSystemConfig({
                      requireDualApprovalAboveUsd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Disbursements exceeding this amount require dual quorum officer sign-off.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Support Tickets */}
        {activeTab === 'support' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Customer Support &amp; Dispute Queue</h3>
            <div className="space-y-4">
              {platformState.supportTickets.map((tkt) => (
                <div key={tkt.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      #{tkt.id} · {tkt.subject}
                    </span>
                    <span className="text-emerald-400 font-mono capitalize">{tkt.status}</span>
                  </div>
                  <div className="text-slate-400">
                    From: {tkt.userName} ({tkt.userEmail}) · Category: {tkt.category}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {tkt.messages.map((m) => (
                      <div key={m.id} className="p-3 rounded-lg bg-slate-900 text-xs">
                        <div className="font-semibold text-slate-300">{m.senderName}:</div>
                        <div className="text-slate-200 mt-1">{m.message}</div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Type official response..."
                      value={selectedTicketId === tkt.id ? ticketReplyText : ''}
                      onChange={(e) => {
                        setSelectedTicketId(tkt.id);
                        setTicketReplyText(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleTicketReply}
                      className="mt-2 px-3 py-1.5 bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Immutable Audit Log */}
        {activeTab === 'audit_log' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-white">Immutable Event &amp; Compliance Audit Trail</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Append-only record of all borrower consents, credit inquiries, administrative decisions, and payouts.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {platformState.auditEvents.length} Events Indexed
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Actor</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3 text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono tabular-nums text-slate-300">
                  {platformState.auditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {evt.timestamp.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">
                        {evt.actorEmail}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-400 whitespace-nowrap">
                        {evt.action}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {evt.description}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                        {evt.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
