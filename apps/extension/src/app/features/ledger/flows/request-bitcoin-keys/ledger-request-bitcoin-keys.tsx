import { useNavigate } from 'react-router';

import BitcoinApp from '@ledgerhq/ledger-bitcoin';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import { pullBitcoinKeysFromLedgerDevice } from '@app/features/ledger/flows/request-bitcoin-keys/request-bitcoin-keys.utils';
import { ledgerRequestKeysRoutes } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys-route-generator';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import {
  defaultNumberOfKeysToPullFromLedgerDevice,
  useRequestLedgerKeys,
} from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import {
  connectLedgerBitcoinApp,
  getBitcoinAppVersion,
  isBitcoinAppOpen,
} from '@app/features/ledger/utils/bitcoin-ledger-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { useToast } from '@app/features/toasts/use-toast';
import { useAppDispatch } from '@app/store';
import { activateFirstVisibleAccount } from '@app/store/active/active.actions';
import { useBitcoinKeychainDescriptors } from '@app/store/keychains/keychain.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { addOrMigrateLedgerKeychains } from '@app/store/wallets/wallet.actions';
import {
  getAddWalletError,
  getUnmigratedLegacyLedgerError,
  useWalletEntities,
} from '@app/store/wallets/wallet.selectors';

function LedgerRequestBitcoinKeys() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const wallets = useWalletEntities();
  const btcKeychainDescriptors = useBitcoinKeychainDescriptors();

  const ledgerNavigate = useLedgerNavigate();
  const network = useCurrentNetwork();

  const chain = 'bitcoin';

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection } =
    useRequestLedgerKeys<BitcoinApp>({
      chain,
      connectApp: connectLedgerBitcoinApp(network.chain.bitcoin.mode),
      getAppVersion: getBitcoinAppVersion,
      isAppOpen: isBitcoinAppOpen({ network: network.chain.bitcoin.mode }),
      onSuccess() {
        void navigate('/', { replace: true });
      },
      async pullKeysFromDevice(app) {
        const { keys, fingerprint } = await pullBitcoinKeysFromLedgerDevice(app)({
          network: bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode),
          onRequestKey(index) {
            const keyGroupFinalIndex = defaultNumberOfKeysToPullFromLedgerDevice - 1;
            const isNativeSegwitkey = index <= keyGroupFinalIndex;
            if (isNativeSegwitkey) {
              void ledgerNavigate.toDeviceBusyStep(
                `Requesting Bitcoin Native Segwit address (${index + 1}…${defaultNumberOfKeysToPullFromLedgerDevice})`
              );
              return;
            }
            void ledgerNavigate.toDeviceBusyStep(
              `Requesting Bitcoin Taproot address (${index - keyGroupFinalIndex}…${defaultNumberOfKeysToPullFromLedgerDevice})`
            );
          },
        });

        const addWalletError =
          getAddWalletError(wallets, fingerprint, 'ledger') ??
          getUnmigratedLegacyLedgerError(wallets, fingerprint);
        if (addWalletError) {
          toast.error(addWalletError);
          void ledgerNavigate.toErrorStep(chain, addWalletError);
          return { status: 'failure' };
        }

        const keychains = keys
          .map(key => ({ chain: 'bitcoin' as const, descriptor: key.policy }))
          .filter(keychain => {
            return !btcKeychainDescriptors.includes(keychain.descriptor);
          });

        await dispatch(addOrMigrateLedgerKeychains({ fingerprint, accountKeychains: keychains }));
        void dispatch(activateFirstVisibleAccount(fingerprint));
        return { status: 'success' };
      },
    });

  const ledgerContextValue: LedgerRequestKeysContext = {
    chain: 'bitcoin',
    pullPublicKeysFromDevice: requestKeys,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
    />
  );
}

export const requestBitcoinKeysRoutes = ledgerRequestKeysRoutes({
  path: 'bitcoin',
  component: <LedgerRequestBitcoinKeys />,
});
