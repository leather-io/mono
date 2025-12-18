import { Box, BoxProps } from 'leather-styles/jsx';

import { StacksTx } from '@leather.io/models';
import {
  AssetAvatarIcon,
  Avatar,
  BarsThreeIcon,
  ErrorCircleIcon,
  getAvatarUrl,
} from '@leather.io/ui';

import { TransactionTypeIcon } from '../transaction/transaction-type-icon';

interface TransactionIconProps extends BoxProps {
  transaction: StacksTx;
}
export function StacksTransactionIcon({ transaction, ...rest }: TransactionIconProps) {
  switch (transaction.tx_type) {
    case 'coinbase':
      return (
        <Box position="relative" flexShrink={0} {...rest}>
          <Avatar
            size="xl"
            bg="stacks"
            color="ink.background-primary"
            outlineColor="ink.border-transparent"
            icon={<BarsThreeIcon />}
          />
          <TransactionTypeIcon transaction={transaction} />
        </Box>
      );
    case 'smart_contract':
      return (
        <Box position="relative" {...rest}>
          <Avatar image={getAvatarUrl(`${transaction.smart_contract.contract_id}`)} size="xl" />
          <TransactionTypeIcon transaction={transaction} />
        </Box>
      );
    case 'contract_call':
      return (
        <Box position="relative" {...rest}>
          <Avatar
            image={getAvatarUrl(
              `${transaction.contract_call.contract_id}::${transaction.contract_call.function_name}`
            )}
            size="xl"
          />
          <TransactionTypeIcon transaction={transaction} />
        </Box>
      );
    case 'token_transfer':
      return (
        <Box position="relative" flexShrink={0} {...rest}>
          <AssetAvatarIcon asset={{ protocol: 'nativeStx' }} size="xl" />
          <TransactionTypeIcon transaction={transaction} />
        </Box>
      );
    case 'poison_microblock':
      return (
        <Box position="relative" flexShrink={0} {...rest}>
          <Avatar
            size="xl"
            bg="stacks"
            color="ink.background-primary"
            outlineColor="ink.border-transparent"
            icon={<ErrorCircleIcon />}
          />
          <TransactionTypeIcon transaction={transaction} />
        </Box>
      );
    default:
      return null;
  }
}
