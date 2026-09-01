import { createContext, useContext } from 'react';

import type { Money, OwnedUtxo } from '@leather.io/models';

import type { TransferRecipient } from '@shared/models/form.model';

interface RpcTransactionRequestContext {
  frameId: number;
  origin: string;
  requestId: string;
  tabId: number;
}

interface RpcSendTransferContext extends RpcTransactionRequestContext {
  amount: Money;
  broadcast: boolean;
  isLoadingBalance: boolean;
  recipients: TransferRecipient[];
  recipientAddresses: string[];
  utxos: OwnedUtxo[];
}

const rpcSendTransferContext = createContext<RpcSendTransferContext | null>(null);

export function useRpcSendTransferContext() {
  const context = useContext(rpcSendTransferContext);
  if (!context)
    throw new Error('`useRpcSendTransferContext` must be used within a `RpcSendTransferProvider`');
  return context;
}

export const RpcSendTransferProvider = rpcSendTransferContext.Provider;
