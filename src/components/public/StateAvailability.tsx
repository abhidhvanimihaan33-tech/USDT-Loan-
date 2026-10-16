/**
 * Tickerline — State-by-State Regulatory Availability Matrix
 * Interactive registry displaying licensing status, statutory bodies, and usury caps.
 */

import React, { useState } from 'react';
import { platformStore } from '../../services/store';
import { StateRegulatoryRule } from '../../types';
import { Search, ShieldAlert, CheckCircle, Clock, XCircle } from 'lucide-react';

export const StateAvailabilitySection: React.FC = () => {
  const stateRules = platformStore.getState().stateRules;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_review' | 'prohibited'>('all');

  const filteredRules = stateRules.filter((rule) => {
    const matchesSearch =
      rule.stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.stateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.regulatoryBody.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section id="state-availability" className="py-20 bg-slate-900/40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Jurisdictional Directory
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            US State Regulatory & Licensing Availability
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Tickerline operates strictly within permitted state consumer finance statutes. States with statutory usury caps that conflict with digital credit risk models are classified as prohibited until regulatory exemptions or partner bank programs are active.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search state name, code, or regulator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
            {(['all', 'active', 'in_review', 'prohibited'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-md capitalize font-medium transition-colors whitespace-nowrap ${
                  statusFilter === filter
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'All Jurisdictions' : filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* State Table */}
        <div className="mt-6 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/70">
                  <th className="py-3.5 px-4">State</th>
                  <th className="py-3.5 px-4">Regulatory Agency</th>
                  <th className="py-3.5 px-4">Program Status</th>
                  <th className="py-3.5 px-4 text-right">Max Loan Cap</th>
                  <th className="py-3.5 px-4 text-right">Statutory APR Cap</th>
                  <th className="py-3.5 px-4">Legal Framework & Usury Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums text-slate-300">
                {filteredRules.map((rule) => {
                  return (
                    <tr key={rule.stateCode} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        <span className="font-mono text-emerald-400 mr-2">{rule.stateCode}</span>
                        {rule.stateName}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {rule.regulatoryBody}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {rule.status === 'active' && (
                          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Active / Permitted</span>
                          </span>
                        )}
                        {rule.status === 'in_review' && (
                          <span className="text-amber-400 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Regulatory Review</span>
                          </span>
                        )}
                        {rule.status === 'prohibited' && (
                          <span className="text-rose-400 font-medium flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Statutory Cap Restriction</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-200">
                        {rule.maxLoanAmountUsd > 0 ? `$${rule.maxLoanAmountUsd.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-200">
                        {rule.maxAprCapPercent.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-400 max-w-xs text-[11px] leading-relaxed">
                        {rule.usuryCapNotes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
