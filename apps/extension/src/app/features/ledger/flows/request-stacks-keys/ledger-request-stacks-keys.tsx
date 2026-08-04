import { Route, useNavigate } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';
import StacksApp from '@zondax/ledger-stacks';
import {
  pullStacksKeysFromLedgerDevice,
  resolveLedgerStacksDerivationPathType,
} from 'app/features/ledger/flows/request-stacks-keys/request-stacks-keys.utils';

import { createDescriptor, createKeyOriginPath } from '@leather.io/crypto';
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
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import {
  MINIMUM_STACKS_APP_VERSION,
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  validateStacksAppVersion,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { useToast } from '@app/features/toasts/use-toast';
import { useAppDispatch } from '@app/store';
import { activateFirstVisibleAccount } from '@app/store/active/active.actions';
import { useStacksKeychainDescriptors } from '@app/store/keychains/keychain.selectors';
import { addOrMigrateLedgerKeychains } from '@app/store/wallets/wallet.actions';
import { getAddWalletError, useWalletEntities } from '@app/store/wallets/wallet.selectors';

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

        const derivationPathType = resolveLedgerStacksDerivationPathType({
          stxKeychainDescriptors: stxKeychainsDescriptors,
          fingerprint,
          hasWalletForFingerprint: Boolean(wallets[fingerprint]),
          hasLegacyLedgerWallet: wallets[assumedZeroFingerprint]?.type === 'ledger',
          chosenDerivationPathType,
        });

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
