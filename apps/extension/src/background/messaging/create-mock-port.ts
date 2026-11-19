import { vi } from 'vitest';

interface MockPortTab {
  id?: number;
  url?: string;
}

interface MockPortSender {
  frameId?: number;
  origin?: string;
  url?: string;
  tab?: MockPortTab;
}

function createMockEvent<T extends (...args: never[]) => void>(): chrome.events.Event<T> {
  return {
    addListener: vi.fn(),
    addRules: vi.fn(),
    getRules: vi.fn(),
    hasListener: vi.fn(),
    hasListeners: vi.fn(),
    removeListener: vi.fn(),
    removeRules: vi.fn(),
  };
}

function createMockTab(tab: MockPortTab): chrome.tabs.Tab {
  return {
    active: true,
    autoDiscardable: true,
    discarded: false,
    groupId: -1,
    highlighted: false,
    incognito: false,
    index: 0,
    pinned: false,
    selected: false,
    windowId: 0,
    ...tab,
  };
}

export function createMockPort(sender: MockPortSender): chrome.runtime.Port {
  const { tab, ...senderProps } = sender;
  return {
    name: 'mock-port',
    disconnect: vi.fn(),
    postMessage: vi.fn(),
    onDisconnect: createMockEvent(),
    onMessage: createMockEvent(),
    sender: tab ? { ...senderProps, tab: createMockTab(tab) } : senderProps,
  };
}
