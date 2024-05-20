import { useConfigOrdinalsbot } from '../../../common/remote-config/remote-config.query';
import { useLeatherNetwork } from '../../../leather-query-provider';

// ts-unused-exports:disable-next-line
export function useBrc20FeatureFlag() {
  const currentNetwork = useLeatherNetwork();

  const ordinalsbotConfig = useConfigOrdinalsbot();

  if (!ordinalsbotConfig.integrationEnabled) {
    return { enabled: false, reason: 'BRC-20 transfers are temporarily disabled' } as const;
  }

  const supportedNetwork =
    currentNetwork.chain.bitcoin.bitcoinNetwork === 'mainnet' ||
    currentNetwork.chain.bitcoin.bitcoinNetwork === 'signet';

  if (!supportedNetwork) return { enabled: false, reason: 'Unsupported network' } as const;

  // TODO: Add api availability check

  return { enabled: true } as const;
}
