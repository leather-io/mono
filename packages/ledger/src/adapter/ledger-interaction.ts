import { UserInteractionRequired } from '@ledgerhq/device-management-kit';

import type { HardwareWalletInteraction } from '../contract/hardware-wallet-interaction';

const unlockDeviceInteraction: string = UserInteractionRequired.UnlockDevice;
const confirmOpenAppInteraction: string = UserInteractionRequired.ConfirmOpenApp;
const registerWalletInteraction: string = UserInteractionRequired.RegisterWallet;
const verifyAddressInteraction: string = UserInteractionRequired.VerifyAddress;
const confirmOnDeviceInteractions: readonly string[] = [
  UserInteractionRequired.SignTransaction,
  UserInteractionRequired.SignPersonalMessage,
  UserInteractionRequired.SignTypedData,
];

export function toHardwareWalletInteraction(
  interaction: string,
  appName: string | null
): HardwareWalletInteraction {
  if (interaction === unlockDeviceInteraction) return { type: 'unlock-device' };
  if (interaction === confirmOpenAppInteraction) return { type: 'open-app', appName };
  if (interaction === registerWalletInteraction) return { type: 'approve-policy' };
  if (interaction === verifyAddressInteraction) return { type: 'verify-address' };
  if (confirmOnDeviceInteractions.includes(interaction)) return { type: 'confirm-on-device' };
  return { type: 'none' };
}

export function makeInteractionForwarder(
  ctx: { onInteraction?(interaction: HardwareWalletInteraction): void },
  appName: string | null = null
) {
  return (interaction: string) => {
    ctx.onInteraction?.(toHardwareWalletInteraction(interaction, appName));
  };
}
