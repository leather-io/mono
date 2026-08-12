import { useEffect, useMemo } from 'react';

import { StacksNetwork } from '@stacks/network';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { v4 as uuidv4 } from 'uuid';
import { analytics } from '~/utils/analytics/analytics';
import { leather } from '~/utils/leather-sdk';
import { type ExtensionState, isAnyWalletInstalled, whenExtensionState } from '~/utils/utils';
import {
  connectWallet,
  disconnectWallet,
  getConnectedWalletId,
  leatherProviderId,
  markLeatherAsSelectedWallet,
} from '~/utils/wallet';
import { WalletAddressEntry } from '~/utils/wallet-addresses';

import { ChainId } from '@leather.io/models';
import { createAccountAddresses, delay } from '@leather.io/utils';

import { useStacksNetwork } from './stacks-network';

const addressesAtom = atomWithStorage<WalletAddressEntry[]>('addresses', []);

const providerDetectedAtom = atom(isAnyWalletInstalled());

const extensionStateAtom = atom<ExtensionState>(get => {
  const addresses = get(addressesAtom);
  if (addresses.length !== 0) return 'connected';
  if (get(providerDetectedAtom)) return 'detected';
  return 'missing';
});

const providerPollIntervalMs = 50;
const providerPollMaxMs = 2000;

export function useDetectLeatherProvider() {
  const setProviderDetected = useSetAtom(providerDetectedAtom);
  const addresses = useAtomValue(addressesAtom);

  useEffect(() => {
    if (addresses.length === 0) return;
    if (getConnectedWalletId() !== null) return;
    markLeatherAsSelectedWallet();
  }, [addresses]);

  useEffect(() => {
    if (isAnyWalletInstalled()) {
      setProviderDetected(true);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (isAnyWalletInstalled()) {
        setProviderDetected(true);
        clearInterval(interval);
      } else if (Date.now() - start > providerPollMaxMs) {
        clearInterval(interval);
      }
    }, providerPollIntervalMs);

    return () => clearInterval(interval);
  }, [setProviderDetected]);
}

const stacksAccountAtom = atom(get => {
  const addresses = get(addressesAtom);
  return addresses.find(address => address.symbol === 'STX');
});

const showMissingStacksKeysDialogAtom = atom(false);
const showInstallLeatherDialogAtom = atom(false);

export function useStacksAccount() {
  return useAtomValue(stacksAccountAtom);
}

async function waitForExtensionConnectAnimationToFinish() {
  await delay(750);
}

export function useLeatherConnect() {
  const [addresses, setAddresses] = useAtom(addressesAtom);
  const stacksNetwork = useStacksNetwork();
  const extensionState = useAtomValue(extensionStateAtom);
  const [showMissingStacksKeysDialog, setShowMissingStacksKeysDialog] = useAtom(
    showMissingStacksKeysDialogAtom
  );
  const [showInstallLeatherDialog, setShowInstallLeatherDialog] = useAtom(
    showInstallLeatherDialogAtom
  );

  const stacksAccount = useStacksAccount();

  const btcAccount = useMemo(() => {
    const btcAddresses = addresses.filter(addr => addr.symbol === 'BTC');
    const descriptors = btcAddresses
      .filter(addr => 'descriptor' in addr)
      .map(addr => addr.descriptor);

    return createAccountAddresses({ fingerprint: 'web-sdk', accountIndex: 0 }, descriptors);
  }, [addresses]);

  const btcAddressP2tr = useMemo(
    () => addresses.find(address => 'type' in address && address.type === 'p2tr'),
    [addresses]
  );

  const btcAddressP2wpkh = useMemo(
    () => addresses.find(address => 'type' in address && address.type === 'p2wpkh'),
    [addresses]
  );

  const accounts = { stacksAccount, btcAccount, btcAddressP2tr, btcAddressP2wpkh };

  const connectedWalletId = extensionState === 'connected' ? getConnectedWalletId() : null;
  const isLeatherWallet = connectedWalletId === leatherProviderId;

  return {
    addresses,
    setAddresses,
    connectedWalletId,
    isLeatherWallet,
    showMissingStacksKeysDialog,
    setShowMissingStacksKeysDialog,
    showInstallLeatherDialog,
    setShowInstallLeatherDialog,
    status: extensionState,
    ...accounts,
    whenExtensionState: whenExtensionState(extensionState),
    openExtension() {
      analytics.untypedTrack('open_extension_clicked');
      void leather.open({ mode: 'fullpage' });
    },
    async connect() {
      const startTime = performance.now();
      analytics.untypedTrack('sign_in_clicked', { status: 'initiated' });
      try {
        const result = await connectWallet();

        if (result.status === 'canceled') {
          if (result.sessionRevoked) setAddresses([]);
          analytics.untypedTrack('sign_in_clicked', {
            status: 'error',
            reason: 'user_rejected',
            duration: performance.now() - startTime,
          });
          return;
        }

        const walletAddresses = result.addresses;

        if (!walletAddresses.some(address => address.symbol === 'STX')) {
          await waitForExtensionConnectAnimationToFinish();
          setShowMissingStacksKeysDialog(true);

          analytics.untypedTrack('sign_in_clicked', {
            status: 'error',
            error: 'no_stacks_account',
            duration: performance.now() - startTime,
          });
          return;
        }

        analytics.untypedTrack('sign_in_clicked', {
          status: 'success',
          duration: performance.now() - startTime,
        });
        setAddresses(walletAddresses);
        completeZealyConnectTask(
          stacksNetwork.network,
          walletAddresses.find(address => address.symbol === 'STX')?.address
        );
        return walletAddresses;
      } catch {
        analytics.untypedTrack('sign_in_clicked', {
          status: 'error',
          reason: 'user_rejected',
          duration: performance.now() - startTime,
        });
      }
    },
    disconnect() {
      analytics.untypedTrack('sign_out_clicked');
      setAddresses([]);
      disconnectWallet();
    },
  };
}

function completeZealyConnectTask(network: StacksNetwork, address?: string) {
  if (network.chainId === ChainId.Mainnet && address) {
    fetch('https://api.leather.io/v1/quests/connect-earn/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': uuidv4(),
      },
      body: JSON.stringify({
        address,
      }),
    })
      // eslint-disable-next-line no-console
      .catch(() => console.error('Unable to complete quest task'));
  }
}
