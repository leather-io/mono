import { useSip10FtMetadata } from '@/queries/assets/sip10-asset.query';
import {
  NonFungiblePostConditionWire,
  PostConditionPrincipalId,
  addressToString,
} from '@stacks/transactions';

import { Approver, Box, Cell, CircledFunctionIcon, Sip10AvatarIcon } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { formatPostConditionMessage } from './post-conditions.utils';

interface NFTPostConditionProps {
  stacksAddress: string;
  postCondition: NonFungiblePostConditionWire;
}

export function NFTPostCondition({ stacksAddress, postCondition }: NFTPostConditionProps) {
  const contractAddress = addressToString(postCondition.asset.address);
  const contractName = postCondition.asset.contractName.content;
  const contractId = `${contractAddress}.${contractName}`;
  const assetName = postCondition.asset.assetName.content;
  const visibleAssetId = `${truncateMiddle(contractAddress, 4)}.${contractName}::${assetName}`;
  const asset = useSip10FtMetadata(contractId);
  const isContractPrincipal = postCondition.principal.prefix === PostConditionPrincipalId.Contract;
  const title = formatPostConditionMessage({
    stacksAddress,
    isContractPrincipal,
    postCondition,
  });

  if (!asset.data) return null;

  const icon = (
    <Sip10AvatarIcon
      variant="square"
      indicator
      name={asset.data.name}
      contractId={contractId}
      imageCanonicalUri={asset.data.imageCanonicalUri}
    />
  );

  return (
    <Box>
      <Approver.Subheader icon={<CircledFunctionIcon variant="small" />}>
        {title}
      </Approver.Subheader>

      <Cell.Root px="0" pressable={true}>
        <Cell.Icon>{icon}</Cell.Icon>
        <Cell.Content flexShrink={0}>
          <Cell.Label variant="primary" numberOfLines={1} ellipsizeMode="tail">
            {assetName}
          </Cell.Label>
        </Cell.Content>
        <Cell.Aside flexShrink={1}>
          <Cell.Label variant="secondary" ellipsizeMode="tail" numberOfLines={2} textAlign="right">
            {visibleAssetId}
          </Cell.Label>
        </Cell.Aside>
      </Cell.Root>
    </Box>
  );
}
