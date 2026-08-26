import {
  PostConditionPrincipalId,
  type PoxPostConditionWire,
  addressToString,
} from '@stacks/transactions';
import { Box, Stack, styled } from 'leather-styles/jsx';

import { ItemLayout, StxAvatarIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import {
  getPoxConditionCodeMessage,
  getPoxConditionTitle,
} from '@app/common/transactions/stacks/post-condition.utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

interface PoxPostConditionItemProps {
  isContractPrincipal: boolean;
  isLast: boolean;
  postCondition: PoxPostConditionWire;
}
export function PoxPostConditionItem({
  isContractPrincipal,
  isLast,
  postCondition: pc,
}: PoxPostConditionItemProps) {
  const currentAccount = useCurrentStacksAccount();

  const address = 'address' in pc.principal ? addressToString(pc.principal.address) : '';
  const contractName = 'contractName' in pc.principal ? pc.principal.contractName.content : '';
  const isOriginPrincipal = pc.principal.prefix === PostConditionPrincipalId.Origin;
  const isSending = isOriginPrincipal || address === currentAccount?.address;

  function getPrincipalPrefix() {
    if (isContractPrincipal) return 'The contract ';
    if (isSending) return 'You ';
    return 'Another address ';
  }

  const title = `${getPrincipalPrefix()} ${getPoxConditionTitle(pc.conditionCode)}`;
  const message = `${getPoxConditionCodeMessage(
    pc.conditionCode,
    isSending
  )} or the transaction will abort.`;
  const contract = `${truncateMiddle(address, 4)}${contractName ? `.${contractName}` : ''}`;

  return (
    <Stack gap="space.03">
      <styled.span textStyle="label.03">{title}</styled.span>
      <ItemLayout
        img={<StxAvatarIcon />}
        titleLeft="STX"
        captionLeft="Stacking"
        captionRight={contract}
      />
      <Box py="space.03" borderTop="default" borderBottom={!isLast ? 'active' : 'unset'}>
        <styled.span color="ink.text-subdued" textStyle="caption.01">
          {message}
        </styled.span>
      </Box>
    </Stack>
  );
}
