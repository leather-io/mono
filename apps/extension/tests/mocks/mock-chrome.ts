import { noop } from '@leather.io/utils';

export const chrome = {
  storage: {
    local: {
      clear: noop,
      get: noop,
      getBytesInUse: noop,
      onChanged: noop,
      remove: noop,
      set: noop,
    },
  },
  tabs: {
    sendMessage: noop,
  },
  runtime: {
    sendMessage: noop,
  },
};
