import { App } from '@/store/apps/utils';

import {
  RpcResponses,
  getAddresses,
  signMessage,
  signPsbt,
  stxSignMessage,
  stxSignStructuredMessage,
  stxSignTransaction,
  stxTransferSip9Nft,
  stxTransferSip10Ft,
  stxTransferStx,
} from '@leather.io/rpc';

import { GetAddressesApprover } from './get-addresses/get-addresses';
import { SignMessageApprover } from './sign-message/sign-message';
import { SignPsbtApprover } from './sign-psbt';
import { NonceLoader } from './stx/nonce-loader';
import { StxSignMessageApprover } from './stx/sign-message/sign-message';
import { StxSignStructuredMessageApprover } from './stx/sign-structured-message/sign-structured-message';
import { SignTransactionApprover } from './stx/sign-transaction/sign-transaction';
import { TransferSip9NftApprover } from './stx/transfer-sip9-nft/transfer-sip9-nft';
import { TransferSip10FtApprover } from './stx/transfer-sip10-ft/transfer-sip10-ft';
import { TransferStxApprover } from './stx/transfer-stx/transfer-stx';
import { getAccountIdFromConnectedApp } from './stx/utils';
import { BrowserMessage } from './utils';

interface BrowserApproverProps {
  request: BrowserMessage;
  sendResult(result: RpcResponses): void;
  origin: string;
  app: App;
  closeApprover(): void;
}

export function BrowserApprover(props: BrowserApproverProps) {
  switch (props.request?.method) {
    case getAddresses.method:
      return (
        <GetAddressesApprover
          app={props.app}
          sendResult={props.sendResult}
          origin={props.origin}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    case signPsbt.method: {
      return (
        <SignPsbtApprover
          app={props.app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    }
    case signMessage.method: {
      return (
        <SignMessageApprover
          app={props.app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    }
    case stxSignTransaction.method: {
      const accountId = getAccountIdFromConnectedApp(props.app);
      return (
        <SignTransactionApprover
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
          accountId={accountId}
        />
      );
    }

    case stxTransferStx.method: {
      const accountId = getAccountIdFromConnectedApp(props.app);
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxTransferStx.request.parse(props.request);
            return (
              <TransferStxApprover
                sendResult={props.sendResult}
                request={parsedRequest}
                closeApprover={props.closeApprover}
                accountId={accountId}
                nonce={nonce}
              />
            );
          }}
        </NonceLoader>
      );
    }
    case stxTransferSip9Nft.method: {
      const accountId = getAccountIdFromConnectedApp(props.app);
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxTransferSip9Nft.request.parse(props.request);
            return (
              <TransferSip9NftApprover
                sendResult={props.sendResult}
                request={parsedRequest}
                closeApprover={props.closeApprover}
                accountId={accountId}
                nonce={nonce}
              />
            );
          }}
        </NonceLoader>
      );
    }
    case stxTransferSip10Ft.method: {
      const accountId = getAccountIdFromConnectedApp(props.app);
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxTransferSip10Ft.request.parse(props.request);
            return (
              <TransferSip10FtApprover
                sendResult={props.sendResult}
                request={parsedRequest}
                closeApprover={props.closeApprover}
                accountId={accountId}
                nonce={nonce}
              />
            );
          }}
        </NonceLoader>
      );
    }
    case stxSignMessage.method: {
      const accountId = getAccountIdFromConnectedApp(props.app);
      return (
        <StxSignMessageApprover
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
          accountId={accountId}
        />
      );
    }
    case stxSignStructuredMessage.method: {
      const accountId = getAccountIdFromConnectedApp(props.app);
      return (
        <StxSignStructuredMessageApprover
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
          accountId={accountId}
        />
      );
    }

    default:
      return null;
  }
}
