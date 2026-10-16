# Tickerline — US Non-Collateralized USDT Lending Platform

Tickerline is a modern, US-focused digital lending application engineered to provide eligible US residents with fixed-installment, non-collateralized loans denominated in **USDT** based on legally permissible creditworthiness assessments, verified income, debt-to-income (DTI) capacity, and statutory compliance.

---

## Key Features

- **Decoupled from Crypto Volatility:** Eliminates overcollateralization (150%+) and margin call liquidations. Loans are evaluated on verified monthly income and legal repayment capacity.
- **Interactive Decimal-Safe Loan Calculator:** Dynamic sliders for amount ($1,000–$35,000) and term (6–36 months), fixed APR estimation (8.99%–29.99%), origination fee breakdown, live Chainlink oracle feed (1.0001 USD/USDT), and full monthly amortization schedule.
- **5-Step Loan Application Wizard:** Personal identity (KYC DOB 18+, tokenized SSN last-4, residential address), income & capacity verification ($3,000/mo threshold, DTI calculation), statutory consents (E-SIGN, FCRA § 604 credit inquiry authorization, GLBA privacy), and instant underwriting assessment.
- **FCRA Adverse Action Disclosures:** When an applicant is declined, the system automatically generates a legally formatted Adverse Action Notice citing specific denial reasons, credit score agency source, and 60-day dispute rights under 15 U.S.C. § 1681m.
- **TILA Regulation Z Promissory Note & E-Signature:** Federal Truth in Lending Act disclosure schedule disclosing APR, Finance Charge, Amount Financed, Total of Payments, and electronic execution.
- **Multi-Chain Non-Custodial USDT Disbursement:** Validates recipient wallet addresses across Polygon PoS, Arbitrum One, Ethereum (ERC-20), Tron (TRC-20), and Solana (SPL), with confirmation tracking and idempotency protection.
- **Borrower Dashboard & Repayment Center:** Outstanding balance tracking, amortization progress bar, monthly installments, and repayments via USDT smart vault transfer or ACH direct debit.
- **Compliance & Operations Admin Console (`/admin`):** Role-based access control (Super Admin, Compliance Officer, Loan Officer, Risk Analyst), applications queue, 50-state regulatory matrix editor, underwriting policy tuning, support ticket management, and an immutable audit trail.

---

## Deployment Documentation

- **For Namecheap Shared Hosting (cPanel):** See [NAMECHEAP_DEPLOYMENT_GUIDE.md](./NAMECHEAP_DEPLOYMENT_GUIDE.md) for full instructions on purchasing hosting, pointing domains, uploading static or Node builds, importing MySQL schemas, and configuring HTTPS.
- **For Ubuntu VPS & Docker:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for Nginx reverse proxy, PostgreSQL, Docker Compose, and automated backup crons.

---

## Available Scripts

In the project root, you can run:

```bash
# Start Vite development server on port 3000
npm run dev

# Run automated pre-deployment test suite (15 unit tests)
npm test

# Check TypeScript types without emitting code
npm run lint

# Build production bundle for static hosting / cPanel public_html
npm run build
```

---

## Production Readiness & Regulatory Notice

This software is provided with a functional demonstration and sandbox underwriting adapter. Live credit extension, credit bureau hard inquiries, and real USDT disbursements remain disabled until state consumer lending licenses (or bank partnership arrangements) and qualified custody contracts are executed.
