import { styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';
import { useStacksNetwork } from '~/store/stacks-network';

export function NetworkModeGlow() {
  const { networkName } = useStacksNetwork();
  const isMainnet = networkName === 'mainnet';

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
      opacity={isMainnet ? 0 : 0.5}
      style={{
        background: `radial-gradient(120% 100% at 50% 0%, ${token('colors.yellow.action-primary-default')} 0%, transparent 72%)`,
      }}
    />
  );
}
