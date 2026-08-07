import { isObject } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export const sidePanelRequestOverlayMessageType = 'side-panel-request-overlay';

interface SidePanelRequestOverlayCopy {
  description: string;
  title: string;
}

interface ShowSidePanelRequestOverlayMessage {
  action: 'show';
  path: RouteUrls;
  type: typeof sidePanelRequestOverlayMessageType;
}

interface HideSidePanelRequestOverlayMessage {
  action: 'hide';
  type: typeof sidePanelRequestOverlayMessageType;
}

export type SidePanelRequestOverlayMessage =
  | ShowSidePanelRequestOverlayMessage
  | HideSidePanelRequestOverlayMessage;

export function getSidePanelRequestOverlayCopy(path: RouteUrls): SidePanelRequestOverlayCopy {
  switch (path) {
    case RouteUrls.ChooseAccount:
    case RouteUrls.RpcGetAddresses:
    case RouteUrls.RpcBtcAddAccount:
    case RouteUrls.RpcStxAddAccount:
      return {
        title: 'Connect with Leather',
        description: 'Complete the connection in the Leather sidebar.',
      };
    case RouteUrls.SignatureRequest:
    case RouteUrls.RpcSignBip322Message:
    case RouteUrls.RpcStacksSignature:
      return {
        title: 'Review signature in Leather',
        description: 'Review and approve or reject the signature in the Leather sidebar.',
      };
    case RouteUrls.PsbtRequest:
    case RouteUrls.RpcSignPsbt:
    case RouteUrls.RpcSendTransfer:
    case RouteUrls.RpcStxCallContract:
    case RouteUrls.RpcStxDeployContract:
    case RouteUrls.RpcStxSignTransaction:
    case RouteUrls.RpcStxTransferSip10Ft:
    case RouteUrls.RpcStxTransferSip9Nft:
    case RouteUrls.RpcStxTransferStx:
    case RouteUrls.TransactionRequest:
      return {
        title: 'Review transaction in Leather',
        description: 'Review and approve or reject the transaction in the Leather sidebar.',
      };
    default:
      return {
        title: 'Continue in Leather',
        description: 'Complete this request in the Leather sidebar.',
      };
  }
}

export function isSidePanelRequestOverlayMessage(
  message: unknown
): message is SidePanelRequestOverlayMessage {
  if (
    !isObject(message) ||
    !('type' in message) ||
    message.type !== sidePanelRequestOverlayMessageType ||
    !('action' in message)
  )
    return false;
  if (message.action === 'hide') return true;
  return message.action === 'show' && 'path' in message && typeof message.path === 'string';
}
