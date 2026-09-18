let actionPopupPromptConsumed = false;

function isRealActionPopup() {
  if (window.location.pathname !== '/action-popup.html') return false;
  return chrome.extension.getViews({ type: 'popup' }).some(view => view === window);
}

export function consumeActionPopupPromptIntent() {
  if (!isRealActionPopup() || actionPopupPromptConsumed) return false;
  actionPopupPromptConsumed = true;
  return true;
}
