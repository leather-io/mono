import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import { parseBondLockScript } from './bond-lock-script';
import { getBondVaultKeys, instantiateBondDescriptor } from './bond-template';
import { compileWshDescriptor } from './wsh-descriptor';

// Resolves the descriptor a co-signer must hand the wallet to sign a proposal
// PSBT. Plain proposals spend the vault's own multisig scriptPubKey, so the
// policy descriptor is returned unchanged. Bond early-exit proposals spend a
// bond scriptPubKey that merely embeds the vault multisig as a leaf, so the
// bond descriptor is reconstructed from input 0's witness script — using the
// vault's OWN keys, never the script's. Compiling that reconstruction and
// requiring byte-equality with every input's witnessUtxo both validates the
// parse and proves the bond's multi leaf really is this vault's key set; a
// script that cannot be reconstructed from the vault's keys is never signed.
export function resolveProposalSigningDescriptor(
  policyDescriptor: string,
  psbtHex: string
): string {
  const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
  if (!tx.inputsLength) throw new Error('Proposal PSBT has no inputs');

  const inputScripts: string[] = [];
  for (let index = 0; index < tx.inputsLength; index++) {
    const script = tx.getInput(index).witnessUtxo?.script;
    if (!script) throw new Error('Proposal PSBT input is missing its witnessUtxo');
    inputScripts.push(bytesToHex(script));
  }

  const policyScriptPubKey = bytesToHex(compileWshDescriptor(policyDescriptor).scriptPubKey);
  if (inputScripts.every(script => script === policyScriptPubKey)) return policyDescriptor;

  const { witnessScript } = tx.getInput(0);
  if (!witnessScript)
    throw new Error('Proposal input is not locked by the vault policy and has no witness script');

  const bondLock = parseBondLockScript(witnessScript);
  if (!bondLock)
    throw new Error(
      'Proposal inputs are locked by neither the vault policy nor a recognized bond script'
    );

  const bondDescriptor = instantiateBondDescriptor({
    unlockHeight: bondLock.unlockHeight,
    hash: bondLock.hashHex,
    counterpartyKey: bondLock.covenantPubkey,
    ...getBondVaultKeys(policyDescriptor),
  });

  const bondScriptPubKey = bytesToHex(compileWshDescriptor(bondDescriptor).scriptPubKey);
  if (inputScripts[0] !== bondScriptPubKey)
    throw new Error("Bond script does not embed this vault's key set");
  if (!inputScripts.every(script => script === bondScriptPubKey))
    throw new Error('Proposal mixes bond inputs with inputs locked by other scripts');

  return bondDescriptor;
}
