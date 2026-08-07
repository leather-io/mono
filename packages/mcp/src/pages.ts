export function bridgePageHtml(requestId: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Leather MCP</title>
    <style>
      body { font-family: system-ui, sans-serif; display: flex; justify-content: center; padding-top: 12vh; background: #f7f5f3; color: #12100f; }
      main { max-width: 26rem; text-align: center; }
      h1 { font-size: 1.25rem; }
      #code { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.2em; }
      #status { color: #64605c; }
      button { font-size: 1rem; padding: 0.6rem 1.4rem; border-radius: 0.5rem; border: 1px solid #12100f; background: #12100f; color: #f7f5f3; cursor: pointer; }
      button:disabled { opacity: 0.5; cursor: default; }
      @media (prefers-color-scheme: dark) {
        body { background: #12100f; color: #f7f5f3; }
        button { background: #f7f5f3; color: #12100f; border-color: #f7f5f3; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1 id="title">Leather MCP</h1>
      <p id="code" hidden></p>
      <p><button id="action" hidden></button></p>
      <p id="status">Loading…</p>
    </main>
    <script>
      const requestId = ${JSON.stringify(requestId)};
      const statusEl = document.getElementById('status');
      const codeEl = document.getElementById('code');
      const actionEl = document.getElementById('action');
      const titleEl = document.getElementById('title');

      function setStatus(text) {
        statusEl.textContent = text;
      }

      async function postOutcome(payload) {
        try {
          await fetch('/api/requests/' + requestId + '/result', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (e) {}
      }

      function walletError(e) {
        const err = e && typeof e === 'object' && 'error' in e && e.error ? e.error : e;
        const code = err && typeof err === 'object' && 'code' in err ? err.code : 'UNKNOWN';
        const message =
          err && typeof err === 'object' && 'message' in err ? String(err.message) : String(e);
        return { code: code, message: message };
      }

      async function run(req) {
        if (!window.LeatherProvider) {
          await postOutcome({
            outcome: 'failed',
            error: { code: 'WALLET_NOT_INSTALLED', message: 'LeatherProvider not found' },
          });
          setStatus(
            'Leather is not installed in this browser. Install the Leather extension, then ask your agent to try again.'
          );
          return;
        }
        setStatus('Waiting for your approval in Leather…');
        try {
          const response = await window.LeatherProvider.request(req.rpcMethod, req.rpcParams);
          const result =
            response && typeof response === 'object' && 'result' in response
              ? response.result
              : response;
          await postOutcome({ outcome: 'approved', result: result });
          setStatus('Done. You can close this tab.');
          setTimeout(function () {
            window.close();
          }, 1500);
        } catch (e) {
          const error = walletError(e);
          const outcome = Number(error.code) === 4001 ? 'rejected' : 'failed';
          await postOutcome({ outcome: outcome, error: error });
          setStatus(
            outcome === 'rejected'
              ? 'Rejected in Leather. You can close this tab.'
              : 'Failed: ' + error.message
          );
        }
      }

      async function main() {
        let res;
        try {
          res = await fetch('/api/requests/' + requestId);
        } catch (e) {
          setStatus('Could not reach the local Leather MCP server.');
          return;
        }
        if (!res.ok) {
          setStatus('This link is no longer valid. Ask your agent for a new one.');
          return;
        }
        const req = await res.json();
        if (req.kind === 'connect') {
          titleEl.textContent = 'Connect Leather to your agent';
          setStatus('Check that this pairing code matches the one your agent showed you.');
          codeEl.textContent = req.pairingCode;
          codeEl.hidden = false;
          actionEl.textContent = 'Connect Leather';
          actionEl.hidden = false;
          actionEl.onclick = function () {
            actionEl.disabled = true;
            run(req);
          };
        } else {
          titleEl.textContent = 'Approve agent request';
          if (req.summary) setStatus(req.summary);
          run(req);
        }
      }

      main();
    </script>
  </body>
</html>
`;
}
