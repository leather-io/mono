import { initInpageProvider } from './init-inpage-provider';

interface ReactNativeWebViewBridge {
  postMessage(message: string): void;
}

interface ReactNativeWindow extends Window {
  onMessageFromRN?(str: string): void;
  ReactNativeWebView?: ReactNativeWebViewBridge;
}

const win: ReactNativeWindow = window;

// WebView on Android doesn't support window.addEventListener('message') directly
win.onMessageFromRN = function (str: string) {
  window.postMessage(str, window.location.origin);
};

initInpageProvider({
  onDispatch(rpcRequest) {
    if (!win.ReactNativeWebView) throw new TypeError('ReactNativeWebView is not available');
    win.ReactNativeWebView.postMessage(JSON.stringify(rpcRequest));
  },
  env: {
    branch: 'replace_branch',
    commitSha: 'replace_commit_sha',
    version: 'replace_version',
  },
});
// note: this is required, or you'll sometimes get silent failures
// Ref: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#the-injectedjavascript-prop
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
true;
