/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { platformStore } from './services/store';
import { NoticeBanner } from './components/NoticeBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public views
import { Hero } from './components/public/Hero';
import { LoanCalculatorSection } from './components/public/Calculator';
import { HowItWorksSection } from './components/public/HowItWorks';
import { RatesAndFeesSection } from './components/public/RatesAndFees';
import { EligibilitySection } from './components/public/Eligibility';
import { StateAvailabilitySection } from './components/public/StateAvailability';
import { SecuritySection } from './components/public/SecuritySection';
import { FaqSection } from './components/public/FaqSection';
import { LegalDocumentsSection } from './components/public/LegalDocuments';
import { ContactSection } from './components/public/ContactSection';

// Authenticated / Role Views
import { BorrowerDashboard } from './components/dashboard/BorrowerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoanApplicationWizard } from './components/dashboard/LoanApplicationWizard';
import { LoanAgreementModal } from './components/dashboard/LoanAgreementModal';
import { LoanOffer } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [platformState, setPlatformState] = useState(platformStore.getState());
  const [activeOfferForSign, setActiveOfferForSign] = useState<LoanOffer | null>(null);

  // Pre-filled terms from calculator
  const [calcTerms, setCalcTerms] = useState<{ amount: number; term: number } | null>(null);

  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      setPlatformState(platformStore.getState());
    });
    return unsubscribe;
  }, []);

  const handleApplyWithTerms = (amount: number, term: number) => {
    setCalcTerms({ amount, term });
    setCurrentView('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartApplication = () => {
    setCurrentView('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Statutory Notice & Persona Preview Banner */}
      <NoticeBanner currentView={currentView} onSwitchView={handleNavigate} />

      {/* Main Top Navigation Header */}
      {currentView !== 'admin' && (
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
      )}

      {/* Body Content Router */}
      <main className="flex-1">
        {/* Admin Console View */}
        {currentView === 'admin' && (
          <AdminDashboard onExitAdmin={() => handleNavigate('home')} />
        )}

        {/* Borrower Dashboard View */}
        {currentView === 'dashboard' && (
          <BorrowerDashboard onStartNewApplication={handleStartApplication} />
        )}

        {/* Standalone Application Wizard View */}
        {currentView === 'apply' && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <LoanApplicationWizard
              initialAmount={calcTerms?.amount || 10000}
              initialTerm={calcTerms?.term || 12}
              onCancel={() => handleNavigate('dashboard')}
              onOfferReadyToSign={(offer) => {
                setActiveOfferForSign(offer);
              }}
            />
          </div>
        )}

        {/* Standalone Section Pages or Complete Landing View */}
        {currentView === 'how_it_works' && (
          <div className="py-8">
            <HowItWorksSection />
            <div className="text-center py-12">
              <button
                onClick={handleStartApplication}
                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
              >
                Apply for Loan
              </button>
            </div>
          </div>
        )}

        {currentView === 'calculator' && (
          <div className="py-8">
            <LoanCalculatorSection onApplyWithTerms={handleApplyWithTerms} />
          </div>
        )}

        {currentView === 'rates' && (
          <div className="py-8">
            <RatesAndFeesSection />
          </div>
        )}

        {currentView === 'eligibility' && (
          <div className="py-8">
            <EligibilitySection onApplyClick={handleStartApplication} />
          </div>
        )}

        {currentView === 'state_availability' && (
          <div className="py-8">
            <StateAvailabilitySection />
          </div>
        )}

        {currentView === 'security' && (
          <div className="py-8">
            <SecuritySection />
          </div>
        )}

        {currentView === 'faq' && (
          <div className="py-8">
            <FaqSection />
          </div>
        )}

        {currentView === 'contact' && (
          <div className="py-8">
            <ContactSection />
          </div>
        )}

        {currentView === 'legal' && (
          <div className="py-8">
            <LegalDocumentsSection />
          </div>
        )}

        {/* Home Overview: Comprehensive Presentation */}
        {currentView === 'home' && (
          <>
            <Hero
              onStartApplication={handleStartApplication}
              onOpenCalculator={() => {
                const el = document.getElementById('calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleNavigate('calculator');
              }}
            />
            <HowItWorksSection />
            <LoanCalculatorSection onApplyWithTerms={handleApplyWithTerms} />
            <RatesAndFeesSection />
            <EligibilitySection onApplyClick={handleStartApplication} />
            <StateAvailabilitySection />
            <SecuritySection />
            <FaqSection />
            <LegalDocumentsSection />
            <ContactSection />
          </>
        )}
      </main>

      {/* Global E-Sign Modal if triggered from Application Wizard */}
      {activeOfferForSign && (
        <LoanAgreementModal
          offer={activeOfferForSign}
          onClose={() => setActiveOfferForSign(null)}
          onSignAndDisburse={(data) => {
            try {
              platformStore.acceptOfferAndSignAgreement(data);
              setActiveOfferForSign(null);
              setCurrentView('dashboard');
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Execution error');
            }
          }}
        />
      )}

      {/* Statutory Footer */}
      {currentView !== 'admin' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}
