import { Route } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { ReceiveBtcModal } from '@app/pages/receive/receive-btc';
import { ReceiveSheet } from '@app/pages/receive/receive-dialog';
import { ReceiveStxModal } from '@app/pages/receive/receive-stx';

export const receiveRoutes = (
  <Route>
    <Route path={RouteUrls.Receive} element={<ReceiveSheet />} />
    <Route path={RouteUrls.ReceiveStx} element={<ReceiveStxModal />} />
    <Route path={RouteUrls.ReceiveBtc} element={<ReceiveBtcModal />} />
    <Route path={RouteUrls.ReceiveCollectible} element={<ReceiveSheet type="collectible" />} />
  </Route>
);
