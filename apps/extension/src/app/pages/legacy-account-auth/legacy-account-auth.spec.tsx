// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { RouteUrls } from '@shared/route-urls';

import { LegacyAccountAuth } from './legacy-account-auth';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  useAppDetails: vi.fn(),
  captureNavigate: vi.fn(),
  errorLog: vi.fn(),
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useLocation: () => ({ pathname: '/choose-account' }),
    useNavigate: () => vi.fn(),
    Navigate(props: { to: string; state?: unknown }) {
      mocks.captureNavigate(props);
      return null;
    },
  };
});

vi.mock('@shared/logger', () => ({
  logger: { error: mocks.errorLog },
}));

vi.mock('@app/common/hooks/auth/use-app-details', () => ({
  useAppDetails: mocks.useAppDetails,
}));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: new URLSearchParams(),
}));

vi.mock('@app/store/accounts/account', () => ({
  useCurrentAccountId: () => ({ accountIndex: 0 }),
}));

vi.mock('@app/common/authentication/use-finish-auth-request', () => ({
  useFinishAuthRequest: () => vi.fn(),
}));

vi.mock('@app/common/authentication/use-cancel-auth-request', () => ({
  useCancelAuthRequest: () => vi.fn(),
}));

vi.mock('@app/common/switch-account/use-switch-account-sheet-context', () => ({
  useSwitchAccountSheet: () => ({ toggleSwitchAccount: vi.fn() }),
}));

vi.mock('@app/common/use-wallet-type', () => ({
  useWalletType: () => ({ whenWallet: () => () => Promise.resolve() }),
}));

vi.mock('@app/routes/hooks/use-on-tab-closed', () => ({
  useOnOriginTabClose: vi.fn(),
}));

vi.mock('../../components/connect-account/connect-account.layout', () => ({
  ConnectAccountLayout: () => null,
}));

vi.mock('@app/features/current-account/current-account-displayer', () => ({
  CurrentAccountDisplayer: () => null,
}));

vi.mock('@app/features/legacy-request-callout/legacy-request-callout', () => ({
  LegacyRequestCallout: () => null,
}));

function renderLegacyAccountAuth() {
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(LegacyAccountAuth));
  });
}

describe(LegacyAccountAuth.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirects to the request error page instead of crashing when app details are missing', () => {
    mocks.useAppDetails.mockReturnValue({ url: undefined });

    expect(() => renderLegacyAccountAuth()).not.toThrow();

    expect(mocks.captureNavigate).toHaveBeenCalledOnce();
    const [props] = mocks.captureNavigate.mock.calls[0];
    expect(props.to).toBe(RouteUrls.RequestError);
    expect(props.state).toMatchObject({ title: expect.any(String), message: expect.any(String) });
    expect(mocks.errorLog).toHaveBeenCalledOnce();
  });

  test('does not redirect when app details are present', () => {
    mocks.useAppDetails.mockReturnValue({ url: new URL('https://app.example.com') });

    expect(() => renderLegacyAccountAuth()).not.toThrow();

    expect(mocks.captureNavigate).not.toHaveBeenCalled();
    expect(mocks.errorLog).not.toHaveBeenCalled();
  });
});
