import { AccountSelectors } from '@tests/selectors/account.selectors';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { CryptoAssetSelectors } from '@tests/selectors/crypto-asset.selectors';
import { FundPageSelectors } from '@tests/selectors/fund.selectors';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import {
  CoreAssetSelectors,
  MockedTokensSelectors,
} from '@tests/selectors/mocked-tokens.selectors';
import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import {
  ConnectAccountSelectors,
  PostConditionSelectors,
  PsbtSelectors,
} from '@tests/selectors/requests.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { TokenDetailsSelectors } from '@tests/selectors/token-details.selectors';
import { UpdateAvailableSelectors } from '@tests/selectors/update-available.selectors';

import { VerifyUsageError } from './verify-errors';

export const selectorRegistry = {
  AccountSelectors,
  ActivitySelectors,
  AllBalancesSelectors,
  BondsSelectors,
  CollectiblesSelectors,
  ConnectAccountSelectors,
  CoreAssetSelectors,
  CryptoAssetSelectors,
  FundPageSelectors,
  HomePageSelectors,
  MockedTokensSelectors,
  NetworkSelectors,
  OnboardingSelectors,
  PostConditionSelectors,
  PsbtSelectors,
  SendCryptoAssetSelectors,
  SettingsSelectors,
  SharedComponentsSelectors,
  SwapRevampSelectors,
  SwitchAccountSelectors,
  TokenDetailsSelectors,
  UpdateAvailableSelectors,
} as const;

export interface ResolvedReadyTarget {
  target: string;
  testId: string;
}

const memberSeparator = '.';

const selectorGroups: ReadonlyMap<string, ReadonlyMap<string, string>> = new Map(
  Object.entries(selectorRegistry).map(([groupName, group]) => [
    groupName,
    new Map(Object.entries(group)),
  ])
);

export function resolveReadyTarget(target: string): ResolvedReadyTarget {
  const separatorIndex = target.indexOf(memberSeparator);
  if (separatorIndex === -1) return { target, testId: target };
  const groupName = target.slice(0, separatorIndex);
  const memberName = target.slice(separatorIndex + memberSeparator.length);
  const group = selectorGroups.get(groupName);
  if (group === undefined) {
    throw new VerifyUsageError(
      `Unknown selector group "${groupName}" in --ready ${target}. Known groups: ${[...selectorGroups.keys()].join(', ')}`
    );
  }
  const testId = group.get(memberName);
  if (testId === undefined) {
    throw new VerifyUsageError(
      `Unknown member "${memberName}" of ${groupName}. Known members: ${[...group.keys()].join(', ')}`
    );
  }
  return { target, testId };
}
