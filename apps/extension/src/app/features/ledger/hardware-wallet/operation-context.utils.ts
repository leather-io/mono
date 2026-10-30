import type { HardwareWalletInteraction, OperationContext } from '@leather.io/ledger';

export function withInteractionHandler(
  ctx: OperationContext,
  onInteraction: (interaction: HardwareWalletInteraction) => void
): OperationContext {
  return {
    ...ctx,
    onInteraction(interaction) {
      ctx.onInteraction?.(interaction);
      onInteraction(interaction);
    },
  };
}
