import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { LeatherIntroSheetContainer } from '@app/features/dialogs/leather-intro-dialog/leather-intro-dialog';
import {
  LeatherIntroSheetPart1,
  LeatherIntroSheetPart2,
} from '@app/features/dialogs/leather-intro-dialog/leather-intro-steps';
import { ManageTokensPage } from '@app/pages/manage-tokens/manage-tokens';
import { AddNetwork } from '@app/pages/network/add-network';
import { EditNetwork } from '@app/pages/network/edit-network';
import { SelectNetwork } from '@app/pages/network/select-network';
import { SettingsPage } from '@app/pages/settings/settings';
import { SelectTheme } from '@app/pages/theme/select-theme';
import { Unlock } from '@app/pages/unlock';
import { ViewSecretKey } from '@app/pages/view-secret-key/view-secret-key';
import { AccountGate } from '@app/routes/account-gate';

import { rootRoute } from '../root-route';

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.Settings,
  component: function SettingsGated() {
    return (
      <AccountGate>
        <SettingsPage />
      </AccountGate>
    );
  },
});

const manageTokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ManageTokens,
  component: function ManageTokensGated() {
    return (
      <AccountGate>
        <ManageTokensPage />
      </AccountGate>
    );
  },
});

const selectNetworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.SelectNetwork,
  component: function SelectNetworkGated() {
    return (
      <AccountGate>
        <SelectNetwork />
      </AccountGate>
    );
  },
});

const addNetworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.AddNetwork,
  component: function AddNetworkGated() {
    return (
      <AccountGate>
        <AddNetwork />
      </AccountGate>
    );
  },
});

const editNetworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.EditNetwork,
  component: function EditNetworkGated() {
    return (
      <AccountGate>
        <EditNetwork />
      </AccountGate>
    );
  },
});

const selectThemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.SelectTheme,
  component: function SelectThemeGated() {
    return (
      <AccountGate>
        <SelectTheme />
      </AccountGate>
    );
  },
});

const viewSecretKeyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ViewSecretKey,
  component: function ViewSecretKeyGated() {
    return (
      <AccountGate>
        <ViewSecretKey />
      </AccountGate>
    );
  },
});

const unlockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.Unlock,
  component: Unlock,
});

const leatherIntroLayoutRoute = createRoute({
  getParentRoute: () => unlockRoute,
  id: 'leather-intro',
  component: LeatherIntroSheetContainer,
});

const leatherIntroPart1Route = createRoute({
  getParentRoute: () => leatherIntroLayoutRoute,
  path: 'we-have-a-new-name',
  component: LeatherIntroSheetPart1,
});

const leatherIntroPart2Route = createRoute({
  getParentRoute: () => leatherIntroLayoutRoute,
  path: 'introducing-leather',
  component: LeatherIntroSheetPart2,
});

export const settingsRoutes = [
  settingsRoute,
  manageTokensRoute,
  selectNetworkRoute,
  addNetworkRoute,
  editNetworkRoute,
  selectThemeRoute,
  viewSecretKeyRoute,
  unlockRoute.addChildren([
    leatherIntroLayoutRoute.addChildren([leatherIntroPart1Route, leatherIntroPart2Route]),
  ]),
];
