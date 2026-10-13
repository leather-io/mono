import { useAppByOrigin } from '@/store/apps/apps.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

import {
  RpcResponses,
  getAddresses,
  sendTransfer,
  signMessage,
  signPsbt,
  stxCallContract,
  stxDeployContract,
  stxGetAddresses,
  stxSignMessage,
  stxSignStructuredMessage,
  stxSignTransaction,
  stxTransferSip9Nft,
  stxTransferSip10Ft,
  stxTransferStx,
} from '@leather.io/rpc';
import { Box } from '@leather.io/ui/native';

import { GetAddressesApprover } from './get-addresses/get-addresses';
import { SendTransferApprover } from './send-transfer';
import { SignMessageApprover } from './sign-message/sign-message';
import { SignPsbtApprover } from './sign-psbt';
import { CallContractApprover } from './stx/call-contract/call-contract';
import { DeployContractApprover } from './stx/deploy-contract/deploy-contract';
import { StxGetAddressesApprover } from './stx/get-addresses/get-addresses';
import { NonceLoader } from './stx/nonce-loader';
import { StxSignMessageApprover } from './stx/sign-message/sign-message';
import { StxSignStructuredMessageApprover } from './stx/sign-structured-message/sign-structured-message';
import { SignTransactionApprover } from './stx/sign-transaction/sign-transaction';
import { TransferSip9NftApprover } from './stx/transfer-sip9-nft/transfer-sip9-nft';
import { TransferSip10FtApprover } from './stx/transfer-sip10-ft/transfer-sip10-ft';
import { TransferStxApprover } from './stx/transfer-stx/transfer-stx';
import { getAccountIdFromConnectedApp, getAccountIdFromRequestParams } from './stx/utils';
import { BrowserMessage } from './utils';

interface BrowserApproverProps {
  request: BrowserMessage;
  sendResult(result: RpcResponses): void;
  origin: string;
  closeApprover(): void;
}

export function BrowserApprover(props: BrowserApproverProps) {
  const { list: stacksSigners } = useStacksSigners();
  const app = useAppByOrigin(props.origin);

  if (!app) return null;

  switch (props.request?.method) {
    case getAddresses.method:
      return (
        <GetAddressesApprover
          app={app}
          sendResult={props.sendResult}
          origin={props.origin}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    case signPsbt.method: {
      return (
        <SignPsbtApprover
          app={app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    }
    case sendTransfer.method: {
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <SendTransferApprover
          app={app}
          sendResult={props.sendResult}
          request={props.request}
          accountId={accountId}
          closeApprover={props.closeApprover}
        />
      );
    }
    case signMessage.method: {
      return (
        <SignMessageApprover
          app={app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    }
    case stxGetAddresses.method: {
      return (
        <StxGetAddressesApprover
          app={app}
          sendResult={props.sendResult}
          origin={props.origin}
          request={props.request}
          closeApprover={props.closeApprover}
        />
      );
    }
    case stxSignTransaction.method: {
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <SignTransactionApprover
          app={app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
          accountId={accountId}
        />
      );
    }

    case stxTransferStx.method: {
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxTransferStx.request.parse(props.request);
            return (
              <TransferStxApprover
                app={app}
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
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxTransferSip9Nft.request.parse(props.request);
            return (
              <TransferSip9NftApprover
                app={app}
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
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxTransferSip10Ft.request.parse(props.request);
            return (
              <TransferSip10FtApprover
                app={app}
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
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <StxSignMessageApprover
          app={app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
          accountId={accountId}
        />
      );
    }
    case stxSignStructuredMessage.method: {
      const accountId = getAccountIdFromConnectedApp(app);
      return (
        <StxSignStructuredMessageApprover
          app={app}
          sendResult={props.sendResult}
          request={props.request}
          closeApprover={props.closeApprover}
          accountId={accountId}
        />
      );
    }
    case stxCallContract.method: {
      const accountId = getAccountIdFromRequestParams({
        params: props.request.params,
        app: app,
        stacksSigners,
      });
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxCallContract.request.parse(props.request);
            return (
              <CallContractApprover
                app={app}
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
    case stxDeployContract.method: {
      const accountId = getAccountIdFromRequestParams({
        params: props.request.params,
        app: app,
        stacksSigners,
      });
      return (
        <NonceLoader accountId={accountId}>
          {nonce => {
            const parsedRequest = stxDeployContract.request.parse(props.request);
            return (
              <DeployContractApprover
                app={app}
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

    default:
      return <Box flex={1} backgroundColor="ink.background-primary" />;
  }
}
