import { stringAsciiCV } from '@stacks/transactions';

import { buildStxProposalDomain } from '@leather.io/stacks';

import { deriveStructuredMessageHash } from './message-signing.utils';

describe(deriveStructuredMessageHash.name, () => {
  test('hashes the SIP-018 payload bytes, matching the hash shown on Ledger', () => {
    const message = stringAsciiCV(
      'a7b7bac4ade1a7a44c8bf5a187984ae38cc9823306a5e9f333b1f9df22aa3a92'
    );
    const domain = buildStxProposalDomain(1);

    expect(deriveStructuredMessageHash({ message, domain })).toEqual(
      'c35fc9309df95f572399b16c2a50f2ac101cc3ae21b0d6542a9d4cb6a8472498'
    );
  });
});
