import { base64 } from '@scure/base';

import { verifyP2wpkhBip322Signature } from './verify-message-bip322';

// Known-answer test against a real multisig proposal commitment: the proposer
// signed the proposal hash with their P2WPKH identity key via the wallet's
// signMessage, and we captured the resulting BIP-322 signature live. Both ends
// must agree this verifies; the backend uses the same library.
const proposer = {
  address: 'bc1qwfnhmwpth429l7xmgnej2gdx2frlpe8s28qc4c',
  proposalHash: '2e44a0213859a47c604f8e1bcf1e6110ee4868f4bc20cda25800ad77962372e1',
  signature:
    'AkcwRAIgRTAdNyEvAfMOaqH6zK6FLmGgu1Oj3fXbhOAyI+JCf5sCIDq0P71sF67OvpdQ5BDSPq9xji3anjrprzy7G7nrDV9QASECGh/fS9fdUtXmcsEj41k23vK36fX/RU0+P2WEBqCznB4=',
};

// A co-signer's address on the same vault account, used to confirm the signature
// does not verify against the wrong signer.
const otherSignerAddress = 'bc1q3gxpkrm4hnyvrf6x47vva2y64srpq8l220r79f';

describe(verifyP2wpkhBip322Signature.name, () => {
  test('verifies a genuine BIP-322 proposal commitment', () => {
    expect(
      verifyP2wpkhBip322Signature(proposer.address, proposer.proposalHash, proposer.signature)
    ).toBe(true);
  });

  test('rejects the signature against a different signer address', () => {
    expect(
      verifyP2wpkhBip322Signature(otherSignerAddress, proposer.proposalHash, proposer.signature)
    ).toBe(false);
  });

  test('rejects a tampered message', () => {
    const tamperedHash = proposer.proposalHash.replace(/^2e/, '2f');
    expect(verifyP2wpkhBip322Signature(proposer.address, tamperedHash, proposer.signature)).toBe(
      false
    );
  });

  test('returns false (does not throw) on malformed signature', () => {
    expect(
      verifyP2wpkhBip322Signature(proposer.address, proposer.proposalHash, 'not-base64!!')
    ).toBe(false);
  });

  test('rejects an empty witness stack', () => {
    // A single 0x00 byte is a witness stack with zero items.
    const emptyStack = base64.encode(Uint8Array.from([0x00]));
    expect(verifyP2wpkhBip322Signature(proposer.address, proposer.proposalHash, emptyStack)).toBe(
      false
    );
  });

  test('rejects a witness stack without the expected [signature, pubkey] pair', () => {
    // Count 1, one 1-byte item: structurally valid, but not a P2WPKH witness.
    const oneItemStack = base64.encode(Uint8Array.from([0x01, 0x01, 0xff]));
    expect(verifyP2wpkhBip322Signature(proposer.address, proposer.proposalHash, oneItemStack)).toBe(
      false
    );
  });
});
