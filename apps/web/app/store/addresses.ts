import { useEffect, useMemo } from 'react';

import { StacksNetwork } from '@stacks/network';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '~/features/toasts/use-toast';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { analytics } from '~/utils/analytics/analytics';
import { leather } from '~/utils/leather-sdk';
import { type ExtensionState, isAnyWalletInstalled, whenExtensionState } from '~/utils/utils';
import {
  connectWallet,
  disconnectWallet,
  getConnectedWalletId,
  leatherProviderId,
  markLeatherAsSelectedWallet,
  revokeWalletPermissions,
} from '~/utils/wallet';
import { WalletAddressEntry } from '~/utils/wallet-addresses';

import { AccountAddresses, ChainId } from '@leather.io/models';
import { createAccountAddresses, delay } from '@leather.io/utils';

import { useStacksNetwork } from './stacks-network';

const addressesAtom = atomWithStorage<WalletAddressEntry[]>('addresses', []);

const providerDetectedAtom = atom(isAnyWalletInstalled());

const connectedWalletIdAtom = atom<string | null>(getConnectedWalletId());

// Read at click time rather than render, so it needs no router context and
// stays correct across client-side navigation.
function isOnStakingRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith(stakingPaths.index);
}

const extensionStateAtom = atom<ExtensionState>(get => {
  const addresses = get(addressesAtom);
  if (addresses.length !== 0) return 'connected';
  if (get(providerDetectedAtom)) return 'detected';
  return 'missing';
});

const providerPollIntervalMs = 50;
const providerPollMaxMs = 2000;

const btcPaymentAddressPreference = ['p2wpkh', 'p2sh', 'p2pkh'] as const;

const connectErrorMessage = `Couldn't connect wallet. Please try again.`;

export function useDetectLeatherProvider() {
  const setProviderDetected = useSetAtom(providerDetectedAtom);
  const setConnectedWalletId = useSetAtom(connectedWalletIdAtom);
  const addresses = useAtomValue(addressesAtom);

  useEffect(() => {
    setConnectedWalletId(getConnectedWalletId());
    if (addresses.length === 0) return;
    if (getConnectedWalletId() !== null) return;
    markLeatherAsSelectedWallet();
    setConnectedWalletId(getConnectedWalletId());
  }, [addresses, setConnectedWalletId]);

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

const showMissingStacksKeysDialogAtom = atom<false | 'leather' | 'generic'>(false);
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
  const toast = useToast();
  const extensionState = useAtomValue(extensionStateAtom);
  const [showMissingStacksKeysDialog, setShowMissingStacksKeysDialog] = useAtom(
    showMissingStacksKeysDialogAtom
  );
  const [showInstallLeatherDialog, setShowInstallLeatherDialog] = useAtom(
    showInstallLeatherDialogAtom
  );

  const stacksAccount = useStacksAccount();

  const btcPaymentAddress = useMemo(() => {
    for (const type of btcPaymentAddressPreference) {
      const match = addresses.find(address => 'type' in address && address.type === type);
      if (match) return match;
    }
    return undefined;
  }, [addresses]);

  const btcAccount = useMemo(() => {
    const btcAddresses = addresses.filter(addr => addr.symbol === 'BTC');
    const descriptors = btcAddresses
      .filter(addr => 'descriptor' in addr)
      .map(addr => addr.descriptor);

    const account = createAccountAddresses(
      { fingerprint: 'web-sdk', accountIndex: 0 },
      descriptors
    );
    if (account.bitcoin || !btcPaymentAddress) return account;
    if (!('type' in btcPaymentAddress) || !btcPaymentAddress.type) return account;

    const fixedAddressAccount: AccountAddresses = {
      ...account,
      bitcoin: {
        type: 'fixedAddress',
        address: btcPaymentAddress.address,
        paymentType: btcPaymentAddress.type,
      },
    };
    return fixedAddressAccount;
  }, [addresses, btcPaymentAddress]);

  const accounts = { stacksAccount, btcAccount, btcPaymentAddress };

  const [storedWalletId, setConnectedWalletId] = useAtom(connectedWalletIdAtom);

  function syncConnectedWalletId() {
    setConnectedWalletId(getConnectedWalletId());
  }

  const connectedWalletId = extensionState === 'connected' ? storedWalletId : null;
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
      const previousWalletId = getConnectedWalletId();
      analytics.untypedTrack('sign_in_clicked', { status: 'initiated' });
      try {
        const result = await connectWallet({ allowWalletSelect: isOnStakingRoute() });

        if (result.status === 'canceled') {
          syncConnectedWalletId();
          if (result.sessionRevoked) setAddresses([]);
          analytics.untypedTrack('sign_in_clicked', {
            status: 'error',
            reason: 'user_rejected',
            duration: performance.now() - startTime,
          });
          return;
        }

        if (result.status === 'error') {
          syncConnectedWalletId();
          if (result.sessionRevoked) setAddresses([]);
          toast.error(connectErrorMessage);
          analytics.untypedTrack('sign_in_clicked', {
            status: 'error',
            reason: 'connect_failed',
            duration: performance.now() - startTime,
          });
          return;
        }

        const walletAddresses = result.addresses;

        if (!walletAddresses.some(address => address.symbol === 'STX')) {
          const attemptedWalletId = getConnectedWalletId();
          if (previousWalletId === leatherProviderId) {
            await revokeWalletPermissions();
            markLeatherAsSelectedWallet();
          } else {
            setAddresses([]);
            disconnectWallet();
          }
          syncConnectedWalletId();
          await waitForExtensionConnectAnimationToFinish();
          setShowMissingStacksKeysDialog(
            attemptedWalletId === leatherProviderId ? 'leather' : 'generic'
          );

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
        syncConnectedWalletId();
        completeZealyConnectTask(
          stacksNetwork.network,
          walletAddresses.find(address => address.symbol === 'STX')?.address
        );
        return walletAddresses;
      } catch {
        analytics.untypedTrack('sign_in_clicked', {
          status: 'error',
          reason: 'connect_failed',
          duration: performance.now() - startTime,
        });
      }
    },
    disconnect() {
      analytics.untypedTrack('sign_out_clicked');
      setAddresses([]);
      disconnectWallet();
      syncConnectedWalletId();
    },
  };
}

function completeZealyConnectTask(network: StacksNetwork, address?: string) {
  if (getConnectedWalletId() !== leatherProviderId) return;
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
