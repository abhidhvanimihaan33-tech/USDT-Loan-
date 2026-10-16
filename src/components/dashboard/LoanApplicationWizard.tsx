/**
 * Tickerline — 5-Step Loan Application & Underwriting Wizard
 * Complete workflow covering KYC, income verification, FCRA authorization,
 * algorithmic DTI assessment, and adverse action generation.
 */

import React, { useState } from 'react';
import { platformStore } from '../../services/store';
import { LoanOffer, UnderwritingAssessment, IncomeInformation } from '../../types';
import { formatCurrency, formatPercent } from '../../services/loanCalculator';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  User,
  Landmark,
  Scale,
  Sparkles,
} from 'lucide-react';

interface LoanApplicationWizardProps {
  initialAmount?: number;
  initialTerm?: number;
  onCancel: () => void;
  onOfferReadyToSign: (offer: LoanOffer) => void;
}

export const LoanApplicationWizard: React.FC<LoanApplicationWizardProps> = ({
  initialAmount = 10000,
  initialTerm = 12,
  onCancel,
  onOfferReadyToSign,
}) => {
  const currentUser = platformStore.getState().currentUser;
  const stateRules = platformStore.getState().stateRules;

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1: Loan Parameters
  const [requestedAmount, setRequestedAmount] = useState<number>(initialAmount);
  const [requestedTerm, setRequestedTerm] = useState<number>(initialTerm);
  const [loanPurpose, setLoanPurpose] = useState<string>('Debt Consolidation & Working Capital');

  // Step 2: Personal & Identity
  const [legalFirstName, setLegalFirstName] = useState(currentUser.firstName);
  const [legalLastName, setLegalLastName] = useState(currentUser.lastName);
  const [dateOfBirth, setDateOfBirth] = useState('1993-06-15');
  const [ssnLastFour, setSsnLastFour] = useState('8912');
  const [streetAddress, setStreetAddress] = useState('742 Evergreen Terrace');
  const [stateCode, setStateCode] = useState(currentUser.residentialState || 'CA');
  const [zipCode, setZipCode] = useState('94105');
  const [citizenshipStatus, setCitizenshipStatus] = useState<'us_citizen' | 'permanent_resident'>('us_citizen');

  // Step 3: Income & Capacity
  const [employmentStatus, setEmploymentStatus] = useState<IncomeInformation['employmentStatus']>('full_time');
  const [employerName, setEmployerName] = useState('Tech Solutions International LLC');
  const [jobTitle, setJobTitle] = useState('Senior Operations Analyst');
  const [yearsEmployed, setYearsEmployed] = useState<number>(3);
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState<number>(7500);
  const [monthlyHousingExpense, setMonthlyHousingExpense] = useState<number>(1800);
  const [otherMonthlyDebts, setOtherMonthlyDebts] = useState<number>(450);
  const [verificationMethod, setVerificationMethod] = useState<IncomeInformation['incomeVerificationMethod']>('instant_payroll_token');

  // Credit profile simulation selector (for realistic underwriting demo)
  const [creditTier, setCreditTier] = useState<'Tier 1 (Excellent)' | 'Tier 2 (Good)' | 'Tier 3 (Fair)' | 'Tier 4 (High Risk)'>('Tier 2 (Good)');
  const [estimatedScore, setEstimatedScore] = useState<number>(715);

  // Step 4: Consents
  const [consentEsign, setConsentEsign] = useState(false);
  const [consentFcra, setConsentFcra] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);

  // Step 5 Result State
  const [decisionResult, setDecisionResult] = useState<{
    offer?: LoanOffer;
    assessment: UnderwritingAssessment;
    adverseActionNotice?: Record<string, unknown>;
  } | null>(null);

  const handleNextStep = () => {
    // Validate DOB age >= 18
    if (step === 2) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) {
        alert('You must be at least 18 years old to apply for credit.');
        return;
      }
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleRunUnderwriting = () => {
    if (!consentEsign || !consentFcra || !consentPrivacy) {
      alert('Please check all three statutory authorizations to proceed.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const incomeData: IncomeInformation = {
          employmentStatus,
          employerName,
          jobTitle,
          yearsEmployed,
          grossMonthlyIncomeUsd: grossMonthlyIncome,
          monthlyHousingExpenseUsd: monthlyHousingExpense,
          otherMonthlyDebtPaymentsUsd: otherMonthlyDebts,
          incomeVerificationMethod: verificationMethod,
          verifiedMonthlyIncomeUsd: grossMonthlyIncome,
        };

        const result = platformStore.submitApplication({
          userId: currentUser.id,
          requestedAmountUsd: requestedAmount,
          requestedTermMonths: requestedTerm,
          loanPurpose,
          income: incomeData,
          stateCode,
          creditTier,
          estimatedCreditScore: estimatedScore,
        });

        setDecisionResult({
          offer: result.offer,
          assessment: result.assessment,
        });
        setIsSubmitting(false);
        setStep(5);
      } catch (err) {
        setIsSubmitting(false);
        alert(err instanceof Error ? err.message : 'Underwriting failure');
      }
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
      
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
            Step {step} of 5
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            {step === 1 && 'Loan Parameters & Purpose'}
            {step === 2 && 'Personal Identity & Residency'}
            {step === 3 && 'Employment & Repayment Capacity'}
            {step === 4 && 'Legal Consents & Credit Authorization'}
            {step === 5 && 'Algorithmic Underwriting Assessment'}
          </h2>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                step === s
                  ? 'bg-emerald-400'
                  : step > s
                  ? 'bg-emerald-800'
                  : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Step 1: Loan Parameters */}
      {step === 1 && (
        <div className="space-y-6 text-xs text-slate-300">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-white">Desired Loan Amount (USDT)</label>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(requestedAmount, 'USD')}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="35000"
              step="500"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>$1,000</span>
              <span>$15,000</span>
              <span>$35,000</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-2">Desired Repayment Term</label>
            <div className="grid grid-cols-4 gap-3">
              {[6, 12, 24, 36].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRequestedTerm(m)}
                  className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                    requestedTerm === m
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-2">Loan Purpose</label>
            <select
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Debt Consolidation & Working Capital">Debt Consolidation & Working Capital</option>
              <option value="Equipment & Software Acquisition">Business Equipment & Hardware</option>
              <option value="Medical & Health Expenses">Medical & Healthcare Expenses</option>
              <option value="Home Improvement & Energy">Home Improvement & Solar</option>
              <option value="Personal & Emergency Reserve">Personal Emergency Reserve</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 leading-relaxed">
            <div className="text-slate-200 font-semibold mb-1">Non-Collateralized Borrowing Notice:</div>
            Your credit agreement will NOT require pledging cryptocurrency collateral. All repayments are fixed equal monthly installments.
          </div>
        </div>
      )}

      {/* Step 2: Personal & Identity */}
      {step === 2 && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Legal First Name</label>
              <input
                type="text"
                required
                value={legalFirstName}
                onChange={(e) => setLegalFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Legal Last Name</label>
              <input
                type="text"
                required
                value={legalLastName}
                onChange={(e) => setLegalLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Date of Birth (Must be 18+)</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Social Security Number (Tokenized Last 4 Only)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="8912"
                  value={ssnLastFour}
                  onChange={(e) => setSsnLastFour(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500 pl-24"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">
                  ••• - •• -
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                We never store full 9-digit SSNs in cleartext. Masked tokenization protects your PII.
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Physical Residential Address</label>
            <input
              type="text"
              required
              placeholder="Street address (No P.O. Boxes)"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">State of Residence</label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {stateRules.map((s) => (
                  <option key={s.stateCode} value={s.stateCode}>
                    {s.stateName} ({s.stateCode}) {s.status === 'prohibited' ? '— Restricted' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Zip Code</label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Citizenship Status</label>
              <select
                value={citizenshipStatus}
                onChange={(e) => setCitizenshipStatus(e.target.value as typeof citizenshipStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="us_citizen">US Citizen</option>
                <option value="permanent_resident">Permanent Resident (Green Card)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Income & Repayment Capacity */}
      {step === 3 && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Employment Status</label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as typeof employmentStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="full_time">Full-Time Employed (W-2)</option>
                <option value="part_time">Part-Time Employed</option>
                <option value="self_employed">Self-Employed / 1099 Contractor</option>
                <option value="other">Retirement / Alternative Income</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Employer / Business Name</label>
              <input
                type="text"
                required
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Years at Current Employer</label>
              <input
                type="number"
                min="0"
                max="40"
                value={yearsEmployed}
                onChange={(e) => setYearsEmployed(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Gross Monthly Income (USD)
              </label>
              <input
                type="number"
                step="100"
                required
                value={grossMonthlyIncome}
                onChange={(e) => setGrossMonthlyIncome(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Min $3,000 / month</span>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Monthly Rent or Mortgage
              </label>
              <input
                type="number"
                step="50"
                required
                value={monthlyHousingExpense}
                onChange={(e) => setMonthlyHousingExpense(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Other Monthly Debt Payments
              </label>
              <input
                type="number"
                step="25"
                required
                value={otherMonthlyDebts}
                onChange={(e) => setOtherMonthlyDebts(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Auto loans, student debt, credit cards</span>
            </div>
          </div>

          {/* Synthetic Demo Underwriting Controls */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Underwriting Assessment Sandbox Parameters</span>
              </span>
              <span className="text-slate-500 text-[10px] font-mono">Demo Tuning</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Simulated Credit Bureau Profile</label>
                <select
                  value={creditTier}
                  onChange={(e) => {
                    const val = e.target.value as typeof creditTier;
                    setCreditTier(val);
                    if (val === 'Tier 1 (Excellent)') setEstimatedScore(785);
                    if (val === 'Tier 2 (Good)') setEstimatedScore(715);
                    if (val === 'Tier 3 (Fair)') setEstimatedScore(650);
                    if (val === 'Tier 4 (High Risk)') setEstimatedScore(580);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tier 1 (Excellent)">Tier 1 (740+ Score · Prime Rates)</option>
                  <option value="Tier 2 (Good)">Tier 2 (680–739 Score · Standard)</option>
                  <option value="Tier 3 (Fair)">Tier 3 (620–679 Score · Elevated Rate)</option>
                  <option value="Tier 4 (High Risk)">Tier 4 (&lt; 620 Score · Will Trigger Decline)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Income Verification Pipeline</label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value as typeof verificationMethod)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="instant_payroll_token">Instant Payroll Token (Argyle / Pinwheel)</option>
                  <option value="bank_aggregate">Direct Bank Inflow Aggregate (Plaid)</option>
                  <option value="paystub_upload">Uploaded Recent W-2 &amp; Paystubs</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Statutory Consents */}
      {step === 4 && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentEsign}
                onChange={(e) => setConsentEsign(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="leading-relaxed">
                <strong className="text-white">E-SIGN Act Electronic Disclosure Consent: </strong>
                I consent to receive all notices, disclosures, Truth in Lending statements, and loan agreements electronically pursuant to 15 U.S.C. § 7001. I certify that I have the hardware and software necessary to view and retain electronic records.
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-slate-800/80">
              <input
                type="checkbox"
                checked={consentFcra}
                onChange={(e) => setConsentFcra(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="leading-relaxed">
                <strong className="text-white">Fair Credit Reporting Act (FCRA § 604) Authorization: </strong>
                I authorize Tickerline Financial Technologies, Inc. and its designated consumer reporting partners to obtain consumer credit reports and verify income information to evaluate this credit application.
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-slate-800/80">
              <input
                type="checkbox"
                checked={consentPrivacy}
                onChange={(e) => setConsentPrivacy(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="leading-relaxed">
                <strong className="text-white">Equal Credit Opportunity Act (ECOA) &amp; Privacy Notice: </strong>
                I acknowledge receipt of the Equal Credit Opportunity Act notice and the Gramm-Leach-Bliley Act (GLBA) Privacy Policy confirming that Tickerline does not sell personal nonpublic information.
              </div>
            </label>

          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            Clicking &quot;Submit for Algorithmic Evaluation&quot; initiates our objective underwriting engine, calculating your Debt-to-Income (DTI) ratio and generating a binding offer or formal Adverse Action notice.
          </div>
        </div>
      )}

      {/* Step 5: Underwriting Outcome */}
      {step === 5 && decisionResult && (
        <div className="space-y-6 text-xs">
          
          {/* Decision Outcome Card */}
          {decisionResult.assessment.decision === 'APPROVED' && decisionResult.offer && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-200">
                <div className="flex items-center gap-2.5 text-base font-bold text-emerald-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Congratulations! Your Loan Application Has Been Approved.</span>
                </div>
                <p className="text-xs text-emerald-300/80 mt-1.5 leading-relaxed">
                  Based on verified monthly income of ${grossMonthlyIncome.toLocaleString()} and a calculated Debt-to-Income (DTI) ratio of {decisionResult.assessment.calculatedDtiPercent}%, you qualify for a non-collateralized USDT credit facility.
                </p>
              </div>

              {/* Offer Summary Box */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Official Loan Offer Terms
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    Valid for 7 Calendar Days
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-sans">APPROVED PRINCIPAL</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {formatCurrency(decisionResult.offer.principalUsdt, 'USDT')}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-sans">FIXED APR</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {formatPercent(decisionResult.offer.annualPercentageRate)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-sans">MONTHLY PAYMENT</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {formatCurrency(decisionResult.offer.monthlyPaymentUsdt, 'USDT')}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-sans">NET DISBURSEMENT</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {formatCurrency(decisionResult.offer.netDisbursementUsdt, 'USDT')}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Origination Fee: {formatCurrency(decisionResult.offer.originationFeeUsdt, 'USDT')}</span>
                  <span>First Payment Due: {decisionResult.offer.firstPaymentDueDate}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOfferReadyToSign(decisionResult.offer!)}
                  className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                >
                  <FileText className="w-4 h-4" />
                  <span>Review Promissory Note &amp; E-Sign</span>
                </button>
              </div>
            </div>
          )}

          {decisionResult.assessment.decision === 'MANUAL_REVIEW' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-900/60 text-amber-200 space-y-2">
                <div className="flex items-center gap-2.5 text-base font-bold text-amber-300">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Application Assigned to Loan Officer Manual Review</span>
                </div>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  Your calculated Debt-to-Income (DTI) ratio is {decisionResult.assessment.calculatedDtiPercent}%, which falls within our secondary risk review tolerance (45%–52%). A licensed underwriting officer will inspect your documentation.
                </p>
                <div className="text-[11px] text-amber-400 font-mono pt-1">
                  Queue Reference ID: #{decisionResult.assessment.id} · Turnaround: 24 Business Hours
                </div>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-semibold text-white">Next Steps:</h4>
                <p>
                  No further action is required from you at this time. You can monitor the review progress in your Borrower Dashboard or check the Admin Console under persona &quot;James (Loan Officer)&quot;.
                </p>
              </div>
            </div>
          )}

          {decisionResult.assessment.decision === 'DECLINED' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-200 space-y-2">
                <div className="flex items-center gap-2.5 text-base font-bold text-rose-300">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>Notice of Adverse Action — Application Declined</span>
                </div>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  Thank you for your interest in Tickerline. We regret that we are unable to approve your application for unsecured credit at this time based on our institutional credit standards.
                </p>
              </div>

              {/* Formal Adverse Action Notice Box (FCRA / ECOA compliance) */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-4">
                <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                    Statement of Credit Denial &amp; Rights
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">15 U.S.C. § 1681m</span>
                </div>

                <div>
                  <div className="font-semibold text-slate-200 mb-1">Principal Reason(s) for Credit Denial:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                    {decisionResult.assessment.decisionReasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
                  <p>
                    <strong>Your Right to a Free Copy of Your Credit Report:</strong> Under the Fair Credit Reporting Act (FCRA), you have the right to receive a free copy of your credit report from the consumer reporting agency if requested within 60 days of receiving this notice.
                  </p>
                  <p>
                    <strong>Consumer Reporting Agency:</strong> Experian Consumer Services, P.O. Box 4500, Allen, TX 75013 · (888) 397-3742 · www.experian.com. Experian played no role in our decision to deny credit and cannot explain reasons for denial.
                  </p>
                  <p>
                    <strong>Equal Credit Opportunity Act Notice:</strong> The federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants on the basis of race, color, religion, national origin, sex, marital status, or age.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        {step < 5 ? (
          <>
            <button
              type="button"
              onClick={step === 1 ? onCancel : handlePrevStep}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{step === 1 ? 'Cancel Application' : 'Back'}</span>
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRunUnderwriting}
                className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Evaluating Underwriting Matrix...' : 'Submit for Algorithmic Evaluation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors text-center"
          >
            Return to Dashboard
          </button>
        )}
      </div>

    </div>
  );
};
