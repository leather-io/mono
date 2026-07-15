import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { makeAccountIdentifer } from '@leather.io/crypto';

import { initialSearchParams } from '@app/common/initial-search-params';
import { RootState } from '@app/store';

import { useNameOverrideById } from '../accounts/accounts.selectors';
import { selectActivePolicyId } from '../active/active.selectors';
import { selectCurrentNetwork } from '../networks/networks.selectors';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';
import { selectHasSwitched } from '../ui/ui.selectors';
import { selectWalletEntities } from '../wallets/wallet.selectors';
import { type PolicyStore, getPolicyDisplayName } from './policy-store.utils';
import { policyAdapter } from './policy.slice';

const selectors = policyAdapter.getSelectors((state: RootState) => state.policy);

export const selectAllPolicies = selectors.selectAll;

/** @knipignore */
export const selectCurrentPolicy = createSelector(
  selectors.selectEntities,
  selectActivePolicyId,
  selectHasSwitched,
  selectWalletEntities,
  selectCurrentAccount,
  selectCurrentNetwork,
  (policies, activePolicyId, hasSwitched, walletEntities, currentAccount, currentNetwork) => {
    const globalPolicy = activePolicyId ? (policies[activePolicyId] ?? null) : null;

    if (hasSwitched) return globalPolicy;

    const pinnedFingerprint = initialSearchParams.get('fingerprint');
    if (!pinnedFingerprint || !walletEntities[pinnedFingerprint]) return globalPolicy;

    const pinnedPolicyId = initialSearchParams.get('policyId');
    if (!pinnedPolicyId) return null;

    const policy = policies[pinnedPolicyId];
    if (!policy) return null;
    if (policy.networkId !== currentNetwork.id) return null;
    if (
      policy.parentAccountId !==
      makeAccountIdentifer(currentAccount.fingerprint, currentAccount.accountIndex)
    )
      return null;

    return policy;
  }
);

export function filterPoliciesByParentAndNetwork(
  policies: PolicyStore[],
  parentAccountId: string,
  networkId: string
) {
  return policies.filter(
    policy =>
      policy.parentAccountId === parentAccountId &&
      policy.role === 'signer' &&
      policy.networkId === networkId
  );
}

export function useCurrentPolicy() {
  return useSelector(selectCurrentPolicy);
}

export function usePolicyDisplayName(policy: PolicyStore | null) {
  const name = useNameOverrideById(policy?.id);
  return policy ? getPolicyDisplayName(policy, name) : null;
}
