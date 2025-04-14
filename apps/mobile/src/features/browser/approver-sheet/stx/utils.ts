import { calculateDefaultStacksFee } from '@/features/send/utils';
import { App, assertAppIsConnected } from '@/store/apps/utils';
import { stacksSignerFromAddress } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { getStacksNetworkFromName } from '@/store/settings/settings.read';
import { makeAccountIdentiferFromDescriptor } from '@/store/utils';
import { StacksNetwork, StacksNetworks } from '@stacks/network';
import { PostConditionModeName } from '@stacks/transactions';

import { Money } from '@leather.io/models';
import { BaseStacksTransactionRpcParams } from '@leather.io/rpc';
import { StacksSigner } from '@leather.io/stacks';
import { createMoneyFromDecimal, initBigNumber } from '@leather.io/utils';

export function getDefaultFee() {
  const defaultFee = calculateDefaultStacksFee();
  return createMoneyFromDecimal(defaultFee, 'STX');
}

export function getAccountIdFromConnectedApp(app: App) {
  assertAppIsConnected(app);

  return app.accountId;
}

export function getAccountIdFromRequestParams({
  params,
  app,
  stacksSigners,
}: {
  params: BaseStacksTransactionRpcParams;
  app: App;
  stacksSigners: StacksSigner[];
}) {
  if (params.address) {
    const signer = stacksSigners.find(stacksSignerFromAddress(params.address));
    assertStacksSigner(signer);

    return makeAccountIdentiferFromDescriptor(signer.descriptor);
  }

  assertAppIsConnected(app);

  return app.accountId;
}

export function getNetworkFromRequestParams({
  params,
  defaultNetwork,
}: {
  params: BaseStacksTransactionRpcParams;
  defaultNetwork: StacksNetwork;
}) {
  if (params.network) {
    const stacksNetworkName = StacksNetworks.find(n => n === params.network);
    if (stacksNetworkName) {
      return getStacksNetworkFromName(stacksNetworkName);
    }
    throw new Error('Wrong network supplied in the rpc request params');
  }

  return defaultNetwork;
}

export function getFeeFromRequestParams({ params }: { params: BaseStacksTransactionRpcParams }) {
  if (params.fee) {
    return createMoneyFromDecimal(initBigNumber(params.fee), 'STX');
  }
  return getDefaultFee();
}

export interface StxRequestParams {
  fee: Money;
  nonce: number;
  postConditions?: string[];
  postConditionMode?: PostConditionModeName;
  sponsored?: boolean;
}
export function getStxRequestParams(
  params: BaseStacksTransactionRpcParams,
  nonce: number
): StxRequestParams {
  function getNonce() {
    if (params.nonce) return params.nonce;
    return nonce;
  }

  const result: StxRequestParams = {
    fee: getFeeFromRequestParams({ params }),
    nonce: getNonce(),
    sponsored: params.sponsored,
  };
  if (params.postConditions) {
    result.postConditions = params.postConditions;
  }
  if (params.postConditionMode) {
    result.postConditionMode = params.postConditionMode;
  }

  return result;
}
