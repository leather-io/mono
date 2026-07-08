import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadCsp() {
  vi.resetModules();
  return import('./csp');
}

function getDirectiveSources(policy: string, directive: string) {
  const matchingDirective = policy
    .split(';')
    .find(policyDirective => policyDirective.trim().startsWith(`${directive} `));
  if (!matchingDirective) return [];
  return matchingDirective.trim().split(/\s+/).slice(1);
}

describe('csp', () => {
  test('allows custom Bitcoin and Stacks API origins in connect-src', async () => {
    vi.stubEnv('LEATHER_BITCOIN_API_URL', 'https://bitcoin.example/api');
    vi.stubEnv('LEATHER_STACKS_API_URL', 'https://stacks.example/extended/v1');
    const { csp } = await loadCsp();
    const connectSrc = getDirectiveSources(csp, 'connect-src');
    expect(connectSrc).toContain('https://bitcoin.example');
    expect(connectSrc).toContain('https://stacks.example');
    expect(connectSrc).not.toContain('https://bitcoin.example/api');
    expect(connectSrc).not.toContain('https://stacks.example/extended/v1');
  });
});
