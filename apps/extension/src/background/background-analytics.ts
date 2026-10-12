// Segment/Mixpanel libraries are not compatible with extension background
// scripts. This function adds analytics requests to chrome.storage.local so
// that, when opened, an extension frame (that does support analytics) can read
// and fire the requests.
const queueStore = 'backgroundAnalyticsRequests';

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export async function queueAnalyticsRequest(
  eventName: string,
  properties: Record<string, unknown> = {}
) {
  const currentQueue = await chrome.storage.local.get<Record<string, unknown>>(queueStore);
  const storedQueue = currentQueue[queueStore];
  const queue = isUnknownArray(storedQueue) ? storedQueue : [];
  return chrome.storage.local.set({
    [queueStore]: [
      ...queue,
      { eventName, properties: { ...properties, backgroundQueuedMessage: true } },
    ],
  });
}
