import { assertContractCallPayload } from '@/features/approver/utils';
import { useApps } from '@/store/apps/apps.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { destructAccountIdentifier } from '@/store/utils';
import { PostConditionType, deserializeTransaction } from '@stacks/transactions';

import { Approver } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

import { FTPostCondition } from './components/post-conditions/ft-post-condition';
import { NFTPostCondition } from './components/post-conditions/nft-post-condition';
import { StxPostCondition } from './components/post-conditions/stx-post-condition';

export function ContractCallPostConditionsSection({
  txHex,
  origin,
}: {
  txHex: string;
  origin?: string;
}) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);
  const { fromOrigin } = useApps();

  const { currentAccount } = useSettings();
  const app = fromOrigin(origin);
  const accountId =
    app && app.status === 'connected' ? destructAccountIdentifier(app.accountId) : currentAccount;

  assertExistence(accountId, 'AccountId should be present during contract call');
  const stacksAddress = useStacksSignerAddressFromAccountIndex(
    accountId.fingerprint,
    accountId.accountIndex
  );
  assertExistence(stacksAddress, 'Stacks address should be present during contract call');

  return (
    <Approver.Section>
      {tx.postConditions.values.map(pc => {
        if (pc.conditionType === PostConditionType.Fungible) {
          return (
            <FTPostCondition
              key={pc.amount + pc.asset.assetName.content}
              stacksAddress={stacksAddress}
              postCondition={pc}
            />
          );
        }

        if (pc.conditionType === PostConditionType.NonFungible) {
          return (
            <NFTPostCondition
              key={pc.asset.assetName.content}
              stacksAddress={stacksAddress}
              postCondition={pc}
            />
          );
        }
        return (
          <StxPostCondition
            key={pc.amount + 'STX'}
            stacksAddress={stacksAddress}
            postCondition={pc}
          />
        );
      })}
    </Approver.Section>
  );
}
