import { describe, expect, test } from 'vitest';

import {
  getAddresses,
  open,
  sendTransfer,
  signMessage,
  signPsbt,
  stxCallContract,
  stxDeployContract,
  stxGetAddresses,
  stxSignMessage,
  stxSignStructuredMessage,
  stxSignTransaction,
  stxTransferSip9Nft,
  stxTransferSip10Ft,
  stxTransferStx,
  supportedMethods,
} from '@leather.io/rpc';

import { methodsRequiringConnectedWallet } from './methods-requiring-connected-wallet';

describe('methodsRequiringConnectedWallet', () => {
  test('guards every signing and transfer method', () => {
    const guarded = [
      signPsbt,
      signMessage,
      sendTransfer,
      stxSignMessage,
      stxSignStructuredMessage,
      stxSignTransaction,
      stxCallContract,
      stxDeployContract,
      stxTransferStx,
      stxTransferSip9Nft,
      stxTransferSip10Ft,
    ];

    for (const endpoint of guarded)
      expect(methodsRequiringConnectedWallet.has(endpoint.method)).toBe(true);
  });

  test('does not guard the connect and metadata methods', () => {
    const unguarded = [getAddresses, stxGetAddresses, open, supportedMethods];

    for (const endpoint of unguarded)
      expect(methodsRequiringConnectedWallet.has(endpoint.method)).toBe(false);
  });
});
