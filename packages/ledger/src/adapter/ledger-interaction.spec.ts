import { UserInteractionRequired } from '@ledgerhq/device-management-kit';

import { makeInteractionForwarder, toHardwareWalletInteraction } from './ledger-interaction';

describe(toHardwareWalletInteraction.name, () => {
  test.each([
    [UserInteractionRequired.UnlockDevice, { type: 'unlock-device' }],
    [UserInteractionRequired.ConfirmOpenApp, { type: 'open-app', appName: 'Bitcoin' }],
    [UserInteractionRequired.RegisterWallet, { type: 'approve-policy' }],
    [UserInteractionRequired.VerifyAddress, { type: 'verify-address' }],
    [UserInteractionRequired.SignTransaction, { type: 'confirm-on-device' }],
    [UserInteractionRequired.SignPersonalMessage, { type: 'confirm-on-device' }],
    [UserInteractionRequired.None, { type: 'none' }],
    ['something-new', { type: 'none' }],
  ])('maps %s', (interaction, expected) => {
    expect(toHardwareWalletInteraction(interaction, 'Bitcoin')).toEqual(expected);
  });
});

describe(makeInteractionForwarder.name, () => {
  test('forwards mapped interactions to the context', () => {
    const onInteraction = vi.fn();

    makeInteractionForwarder({ onInteraction }, 'Stacks')(UserInteractionRequired.ConfirmOpenApp);

    expect(onInteraction).toHaveBeenCalledWith({ type: 'open-app', appName: 'Stacks' });
  });

  test('is a no-op without a listener', () => {
    expect(() => makeInteractionForwarder({})(UserInteractionRequired.UnlockDevice)).not.toThrow();
  });
});
