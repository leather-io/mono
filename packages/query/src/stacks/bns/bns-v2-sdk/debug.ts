let isDebugEnabled = false;

export const debug = {
  enable: () => {
    isDebugEnabled = true;
  },
  disable: () => {
    isDebugEnabled = false;
  },
  log: (...args: any[]) => {
    if (isDebugEnabled) {
      // eslint-disable-next-line no-console
      console.log('[BNS-V2-SDK]:', ...args);
    }
  },
  error: (...args: any[]) => {
    if (isDebugEnabled) {
      // eslint-disable-next-line no-console
      console.error('[BNS-V2-SDK]:', ...args);
    }
  },
};
