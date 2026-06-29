import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

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

const selectPoliciesByParent = createSelector(
  [
    selectAllPolicies,
    (_state: RootState, accountId: AccountId) =>
      makeAccountIdentifer(accountId.fingerprint, accountId.accountIndex),
  ],
  (policies, parentAccountId) =>
    policies.filter(
      policy => policy.parentAccountId === parentAccountId && policy.role === 'signer'
    )
);

export const selectPolicyNetworkIds = createSelector(selectAllPolicies, policies => {
  return new Set(policies.map(policy => policy.networkId));
});

export function useCurrentPolicy() {
  return useSelector(selectCurrentPolicy);
}

export function usePoliciesByParent(accountId: AccountId) {
  return useSelector((state: RootState) => selectPoliciesByParent(state, accountId));
}

export function usePolicyNetworkIds() {
  return useSelector(selectPolicyNetworkIds);
}

export function usePolicyDisplayName(policy: PolicyStore | null) {
  const name = useNameOverrideById(policy?.id);
  return policy ? getPolicyDisplayName(policy, name) : null;
}
