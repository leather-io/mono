import { initInpageProvider } from '.';

// WebView on Android doesn't support window.addEventListener('message') directly
(window as any).onMessageFromRN = function (str: string) {
  window.postMessage(str, window.location.origin);
};

initInpageProvider({
  onDispatch(rpcRequest) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(rpcRequest));
  },
  env: {
    platform: 'mobile',
    branch: 'replace_branch',
    commitSha: 'replace_commit_sha',
    version: 'replace_version',
  },
});
// note: this is required, or you'll sometimes get silent failures
// Ref: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#the-injectedjavascript-prop
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
true;
