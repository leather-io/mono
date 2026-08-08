import { isObject } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export const sidePanelRequestOverlayMessageType = 'side-panel-request-overlay';

export const sidePanelOverlayActionMessageType = 'side-panel-overlay-action';

export type SidePanelRequestOverlayVariant = 'pending' | 'action-required';

interface SidePanelRequestOverlayCopy {
  cta?: string;
  description: string;
  title: string;
}

interface ShowSidePanelRequestOverlayMessage {
  action: 'show';
  path: RouteUrls;
  type: typeof sidePanelRequestOverlayMessageType;
  variant?: SidePanelRequestOverlayVariant;
}

interface HideSidePanelRequestOverlayMessage {
  action: 'hide';
  type: typeof sidePanelRequestOverlayMessageType;
}

export type SidePanelRequestOverlayMessage =
  | ShowSidePanelRequestOverlayMessage
  | HideSidePanelRequestOverlayMessage;

interface OpenPanelOverlayActionMessage {
  action: 'open-panel';
  type: typeof sidePanelOverlayActionMessageType;
}

interface DismissOverlayActionMessage {
  action: 'dismiss';
  type: typeof sidePanelOverlayActionMessageType;
}

export type SidePanelOverlayActionMessage =
  | OpenPanelOverlayActionMessage
  | DismissOverlayActionMessage;

type SidePanelRequestCategory = 'connection' | 'signature' | 'transaction' | 'generic';

function getSidePanelRequestCategory(path: RouteUrls): SidePanelRequestCategory {
  switch (path) {
    case RouteUrls.ChooseAccount:
    case RouteUrls.RpcGetAddresses:
    case RouteUrls.RpcBtcAddAccount:
    case RouteUrls.RpcStxAddAccount:
      return 'connection';
    case RouteUrls.SignatureRequest:
    case RouteUrls.RpcSignBip322Message:
    case RouteUrls.RpcStacksSignature:
      return 'signature';
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
      return 'transaction';
    default:
      return 'generic';
  }
}

// Written in sentence case and uppercased by the display font's styling, the
// same way headings work inside the wallet.
const titles: Record<SidePanelRequestCategory, string> = {
  connection: 'Connect app',
  signature: 'Signature request',
  transaction: 'Transaction request',
  generic: 'Leather request',
};

const pendingDescriptions: Record<SidePanelRequestCategory, string> = {
  connection: 'Complete the connection in the Leather sidebar.',
  signature: 'Review and approve or reject the signature in the Leather sidebar.',
  transaction: 'Review and approve or reject the transaction in the Leather sidebar.',
  generic: 'Complete this request in the Leather sidebar.',
};

const actionRequiredDescriptions: Record<SidePanelRequestCategory, string> = {
  connection: 'Open the Leather sidebar to review this connection request.',
  signature: 'Open the Leather sidebar to review this signature request.',
  transaction: 'Open the Leather sidebar to review this transaction request.',
  generic: 'Open the Leather sidebar to complete this request.',
};

const ctaLabel = 'Open sidebar';

export function getSidePanelRequestOverlayCopy(
  path: RouteUrls,
  variant: SidePanelRequestOverlayVariant = 'pending'
): SidePanelRequestOverlayCopy {
  const category = getSidePanelRequestCategory(path);
  const title = titles[category];
  const description =
    variant === 'action-required'
      ? actionRequiredDescriptions[category]
      : pendingDescriptions[category];
  // Both variants carry the button: when the request is already showing it
  // brings the sidebar back into view, which is otherwise unreachable from
  // the page.
  return { title, description, cta: ctaLabel };
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

export function isSidePanelOverlayActionMessage(
  message: unknown
): message is SidePanelOverlayActionMessage {
  if (
    !isObject(message) ||
    !('type' in message) ||
    message.type !== sidePanelOverlayActionMessageType ||
    !('action' in message)
  )
    return false;
  return message.action === 'open-panel' || message.action === 'dismiss';
}
