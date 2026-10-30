import { describe, expect, test } from 'vitest';

import { catalogReturnUrl, prototypeUrl, testerUrl } from './journey-navigation';

describe(prototypeUrl.name, () => {
  test('returns to the originating catalog settings', () => {
    const catalog = '?view=viewer&screen=connect-walletconnect&direction=handshake&form=phone';
    const launch = prototypeUrl(catalog);
    const started = prototypeUrl(launch, 'bitflow-swap', 'first-run');
    expect(catalogReturnUrl(started)).toBe(catalog);
    expect(new URLSearchParams(started).get('run')).toBe('first-run');
  });

  test('switches scenarios without carrying a stale request or losing presentation', () => {
    const source =
      '?view=journeys&journey=connect&run=old&wallet=inline&controls=hidden&mode=participant';
    const params = new URLSearchParams(prototypeUrl(source, 'vault:bitcoin', 'fresh'));
    expect(params.get('journey')).toBe('vault:bitcoin');
    expect(params.get('run')).toBe('fresh');
    expect(params.get('wallet')).toBe('inline');
    expect(params.get('controls')).toBe('hidden');
    expect(params.get('mode')).toBe('participant');
  });
});

describe(testerUrl.name, () => {
  test('opens a fresh participant session without changing the reviewer run', () => {
    const source = prototypeUrl('?view=screens', 'connect', 'review-run');
    const tester = new URLSearchParams(testerUrl(source, 'connect'));
    expect(tester.get('run')).toBeNull();
    expect(tester.get('mode')).toBe('participant');
    expect(new URLSearchParams(source).get('run')).toBe('review-run');
  });
});

describe(catalogReturnUrl.name, () => {
  test('uses the screen catalog for absent, external or recursive return targets', () => {
    expect(catalogReturnUrl('')).toBe('?view=screens');
    expect(catalogReturnUrl('?catalog=https%3A%2F%2Fexample.com')).toBe('?view=screens');
    expect(catalogReturnUrl('?catalog=%3Fview%3Djourneys')).toBe('?view=screens');
  });
});
