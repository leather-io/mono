// Walks a scenario one step at a time.
//
// Steps run individually on purpose: most of them need the developer to change
// something in the wallet first (switch account, mine a block), and a batch
// runner would race that.
import { useState } from 'react';

import { runScenarioStep } from '../scenarios/scenarios';
import { createCachedRequestContext, getNetwork } from '../session';
import type { Scenario, ScenarioState } from '../types';
import { safeStringify } from './format';

interface StepOutcome {
  status: 'ok' | 'error';
  summary?: string;
  error?: unknown;
  checks?: { label: string; ok: boolean; detail?: string }[];
}

interface ScenarioRunnerProps {
  scenario: Scenario;
}

export function ScenarioRunner({ scenario }: ScenarioRunnerProps) {
  const [state, setState] = useState<ScenarioState>({});
  const [outcomes, setOutcomes] = useState<Record<string, StepOutcome>>({});
  const [busy, setBusy] = useState<string | undefined>();

  async function runStep(stepId: string) {
    setBusy(stepId);
    try {
      const result = await runScenarioStep(
        scenario,
        stepId,
        createCachedRequestContext(getNetwork()),
        state
      );
      setState(result.state);
      setOutcomes(previous => ({
        ...previous,
        [stepId]: {
          status: result.run.status,
          summary: result.run.summary,
          error: result.run.error,
          checks: result.run.checks,
        },
      }));
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <section className="scenario" data-testid={`scenario-${scenario.id}`}>
      <h3>{scenario.label}</h3>
      <p className="card-desc">{scenario.description}</p>
      <ol className="scenario-steps">
        {scenario.steps.map(step => {
          const outcome = outcomes[step.id];
          return (
            <li
              key={step.id}
              data-testid={`step-${scenario.id}-${step.id}`}
              data-status={outcome?.status ?? 'pending'}
            >
              <div className="scenario-step-head">
                <span>{step.label}</span>
                <button
                  type="button"
                  data-control={`run-${scenario.id}-${step.id}`}
                  disabled={busy === step.id}
                  onClick={() => void runStep(step.id)}
                >
                  {busy === step.id ? 'Running…' : 'Run'}
                </button>
              </div>
              {step.instruction && <p className="muted">{step.instruction}</p>}
              {outcome?.summary && <p className="scenario-summary">{outcome.summary}</p>}
              {outcome?.checks?.map((check, index) => (
                <p key={`${check.label}-${index}`} className="scenario-check" data-ok={check.ok}>
                  <span className={check.ok ? 'check-ok' : 'check-fail'}>
                    {check.ok ? '✓' : '✗'}
                  </span>{' '}
                  {check.label}
                  {check.detail && <span className="muted"> — {check.detail}</span>}
                </p>
              ))}
              {outcome?.status === 'error' && (
                <pre className="pre-error">{safeStringify(outcome.error)}</pre>
              )}
            </li>
          );
        })}
      </ol>
      {Object.keys(state).length > 0 && (
        <details>
          <summary className="muted">Scenario state</summary>
          <pre data-testid={`scenario-state-${scenario.id}`}>{safeStringify(state)}</pre>
        </details>
      )}
    </section>
  );
}
