import { RouteUrls } from '@shared/route-urls';

import {
  getSidePanelRequestOverlayCopy,
  isSidePanelOverlayActionMessage,
  isSidePanelRequestOverlayMessage,
  sidePanelOverlayActionMessageType,
  sidePanelRequestOverlayMessageType,
} from './side-panel-request-overlay';

describe(getSidePanelRequestOverlayCopy.name, () => {
  test.each([
    RouteUrls.ChooseAccount,
    RouteUrls.RpcGetAddresses,
    RouteUrls.RpcBtcAddAccount,
    RouteUrls.RpcStxAddAccount,
  ])('returns connection copy for %s', path => {
    expect(getSidePanelRequestOverlayCopy(path)).toMatchObject({
      title: 'Connect app',
      description: 'Complete the connection in the Leather sidebar.',
    });
  });

  test.each([
    RouteUrls.SignatureRequest,
    RouteUrls.RpcSignBip322Message,
    RouteUrls.RpcStacksSignature,
  ])('returns signature copy for %s', path => {
    expect(getSidePanelRequestOverlayCopy(path)).toMatchObject({
      title: 'Signature request',
      description: 'Review and approve or reject the signature in the Leather sidebar.',
    });
  });

  test.each([
    RouteUrls.PsbtRequest,
    RouteUrls.RpcSignPsbt,
    RouteUrls.RpcSendTransfer,
    RouteUrls.RpcStxCallContract,
    RouteUrls.RpcStxDeployContract,
    RouteUrls.RpcStxSignTransaction,
    RouteUrls.RpcStxTransferSip10Ft,
    RouteUrls.RpcStxTransferSip9Nft,
    RouteUrls.RpcStxTransferStx,
    RouteUrls.TransactionRequest,
  ])('returns transaction copy for %s', path => {
    expect(getSidePanelRequestOverlayCopy(path)).toMatchObject({
      title: 'Transaction request',
      description: 'Review and approve or reject the transaction in the Leather sidebar.',
    });
  });

  test('returns generic request copy for other routes', () => {
    expect(getSidePanelRequestOverlayCopy(RouteUrls.Home)).toMatchObject({
      title: 'Leather request',
      description: 'Complete this request in the Leather sidebar.',
    });
  });
});

describe(isSidePanelRequestOverlayMessage.name, () => {
  test('recognizes show and hide messages', () => {
    expect(
      isSidePanelRequestOverlayMessage({
        type: sidePanelRequestOverlayMessageType,
        action: 'show',
        path: RouteUrls.RpcGetAddresses,
      })
    ).toBe(true);
    expect(
      isSidePanelRequestOverlayMessage({
        type: sidePanelRequestOverlayMessageType,
        action: 'hide',
      })
    ).toBe(true);
  });

  test('rejects malformed messages', () => {
    expect(
      isSidePanelRequestOverlayMessage({
        type: sidePanelRequestOverlayMessageType,
        action: 'show',
      })
    ).toBe(false);
    expect(isSidePanelRequestOverlayMessage({ type: 'other', action: 'hide' })).toBe(false);
  });
});

describe('action-required copy', () => {
  test.each([
    [RouteUrls.RpcGetAddresses, 'Open the Leather sidebar to review this connection request.'],
    [RouteUrls.RpcSignPsbt, 'Open the Leather sidebar to review this transaction request.'],
    [RouteUrls.RpcStacksSignature, 'Open the Leather sidebar to review this signature request.'],
  ])('asks the user to open the sidebar for %s', (path, description) => {
    const copy = getSidePanelRequestOverlayCopy(path, 'action-required');
    expect(copy.description).toEqual(description);
    expect(copy.cta).toEqual('Open sidebar');
  });

  test('both variants carry the call to action', () => {
    expect(getSidePanelRequestOverlayCopy(RouteUrls.RpcGetAddresses).cta).toEqual('Open sidebar');
    expect(
      getSidePanelRequestOverlayCopy(RouteUrls.RpcGetAddresses, 'action-required').cta
    ).toEqual('Open sidebar');
  });
});

describe(isSidePanelOverlayActionMessage.name, () => {
  test('recognizes open-panel and dismiss actions', () => {
    expect(
      isSidePanelOverlayActionMessage({
        type: sidePanelOverlayActionMessageType,
        action: 'open-panel',
      })
    ).toBe(true);
    expect(
      isSidePanelOverlayActionMessage({
        type: sidePanelOverlayActionMessageType,
        action: 'dismiss',
      })
    ).toBe(true);
  });

  test('rejects unknown actions and foreign message types', () => {
    expect(
      isSidePanelOverlayActionMessage({ type: sidePanelOverlayActionMessageType, action: 'nope' })
    ).toBe(false);
    expect(isSidePanelOverlayActionMessage({ type: 'other', action: 'dismiss' })).toBe(false);
    expect(
      isSidePanelOverlayActionMessage({
        type: sidePanelRequestOverlayMessageType,
        action: 'dismiss',
      })
    ).toBe(false);
  });
});
