import { Route } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { RequestKeyOutdatedStacksAppWarning } from '../../flows/request-stacks-keys/steps/outdated-stacks-app-warning';
import {
  CheckingAppVersion,
  ConnectLedgerError,
  ConnectLedgerSuccess,
  DeviceBusy,
  UnsupportedBrowserLayout,
} from '../../generic-steps';
import { ConnectLedgerRequestKeys } from './steps/connect-ledger-request-keys';

interface LedgerRequestKeysRoutesProps {
  path: string;
  component: React.ReactNode;
  customRoutes?: React.ReactNode;
}
export function ledgerRequestKeysRoutes({
  path,
  component,
  customRoutes,
}: LedgerRequestKeysRoutesProps) {
  return (
    <Route path={path} element={component}>
      {customRoutes}
      <Route path={RouteUrls.ConnectLedger} element={<ConnectLedgerRequestKeys />} />
      <Route path={RouteUrls.LedgerCheckingAppVersion} element={<CheckingAppVersion />} />
      <Route path={RouteUrls.DeviceBusy} element={<DeviceBusy />} />
      <Route path={RouteUrls.ConnectLedgerError} element={<ConnectLedgerError />} />
      <Route path={RouteUrls.ConnectLedgerSuccess} element={<ConnectLedgerSuccess />} />
      <Route path={RouteUrls.LedgerUnsupportedBrowser} element={<UnsupportedBrowserLayout />} />
      <Route
        path={RouteUrls.LedgerOutdatedAppWarning}
        element={<RequestKeyOutdatedStacksAppWarning />}
      />
    </Route>
  );
}
