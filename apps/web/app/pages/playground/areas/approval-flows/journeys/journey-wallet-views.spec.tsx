import { renderToStaticMarkup } from 'react-dom/server';

import { JSDOM } from 'jsdom';
import { describe, expect, test } from 'vitest';

import { createJourneyCatalogScenario } from './journey-catalog';
import type { JourneyDefinition, JourneyStep } from './journey-types';
import { JourneyApprovalView, JourneyOutcomeView } from './journey-wallet-views';

const request: JourneyStep = {
  id: 'distinctive-request',
  kind: 'transaction',
  title: 'Send 83.142 STX',
  primaryLabel: 'Send',
  method: 'stx_transferStx',
  chain: 'stacks',
  movements: [{ symbol: 'STX', amount: '83.142', direction: 'out' }],
  fee: { amount: '0.007', symbol: 'STX' },
  protection: 'Only this exact transfer can be approved.',
};

const definition: JourneyDefinition = {
  id: 'distinctive-app',
  title: 'Distinctive transfer',
  category: 'generic',
  appName: 'Review fixture',
  origin: 'https://review-fixture.example',
  description: 'Review a transfer.',
  goal: 'Identify the actual amount and fee.',
  steps: [request],
};

function documentOf(markup: string) {
  return new JSDOM(markup).window.document;
}

function renderOutcome(state: 'pending' | 'confirmed' | 'failed' | 'signed', feePaid = true) {
  return documentOf(
    renderToStaticMarkup(
      <JourneyOutcomeView definition={definition} step={request} state={state} feePaid={feePaid} />
    )
  );
}

describe('Journey request continuity', () => {
  test('catalog and interactive approval show the same current request facts', () => {
    const changedRequest: JourneyStep = {
      ...request,
      title: 'Send 92.753 STX',
      movements: [{ symbol: 'STX', amount: '92.753', direction: 'out' }],
    };
    for (const step of [request, changedRequest]) {
      const catalog = documentOf(
        renderToStaticMarkup(createJourneyCatalogScenario(definition, step).render())
      );
      const runner = documentOf(
        renderToStaticMarkup(
          <JourneyApprovalView definition={definition} step={step} signer="software" />
        )
      );
      expect(catalog.body.textContent).toEqual(runner.body.textContent);
      expect(runner.body.textContent).toContain(step.title);
      expect(runner.body.textContent).toContain('review-fixture.example');
      expect(runner.body.textContent).toContain('0.007');
      expect(runner.body.textContent).toContain('Only this exact transfer can be approved.');
    }
  });

  test('interactive requests enable the shared launch animation while static views stay still', () => {
    const connectRequest: JourneyStep = { ...request, kind: 'connect', movements: [] };
    for (const step of [request, connectRequest]) {
      const interactive = documentOf(
        renderToStaticMarkup(
          <JourneyApprovalView
            definition={definition}
            step={step}
            signer="software"
            onApprove={() => undefined}
          />
        )
      );
      const still = documentOf(
        renderToStaticMarkup(
          <JourneyApprovalView definition={definition} step={step} signer="software" />
        )
      );
      expect(interactive.querySelector('[data-approval-launch]')).not.toBeNull();
      expect(still.querySelector('[data-approval-launch]')).toBeNull();
    }
  });

  test('vault approval identifies the vault funds separately from the personal signer', () => {
    const vaultDefinition: JourneyDefinition = { ...definition, category: 'vaults' };
    const document = documentOf(
      renderToStaticMarkup(
        <JourneyApprovalView definition={vaultDefinition} step={request} signer="ledger" />
      )
    );
    expect(document.querySelector('[data-approval-zone="account"]')?.textContent).toContain(
      'Team Treasury'
    );
    expect(document.querySelector('[data-approval-zone="account"]')?.textContent).toContain(
      'as Account 2'
    );
  });

  test('pending and signed outcomes do not present confirmed balance changes or a paid fee', () => {
    for (const state of ['pending', 'signed']) {
      if (state !== 'pending' && state !== 'signed') continue;
      const document = renderOutcome(state);
      expect(document.querySelector('[data-approval-section="What moved"]')).toBeNull();
      expect(document.querySelector('[data-approval-section="Fee paid"]')).toBeNull();
      expect(document.body.textContent).not.toContain('View in explorer');
    }
  });

  test('a confirmed outcome shows movements and the paid fee', () => {
    const document = renderOutcome('confirmed');
    expect(document.querySelector('[data-approval-section="What moved"]')?.textContent).toContain(
      '83.142'
    );
    expect(document.querySelector('[data-approval-section="Fee paid"]')?.textContent).toContain(
      '0.007'
    );
  });

  test('a failed confirmed call shows only its fee while a pre-broadcast failure shows no fee', () => {
    const failedCall = renderOutcome('failed');
    expect(failedCall.querySelector('[data-approval-section="What moved"]')).toBeNull();
    expect(failedCall.querySelector('[data-approval-section="Fee paid"]')?.textContent).toContain(
      '0.007'
    );
    const stoppedRequest = renderOutcome('failed', false);
    expect(stoppedRequest.querySelector('[data-approval-section="Fee paid"]')).toBeNull();
    expect(stoppedRequest.body.textContent).toContain('No assets moved and no fee was paid.');
  });
});
