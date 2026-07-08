import { describe, expect, it, vi } from 'vitest';

import { computeProposalHash, decodeProposalPayload } from '@leather.io/crypto';

import { walletPropose } from './wallet-propose';

describe('walletPropose', () => {
  const multisigAddress = 'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G';

  it('builds a BTC propose request, decoding the PSBT payload as base64 for the hash', async () => {
    const rawPayload = 'AQID'; // base64 of [1,2,3]
    let receivedHash = '';
    const signProposalCommitment = vi.fn((_network: string, hash: string) => {
      receivedHash = hash;
      return Promise.resolve('btc-signature');
    });

    const request = await walletPropose({
      network: 'btc:mainnet',
      multisigAddress,
      rawPayload,
      signProposalCommitment,
    });

    expect(request.multisigAddress).toBe(multisigAddress);
    expect(request.rawPayload).toBe(rawPayload);
    expect(request.proposalSignature).toBe('btc-signature');
    expect(typeof request.proposalTimestamp).toBe('number');
    expect(signProposalCommitment).toHaveBeenCalledWith('btc:mainnet', expect.any(String));
    expect(receivedHash).toBe(
      computeProposalHash({
        multisigAddress,
        rawPayload: decodeProposalPayload('btc', rawPayload),
        proposalTimestamp: request.proposalTimestamp,
      })
    );
  });

  it('builds an STX propose request, decoding the raw tx payload as hex for the hash', async () => {
    const rawPayload = '00112233';
    let receivedHash = '';
    const signProposalCommitment = vi.fn((_network: string, hash: string) => {
      receivedHash = hash;
      return Promise.resolve('stx-signature');
    });

    const request = await walletPropose({
      network: 'stx:testnet',
      multisigAddress,
      rawPayload,
      signProposalCommitment,
    });

    expect(request.proposalSignature).toBe('stx-signature');
    expect(receivedHash).toBe(
      computeProposalHash({
        multisigAddress,
        rawPayload: decodeProposalPayload('stx', rawPayload),
        proposalTimestamp: request.proposalTimestamp,
      })
    );
  });
});
