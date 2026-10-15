import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { type RootState } from '@app/store/store';

import { policyAdapter } from './policy.slice';

const selectors = policyAdapter.getSelectors((state: RootState) => state.policy);

export const selectPolicyNetworkIds = createSelector(selectors.selectAll, policies => {
  return new Set(policies.map(policy => policy.networkId));
});

export function usePolicyNetworkIds() {
  return useSelector(selectPolicyNetworkIds);
}
