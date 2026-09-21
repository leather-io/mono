import type { BlockchainActivityItem } from '@leather.io/features';
import type { Money } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { DetailsCopyValue } from '@app/components/details/details-copy-value';
import { DetailsLinkValue } from '@app/components/details/details-link-value';
import { DetailsRow } from '@app/components/details/details-row';
import { DetailsSection } from '@app/components/details/details-section';

import { formatActivityDateTime } from './activity-details-summary';

function splitContractId(contractId: string) {
  const [address, name] = contractId.split('.');
  return { address: address ?? contractId, ...(name ? { name } : {}) };
}

function formatContractId(contractId: string) {
  const { address, name } = splitContractId(contractId);
  return name ? `${truncateMiddle(address)}.${name}` : truncateMiddle(contractId);
}

function formatFee(fee: Money, quote?: Money) {
  return quote ? `${formatCurrency(fee)} · ${formatCurrency(quote)}` : formatCurrency(fee);
}

interface ActivityDetailsTableProps {
  item: BlockchainActivityItem;
  networkLabel: string;
  feeQuote?: Money;
  contractHref?: string;
}

export function ActivityDetailsTable({
  item,
  networkLabel,
  feeQuote,
  contractHref,
}: ActivityDetailsTableProps) {
  const { activity, view } = item;
  const { contract } = activity;

  return (
    <DetailsSection>
      {activity.fee ? <DetailsRow label="Fee" value={formatFee(activity.fee, feeQuote)} /> : null}
      {view.timestamp > 0 ? (
        <DetailsRow label="Date" value={formatActivityDateTime(view.timestamp)} />
      ) : null}
      <DetailsRow label="Network" value={networkLabel} />
      {activity.protocolName ? <DetailsRow label="Protocol" value={activity.protocolName} /> : null}
      {contract && contractHref ? (
        <DetailsRow
          label="Contract"
          value={
            <DetailsLinkValue href={contractHref}>
              {formatContractId(contract.contractId)}
            </DetailsLinkValue>
          }
        />
      ) : null}
      {contract?.type === 'call' ? (
        <DetailsRow label="Function" value={contract.functionName} />
      ) : null}
      {view.chain === 'stacks' && activity.nonce !== undefined ? (
        <DetailsRow label="Nonce" value={String(activity.nonce)} />
      ) : null}
      {activity.blockHeight !== undefined ? (
        <DetailsRow label="Block" value={activity.blockHeight.toLocaleString()} />
      ) : null}
      <DetailsRow label="Ref ID" value={<DetailsCopyValue value={view.txid} />} />
    </DetailsSection>
  );
}
