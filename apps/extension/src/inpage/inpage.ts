import { initInpageProvider } from '@leather.io/provider';

import { BRANCH, COMMIT_SHA } from '@shared/environment';
import { DomEventName } from '@shared/inpage-types';

initInpageProvider({
  onDispatch(rpcRequest) {
    document.dispatchEvent(new CustomEvent(DomEventName.request, { detail: rpcRequest }));
  },
  env: {
    branch: BRANCH ?? '',
    commitSha: COMMIT_SHA ?? '',
    version: VERSION,
  },
});
