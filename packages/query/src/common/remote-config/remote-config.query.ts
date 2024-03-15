import { createMoney } from '@leather-wallet/models';
import { isUndefined } from '@leather-wallet/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import localConfig from '../../../config/wallet-config.json';
import { useLeatherEnv } from '../../leather-query-provider';

export interface HiroMessage {
  id: string;
  title: string;
  text: string;
  img?: string;
  imgWidth?: string;
  purpose: 'error' | 'info' | 'warning';
  publishedAt: string;
  dismissible: boolean;
  chainTarget: 'all' | 'mainnet' | 'testnet';
  learnMoreUrl?: string;
  learnMoreText?: string;
}

export enum AvailableRegions {
  InsideUsa = 'inside-usa-only',
  OutsideUsa = 'outside-usa-only',
  Global = 'global',
}

export interface ActiveFiatProvider {
  availableRegions: AvailableRegions;
  enabled: boolean;
  hasFastCheckoutProcess: boolean;
  hasTradingFees: boolean;
  name: string;
}

interface FeeEstimationsConfig {
  maxValues?: number[];
  maxValuesEnabled?: boolean;
  minValues?: number[];
  minValuesEnabled?: boolean;
}

interface RemoteConfig {
  messages: any;
  activeFiatProviders?: Record<string, ActiveFiatProvider>;
  bitcoinEnabled: boolean;
  bitcoinSendEnabled: boolean;
  feeEstimationsMinMax?: FeeEstimationsConfig;
  nftMetadataEnabled: boolean;
  ordinalsbot: {
    integrationEnabled: boolean;
    mainnetApiUrl: string;
    signetApiUrl: string;
  };
  recoverUninscribedTaprootUtxosFeatureEnabled?: boolean;
}

function useRemoteConfig() {
  const { WALLET_ENVIRONMENT, isTestEnv, isDevEnv, BRANCH_NAME, GITHUB_ORG, GITHUB_REPO } =
    useLeatherEnv();

  // TODO: BRANCH_NAME is not working here for config changes on PR branches
  // Playwright tests fail with config changes not on main
  const defaultBranch = isDevEnv || WALLET_ENVIRONMENT === 'testing' ? 'dev' : 'main';
  const githubWalletConfigRawUrl = `https://raw.githubusercontent.com/${GITHUB_ORG}/${GITHUB_REPO}/${
    BRANCH_NAME || defaultBranch
  }/config/wallet-config.json`;

  async function fetchLeatherMessages(): Promise<RemoteConfig> {
    if (WALLET_ENVIRONMENT !== 'production' || isTestEnv) return localConfig as RemoteConfig;
    const resp = await axios.get(githubWalletConfigRawUrl);
    return resp.data;
  }

  const { data } = useQuery(['walletConfig'], fetchLeatherMessages, {
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
  return config?.messages.global ?? [];
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
  return config?.recoverUninscribedTaprootUtxosFeatureEnabled ?? false;
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
  config?.ordinalsbot.integrationEnabled;
  return {
    integrationEnabled: config?.ordinalsbot.integrationEnabled ?? true,
    mainnetApiUrl: config?.ordinalsbot.mainnetApiUrl ?? 'https://api2.ordinalsbot.com',
    signetApiUrl: config?.ordinalsbot.signetApiUrl ?? 'https://signet.ordinalsbot.com',
  };
}
