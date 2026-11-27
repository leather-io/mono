import { Linking, LogBox } from 'react-native';

import { queryClient } from '@/queries/query';
import Constants from 'expo-constants';

import 'fast-text-encoding';

import { HttpResponse, http, passthrough } from 'msw';
import { setupServer } from 'msw/native';

import { publishScenarios, resetBroadcasts } from './e2e-state';
import { baselineHandlers } from './handlers/baseline';
import { scenarios } from './scenarios';

const scenarioParam = 'e2e';
const walletParam = 'wallet';
const newWallet = 'new';
const metroPort = '8081';
const logPrefix = `[e2e ${Constants.deviceName ?? 'device'}]`;

function log(message: string) {
  console.log(`${logPrefix} ${message}`);
}

const fallbackHandlers = [
  http.all('*', ({ request }) => {
    if (new URL(request.url).port === metroPort) return passthrough();
    log(`UNHANDLED ${request.method} ${request.url}`);
    return HttpResponse.json({ error: 'No e2e mock for this request' }, { status: 404 });
  }),
];

LogBox.ignoreAllLogs(true);

const server = setupServer(...baselineHandlers, ...fallbackHandlers);
server.listen({ onUnhandledRequest: 'bypass' });
log('mocks started');

function scenarioLabel(requested: string[], unknown: string[]) {
  if (unknown.length > 0) return `UNKNOWN SCENARIO ${unknown.join(',')}`;
  return requested.join(',') || 'baseline';
}

function applyScenarios(url: string | null) {
  if (!url) return;
  const params = new URL(url).searchParams;
  const names = params.get(scenarioParam);
  if (names === null) return;
  const requested = names.split(',').filter(name => name.length > 0);
  const unknown = requested.filter(name => !Object.hasOwn(scenarios, name));
  if (unknown.length > 0) log(`UNKNOWN SCENARIO ${unknown.join(',')}`);
  resetBroadcasts();
  try {
    const overrides = [...requested].reverse().flatMap(name => scenarios[name] ?? []);
    server.resetHandlers(...overrides, ...baselineHandlers, ...fallbackHandlers);
    log(`scenario ${requested.join(',') || 'baseline'}`);
    queryClient.clear();
    void queryClient.resetQueries();
    void reconnectFeatureFlags();
  } catch (error) {
    log(`SCENARIO FAILED ${names} ${String(error)}`);
    publishScenarios(`SCENARIO FAILED ${names}`, false);
    return;
  }
  publishScenarios(
    scenarioLabel(requested, unknown),
    unknown.length === 0 && params.get(walletParam) === newWallet
  );
}

async function reconnectFeatureFlags() {
  const flags = await import('@/features/feature-flags');
  await flags.setupFeatureFlags();
}

Linking.addEventListener('url', event => applyScenarios(event.url));
