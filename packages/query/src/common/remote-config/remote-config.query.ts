import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import get from 'lodash.get';

import { createMoney, getPrincipalFromContractId, isUndefined } from '@leather.io/utils';

import type { ActiveFiatProvider, HiroMessage, RemoteConfig } from '../../../types/remote-config';
import {
  LeatherEnvironment,
  useLeatherEnv,
  useLeatherGithub,
  useLeatherNetwork,
} from '../../leather-query-provider';

function fetchLeatherMessages(env: string, leatherGh: LeatherEnvironment['github']) {
  const IS_DEV_ENV = env === 'development';
  const IS_TESTING_ENV = env === 'testing';
  // TODO: BRANCH_NAME is not working here for config changes on PR branches
  // Playwright tests fail with config changes not on main
  const defaultBranch = IS_DEV_ENV || IS_TESTING_ENV ? 'dev' : 'main';
  const githubWalletConfigRawUrl = `https://raw.githubusercontent.com/${leatherGh.org}/${leatherGh.repo}/${
    leatherGh.branchName || defaultBranch
  }/config/wallet-config.json`;

  return async function fetchLeatherMessagesImpl(): Promise<RemoteConfig> {
    if (leatherGh.localConfig && (IS_DEV_ENV || IS_TESTING_ENV)) {
      return leatherGh.localConfig;
    }
    const resp = await axios.get(githubWalletConfigRawUrl);
    return resp.data;
  };
}

export function useRemoteConfig() {
  const env = useLeatherEnv();
  const leatherGh = useLeatherGithub();
  const { data } = useQuery({
    queryKey: ['walletConfig'],
    queryFn: fetchLeatherMessages(env, leatherGh),
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

export function useActiveFiatProviders() {
  const config = useRemoteConfig();
  if (!config?.activeFiatProviders) return {} as Record<string, ActiveFiatProvider>;

  return Object.fromEntries(
    Object.entries(config.activeFiatProviders).filter(([_, provider]) => provider.enabled)
  );
}

export function useHasFiatProviders() {
  const activeProviders = useActiveFiatProviders();
  return (
    activeProviders &&
    Object.keys(activeProviders).reduce((acc, key) => activeProviders[key].enabled || acc, false)
  );
}

export function useRecoverUninscribedTaprootUtxosFeatureEnabled() {
  const config = useRemoteConfig();
  return get(config, 'recoverUninscribedTaprootUtxosFeatureEnabled', false);
}

export function useConfigFeeEstimationsMaxEnabled() {
  const config = useRemoteConfig();
  if (isUndefined(config) || isUndefined(config?.feeEstimationsMinMax)) return;
  return config.feeEstimationsMinMax.maxValuesEnabled;
}

export function useConfigFeeEstimationsMaxValues() {
  const config = useRemoteConfig();
  if (typeof config?.feeEstimationsMinMax === 'undefined') return;
  if (!config.feeEstimationsMinMax.maxValues) return;
  if (!Array.isArray(config.feeEstimationsMinMax.maxValues)) return;
  return config.feeEstimationsMinMax.maxValues.map(value => createMoney(value, 'STX'));
}

export function useConfigFeeEstimationsMinEnabled() {
  const config = useRemoteConfig();
  if (isUndefined(config) || isUndefined(config?.feeEstimationsMinMax)) return;
  return config.feeEstimationsMinMax.minValuesEnabled;
}

export function useConfigFeeEstimationsMinValues() {
  const config = useRemoteConfig();
  if (typeof config?.feeEstimationsMinMax === 'undefined') return;
  if (!config.feeEstimationsMinMax.minValues) return;
  if (!Array.isArray(config.feeEstimationsMinMax.minValues)) return;
  return config.feeEstimationsMinMax.minValues.map(value => createMoney(value, 'STX'));
}

export function useConfigNftMetadataEnabled() {
  const config = useRemoteConfig();
  return config?.nftMetadataEnabled ?? true;
}

export function useConfigOrdinalsbot() {
  const config = useRemoteConfig();

  return {
    integrationEnabled: config?.ordinalsbot?.integrationEnabled ?? true,
    mainnetApiUrl: config?.ordinalsbot?.mainnetApiUrl ?? 'https://api2.ordinalsbot.com',
    signetApiUrl: config?.ordinalsbot?.signetApiUrl ?? 'https://signet.ordinalsbot.com',
  };
}

export function useConfigRunesEnabled() {
  const config = useRemoteConfig();
  return get(config, 'runesEnabled', false);
}

export function useConfigSwapsEnabled() {
  const config = useRemoteConfig();
  return get(config, 'swapsEnabled', false);
}

export function useConfigTokensEnabledByDefault(): string[] {
  const config = useRemoteConfig();
  return get(config, 'tokensEnabledByDefault', []);
}

export function useConfigTokenTransferFeeEstimations() {
  const config = useRemoteConfig();
  return get(config, 'tokenTransferFeeEstimations', []);
}

export function useConfigSbtc() {
  const config = useRemoteConfig();
  const network = useLeatherNetwork();
  const sbtc = config?.sbtc;

  return useMemo(() => {
    const displayPromoCardOnNetworks = (sbtc as any)?.showPromoLinkOnNetworks ?? [];
    const contractIdMainnet = sbtc?.contracts.mainnet.address ?? '';
    const contractIdTestnet = sbtc?.contracts.testnet.address ?? '';

    return {
      isSbtcEnabled: sbtc?.enabled ?? false,
      isSbtcSwapsEnabled: (sbtc?.enabled && sbtc?.swapsEnabled) ?? false,
      emilyApiUrl: sbtc?.emilyApiUrl ?? '',
      contractId: network.chain.bitcoin.mode === 'mainnet' ? contractIdMainnet : contractIdTestnet,
      isSbtcContract(contract: string) {
        return (
          contract === getPrincipalFromContractId(contractIdMainnet) ||
          contract === getPrincipalFromContractId(contractIdTestnet)
        );
      },
      shouldDisplayPromoCard: displayPromoCardOnNetworks.includes(network.id),
    };
  }, [network.chain.bitcoin.mode, network.id, sbtc]);
}
