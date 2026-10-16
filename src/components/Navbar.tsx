/**
 * Tickerline — Top Navigation Bar
 * Follows strict Top Bar Contract:
 * Zone 1: Single text wordmark
 * Zone 2: 4-5 single-line nav links
 * Zone 3: 1 primary action
 */

import React from 'react';
import { platformStore } from '../services/store';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const state = platformStore.getState();
  const isBorrower = state.currentUser.role === 'borrower';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block"></span>
          Tickerline
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('how_it_works')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentView === 'how_it_works' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('calculator')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentView === 'calculator' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Loan Calculator
          </button>
          <button
            onClick={() => onNavigate('rates')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentView === 'rates' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Rates & Fees
          </button>
          <button
            onClick={() => onNavigate('eligibility')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentView === 'eligibility' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Eligibility
          </button>
          <button
            onClick={() => onNavigate('state_availability')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentView === 'state_availability' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            State Matrix
          </button>
          <button
            onClick={() => onNavigate('security')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentView === 'security' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Security
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView === 'dashboard' ? (
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-700"
            >
              Public Site
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              Borrower Dashboard
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
