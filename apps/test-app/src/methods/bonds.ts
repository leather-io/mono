// BTC staking bonds.
//
// A bond locks vault funds into the bond-exit template: spendable either by
// the vault after `unlock_height`, or immediately by the vault plus a
// counterparty signature and the sha256 preimage. With a Bitcoin policy
// account selected, `signPsbt` accepts ONLY descriptors matching that
// template (see the extension's use-bond-proposal-route) — so this is the
// request that reaches the bond route at all.
//
// The bond is instantiated around a REAL vault: the policy account currently
// selected in the wallet. The template requires extended keys, which is why
// the raw-pubkey descriptor shape cannot be used for bonds.
import { bondDescriptorFor } from '../builders/descriptors';
import { collectPsbtKeys } from '../builders/keys';
import { buildSelfSpendPsbtHex, descriptorScript } from '../builders/psbt';
import { type ParamsOf, type RpcMethodSpec } from '../types';
import { verifySignedPsbt } from '../verifiers/spec-verifiers';

export const bondMethods: RpcMethodSpec[] = [
  {
    id: 'signPsbt-bond-propose',
    method: 'signPsbt',
    label: 'signPsbt (bond propose)',
    category: 'Bonds',
    description:
      'Select a BITCOIN POLICY account, then fire: a PSBT spending the bond output built from that vault, sent with the instantiated bond descriptor. This is the only signPsbt shape the policy route accepts.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['sortedmulti'], { vault: 'selected' });
      if (!keys.vaultDescriptor) throw new Error('No vault descriptor to build a bond from');
      const descriptor = bondDescriptorFor({ vaultDescriptor: keys.vaultDescriptor });
      return {
        hex: buildSelfSpendPsbtHex(descriptorScript(descriptor)),
        descriptor,
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['btc-policy'],
    tags: ['bonds', 'psbt'],
    verify: verifySignedPsbt(),
  },
];
