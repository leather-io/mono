import { styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';
import { useStacksNetwork } from '~/store/stacks-network';

import { type NetworkMode, networkModeInfo } from '../data/network-mode';

export function NetworkModeGlow() {
  const { networkName } = useStacksNetwork();
  const mode: NetworkMode = networkName === 'mainnet' ? 'mainnet' : 'testnet';
  const info = networkModeInfo[mode];

  return (
    <styled.div
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="220px"
      pointerEvents="none"
      zIndex={0}
      transition="opacity 500ms ease"
      opacity={info.isProduction ? 0 : 0.5}
      style={{
        background: `radial-gradient(120% 100% at 50% 0%, ${token.var(`colors.${info.tone.glow}`)} 0%, transparent 72%)`,
      }}
    />
  );
}
