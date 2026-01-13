import type { Page, Route } from '@playwright/test';

export interface MockHandler<T = unknown> {
  path: string | RegExp;
  method: 'get' | 'post' | 'put' | 'delete';
  resp: T;
  status?: number;
  delay?: number;
}

export function createHandler<T>(config: MockHandler<T>): MockHandler<T> {
  return config;
}

export async function setupHandlers(page: Page, handlers: MockHandler[]) {
  const routeHandlers: Promise<void>[] = [];

  for (const handler of handlers) {
    const routePromise = page.route(handler.path, async (route: Route) => {
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

export function json<T>(data: T): { contentType: string; body: string } {
  return {
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

export async function delayedJson<T>(data: T, delayMs = 400): Promise<{ contentType: string; body: string }> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return json(data);
}
