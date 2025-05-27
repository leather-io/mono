import { normalizeSignAtIndex } from '@/features/psbt-signer/utils';
import {
  findAccountByAddress,
  useBitcoinAccounts,
} from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { destructAccountIdentifier, makeAccountIdentifer } from '@/store/utils';
import { bytesToHex } from '@noble/hashes/utils';

import {
  getBitcoinInputAddress,
  getBtcSignerLibNetworkConfigByMode,
  getPsbtAsTransaction,
  getPsbtTxInputs,
  inferPaymentTypeFromAddress,
  payerToBip32Derivation,
  payerToTapBip32Derivation,
} from '@leather.io/bitcoin';
import {
  extractAccountIndexFromDescriptor,
  extractFingerprintFromDescriptor,
} from '@leather.io/crypto';
import { BitcoinNetworkModes } from '@leather.io/models';
import { RpcRequests } from '@leather.io/rpc';

interface AddBip32DerivationFieldToInputsProps {
  psbtHex: string;
  networkMode: BitcoinNetworkModes;
  bitcoinAccounts: ReturnType<typeof useBitcoinAccounts>['list'];
  accountId: string;
  signAtIndex: number | number[] | undefined;
}
export function addBip32DerivationFieldToInputs({
  psbtHex,
  networkMode,
  bitcoinAccounts,
  accountId,
  signAtIndex: _signAtIndex,
}: AddBip32DerivationFieldToInputsProps) {
  const signAtIndex = normalizeSignAtIndex(_signAtIndex);
  const tx = getPsbtAsTransaction(psbtHex);

  const inputs = getPsbtTxInputs(tx);
  inputs.forEach((input, idx) => {
    if (input.bip32Derivation || input.tapBip32Derivation) return;
    const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode(networkMode);
    const addr = getBitcoinInputAddress(input, bitcoinNetwork);
    if (!addr) {
      throw new Error('Unsupported bitcoin address');
    }
    const paymentType = inferPaymentTypeFromAddress(addr);
    const bitcoinAccountsById = bitcoinAccounts.filter(acc => {
      const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
      const bitcoinAccountIdx = extractAccountIndexFromDescriptor(acc.descriptor);
      return acc.masterKeyFingerprint === fingerprint && bitcoinAccountIdx === accountIndex;
    });
    const bitcoinAccount = findAccountByAddress(bitcoinAccountsById, addr);

    if (!bitcoinAccount) return;

    const accountIdx = extractAccountIndexFromDescriptor(bitcoinAccount?.descriptor);
    const accountFingerprint = extractFingerprintFromDescriptor(bitcoinAccount?.descriptor ?? '');

    const bitcoinAccountId = makeAccountIdentifer(accountFingerprint, accountIdx);

    if (bitcoinAccountId === accountId) {
      // TODO in #1295: use dynamic payer info
      const payer = bitcoinAccount.derivePayer({ change: 0, addressIndex: 0 });
      if (paymentType === 'p2tr') {
        tx.updateInput(idx, {
          tapBip32Derivation: [payerToTapBip32Derivation(payer)],
        });
      }
      if (paymentType === 'p2wpkh') {
        tx.updateInput(idx, {
          bip32Derivation: [payerToBip32Derivation(payer)],
        });
      }
    } else if (!signAtIndex || signAtIndex.includes(idx)) {
      throw new Error('PSBT asks to sign an input that is not ours');
    }
  });
  return { psbtHex: bytesToHex(tx.toPSBT()), signAtIndex };
}

export type BrowserMessage = RpcRequests | null;

// Disabling lingui eslint rule here as this is an error message for dApps
export const RpcErrorMessage = {
  InvalidParams: 'Invalid parameters',
  NullOrigin: 'Origin is null',
  UndefinedParams: 'Undefined parameters',
  UserRejectedOperation: 'User rejected request',
} as const;
