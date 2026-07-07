import { signStructuredData, stringAsciiCV } from '@stacks/transactions';
import { describe, expect, it } from 'vitest';

import { buildStxProposalDomain, stxChainIdByAuthNetworkId } from './stx-proposal-domain';

describe('buildStxProposalDomain', () => {
  const privateKey = '753b7cc01a1a2e86221266a154af739463fc75c354d29169b58f20da43e8e1d601';
  const proposalHash = '9ca717cea2e28cce2dd2db175ed9bc5a959748cade6c4e1bf11eacc53dd54c6c';
  const expectedSignature =
    'c0acd61501de19283c2b6e78420c171a59bd4d3a90e19ee3d5c18418b200b1ab' +
    '0e060238178dc8306051342f928e988e6d5eb5f0a084ac53772ca9941e699bcc' +
    '00';

  it('reproduces the expected mainnet SIP-018 signature for the test key', () => {
    const signature = signStructuredData({
      message: stringAsciiCV(proposalHash),
      domain: buildStxProposalDomain(stxChainIdByAuthNetworkId['stx:mainnet']),
      privateKey,
    });
    expect(signature).toBe(expectedSignature);
  });

  it('binds chain-id — testnet domain yields a different signature', () => {
    const mainnet = signStructuredData({
      message: stringAsciiCV(proposalHash),
      domain: buildStxProposalDomain(stxChainIdByAuthNetworkId['stx:mainnet']),
      privateKey,
    });
    const testnet = signStructuredData({
      message: stringAsciiCV(proposalHash),
      domain: buildStxProposalDomain(stxChainIdByAuthNetworkId['stx:testnet']),
      privateKey,
    });
    expect(testnet).not.toBe(mainnet);
  });

  it('uses a custom chain-id when provided', () => {
    const mainnet = signStructuredData({
      message: stringAsciiCV(proposalHash),
      domain: buildStxProposalDomain(stxChainIdByAuthNetworkId['stx:mainnet']),
      privateKey,
    });
    const custom = signStructuredData({
      message: stringAsciiCV(proposalHash),
      domain: buildStxProposalDomain(256),
      privateKey,
    });
    expect(custom).not.toBe(mainnet);
  });
});
