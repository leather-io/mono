import { describe, expect, it } from 'vitest';

import { getAddresses } from '../methods/get-addresses';
import { createRequestEncoder } from './helpers';

describe(createRequestEncoder.name, () => {
  const { encode, decode } = createRequestEncoder(getAddresses.request);

  it('should encode a valid request', () => {
    const request = { jsonrpc: '2.0', id: '1', method: 'getAddresses' } as const;
    const encoded = encode(request);
    expect(encoded).toBe(btoa(JSON.stringify(request)));
    expect(encoded).toEqual('eyJqc29ucnBjIjoiMi4wIiwiaWQiOiIxIiwibWV0aG9kIjoiZ2V0QWRkcmVzc2VzIn0=');
  });

  it('should decode a valid encoded request', () => {
    const request = { jsonrpc: '2.0', id: '1', method: 'getAddresses' };
    const encoded = btoa(JSON.stringify(request));
    const decoded = decode(encoded);
    expect(decoded).toEqual(request);
  });
});
