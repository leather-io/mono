export function focusTabAndWindow(tabId: number | null) {
  if (tabId === null) return;
  chrome.tabs.update(tabId, { active: true }, tab => {
    if (!tab) return;
    void chrome.windows.update(tab.windowId, { focused: true });
  });
}
