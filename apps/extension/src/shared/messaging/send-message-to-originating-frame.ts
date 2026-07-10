export interface OriginatingFrame {
  frameId: number;
  tabId: number;
}

export function sendMessageToOriginatingFrame(
  { frameId, tabId }: OriginatingFrame,
  message: unknown
) {
  return chrome.tabs.sendMessage(tabId, message, { frameId });
}
