/**
 * Tickerline — Core Domain Type Definitions
 * US-focused non-collateralized USDT lending platform
 */

export type UserRole = 
  | 'borrower'
  | 'loan_officer'
  | 'compliance_officer'
  | 'risk_analyst'
  | 'finance_operator'
  | 'super_admin'
  | 'auditor';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  hasPasskey: boolean;
  createdAt: string;
  lastLoginAt: string;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected' | 'documents_requested';
  residentialState: string;
}

export interface KYCProfile {
  userId: string;
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string; // YYYY-MM-DD (must be >= 18)
  ssnLastFour: string; // Tokenized/Masked only (e.g. "•••• 8912")
  streetAddress: string;
  unit?: string;
  city: string;
  state: string; // 2-letter US state
  zipCode: string;
  idDocumentType: 'drivers_license' | 'passport' | 'state_id';
  idDocumentNumberMasked: string;
  idVerifiedAt?: string;
  idStatus: 'pending' | 'verified' | 'flagged';
  citizenshipStatus: 'us_citizen' | 'permanent_resident';
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'electronic_communications' | 'credit_pull_authorization' | 'privacy_policy' | 'terms_of_service' | 'tila_disclosure';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  version: string;
  revokedAt?: string;
}

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'underwriting_review'
  | 'documents_required'
  | 'approved'
  | 'adverse_action'
  | 'offer_expired'
  | 'accepted'
  | 'disbursed';

export interface IncomeInformation {
  employmentStatus: 'full_time' | 'part_time' | 'self_employed' | 'other';
  employerName: string;
  jobTitle: string;
  yearsEmployed: number;
  grossMonthlyIncomeUsd: number;
  monthlyHousingExpenseUsd: number;
  otherMonthlyDebtPaymentsUsd: number;
  incomeVerificationMethod: 'instant_payroll_token' | 'bank_aggregate' | 'paystub_upload';
  verifiedMonthlyIncomeUsd: number;
}

export interface UnderwritingAssessment {
  id: string;
  applicationId: string;
  createdAt: string;
  calculatedDtiPercent: number; // (Housing + Existing Debt + Proposed Loan Payment) / Income * 100
  disposableMonthlyIncomeUsd: number;
  creditTier: 'Tier 1 (Excellent)' | 'Tier 2 (Good)' | 'Tier 3 (Fair)' | 'Tier 4 (High Risk)';
  estimatedCreditScore: number;
  decision: 'APPROVED' | 'MANUAL_REVIEW' | 'DECLINED';
  decisionReasons: string[];
  adverseActionCodes?: string[];
  underwriterNotes?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  policyVersion: string;
}

export interface LoanOffer {
  id: string;
  applicationId: string;
  userId: string;
  principalUsd: number;
  principalUsdt: number;
  termMonths: number;
  annualPercentageRate: number; // e.g., 14.50%
  nominalInterestRate: number; // e.g., 12.25%
  originationFeeUsd: number; // e.g., 3.0% of principal
  originationFeeUsdt: number;
  netDisbursementUsdt: number; // principalUsdt - originationFeeUsdt
  monthlyPaymentUsd: number;
  monthlyPaymentUsdt: number;
  totalRepaymentUsd: number;
  totalRepaymentUsdt: number;
  totalFinanceChargeUsd: number;
  paymentFrequency: 'monthly';
  firstPaymentDueDate: string;
  expiresAt: string;
  status: 'active' | 'accepted' | 'declined' | 'expired';
}

export interface TILADisclosure {
  annualPercentageRate: number;
  financeChargeUsd: number;
  amountFinancedUsd: number;
  totalOfPaymentsUsd: number;
  numberOfPayments: number;
  monthlyPaymentAmountUsd: number;
  firstDueDate: string;
  latePaymentFeeDescription: string;
  prepaymentPolicy: 'No prepayment penalties or fees';
}

export type UsdtNetwork = 
  | 'Ethereum (ERC-20)'
  | 'Polygon PoS'
  | 'Arbitrum One'
  | 'Tron (TRC-20)'
  | 'Solana (SPL)';

export interface ActiveLoan {
  id: string;
  loanNumber: string;
  userId: string;
  applicationId: string;
  offerId: string;
  status: 'pending_disbursement' | 'disbursing' | 'active' | 'in_grace_period' | 'delinquent' | 'paid_off';
  principalUsdt: number;
  remainingBalanceUsdt: number;
  termMonths: number;
  annualPercentageRate: number;
  monthlyPaymentUsdt: number;
  totalPaidUsdt: number;
  nextPaymentDueDate: string;
  nextPaymentAmountUsdt: number;
  originationDate: string;
  maturityDate: string;
  disbursementNetwork: UsdtNetwork;
  destinationWalletAddress: string;
  disbursementTxHash?: string;
  disbursementCompletedAt?: string;
}

export interface RepaymentScheduleItem {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmountUsdt: number;
  interestAmountUsdt: number;
  totalDueUsdt: number;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paidAt?: string;
  paidAmountUsdt?: number;
  transactionRef?: string;
}

export interface RepaymentTransaction {
  id: string;
  loanId: string;
  userId: string;
  amountUsdt: number;
  amountUsdEquivalent: number;
  timestamp: string;
  method: 'USDT_TRANSFER' | 'ACH_DEBIT';
  network?: UsdtNetwork;
  txHash?: string;
  status: 'confirming' | 'completed' | 'failed';
  receiptNumber: string;
}

export interface UsdtDisbursement {
  id: string;
  loanId: string;
  userId: string;
  amountUsdt: number;
  network: UsdtNetwork;
  recipientAddress: string;
  status: 'queued' | 'monitoring' | 'confirmed' | 'failed';
  txHash: string;
  blockConfirmations: number;
  requiredConfirmations: number;
  idempotencyKey: string;
  initiatedAt: string;
  completedAt?: string;
  isDemoTransaction: boolean;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetType: 'application' | 'loan' | 'user' | 'config' | 'disbursement' | 'repayment';
  targetId: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: 'loan_status' | 'disbursement' | 'repayments' | 'identity_verification' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_on_user' | 'resolved';
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderRole: 'user' | 'support';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export interface StateRegulatoryRule {
  stateCode: string;
  stateName: string;
  status: 'active' | 'in_review' | 'prohibited';
  maxLoanAmountUsd: number;
  maxAprCapPercent: number; // e.g. 36.00
  regulatoryBody: string;
  usuryCapNotes: string;
  requiresSpecialLicense: boolean;
}

export interface SystemConfig {
  isDemoMode: boolean;
  usdtUsdExchangeRate: number; // e.g. 1.0001
  oracleLastUpdated: string;
  maxBorrowerDtiPercent: number; // default 45%
  minMonthlyIncomeUsd: number; // default $3,000
  requireDualApprovalAboveUsd: number; // default $10,000
  supportedNetworks: UsdtNetwork[];
  disbursementFeeUsdt: number;
}
