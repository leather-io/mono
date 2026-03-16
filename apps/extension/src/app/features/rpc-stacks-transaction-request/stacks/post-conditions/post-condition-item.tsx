import { NonFungiblePostConditionWire, STXPostConditionWire } from '@stacks/transactions';
import { Box, Stack, styled } from 'leather-styles/jsx';

import { AssetAvatarIcon, ItemLayout, StxAvatarIcon } from '@leather.io/ui';

import { isValidUrl } from '@shared/utils/urls';

import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { formatPostConditionMessage } from './post-conditions.utils';

interface PostConditionItemProps {
  isContractPrincipal: boolean;
  isLast: boolean;
  postCondition: STXPostConditionWire | NonFungiblePostConditionWire;
}
export function PostConditionItem({
  isContractPrincipal,
  isLast,
  postCondition,
}: PostConditionItemProps) {
  const currentAccount = useCurrentStacksAccount();

  const { amount, contract, contractId, iconString, message, name, ticker, title } =
    formatPostConditionMessage({
      account: currentAccount,
      isContractPrincipal,
      postCondition,
    });

  const imageCanonicalUri = isValidUrl(iconString) ? iconString : undefined;

  const icon = contractId ? (
    <AssetAvatarIcon
      asset={{
        protocol: 'sip10',
        contractId,
        imageCanonicalUri: imageCanonicalUri ?? '',
        name,
      }}
      size="xl"
    />
  ) : (
    <StxAvatarIcon />
  );

  return (
    <Stack gap="space.03">
      <styled.span textStyle="label.03">{title}</styled.span>
      <ItemLayout
        img={icon}
        titleLeft={ticker}
        captionLeft={name}
        titleRight={amount}
        captionRight={contract}
      />
      {message && (
        <Box py="space.03" borderTop="default" borderBottom={!isLast ? 'active' : 'unset'}>
          <styled.span color="ink.text-subdued-primary" textStyle="caption.01">
            {message}
          </styled.span>
        </Box>
      )}
    </Stack>
  );
}
