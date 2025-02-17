import { initInpageProvider } from '.';

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
