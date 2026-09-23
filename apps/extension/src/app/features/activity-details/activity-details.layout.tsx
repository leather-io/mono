import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import type { BlockchainActivityItem } from '@leather.io/features';
import type { AccountAddresses, CryptoAssetChain, Money } from '@leather.io/models';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useStacksExplorerLink } from '@app/common/hooks/use-stacks-explorer-link';
import { DetailsScreen } from '@app/components/details/details-screen';
import { Divider } from '@app/components/layout/divider';
import { CurrentAccountAvatar } from '@app/features/current-account/current-account-avatar';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import type { SbtcDepositOverlay } from '../activity-list/sbtc-deposit-overlay';
import { ActivityDetailsActions } from './activity-details-actions';
import { ActivityDetailsHeader } from './activity-details-header';
import { ActivityDetailsOverview } from './activity-details-overview';
import {
  type ActivityDetailsSummary,
  buildActivityDetailsSummary,
} from './activity-details-summary';
import { ActivityDetailsTable } from './activity-details-table';
import { ActivityAccountCluster } from './components/activity-account-cluster';
import { ActivityContractCluster } from './components/activity-contract-cluster';
import { ActivityExplorerLink } from './components/activity-explorer-link';
import { useOpenActivityInExplorer } from './use-open-activity-in-explorer';

const slowConfirmationThresholdSeconds = 30 * 60;

const slowConfirmationNote =
  'Your transaction is taking longer than usual. Increasing the fee can speed up confirmation.';

function isConfirmationSlow(summary: ActivityDetailsSummary, timestamp: number) {
  if (summary.status.tone !== 'warning' || timestamp <= 0) return false;
  return Date.now() / 1000 - timestamp > slowConfirmationThresholdSeconds;
}

function resolveAccountAddress(addresses: AccountAddresses, chain: CryptoAssetChain) {
  if (chain === 'stacks') return addresses.stacks?.stxAddress ?? '';
  const { bitcoin } = addresses;
  if (!bitcoin) return '';
  if (bitcoin.type === 'fixedAddress') return bitcoin.address;
  return bitcoin.zeroIndexNativeSegwitPayerAddress ?? '';
}

interface ActivityDetailsAccountProps {
  chain: CryptoAssetChain;
}

function ActivityDetailsAccount({ chain }: ActivityDetailsAccountProps) {
  const addresses = useCurrentAccountAddresses();
  const { data: name } = useCurrentAccountDisplayName();
  const address = resolveAccountAddress(addresses, chain);
  if (!address) return null;
  return <ActivityAccountCluster avatar={<CurrentAccountAvatar />} name={name} address={address} />;
}

interface ActivityDetailsLayoutProps {
  item: BlockchainActivityItem;
  overlay?: SbtcDepositOverlay;
  feeQuote?: Money;
  onBack(): void;
}

export function ActivityDetailsLayout({
  item,
  overlay,
  feeQuote,
  onBack,
}: ActivityDetailsLayoutProps) {
  const { activity, view } = item;
  const { getStacksAddressLink } = useStacksExplorerLink();
  const openInExplorer = useOpenActivityInExplorer();
  const network = useCurrentNetwork();
  const { contract } = activity;
  const summary = buildActivityDetailsSummary(item, overlay);
  const chainLabel = view.chain === 'bitcoin' ? 'Bitcoin' : 'Stacks';

  return (
    <DetailsScreen
      header={<ActivityDetailsHeader onBack={onBack} />}
      testId={ActivitySelectors.ActivityDetails}
      surface="flat"
      footer={<ActivityExplorerLink onOpen={() => openInExplorer(view.chain, view.txid)} />}
      overview={
        <ActivityDetailsOverview
          summary={summary}
          note={isConfirmationSlow(summary, view.timestamp) ? slowConfirmationNote : undefined}
          actions={<ActivityDetailsActions item={item} reclaimUrl={overlay?.reclaimUrl} />}
          contract={
            contract?.type === 'deploy' ? (
              <ActivityContractCluster contractId={contract.contractId} />
            ) : undefined
          }
          account={<ActivityDetailsAccount chain={view.chain} />}
        />
      }
    >
      <Divider />

      <ActivityDetailsTable
        item={item}
        networkLabel={`${chainLabel} ${network.chain.bitcoin.mode}`}
        feeQuote={feeQuote}
        contractHref={contract ? getStacksAddressLink(contract.contractId) : undefined}
      />
    </DetailsScreen>
  );
}
