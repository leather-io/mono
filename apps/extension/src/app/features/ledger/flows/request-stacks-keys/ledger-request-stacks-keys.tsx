import { useState } from 'react';
import { useNavigate } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';
import {
  deviceMatchesLegacyLedgerWallet,
  pullStacksKeysFromLedgerDevice,
  resolveLedgerStacksDerivationPathType,
} from 'app/features/ledger/flows/request-stacks-keys/request-stacks-keys.utils';

import { createDescriptor, createKeyOriginPath } from '@leather.io/crypto';
import type { StacksDerivationPathType } from '@leather.io/stacks';

import { assumedZeroFingerprint } from '@shared/utils';

import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import { ChooseAddressStandard } from '@app/features/ledger/flows/request-stacks-keys/steps/choose-address-standard';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import {
  defaultNumberOfKeysToPullFromLedgerDevice,
  useRequestLedgerKeys,
} from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import type { LedgerStacksApp } from '@app/features/ledger/utils/ledger-app';
import {
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  requestPublicKeyForStxAccount,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
import { useToast } from '@app/features/toasts/use-toast';
import { useAppDispatch } from '@app/store';
import { activateFirstVisibleAccount } from '@app/store/active/active.actions';
import { useStacksKeychainDescriptors } from '@app/store/keychains/keychain.selectors';
import { addOrMigrateLedgerKeychains } from '@app/store/wallets/wallet.actions';
import { getAddWalletError, useWalletEntities } from '@app/store/wallets/wallet.selectors';

const derivationPathTypeLabels: Record<StacksDerivationPathType, string> = {
  stacks: 'legacy Stacks',
  ledgerLive: 'standard (Ledger)',
};

export function LedgerRequestStacksKeys() {
  const toast = useToast();
  const navigate = useNavigate();
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();

  const stxKeychainsDescriptors = useStacksKeychainDescriptors();
  const wallets = useWalletEntities();
  const dispatch = useAppDispatch();
  const [chosenDerivationPathType, setChosenDerivationPathType] =
    useState<StacksDerivationPathType>();

  const chain = 'stacks';

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection, isConnectionCancellable } =
    useRequestLedgerKeys<LedgerStacksApp>({
      chain,
      connectApp(options) {
        return connectLedgerStacksApp(dmk, { ...options, runAction: signerActions.run });
      },
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      passesAdditionalVersionCheck: stacksVersionGate(ledgerNavigate),
      onSuccess() {
        close();
        void navigate('/', { replace: true });
      },
      async pullKeysFromDevice(app) {
        const fingerprintResp = await app.app.getMasterFingerprint();
        const fingerprint = bytesToHex(fingerprintResp.fingerprint);

        const addWalletError = getAddWalletError(wallets, fingerprint, 'ledger');
        if (addWalletError) {
          toast.error(addWalletError);
          void ledgerNavigate.toErrorStep(chain, addWalletError);
          return { status: 'failure' };
        }

        const shouldProbeLegacyWallet =
          wallets[assumedZeroFingerprint]?.type === 'ledger' && !wallets[fingerprint];
        const legacyWalletMatchesDevice = shouldProbeLegacyWallet
          ? await deviceMatchesLegacyLedgerWallet(
              requestPublicKeyForStxAccount(app),
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
          void ledgerNavigate.toChooseAddressStandardStep({ connectImmediatelyAfter: true });
          return { status: 'failure' };
        }

        const { derivationPathType, overriddenChosenType } = resolution;

        if (overriddenChosenType) {
          toast.info(
            `This device's existing accounts use the ${derivationPathTypeLabels[derivationPathType]} address standard, so your ${derivationPathTypeLabels[overriddenChosenType]} selection couldn't be applied`
          );
        }

        const resp = await pullStacksKeysFromLedgerDevice(app)({
          derivationPathType,
          onRequestKey(accountIndex) {
            void ledgerNavigate.toDeviceBusyStep(
              `Requesting STX addresses (${accountIndex + 1}…${defaultNumberOfKeysToPullFromLedgerDevice})`
            );
          },
        });
        if (resp.status === 'failure') {
          toast.error(resp.errorMessage);
          void ledgerNavigate.toErrorStep(chain, resp.errorMessage);
          return { status: 'failure' };
        }
        void ledgerNavigate.toDeviceBusyStep();

        const keychains = resp.publicKeys
          .map(keys => {
            const keyOrigin = createKeyOriginPath(fingerprint, keys.path);
            const descriptor = createDescriptor(keyOrigin, keys.stxPublicKey);
            return {
              chain: 'stacks' as const,
              descriptor,
            };
          })
          .filter(keychain => {
            return !stxKeychainsDescriptors.includes(keychain.descriptor);
          });

        if (keychains.length === 0) {
          toast.info(`No new accounts found — this device's accounts are already in your wallet`);
        }

        await dispatch(addOrMigrateLedgerKeychains({ fingerprint, accountKeychains: keychains }));
        void dispatch(activateFirstVisibleAccount(fingerprint));
        return { status: 'success' };
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
      onCancelAction={signerActions.cancelActive}
      renderStep={{ 'choose-address-standard': <ChooseAddressStandard /> }}
    />
  );
}
