import { createElement, useEffect, useSyncExternalStore } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCreateWallet } from '@/hooks/use-create-wallet';
import { tempMnemonicStore } from '@/store/secure-store/temp-mnemonic-store';

import { generateMnemonic } from '@leather.io/crypto';

import { storeAccountDirectory } from './account-directory';
import {
  describeBroadcasts,
  readE2eState,
  registerAccountDirectory,
  subscribeE2eState,
  takeWalletRequest,
} from './e2e-state';
import { e2eOverlay } from './register';

const activeScenarioTestId = 'e2eActiveScenario';
const broadcastsTestId = 'e2eBroadcasts';

registerAccountDirectory(storeAccountDirectory);

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 64, left: 0 },
  label: { fontSize: 4, lineHeight: 5, color: 'rgba(0, 0, 0, 0.01)' },
});

export function WalletSeeder() {
  const state = useSyncExternalStore(subscribeE2eState, readE2eState);
  const { activeScenarios, walletRequested } = state;
  const { createWallet } = useCreateWallet();

  useEffect(() => {
    if (!walletRequested || !takeWalletRequest()) return;
    async function seedWallet() {
      await tempMnemonicStore.setTemporaryMnemonic(generateMnemonic());
      await createWallet({ biometrics: false });
    }
    void seedWallet();
  }, [walletRequested, createWallet]);

  return createElement(
    View,
    { pointerEvents: 'none', style: styles.overlay },
    createElement(Text, { testID: activeScenarioTestId, style: styles.label }, activeScenarios),
    createElement(
      Text,
      { testID: broadcastsTestId, style: styles.label },
      describeBroadcasts(state)
    )
  );
}

e2eOverlay.Component = WalletSeeder;
