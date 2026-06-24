import { useMemo } from 'react';

import { compileWshDescriptor, findAccountDescriptorKey } from '@leather.io/bitcoin';
import { btcAddAccount, createRequestEncoder, createRpcSuccessResponse } from '@leather.io/rpc';

import { logger } from '@shared/logger';

import { focusTabAndWindow } from '@app/common/focus-tab';
import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { usePolicyAccountFeatureGate } from '../policy-account-feature-gate';
import { type PolicyAccountMatchStatus } from '../policy-account-match';
import { registerBtcPolicyAccount } from './register-btc-policy-account';

const { decode } = createRequestEncoder(btcAddAccount.request);

function useBtcAddAccountParams() {
  const { tabId, origin } = useRpcRequestParams();
  const request = initialSearchParams.get('rpcRequest');
  if (!request) throw new Error('Missing rpcRequest');
  return { tabId, origin, request: decode(request) };
}

export function useBtcAddAccount() {
  const { tabId, origin, request } = useBtcAddAccountParams();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const { isFeatureEnabled, rejectAsUnsupported } = usePolicyAccountFeatureGate({
    method: request.method,
    id: request.id,
    tabId,
  });

  // The active account must be one of the descriptor's cosigners before the user
  // can confirm. We only consider the native segwit account's xpub or its 0/0
  // public key: `findAccountDescriptorKey` matches the account xpub, or the raw
  // 0/0 public key, against the compiled descriptor — the same check signPsbt uses.
  const matchStatus: PolicyAccountMatchStatus = useMemo(() => {
    if (!nativeSegwitAccount) return 'no-active-account';
    try {
      const compiled = compileWshDescriptor(request.params.descriptor);
      return findAccountDescriptorKey(compiled, nativeSegwitAccount.keychain)
        ? 'match'
        : 'mismatch';
    } catch {
      return 'mismatch';
    }
  }, [nativeSegwitAccount, request.params.descriptor]);

  function focusInitiatingTab() {
    focusTabAndWindow(tabId);
  }

  return {
    origin,
    name: request.params.name,
    descriptor: request.params.descriptor,
    matchStatus,
    canApprove: matchStatus === 'match',
    isFeatureEnabled,
    rejectAsUnsupported,
    focusInitiatingTab,
    onUserApprovesAddAccount() {
      if (!tabId || !origin) {
        logger.error('Cannot add account: missing tabId, origin');
        return;
      }
      if (matchStatus !== 'match') {
        logger.error('Cannot add account: active account is not part of the policy');
        return;
      }

      const result = registerBtcPolicyAccount(request.params);

      void chrome.tabs.sendMessage(
        tabId,
        createRpcSuccessResponse(request.method, {
          id: request.id,
          result,
        })
      );
    },
  };
}
