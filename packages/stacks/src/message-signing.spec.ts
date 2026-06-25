import { stringAsciiCV, tupleCV, uintCV } from '@stacks/transactions';

import { signStructuredDataMessage, verifySip018Signature } from './message-signing';

// Mirrors the multisig proposal commitment: a SIP-018 structured signature over
// the proposal hash, wrapped in the proposal domain. Proves verify accepts what
// sign produces and rejects every tampering. (Real-data KAT against a live
// proposer pubkey folds in once that vault's signers are to hand.)
const privateKey = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';
// A valid compressed pubkey that is not the signer, for the wrong-signer case.
const otherPublicKey = '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9';

const domain = tupleCV({
  name: stringAsciiCV('leather-multisig-proposal-v1'),
  version: stringAsciiCV('1'),
  'chain-id': uintCV(1),
});
const message = stringAsciiCV('2a5f997755408a0a7f063923c830b3ae2fd3a26d8c19ab736ee523c3daf29a86');

describe(verifySip018Signature.name, () => {
  const { signature, publicKey } = signStructuredDataMessage(message, domain, privateKey);

  test('verifies a genuine SIP-018 signature', () => {
    expect(verifySip018Signature({ message, domain, signature, publicKey })).toBe(true);
  });

  test('rejects the signature against a different signer', () => {
    expect(verifySip018Signature({ message, domain, signature, publicKey: otherPublicKey })).toBe(
      false
    );
  });

  test('rejects a tampered message', () => {
    const tampered = stringAsciiCV(
      '0000000000000000000000000000000000000000000000000000000000000000'
    );
    expect(verifySip018Signature({ message: tampered, domain, signature, publicKey })).toBe(false);
  });

  test('rejects a tampered domain (different chain-id)', () => {
    const otherDomain = tupleCV({
      name: stringAsciiCV('leather-multisig-proposal-v1'),
      version: stringAsciiCV('1'),
      'chain-id': uintCV(2147483648),
    });
    expect(verifySip018Signature({ message, domain: otherDomain, signature, publicKey })).toBe(
      false
    );
  });

  test('returns false (does not throw) on a malformed signature', () => {
    expect(verifySip018Signature({ message, domain, signature: 'garbage', publicKey })).toBe(false);
  });
});
