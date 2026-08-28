import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { callRpc, getLeatherProvider } from './leather';
import { resolveParams, rpcCategories, rpcMethods } from './rpc-methods';
import type { RequestContext, RpcMethodSpec } from './types';

type Status = 'pending' | 'success' | 'error';

interface ResultState {
  spec: RpcMethodSpec;
  params: unknown;
  status: Status;
  payload: unknown;
  at: string;
}

const providerPollIntervalMs = 1000;

// Wallet access for `params` builders: same provider, unwrapped `result`.
const requestContext: RequestContext = {
  request(method, params) {
    return callRpc(method, params).then(response => response.result);
  },
};

function safeStringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  // Track only the current ancestor path so genuine cycles are flagged while
  // shared-but-acyclic sibling references are still serialized in full.
  const ancestors: object[] = [];
  function normalize(val: unknown): unknown {
    if (val instanceof Error) return { name: val.name, message: val.message };
    if (typeof val === 'bigint') return val.toString();
    if (val === null || typeof val !== 'object') return val;
    if (ancestors.includes(val)) return '[Circular]';
    ancestors.push(val);
    const out = Array.isArray(val)
      ? val.map(normalize)
      : Object.fromEntries(Object.entries(val).map(([key, child]) => [key, normalize(child)]));
    ancestors.pop();
    return out;
  }
  return JSON.stringify(normalize(value), null, 2);
}

export function App() {
  const [installed, setInstalled] = useState(() => !!getLeatherProvider());
  const [result, setResult] = useState<ResultState | null>(null);
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(() => new Set());
  // Monotonic token: only the most-recently-initiated call may write the panel,
  // so out-of-order completions can't misattribute a response to another method.
  const seqRef = useRef(0);

  useEffect(() => {
    function refresh() {
      setInstalled(!!getLeatherProvider());
    }
    refresh();
    const interval = setInterval(refresh, providerPollIntervalMs);
    return () => clearInterval(interval);
  }, []);

  const handleSend = useCallback(async (spec: RpcMethodSpec) => {
    const mySeq = ++seqRef.current;
    function isCurrent() {
      return seqRef.current === mySeq;
    }
    const at = new Date().toLocaleTimeString();
    setBusyIds(prev => new Set(prev).add(spec.id));
    try {
      let params: unknown;
      try {
        params = await resolveParams(spec, requestContext);
      } catch (error) {
        if (isCurrent())
          setResult({ spec, params: undefined, status: 'error', payload: error, at });
        return;
      }
      if (isCurrent()) setResult({ spec, params, status: 'pending', payload: undefined, at });
      try {
        const payload = await callRpc(spec.method, params);
        if (isCurrent()) setResult({ spec, params, status: 'success', payload, at });
      } catch (error) {
        if (isCurrent()) setResult({ spec, params, status: 'error', payload: error, at });
      }
    } finally {
      // Each call clears only its own id, never a concurrent call's busy state.
      setBusyIds(prev => {
        const next = new Set(prev);
        next.delete(spec.id);
        return next;
      });
    }
  }, []);

  const grouped = useMemo(
    () =>
      rpcCategories.map(category => ({
        category,
        methods: rpcMethods.filter(method => method.category === category),
      })),
    []
  );

  return (
    <div className="layout">
      <main className="panel">
        <header className="masthead">
          <h1>Leather RPC test</h1>
          <p className="subtitle">
            Click a button to fire a <code>LeatherProvider.request()</code> call with a pre-filled
            payload. Buttons that need your keys ask for <code>getAddresses</code> first.
          </p>
          <span
            className={`badge ${installed ? 'badge-ok' : 'badge-bad'}`}
            data-testid="provider-status"
            data-installed={installed}
          >
            {installed ? '● Leather detected' : '○ Leather not detected'}
          </span>
        </header>

        {grouped.map(({ category, methods }) => (
          <section key={category} className="group">
            <h2>{category}</h2>
            <div className="grid">
              {methods.map(spec => (
                <button
                  key={spec.id}
                  type="button"
                  className="card"
                  data-testid={spec.id}
                  data-method={spec.method}
                  disabled={busyIds.has(spec.id)}
                  onClick={() => void handleSend(spec)}
                >
                  <span className="card-title">{spec.label}</span>
                  <code className="card-method">{spec.method}</code>
                  <span className="card-desc">{spec.description}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* data-status / data-method let Playwright wait on and read the outcome. */}
      <aside
        className="result"
        data-testid="rpc-result"
        data-status={result?.status ?? 'idle'}
        data-method={result?.spec.method ?? ''}
        data-id={result?.spec.id ?? ''}
      >
        <h2>Result</h2>
        {!result && (
          <p className="muted">Fire a request to see the params sent and the wallet response.</p>
        )}
        {result && (
          <div className="result-body">
            <div className="result-head">
              <span className={`status status-${result.status}`}>{result.status}</span>
              <code>{result.spec.method}</code>
              <span className="muted">{result.at}</span>
            </div>

            <h3>Request params</h3>
            <pre data-testid="rpc-result-params">{safeStringify(result.params)}</pre>

            <h3>{result.status === 'error' ? 'Error' : 'Response'}</h3>
            <pre
              className={result.status === 'error' ? 'pre-error' : undefined}
              data-testid="rpc-result-payload"
            >
              {result.status === 'pending' ? 'Waiting for wallet…' : safeStringify(result.payload)}
            </pre>
          </div>
        )}
      </aside>
    </div>
  );
}
