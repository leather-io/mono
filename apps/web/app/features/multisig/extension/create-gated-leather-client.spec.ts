import { describe, expect, test, vi } from 'vitest';

import { OutdatedExtensionError, createGatedLeatherClient } from './create-gated-leather-client';

function setup(version: string | undefined) {
  const provider = version === undefined ? {} : { getProductInfo: () => ({ version }) };
  const getAddresses = vi.fn(() => Promise.resolve({ addresses: [] }));
  const onOutdated = vi.fn();
  const client = createGatedLeatherClient(
    { getAddresses, version: 'sdk' },
    { getProvider: () => provider, onOutdated }
  );
  return { client, getAddresses, onOutdated };
}

describe('createGatedLeatherClient', () => {
  test('forwards calls when the extension is new enough', async () => {
    const { client, getAddresses, onOutdated } = setup('6.112.0');
    await expect(client.getAddresses()).resolves.toEqual({ addresses: [] });
    expect(getAddresses).toHaveBeenCalledTimes(1);
    expect(onOutdated).not.toHaveBeenCalled();
  });

  test('refuses calls and reports the version when the extension is too old', async () => {
    const { client, getAddresses, onOutdated } = setup('6.111.0');
    await expect(client.getAddresses()).rejects.toThrow(OutdatedExtensionError);
    await expect(client.getAddresses()).rejects.toThrow('6.111.0 is out of date');
    expect(getAddresses).not.toHaveBeenCalled();
    expect(onOutdated).toHaveBeenCalledWith('6.111.0');
  });

  test('forwards calls when the provider exposes no version', async () => {
    const { client, getAddresses, onOutdated } = setup(undefined);
    await client.getAddresses();
    expect(getAddresses).toHaveBeenCalledTimes(1);
    expect(onOutdated).not.toHaveBeenCalled();
  });

  test('re-reads the version on every call', async () => {
    let version = '6.111.0';
    const getAddresses = vi.fn(() => Promise.resolve({ addresses: [] }));
    const client = createGatedLeatherClient(
      { getAddresses },
      { getProvider: () => ({ getProductInfo: () => ({ version }) }), onOutdated: vi.fn() }
    );
    await expect(client.getAddresses()).rejects.toThrow(OutdatedExtensionError);
    version = '6.112.0';
    await client.getAddresses();
    expect(getAddresses).toHaveBeenCalledTimes(1);
  });

  test('leaves non-function properties untouched', () => {
    const { client } = setup('6.111.0');
    expect(client.version).toBe('sdk');
  });
});
