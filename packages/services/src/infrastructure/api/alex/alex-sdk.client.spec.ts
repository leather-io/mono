import { describe, expect, it, vi } from 'vitest';

import { createMock } from '../../../test/create-mock';
import { type HttpCacheService } from '../../cache/http-cache.service';
import { AlexSdkClient } from './alex-sdk.client';

const { getRoute } = vi.hoisted(() => ({ getRoute: vi.fn() }));

vi.mock('alex-sdk', () => ({
  AlexSDK: class {
    fetchSwappableCurrency() {
      return Promise.resolve([{ id: 'token-wstx' }, { id: 'token-alex' }]);
    }
    getRoute = getRoute;
  },
}));

describe(AlexSdkClient.name, () => {
  const client = new AlexSdkClient(createMock<HttpCacheService>({}));

  it('passes swappable currency ids to the SDK', async () => {
    getRoute.mockResolvedValue(['token-wstx', 'token-alex']);

    await client.getRoute('token-wstx', 'token-alex');

    expect(getRoute).toHaveBeenCalledWith('token-wstx', 'token-alex');
  });

  it('throws for ids the SDK does not list as swappable', async () => {
    await expect(client.getRoute('token-wstx', 'token-unknown')).rejects.toThrow(
      'Unknown ALEX currency: token-unknown'
    );
  });
});
