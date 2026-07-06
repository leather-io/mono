import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@app/store';

import { useNameOverrideById } from '../accounts/accounts.selectors';
import { selectActivePolicyId } from '../active/active.selectors';
import { type PolicyStore, getPolicyDisplayName } from './policy-store.utils';
import { policyAdapter } from './policy.slice';

const selectors = policyAdapter.getSelectors((state: RootState) => state.policy);

export const selectAllPolicies = selectors.selectAll;

const selectCurrentPolicy = createSelector(
  selectors.selectEntities,
  selectActivePolicyId,
  (policies, activePolicyId) => (activePolicyId ? (policies[activePolicyId] ?? null) : null)
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

export const selectPolicyNetworkIds = createSelector(selectAllPolicies, policies => {
  return new Set(policies.map(policy => policy.networkId));
});

export function useCurrentPolicy() {
  return useSelector(selectCurrentPolicy);
}

export function usePolicyNetworkIds() {
  return useSelector(selectPolicyNetworkIds);
}

export function usePolicyDisplayName(policy: PolicyStore | null) {
  const name = useNameOverrideById(policy?.id);
  return policy ? getPolicyDisplayName(policy, name) : null;
}
