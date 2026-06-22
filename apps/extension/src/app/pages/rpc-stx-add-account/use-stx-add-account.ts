import { useMemo } from 'react';

import { createRequestEncoder, createRpcSuccessResponse, stxAddAccount } from '@leather.io/rpc';

import { logger } from '@shared/logger';

import { focusTabAndWindow } from '@app/common/focus-tab';
import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { type PolicyAccountMatchStatus } from '../policy-account-match';
import { registerStxPolicyAccount } from './register-stx-policy-account';

const { decode } = createRequestEncoder(stxAddAccount.request);

function useStxAddAccountParams() {
  const { tabId, origin } = useRpcRequestParams();
  const request = initialSearchParams.get('rpcRequest');
  if (!request) throw new Error('Missing rpcRequest');
  return { tabId, origin, request: decode(request) };
}

export function useStxAddAccount() {
  const { tabId, origin, request } = useStxAddAccountParams();
  const stacksAccount = useCurrentStacksAccount();

  // The active account's public key must be one of the policy's public keys
  // before the user can confirm.
  const matchStatus: PolicyAccountMatchStatus = useMemo(() => {
    if (!stacksAccount) return 'no-active-account';
    const activePublicKey = stacksAccount.stxPublicKey.toLowerCase();
    const isSigner = request.params.publicKeys.some(
      publicKey => publicKey.toLowerCase() === activePublicKey
    );
    return isSigner ? 'match' : 'mismatch';
  }, [stacksAccount, request.params.publicKeys]);

  function focusInitiatingTab() {
    focusTabAndWindow(tabId);
  }

  return {
    origin,
    name: request.params.name,
    publicKeys: request.params.publicKeys,
    threshold: request.params.threshold,
    matchStatus,
    canApprove: matchStatus === 'match',
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

      const result = registerStxPolicyAccount(request.params);

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
