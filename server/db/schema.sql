-- Tickerline Database DDL Schema (PostgreSQL 15+)
-- Production relational schema for US consumer lending platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM (
  'borrower',
  'loan_officer',
  'compliance_officer',
  'risk_analyst',
  'finance_operator',
  'super_admin',
  'auditor'
);

CREATE TYPE kyc_status_enum AS ENUM (
  'unverified',
  'pending',
  'verified',
  'rejected',
  'documents_requested'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  role user_role NOT NULL DEFAULT 'borrower',
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  has_passkey BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_status kyc_status_enum NOT NULL DEFAULT 'unverified',
  residential_state CHAR(2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. TOKENIZED KYC PROFILES
CREATE TABLE kyc_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  legal_first_name VARCHAR(100) NOT NULL,
  legal_last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  ssn_last_four_token VARCHAR(32) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  id_document_type VARCHAR(50) NOT NULL,
  id_document_token VARCHAR(128) NOT NULL,
  id_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  citizenship_status VARCHAR(50) NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyc_user_id ON kyc_profiles(user_id);

-- 3. CONSENT RECORDS (E-SIGN & FCRA § 604)
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  version VARCHAR(30) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- 4. LOAN APPLICATIONS
CREATE TYPE application_status_enum AS ENUM (
  'draft',
  'submitted',
  'underwriting_review',
  'documents_required',
  'approved',
  'adverse_action',
  'offer_expired',
  'accepted',
  'disbursed'
);

CREATE TABLE loan_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  requested_amount_usd NUMERIC(12, 2) NOT NULL CHECK (requested_amount_usd >= 1000 AND requested_amount_usd <= 35000),
  requested_term_months INTEGER NOT NULL CHECK (requested_term_months IN (6, 12, 18, 24, 36)),
  loan_purpose VARCHAR(255) NOT NULL,
  employment_status VARCHAR(50) NOT NULL,
  employer_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(150) NOT NULL,
  years_employed NUMERIC(4, 1) NOT NULL,
  gross_monthly_income_usd NUMERIC(12, 2) NOT NULL,
  verified_monthly_income_usd NUMERIC(12, 2) NOT NULL,
  monthly_housing_expense_usd NUMERIC(12, 2) NOT NULL,
  other_monthly_debt_payments_usd NUMERIC(12, 2) NOT NULL,
  income_verification_method VARCHAR(50) NOT NULL,
  status application_status_enum NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_applications_status ON loan_applications(status);

-- 5. UNDERWRITING ASSESSMENTS
CREATE TYPE underwriting_decision_enum AS ENUM ('APPROVED', 'MANUAL_REVIEW', 'DECLINED');

CREATE TABLE underwriting_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  calculated_dti_percent NUMERIC(5, 2) NOT NULL,
  disposable_monthly_income_usd NUMERIC(12, 2) NOT NULL,
  credit_tier VARCHAR(50) NOT NULL,
  estimated_credit_score INTEGER,
  decision underwriting_decision_enum NOT NULL,
  decision_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  adverse_action_codes JSONB,
  underwriter_notes TEXT,
  reviewed_by_user_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  policy_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uw_application_id ON underwriting_assessments(application_id);

-- 6. LOAN OFFERS
CREATE TABLE loan_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  principal_usd NUMERIC(12, 2) NOT NULL,
  principal_usdt NUMERIC(18, 6) NOT NULL,
  term_months INTEGER NOT NULL,
  annual_percentage_rate NUMERIC(5, 2) NOT NULL,
  nominal_interest_rate NUMERIC(5, 2) NOT NULL,
  origination_fee_usd NUMERIC(12, 2) NOT NULL,
  origination_fee_usdt NUMERIC(18, 6) NOT NULL,
  net_disbursement_usdt NUMERIC(18, 6) NOT NULL,
  monthly_payment_usd NUMERIC(12, 2) NOT NULL,
  monthly_payment_usdt NUMERIC(18, 6) NOT NULL,
  total_repayment_usd NUMERIC(12, 2) NOT NULL,
  total_repayment_usdt NUMERIC(18, 6) NOT NULL,
  total_finance_charge_usd NUMERIC(12, 2) NOT NULL,
  first_payment_due_date DATE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ACTIVE CONSUMER LOANS
CREATE TYPE loan_status_enum AS ENUM (
  'pending_disbursement',
  'disbursing',
  'active',
  'in_grace_period',
  'delinquent',
  'paid_off'
);

CREATE TABLE active_loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number VARCHAR(64) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  application_id UUID NOT NULL REFERENCES loan_applications(id),
  offer_id UUID NOT NULL REFERENCES loan_offers(id),
  status loan_status_enum NOT NULL DEFAULT 'active',
  principal_usdt NUMERIC(18, 6) NOT NULL,
  remaining_balance_usdt NUMERIC(18, 6) NOT NULL,
  term_months INTEGER NOT NULL,
  annual_percentage_rate NUMERIC(5, 2) NOT NULL,
  monthly_payment_usdt NUMERIC(18, 6) NOT NULL,
  total_paid_usdt NUMERIC(18, 6) NOT NULL DEFAULT 0,
  next_payment_due_date DATE NOT NULL,
  next_payment_amount_usdt NUMERIC(18, 6) NOT NULL,
  origination_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  disbursement_network VARCHAR(50) NOT NULL,
  destination_wallet_address VARCHAR(128) NOT NULL,
  disbursement_tx_hash VARCHAR(128),
  disbursement_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_active_loans_user_id ON active_loans(user_id);
CREATE INDEX idx_active_loans_status ON active_loans(status);

-- 8. REPAYMENT SCHEDULES (AMORTIZATION)
CREATE TABLE repayment_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES active_loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_amount_usdt NUMERIC(18, 6) NOT NULL,
  interest_amount_usdt NUMERIC(18, 6) NOT NULL,
  total_due_usdt NUMERIC(18, 6) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  paid_amount_usdt NUMERIC(18, 6),
  transaction_ref VARCHAR(128)
);

CREATE INDEX idx_schedules_loan_id ON repayment_schedules(loan_id);

-- 9. REPAYMENT TRANSACTIONS
CREATE TABLE repayment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES active_loans(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount_usdt NUMERIC(18, 6) NOT NULL,
  amount_usd_equivalent NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  network VARCHAR(50),
  tx_hash VARCHAR(128),
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  receipt_number VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. USDT DISBURSEMENTS & IDEMPOTENCY
CREATE TABLE usdt_disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES active_loans(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount_usdt NUMERIC(18, 6) NOT NULL,
  network VARCHAR(50) NOT NULL,
  recipient_address VARCHAR(128) NOT NULL,
  status VARCHAR(30) NOT NULL,
  tx_hash VARCHAR(128) NOT NULL,
  block_confirmations INTEGER NOT NULL DEFAULT 0,
  required_confirmations INTEGER NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL UNIQUE,
  is_demo_transaction BOOLEAN NOT NULL DEFAULT TRUE,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 11. IMMUTABLE AUDIT TRAIL
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_events(actor_email);
CREATE INDEX idx_audit_action ON audit_events(action);
CREATE INDEX idx_audit_timestamp ON audit_events(created_at DESC);

-- 12. STATE REGULATORY RULES MATRIX
CREATE TABLE state_regulatory_rules (
  state_code CHAR(2) PRIMARY KEY,
  state_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  max_loan_amount_usd NUMERIC(12, 2) NOT NULL,
  max_apr_cap_percent NUMERIC(5, 2) NOT NULL,
  regulatory_body VARCHAR(255) NOT NULL,
  usury_cap_notes TEXT NOT NULL,
  requires_special_license BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
