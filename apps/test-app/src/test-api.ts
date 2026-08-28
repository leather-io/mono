// `window.__leatherTestApp` — the programmatic surface.
//
// An agent driving a browser should not have to scrape the DOM: this exposes
// the catalog, runs specs and scenarios, and hands back the same verdict
// objects the UI renders. Everything is JSON-serializable so it survives
// `page.evaluate`.
import type { BuilderSelection } from './builders/spec-builder';
import { buildSpec, builderCombinationSpecs, specBuilders } from './methods/builders';
import { walletNetworks } from './networks';
import { findSpec, rpcMethods, rpcTags, specsWithTag } from './rpc-methods';
import { type SpecRun, runSpec, runSpecs } from './run-spec';
import { findScenario, runScenarioStep, scenarios } from './scenarios/scenarios';
import { clearAddressCache, createCachedRequestContext, getNetwork, setNetwork } from './session';
import type { Platform, RpcMethodSpec, ScenarioState } from './types';

export interface SpecSummary {
  id: string;
  method: string;
  label: string;
  category: string;
  description: string;
  tags: string[];
  requires: string[];
  expect: unknown;
}

function summarize(spec: RpcMethodSpec): SpecSummary {
  return {
    id: spec.id,
    method: spec.method,
    label: spec.label,
    category: spec.category,
    description: spec.description,
    tags: spec.tags ?? [],
    requires: spec.requires ?? [],
    expect: spec.expect ?? 'manual',
  };
}

export interface TestAppApi {
  /** Every spec, with its metadata. */
  list(): SpecSummary[];
  /** Every tag in the catalog. */
  tags(): string[];
  /** Run one spec by id. */
  run(id: string, options?: { platform?: Platform; params?: unknown }): Promise<SpecRun>;
  /** Run every spec carrying a tag, sequentially. */
  runTag(tag: string, options?: { platform?: Platform }): Promise<SpecRun[]>;
  /** Request families declared as choices: their fields and defaults. */
  builders(): { id: string; label: string; description: string; fields: string[] }[];
  /** Build and run one combination, e.g. buildAndRun('psbt', { inputs: 'p2tr' }). */
  buildAndRun(
    builderId: string,
    selection: Partial<BuilderSelection>,
    options?: { platform?: Platform }
  ): Promise<SpecRun>;
  /** Run a builder's curated sweep, or every builder's when none is named. */
  runBuilderMatrix(builderId?: string, options?: { platform?: Platform }): Promise<SpecRun[]>;
  /** Results of everything run in this session, newest last. */
  results(): SpecRun[];
  /** Network ids the app can pin requests to. */
  networks(): { id: string; label: string; mode: string }[];
  network(): string;
  setNetwork(network: string): void;
  /** Forget cached `getAddresses` responses (after switching account). */
  refresh(): void;
  scenarios(): { id: string; label: string; description: string; steps: string[] }[];
  runScenarioStep(
    scenarioId: string,
    stepId: string,
    state?: ScenarioState
  ): Promise<{ run: unknown; state: ScenarioState }>;
}

const history: SpecRun[] = [];

/** Records a run so `results()` can report it, then returns it unchanged. */
function record(run: SpecRun): SpecRun {
  history.push(run);
  return run;
}

function createTestAppApi(onRun?: (run: SpecRun) => void): TestAppApi {
  function publish(run: SpecRun): SpecRun {
    record(run);
    onRun?.(run);
    return run;
  }

  return {
    list: () => rpcMethods.map(summarize),
    tags: () => rpcTags(),
    async run(id, options = {}) {
      const spec = findSpec(id);
      if (!spec) throw new Error(`No catalog entry with id ${id}`);
      return publish(await runSpec(spec, { ctx: createCachedRequestContext() }, options));
    },
    async runTag(tag, options = {}) {
      const specs = specsWithTag(tag);
      if (!specs.length) throw new Error(`No specs tagged ${tag}`);
      const runs = await runSpecs(specs, { ctx: createCachedRequestContext() }, options);
      runs.forEach(publish);
      return runs;
    },
    builders: () =>
      specBuilders.map(builder => ({
        id: builder.id,
        label: builder.label,
        description: builder.description,
        fields: builder.fields.map(field => field.key),
      })),
    async buildAndRun(builderId, selection, options = {}) {
      return publish(
        await runSpec(
          buildSpec(builderId, selection),
          { ctx: createCachedRequestContext() },
          options
        )
      );
    },
    async runBuilderMatrix(builderId, options = {}) {
      const runs = await runSpecs(
        builderCombinationSpecs(builderId),
        { ctx: createCachedRequestContext() },
        options
      );
      runs.forEach(publish);
      return runs;
    },
    results: () => [...history],
    networks: () => walletNetworks.map(({ id, label, mode }) => ({ id, label, mode })),
    network: getNetwork,
    setNetwork,
    refresh: clearAddressCache,
    scenarios: () =>
      scenarios.map(scenario => ({
        id: scenario.id,
        label: scenario.label,
        description: scenario.description,
        steps: scenario.steps.map(step => step.id),
      })),
    async runScenarioStep(scenarioId, stepId, state = {}) {
      const scenario = findScenario(scenarioId);
      if (!scenario) throw new Error(`No scenario with id ${scenarioId}`);
      return runScenarioStep(scenario, stepId, createCachedRequestContext(), state);
    },
  };
}

declare global {
  interface Window {
    __leatherTestApp?: TestAppApi;
  }
}

export function installTestAppApi(onRun?: (run: SpecRun) => void): void {
  if (typeof window === 'undefined') return;
  window.__leatherTestApp = createTestAppApi(onRun);
}
