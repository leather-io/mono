import { createManifest } from './manifest.config';

test('creates a Chromium development manifest', () => {
  const manifest = createManifest({
    includeInpageBuildEntry: true,
    previewRelease: false,
    targetBrowser: 'chromium',
    version: '1.2.3.456',
    walletEnvironment: 'development',
  });

  expect(manifest).toMatchObject({
    name: 'Leather Dev',
    version: '1.2.3.456',
    background: {
      service_worker: 'src/background/background.ts',
      type: 'module',
    },
    action: {
      default_popup: 'action-popup.html',
      default_icon: {
        128: 'assets/icons/leather-icon-128-dev.png',
      },
    },
    content_scripts: [
      {
        js: ['content-script.ts'],
        run_at: 'document_start',
      },
      {
        js: ['inpage.ts'],
        matches: ['https://inpage.invalid/*'],
        run_at: 'document_start',
      },
    ],
    web_accessible_resources: [
      {
        resources: ['inpage.js'],
        use_dynamic_url: false,
      },
    ],
  });
});

test('creates a Firefox preview manifest', () => {
  const manifest = createManifest({
    previewRelease: true,
    targetBrowser: 'firefox',
    version: '1.2.3-beta.1',
    walletEnvironment: 'production',
  });

  expect(manifest).toMatchObject({
    name: 'Leather Preview',
    version: '1.2.3',
    background: {
      scripts: ['src/background/background.ts'],
    },
    browser_specific_settings: {
      gecko: {
        id: '{e22ae397-03d7-4622-bd8f-ecaca8c9b277}',
        strict_min_version: '121.0',
      },
    },
    icons: {
      128: 'assets/icons/leather-icon-128-preview.png',
    },
  });
  expect(manifest.content_security_policy.extension_pages).toContain(
    "style-src 'self' 'unsafe-inline'"
  );
  expect(manifest.content_security_policy.extension_pages).toContain("font-src 'self'");
});
