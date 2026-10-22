import { type BrowserContext, type Page, chromium } from '@playwright/test';

export interface LaunchedExtension {
  context: BrowserContext;
  extensionId: string;
}

const animationFreezingStyles = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`;

async function resolveExtensionId(context: BrowserContext) {
  const [existingWorker] = context.serviceWorkers();
  const background = existingWorker ?? (await context.waitForEvent('serviceworker'));
  return background.url().split('/')[2];
}

export async function launchExtensionContext(distDir: string): Promise<LaunchedExtension> {
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    channel: 'chromium',
    permissions: ['clipboard-read'],
    args: [`--disable-extensions-except=${distDir}`, `--load-extension=${distDir}`, '--use-gl=egl'],
  });
  const extensionId = await resolveExtensionId(context);
  return { context, extensionId };
}

export async function getInitialPage(context: BrowserContext) {
  const [initialPage] = context.pages();
  return initialPage ?? (await context.newPage());
}

export async function disableAnimations(page: Page) {
  await page.addStyleTag({ content: animationFreezingStyles });
}
