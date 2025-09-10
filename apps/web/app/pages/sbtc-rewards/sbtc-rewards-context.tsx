import { createContext, useContext } from 'react';

import { ExtensionState, whenExtensionState } from '~/utils/utils';

interface SbtcRewardContextValue {
  whenExtensionState: ReturnType<typeof whenExtensionState>;
  extensionStatus: ExtensionState;
  onBridgeSbtc(): void;
  onSwapStxSbtc(): void;
}
export const SbtcRewardContext = createContext<SbtcRewardContextValue | null>(null);

export function useSbtcRewardContext() {
  const context = useContext(SbtcRewardContext);
  if (!context) throw new Error('useSbtcReward must be used within a SbtcRewardProvider');
  return context;
}
