import { describe, expect, test } from 'vitest';

import { isSameScreen } from './use-scroll-to-top-on-screen-change';

const layout = ['root', 'error', 'layout'];

describe(isSameScreen.name, () => {
  test('treats the initial render as the same screen', () => {
    expect(isSameScreen([], [...layout, 'home'])).toBe(true);
  });

  test('keeps position when the leaf route is unchanged', () => {
    expect(isSameScreen([...layout, 'home'], [...layout, 'home'])).toBe(true);
  });

  test('keeps position when opening a sheet nested under the current screen', () => {
    expect(isSameScreen(['root', 'send-form'], ['root', 'send-form', 'recipient-accounts'])).toBe(
      true
    );
  });

  test('keeps position when closing a nested sheet', () => {
    expect(isSameScreen(['root', 'send-form', 'recipient-accounts'], ['root', 'send-form'])).toBe(
      true
    );
  });

  test('detects a new screen between sibling routes', () => {
    expect(isSameScreen([...layout, 'home'], ['root', 'error', 'token-details'])).toBe(false);
  });
});
