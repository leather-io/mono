import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  deviceMatchesLegacyLedgerWallet,
  resolveLedgerStacksDerivationPathType,
} from 'app/features/ledger/flows/request-stacks-keys/request-stacks-keys.utils';

import {
  type HardwareStacksSigner,
  type OperationContext,
  getStacksSigner,
  isHardwareWalletErrorOfKind,
} from '@leather.io/ledger';
import type { StacksDerivationPathType } from '@leather.io/stacks';
import { delay, isError, makeNumberRange } from '@leather.io/utils';

import { assumedZeroFingerprint } from '@shared/utils';

import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import { ChooseAddressStandard } from '@app/features/ledger/flows/request-stacks-keys/steps/choose-address-standard';
import { type LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import {
  defaultNumberOfKeysToPullFromLedgerDevice,
  useCancelLedgerAction,
} from '@app/features/ledger/utils/generic-ledger-utils';
import { useToast } from '@app/features/toasts/use-toast';
import { useAppDispatch } from '@app/store';
import { activateFirstVisibleAccount } from '@app/store/active/active.actions';
import { useStacksKeychainDescriptors } from '@app/store/keychains/keychain.selectors';
import { addOrMigrateLedgerKeychains } from '@app/store/wallets/wallet.actions';
import { getAddWalletError, useWalletEntities } from '@app/store/wallets/wallet.selectors';

const derivationPathTypeLabels: Record<StacksDerivationPathType, string> = {
  stacks: 'legacy Stacks',
  bip44: 'standard (BIP-44)',
};

const keysPulledSettleDelayMs = 1_000;

function requestLegacyAccountZeroPublicKey(stacks: HardwareStacksSigner, ctx: OperationContext) {
  return async (): Promise<string | null> => {
    try {
      const { keys } = await stacks.requestAccountKeys(
        { derivationPathType: 'stacks', accountIndexes: [0] },
        ctx
      );
      return keys[0]?.publicKey ?? null;
    } catch (error) {
      if (isHardwareWalletErrorOfKind(error, 'cancelled')) throw error;
      return null;
    }
  };
}

export function LedgerRequestStacksKeys() {
  const toast = useToast();
  const navigate = useNavigate();
  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();

  const stxKeychainsDescriptors = useStacksKeychainDescriptors();
  const wallets = useWalletEntities();
  const dispatch = useAppDispatch();
  const [chosenDerivationPathType, setChosenDerivationPathType] =
    useState<StacksDerivationPathType>();

  const chain = 'stacks';

  const {
    requestKeys,
    cancel,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useRequestLedgerKeys({
    connectRequest: { chain },
    onSuccess() {
      close();
      void navigate('/', { replace: true });
    },
    async pullKeysFromDevice(wallet, ctx) {
      const stacks = getStacksSigner(wallet);
      const fingerprint = await wallet.getMasterFingerprint(ctx);

      const addWalletError = getAddWalletError(wallets, fingerprint, 'ledger');
      if (addWalletError) {
        toast.error(addWalletError);
        ledgerNavigate.toErrorStep(chain, addWalletError);
        return { status: 'failure' };
      }

      const shouldProbeLegacyWallet =
        wallets[assumedZeroFingerprint]?.type === 'ledger' && !wallets[fingerprint];
      const legacyWalletMatchesDevice = shouldProbeLegacyWallet
        ? await deviceMatchesLegacyLedgerWallet(
            requestLegacyAccountZeroPublicKey(stacks, ctx),
            stxKeychainsDescriptors
          )
        : false;

      const resolution = resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: stxKeychainsDescriptors,
        fingerprint,
        hasWalletForFingerprint: Boolean(wallets[fingerprint]),
        legacyWalletMatchesDevice,
        chosenDerivationPathType,
      });

      if (resolution.status === 'needs-choice') {
        toast.info('Confirm your preferred address standard to continue');
        ledgerNavigate.toChooseAddressStandardStep({ connectImmediatelyAfter: true });
        return { status: 'failure' };
      }

      const { derivationPathType, overriddenChosenType } = resolution;

      if (overriddenChosenType) {
        toast.info(
          `This device's existing accounts use the ${derivationPathTypeLabels[derivationPathType]} address standard, so your ${derivationPathTypeLabels[overriddenChosenType]} selection couldn't be applied`
        );
      }

      try {
        const { keys } = await stacks.requestAccountKeys(
          {
            derivationPathType,
            accountIndexes: makeNumberRange(defaultNumberOfKeysToPullFromLedgerDevice),
            onRequestKey(accountIndex) {
              ledgerNavigate.toDeviceBusyStep(
                `Requesting STX addresses (${accountIndex + 1}…${defaultNumberOfKeysToPullFromLedgerDevice})`
              );
            },
          },
          ctx
        );
        await delay(keysPulledSettleDelayMs);
        ledgerNavigate.toDeviceBusyStep();

        const keychains = keys
          .map(key => ({ chain: 'stacks' as const, descriptor: key.descriptor }))
          .filter(keychain => {
            return !stxKeychainsDescriptors.includes(keychain.descriptor);
          });

        if (keychains.length === 0) {
          toast.info(`No new accounts found — this device's accounts are already in your wallet`);
        }

        await dispatch(addOrMigrateLedgerKeychains({ fingerprint, accountKeychains: keychains }));
        void dispatch(activateFirstVisibleAccount(fingerprint));
        return { status: 'success' };
      } catch (error) {
        if (!isHardwareWalletErrorOfKind(error, 'unknown') || !isError(error)) throw error;
        toast.error(error.message);
        ledgerNavigate.toErrorStep(chain, error.message);
        return { status: 'failure' };
      }
    },
  });

  const ledgerContextValue: LedgerRequestKeysContext = {
    chain: 'stacks',
    pullPublicKeysFromDevice: requestKeys,
    onSelectStandard: setChosenDerivationPathType,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction({
    awaitingDeviceConnection,
    isConnectionCancellable,
  });
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
      onCancelAction={cancel}
      renderStep={{ 'choose-address-standard': <ChooseAddressStandard /> }}
    />
  );
}
