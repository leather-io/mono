import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { UnsupportedBrowserLayout } from '@app/features/ledger/generic-steps';
import { ConnectLedgerStart } from '@app/features/ledger/generic-steps/connect-device/connect-ledger-start';
import { BackUpSecretKeyPage } from '@app/pages/onboarding/back-up-secret-key/back-up-secret-key';
import { SetPasswordPage } from '@app/pages/onboarding/set-password/set-password';
import { ForgotPassword } from '@app/pages/onboarding/sign-in/forgot-password';
import { SignIn } from '@app/pages/onboarding/sign-in/sign-in';
import { WelcomePage } from '@app/pages/onboarding/welcome/welcome';
import { OnboardingGate } from '@app/routes/onboarding-gate';

import { rootRoute } from '../root-route';
import {
  createLedgerRequestBitcoinKeysRoutes,
  createLedgerRequestStacksKeysRoutes,
} from './ledger.routes';

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.Onboarding,
  component: function OnboardingGated() {
    return (
      <OnboardingGate>
        <WelcomePage />
      </OnboardingGate>
    );
  },
});

const connectLedgerStartRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: RouteUrls.ConnectLedgerStart,
  component: ConnectLedgerStart,
});

const ledgerUnsupportedBrowserRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: RouteUrls.LedgerUnsupportedBrowser,
  component: UnsupportedBrowserLayout,
});

const backUpSecretKeyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.BackUpSecretKey,
  component: function BackUpSecretKeyGated() {
    return (
      <OnboardingGate>
        <BackUpSecretKeyPage />
      </OnboardingGate>
    );
  },
});

const setPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.SetPassword,
  component: function SetPasswordGated() {
    return (
      <OnboardingGate>
        <SetPasswordPage />
      </OnboardingGate>
    );
  },
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.SignIn,
  component: function SignInGated() {
    return (
      <OnboardingGate>
        <SignIn />
      </OnboardingGate>
    );
  },
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ForgotPassword,
  component: ForgotPassword,
});

export const onboardingRoutes = [
  onboardingRoute.addChildren([
    connectLedgerStartRoute,
    ledgerUnsupportedBrowserRoute,
    createLedgerRequestBitcoinKeysRoutes(onboardingRoute),
    createLedgerRequestStacksKeysRoutes(onboardingRoute),
  ]),
  backUpSecretKeyRoute,
  setPasswordRoute,
  signInRoute,
  forgotPasswordRoute,
];
