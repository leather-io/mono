import { useNavigate } from 'react-router';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import { pullBitcoinKeysFromLedgerDevice } from '@app/features/ledger/flows/request-bitcoin-keys/request-bitcoin-keys.utils';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import {
  defaultNumberOfKeysToPullFromLedgerDevice,
  useRequestLedgerKeys,
} from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import {
  connectLedgerBitcoinApp,
  getBitcoinAppVersion,
  isBitcoinAppOpen,
} from '@app/features/ledger/utils/bitcoin-ledger-utils';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import type { LedgerBitcoinApp } from '@app/features/ledger/utils/ledger-app';
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

export function LedgerRequestBitcoinKeys() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const wallets = useWalletEntities();
  const btcKeychainDescriptors = useBitcoinKeychainDescriptors();

  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();
  const network = useCurrentNetwork();

  const chain = 'bitcoin';

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection, isConnectionCancellable } =
    useRequestLedgerKeys<LedgerBitcoinApp>({
      chain,
      connectApp: connectLedgerBitcoinApp(dmk, network.chain.bitcoin.mode, signerActions.run),
      getAppVersion: getBitcoinAppVersion(dmk),
      isAppOpen: isBitcoinAppOpen({ network: network.chain.bitcoin.mode }),
      onSuccess() {
        close();
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

  const canCancelLedgerAction = useCancelLedgerAction({
    awaitingDeviceConnection,
    isConnectionCancellable,
  });
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
      onCancelAction={signerActions.cancelActive}
    />
  );
}
