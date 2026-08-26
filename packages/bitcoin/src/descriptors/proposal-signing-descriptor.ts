import { bytesToHex } from '@noble/hashes/utils';

import { getPsbtAsTransaction } from '../psbt/utils';
import { bondCovenantAccountKeys, bondCovenantLeaf } from './bond-covenant-keys';
import { parseBondLockScript } from './bond-lock-script';
import {
  getBondVaultKeys,
  instantiateBondDescriptor,
  reconstructBondDescriptor,
} from './bond-template';
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
  const tx = getPsbtAsTransaction(psbtHex);
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

  const vaultKeys = getBondVaultKeys(policyDescriptor);

  // Safe to try candidates: only one deriving the locked script passes the check below.
  for (const accountKey of bondCovenantAccountKeys) {
    try {
      const candidate = instantiateBondDescriptor({
        unlockHeight: bondLock.unlockHeight,
        hash: bondLock.hashHex,
        counterpartyKey: `${accountKey}/${bondCovenantLeaf}`,
        ...vaultKeys,
      });
      if (bytesToHex(compileWshDescriptor(candidate).scriptPubKey) === inputScripts[0]) {
        assertEveryInputMatches(inputScripts, inputScripts[0]);
        return candidate;
      }
    } catch {
      // not this bond's co-signer
    }
  }

  const bondDescriptor = reconstructBondDescriptor({
    unlockHeight: bondLock.unlockHeight,
    hash: bondLock.hashHex,
    covenantPubkey: bondLock.covenantPubkey,
    ...vaultKeys,
  });

  const bondScriptPubKey = bytesToHex(compileWshDescriptor(bondDescriptor).scriptPubKey);
  if (inputScripts[0] !== bondScriptPubKey)
    throw new Error("Bond script does not embed this vault's key set");
  assertEveryInputMatches(inputScripts, bondScriptPubKey);

  return bondDescriptor;
}

function assertEveryInputMatches(inputScripts: string[], expected: string): void {
  if (!inputScripts.every(script => script === expected))
    throw new Error('Proposal mixes bond inputs with inputs locked by other scripts');
}
