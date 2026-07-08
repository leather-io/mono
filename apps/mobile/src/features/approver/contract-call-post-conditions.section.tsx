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
import { PoxPostCondition } from './components/post-conditions/pox-post-condition';
import { StakingPostCondition } from './components/post-conditions/staking-post-condition';
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
      {tx.postConditions.values.map((pc, index) => {
        if (pc.conditionType === PostConditionType.Fungible) {
          return (
            <FTPostCondition key={`ft-${index}`} stacksAddress={stacksAddress} postCondition={pc} />
          );
        }

        if (pc.conditionType === PostConditionType.NonFungible) {
          return (
            <NFTPostCondition
              key={`nft-${index}`}
              stacksAddress={stacksAddress}
              postCondition={pc}
            />
          );
        }

        if (pc.conditionType === PostConditionType.Staking) {
          return (
            <StakingPostCondition
              key={`staking-${index}`}
              stacksAddress={stacksAddress}
              postCondition={pc}
            />
          );
        }

        if (pc.conditionType === PostConditionType.PoX) {
          return (
            <PoxPostCondition
              key={`pox-${index}`}
              stacksAddress={stacksAddress}
              postCondition={pc}
            />
          );
        }
        return (
          <StxPostCondition key={`stx-${index}`} stacksAddress={stacksAddress} postCondition={pc} />
        );
      })}
    </Approver.Section>
  );
}
