import { Circle, CircleProps, Flex } from 'leather-styles/jsx';

import { ArrowDownIcon, ArrowUpIcon } from '@leather.io/ui';

function TxStatusIcon({ isTxInbound }: { isTxInbound: boolean }) {
  if (isTxInbound) return <ArrowDownIcon color="ink.background-primary" variant="small" />;
  return <ArrowUpIcon color="ink.background-primary" variant="small" />;
}

interface TransactionIconProps extends CircleProps {
  isTxConfirmed: boolean;
  isTxInbound: boolean;
  icon: React.ReactNode;
}
export function BitcoinTransactionIcon({
  isTxConfirmed,
  isTxInbound,
  icon,
  ...props
}: TransactionIconProps) {
  return (
    <Flex position="relative">
      {icon}
      <Circle
        bottom="-2px"
        right="-9px"
        position="absolute"
        size="21px"
        bg={isTxConfirmed ? 'stacks' : 'yellow.action-primary-default'}
        color="ink.background-primary"
        border="background"
        {...props}
      >
        <TxStatusIcon isTxInbound={isTxInbound} />
      </Circle>
    </Flex>
  );
}
