import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as btc from '@scure/btc-signer';
import * as bitcoin from 'bitcoinjs-lib';

import { fingerprintAsNumberToHex } from '@leather.io/crypto';

import { createBitcoinAddress } from '../validation/bitcoin-address';
import {
  createNativeSegwitBitcoinJsSigner,
  signBip322MessageSimple,
} from './sign-message-bip322-bitcoinjs';

// Leather test mnemonic — also used in p2wpkh-address-gen.spec.ts. NOT a real wallet.
const mnemonic =
  'token spatial butter drill city debate pipe shoot target pencil tonight gallery dog globe copy hybrid convince spell load maximum impose crazy engage way';

// Known-good vectors for account m/84'/0'/1' from p2wpkh-address-gen.spec.ts
const expected = {
  accountPath: "m/84'/0'/1'",
  xpub: 'xpub6CwY13JDrzeY55xGbiHxHwZSZpbkmrM7QMag3yVgZi62zaYFsBAUam1kghZZx4hDgDdkDzAMxc8xmpcyGAb1EoXoB7Vn7WTiUEaCEd3CcPq',
  address: 'bc1q5aptjy5l9q4qcykvccpwlqcvzydg744qkv94d3',
};

test('emit BTC BIP-322 auth fixture (mainnet)', async () => {
  const root = HDKey.fromMasterSeed(mnemonicToSeedSync(mnemonic));
  const account = root.derive(expected.accountPath);
  const child = account.deriveChild(0).deriveChild(0); // m/84'/0'/1'/0/0

  if (!child.privateKey || !child.publicKey) throw new Error('Key derivation failed');

  const publicKey = bytesToHex(child.publicKey);
  const address = createBitcoinAddress(btc.p2wpkh(child.publicKey).address ?? '');

  // Assert the derivation matches Leather's pinned fixtures before signing.
  // (publicKey emitted below is the /0/0 child signing key — the fixture's
  // public_key field is the account-level key, so only xpub + address cross-check.)
  expect(account.publicExtendedKey).toEqual(expected.xpub);
  expect(address).toEqual(expected.address);

  const timestamp = Math.floor(Date.now() / 1000);
  const message = `Sign in to Leather\n${timestamp}`;

  const privateKey = child.privateKey;
  function signPsbt(psbt: bitcoin.Psbt) {
    psbt.signAllInputs(createNativeSegwitBitcoinJsSigner(Buffer.from(privateKey)));
    return Promise.resolve(btc.Transaction.fromPSBT(psbt.toBuffer()));
  }

  const { signature } = await signBip322MessageSimple({
    address,
    message,
    network: 'mainnet',
    signPsbt,
  });

  const fixture = {
    network: 'btc:mainnet',
    address,
    publicKey,
    xpub: account.publicExtendedKey,
    xpubOriginFingerprint: fingerprintAsNumberToHex(root.fingerprint),
    xpubOriginPath: expected.accountPath,
    message,
    timestamp,
    signature,
  };

  // eslint-disable-next-line no-console
  console.log('\nBTC_AUTH_FIXTURE_JSON\n' + JSON.stringify(fixture, null, 2) + '\n');
});
