import provider from '../dist/injected-provider.js';

function evalScript() {
  // Add window here as a global variable for eval
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const window = {};
  const initializedProvider = provider({ branch: '', commitSha: '', version: '' });
  eval(initializedProvider);
}
evalScript();
