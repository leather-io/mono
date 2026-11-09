import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadEnvironment(target: string, previewUrl: string) {
  vi.resetModules();
  vi.stubEnv('MODE', 'production');
  vi.stubEnv('CLOUDFLARE_ENV', undefined);
  vi.stubEnv('LEATHER_TARGET', target);
  vi.stubEnv('LEATHER_GUIDES_PREVIEW_URL', previewUrl);
  return import('./environment');
}

describe('help center destination', () => {
  test('uses the configured GitBook preview for staging builds', async () => {
    const { HELP_CENTER_URL } = await loadEnvironment(
      'staging',
      'https://app.gitbook.com/preview/'
    );
    expect(HELP_CENTER_URL).toBe('https://app.gitbook.com/preview/');
  });

  test('keeps production help local even with a configured preview', async () => {
    const { HELP_CENTER_URL } = await loadEnvironment(
      'production',
      'https://app.gitbook.com/preview/'
    );
    expect(HELP_CENTER_URL).toBe('/support');
  });

  test('keeps other staging builds local without a configured preview', async () => {
    const { HELP_CENTER_URL } = await loadEnvironment('staging', '');
    expect(HELP_CENTER_URL).toBe('/support');
  });
});
