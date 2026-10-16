<?php
/**
 * Tickerline — PHP Config Endpoint for Namecheap cPanel
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

echo json_encode([
    'isDemoMode' => true,
    'usdtUsdExchangeRate' => 1.0001,
    'oracleSource' => 'Chainlink Price Feeds (USDT / USD)',
    'maxLoanAmountUsd' => 35000,
    'minLoanAmountUsd' => 1000,
    'supportedNetworks' => [
        'Polygon PoS',
        'Arbitrum One',
        'Ethereum (ERC-20)',
        'Tron (TRC-20)',
        'Solana (SPL)'
    ]
], JSON_PRETTY_PRINT);
