<?php
/**
 * Tickerline — PHP Health Check Endpoint for Namecheap cPanel
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

echo json_encode([
    'status' => 'healthy',
    'platform' => 'Tickerline Digital Lending Platform',
    'hosting' => 'Namecheap Shared Hosting (cPanel Apache / PHP)',
    'php_version' => PHP_VERSION,
    'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
    'demoMode' => true
], JSON_PRETTY_PRINT);
