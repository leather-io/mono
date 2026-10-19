interface StorageRuntime {
  lastError?: chrome.runtime.LastError;
}

function toStorageError(lastError: chrome.runtime.LastError | undefined) {
  return new Error(lastError?.message ?? 'Unknown storage error', { cause: lastError });
}

const driverMap = new WeakMap<ExtensionStorage, chrome.storage.StorageArea>();
const runtimeMap = new WeakMap<ExtensionStorage, StorageRuntime>();

class ExtensionStorage {
  constructor(driver: chrome.storage.StorageArea, runtime: StorageRuntime) {
    driverMap.set(this, driver);
    runtimeMap.set(this, runtime);
  }

  getDriver(): chrome.storage.StorageArea {
    const driver = driverMap.get(this);
    if (!driver) throw new Error('Storage driver not initialised');
    return driver;
  }

  hasError() {
    return !!this.getError();
  }

  getError(): chrome.runtime.LastError | undefined {
    return runtimeMap.get(this)?.lastError;
  }

  setItem(key: string, item: unknown) {
    return new Promise((resolve, reject) => {
      this.getDriver().set({ [key]: item }, () => {
        if (this.hasError()) {
          return reject(toStorageError(this.getError()));
        }
        return resolve(true);
      });
    });
  }

  getItem(key: string) {
    return new Promise((resolve, reject) => {
      this.getDriver().get(key, (response: Record<string, unknown>) => {
        if (this.hasError()) {
          return reject(toStorageError(this.getError()));
        }
        return resolve(response[key]);
      });
    });
  }

  removeItem(key: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getDriver().remove(key, () => {
        if (this.hasError()) {
          return reject(toStorageError(this.getError()));
        }
        return resolve(true);
      });
    });
  }
}
export const storage = new ExtensionStorage(chrome.storage.local, chrome.runtime);
