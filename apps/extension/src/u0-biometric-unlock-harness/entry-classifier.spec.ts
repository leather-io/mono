import { consumeAutomaticPromptIntent, isRealActionPopup } from './entry-classifier';

beforeEach(() => {
  vi.stubGlobal('history', window.history);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(isRealActionPopup.name, () => {
  test('rejects the action popup URL when Chrome does not identify the window as a popup view', () => {
    window.history.replaceState({}, '', '/action-popup.html');
    const getViews = vi.fn().mockReturnValue([]);
    Object.assign(chrome, { extension: { getViews } });

    expect(isRealActionPopup()).toBe(false);
  });

  test('requires identity with the actual Chrome popup view', () => {
    window.history.replaceState({}, '', '/action-popup.html');
    const getViews = vi.fn().mockReturnValue([window]);
    Object.assign(chrome, { extension: { getViews } });

    expect(isRealActionPopup()).toBe(true);
  });
});

describe(consumeAutomaticPromptIntent.name, () => {
  test('consumes once while preserving unrelated history state', () => {
    window.history.replaceState({ fingerprint: 'selected-wallet' }, '', '/action-popup.html');

    expect(consumeAutomaticPromptIntent()).toBe(true);
    expect(history.state).toMatchObject({ fingerprint: 'selected-wallet' });
    expect(consumeAutomaticPromptIntent()).toBe(false);
  });
});
