-- =====================================================================
-- TICKERLINE — MySQL / MariaDB Relational Database Schema
-- Optimized for Namecheap cPanel & phpMyAdmin Import (MySQL 5.7+ / 8.0 / MariaDB 10.3+)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ---------------------------------------------------------------------
-- 1. Table: users
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `role` ENUM('borrower', 'loan_officer', 'compliance_officer', 'risk_analyst', 'finance_operator', 'super_admin', 'auditor') NOT NULL DEFAULT 'borrower',
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `is_mfa_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `has_passkey` TINYINT(1) NOT NULL DEFAULT 0,
  `kyc_status` ENUM('unverified', 'pending', 'verified', 'rejected', 'documents_requested') NOT NULL DEFAULT 'unverified',
  `residential_state` CHAR(2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Table: kyc_profiles
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `kyc_profiles`;
CREATE TABLE `kyc_profiles` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `legal_first_name` VARCHAR(100) NOT NULL,
  `legal_last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `ssn_last_four_token` VARCHAR(32) NOT NULL,
  `street_address` VARCHAR(255) NOT NULL,
  `unit` VARCHAR(50) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` CHAR(2) NOT NULL,
  `zip_code` VARCHAR(10) NOT NULL,
  `id_document_type` VARCHAR(50) NOT NULL,
  `id_document_token` VARCHAR(128) NOT NULL,
  `id_status` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `citizenship_status` VARCHAR(50) NOT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kyc_user_id` (`user_id`),
  CONSTRAINT `fk_kyc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Table: consent_records
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `consent_records`;
CREATE TABLE `consent_records` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `consent_type` VARCHAR(100) NOT NULL,
  `version` VARCHAR(30) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_consents_user_id` (`user_id`),
  CONSTRAINT `fk_consent_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Table: loan_applications
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `loan_applications`;
CREATE TABLE `loan_applications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `requested_amount_usd` DECIMAL(12,2) NOT NULL,
  `requested_term_months` INT NOT NULL,
  `loan_purpose` VARCHAR(255) NOT NULL,
  `employment_status` VARCHAR(50) NOT NULL,
  `employer_name` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(150) NOT NULL,
  `years_employed` DECIMAL(4,1) NOT NULL,
  `gross_monthly_income_usd` DECIMAL(12,2) NOT NULL,
  `verified_monthly_income_usd` DECIMAL(12,2) NOT NULL,
  `monthly_housing_expense_usd` DECIMAL(12,2) NOT NULL,
  `other_monthly_debt_payments_usd` DECIMAL(12,2) NOT NULL,
  `income_verification_method` VARCHAR(50) NOT NULL,
  `status` ENUM('draft', 'submitted', 'underwriting_review', 'documents_required', 'approved', 'adverse_action', 'offer_expired', 'accepted', 'disbursed') NOT NULL DEFAULT 'submitted',
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_applications_user` (`user_id`),
  KEY `idx_applications_status` (`status`),
  CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Table: underwriting_assessments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `underwriting_assessments`;
CREATE TABLE `underwriting_assessments` (
  `id` VARCHAR(36) NOT NULL,
  `application_id` VARCHAR(36) NOT NULL,
  `calculated_dti_percent` DECIMAL(5,2) NOT NULL,
  `disposable_monthly_income_usd` DECIMAL(12,2) NOT NULL,
  `credit_tier` VARCHAR(50) NOT NULL,
  `estimated_credit_score` INT DEFAULT NULL,
  `decision` ENUM('APPROVED', 'MANUAL_REVIEW', 'DECLINED') NOT NULL,
  `decision_reasons` JSON DEFAULT NULL,
  `adverse_action_codes` JSON DEFAULT NULL,
  `underwriter_notes` TEXT DEFAULT NULL,
  `reviewed_by_user_id` VARCHAR(36) DEFAULT NULL,
  `reviewed_at` DATETIME DEFAULT NULL,
  `policy_version` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uw_app_id` (`application_id`),
  CONSTRAINT `fk_uw_app` FOREIGN KEY (`application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Table: loan_offers
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `loan_offers`;
CREATE TABLE `loan_offers` (
  `id` VARCHAR(36) NOT NULL,
  `application_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `principal_usd` DECIMAL(12,2) NOT NULL,
  `principal_usdt` DECIMAL(18,6) NOT NULL,
  `term_months` INT NOT NULL,
  `annual_percentage_rate` DECIMAL(5,2) NOT NULL,
  `nominal_interest_rate` DECIMAL(5,2) NOT NULL,
  `origination_fee_usd` DECIMAL(12,2) NOT NULL,
  `origination_fee_usdt` DECIMAL(18,6) NOT NULL,
  `net_disbursement_usdt` DECIMAL(18,6) NOT NULL,
  `monthly_payment_usd` DECIMAL(12,2) NOT NULL,
  `monthly_payment_usdt` DECIMAL(18,6) NOT NULL,
  `total_repayment_usd` DECIMAL(12,2) NOT NULL,
  `total_repayment_usdt` DECIMAL(18,6) NOT NULL,
  `total_finance_charge_usd` DECIMAL(12,2) NOT NULL,
  `first_payment_due_date` DATE NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_offers_app` (`application_id`),
  CONSTRAINT `fk_offer_app` FOREIGN KEY (`application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Table: active_loans
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `active_loans`;
CREATE TABLE `active_loans` (
  `id` VARCHAR(36) NOT NULL,
  `loan_number` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `application_id` VARCHAR(36) NOT NULL,
  `offer_id` VARCHAR(36) NOT NULL,
  `status` ENUM('pending_disbursement', 'disbursing', 'active', 'in_grace_period', 'delinquent', 'paid_off') NOT NULL DEFAULT 'active',
  `principal_usdt` DECIMAL(18,6) NOT NULL,
  `remaining_balance_usdt` DECIMAL(18,6) NOT NULL,
  `term_months` INT NOT NULL,
  `annual_percentage_rate` DECIMAL(5,2) NOT NULL,
  `monthly_payment_usdt` DECIMAL(18,6) NOT NULL,
  `total_paid_usdt` DECIMAL(18,6) NOT NULL DEFAULT 0.000000,
  `next_payment_due_date` DATE NOT NULL,
  `next_payment_amount_usdt` DECIMAL(18,6) NOT NULL,
  `origination_date` DATE NOT NULL,
  `maturity_date` DATE NOT NULL,
  `disbursement_network` VARCHAR(50) NOT NULL,
  `destination_wallet_address` VARCHAR(128) NOT NULL,
  `disbursement_tx_hash` VARCHAR(128) DEFAULT NULL,
  `disbursement_completed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loans_user` (`user_id`),
  KEY `idx_loans_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Table: repayment_schedules
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `repayment_schedules`;
CREATE TABLE `repayment_schedules` (
  `id` VARCHAR(36) NOT NULL,
  `loan_id` VARCHAR(36) NOT NULL,
  `installment_number` INT NOT NULL,
  `due_date` DATE NOT NULL,
  `principal_amount_usdt` DECIMAL(18,6) NOT NULL,
  `interest_amount_usdt` DECIMAL(18,6) NOT NULL,
  `total_due_usdt` DECIMAL(18,6) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `paid_at` DATETIME DEFAULT NULL,
  `paid_amount_usdt` DECIMAL(18,6) DEFAULT NULL,
  `transaction_ref` VARCHAR(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sched_loan_id` (`loan_id`),
  CONSTRAINT `fk_sched_loan` FOREIGN KEY (`loan_id`) REFERENCES `active_loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Table: repayment_transactions
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `repayment_transactions`;
CREATE TABLE `repayment_transactions` (
  `id` VARCHAR(36) NOT NULL,
  `loan_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `amount_usdt` DECIMAL(18,6) NOT NULL,
  `amount_usd_equivalent` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `network` VARCHAR(50) DEFAULT NULL,
  `tx_hash` VARCHAR(128) DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'completed',
  `receipt_number` VARCHAR(64) NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_repay_loan` (`loan_id`),
  KEY `idx_repay_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. Table: usdt_disbursements
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `usdt_disbursements`;
CREATE TABLE `usdt_disbursements` (
  `id` VARCHAR(36) NOT NULL,
  `loan_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `amount_usdt` DECIMAL(18,6) NOT NULL,
  `network` VARCHAR(50) NOT NULL,
  `recipient_address` VARCHAR(128) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `tx_hash` VARCHAR(128) NOT NULL,
  `block_confirmations` INT NOT NULL DEFAULT 0,
  `required_confirmations` INT NOT NULL,
  `idempotency_key` VARCHAR(128) NOT NULL UNIQUE,
  `is_demo_transaction` TINYINT(1) NOT NULL DEFAULT 1,
  `initiated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_disb_loan` (`loan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. Table: audit_events
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_events`;
CREATE TABLE `audit_events` (
  `id` VARCHAR(36) NOT NULL,
  `actor_id` VARCHAR(36) DEFAULT NULL,
  `actor_email` VARCHAR(255) NOT NULL,
  `actor_role` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `metadata` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_actor` (`actor_email`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. Table: state_regulatory_rules
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `state_regulatory_rules`;
CREATE TABLE `state_regulatory_rules` (
  `state_code` CHAR(2) NOT NULL,
  `state_name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `max_loan_amount_usd` DECIMAL(12,2) NOT NULL,
  `max_apr_cap_percent` DECIMAL(5,2) NOT NULL,
  `regulatory_body` VARCHAR(255) NOT NULL,
  `usury_cap_notes` TEXT NOT NULL,
  `requires_special_license` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`state_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- SEED INITIAL DATA: State Regulatory Matrix
-- ---------------------------------------------------------------------
INSERT INTO `state_regulatory_rules` (`state_code`, `state_name`, `status`, `max_loan_amount_usd`, `max_apr_cap_percent`, `regulatory_body`, `usury_cap_notes`, `requires_special_license`) VALUES
('CA', 'California', 'active', 35000.00, 36.00, 'DFPI (Department of Financial Protection and Innovation)', 'CFL License Required for loans under $10,000 with statutory rate limitations.', 1),
('TX', 'Texas', 'active', 35000.00, 30.00, 'OCCC (Office of Consumer Credit Commissioner)', 'Chapter 342 Subchapter F regulated lender authorization.', 1),
('FL', 'Florida', 'active', 25000.00, 30.00, 'OFR (Office of Financial Regulation)', 'Florida Consumer Finance Act compliance required.', 1),
('NY', 'New York', 'prohibited', 0.00, 16.00, 'NYDFS (New York Department of Financial Services)', 'Strict 16% civil usury limit and 25% criminal usury threshold prohibit unsecured digital lending under current rate tiers.', 1),
('IL', 'Illinois', 'active', 30000.00, 36.00, 'IDFPR (Illinois Dept of Financial & Professional Regulation)', 'Predatory Loan Prevention Act strict 36% all-in APR cap enforced.', 1),
('CO', 'Colorado', 'in_review', 20000.00, 21.00, 'Colorado Attorney General / UCCC', 'UCCC tiered finance rate structure under review for digital asset denomination.', 1),
('WA', 'Washington', 'active', 30000.00, 25.00, 'DFI (Department of Financial Institutions)', 'Consumer Loan Act (CLA) licensing framework.', 1),
('GA', 'Georgia', 'prohibited', 0.00, 16.00, 'DOB (Department of Banking and Finance)', 'Georgia Industrial Loan Act and usury cap restrictions prohibit standard digital product.', 1),
('OH', 'Ohio', 'active', 25000.00, 28.00, 'Ohio Division of Financial Institutions', 'General loan law compliance.', 0),
('NC', 'North Carolina', 'in_review', 15000.00, 30.00, 'NC Commissioner of Banks', 'Consumer finance licensing under evaluation.', 1),
('PA', 'Pennsylvania', 'active', 25000.00, 24.00, 'PA Department of Banking and Securities', 'Consumer Discount Company Act regulations apply.', 1),
('AZ', 'Arizona', 'active', 35000.00, 36.00, 'AZ Department of Insurance and Financial Institutions', 'Consumer lender licensing requirements satisfied.', 1);

-- ---------------------------------------------------------------------
-- SEED INITIAL DEMO USERS (Synthetic data for testing & compliance evaluation)
-- Note: Passwords in demo environment are bcrypt hashes or tokenized placeholders
-- ---------------------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `role`, `is_email_verified`, `is_mfa_enabled`, `has_passkey`, `kyc_status`, `residential_state`, `created_at`) VALUES
('usr-sarah-chen', 'sarah.chen@example.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1boPrRzGqmWBbvRt1z0U6sT2L6lQeW', 'Sarah', 'Chen', '+1 (415) 555-0182', 'borrower', 1, 1, 1, 'verified', 'CA', '2026-08-14 09:30:00'),
('usr-marcus-vance', 'marcus.vance@example.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1boPrRzGqmWBbvRt1z0U6sT2L6lQeW', 'Marcus', 'Vance', '+1 (512) 555-0199', 'borrower', 1, 0, 0, 'verified', 'TX', '2026-09-02 14:15:00'),
('usr-elena-rostova', 'elena.rostova@example.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1boPrRzGqmWBbvRt1z0U6sT2L6lQeW', 'Elena', 'Rostova', '+1 (305) 555-0144', 'borrower', 1, 1, 0, 'pending', 'FL', '2026-10-10 16:45:00'),
('adm-david-sterling', 'david.sterling@tickerline.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1boPrRzGqmWBbvRt1z0U6sT2L6lQeW', 'David', 'Sterling', NULL, 'super_admin', 1, 1, 1, 'verified', 'CA', '2026-01-01 00:00:00'),
('adm-rachel-adams', 'rachel.adams@tickerline.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1boPrRzGqmWBbvRt1z0U6sT2L6lQeW', 'Rachel', 'Adams', NULL, 'compliance_officer', 1, 1, 1, 'verified', 'TX', '2026-02-15 00:00:00'),
('adm-james-wilson', 'james.wilson@tickerline.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1boPrRzGqmWBbvRt1z0U6sT2L6lQeW', 'James', 'Wilson', NULL, 'loan_officer', 1, 1, 0, 'verified', 'FL', '2026-03-01 00:00:00');

SET FOREIGN_KEY_CHECKS = 1;
