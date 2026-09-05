import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';

import { JSDOM } from 'jsdom';

import { RequestWalletAuthentication } from './request-wallet-authentication';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  analyticsTrack: vi.fn(),
  authenticateWithPassword: vi.fn(),
  consumeActionPopupPromptIntent: vi.fn(),
  isBiometricAutoPromptSuppressed: vi.fn(),
  suppressBiometricAutoPrompt: vi.fn(),
  unlockWalletWithBiometrics: vi.fn(),
}));

vi.mock('@leather.io/ui', () => ({
  Button({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?(): void;
  }) {
    return (
      <button disabled={disabled} onClick={onClick}>
        {children}
      </button>
    );
  },
  Input: {
    Root({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
    Label({ children }: { children: React.ReactNode }) {
      return <label>{children}</label>;
    },
    Field(props: React.ComponentProps<'input'>) {
      return <input {...props} />;
    },
  },
  Logo() {
    return <span>Leather</span>;
  },
}));

vi.mock('@app/components/layout', () => ({
  Card({
    children,
    footer,
    header,
  }: {
    children: React.ReactNode;
    footer: React.ReactNode;
    header: React.ReactNode;
  }) {
    return (
      <div>
        {header}
        {children}
        {footer}
      </div>
    );
  },
  Page({ children }: { children: React.ReactNode }) {
    return <main>{children}</main>;
  },
}));

vi.mock('@app/common/hooks/use-waiting-message', () => ({
  useWaitingMessage: () => [false, '', vi.fn(), vi.fn()],
}));

vi.mock('@app/common/hooks/use-modifier-key', () => ({
  buildEnterKeyEvent: () => undefined,
}));

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: mocks.analyticsTrack },
}));

vi.mock('@app/common/wallet-authentication/platform-authenticator', () => ({
  canUsePlatformAuthenticator: () => true,
}));

vi.mock('@app/common/wallet-authentication/action-popup-classifier', () => ({
  consumeActionPopupPromptIntent: mocks.consumeActionPopupPromptIntent,
}));

vi.mock('@app/common/wallet-authentication/biometric-auto-prompt', () => ({
  isBiometricAutoPromptSuppressed: mocks.isBiometricAutoPromptSuppressed,
  shouldSuppressBiometricAutoPrompt: (code: string) => code === 'credential-mismatch',
  suppressBiometricAutoPrompt: mocks.suppressBiometricAutoPrompt,
}));

vi.mock('./error-label', () => ({
  ErrorLabel({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  },
}));

interface TestCapabilities {
  authenticationMode: 'biometric-only' | 'password' | null;
  biometrics: boolean;
  password: boolean;
  valid: boolean;
}

const capabilities = vi.hoisted<{ value: TestCapabilities }>(() => ({
  value: {
    authenticationMode: 'password',
    biometrics: false,
    password: true,
    valid: true,
  },
}));

vi.mock('react-redux', () => ({
  useSelector: () => capabilities.value,
}));

vi.mock('@app/common/hooks/use-key-actions', () => ({
  useKeyActions: () => ({
    authenticateWalletWithPassword: mocks.authenticateWithPassword,
    unlockWalletWithBiometrics: mocks.unlockWalletWithBiometrics,
  }),
}));

const roots: Root[] = [];
const dom = new JSDOM('<!doctype html><html><body></body></html>');

function renderRequest(
  props: Partial<React.ComponentProps<typeof RequestWalletAuthentication>> = {}
) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  act(() => {
    root.render(
      <RequestWalletAuthentication
        title="Unlock Leather"
        caption="Confirm to continue."
        onSuccess={() => undefined}
        {...props}
      />
    );
  });
  return container;
}

function findButton(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    candidate => candidate.textContent === label
  );
  if (!button) throw new Error(`Button not found: ${label}`);
  return button;
}

function enterPassword(container: HTMLElement, password: string) {
  const input = container.querySelector('input');
  if (!input) throw new Error('Password input not found');
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, password);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe(RequestWalletAuthentication.name, () => {
  beforeAll(() => {
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);
    vi.stubGlobal('navigator', dom.window.navigator);
    vi.stubGlobal('HTMLElement', dom.window.HTMLElement);
    vi.stubGlobal('HTMLInputElement', dom.window.HTMLInputElement);
    vi.stubGlobal('Event', dom.window.Event);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    capabilities.value = {
      authenticationMode: 'password',
      biometrics: false,
      password: true,
      valid: true,
    };
    mocks.isBiometricAutoPromptSuppressed.mockResolvedValue(false);
  });

  afterEach(() => {
    act(() => {
      for (const root of roots.splice(0)) root.unmount();
    });
    document.body.replaceChildren();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test('renders only password controls for a password-only profile', async () => {
    const onSuccess = vi.fn();
    mocks.authenticateWithPassword.mockResolvedValue({ status: 'success', value: undefined });
    const container = renderRequest({ onSuccess });

    expect(container.textContent).not.toContain('Unlock with biometrics');

    enterPassword(container, 'password');
    await act(async () => {
      findButton(container, 'Continue').click();
      await Promise.resolve();
    });

    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('shows a typed state-change failure instead of calling it an invalid password', async () => {
    mocks.authenticateWithPassword.mockResolvedValue({
      status: 'failure',
      code: 'state-changed',
    });
    const container = renderRequest();

    enterPassword(container, 'password');
    await act(async () => {
      findButton(container, 'Continue').click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Wallet data changed. Try again.');
    expect(container.textContent).not.toContain('The password you entered is invalid');
  });

  test('renders only biometric controls for a biometric-only profile', async () => {
    capabilities.value = {
      authenticationMode: 'biometric-only',
      biometrics: true,
      password: false,
      valid: true,
    };
    const onSuccess = vi.fn();
    const onBiometricSubmit = vi.fn().mockResolvedValue({ status: 'success', value: undefined });
    const container = renderRequest({ onBiometricSubmit, onSuccess });

    expect(container.querySelector('input')).toBeNull();
    expect(container.textContent).not.toContain('Continue');

    await act(async () => {
      findButton(container, 'Unlock with biometrics').click();
      await Promise.resolve();
    });

    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('keeps biometric failure recovery and retry available without showing a password', async () => {
    capabilities.value = {
      authenticationMode: 'biometric-only',
      biometrics: true,
      password: false,
      valid: true,
    };
    const onBiometricSubmit = vi
      .fn()
      .mockResolvedValueOnce({ status: 'failure', code: 'credential-mismatch' })
      .mockResolvedValueOnce({ status: 'success', value: undefined });
    const onRecovery = vi.fn();
    const onSuccess = vi.fn();
    const container = renderRequest({
      onBiometricSubmit,
      onRecovery,
      onSuccess,
      recoveryLabel: "Can't use biometrics?",
    });

    await act(async () => {
      findButton(container, 'Unlock with biometrics').click();
      await Promise.resolve();
    });

    expect(container.querySelector('input')).toBeNull();
    expect(container.textContent).toContain('Biometric unlock could not be completed. Try again.');
    expect(findButton(container, 'Try biometric unlock again')).toBeTruthy();

    act(() => findButton(container, "Can't use biometrics?").click());
    expect(onRecovery).toHaveBeenCalledOnce();

    await act(async () => {
      findButton(container, 'Try biometric unlock again').click();
      await Promise.resolve();
    });

    expect(onBiometricSubmit).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('does not suppress future automatic prompts after an ambiguous exception', async () => {
    capabilities.value = {
      authenticationMode: 'biometric-only',
      biometrics: true,
      password: false,
      valid: true,
    };
    mocks.consumeActionPopupPromptIntent.mockReturnValue(true);
    const onBiometricSubmit = vi.fn().mockRejectedValue(new Error('ambiguous failure'));

    renderRequest({ automaticPromptOnActionPopup: true, onBiometricSubmit });

    await act(async () => {
      await Promise.resolve();
    });

    expect(onBiometricSubmit).toHaveBeenCalledOnce();
    expect(mocks.suppressBiometricAutoPrompt).not.toHaveBeenCalled();
  });

  test('does not render either factor for an invalid dual-capability state', () => {
    capabilities.value = {
      authenticationMode: 'password',
      biometrics: true,
      password: true,
      valid: true,
    };

    const container = renderRequest();

    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  test('renders no authentication controls for inconsistent state', () => {
    capabilities.value = {
      authenticationMode: null,
      biometrics: false,
      password: false,
      valid: false,
    };

    const container = renderRequest();

    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
