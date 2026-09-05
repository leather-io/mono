import { consumeActionPopupPromptIntent } from './action-popup-classifier';

describe(consumeActionPopupPromptIntent.name, () => {
  test('rejects the action popup URL in a normal tab', () => {
    window.history.replaceState({}, '', '/action-popup.html');
    Object.assign(chrome, { extension: { getViews: vi.fn().mockReturnValue([]) } });

    expect(consumeActionPopupPromptIntent()).toBe(false);
  });

  test('requires identity with the current Chrome popup and consumes it once', () => {
    window.history.replaceState({ fingerprint: 'selected-wallet' }, '', '/action-popup.html');
    Object.assign(chrome, { extension: { getViews: vi.fn().mockReturnValue([window]) } });

    expect(consumeActionPopupPromptIntent()).toBe(true);
    expect(window.history.state).toMatchObject({ fingerprint: 'selected-wallet' });
    window.history.replaceState({}, '', '/action-popup.html');
    expect(consumeActionPopupPromptIntent()).toBe(false);
  });
});
