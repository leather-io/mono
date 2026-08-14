import {
  type BlockchainActivityView,
  buildBlockchainActivityActionTitle,
  interpolateActivityTemplate,
} from '@leather.io/features';

interface ActivityActionLine {
  actionTitle: string;
  viaProtocol?: string;
}

export function getActivityActionLine(
  view: BlockchainActivityView
): ActivityActionLine | undefined {
  const actionTitle = buildBlockchainActivityActionTitle(view.action, interpolateActivityTemplate);
  if (!actionTitle) return undefined;
  return {
    actionTitle,
    ...(view.protocolName ? { viaProtocol: `via ${view.protocolName}` } : {}),
  };
}

export function formatActivityActionLine({ actionTitle, viaProtocol }: ActivityActionLine): string {
  return viaProtocol ? `${actionTitle} ${viaProtocol}` : actionTitle;
}
