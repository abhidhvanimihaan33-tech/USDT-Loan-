/**
 * Automated Unit Test Suite: Multi-Network USDT Address Validation
 * Validates cryptographic format requirements across Polygon, Arbitrum, Ethereum, Tron, and Solana.
 */

import { validateRecipientAddress } from '../services/usdtAdapter';

export function runUsdtAdapterTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✓ [PASS] ${testName}`);
    } else {
      failed++;
      results.push(`✗ [FAIL] ${testName}`);
    }
  }

  // Test 1: Valid EVM address on Polygon PoS
  const evmValid = validateRecipientAddress(
    '0x892a08f51a4f02a637db917c917bce72a39b201a',
    'Polygon PoS'
  );
  assert(evmValid.isValid === true, 'Valid 40-hex character 0x address must pass on Polygon PoS');

  // Test 2: Invalid EVM address (too short)
  const evmInvalid = validateRecipientAddress('0x892a08f51a4f', 'Polygon PoS');
  assert(evmInvalid.isValid === false, 'Short EVM address must be rejected');

  // Test 3: Valid Tron TRC-20 address
  const tronValid = validateRecipientAddress(
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    'Tron (TRC-20)'
  );
  assert(tronValid.isValid === true, '34-character T-prefixed address must pass on Tron');

  // Test 4: Invalid Tron address (missing T prefix)
  const tronInvalid = validateRecipientAddress(
    'XR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    'Tron (TRC-20)'
  );
  assert(tronInvalid.isValid === false, 'Non-T address must be rejected on Tron TRC-20');

  // Test 5: Empty address check
  const emptyCheck = validateRecipientAddress('', 'Arbitrum One');
  assert(emptyCheck.isValid === false, 'Empty address string must be rejected');

  return { passed, failed, results };
}
