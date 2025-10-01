import { assertContractCallPayload } from '@/features/approver/utils';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { PostConditionType, deserializeTransaction } from '@stacks/transactions';

import { Approver } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

import { FTPostCondition } from './components/post-conditions/ft-post-condition';
import { NFTPostCondition } from './components/post-conditions/nft-post-condition';
import { StxPostCondition } from './components/post-conditions/stx-post-condition';

export function ContractCallPostConditionsSection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  const { currentAccount } = useSettings();
  assertExistence(currentAccount, 'Current account should be present during contract call');
  const stacksAddress = useStacksSignerAddressFromAccountIndex(
    currentAccount?.fingerprint,
    currentAccount?.accountIndex
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
