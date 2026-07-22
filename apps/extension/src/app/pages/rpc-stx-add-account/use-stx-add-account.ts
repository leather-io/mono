import { useMemo } from 'react';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';
import {
  RpcErrorCode,
  type RpcResult,
  createRequestEncoder,
  createRpcErrorResponse,
  createRpcSuccessResponse,
  stxAddAccount,
} from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';

import { focusTabAndWindow } from '@app/common/focus-tab';
import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useNetworks } from '@app/store/networks/networks.selectors';

import { usePolicyFeatureGate } from '../policy-feature-gate';
import {
  type PolicyApprovalMode,
  type PolicyMatchStatus,
  getPolicyApprovalMode,
} from '../policy-match';
import { useRegisterStxPolicy } from './register-stx-policy';
import { deriveStxPolicyAddress } from './stx-policy-registration';

const { decode } = createRequestEncoder(stxAddAccount.request);

function useStxAddAccountParams() {
  const { frameId, tabId, origin } = useRpcRequestParams();
  const request = initialSearchParams.get('rpcRequest');
  if (!request) throw new Error('Missing rpcRequest');
  return { frameId, tabId, origin, request: decode(request) };
}

export function useStxAddAccount() {
  const { frameId, tabId, origin, request } = useStxAddAccountParams();
  const stacksAccount = useCurrentStacksAccount();
  const registerStxPolicy = useRegisterStxPolicy();
  const networks = useNetworks();
  const { isFeatureEnabled, rejectAsUnsupported } = usePolicyFeatureGate({
    method: request.method,
    frameId,
    id: request.id,
    tabId,
  });

  // Whitelisted origins may register the policy; any other origin may only let
  // the user verify the derived address (nothing is written to the extension).
  const mode: PolicyApprovalMode = getPolicyApprovalMode(origin);

  // The active account's public key must be one of the policy's public keys
  // before the user can confirm.
  const matchStatus: PolicyMatchStatus = useMemo(() => {
    if (!stacksAccount) return 'no-active-account';
    const activePublicKey = stacksAccount.stxPublicKey.toLowerCase();
    const isSigner = request.params.publicKeys.some(
      publicKey => publicKey.toLowerCase() === activePublicKey
    );
    return isSigner ? 'match' : 'mismatch';
  }, [stacksAccount, request.params.publicKeys]);

  // Derived locally and identically to registration, so what the user verifies
  // equals what is stored / returned. Null on an unexpected derivation failure
  // (never throw in render); the page disables confirm and warns.
  const address = useMemo(() => {
    try {
      return deriveStxPolicyAddress({ params: request.params, networks }).address;
    } catch {
      return null;
    }
  }, [request.params, networks]);

  function focusInitiatingTab() {
    focusTabAndWindow(tabId);
  }

  function sendError(message: string) {
    if (!tabId) return;
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createRpcErrorResponse(request.method, {
        id: request.id,
        error: { code: RpcErrorCode.INTERNAL_ERROR, message },
      })
    );
  }

  function sendSuccess(result: RpcResult<typeof stxAddAccount>) {
    if (!tabId) return;
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createRpcSuccessResponse(request.method, { id: request.id, result })
    );
  }

  // Terminal action: register the policy (add mode) or just return the verified
  // address without writing any state (verify mode), then respond to the dApp.
  async function finalize() {
    if (!tabId || !origin) {
      logger.error('Cannot complete add account: missing tabId, origin');
      return;
    }
    if (matchStatus !== 'match') {
      logger.error('Cannot complete add account: active account is not part of the policy');
      return;
    }
    if (!address) {
      sendError('Failed to derive policy address');
      return;
    }

    if (mode === 'add') {
      const result = await registerStxPolicy(request.params);
      if (!result) {
        sendError('Failed to register policy');
        return;
      }
      sendSuccess(result);
      return;
    }

    sendSuccess({
      address,
      publicKeys: request.params.publicKeys,
      threshold: request.params.threshold,
      role: 'signer',
      added: false,
    });
  }

  return {
    origin,
    name: request.params.name.substring(0, ACCOUNT_MAX_NAME_LENGTH),
    publicKeys: request.params.publicKeys,
    threshold: request.params.threshold,
    address,
    matchStatus,
    mode,
    canApprove: matchStatus === 'match' && address !== null,
    isFeatureEnabled,
    rejectAsUnsupported,
    focusInitiatingTab,
    finalize,
  };
}
