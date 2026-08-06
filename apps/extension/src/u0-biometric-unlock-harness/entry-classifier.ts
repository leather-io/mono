import { isRecord } from './harness-state';

const consumedHistoryKey = 'biometricUnlockU0Consumed';

interface PopupContextEvidence {
  actionPopupPath: boolean;
  matchingRuntimeContextCount: number;
  realPopupView: boolean;
  runtimePopupContextCount: number;
}

export function isRealActionPopup() {
  if (window.location.pathname !== '/action-popup.html') return false;
  return chrome.extension.getViews({ type: 'popup' }).some(view => view === window);
}

export async function getPopupContextEvidence(): Promise<PopupContextEvidence> {
  const popupContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.POPUP],
  });
  return {
    actionPopupPath: window.location.pathname === '/action-popup.html',
    matchingRuntimeContextCount: popupContexts.filter(
      context => context.documentUrl === window.location.href
    ).length,
    realPopupView: isRealActionPopup(),
    runtimePopupContextCount: popupContexts.length,
  };
}

export function consumeAutomaticPromptIntent() {
  const currentState: unknown = history.state;
  const preservedState = isRecord(currentState) ? currentState : {};
  if (preservedState[consumedHistoryKey] === true) return false;
  history.replaceState({ ...preservedState, [consumedHistoryKey]: true }, '');
  return true;
}
