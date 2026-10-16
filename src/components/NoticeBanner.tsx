/**
 * Tickerline — Top Notice Banner & Role Preview Bar
 * Enforces transparency: clearly distinguishes demo mode from live lending,
 * and allows instant role switching for compliance and product evaluation.
 */

import React from 'react';
import { platformStore } from '../services/store';
import { UserRole } from '../types';
import { ShieldAlert, RefreshCw, UserCheck, CheckCircle2 } from 'lucide-react';

interface NoticeBannerProps {
  onSwitchView: (view: string) => void;
  currentView: string;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ onSwitchView, currentView }) => {
  const state = platformStore.getState();
  const currentUser = state.currentUser;

  const handleRoleChange = (userId: string) => {
    platformStore.switchUser(userId);
  };

  const handleReset = () => {
    if (confirm('Reset all demo applications, loans, and audit records to original synthetic seed data?')) {
      platformStore.resetDemoData();
      alert('Demo data restored to initial baseline.');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
      {/* Compliance / Demo Disclaimer Strip */}
      <div className="bg-amber-950/60 border-b border-amber-900/40 px-4 py-2 text-amber-200/90 text-center flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-medium">
          REGULATORY NOTICE & DEMO ENVIRONMENT:
        </span>
        <span className="text-amber-300/80 hidden sm:inline">
          Tickerline does not originate live consumer debt without state lending licenses and depository partner approvals. All loans and USDT disbursements shown are simulated under Federal TILA/Reg Z and ECOA test guidelines.
        </span>
      </div>

      {/* Role Switcher Toolbar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium">Session:</span>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="text-slate-400">({currentUser.role.replace('_', ' ')})</span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Quick User Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-slate-500 mr-1 text-[11px] uppercase tracking-wider">Switch Persona:</span>
            {state.users.map(u => (
              <button
                key={u.id}
                onClick={() => handleRoleChange(u.id)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  currentUser.id === u.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-transparent'
                }`}
              >
                {u.firstName} ({u.role.split('_')[0]})
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            title="Reset platform data to default demonstration state"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => onSwitchView(currentView === 'admin' ? 'public' : 'admin')}
            className={`px-3 py-1 rounded font-medium whitespace-nowrap transition-colors ${
              currentView === 'admin'
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            {currentView === 'admin' ? 'Exit Admin' : 'Admin Portal (/admin)'}
          </button>
        </div>
      </div>
    </div>
  );
};
