import { JSDOM } from 'jsdom';
import { beforeEach } from 'vitest';

const storageChangeListeners = new Set();

function createStorageArea(areaName) {
  const backing = new Map();

  function readEntry(key) {
    return structuredClone(backing.get(key));
  }

  function collectEntries(keys) {
    if (keys === undefined || keys === null) {
      const result = {};
      for (const key of backing.keys()) result[key] = readEntry(key);
      return result;
    }
    if (typeof keys === 'string') {
      const result = {};
      if (backing.has(keys)) result[keys] = readEntry(keys);
      return result;
    }
    if (Array.isArray(keys)) {
      const result = {};
      for (const key of keys) if (backing.has(key)) result[key] = readEntry(key);
      return result;
    }
    const result = {};
    for (const [key, fallback] of Object.entries(keys)) {
      result[key] = backing.has(key) ? readEntry(key) : structuredClone(fallback);
    }
    return result;
  }

  function emitChanges(changes) {
    if (Object.keys(changes).length === 0) return;
    queueMicrotask(() => {
      for (const listener of storageChangeListeners) listener(changes, areaName);
    });
  }

  function hasChanged(previous, next) {
    return JSON.stringify(previous) !== JSON.stringify(next);
  }

  return {
    get(keys, callback) {
      const result = collectEntries(keys);
      if (callback) {
        callback(result);
        return undefined;
      }
      return Promise.resolve(result);
    },
    set(items, callback) {
      const changes = {};
      for (const [key, value] of Object.entries(items)) {
        const oldValue = readEntry(key);
        if (!hasChanged(oldValue, value)) continue;
        backing.set(key, structuredClone(value));
        changes[key] = { oldValue, newValue: structuredClone(value) };
      }
      emitChanges(changes);
      if (callback) {
        callback();
        return undefined;
      }
      return Promise.resolve();
    },
    remove(keys, callback) {
      const changes = {};
      for (const key of Array.isArray(keys) ? keys : [keys]) {
        if (!backing.has(key)) continue;
        changes[key] = { oldValue: readEntry(key) };
        backing.delete(key);
      }
      emitChanges(changes);
      if (callback) {
        callback();
        return undefined;
      }
      return Promise.resolve();
    },
    clear(callback) {
      const changes = {};
      for (const key of backing.keys()) changes[key] = { oldValue: readEntry(key) };
      backing.clear();
      emitChanges(changes);
      if (callback) {
        callback();
        return undefined;
      }
      return Promise.resolve();
    },
    reset() {
      backing.clear();
    },
  };
}

const localArea = createStorageArea('local');
const sessionArea = createStorageArea('session');

const mockRuntime = {
  lastError: undefined,
  getURL(path) {
    return `chrome-extension://test/${path}`;
  },
  sendMessage() {},
};

globalThis.chrome = {
  storage: {
    local: localArea,
    session: sessionArea,
    onChanged: {
      addListener(listener) {
        storageChangeListeners.add(listener);
      },
      removeListener(listener) {
        storageChangeListeners.delete(listener);
      },
      hasListener(listener) {
        return storageChangeListeners.has(listener);
      },
    },
  },
  runtime: mockRuntime,
};

beforeEach(() => {
  localArea.reset();
  sessionArea.reset();
  storageChangeListeners.clear();
  mockRuntime.lastError = undefined;
});

globalThis.VERSION = '';

const dom = new JSDOM('', { url: 'http://localhost/' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;

globalThis.localStorage = dom.window.localStorage;

globalThis.XMLHttpRequest = class XMLHttpRequest {
  open() {}
  send() {}
  setRequestHeader() {}
};
