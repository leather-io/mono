import { useCallback, useEffect, useMemo, useState } from 'react';

import { getLeatherProvider } from './leather';
import { walletNetworks } from './networks';
import { rpcCategories, rpcMethods, rpcTags, specsWithTag } from './rpc-methods';
import { type SpecRun, runSpec } from './run-spec';
import { scenarios } from './scenarios/scenarios';
import {
  clearAddressCache,
  createCachedRequestContext,
  getNetwork,
  loadAccountSummary,
  setNetwork,
} from './session';
import { installTestAppApi } from './test-api';
import { type RpcMethodSpec, expectationFor } from './types';
import { AccountBar } from './ui/account-bar';
import { MethodCard } from './ui/method-card';
import { ResultPanel } from './ui/result-panel';
import { ScenarioRunner } from './ui/scenario-runner';
import { TagRunner } from './ui/tag-runner';
import type { AccountSummary } from './wallet';

const providerPollIntervalMs = 1000;
const historyLimit = 25;

export function App() {
  const [installed, setInstalled] = useState(() => !!getLeatherProvider());
  const [network, setNetworkState] = useState(getNetwork);
  const [account, setAccount] = useState<AccountSummary | undefined>();
  const [accountError, setAccountError] = useState<string | undefined>();
  const [runs, setRuns] = useState<SpecRun[]>([]);
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(() => new Set());
  const [filter, setFilter] = useState('');

  useEffect(() => {
    function refresh() {
      setInstalled(!!getLeatherProvider());
    }
    refresh();
    const interval = setInterval(refresh, providerPollIntervalMs);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    installTestAppApi(run => setRuns(previous => [...previous, run].slice(-historyLimit)));
  }, []);

  const refreshAccount = useCallback(async (force = false) => {
    setAccountError(undefined);
    try {
      setAccount(await loadAccountSummary(force));
    } catch (error) {
      setAccount(undefined);
      setAccountError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  const handleNetworkChange = useCallback((next: string) => {
    setNetwork(next);
    setNetworkState(next);
    setAccount(undefined);
    setAccountError(undefined);
  }, []);

  const handleRefresh = useCallback(() => {
    clearAddressCache();
    void refreshAccount(true);
  }, [refreshAccount]);

  const record = useCallback((run: SpecRun) => {
    setRuns(previous => [...previous, run].slice(-historyLimit));
  }, []);

  const handleSend = useCallback(
    async (spec: RpcMethodSpec) => {
      setBusyIds(previous => new Set(previous).add(spec.id));
      try {
        const run = await runSpec(spec, { ctx: createCachedRequestContext(getNetwork()) });
        // Every run is kept: the panel shows the newest, the history the rest,
        // so a slow call finishing late cannot erase a later result.
        record(run);
        return run;
      } finally {
        // Each call clears only its own id, never a concurrent call's busy state.
        setBusyIds(previous => {
          const next = new Set(previous);
          next.delete(spec.id);
          return next;
        });
      }
    },
    [record]
  );

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    function matches(spec: RpcMethodSpec) {
      return (
        !needle ||
        spec.id.toLowerCase().includes(needle) ||
        spec.method.toLowerCase().includes(needle) ||
        spec.label.toLowerCase().includes(needle) ||
        (spec.tags ?? []).some(tag => tag.includes(needle))
      );
    }
    return rpcCategories
      .map(category => ({
        category,
        methods: rpcMethods.filter(spec => spec.category === category && matches(spec)),
      }))
      .filter(group => group.methods.length > 0);
  }, [filter]);

  const latest = runs[runs.length - 1];
  const tags = useMemo(() => rpcTags(), []);

  return (
    <div className="layout">
      <main className="panel">
        <header className="masthead">
          <h1>Leather RPC test</h1>
          <p className="subtitle">
            Click a button to fire a <code>LeatherProvider.request()</code> call with a pre-filled
            payload. Buttons that need your keys ask for <code>getAddresses</code> first. Everything
            here is also on <code>window.__leatherTestApp</code>.
          </p>
          <div className="masthead-row">
            <span
              className={`badge ${installed ? 'badge-ok' : 'badge-bad'}`}
              data-testid="provider-status"
              data-installed={installed}
            >
              {installed ? '● Leather detected' : '○ Leather not detected'}
            </span>
            <label className="field">
              <span>Network</span>
              <select
                data-testid="network-select"
                value={network}
                onChange={event => handleNetworkChange(event.target.value)}
              >
                {walletNetworks.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label} ({option.mode})
                  </option>
                ))}
              </select>
            </label>
            <label className="field field-grow">
              <span>Filter</span>
              <input
                data-testid="filter-input"
                value={filter}
                placeholder="id, method or tag"
                onChange={event => setFilter(event.target.value)}
              />
            </label>
          </div>

          <AccountBar
            account={account}
            error={accountError}
            onLoad={() => void refreshAccount()}
            onRefresh={handleRefresh}
          />

          <TagRunner
            tags={tags}
            onRun={async tag => {
              const specs = specsWithTag(tag);
              const ctx = createCachedRequestContext(getNetwork());
              const results: SpecRun[] = [];
              for (const spec of specs) {
                const run = await runSpec(spec, { ctx });
                record(run);
                results.push(run);
              }
              return results;
            }}
          />
        </header>

        {grouped.map(({ category, methods }) => (
          <section key={category} className="group">
            <h2>
              {category} <span className="muted">({methods.length})</span>
            </h2>
            <div className="grid">
              {methods.map(spec => (
                <MethodCard
                  key={spec.id}
                  spec={spec}
                  busy={busyIds.has(spec.id)}
                  expectation={expectationFor(spec, 'extension')}
                  verdict={[...runs].reverse().find(run => run.id === spec.id)?.verdict}
                  onSend={() => void handleSend(spec)}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="group">
          <h2>Scenarios</h2>
          <div className="scenarios">
            {scenarios.map(scenario => (
              <ScenarioRunner key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </section>
      </main>

      <ResultPanel run={latest} history={runs} />
    </div>
  );
}
