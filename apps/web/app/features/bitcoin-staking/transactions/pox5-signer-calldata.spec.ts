import { poxAddressToTuple } from '@stacks/stacking';
import { ClarityType, deserializeCV, noneCV, someCV, tupleCV, uintCV } from '@stacks/transactions';

import { decodePayoutPreference, encodeSignerCalldata } from './pox5-signer-calldata';

function deserializeCalldataTuple(encoded: ReturnType<typeof encodeSignerCalldata>) {
  if (encoded.type !== ClarityType.OptionalSome) throw new Error('Expected some calldata');
  if (encoded.value.type !== ClarityType.Buffer) throw new Error('Expected a buffer');
  const tuple = deserializeCV(encoded.value.value);
  if (tuple.type !== ClarityType.Tuple) throw new Error('Expected a tuple');
  return tuple;
}

const p2wpkhAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const p2trAddress = 'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9';
const p2pkhAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';

describe(encodeSignerCalldata.name, () => {
  test('encodes undefined preference as none', () => {
    expect(encodeSignerCalldata(undefined)).toEqual(noneCV());
  });

  test('round-trips a segwit payout preference', () => {
    const preference = { btcRewardAddress: p2wpkhAddress, maxFeeSats: 5000n };
    const encoded = encodeSignerCalldata(preference);
    expect(encoded.type).toEqual(ClarityType.OptionalSome);
    expect(decodePayoutPreference(encoded, 'mainnet')).toEqual(preference);
  });

  test('round-trips a taproot payout preference', () => {
    const preference = { btcRewardAddress: p2trAddress, maxFeeSats: 0n };
    expect(decodePayoutPreference(encodeSignerCalldata(preference), 'mainnet')).toEqual(preference);
  });

  test('round-trips a legacy payout preference with a large max fee', () => {
    const preference = { btcRewardAddress: p2pkhAddress, maxFeeSats: 2n ** 64n };
    expect(decodePayoutPreference(encodeSignerCalldata(preference), 'mainnet')).toEqual(preference);
  });

  test('round-trips a payout preference with a min claim', () => {
    const preference = {
      btcRewardAddress: p2wpkhAddress,
      maxFeeSats: 5000n,
      minClaimSats: 25_000n,
    };
    expect(decodePayoutPreference(encodeSignerCalldata(preference), 'mainnet')).toEqual(preference);
  });

  test('omits min-claim from the tuple when it is not set', () => {
    const preference = { btcRewardAddress: p2wpkhAddress, maxFeeSats: 5000n };
    const decoded = decodePayoutPreference(encodeSignerCalldata(preference), 'mainnet');
    expect(decoded).not.toBeNull();
    expect(decoded && 'minClaimSats' in decoded).toBe(false);
  });

  test('encodes an address-only preference as a tuple with just the pox-addr key', () => {
    const tuple = deserializeCalldataTuple(encodeSignerCalldata({ btcRewardAddress: p2trAddress }));
    expect(Object.keys(tuple.value)).toEqual(['pox-addr']);
    expect(tuple.value['pox-addr']).toEqual(poxAddressToTuple(p2trAddress));
  });

  test('round-trips an address-only preference', () => {
    const preference = { btcRewardAddress: p2wpkhAddress };
    expect(decodePayoutPreference(encodeSignerCalldata(preference), 'mainnet')).toEqual(preference);
  });
});

describe(decodePayoutPreference.name, () => {
  test('returns null for none', () => {
    expect(decodePayoutPreference(noneCV(), 'mainnet')).toBeNull();
  });

  test('decodes the deserialized get-pox-addr tuple shape', () => {
    const onChainValue = someCV(
      tupleCV({
        'pox-addr': poxAddressToTuple(p2wpkhAddress),
        'max-fee': uintCV(1234n),
      })
    );
    expect(decodePayoutPreference(onChainValue, 'mainnet')).toEqual({
      btcRewardAddress: p2wpkhAddress,
      maxFeeSats: 1234n,
    });
  });

  test('decodes the deserialized get-payout-config tuple shape with min-claim', () => {
    const onChainValue = someCV(
      tupleCV({
        'pox-addr': poxAddressToTuple(p2wpkhAddress),
        'max-fee': uintCV(1234n),
        'min-claim': uintCV(1781n),
      })
    );
    expect(decodePayoutPreference(onChainValue, 'mainnet')).toEqual({
      btcRewardAddress: p2wpkhAddress,
      maxFeeSats: 1234n,
      minClaimSats: 1781n,
    });
  });

  test('decodes a pox-addr tuple without max-fee as an address-only preference', () => {
    const missingFee = someCV(tupleCV({ 'pox-addr': poxAddressToTuple(p2wpkhAddress) }));
    expect(decodePayoutPreference(missingFee, 'mainnet')).toEqual({
      btcRewardAddress: p2wpkhAddress,
    });
  });

  test('decodes the flat {version, hashbytes} shape returned by an operator-paid pool', () => {
    const flat = someCV(poxAddressToTuple(p2trAddress));
    expect(decodePayoutPreference(flat, 'mainnet')).toEqual({ btcRewardAddress: p2trAddress });
  });

  test('returns null for a tuple with neither shape', () => {
    const unrelated = someCV(tupleCV({ 'max-fee': uintCV(1n) }));
    expect(decodePayoutPreference(unrelated, 'mainnet')).toBeNull();
  });
});
