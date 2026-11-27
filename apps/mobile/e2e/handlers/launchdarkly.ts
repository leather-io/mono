import { HttpResponse, http } from 'msw';

type FlagValue = boolean | string;

const defaultFlags: Record<string, FlagValue> = {
  swap: true,
  swap_sbtc_bridging: true,
  release_sip10_send_feature: true,
  release_onramper_buy: true,
  release_onramper_sell: true,
  release_btc_conversion_unit_feature: true,
  release_waitlist_features: false,
  collectible_details: true,
  send_paste_button: true,
  internationalization: false,
  minimum_app_version: '',
};

export function launchDarklyHandlers(overrides: Record<string, FlagValue> = {}) {
  const flags = Object.fromEntries(
    Object.entries({ ...defaultFlags, ...overrides }).map(([key, value]) => [
      key,
      { flagVersion: 1, trackEvents: false, value, variation: 0, version: 1 },
    ])
  );
  return [
    http.all('https://events.launchdarkly.com/*', () => new HttpResponse(null, { status: 202 })),
    http.all('https://clientsdk.launchdarkly.com/*', () => HttpResponse.json(flags)),
    http.all(
      'https://clientstream.launchdarkly.com/*',
      () =>
        new HttpResponse(['event: put', `data: ${JSON.stringify(flags)}`, '', ''].join('\n'), {
          headers: { 'Content-Type': 'text/event-stream' },
        })
    ),
  ];
}
