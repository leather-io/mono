import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { ReceiveBtcModal } from '@app/pages/receive/receive-btc';
import { ReceiveSheet } from '@app/pages/receive/receive-dialog';
import { ReceiveOrdinalModal } from '@app/pages/receive/receive-ordinal';
import { ReceiveStxModal } from '@app/pages/receive/receive-stx';

import { rootRoute } from '../root-route';

const receiveSheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.Receive,
  component: ReceiveSheet,
});

const receiveStxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ReceiveStx,
  component: ReceiveStxModal,
});

const receiveBtcRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ReceiveBtc,
  component: ReceiveBtcModal,
});

const receiveBtcStampRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ReceiveBtcStamp,
  component: ReceiveBtcModal,
});

const receiveCollectibleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ReceiveCollectible,
  component: ReceiveSheet,
});

const receiveCollectibleOrdinalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ReceiveCollectibleOrdinal,
  component: ReceiveOrdinalModal,
});

export const receiveRoutes = [
  receiveSheetRoute,
  receiveStxRoute,
  receiveBtcRoute,
  receiveBtcStampRoute,
  receiveCollectibleRoute,
  receiveCollectibleOrdinalRoute,
];
