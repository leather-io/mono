import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import get from 'lodash.get';

import { HiroMessage, type RemoteConfig } from '@leather.io/query';
import { getPrincipalFromAssetString } from '@leather.io/stacks';

import { GITHUB_ORG, GITHUB_REPO } from '@shared/constants';
import { IS_DEV_ENV, IS_TEST_ENV } from '@shared/environment';

import { useWalletType } from '@app/common/use-wallet-type';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import walletConfig from '../../../../../config/wallet-config.json';

export { HiroMessage } from '@leather.io/query';

async function fetchLeatherConfig(): Promise<RemoteConfig> {
  // TODO: BRANCH_NAME is not working here for config changes on PR branches
  // Playwright tests fail with config changes not on main
  const defaultBranch = IS_DEV_ENV || IS_TEST_ENV ? 'dev' : 'main';
  const githubWalletConfigRawUrl = `https://raw.githubusercontent.com/${GITHUB_ORG}/${GITHUB_REPO}/${
    defaultBranch
  }/config/wallet-config.json`;

  if (walletConfig && (IS_DEV_ENV || IS_TEST_ENV)) {
    return walletConfig as RemoteConfig;
  }
  const resp = await axios.get(githubWalletConfigRawUrl);
  return resp.data;
}

export function useConfigBitcoinSendEnabled() {
  const { whenWallet } = useWalletType();
  const config = useRemoteConfig();
  const hasBitcoinAccount = useHasCurrentBitcoinAccount();
  return whenWallet({
    ledger: config?.bitcoinSendEnabled && hasBitcoinAccount,
    software: config?.bitcoinSendEnabled ?? true,
  });
}

// Update in mono repo
interface SbtcConfig {
  enabled: boolean;
  contracts: Record<'mainnet' | 'testnet', { address: string }>;
  emilyApiUrl: string;
  sponsorshipApiUrl: {
    mainnet: string;
    testnet: string;
  };
  swapsEnabled: boolean;
  sponsorshipsEnabled: boolean;
}

export function useConfigSbtc() {
  const config = useRemoteConfig();
  const network = useCurrentNetwork();
  const sbtc = config?.sbtc as SbtcConfig;

  return useMemo(() => {
    const contractIdMainnet = sbtc?.contracts.mainnet.address ?? '';
    const contractIdTestnet = sbtc?.contracts.testnet.address ?? '';
    const apiUrlMainnet = sbtc?.sponsorshipApiUrl.mainnet ?? '';
    const apiUrlTestnet = sbtc?.sponsorshipApiUrl.testnet ?? '';

    return {
      configLoading: !sbtc,
      isSbtcEnabled: sbtc?.enabled ?? false,
      isSbtcSponsorshipsEnabled: (sbtc?.enabled && sbtc?.sponsorshipsEnabled) ?? false,
      emilyApiUrl: sbtc?.emilyApiUrl ?? '',
      contractId: network.chain.bitcoin.mode === 'mainnet' ? contractIdMainnet : contractIdTestnet,
      sponsorshipApiUrl: network.chain.bitcoin.mode === 'mainnet' ? apiUrlMainnet : apiUrlTestnet,
      isSbtcContract(contract: string) {
        return (
          contract === getPrincipalFromAssetString(contractIdMainnet) ||
          contract === getPrincipalFromAssetString(contractIdTestnet)
        );
      },
    };
  }, [network.chain.bitcoin.mode, sbtc]);
}

function useRemoteConfig() {
  const { data } = useQuery({
    queryKey: ['walletConfig'],
    queryFn: () => fetchLeatherConfig(),
    // initialData: walletConfig as RemoteConfig,
    // As we're fetching from Github, a third-party, we want
    // to avoid any unnecessary stress on their services, so
    // we use quite slow stale/retry times
    staleTime: 1000 * 60 * 10,
    retryDelay: 1000 * 60,
  });

  return data;
}

export function useRemoteLeatherMessages(): HiroMessage[] {
  const config = useRemoteConfig();
  return get(config, 'messages.global', []);
}

export function useConfigSwapsEnabled() {
  const config = useRemoteConfig();
  return get(config, 'swapsEnabled', false);
}

export function useConfigTokensEnabledByDefault(): string[] {
  const config = useRemoteConfig();
  return get(config, 'tokensEnabledByDefault', []);
}

export function useConfigSpamFilterWhitelist(): string[] {
  const config = useRemoteConfig();
  return get(config, 'spamFilterWhitelist', []);
}

export function useConfigPromoCardEnabled() {
  const config = useRemoteConfig();
  return get(config, 'promoCardEnabled', false);
}
