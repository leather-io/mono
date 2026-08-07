import { RouteUrls } from '@shared/route-urls';

import {
  getSidePanelRequestOverlayCopy,
  isSidePanelRequestOverlayMessage,
  sidePanelRequestOverlayMessageType,
} from './side-panel-request-overlay';

describe(getSidePanelRequestOverlayCopy.name, () => {
  test.each([
    RouteUrls.ChooseAccount,
    RouteUrls.RpcGetAddresses,
    RouteUrls.RpcBtcAddAccount,
    RouteUrls.RpcStxAddAccount,
  ])('returns connection copy for %s', path => {
    expect(getSidePanelRequestOverlayCopy(path)).toEqual({
      title: 'Connect with Leather',
      description: 'Complete the connection in the Leather sidebar.',
    });
  });

  test.each([
    RouteUrls.SignatureRequest,
    RouteUrls.RpcSignBip322Message,
    RouteUrls.RpcStacksSignature,
  ])('returns signature copy for %s', path => {
    expect(getSidePanelRequestOverlayCopy(path)).toEqual({
      title: 'Review signature in Leather',
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
    expect(getSidePanelRequestOverlayCopy(path)).toEqual({
      title: 'Review transaction in Leather',
      description: 'Review and approve or reject the transaction in the Leather sidebar.',
    });
  });

  test('returns generic request copy for other routes', () => {
    expect(getSidePanelRequestOverlayCopy(RouteUrls.Home)).toEqual({
      title: 'Continue in Leather',
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
