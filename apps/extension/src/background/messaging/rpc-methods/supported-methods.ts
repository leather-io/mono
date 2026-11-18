import { LEATHER_GITBOOK_DEVS } from '@leather.io/constants';
import { createRpcSuccessResponse, supportedMethods } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';

import { defineRpcRequestHandler } from '../define-rpc-request-handler';
import { createConnectingAppSearchParamsWithLastKnownAccount } from '../rpc-request-utils';

export const supportedMethodsHandler = defineRpcRequestHandler(
  supportedMethods.method,
  async (request, port) => {
    const { frameId, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(port);
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createRpcSuccessResponse(supportedMethods.method, {
        id: request.id,
        result: {
          documentation: LEATHER_GITBOOK_DEVS,
          methods: [
            {
              name: 'open',
              docsUrl: 'https://docs.leather.io/developers/methods/open',
            },
            {
              name: 'getAddresses',
              docsUrl: 'https://docs.leather.io/developers/methods/getaddresses',
            },
            {
              name: 'signMessage',
              docsUrl: 'https://docs.leather.io/developers/bitcoin-methods/signmessage',
            },
            {
              name: 'sendTransfer',
              docsUrl: 'https://docs.leather.io/developers/bitcoin-methods/sendtransfer',
            },
            {
              name: 'signPsbt',
              docsUrl: 'https://docs.leather.io/developers/bitcoin-methods/signpsbt',
            },
            {
              name: 'openSwap',
              docsUrl: 'https://docs.leather.io/developers/methods/openswap',
            },
            {
              name: 'stx_getAddresses',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_getaddresses',
            },
            {
              name: 'stx_transferStx',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_transferstx',
            },
            {
              name: 'stx_transferSip10Ft',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_transfersip10ft',
            },
            {
              name: 'stx_transferSip9Nft',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_transfersip9nft',
            },
            {
              name: 'stx_callContract',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_callcontract',
            },
            {
              name: 'stx_deployContract',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_deploycontract',
            },
            {
              name: 'stx_signTransaction',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_signtransaction',
            },
            {
              name: 'stx_signMessage',
              docsUrl: 'https://docs.leather.io/developers/stacks-methods/stx_signmessage',
            },
            {
              name: 'stx_signStructuredMessage',
              docsUrl:
                'https://docs.leather.io/developers/stacks-methods/stx_signstructuredmessage',
            },
          ],
        },
      })
    );
  }
);
