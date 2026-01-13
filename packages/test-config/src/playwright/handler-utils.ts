import type { MockHandler } from './types';

export function createHandler<T>(config: MockHandler<T>): MockHandler<T> {
  return config;
}

type PlaywrightPage = {
  route(
    url: string | RegExp,
    handler: (route: PlaywrightRoute) => Promise<void>
  ): Promise<void>;
};

type PlaywrightRoute = {
  request(): { method(): string };
  continue(): Promise<void>;
  fulfill(options: { status?: number; contentType?: string; body?: string }): Promise<void>;
};

export async function setupHandlers(page: PlaywrightPage, handlers: MockHandler[]) {
  const routeHandlers: Promise<void>[] = [];

  for (const handler of handlers) {
    const routePromise = page.route(handler.path, async (route: PlaywrightRoute) => {
      if (route.request().method().toLowerCase() !== handler.method) {
        await route.continue();
        return;
      }

      if (handler.delay) {
        await new Promise(resolve => setTimeout(resolve, handler.delay));
      }

      await route.fulfill({
        status: handler.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(handler.resp),
      });
    });

    routeHandlers.push(routePromise);
  }

  await Promise.all(routeHandlers);
}
