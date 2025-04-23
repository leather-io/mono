import {
  LeatherEnvironment,
  useLeatherEnv,
  useLeatherGithub,
} from '@/queries/leather-query-provider';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import get from 'lodash.get';

import { type DefaultMinMaxRangeFeeEstimations, type RemoteConfig } from '@leather.io/query';
import { createMoney, isUndefined } from '@leather.io/utils';

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

function useRemoteConfig() {
  const env = useLeatherEnv();
  const leatherGh = useLeatherGithub();
  const { data } = useQuery({
    queryKey: ['walletConfig'],
    queryFn: fetchLeatherMessages(env, leatherGh),
    initialData: leatherGh.localConfig,
    // As we're fetching from Github, a third-party, we want
    // to avoid any unnecessary stress on their services, so
    // we use quite slow stale/retry times
    staleTime: 1000 * 60 * 10,
    retryDelay: 1000 * 60,
  });

  return data;
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

export function useConfigTokenTransferFeeEstimations() {
  const config = useRemoteConfig();
  return get(config, 'tokenTransferFeeEstimations', []);
}

export function useConfigStacksContractCallFeeEstimations():
  | DefaultMinMaxRangeFeeEstimations
  | undefined {
  const config = useRemoteConfig();
  return get(config, 'stacksContractCallFeeEstimations', undefined);
}

export function useConfigStacksContractDeploymentFeeEstimations():
  | DefaultMinMaxRangeFeeEstimations
  | undefined {
  const config = useRemoteConfig();
  return get(config, 'stacksContractDeploymentFeeEstimations', undefined);
}
