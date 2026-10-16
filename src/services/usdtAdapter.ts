/**
 * Tickerline — USDT Provider Abstraction & Digital Asset Adapter
 * Supports multi-network USDT validation, institutional custody provider interface,
 * idempotency protection, and simulated testnet/demo confirmations.
 */

import { UsdtNetwork, UsdtDisbursement } from '../types';

export interface WalletValidationResult {
  isValid: boolean;
  network: UsdtNetwork;
  normalizedAddress?: string;
  errorMessage?: string;
}

export interface NetworkSpecs {
  name: UsdtNetwork;
  tokenStandard: string;
  contractAddress: string;
  requiredConfirmations: number;
  averageBlockTimeSec: number;
  typicalTransferFeeUsdt: number;
  explorerUrlPrefix: string;
}

export const SUPPORTED_NETWORKS: Record<UsdtNetwork, NetworkSpecs> = {
  'Polygon PoS': {
    name: 'Polygon PoS',
    tokenStandard: 'ERC-20 (Bridged)',
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    requiredConfirmations: 64,
    averageBlockTimeSec: 2,
    typicalTransferFeeUsdt: 0.15,
    explorerUrlPrefix: 'https://polygonscan.com/tx/',
  },
  'Arbitrum One': {
    name: 'Arbitrum One',
    tokenStandard: 'Native USDT',
    contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    requiredConfirmations: 30,
    averageBlockTimeSec: 1,
    typicalTransferFeeUsdt: 0.25,
    explorerUrlPrefix: 'https://arbiscan.io/tx/',
  },
  'Ethereum (ERC-20)': {
    name: 'Ethereum (ERC-20)',
    tokenStandard: 'ERC-20',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    requiredConfirmations: 12,
    averageBlockTimeSec: 12,
    typicalTransferFeeUsdt: 3.50,
    explorerUrlPrefix: 'https://etherscan.io/tx/',
  },
  'Tron (TRC-20)': {
    name: 'Tron (TRC-20)',
    tokenStandard: 'TRC-20',
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    requiredConfirmations: 19,
    averageBlockTimeSec: 3,
    typicalTransferFeeUsdt: 1.00,
    explorerUrlPrefix: 'https://tronscan.org/#/transaction/',
  },
  'Solana (SPL)': {
    name: 'Solana (SPL)',
    tokenStandard: 'SPL Token',
    contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    requiredConfirmations: 32,
    averageBlockTimeSec: 0.4,
    typicalTransferFeeUsdt: 0.05,
    explorerUrlPrefix: 'https://solscan.io/tx/',
  },
};

/**
 * Validates destination USDT address according to network cryptography specs
 */
export function validateRecipientAddress(address: string, network: UsdtNetwork): WalletValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    return { isValid: false, network, errorMessage: 'Recipient address cannot be empty.' };
  }

  // EVM networks (Ethereum, Polygon, Arbitrum)
  if (network === 'Ethereum (ERC-20)' || network === 'Polygon PoS' || network === 'Arbitrum One') {
    const isEvmFormat = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    if (!isEvmFormat) {
      return {
        isValid: false,
        network,
        errorMessage: `Invalid ${network} address format. Must begin with '0x' followed by 40 hexadecimal characters.`,
      };
    }
    return { isValid: true, network, normalizedAddress: trimmed.toLowerCase() };
  }

  // Tron (TRC-20)
  if (network === 'Tron (TRC-20)') {
    const isTronFormat = /^T[a-zA-Z0-9]{33}$/.test(trimmed);
    if (!isTronFormat) {
      return {
        isValid: false,
        network,
        errorMessage: "Invalid Tron TRC-20 address format. Must begin with 'T' and be 34 base58 characters.",
      };
    }
    return { isValid: true, network, normalizedAddress: trimmed };
  }

  // Solana (SPL)
  if (network === 'Solana (SPL)') {
    const isSolanaFormat = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
    if (!isSolanaFormat) {
      return {
        isValid: false,
        network,
        errorMessage: 'Invalid Solana address format. Must be a valid Base58 encoded public key (32-44 characters).',
      };
    }
    return { isValid: true, network, normalizedAddress: trimmed };
  }

  return { isValid: false, network, errorMessage: 'Unsupported network selected.' };
}

/**
 * Demo Mode USDT Disbursement Adapter
 * Generates synthetic institutional transaction hash and simulated confirmation lifecycle
 */
export function initiateDemoDisbursement(
  loanId: string,
  userId: string,
  amountUsdt: number,
  network: UsdtNetwork,
  recipientAddress: string,
  idempotencyKey: string
): UsdtDisbursement {
  const specs = SUPPORTED_NETWORKS[network];

  // Deterministic-looking synthetic hash
  const hexPart = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const txHash = network === 'Tron (TRC-20)' ? hexPart : `0x${hexPart}`;

  return {
    id: `disb-${Date.now().toString(36)}`,
    loanId,
    userId,
    amountUsdt,
    network,
    recipientAddress,
    status: 'queued',
    txHash,
    blockConfirmations: 0,
    requiredConfirmations: specs.requiredConfirmations,
    idempotencyKey,
    initiatedAt: new Date().toISOString(),
    isDemoTransaction: true,
  };
}

/**
 * Formats explorer transaction link
 */
export function getExplorerUrl(txHash: string, network: UsdtNetwork): string {
  const specs = SUPPORTED_NETWORKS[network];
  return `${specs.explorerUrlPrefix}${txHash}`;
}
