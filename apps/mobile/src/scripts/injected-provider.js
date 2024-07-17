function createEventListeners() {
  let eventListeners = {};
  return {
    addEventListener(type, handler) {
      eventListeners[type] = handler;
    },
    dispatchEvent(type, data) {
      if (eventListeners[type]) {
        eventListeners[type](data);
      }
    },
    removeEventListener(type) {
      eventListeners[type] = undefined;
    },
  };
}
const eventListeners = createEventListeners();

const provider = {
  isLeather: true,

  getURL() {
    // window.ReactNativeWebView.postMessage('getURL');
  },
  async request(method, params) {
    const id = crypto.randomUUID();
    const rpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(rpcRequest));
    return new Promise((resolve, reject) => {
      function handleMessage(event) {
        const response = event.data;
        const parsedData = JSON.parse(response);
        const updatedParsedData = {
          jsonrpc: '2.0',
          ...parsedData,
        };

        if (parsedData.id !== id) return;
        if ('error' in parsedData) return reject(parsedData);

        window.removeEventListener('message', handleMessage);

        return resolve(updatedParsedData);
      }
      window.addEventListener('message', handleMessage);
    });
  },
};

Object.defineProperty(window, 'HiroWalletProvider', {
  get: a => {
    // window.ReactNativeWebView.postMessage('get leather provider', a);
    return provider;
  },
  set: () => {},
});
// Legacy product provider objects
window.btc = provider;
true; // note: this is required, or you'll sometimes get silent failures
