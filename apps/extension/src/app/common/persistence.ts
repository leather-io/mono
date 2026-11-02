import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { HttpStatusCode, isAxiosError } from 'axios';
import { BigNumber } from 'bignumber.js';
import superjson from 'superjson';
import { ZodError, z } from 'zod';

import { PERSISTENCE_CACHE_TIME } from '@leather.io/constants';

import { IS_TEST_ENV } from '@shared/environment';
import { logger } from '@shared/logger';
import { analytics } from '@shared/utils/analytics';

const RETRY_LIMIT = 5;
const retryableHttpStatusCodes: number[] = [
  HttpStatusCode.RequestTimeout,
  HttpStatusCode.TooManyRequests,
];

superjson.registerCustom<BigNumber, string>(
  {
    isApplicable: v => v instanceof BigNumber,
    serialize: v => v.toString(),
    deserialize: v => new BigNumber(v),
  },
  'BigNumber'
);

const storage = {
  async getItem(key: string) {
    const storageVal = await chrome.storage.local.get<Record<string, string | undefined>>(key);
    return storageVal[key];
  },
  setItem: (key: string, value: string) => chrome.storage.local.set({ [key]: value }),
  removeItem: (key: string) => chrome.storage.local.remove([key]),
};

const chromeStorageLocalPersister = createAsyncStoragePersister({
  storage,
  serialize: superjson.stringify,
  deserialize: superjson.parse,
});

const zodIssuesSchema = z.object({ issues: z.array(z.unknown()) });

function isZodError(error: Error) {
  // `instanceof` check doesn't work when ZodError thrown from within a package
  return error instanceof ZodError || error.name === 'ZodError';
}

function isRetryableError(error: Error): boolean {
  if (!isAxiosError(error)) return false;
  if (!error.response) return true;
  const status = error.response.status;

  return status >= 500 || retryableHttpStatusCodes.includes(status);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      if (isAxiosError(error)) {
        const errorReport = {
          statusCode: error.response?.status,
          query: query.queryKey[0],
          hash: query.queryHash,
          error: error.toJSON(),
        };
        analytics.untypedTrack('api_error', errorReport);
      }

      if (isZodError(error)) {
        const zodErrorReport = {
          query: query.queryKey[0],
          hash: query.queryHash,
          error: JSON.stringify(zodIssuesSchema.safeParse(error).data?.issues),
        };
        logger.error('schema_fail', zodErrorReport);
        analytics.track('schema_fail', zodErrorReport);
      }
    },
  }),
  defaultOptions: {
    queries: {
      gcTime: PERSISTENCE_CACHE_TIME,
      // https://tanstack.com/query/v4/docs/guides/testing#turn-off-retries
      retry(failureCount, error) {
        if (IS_TEST_ENV) return false;
        return isRetryableError(error) && failureCount <= RETRY_LIMIT;
      },
    },
  },
});

export function persistAndRenderApp(renderApp: () => Promise<void>) {
  if (!IS_TEST_ENV) {
    void persistQueryClient({
      queryClient,
      persister: chromeStorageLocalPersister,
      buster: VERSION,
    });
  }
  void renderApp();
}
