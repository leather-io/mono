// `chrome.sidePanel.close` landed in Chrome 141 but is not yet in
// @types/chrome. Declared here so callers stay type-safe without casts.
declare namespace chrome.sidePanel {
  interface CloseOptions {
    tabId?: number;
    windowId?: number;
  }

  function close(options: CloseOptions): Promise<void>;
}
