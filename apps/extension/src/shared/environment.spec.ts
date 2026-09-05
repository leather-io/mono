describe('TARGET_BROWSER', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  test('defaults to chromium', async () => {
    vi.stubEnv('TARGET_BROWSER', undefined);
    const { TARGET_BROWSER } = await import('./environment');

    expect(TARGET_BROWSER).toBe('chromium');
  });

  test('exposes the configured browser', async () => {
    vi.stubEnv('TARGET_BROWSER', 'firefox');
    const { TARGET_BROWSER } = await import('./environment');

    expect(TARGET_BROWSER).toBe('firefox');
  });
});
