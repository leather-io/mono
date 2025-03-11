import { TypeEqual, expectType } from 'ts-expect';

import { RpcParams, RpcResult, endpoints, getAddresses } from '@leather.io/rpc';

import { createLeatherClient } from './client';

describe('Leather SDK', () => {
  vi.stubGlobal('LeatherProvider', {
    request: () => Promise.resolve(),
  });
  const client = createLeatherClient();

  const methods = Object.keys(client);
  test('that it has a method for each endpoint', () => {
    Object.values(endpoints).forEach(endpoint => methods.includes(endpoint.method));
  });

  test('onProviderNotFound is called if provider is available', () => {
    vi.stubGlobal('window', { document: {} });
    vi.stubGlobal('LeatherProvider', undefined);
    const onProviderNotFound = vi.fn();
    createLeatherClient({ onProviderNotFound });
    expect(onProviderNotFound).toHaveBeenCalled();
  });

  test('Optional params, compiler should be happy no parameters', async () => {
    await client.getAddresses();
  });

  test('Optional params, compiler should be happy with network defined', async () => {
    await client.getAddresses({ network: 'mainnet' });
  });

  test('Sign message should cause a type error', async () => {
    // @ts-expect-error
    await client.signMessage();
  });

  test('Sign message type is as defined', () => {
    type SignMessageParams = Parameters<typeof client.signMessage>[0];
    expectType<TypeEqual<SignMessageParams, RpcParams<typeof endpoints.signMessage>>>(true);
  });

  test('`signPsbt` with no object properties should be a type error', async () => {
    // @ts-expect-error
    await client.signPsbt({});
  });

  test('`signPsbt` type param is as defined', () => {
    type SignPsbtParams = Parameters<typeof client.signPsbt>[0];
    expectType<TypeEqual<SignPsbtParams, RpcParams<typeof endpoints.signPsbt>>>(true);
  });

  test('`supportedMethods` should be a type error if params are passed', async () => {
    // @ts-expect-error
    await client.supportedMethods({ doesntAcceptParams: true });
  });

  test('Client should use friendly method names, so this should be `stxSignMessage`', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const client = { stx_signMessage: () => {} } as unknown as ReturnType<
      typeof createLeatherClient
    >;
    // @ts-expect-error
    await client.stx_signMessage({ message: 'hello', messageType: 'utf8' });
  });

  test('`getAddresses` params type check', () => {
    type GetAddressesParams = Parameters<typeof client.getAddresses>[0];
    expectType<TypeEqual<GetAddressesParams, RpcParams<typeof getAddresses>>>(true);
  });

  test('`getAddresses` result type check', () => {
    type GetAddressesResult = Awaited<ReturnType<typeof client.getAddresses>>;
    expectType<TypeEqual<GetAddressesResult, RpcResult<typeof getAddresses>>>(true);
  });
});
