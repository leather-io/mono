import { initSentry } from './analytics';

const mocks = vi.hoisted(() => ({
  sentryInit: vi.fn(),
  setTag: vi.fn(),
}));

vi.mock('@sentry/browser', () => ({
  browserTracingIntegration: vi.fn(() => ({})),
  feedbackIntegration: vi.fn(() => ({})),
  setTag: mocks.setTag,
}));

vi.mock('@sentry/react', () => ({
  init: mocks.sentryInit,
  reactRouterV7BrowserTracingIntegration: vi.fn(() => ({})),
}));

vi.mock('@shared/environment', () => ({
  IS_DEV_ENV: false,
  IS_TEST_ENV: false,
  MIXPANEL_TOKEN: '',
  SENTRY_DSN: 'https://public@example.com/1',
  WALLET_ENVIRONMENT: 'production',
}));

vi.mock('leather-styles/tokens', () => ({ token: vi.fn(() => '#000') }));

describe(initSentry.name, () => {
  test('reports the build version as the Sentry release', () => {
    vi.stubGlobal('VERSION', '6.111.0');

    initSentry();

    expect(mocks.sentryInit).toHaveBeenCalledWith(expect.objectContaining({ release: '6.111.0' }));
  });
});
