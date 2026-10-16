/**
 * Tickerline — Persistent In-Memory & LocalStorage Data Store
 * Provides stateful persistence for users, loans, applications,
 * underwriting assessments, audit logs, and compliance records.
 */

import {
  User,
  UserRole,
  KYCProfile,
  ConsentRecord,
  UnderwritingAssessment,
  LoanOffer,
  ActiveLoan,
  RepaymentScheduleItem,
  RepaymentTransaction,
  UsdtDisbursement,
  AuditEvent,
  SupportTicket,
  StateRegulatoryRule,
  SystemConfig,
  UsdtNetwork,
  IncomeInformation,
} from '../types';
import { evaluateLoanApplication } from './underwritingEngine';
import { initiateDemoDisbursement, validateRecipientAddress } from './usdtAdapter';
import { calculateLoanRepayment } from './loanCalculator';

const STORAGE_KEY = 'tickerline_platform_state_v1';

// Initial 50-state regulatory matrix for US lending
export const INITIAL_STATE_RULES: StateRegulatoryRule[] = [
  { stateCode: 'CA', stateName: 'California', status: 'active', maxLoanAmountUsd: 35000, maxAprCapPercent: 36.0, regulatoryBody: 'DFPI (Department of Financial Protection and Innovation)', usuryCapNotes: 'CFL License Required for loans under $10,000 with statutory rate limitations.', requiresSpecialLicense: true },
  { stateCode: 'TX', stateName: 'Texas', status: 'active', maxLoanAmountUsd: 35000, maxAprCapPercent: 30.0, regulatoryBody: 'OCCC (Office of Consumer Credit Commissioner)', usuryCapNotes: 'Chapter 342 Subchapter F regulated lender authorization.', requiresSpecialLicense: true },
  { stateCode: 'FL', stateName: 'Florida', status: 'active', maxLoanAmountUsd: 25000, maxAprCapPercent: 30.0, regulatoryBody: 'OFR (Office of Financial Regulation)', usuryCapNotes: 'Florida Consumer Finance Act compliance required.', requiresSpecialLicense: true },
  { stateCode: 'NY', stateName: 'New York', status: 'prohibited', maxLoanAmountUsd: 0, maxAprCapPercent: 16.0, regulatoryBody: 'NYDFS (New York Department of Financial Services)', usuryCapNotes: 'Strict 16% civil usury limit and 25% criminal usury threshold prohibit unsecured digital lending under current rate tiers.', requiresSpecialLicense: true },
  { stateCode: 'IL', stateName: 'Illinois', status: 'active', maxLoanAmountUsd: 30000, maxAprCapPercent: 36.0, regulatoryBody: 'IDFPR (Illinois Dept of Financial & Professional Regulation)', usuryCapNotes: 'Predatory Loan Prevention Act strict 36% all-in APR cap enforced.', requiresSpecialLicense: true },
  { stateCode: 'CO', stateName: 'Colorado', status: 'in_review', maxLoanAmountUsd: 20000, maxAprCapPercent: 21.0, regulatoryBody: 'Colorado Attorney General / UCCC', usuryCapNotes: 'UCCC tiered finance rate structure under review for digital asset denomination.', requiresSpecialLicense: true },
  { stateCode: 'WA', stateName: 'Washington', status: 'active', maxLoanAmountUsd: 30000, maxAprCapPercent: 25.0, regulatoryBody: 'DFI (Department of Financial Institutions)', usuryCapNotes: 'Consumer Loan Act (CLA) licensing framework.', requiresSpecialLicense: true },
  { stateCode: 'GA', stateName: 'Georgia', status: 'prohibited', maxLoanAmountUsd: 0, maxAprCapPercent: 16.0, regulatoryBody: 'DOB (Department of Banking and Finance)', usuryCapNotes: 'Georgia Industrial Loan Act and usury cap restrictions prohibit standard digital product.', requiresSpecialLicense: true },
  { stateCode: 'OH', stateName: 'Ohio', status: 'active', maxLoanAmountUsd: 25000, maxAprCapPercent: 28.0, regulatoryBody: 'Ohio Division of Financial Institutions', usuryCapNotes: 'General loan law compliance.', requiresSpecialLicense: false },
  { stateCode: 'NC', stateName: 'North Carolina', status: 'in_review', maxLoanAmountUsd: 15000, maxAprCapPercent: 30.0, regulatoryBody: 'NC Commissioner of Banks', usuryCapNotes: 'Consumer finance licensing under evaluation.', requiresSpecialLicense: true },
  { stateCode: 'PA', stateName: 'Pennsylvania', status: 'active', maxLoanAmountUsd: 25000, maxAprCapPercent: 24.0, regulatoryBody: 'PA Department of Banking and Securities', usuryCapNotes: 'Consumer Discount Company Act regulations apply.', requiresSpecialLicense: true },
  { stateCode: 'AZ', stateName: 'Arizona', status: 'active', maxLoanAmountUsd: 35000, maxAprCapPercent: 36.0, regulatoryBody: 'AZ Department of Insurance and Financial Institutions', usuryCapNotes: 'Consumer lender licensing requirements satisfied.', requiresSpecialLicense: true },
];

export interface StoredLoanApplication {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedAmountUsd: number;
  requestedTermMonths: number;
  loanPurpose: string;
  income: IncomeInformation;
  stateCode: string;
  status: 'submitted' | 'underwriting_review' | 'approved' | 'declined' | 'accepted' | 'disbursed';
  submittedAt: string;
  assessmentId?: string;
  offerId?: string;
  adverseActionNotice?: Record<string, unknown>;
}

export interface PlatformState {
  currentUser: User;
  users: User[];
  kycProfiles: Record<string, KYCProfile>;
  consents: ConsentRecord[];
  applications: StoredLoanApplication[];
  assessments: UnderwritingAssessment[];
  offers: LoanOffer[];
  activeLoans: ActiveLoan[];
  repaymentSchedules: Record<string, RepaymentScheduleItem[]>; // loanId -> items
  repaymentTransactions: RepaymentTransaction[];
  disbursements: UsdtDisbursement[];
  auditEvents: AuditEvent[];
  supportTickets: SupportTicket[];
  stateRules: StateRegulatoryRule[];
  systemConfig: SystemConfig;
}

// Default Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'usr-sarah-chen',
    email: 'sarah.chen@example.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'borrower',
    phone: '+1 (415) 555-0182',
    isEmailVerified: true,
    isMfaEnabled: true,
    hasPasskey: true,
    createdAt: '2026-08-14T09:30:00Z',
    lastLoginAt: '2026-10-15T18:22:00Z',
    kycStatus: 'verified',
    residentialState: 'CA',
  },
  {
    id: 'usr-marcus-vance',
    email: 'marcus.vance@example.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    role: 'borrower',
    phone: '+1 (512) 555-0199',
    isEmailVerified: true,
    isMfaEnabled: false,
    hasPasskey: false,
    createdAt: '2026-09-02T14:15:00Z',
    lastLoginAt: '2026-10-14T11:05:00Z',
    kycStatus: 'verified',
    residentialState: 'TX',
  },
  {
    id: 'usr-elena-rostova',
    email: 'elena.rostova@example.com',
    firstName: 'Elena',
    lastName: 'Rostova',
    role: 'borrower',
    phone: '+1 (305) 555-0144',
    isEmailVerified: true,
    isMfaEnabled: true,
    hasPasskey: false,
    createdAt: '2026-10-10T16:45:00Z',
    lastLoginAt: '2026-10-16T08:12:00Z',
    kycStatus: 'pending',
    residentialState: 'FL',
  },
  {
    id: 'adm-david-sterling',
    email: 'david.sterling@tickerline.com',
    firstName: 'David',
    lastName: 'Sterling',
    role: 'super_admin',
    isEmailVerified: true,
    isMfaEnabled: true,
    hasPasskey: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-10-16T08:00:00Z',
    kycStatus: 'verified',
    residentialState: 'CA',
  },
  {
    id: 'adm-rachel-adams',
    email: 'rachel.adams@tickerline.com',
    firstName: 'Rachel',
    lastName: 'Adams',
    role: 'compliance_officer',
    isEmailVerified: true,
    isMfaEnabled: true,
    hasPasskey: true,
    createdAt: '2026-02-15T00:00:00Z',
    lastLoginAt: '2026-10-16T07:45:00Z',
    kycStatus: 'verified',
    residentialState: 'TX',
  },
  {
    id: 'adm-james-wilson',
    email: 'james.wilson@tickerline.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'loan_officer',
    isEmailVerified: true,
    isMfaEnabled: true,
    hasPasskey: false,
    createdAt: '2026-03-01T00:00:00Z',
    lastLoginAt: '2026-10-16T07:10:00Z',
    kycStatus: 'verified',
    residentialState: 'FL',
  },
];

function buildInitialState(): PlatformState {
  // Sarah Chen's active loan setup
  const sarahLoanCalc = calculateLoanRepayment({
    principalUsd: 8000,
    termMonths: 12,
    annualPercentageRate: 11.50,
    originationFeePercent: 3.0,
  });

  const sarahLoanId = 'loan-tk-892401';
  const sarahSchedule: RepaymentScheduleItem[] = sarahLoanCalc.schedule.map((row, index) => ({
    id: `sched-${sarahLoanId}-${row.installmentNumber}`,
    loanId: sarahLoanId,
    installmentNumber: row.installmentNumber,
    dueDate: row.dueDate,
    principalAmountUsdt: row.principalPortionUsd,
    interestAmountUsdt: row.interestPortionUsd,
    totalDueUsdt: row.paymentUsdt,
    status: index < 2 ? 'paid' : 'pending',
    paidAt: index < 2 ? new Date(Date.now() - (60 - index * 30) * 86400000).toISOString() : undefined,
    paidAmountUsdt: index < 2 ? row.paymentUsdt : undefined,
    transactionRef: index < 2 ? `tx-repay-poly-00${index + 1}` : undefined,
  }));

  const sarahActiveLoan: ActiveLoan = {
    id: sarahLoanId,
    loanNumber: 'TL-2026-0892',
    userId: 'usr-sarah-chen',
    applicationId: 'app-sarah-01',
    offerId: 'off-sarah-01',
    status: 'active',
    principalUsdt: 8000,
    remainingBalanceUsdt: 6712.44,
    termMonths: 12,
    annualPercentageRate: 11.50,
    monthlyPaymentUsdt: sarahLoanCalc.monthlyPaymentUsdt,
    totalPaidUsdt: sarahLoanCalc.monthlyPaymentUsdt * 2,
    nextPaymentDueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    nextPaymentAmountUsdt: sarahLoanCalc.monthlyPaymentUsdt,
    originationDate: '2026-08-15',
    maturityDate: '2027-08-15',
    disbursementNetwork: 'Polygon PoS',
    destinationWalletAddress: '0x892a08f51a4f02a637db917c917bce72a39b201a',
    disbursementTxHash: '0x3a4b92c81e7d0f98234ab1c82e6d9f0412389ab327c912e84019bf4a89cd23ef',
    disbursementCompletedAt: '2026-08-15T11:20:00Z',
  };

  // Marcus Vance's approved offer setup
  const marcusOffer: LoanOffer = {
    id: 'off-marcus-01',
    applicationId: 'app-marcus-01',
    userId: 'usr-marcus-vance',
    principalUsd: 15000,
    principalUsdt: 15000,
    termMonths: 24,
    annualPercentageRate: 13.90,
    nominalInterestRate: 12.80,
    originationFeeUsd: 450,
    originationFeeUsdt: 450,
    netDisbursementUsdt: 14550,
    monthlyPaymentUsd: 719.54,
    monthlyPaymentUsdt: 719.54,
    totalRepaymentUsd: 17268.96,
    totalRepaymentUsdt: 17268.96,
    totalFinanceChargeUsd: 2718.96,
    paymentFrequency: 'monthly',
    firstPaymentDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: 'active',
  };

  const initialAuditLogs: AuditEvent[] = [
    {
      id: 'aud-001',
      actorId: 'usr-sarah-chen',
      actorEmail: 'sarah.chen@example.com',
      actorRole: 'borrower',
      action: 'CONSENT_RECORDED',
      targetType: 'user',
      targetId: 'usr-sarah-chen',
      description: 'Accepted E-SIGN Disclosure and Credit Inquiry Authorization (FCRA § 604)',
      ipAddress: '198.51.100.24',
      timestamp: '2026-08-14T09:35:12Z',
    },
    {
      id: 'aud-002',
      actorId: 'system-underwriting',
      actorEmail: 'underwriting-engine@tickerline.com',
      actorRole: 'super_admin',
      action: 'UNDERWRITING_DECISION_APPROVED',
      targetType: 'application',
      targetId: 'app-sarah-01',
      description: 'Automated underwriting approved Tier 1 Prime rating (DTI: 31.4%, Verified Monthly: $9,400)',
      ipAddress: '127.0.0.1',
      timestamp: '2026-08-14T09:42:01Z',
    },
    {
      id: 'aud-003',
      actorId: 'adm-rachel-adams',
      actorEmail: 'rachel.adams@tickerline.com',
      actorRole: 'compliance_officer',
      action: 'DISBURSEMENT_AUTHORIZED',
      targetType: 'disbursement',
      targetId: sarahLoanId,
      description: 'Dual authorization verified for 8,000 USDT disbursement to Polygon PoS contract',
      ipAddress: '172.56.21.9',
      timestamp: '2026-08-15T10:15:30Z',
    },
  ];

  return {
    currentUser: DEFAULT_USERS[0],
    users: DEFAULT_USERS,
    kycProfiles: {
      'usr-sarah-chen': {
        userId: 'usr-sarah-chen',
        legalFirstName: 'Sarah',
        legalLastName: 'Chen',
        dateOfBirth: '1992-04-18',
        ssnLastFour: '•••• 8912',
        streetAddress: '452 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        idDocumentType: 'drivers_license',
        idDocumentNumberMasked: '••••••••8120',
        idVerifiedAt: '2026-08-14T09:38:00Z',
        idStatus: 'verified',
        citizenshipStatus: 'us_citizen',
      },
    },
    consents: [
      {
        id: 'cns-001',
        userId: 'usr-sarah-chen',
        consentType: 'credit_pull_authorization',
        ipAddress: '198.51.100.24',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: '2026-08-14T09:35:12Z',
        version: 'v2026.1',
      },
    ],
    applications: [
      {
        id: 'app-sarah-01',
        userId: 'usr-sarah-chen',
        userEmail: 'sarah.chen@example.com',
        userName: 'Sarah Chen',
        requestedAmountUsd: 8000,
        requestedTermMonths: 12,
        loanPurpose: 'Debt Consolidation & Working Capital',
        income: {
          employmentStatus: 'full_time',
          employerName: 'Stripe, Inc.',
          jobTitle: 'Senior Systems Engineer',
          yearsEmployed: 4,
          grossMonthlyIncomeUsd: 11500,
          monthlyHousingExpenseUsd: 2800,
          otherMonthlyDebtPaymentsUsd: 650,
          incomeVerificationMethod: 'instant_payroll_token',
          verifiedMonthlyIncomeUsd: 11500,
        },
        stateCode: 'CA',
        status: 'disbursed',
        submittedAt: '2026-08-14T09:40:00Z',
        assessmentId: 'uw-sarah-01',
        offerId: 'off-sarah-01',
      },
      {
        id: 'app-marcus-01',
        userId: 'usr-marcus-vance',
        userEmail: 'marcus.vance@example.com',
        userName: 'Marcus Vance',
        requestedAmountUsd: 15000,
        requestedTermMonths: 24,
        loanPurpose: 'Equipment & Software Acquisition',
        income: {
          employmentStatus: 'self_employed',
          employerName: 'Vance Digital Studio LLC',
          jobTitle: 'Principal Consultant',
          yearsEmployed: 5,
          grossMonthlyIncomeUsd: 8200,
          monthlyHousingExpenseUsd: 1950,
          otherMonthlyDebtPaymentsUsd: 400,
          incomeVerificationMethod: 'bank_aggregate',
          verifiedMonthlyIncomeUsd: 8000,
        },
        stateCode: 'TX',
        status: 'approved',
        submittedAt: '2026-10-14T10:30:00Z',
        assessmentId: 'uw-marcus-01',
        offerId: 'off-marcus-01',
      },
      {
        id: 'app-elena-01',
        userId: 'usr-elena-rostova',
        userEmail: 'elena.rostova@example.com',
        userName: 'Elena Rostova',
        requestedAmountUsd: 22000,
        requestedTermMonths: 36,
        loanPurpose: 'Medical & Relocation Expenses',
        income: {
          employmentStatus: 'full_time',
          employerName: 'Baptist Health South Florida',
          jobTitle: 'Clinical Coordinator',
          yearsEmployed: 2,
          grossMonthlyIncomeUsd: 6200,
          monthlyHousingExpenseUsd: 1800,
          otherMonthlyDebtPaymentsUsd: 1100,
          incomeVerificationMethod: 'paystub_upload',
          verifiedMonthlyIncomeUsd: 6200,
        },
        stateCode: 'FL',
        status: 'underwriting_review',
        submittedAt: '2026-10-15T15:00:00Z',
        assessmentId: 'uw-elena-01',
      },
    ],
    assessments: [
      {
        id: 'uw-sarah-01',
        applicationId: 'app-sarah-01',
        createdAt: '2026-08-14T09:41:00Z',
        calculatedDtiPercent: 36.2,
        disposableMonthlyIncomeUsd: 7338.5,
        creditTier: 'Tier 1 (Excellent)',
        estimatedCreditScore: 785,
        decision: 'APPROVED',
        decisionReasons: ['High verified disposable income', 'Stable 4-year tech employment', 'Prime bureau history'],
        policyVersion: 'TL-UW-2026.4',
      },
      {
        id: 'uw-elena-01',
        applicationId: 'app-elena-01',
        createdAt: '2026-10-15T15:05:00Z',
        calculatedDtiPercent: 49.8,
        disposableMonthlyIncomeUsd: 2450.0,
        creditTier: 'Tier 2 (Good)',
        estimatedCreditScore: 685,
        decision: 'MANUAL_REVIEW',
        decisionReasons: ['DTI is between 45% and 50%', 'Requested term of 36 months requires risk analyst verification'],
        policyVersion: 'TL-UW-2026.4',
      },
    ],
    offers: [marcusOffer],
    activeLoans: [sarahActiveLoan],
    repaymentSchedules: {
      [sarahLoanId]: sarahSchedule,
    },
    repaymentTransactions: [
      {
        id: 'tx-repay-poly-001',
        loanId: sarahLoanId,
        userId: 'usr-sarah-chen',
        amountUsdt: sarahLoanCalc.monthlyPaymentUsdt,
        amountUsdEquivalent: sarahLoanCalc.monthlyPaymentUsd,
        timestamp: '2026-09-15T14:22:00Z',
        method: 'USDT_TRANSFER',
        network: 'Polygon PoS',
        txHash: '0x4f12ab8912cd34ef78901234567890abcdef1234567890abcdef1234567890ab',
        status: 'completed',
        receiptNumber: 'RCP-2026-09-001',
      },
      {
        id: 'tx-repay-poly-002',
        loanId: sarahLoanId,
        userId: 'usr-sarah-chen',
        amountUsdt: sarahLoanCalc.monthlyPaymentUsdt,
        amountUsdEquivalent: sarahLoanCalc.monthlyPaymentUsd,
        timestamp: '2026-10-14T10:18:00Z',
        method: 'USDT_TRANSFER',
        network: 'Polygon PoS',
        txHash: '0x99a8b7c6d5e4f32109876543210fedcba9876543210fedcba9876543210fedcb',
        status: 'completed',
        receiptNumber: 'RCP-2026-10-042',
      },
    ],
    disbursements: [
      {
        id: 'disb-sarah-01',
        loanId: sarahLoanId,
        userId: 'usr-sarah-chen',
        amountUsdt: 8000,
        network: 'Polygon PoS',
        recipientAddress: '0x892a08f51a4f02a637db917c917bce72a39b201a',
        status: 'confirmed',
        txHash: '0x3a4b92c81e7d0f98234ab1c82e6d9f0412389ab327c912e84019bf4a89cd23ef',
        blockConfirmations: 64,
        requiredConfirmations: 64,
        idempotencyKey: 'idemp-sarah-8000-poly',
        initiatedAt: '2026-08-15T11:15:00Z',
        completedAt: '2026-08-15T11:20:00Z',
        isDemoTransaction: true,
      },
    ],
    auditEvents: initialAuditLogs,
    supportTickets: [
      {
        id: 'tkt-1082',
        userId: 'usr-sarah-chen',
        userEmail: 'sarah.chen@example.com',
        userName: 'Sarah Chen',
        subject: 'Confirmation on gasless repayments via Polygon network',
        category: 'repayments',
        priority: 'normal',
        status: 'resolved',
        createdAt: '2026-09-10T14:20:00Z',
        updatedAt: '2026-09-10T16:05:00Z',
        messages: [
          {
            id: 'msg-1',
            senderId: 'usr-sarah-chen',
            senderRole: 'user',
            senderName: 'Sarah Chen',
            message: 'Hello, are there any network fees charged by Tickerline when I transfer USDT from my Ledger wallet on Polygon PoS to the repayment smart vault?',
            timestamp: '2026-09-10T14:20:00Z',
          },
          {
            id: 'msg-2',
            senderId: 'adm-david-sterling',
            senderRole: 'support',
            senderName: 'David Sterling (Support)',
            message: 'Hi Sarah! Tickerline charges zero platform fees on repayments. You will only pay the standard Polygon network gas fee (~0.02 POL / $0.01) to broadcast your USDT transfer.',
            timestamp: '2026-09-10T16:05:00Z',
          },
        ],
      },
    ],
    stateRules: INITIAL_STATE_RULES,
    systemConfig: {
      isDemoMode: true,
      usdtUsdExchangeRate: 1.0001,
      oracleLastUpdated: '2026-10-16T08:15:00Z (Chainlink / CoinGecko Feed)',
      maxBorrowerDtiPercent: 45.0,
      minMonthlyIncomeUsd: 3000,
      requireDualApprovalAboveUsd: 10000,
      supportedNetworks: ['Polygon PoS', 'Arbitrum One', 'Ethereum (ERC-20)', 'Tron (TRC-20)', 'Solana (SPL)'],
      disbursementFeeUsdt: 0,
    },
  };
}

class Store {
  private state: PlatformState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): PlatformState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // LocalStorage access issue
    }
    return buildInitialState();
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage quota or restriction
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  public getState(): PlatformState {
    return this.state;
  }

  public resetDemoData(): void {
    this.state = buildInitialState();
    this.saveState();
  }

  public switchUser(userId: string): void {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUser = user;
      this.logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'USER_SESSION_SWITCHED',
        targetType: 'user',
        targetId: user.id,
        description: `Switched active preview session to ${user.firstName} ${user.lastName} (${user.role})`,
      });
      this.saveState();
    }
  }

  public logAudit(event: Omit<AuditEvent, 'id' | 'timestamp' | 'ipAddress'>): void {
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '198.51.100.42 (US Client IP)',
    };
    this.state.auditEvents.unshift(newEvent);
    // keep latest 200 logs
    if (this.state.auditEvents.length > 200) {
      this.state.auditEvents.pop();
    }
  }

  public submitApplication(input: {
    userId: string;
    requestedAmountUsd: number;
    requestedTermMonths: number;
    loanPurpose: string;
    income: IncomeInformation;
    stateCode: string;
    creditTier?: 'Tier 1 (Excellent)' | 'Tier 2 (Good)' | 'Tier 3 (Fair)' | 'Tier 4 (High Risk)';
    estimatedCreditScore?: number;
  }): { application: StoredLoanApplication; offer?: LoanOffer; assessment: UnderwritingAssessment } {
    const user = this.state.users.find(u => u.id === input.userId) || this.state.currentUser;

    const appId = `app-${Date.now().toString(36)}`;
    
    // Evaluate via underwriting engine
    const uwResult = evaluateLoanApplication({
      applicationId: appId,
      userId: user.id,
      requestedAmountUsd: input.requestedAmountUsd,
      requestedTermMonths: input.requestedTermMonths,
      income: input.income,
      stateCode: input.stateCode,
      stateRules: this.state.stateRules,
      applicantCreditTier: input.creditTier || 'Tier 2 (Good)',
      estimatedCreditScore: input.estimatedCreditScore || 710,
    });

    const newApp: StoredLoanApplication = {
      id: appId,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      requestedAmountUsd: input.requestedAmountUsd,
      requestedTermMonths: input.requestedTermMonths,
      loanPurpose: input.loanPurpose,
      income: input.income,
      stateCode: input.stateCode,
      status: uwResult.assessment.decision === 'APPROVED' ? 'approved' 
            : uwResult.assessment.decision === 'MANUAL_REVIEW' ? 'underwriting_review' 
            : 'declined',
      submittedAt: new Date().toISOString(),
      assessmentId: uwResult.assessment.id,
      offerId: uwResult.offer?.id,
      adverseActionNotice: uwResult.adverseActionNotice,
    };

    this.state.applications.unshift(newApp);
    this.state.assessments.unshift(uwResult.assessment);
    if (uwResult.offer) {
      this.state.offers.unshift(uwResult.offer);
    }

    this.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'LOAN_APPLICATION_SUBMITTED',
      targetType: 'application',
      targetId: appId,
      description: `Submitted application for $${input.requestedAmountUsd.toLocaleString()} (${input.requestedTermMonths}mo). Result: ${uwResult.assessment.decision}`,
      metadata: {
        dti: uwResult.assessment.calculatedDtiPercent,
        income: input.income.grossMonthlyIncomeUsd,
      },
    });

    this.saveState();
    return { application: newApp, offer: uwResult.offer, assessment: uwResult.assessment };
  }

  public acceptOfferAndSignAgreement(input: {
    offerId: string;
    destinationAddress: string;
    network: UsdtNetwork;
    eSignerLegalName: string;
  }): { activeLoan: ActiveLoan; disbursement: UsdtDisbursement } {
    const offer = this.state.offers.find(o => o.id === input.offerId);
    if (!offer) {
      throw new Error('Offer not found or expired.');
    }

    const valResult = validateRecipientAddress(input.destinationAddress, input.network);
    if (!valResult.isValid) {
      throw new Error(valResult.errorMessage || 'Invalid destination wallet address');
    }

    const application = this.state.applications.find(a => a.id === offer.applicationId);
    if (application) {
      application.status = 'disbursed';
    }
    offer.status = 'accepted';

    const loanId = `loan-${Date.now().toString(36)}`;
    const loanCalc = calculateLoanRepayment({
      principalUsd: offer.principalUsd,
      termMonths: offer.termMonths,
      annualPercentageRate: offer.annualPercentageRate,
      originationFeePercent: (offer.originationFeeUsd / offer.principalUsd) * 100,
    });

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + offer.termMonths);

    // Build schedule
    const schedule: RepaymentScheduleItem[] = loanCalc.schedule.map(row => ({
      id: `sched-${loanId}-${row.installmentNumber}`,
      loanId,
      installmentNumber: row.installmentNumber,
      dueDate: row.dueDate,
      principalAmountUsdt: row.principalPortionUsd,
      interestAmountUsdt: row.interestPortionUsd,
      totalDueUsdt: row.paymentUsdt,
      status: 'pending',
    }));

    // Initiate USDT Disbursement (Demo Adapter)
    const disbursement = initiateDemoDisbursement(
      loanId,
      offer.userId,
      offer.netDisbursementUsdt,
      input.network,
      input.destinationAddress,
      `idemp-${loanId}-${Date.now()}`
    );

    const newActiveLoan: ActiveLoan = {
      id: loanId,
      loanNumber: `TL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: offer.userId,
      applicationId: offer.applicationId,
      offerId: offer.id,
      status: 'active',
      principalUsdt: offer.principalUsdt,
      remainingBalanceUsdt: offer.principalUsdt,
      termMonths: offer.termMonths,
      annualPercentageRate: offer.annualPercentageRate,
      monthlyPaymentUsdt: offer.monthlyPaymentUsdt,
      totalPaidUsdt: 0,
      nextPaymentDueDate: offer.firstPaymentDueDate,
      nextPaymentAmountUsdt: offer.monthlyPaymentUsdt,
      originationDate: new Date().toISOString().split('T')[0],
      maturityDate: maturityDate.toISOString().split('T')[0],
      disbursementNetwork: input.network,
      destinationWalletAddress: input.destinationAddress,
      disbursementTxHash: disbursement.txHash,
      disbursementCompletedAt: new Date().toISOString(),
    };

    this.state.activeLoans.unshift(newActiveLoan);
    this.state.repaymentSchedules[loanId] = schedule;
    this.state.disbursements.unshift(disbursement);

    this.logAudit({
      actorId: offer.userId,
      actorEmail: this.state.currentUser.email,
      actorRole: 'borrower',
      action: 'LOAN_AGREEMENT_EXECUTED',
      targetType: 'loan',
      targetId: loanId,
      description: `E-Signed TILA Note & Disbursed ${offer.netDisbursementUsdt} USDT to ${input.destinationAddress} (${input.network})`,
      metadata: {
        legalName: input.eSignerLegalName,
        apr: offer.annualPercentageRate,
      },
    });

    this.saveState();
    return { activeLoan: newActiveLoan, disbursement };
  }

  public makeRepayment(input: {
    loanId: string;
    amountUsdt: number;
    method: 'USDT_TRANSFER' | 'ACH_DEBIT';
    network?: UsdtNetwork;
  }): RepaymentTransaction {
    const loan = this.state.activeLoans.find(l => l.id === input.loanId);
    if (!loan) throw new Error('Loan record not found.');

    const schedule = this.state.repaymentSchedules[input.loanId] || [];
    const pendingItem = schedule.find(s => s.status === 'pending');

    const txId = `tx-repay-${Date.now().toString(36)}`;
    const receiptNum = `RCP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const tx: RepaymentTransaction = {
      id: txId,
      loanId: loan.id,
      userId: loan.userId,
      amountUsdt: input.amountUsdt,
      amountUsdEquivalent: input.amountUsdt * this.state.systemConfig.usdtUsdExchangeRate,
      timestamp: new Date().toISOString(),
      method: input.method,
      network: input.network,
      txHash: input.method === 'USDT_TRANSFER' ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined,
      status: 'completed',
      receiptNumber: receiptNum,
    };

    this.state.repaymentTransactions.unshift(tx);

    // Update schedule row
    if (pendingItem) {
      pendingItem.status = 'paid';
      pendingItem.paidAt = new Date().toISOString();
      pendingItem.paidAmountUsdt = input.amountUsdt;
      pendingItem.transactionRef = tx.txHash || receiptNum;
    }

    // Update loan balance
    loan.remainingBalanceUsdt = Math.max(0, Math.round((loan.remainingBalanceUsdt - input.amountUsdt) * 100) / 100);
    loan.totalPaidUsdt = Math.round((loan.totalPaidUsdt + input.amountUsdt) * 100) / 100;

    // Check if fully paid
    if (loan.remainingBalanceUsdt <= 0.01) {
      loan.status = 'paid_off';
    } else {
      // update next due date
      const nextPending = schedule.find(s => s.status === 'pending');
      if (nextPending) {
        loan.nextPaymentDueDate = nextPending.dueDate;
        loan.nextPaymentAmountUsdt = nextPending.totalDueUsdt;
      }
    }

    this.logAudit({
      actorId: loan.userId,
      actorEmail: this.state.currentUser.email,
      actorRole: 'borrower',
      action: 'REPAYMENT_PROCESSED',
      targetType: 'repayment',
      targetId: txId,
      description: `Processed repayment of ${input.amountUsdt} USDT via ${input.method}. New loan balance: ${loan.remainingBalanceUsdt} USDT`,
      metadata: { receiptNumber: receiptNum },
    });

    this.saveState();
    return tx;
  }

  public adminReviewApplication(input: {
    applicationId: string;
    decision: 'approved' | 'declined';
    reason: string;
    adminUser: User;
  }): void {
    const app = this.state.applications.find(a => a.id === input.applicationId);
    if (!app) throw new Error('Application not found.');

    app.status = input.decision;
    const assessment = this.state.assessments.find(a => a.applicationId === input.applicationId);
    if (assessment) {
      assessment.decision = input.decision === 'approved' ? 'APPROVED' : 'DECLINED';
      assessment.underwriterNotes = input.reason;
      assessment.reviewedByUserId = input.adminUser.id;
      assessment.reviewedAt = new Date().toISOString();
    }

    this.logAudit({
      actorId: input.adminUser.id,
      actorEmail: input.adminUser.email,
      actorRole: input.adminUser.role,
      action: `ADMIN_DECISION_${input.decision.toUpperCase()}`,
      targetType: 'application',
      targetId: input.applicationId,
      description: `Loan officer ${input.adminUser.firstName} ${input.adminUser.lastName} determined application as ${input.decision.toUpperCase()}. Reason: ${input.reason}`,
    });

    this.saveState();
  }

  public updateStateRegulatoryRule(stateCode: string, updates: Partial<StateRegulatoryRule>): void {
    const rule = this.state.stateRules.find(r => r.stateCode === stateCode);
    if (rule) {
      Object.assign(rule, updates);
      this.logAudit({
        actorId: this.state.currentUser.id,
        actorEmail: this.state.currentUser.email,
        actorRole: this.state.currentUser.role,
        action: 'STATE_REGULATORY_RULE_UPDATED',
        targetType: 'config',
        targetId: stateCode,
        description: `Updated state product parameters for ${stateCode}: status=${rule.status}, maxApr=${rule.maxAprCapPercent}%`,
      });
      this.saveState();
    }
  }

  public updateSystemConfig(updates: Partial<SystemConfig>): void {
    Object.assign(this.state.systemConfig, updates);
    this.logAudit({
      actorId: this.state.currentUser.id,
      actorEmail: this.state.currentUser.email,
      actorRole: this.state.currentUser.role,
      action: 'SYSTEM_CONFIG_UPDATED',
      targetType: 'config',
      targetId: 'global_config',
      description: 'Modified platform operational configuration parameters',
    });
    this.saveState();
  }

  public createSupportTicket(input: {
    userId: string;
    subject: string;
    category: SupportTicket['category'];
    message: string;
  }): SupportTicket {
    const user = this.state.users.find(u => u.id === input.userId) || this.state.currentUser;
    const ticketId = `tkt-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      subject: input.subject,
      category: input.category,
      priority: 'normal',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: user.id,
          senderRole: 'user',
          senderName: `${user.firstName} ${user.lastName}`,
          message: input.message,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.state.supportTickets.unshift(newTicket);
    this.saveState();
    return newTicket;
  }

  public replyToTicket(ticketId: string, message: string, senderUser: User): void {
    const ticket = this.state.supportTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found.');

    ticket.messages.push({
      id: `msg-${Date.now()}`,
      senderId: senderUser.id,
      senderRole: senderUser.role === 'borrower' ? 'user' : 'support',
      senderName: `${senderUser.firstName} ${senderUser.lastName}`,
      message,
      timestamp: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();

    if (senderUser.role !== 'borrower' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    this.saveState();
  }
}

export const platformStore = new Store();
