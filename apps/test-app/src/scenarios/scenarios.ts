// Every multi-step flow the app can run, and the runner that walks one.
import type { RequestContext, Scenario, ScenarioState, ScenarioStepResult } from '../types';
import { bondLifecycle } from './bond-lifecycle';
import { multisigRoundTrip } from './multisig-roundtrip';
import { signInHandshake } from './sign-in';

export const scenarios: Scenario[] = [signInHandshake, multisigRoundTrip, bondLifecycle];

export function findScenario(id: string): Scenario | undefined {
  return scenarios.find(scenario => scenario.id === id);
}

export interface ScenarioStepRun extends Partial<ScenarioStepResult> {
  stepId: string;
  status: 'ok' | 'error';
  error?: unknown;
  durationMs: number;
}

/**
 * Run one step against the shared state and fold its result back in. Steps are
 * run individually rather than as a batch because most of them need the
 * developer to change something in the wallet first.
 */
export async function runScenarioStep(
  scenario: Scenario,
  stepId: string,
  ctx: RequestContext,
  state: ScenarioState
): Promise<{ run: ScenarioStepRun; state: ScenarioState }> {
  const step = scenario.steps.find(candidate => candidate.id === stepId);
  if (!step) throw new Error(`Scenario ${scenario.id} has no step ${stepId}`);
  const startedAt = Date.now();
  try {
    const result = await step.run({ ctx, state });
    return {
      run: { stepId, status: 'ok', ...result, durationMs: Date.now() - startedAt },
      state: { ...state, ...(result.state ?? {}) },
    };
  } catch (error) {
    return {
      run: { stepId, status: 'error', error, durationMs: Date.now() - startedAt },
      state,
    };
  }
}
