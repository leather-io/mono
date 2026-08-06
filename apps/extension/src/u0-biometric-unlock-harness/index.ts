import {
  consumeAutomaticPromptIntent,
  getPopupContextEvidence,
  isRealActionPopup,
} from './entry-classifier';
import {
  PersistedFixtureState,
  isPersistedFixtureState,
  persistFixtureStateAtomically,
  prepareFixtureState,
  validateFixtureState,
} from './fixture-transaction';
import {
  clearHarnessState,
  harnessFixtureStorageKey,
  harnessPopupClassifierKey,
  harnessSessionReadyKey,
  readHarnessEnrollmentState,
  saveNewActiveCredential,
  setTransportHint,
  swapActiveCredential,
} from './harness-state';
import {
  PrfCredentialConfig,
  PrfEvaluation,
  PrfResult,
  createPrfEnrollment,
  equalBytes,
  evaluatePrfCredential,
  generateRandomBytes,
} from './webauthn-prf';

const alternatePrfInputByteLength = 32;

interface RuntimeState {
  lastPrfOutput?: Uint8Array<ArrayBuffer>;
}

const runtimeState: RuntimeState = {};

function getElement(id: string) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing U0 harness element: ${id}`);
  return element;
}

function getButton(id: string) {
  const element = getElement(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Expected U0 harness button: ${id}`);
  }
  return element;
}

function getCheckbox(id: string) {
  const element = getElement(id);
  if (!(element instanceof HTMLInputElement) || element.type !== 'checkbox') {
    throw new Error(`Expected U0 harness checkbox: ${id}`);
  }
  return element;
}

function getSelect(id: string) {
  const element = getElement(id);
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error(`Expected U0 harness select: ${id}`);
  }
  return element;
}

function setStatus(result: string, message: string) {
  const status = getElement('status');
  status.dataset.result = result;
  status.textContent = message;
}

function setBusy(busy: boolean) {
  for (const element of document.querySelectorAll('button, select, input')) {
    if (
      element instanceof HTMLButtonElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLInputElement
    ) {
      element.disabled = busy;
    }
  }
  document.body.dataset.busy = String(busy);
}

function replaceLastPrfOutput(output?: Uint8Array<ArrayBuffer>) {
  runtimeState.lastPrfOutput?.fill(0);
  runtimeState.lastPrfOutput = output ? new Uint8Array(output) : undefined;
}

async function runBusy(action: () => Promise<void>) {
  setBusy(true);
  try {
    await action();
  } finally {
    setBusy(false);
    await renderEnrollmentState();
  }
}

async function renderEnrollmentState() {
  const state = await readHarnessEnrollmentState();
  getElement('active-registration').textContent = state.active
    ? `Present · ${state.active.registrationTag}`
    : 'Absent';
  getElement('previous-registration').textContent = state.previous
    ? `Present · ${state.previous.registrationTag}`
    : 'Absent';
  getSelect('transport-hint').value = state.transportHint;
  getButton('evaluate').disabled = !state.active;
  getButton('compare-same').disabled = !state.active;
  getButton('compare-alternate').disabled = !state.active;
  getButton('run-fixture').disabled = !state.active;
  getButton('unlock-fixture').disabled = !state.active;
  getButton('swap-active').disabled = !state.previous;
}

async function runPreflight() {
  if (typeof PublicKeyCredential === 'undefined') {
    getElement('preflight').textContent = 'WebAuthn: absent';
    return;
  }
  const userVerifyingPlatformAuthenticator =
    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  const capabilities =
    typeof PublicKeyCredential.getClientCapabilities === 'function'
      ? await PublicKeyCredential.getClientCapabilities()
      : {};
  const context = await getPopupContextEvidence();
  if (context.realPopupView) {
    await chrome.storage.session.set({ [harnessPopupClassifierKey]: true });
  }
  getElement('preflight').textContent = [
    'WebAuthn: present',
    `UVPAA advisory: ${String(userVerifyingPlatformAuthenticator)}`,
    `extension:prf advisory: ${String(capabilities['extension:prf'] ?? false)}`,
    `entry: ${window.location.pathname}`,
  ].join(' | ');
  getElement('context-evidence').textContent = [
    `action path: ${String(context.actionPopupPath)}`,
    `real popup view: ${String(context.realPopupView)}`,
    `runtime popup contexts: ${context.runtimePopupContextCount}`,
    `same-URL runtime contexts: ${context.matchingRuntimeContextCount}`,
  ].join(' | ');
}

async function createEnrollment() {
  const state = await readHarnessEnrollmentState();
  setStatus('enrollment-started', 'Creating a distinct PRF credential.');
  const result = await createPrfEnrollment(state.transportHint);
  if (result.status === 'failure') {
    setStatus(result.code, 'Enrollment did not produce a usable PRF result.');
    return;
  }
  if (getCheckbox('force-orphan').checked) {
    result.value.prfOutput.fill(0);
    setStatus('orphan-created', 'Credential created; local config intentionally left unchanged.');
    return;
  }
  await saveNewActiveCredential(result.value.config);
  replaceLastPrfOutput(result.value.prfOutput);
  result.value.prfOutput.fill(0);
  setStatus(
    'enrollment-succeeded',
    result.value.followUpRequired
      ? 'Enrollment succeeded after a pinned follow-up assertion.'
      : 'Enrollment succeeded with PRF output during creation.'
  );
}

async function evaluateConfig(
  config: PrfCredentialConfig,
  prfInputOverride?: Uint8Array<ArrayBuffer>
): Promise<PrfResult<PrfEvaluation>> {
  const state = await readHarnessEnrollmentState();
  return evaluatePrfCredential(config, state.transportHint, prfInputOverride);
}

async function evaluateActiveCredential(resultCode = 'assertion-succeeded') {
  const state = await readHarnessEnrollmentState();
  if (!state.active) {
    setStatus('invalid-config', 'No local credential is configured.');
    return;
  }
  setStatus('assertion-started', 'Evaluating only the pinned local credential.');
  const result = await evaluateConfig(state.active);
  if (result.status === 'failure') {
    setStatus(result.code, 'The pinned credential did not produce a usable PRF result.');
    return;
  }
  replaceLastPrfOutput(result.value.prfOutput);
  result.value.prfOutput.fill(0);
  setStatus(resultCode, 'Pinned credential evaluation succeeded.');
}

async function compareSameInput() {
  const state = await readHarnessEnrollmentState();
  if (!state.active) return;
  const first = await evaluateConfig(state.active);
  if (first.status === 'failure') {
    setStatus(first.code, 'The first repeated evaluation failed.');
    return;
  }
  const second = await evaluateConfig(state.active);
  if (second.status === 'failure') {
    first.value.prfOutput.fill(0);
    setStatus(second.code, 'The second repeated evaluation failed.');
    return;
  }
  const stable = equalBytes(first.value.prfOutput, second.value.prfOutput);
  replaceLastPrfOutput(second.value.prfOutput);
  first.value.prfOutput.fill(0);
  second.value.prfOutput.fill(0);
  setStatus(stable ? 'same-input-stable' : 'same-input-changed', `Stable output: ${stable}`);
}

async function compareAlternateInput() {
  const state = await readHarnessEnrollmentState();
  if (!state.active) return;
  const baseline = await evaluateConfig(state.active);
  if (baseline.status === 'failure') {
    setStatus(baseline.code, 'The baseline PRF evaluation failed.');
    return;
  }
  const alternateInput = generateRandomBytes(alternatePrfInputByteLength);
  const alternate = await evaluateConfig(state.active, alternateInput);
  if (alternate.status === 'failure') {
    baseline.value.prfOutput.fill(0);
    alternateInput.fill(0);
    setStatus(alternate.code, 'The alternate-input PRF evaluation failed.');
    return;
  }
  const different = !equalBytes(baseline.value.prfOutput, alternate.value.prfOutput);
  baseline.value.prfOutput.fill(0);
  alternate.value.prfOutput.fill(0);
  alternateInput.fill(0);
  setStatus(
    different ? 'alternate-input-different' : 'alternate-input-reused',
    `Different output: ${different}`
  );
}

async function runFixtureTransaction() {
  const state = await readHarnessEnrollmentState();
  if (!state.active) return;
  const evaluation = await evaluateConfig(state.active);
  if (evaluation.status === 'failure') {
    setStatus(evaluation.code, 'Fixture authentication failed before persistence.');
    return;
  }
  const fixtureState = await prepareFixtureState(state.active, evaluation.value.prfOutput);
  evaluation.value.prfOutput.fill(0);
  await persistFixtureStateAtomically(fixtureState, {
    async initialize() {
      await chrome.storage.session.set({ [harnessSessionReadyKey]: true });
    },
    async persist(value) {
      await chrome.storage.local.set({ [harnessFixtureStorageKey]: value });
    },
  });
  setStatus('fixture-persisted', 'The complete biometric-only fixture committed in one write.');
}

async function readFixtureState(): Promise<PersistedFixtureState | undefined> {
  const stored = await chrome.storage.local.get(harnessFixtureStorageKey);
  const value: unknown = stored[harnessFixtureStorageKey];
  return isPersistedFixtureState(value) ? value : undefined;
}

async function unlockFixtureTransaction() {
  const fixtureState = await readFixtureState();
  if (!fixtureState) {
    setStatus('invalid-config', 'No complete fixture state is persisted.');
    return;
  }
  const evaluation = await evaluateConfig(fixtureState.platformUnlock);
  if (evaluation.status === 'failure') {
    setStatus(evaluation.code, 'Fixture credential evaluation failed.');
    return;
  }
  const valid = await validateFixtureState(fixtureState, evaluation.value.prfOutput);
  evaluation.value.prfOutput.fill(0);
  setStatus(
    valid ? 'fixture-unlocked' : 'fixture-validation-failed',
    `Fixture wallet validation: ${valid}`
  );
}

async function clearAllHarnessState() {
  await clearHarnessState();
  replaceLastPrfOutput();
  setStatus('cleared', 'Harness-local extension state cleared.');
}

async function switchActiveCredential() {
  const swapped = await swapActiveCredential();
  replaceLastPrfOutput();
  setStatus(swapped ? 'active-swapped' : 'invalid-config', `Active credential swapped: ${swapped}`);
}

async function openActionPopup() {
  await chrome.action.openPopup();
  setStatus('popup-opened', 'Chrome action popup requested from a user gesture.');
}

function renderHarness() {
  document.getElementById('splash-screen')?.remove();
  const root = getElement('app');
  root.innerHTML = `
    <style>
      :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
      body { margin: 0; min-width: 390px; background: Canvas; color: CanvasText; }
      main { max-width: 760px; margin: 0 auto; padding: 24px; }
      h1 { font-size: 24px; margin: 0 0 8px; }
      h2 { font-size: 16px; margin: 0 0 12px; }
      p { line-height: 1.45; }
      section { border: 1px solid color-mix(in srgb, CanvasText 20%, transparent); border-radius: 10px; padding: 16px; margin-top: 16px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
      button, select { min-height: 40px; padding: 8px 12px; }
      button { cursor: pointer; }
      button:disabled { cursor: not-allowed; opacity: 0.55; }
      .evidence { font-family: ui-monospace, monospace; font-size: 12px; overflow-wrap: anywhere; }
      #status { min-height: 44px; border-left: 4px solid currentColor; padding: 10px 12px; background: color-mix(in srgb, CanvasText 8%, transparent); }
      label { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
    </style>
    <main>
      <h1>Leather biometric unlock U0</h1>
      <p>Development-only extension-origin PRF harness. It records outcomes, never raw credential responses, PRF bytes, wallet encryption keys, passwords, or mnemonics.</p>
      <section>
        <h2>Origin and preflight</h2>
        <p id="preflight" class="evidence" data-testid="preflight">Not run</p>
        <p id="context-evidence" class="evidence" data-testid="context-evidence">Not run</p>
        <div class="grid">
          <button id="run-preflight" data-testid="run-preflight">Run preflight</button>
          <button id="open-action-popup" data-testid="open-action-popup">Open real action popup</button>
        </div>
      </section>
      <section>
        <h2>Credential lifecycle</h2>
        <p class="evidence">Active local registration: <strong id="active-registration" data-testid="active-registration">Absent</strong> | Previous: <strong id="previous-registration" data-testid="previous-registration">Absent</strong></p>
        <label for="transport-hint">Transport hint
          <select id="transport-hint" data-testid="transport-hint">
            <option value="omitted">Omitted</option>
            <option value="internal">Internal</option>
          </select>
        </label>
        <label for="force-orphan"><input id="force-orphan" data-testid="force-orphan" type="checkbox">Force failure after credential creation</label>
        <div class="grid">
          <button id="create" data-testid="create-credential">Create distinct credential</button>
          <button id="evaluate" data-testid="evaluate-pinned">Evaluate pinned credential</button>
          <button id="swap-active" data-testid="swap-active">Swap active and previous</button>
          <button id="compare-same" data-testid="compare-same">Compare repeated input</button>
          <button id="compare-alternate" data-testid="compare-alternate">Compare alternate input</button>
        </div>
      </section>
      <section>
        <h2>Throwaway biometric-only transaction</h2>
        <div class="grid">
          <button id="run-fixture" data-testid="run-fixture">Create and persist fixture</button>
          <button id="unlock-fixture" data-testid="unlock-fixture">Unlock and validate fixture</button>
          <button id="clear" data-testid="clear-harness">Clear harness state</button>
        </div>
      </section>
      <section>
        <h2>Result</h2>
        <p id="status" data-testid="status" data-result="ready" aria-live="polite">Ready.</p>
      </section>
    </main>
  `;
}

function bindEvents() {
  getButton('run-preflight').addEventListener('click', () => void runBusy(runPreflight));
  getButton('open-action-popup').addEventListener('click', () => void runBusy(openActionPopup));
  getButton('create').addEventListener('click', () => void runBusy(createEnrollment));
  getButton('evaluate').addEventListener(
    'click',
    () => void runBusy(() => evaluateActiveCredential())
  );
  getButton('swap-active').addEventListener('click', () => void runBusy(switchActiveCredential));
  getButton('compare-same').addEventListener('click', () => void runBusy(compareSameInput));
  getButton('compare-alternate').addEventListener(
    'click',
    () => void runBusy(compareAlternateInput)
  );
  getButton('run-fixture').addEventListener('click', () => void runBusy(runFixtureTransaction));
  getButton('unlock-fixture').addEventListener(
    'click',
    () => void runBusy(unlockFixtureTransaction)
  );
  getButton('clear').addEventListener('click', () => void runBusy(clearAllHarnessState));
  getSelect('transport-hint').addEventListener('change', event => {
    if (!(event.currentTarget instanceof HTMLSelectElement)) return;
    const transportHint = event.currentTarget.value === 'internal' ? 'internal' : 'omitted';
    void runBusy(() => setTransportHint(transportHint));
  });
}

async function startHarness() {
  renderHarness();
  bindEvents();
  await renderEnrollmentState();
  await runPreflight();
  if (!isRealActionPopup() || !consumeAutomaticPromptIntent()) return;
  const state = await readHarnessEnrollmentState();
  if (!state.active) return;
  await runBusy(() => evaluateActiveCredential('automatic-assertion-succeeded'));
}

void startHarness();
