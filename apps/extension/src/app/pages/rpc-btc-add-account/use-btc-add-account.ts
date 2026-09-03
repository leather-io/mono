import { useMemo } from 'react';

import { compileWshDescriptor, findAccountDescriptorKey } from '@leather.io/bitcoin';
import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';
import {
  RpcErrorCode,
  type RpcResult,
  btcAddAccount,
  createRequestEncoder,
  createRpcErrorResponse,
  createRpcSuccessResponse,
} from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';

import { focusTabAndWindow } from '@app/common/focus-tab';
import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { descriptorHasNonAccountRawKey } from '@app/features/ledger/utils/ledger-descriptor-address';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useActiveWalletType } from '@app/store/common/wallet-type.selectors';
import { useNetworks } from '@app/store/networks/networks.selectors';

import { usePolicyFeatureGate } from '../policy-feature-gate';
import {
  type BtcAddAccountKind,
  type PolicyApprovalMode,
  type PolicyMatchStatus,
  getPolicyApprovalMode,
} from '../policy-match';
import { deriveBtcPolicyAddress } from './btc-policy-registration';
import { useRegisterBtcPolicy } from './register-btc-policy';
import { matchTimelockedDescriptor } from './timelocked-descriptor';

const { decode } = createRequestEncoder(btcAddAccount.request);

interface DescriptorAccountMatch {
  matchStatus: PolicyMatchStatus;
  hasNonAccountRawKey: boolean;
}

function useBtcAddAccountParams() {
  const { frameId, tabId, origin, topOrigin } = useRpcRequestParams();
  const request = initialSearchParams.get('rpcRequest');
  if (!request) throw new Error('Missing rpcRequest');
  return { frameId, tabId, origin, topOrigin, request: decode(request) };
}

export function useBtcAddAccount() {
  const { frameId, tabId, origin, topOrigin, request } = useBtcAddAccountParams();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const registerBtcPolicy = useRegisterBtcPolicy();
  const networks = useNetworks();
  const walletType = useActiveWalletType();
  const { isFeatureEnabled, rejectAsUnsupported } = usePolicyFeatureGate({
    method: request.method,
    frameId,
    id: request.id,
    tabId,
  });

  const timelock = useMemo(
    () => matchTimelockedDescriptor(request.params.descriptor),
    [request.params.descriptor]
  );
  const kind: BtcAddAccountKind = timelock ? 'timelocked' : 'policy';

  // Whitelisted origins may register the policy; any other origin may only let
  // the user verify the derived address (nothing is written to the extension).
  const mode: PolicyApprovalMode = timelock ? 'verify' : getPolicyApprovalMode(origin, topOrigin);

  // The active account must be one of the descriptor's cosigners before the user
  // can confirm. We only consider the native segwit account's xpub or its 0/0
  // public key: `findAccountDescriptorKey` matches the account xpub, or the raw
  // 0/0 public key, against the compiled descriptor — the same check signPsbt uses.
  const { matchStatus, hasNonAccountRawKey } = useMemo<DescriptorAccountMatch>(() => {
    if (!nativeSegwitAccount)
      return { matchStatus: 'no-active-account', hasNonAccountRawKey: false };
    try {
      const compiled = compileWshDescriptor(request.params.descriptor);
      const accountKey = findAccountDescriptorKey(compiled, nativeSegwitAccount.keychain);
      if (!accountKey) return { matchStatus: 'mismatch', hasNonAccountRawKey: false };
      return {
        matchStatus: 'match',
        hasNonAccountRawKey: descriptorHasNonAccountRawKey(compiled, accountKey.key),
      };
    } catch {
      return { matchStatus: 'mismatch', hasNonAccountRawKey: false };
    }
  }, [nativeSegwitAccount, request.params.descriptor]);

  const isLedgerVerifyUnsupported =
    kind === 'timelocked' && walletType === 'ledger' && hasNonAccountRawKey;

  // Derived locally and identically to registration, so what the user verifies
  // (in the approver and on a Ledger) equals what is stored / returned. Null on
  // a descriptor/network mismatch (never throw in render); confirm is disabled.
  const address = useMemo(() => {
    try {
      return deriveBtcPolicyAddress({ params: request.params, networks }).address;
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

  function sendSuccess(result: RpcResult<typeof btcAddAccount>) {
    if (!tabId) return;
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createRpcSuccessResponse(request.method, { id: request.id, result })
    );
  }

  // Terminal action: register the policy (add mode) or just return the verified
  // address without writing any state (verify mode), then respond to the dApp.
  // Called inline for software wallets and after on-device confirmation for Ledger.
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
      const result = await registerBtcPolicy(request.params);
      if (!result) {
        sendError('Failed to register policy');
        return;
      }
      sendSuccess(result);
      return;
    }

    sendSuccess({
      address,
      descriptor: request.params.descriptor,
      role: 'signer',
      added: false,
    });
  }

  return {
    origin,
    name: request.params.name.substring(0, ACCOUNT_MAX_NAME_LENGTH),
    descriptor: request.params.descriptor,
    address,
    kind,
    timelock,
    matchStatus,
    mode,
    walletType,
    isLedgerVerifyUnsupported,
    canApprove: matchStatus === 'match' && address !== null && !isLedgerVerifyUnsupported,
    isFeatureEnabled,
    rejectAsUnsupported,
    focusInitiatingTab,
    finalize,
  };
}
