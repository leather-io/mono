import { useNavigate } from 'react-router';

import { getBitcoinSigner } from '@leather.io/ledger';
import { delay, makeNumberRange } from '@leather.io/utils';

import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
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
import { useBitcoinKeychainDescriptors } from '@app/store/keychains/keychain.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { addOrMigrateLedgerKeychains } from '@app/store/wallets/wallet.actions';
import {
  getAddWalletError,
  getUnmigratedLegacyLedgerError,
  useWalletEntities,
} from '@app/store/wallets/wallet.selectors';

const keysPulledSettleDelayMs = 250;

export function LedgerRequestBitcoinKeys() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const wallets = useWalletEntities();
  const btcKeychainDescriptors = useBitcoinKeychainDescriptors();

  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();
  const network = useCurrentNetwork();

  const chain = 'bitcoin';

  const {
    requestKeys,
    cancel,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useRequestLedgerKeys({
    connectRequest: { chain, network: network.chain.bitcoin.mode },
    onSuccess() {
      close();
      void navigate('/', { replace: true });
    },
    async pullKeysFromDevice(wallet, ctx) {
      const bitcoin = getBitcoinSigner(wallet);
      const { keys, fingerprint } = await bitcoin.requestAccountKeys(
        {
          network: network.chain.bitcoin.mode,
          accountIndexes: makeNumberRange(defaultNumberOfKeysToPullFromLedgerDevice),
          standards: ['nativeSegwit', 'taproot'],
          onRequestKey({ standard, accountIndex }) {
            const standardLabel = standard === 'taproot' ? 'Taproot' : 'Native Segwit';
            ledgerNavigate.toDeviceBusyStep(
              `Requesting Bitcoin ${standardLabel} address (${accountIndex + 1}…${defaultNumberOfKeysToPullFromLedgerDevice})`
            );
          },
        },
        ctx
      );
      await delay(keysPulledSettleDelayMs);

      const addWalletError =
        getAddWalletError(wallets, fingerprint, 'ledger') ??
        getUnmigratedLegacyLedgerError(wallets, fingerprint);
      if (addWalletError) {
        toast.error(addWalletError);
        ledgerNavigate.toErrorStep(chain, addWalletError);
        return { status: 'failure' };
      }

      const keychains = keys
        .map(key => ({ chain: 'bitcoin' as const, descriptor: key.descriptor }))
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
      onCancelAction={cancel}
    />
  );
}
