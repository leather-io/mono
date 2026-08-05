import { Route, useNavigate } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';
import StacksApp from '@zondax/ledger-stacks';
import {
  deviceMatchesLegacyLedgerWallet,
  pullStacksKeysFromLedgerDevice,
  resolveLedgerStacksDerivationPathType,
} from 'app/features/ledger/flows/request-stacks-keys/request-stacks-keys.utils';

import { createDescriptor, createKeyOriginPath } from '@leather.io/crypto';
import type { StacksDerivationPathType } from '@leather.io/stacks';
import { delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { assumedZeroFingerprint } from '@shared/utils';

import { useLocationStateWithCache } from '@app/common/hooks/use-location-state';
import { ChooseAddressStandard } from '@app/features/ledger/flows/request-stacks-keys/steps/choose-address-standard';
import { ledgerRequestKeysRoutes } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys-route-generator';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import {
  defaultNumberOfKeysToPullFromLedgerDevice,
  useRequestLedgerKeys,
} from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { immediatelyAttemptLedgerConnection } from '@app/features/ledger/hooks/use-when-reattempt-ledger-connection';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import {
  MINIMUM_STACKS_APP_VERSION,
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  requestPublicKeyForStxAccount,
  validateStacksAppVersion,
} from '@app/features/ledger/utils/stacks-ledger-utils';
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

function LedgerRequestStacksKeys() {
  const toast = useToast();
  const navigate = useNavigate();
  const ledgerNavigate = useLedgerNavigate();

  const stxKeychainsDescriptors = useStacksKeychainDescriptors();
  const wallets = useWalletEntities();
  const dispatch = useAppDispatch();
  const chosenDerivationPathType = useLocationStateWithCache('stacksDerivationPathType');

  const chain = 'stacks';

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection, outdatedAppVersionWarning } =
    useRequestLedgerKeys<StacksApp>({
      chain,
      connectApp: connectLedgerStacksApp,
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      async passesAdditionalVersionCheck(appVersion) {
        if (appVersion.chain !== 'stacks') {
          return true;
        }

        const { meetsMinimum, currentVersion } = validateStacksAppVersion(appVersion);
        if (!meetsMinimum) {
          await delay(40);
          void ledgerNavigate.toStacksAppOutdatedWarning({
            currentVersion,
            requiredVersion: MINIMUM_STACKS_APP_VERSION,
          });
          return false;
        }

        return true;
      },
      onSuccess() {
        void navigate('/', { replace: true });
      },
      async pullKeysFromDevice(app) {
        const fingerprintResp = await app.getMasterFingerprint();
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
          void navigate(RouteUrls.LedgerStacksAddressStandard, {
            replace: true,
            state: {
              [immediatelyAttemptLedgerConnection]: true,
              backgroundLocation: { pathname: RouteUrls.Home },
            },
          });
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
    latestDeviceResponse,
    awaitingDeviceConnection,
    outdatedAppVersionWarning,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
    />
  );
}

export const requestStacksKeysRoutes = ledgerRequestKeysRoutes({
  path: 'stacks',
  component: <LedgerRequestStacksKeys />,
  customRoutes: (
    <Route path={RouteUrls.LedgerStacksAddressStandard} element={<ChooseAddressStandard />} />
  ),
});
