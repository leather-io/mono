import type { Scenario } from '../scenarios/scenario';
import type { JourneyDefinition, JourneyStep } from './journey-types';
import { JourneyApprovalView, JourneyOutcomeView } from './journey-wallet-views';

export function createJourneyCatalogScenario(
  definition: JourneyDefinition,
  step: JourneyStep
): Scenario {
  const scenario: Scenario = {
    id: `journey-${definition.id}-${step.id}`,
    family: step.kind === 'connect' ? 'connect' : 'contract-call',
    label: `${definition.title} · ${step.title}`,
    method: step.method,
    note: `${step.note ?? definition.description} Illustrative journey fixture; no real transaction is signed.`,
    render() {
      return <JourneyApprovalView definition={definition} step={step} signer="software" />;
    },
  };
  if (step.kind === 'transaction' || step.kind === 'broadcast') {
    return {
      ...scenario,
      history() {
        return <JourneyOutcomeView definition={definition} step={step} state="confirmed" />;
      },
    };
  }
  return scenario;
}
