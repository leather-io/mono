import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import StacksApp from '@zondax/ledger-stacks';
import { pullStacksKeysFromLedgerDevice } from 'app/features/ledger/flows/request-stacks-keys/request-stacks-keys.utils';

import { userAddsWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

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
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { useToast } from '@app/features/toasts/use-toast';
import { userSwitchesAccount } from '@app/store/active/active.slice';
import { stacksKeysSlice } from '@app/store/ledger/stacks/stacks-key.slice';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';

function LedgerRequestStacksKeys() {
  const toast = useToast();
  const navigate = useNavigate();
  const ledgerNavigate = useLedgerNavigate();

  const wallets = useWalletEntities();
  const dispatch = useDispatch();

  const chain = 'stacks';

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection, outdatedAppVersionWarning } =
    useRequestLedgerKeys<StacksApp>({
      chain,
      connectApp: connectLedgerStacksApp,
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      onSuccess() {
        void navigate('/', { replace: true });
      },
      async pullKeysFromDevice(app) {
        const resp = await pullStacksKeysFromLedgerDevice(app)({
          onRequestKey(accountIndex) {
            void ledgerNavigate.toDeviceBusyStep(
              `Requesting STX addresses (${accountIndex + 1}…${defaultNumberOfKeysToPullFromLedgerDevice})`
            );
          },
        });
        if (resp.status === 'failure') {
          toast.error(resp.errorMessage);
          void ledgerNavigate.toErrorStep(chain, resp.errorMessage);
          return;
        }
        void ledgerNavigate.toDeviceBusyStep();

        const keysWithFingerprint = resp.publicKeys.map(keys => ({
          ...keys,
          id: keys.path.replace('m', assumedZeroFingerprint),
          fingerprint: assumedZeroFingerprint,
        }));

        dispatch(stacksKeysSlice.actions.addKeys(keysWithFingerprint));

        if (!wallets[assumedZeroFingerprint]) {
          dispatch(
            userAddsWallet({
              wallet: {
                createdOn: new Date().toISOString(),
                fingerprint: assumedZeroFingerprint,
                type: 'ledger',
              },
              accountKeychains: [],
            })
          );
        }

        dispatch(userSwitchesAccount({ fingerprint: assumedZeroFingerprint, accountIndex: 0 }));
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
});
