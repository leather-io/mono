import { Output, networks } from '@bitcoinerlab/descriptors';
import { type LedgerState, registerLedgerWallet } from '@bitcoinerlab/descriptors/ledger';
import AppClient from '@ledgerhq/ledger-bitcoin';
import { hexToBytes } from '@noble/hashes/utils';

import {
  compileWshDescriptor,
  toCompilableWshDescriptor,
  toLedgerSignableDescriptor,
} from '@leather.io/bitcoin';

const xpubs = [
  'xpub6DFfyxrMEUfR9Fyczq5xK1m8C3zKfi97mZDt3u4UnjjaWPW8q1PY4UogPFbdp4ibSDnmaHZrNCUYwmzj2GjBYVcaJMvniK2chBMqdbebH5f',
  'xpub6DFfyxrMEUfRVkk7Mn3yBkgdvEUMKgcd84ejLXXjaBNANrzdTGDZTNrMV4DGEJJcVwQsirvmuqJTbESpZGtcmMr1p2kTDELcmZNf3zqdaVo',
  'xpub6DFfyxrMEUfRGTzteDuwAgnWJNMyk5oFnFpHzJ3FZVdhNbUUjQrum1yzZ8pRkSNnYik9f7nZQHVbX2QmVxjQg9QdwhwJBJ5BVU1eNiJn9nx',
  'xpub6DFfyxrMEUfRjgfEnMSnQb1eSdjYoEYgXTHewSDSj535cdV3YvebBLDv3E8Jf9Gnw6o5cjgrH2fJ7pQUP68FHLBuz7pzut3sCHByNb8732w',
  'xpub6DFfyxrMEUfRTAEKrZYkCysQbApw3uPfhdB1JL4ezrMVsXu5dxzTzBjow5BGhHS34RoEZ9fGAotYmgHV3cFkhtNwa9scg47dgj9rcSskGxw',
  'xpub6DFfyxrMEUfRNx8MU68Exh7Zu8m9AahHqyhJzPWa9agwTaqzrPQ3nUqF9HcRL5Whg7w84EgETN82MfUDhQPKYBRngSz5Rmm3YBYUPnqGews',
  'xpub6DFfyxrMEUfRArb44TcHbuHeGQ1qx3KWKsnykm6XMorKSWpCbnMESPHTZVPG3Tu4c7cdm1nPUxVB7214hkniqtYGYy2tXjP4unaobdPH3Wi',
  'xpub6DFfyxrMEUfRMHhGfByZfeAocsHvYtuCj5y1KQWrpEgjUrKS8oV2i8FGaVoWWRp71Uz3n4LmPBjnyQFq2GJt6CAozVtUoAVqwg88Zccagcs',
  'xpub6DFfyxrMEUfRa2jkv1Ust48Awz8gWHQG4np1VimCYeKinGTfY4isY4V2Dwv293YhTCrP65XYSRVagWuoYmsQJmucDZSd8L5XzdyhrQrtSdq',
  'xpub6DFfyxrMEUfRCQn3cPkudoGamQQZgExLUepcHduymGMBCBLEZgCoBXrjUWmzF74HXzPMYvsKdL25usDyKYV5PkHtYrM2oSg29j7wj4gu6vW',
  'xpub6DFfyxrMEUfRgPmwjxB4sZSyEYd4rUsBcUbDYSze8ZL3o89pyhmTG8aQtEfS5c7tca2FzELbdcMkWt8kZrz3u1gAvMnUasARzXfAUXRg7Ku',
  'xpub6DFfyxrMEUfRJ1VrRHkReKDvHt8rVtACtAPSEgDdFLsgWMidSVJmELN6o7mAg3vzsyCxHNxTWbK8py8JsBGG6eE1gyxkXSHW257iGJmGYuw',
  'xpub6DFfyxrMEUfRdCQ5En5AshvRG8hqtSgt4yP8ZJ7F5mA9NDSY52KCHKuUdqasXaKcuobZXM9NXsKyWDauWakidQ714EypKUZKkMNWNQb72Na',
  'xpub6DFfyxrMEUfRWfkdXNhAwEaVG2q2md4ot1TVw8CbFmZLGTg98S2TthV1nZ1DPyNhtzvvSNtrP4JMFFaJccB8uycFZyULZSoKLzvvtDCTLZr',
  'xpub6DFfyxrMEUfRfRfqddybvT2DvpkiVQAfsPawivjpQQNwPcYf9PW8KqUDztU7SSxvbwGiRcJwNqJZT2FSVMZ4xz2evdVnPWrJdPS1M52Y5ZH',
];

const descriptor15 = `wsh(sortedmulti(2,${xpubs.map(xpub => `${xpub}/0/0`).join(',')}))`;

const fakeFingerprint = 'aabbccdd';
const fakeKeyOrigin = `${fakeFingerprint}/84'/0'/0'`;

function makeFakeLedgerClient(): AppClient {
  const client: AppClient = Object.create(AppClient.prototype);
  client.registerWallet = () =>
    Promise.resolve<readonly [Buffer, Buffer]>([Buffer.alloc(32), Buffer.alloc(32)]);
  return client;
}

describe('15-key descriptor through the Ledger policy pipeline', () => {
  test('compiles and finds uniform key path indexes', () => {
    const compiled = compileWshDescriptor(descriptor15);
    expect(compiled.keys).toHaveLength(15);
    expect(compiled.keyPathIndexes).toEqual({ changeIndex: 0, addressIndex: 0 });
  });

  test('registerLedgerWallet stores an uncorrupted policy', async () => {
    const compiled = compileWshDescriptor(descriptor15);
    const accountKey = compiled.keys.find(key => key.keyExpression.startsWith(xpubs[0]));
    expect(accountKey).toBeDefined();
    if (!accountKey) return;

    const ledgerDescriptor = toLedgerSignableDescriptor(
      descriptor15,
      accountKey,
      xpubs[0],
      fakeKeyOrigin
    );

    const ledgerState: LedgerState = { masterFingerprint: hexToBytes(fakeFingerprint) };
    await registerLedgerWallet({
      descriptor: toCompilableWshDescriptor(ledgerDescriptor),
      ledgerManager: {
        ledgerClient: makeFakeLedgerClient(),
        ledgerState,
        Output,
        network: networks.bitcoin,
      },
      policyName: 'Leather',
    });

    const policy = ledgerState.policies?.[0];
    expect(policy).toBeDefined();
    if (!policy) return;

    expect(policy.keyRoots).toHaveLength(15);
    expect(policy.ledgerTemplate).toEqual(
      `wsh(multi(2,${Array.from({ length: 15 }, (_, i) => `@${i}/**`).join(',')}))`
    );
  });
});
