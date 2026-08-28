import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { base64, hex } from '@scure/base';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { compileWshDescriptor } from '../descriptors/wsh-descriptor';
import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { getAddressFromOutScript } from '../utils/bitcoin.utils';
import {
  assembleWshMultisigPsbt,
  extractWshMultisigSignatures,
  psbtBase64ToHex,
  psbtHexToBase64,
} from './wsh-multisig-transaction';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

const recipient = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
const network = getBtcSignerLibNetworkConfigByMode('mainnet');

describe(assembleWshMultisigPsbt.name, () => {
  test('assembles a PSBT with witnessScript on every input and change to the multisig address', () => {
    const { scriptPubKey, witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(2,${publicKeys.join(',')}))`
    );
    const changeAddress = getAddressFromOutScript(scriptPubKey, network);
    if (!changeAddress) throw new Error('Could not derive change address');

    const psbt = assembleWshMultisigPsbt({
      scriptPubKey,
      witnessScript,
      inputs: [
        { txid: 'a'.repeat(64), vout: 0, value: 100000 },
        { txid: 'b'.repeat(64), vout: 1, value: 60000 },
      ],
      outputs: [{ value: 90000n, address: recipient }, { value: 60000n }],
      changeAddress,
      network,
    });

    const tx = btc.Transaction.fromPSBT(base64.decode(psbt));
    expect(tx.inputsLength).toEqual(2);
    for (let i = 0; i < tx.inputsLength; i++) {
      expect(tx.getInput(i).witnessScript).toEqual(witnessScript);
    }
    expect(tx.outputsLength).toEqual(2);
    // The change output (no address) is sent back to the multisig scriptPubKey.
    expect(tx.getOutput(1).script).toEqual(scriptPubKey);
  });

  test('routes each output to its own address and value', () => {
    const { scriptPubKey, witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(2,${publicKeys.join(',')}))`
    );
    const changeAddress = getAddressFromOutScript(scriptPubKey, network);
    if (!changeAddress) throw new Error('Could not derive change address');

    const psbt = assembleWshMultisigPsbt({
      scriptPubKey,
      witnessScript,
      inputs: [{ txid: 'a'.repeat(64), vout: 0, value: 100000 }],
      outputs: [{ value: 90000n, address: recipient }, { value: 8000n }],
      changeAddress,
      network,
    });

    const tx = btc.Transaction.fromPSBT(base64.decode(psbt));
    // The recipient output keeps its explicit address and value.
    expect(getAddressFromOutScript(tx.getOutput(0).script!, network)).toEqual(recipient);
    expect(tx.getOutput(0).amount).toEqual(90000n);
    // The addressless output is the change, returned to the multisig.
    expect(getAddressFromOutScript(tx.getOutput(1).script!, network)).toEqual(changeAddress);
    expect(tx.getOutput(1).amount).toEqual(8000n);
  });
});

describe(psbtBase64ToHex.name, () => {
  test('converts a base64 PSBT to hex the wallet can parse', () => {
    const { scriptPubKey, witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(2,${publicKeys.join(',')}))`
    );
    const changeAddress = getAddressFromOutScript(scriptPubKey, network);
    if (!changeAddress) throw new Error('Could not derive change address');

    const psbtBase64 = assembleWshMultisigPsbt({
      scriptPubKey,
      witnessScript,
      inputs: [{ txid: 'a'.repeat(64), vout: 0, value: 100000 }],
      outputs: [{ value: 90000n, address: recipient }],
      changeAddress,
      network,
    });

    const psbtHex = psbtBase64ToHex(psbtBase64);
    expect(hexToBytes(psbtHex)).toEqual(base64.decode(psbtBase64));
    expect(btc.Transaction.fromPSBT(hexToBytes(psbtHex)).inputsLength).toEqual(1);
    expect(psbtHexToBase64(psbtHex)).toEqual(psbtBase64);
  });
});

describe(extractWshMultisigSignatures.name, () => {
  test('reads the per-input partial signature off a signed multisig PSBT', () => {
    // pk(A) at m/84'/0'/0'/0/0 from a fixed seed; the second key stays unsigned.
    const signingChild = HDKey.fromMasterSeed(new Uint8Array(32).fill(1))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0);
    const signingPubkey = bytesToHex(signingChild.publicKey!);

    const { scriptPubKey, witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(1,${signingPubkey},${publicKeys[1]}))`
    );
    const changeAddress = getAddressFromOutScript(scriptPubKey, network);
    if (!changeAddress) throw new Error('Could not derive change address');

    const psbtHex = psbtBase64ToHex(
      assembleWshMultisigPsbt({
        scriptPubKey,
        witnessScript,
        inputs: [{ txid: 'a'.repeat(64), vout: 0, value: 100000 }],
        outputs: [{ value: 90000n, address: recipient }],
        changeAddress,
        network,
      })
    );

    const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
    expect(tx.signIdx(signingChild.privateKey!, 0)).toBe(true);
    const signedPsbtHex = hex.encode(tx.toPSBT());

    const signatures = extractWshMultisigSignatures(signedPsbtHex, signingPubkey);
    expect(signatures).toHaveLength(1);
    expect(signatures[0]?.inputIndex).toEqual(0);
    expect(signatures[0]?.signature).toEqual(bytesToHex(tx.getInput(0).partialSig![0][1]));
  });

  test('selects this signer by pubkey and ignores a co-signer partial on the same input', () => {
    const signerA = HDKey.fromMasterSeed(new Uint8Array(32).fill(1))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0);
    const signerB = HDKey.fromMasterSeed(new Uint8Array(32).fill(2))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0);
    const pubkeyA = bytesToHex(signerA.publicKey!);
    const pubkeyB = bytesToHex(signerB.publicKey!);

    const { scriptPubKey, witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(2,${pubkeyA},${pubkeyB}))`
    );
    const changeAddress = getAddressFromOutScript(scriptPubKey, network);
    if (!changeAddress) throw new Error('Could not derive change address');

    const psbtHex = psbtBase64ToHex(
      assembleWshMultisigPsbt({
        scriptPubKey,
        witnessScript,
        inputs: [{ txid: 'a'.repeat(64), vout: 0, value: 100000 }],
        outputs: [{ value: 90000n, address: recipient }],
        changeAddress,
        network,
      })
    );

    // Both cosigners sign the same input; partialSig now carries two entries.
    const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
    expect(tx.signIdx(signerA.privateKey!, 0)).toBe(true);
    expect(tx.signIdx(signerB.privateKey!, 0)).toBe(true);
    const signedPsbtHex = hex.encode(tx.toPSBT());

    const partialSig = tx.getInput(0).partialSig!;
    const sigA = bytesToHex(partialSig.find(([pub]) => bytesToHex(pub) === pubkeyA)![1]);

    const signatures = extractWshMultisigSignatures(signedPsbtHex, pubkeyA);
    expect(signatures).toHaveLength(1);
    expect(signatures[0]?.signature).toEqual(sigA);
  });

  test('returns one signature per signed input and skips inputs this signer did not sign', () => {
    const signingChild = HDKey.fromMasterSeed(new Uint8Array(32).fill(1))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0);
    const signingPubkey = bytesToHex(signingChild.publicKey!);

    const { scriptPubKey, witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(1,${signingPubkey},${publicKeys[1]}))`
    );
    const changeAddress = getAddressFromOutScript(scriptPubKey, network);
    if (!changeAddress) throw new Error('Could not derive change address');

    const psbtHex = psbtBase64ToHex(
      assembleWshMultisigPsbt({
        scriptPubKey,
        witnessScript,
        inputs: [
          { txid: 'a'.repeat(64), vout: 0, value: 100000 },
          { txid: 'b'.repeat(64), vout: 1, value: 100000 },
          { txid: 'c'.repeat(64), vout: 2, value: 100000 },
        ],
        outputs: [{ value: 250000n, address: recipient }],
        changeAddress,
        network,
      })
    );

    // Sign inputs 0 and 2 only; input 1 stays unsigned to exercise the skip branch.
    const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
    expect(tx.signIdx(signingChild.privateKey!, 0)).toBe(true);
    expect(tx.signIdx(signingChild.privateKey!, 2)).toBe(true);
    const signedPsbtHex = hex.encode(tx.toPSBT());

    const signatures = extractWshMultisigSignatures(signedPsbtHex, signingPubkey);
    expect(signatures.map(signature => signature.inputIndex)).toEqual([0, 2]);
    expect(signatures[0]?.signature).toEqual(bytesToHex(tx.getInput(0).partialSig![0][1]));
    expect(signatures[1]?.signature).toEqual(bytesToHex(tx.getInput(2).partialSig![0][1]));
  });
});
