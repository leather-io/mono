import { stringAsciiCV } from '@stacks/transactions';

import {
  deriveXpubChildPublicKey,
  getP2wpkhAddressFromPublicKey,
  verifyP2wpkhBip322Signature,
} from '@leather.io/bitcoin';
import { computeProposalHash, decodeProposalPayload } from '@leather.io/crypto';
import type { MultisigTransaction, VaultAccount, VaultAccountSigner } from '@leather.io/models';
import { verifySip018Signature } from '@leather.io/stacks';

import { resolveBtcNetworkMode } from '../../network/resolve-btc-network-mode';
import { deriveMultisigAddress } from '../derive-multisig-address';
import { buildStxProposalDomain } from '../stx-proposal-domain';

// The served signer set must re-derive the served multisig address; otherwise the
// signer set has been altered or substituted.
function assertSignerSetMatchesAddress(account: VaultAccount): void {
  if (deriveMultisigAddress(account) !== account.multisigAddress)
    throw new Error('Signer set tampered: re-derived address does not match the vault account.');
}

// The proposer must be one of the account's signers.
function findProposer(transaction: MultisigTransaction, account: VaultAccount): VaultAccountSigner {
  const proposer = account.signers.find(signer => signer.userId === transaction.proposerUserId);
  if (!proposer) throw new Error('Proposer is not a signer on this account.');
  return proposer;
}

// On BTC the proposer signs the commitment with their identity key while a
// separate signing key sits in the multisig; bind the two so the authorizer is
// provably a key-holder. STX uses one key for both, so there is nothing to bind.
function assertProposerKeyBinding(proposer: VaultAccountSigner, account: VaultAccount): void {
  if (!account.network.startsWith('btc')) return;
  if (!proposer.xpub) throw new Error('Proposer signer is missing its xpub.');
  const derivesToServedKeys =
    deriveXpubChildPublicKey({ xpub: proposer.xpub, changeIndex: 0, addressIndex: 0 }) ===
      proposer.publicKey &&
    deriveXpubChildPublicKey({
      xpub: proposer.xpub,
      changeIndex: 0,
      addressIndex: account.accountIndex,
    }) === proposer.signingPubkey;
  if (!derivesToServedKeys)
    throw new Error('Proposer identity and signing keys do not derive from the same xpub.');
}

// Recompute the proposal hash from the payload and verify the proposer's signature
// over it. Any change to the payload, address, or timestamp since the proposal
// breaks the signature, so this is what detects tampering.
function assertProposalCommitment(
  transaction: MultisigTransaction,
  account: VaultAccount,
  proposer: VaultAccountSigner
): void {
  const chain = account.network.startsWith('btc') ? 'btc' : 'stx';
  const proposalHash = computeProposalHash({
    multisigAddress: account.multisigAddress,
    rawPayload: decodeProposalPayload(chain, transaction.proposalRawPayload),
    proposalTimestamp: transaction.proposalTimestamp,
  });
  // Verify against a key anchored to the vault, never a free-floating served field:
  // BTC re-derives the identity address from the bound publicKey (the served
  // `address` is unbound); STX verifies against the signing key (bound to the
  // multisig address), which for STX is also the identity key.
  const mode = resolveBtcNetworkMode(account.network);
  const valid =
    chain === 'btc'
      ? verifyP2wpkhBip322Signature(
          getP2wpkhAddressFromPublicKey(proposer.publicKey, mode),
          proposalHash,
          transaction.proposalSignature
        )
      : verifySip018Signature({
          message: stringAsciiCV(proposalHash),
          domain: buildStxProposalDomain(account.network),
          signature: transaction.proposalSignature,
          publicKey: proposer.signingPubkey,
        });
  if (!valid)
    throw new Error('Proposal commitment invalid: payload has been tampered with since proposal.');
}

// Verifies a proposed transaction is safe to sign before the wallet is invoked: it
// re-derives everything the backend served and confirms the proposer genuinely
// committed to these exact bytes. Runs at the top of every sign path so it can
// never be skipped; any check failing throws and aborts signing — there is no
// bypass.
export function preSignVerification({
  transaction,
  account,
}: {
  transaction: MultisigTransaction;
  account: VaultAccount;
}): void {
  // account.network is the pinned source of truth — assertSignerSetMatchesAddress
  // re-derives the address from it. transaction.network is independently served, so
  // reject any disagreement up front; otherwise the two could route the key binding
  // and the commitment check down different chains.
  if (transaction.network !== account.network)
    throw new Error('Transaction network does not match the vault account network.');

  assertSignerSetMatchesAddress(account);
  const proposer = findProposer(transaction, account);
  assertProposerKeyBinding(proposer, account);
  assertProposalCommitment(transaction, account, proposer);
}
