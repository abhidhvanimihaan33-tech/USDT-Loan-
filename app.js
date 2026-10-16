/**
 * Tickerline — Namecheap cPanel Node.js Application Startup File (app.js)
 * Designed for CloudLinux Phusion Passenger / "Setup Node.js App" in cPanel.
 * Serves the compiled React frontend from /dist and Express REST API from /api.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
// CloudLinux Passenger assigns PORT automatically via environment variable
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Tickerline Digital Lending Platform',
    hosting: 'Namecheap Shared Hosting / cPanel',
    runtime: `Node.js ${process.version}`,
    timestamp: new Date().toISOString(),
    demoMode: true,
  });
});

app.get('/api/v1/config', (req, res) => {
  res.json({
    isDemoMode: true,
    usdtUsdExchangeRate: 1.0001,
    oracleSource: 'Chainlink Price Feeds (USDT / USD)',
    maxLoanAmountUsd: 35000,
    minLoanAmountUsd: 1000,
    supportedNetworks: [
      'Polygon PoS',
      'Arbitrum One',
      'Ethereum (ERC-20)',
      'Tron (TRC-20)',
      'Solana (SPL)',
    ],
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  res.json({
    message: 'Authenticated successfully',
    token: `tk_demo_${Date.now()}`,
    user: {
      email,
      role: email.includes('admin') ? 'super_admin' : 'borrower',
      isMfaEnabled: true,
    },
  });
});

app.post('/api/v1/applications/underwrite', (req, res) => {
  const { requestedAmountUsd, requestedTermMonths, grossMonthlyIncomeUsd, monthlyHousingExpenseUsd, otherMonthlyDebtPaymentsUsd } = req.body;

  if (!requestedAmountUsd || !requestedTermMonths || !grossMonthlyIncomeUsd) {
    return res.status(400).json({ error: 'Missing required financial inputs.' });
  }

  const totalDebts = Number(monthlyHousingExpenseUsd || 0) + Number(otherMonthlyDebtPaymentsUsd || 0);
  const estimatedMonthlyInstallment = (requestedAmountUsd / requestedTermMonths) * 1.1;
  const dti = Math.round(((totalDebts + estimatedMonthlyInstallment) / grossMonthlyIncomeUsd) * 1000) / 10;

  if (dti > 50.0) {
    return res.json({
      decision: 'DECLINED',
      calculatedDtiPercent: dti,
      reasons: ['Calculated DTI ratio exceeds maximum underwriting tolerance (50.0%).'],
      fcraNotice: 'Under the Fair Credit Reporting Act, you have the right to review your credit file within 60 days.',
    });
  }

  res.json({
    decision: 'APPROVED',
    calculatedDtiPercent: dti,
    offer: {
      principalUsdt: requestedAmountUsd,
      annualPercentageRate: 12.5,
      termMonths: requestedTermMonths,
      monthlyPaymentUsdt: Math.round(estimatedMonthlyInstallment * 100) / 100,
      originationFeeUsdt: Math.round(requestedAmountUsd * 0.03 * 100) / 100,
    },
  });
});

// Serve compiled static React app from dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA routing fallback: send index.html for any unhandled GET route
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('<h1>Tickerline Backend Active</h1><p>Please run <code>npm run build</code> to generate the frontend in /dist.</p>');
  });
}

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`Tickerline application listening on port ${PORT}`);
});
