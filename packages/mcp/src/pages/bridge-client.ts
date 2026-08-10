interface LeatherProvider {
  request(method: string, params?: unknown): Promise<unknown>;
}

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}

type PageState = 'loading' | 'ready' | 'waiting' | 'approved' | 'rejected' | 'failed' | 'invalid';

interface BridgeRequestData {
  kind: string;
  rpcMethod: string;
  rpcParams: unknown;
  pairingCode?: string;
}

interface WalletError {
  code: string | number;
  message: string;
}

const userRejectionCode = 4001;
const providerWaitTimeoutMs = 4_000;
const providerPollIntervalMs = 50;

function waitForProvider(): Promise<LeatherProvider | undefined> {
  return new Promise(resolve => {
    const deadline = Date.now() + providerWaitTimeoutMs;
    function check() {
      if (window.LeatherProvider) {
        resolve(window.LeatherProvider);
        return;
      }
      if (Date.now() > deadline) {
        resolve(undefined);
        return;
      }
      setTimeout(check, providerPollIntervalMs);
    }
    check();
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function revealCloseButton() {
  const actionEl = document.getElementById('action');
  if (actionEl) actionEl.hidden = true;
  const closeEl = document.getElementById('close');
  if (closeEl instanceof HTMLButtonElement) {
    closeEl.hidden = false;
    closeEl.addEventListener('click', () => window.close());
  }
}

function revealExplorerLink(rpcMethod: string, result: unknown) {
  if (!isRecord(result) || typeof result.txid !== 'string') return;
  const explorerEl = document.getElementById('explorer');
  if (!(explorerEl instanceof HTMLAnchorElement)) return;
  const txid = result.txid;
  explorerEl.href =
    rpcMethod === 'sendTransfer'
      ? `https://mempool.space/tx/${txid}`
      : `https://explorer.hiro.so/txid/${txid.startsWith('0x') ? txid : `0x${txid}`}?chain=mainnet`;
  explorerEl.hidden = false;
}

function setState(state: PageState, message: string, headline?: string) {
  document.body.dataset.state = state;
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = message;
  const headlineEl = document.getElementById('headline');
  if (headlineEl && headline) headlineEl.textContent = headline;
}

function parseBridgeRequest(value: unknown): BridgeRequestData | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.kind !== 'string' || typeof value.rpcMethod !== 'string') return undefined;
  return {
    kind: value.kind,
    rpcMethod: value.rpcMethod,
    rpcParams: value.rpcParams,
    pairingCode: typeof value.pairingCode === 'string' ? value.pairingCode : undefined,
  };
}

function extractWalletError(error: unknown): WalletError {
  const outer = isRecord(error) ? error : undefined;
  const innerCandidate = outer && isRecord(outer.error) ? outer.error : outer;
  if (!innerCandidate) return { code: 'UNKNOWN', message: String(error) };
  const code =
    typeof innerCandidate.code === 'string' || typeof innerCandidate.code === 'number'
      ? innerCandidate.code
      : 'UNKNOWN';
  const message =
    typeof innerCandidate.message === 'string' ? innerCandidate.message : String(error);
  return { code, message };
}

async function postOutcome(
  requestId: string,
  payload: { outcome: 'approved' | 'rejected' | 'failed'; result?: unknown; error?: WalletError }
) {
  try {
    await fetch(`/api/requests/${requestId}/result`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return;
  }
}

async function runWalletRequest(requestId: string, request: BridgeRequestData) {
  const provider = await waitForProvider();
  const isConnect = request.kind === 'connect';
  if (!provider) {
    await postOutcome(requestId, {
      outcome: 'failed',
      error: { code: 'WALLET_NOT_INSTALLED', message: 'LeatherProvider not found' },
    });
    setState(
      'failed',
      'Leather is not installed in this browser. Install the extension, then ask your agent for a new link.',
      'Leather not found'
    );
    revealCloseButton();
    return;
  }

  setState(
    'waiting',
    isConnect
      ? 'Approve the connection in the Leather popup.'
      : 'Check the details in the Leather popup and approve or reject there.',
    'Review in Leather'
  );

  try {
    const response = await provider.request(request.rpcMethod, request.rpcParams);
    const result = isRecord(response) && 'result' in response ? response.result : response;
    await postOutcome(requestId, { outcome: 'approved', result });
    if (!isConnect) revealExplorerLink(request.rpcMethod, result);
    setState(
      'approved',
      isConnect
        ? 'Your wallet is paired. You can return to your agent.'
        : 'Signed and broadcast by Leather. You can close this tab.',
      isConnect ? 'Connected' : 'Approved'
    );
    revealCloseButton();
  } catch (error) {
    const walletError = extractWalletError(error);
    const rejected = Number(walletError.code) === userRejectionCode;
    await postOutcome(requestId, {
      outcome: rejected ? 'rejected' : 'failed',
      error: walletError,
    });
    if (rejected) {
      setState(
        'rejected',
        isConnect
          ? 'Connection declined in Leather. Nothing was shared.'
          : 'Rejected in Leather. Nothing was sent.',
        isConnect ? 'Connection declined' : 'Rejected'
      );
      revealCloseButton();
      return;
    }
    setState('failed', `Leather reported an error: ${walletError.message}`, 'Something went wrong');
    revealCloseButton();
  }
}

async function initialize() {
  const requestId = document.body.dataset.requestId ?? '';
  const page = document.body.dataset.page ?? 'approve';

  let response: Response;
  try {
    response = await fetch(`/api/requests/${requestId}`);
  } catch {
    setState(
      'failed',
      'Could not reach the local agent server. Is it still running?',
      'Server unreachable'
    );
    revealCloseButton();
    return;
  }

  if (!response.ok) {
    setState(
      'invalid',
      'This link has expired or was already used. Ask your agent for a new one.',
      'Link no longer valid'
    );
    revealCloseButton();
    return;
  }

  const request = parseBridgeRequest(await response.json());
  if (!request) {
    setState('failed', 'The server returned an unexpected response.', 'Something went wrong');
    revealCloseButton();
    return;
  }

  if (page === 'connect' && request.kind === 'connect') {
    const codeEl = document.getElementById('code');
    if (codeEl && request.pairingCode) codeEl.textContent = request.pairingCode;
    const actionEl = document.getElementById('action');
    setState('ready', 'Verify the code, then connect.');
    if (actionEl instanceof HTMLButtonElement) {
      actionEl.disabled = false;
      actionEl.addEventListener('click', () => {
        actionEl.disabled = true;
        void runWalletRequest(requestId, request);
      });
    }
    return;
  }

  void runWalletRequest(requestId, request);
}

void initialize();

export {};
