import { Flex, styled } from 'leather-styles/jsx';

interface WalletHeaderProps {
  name: string;
}

export function WalletHeader({ name }: WalletHeaderProps) {
  return (
    <Flex alignItems="center" px="space.05" py="space.00" width="100%">
      <styled.span color="ink.text-primary" textStyle="label.01">
        {name}
      </styled.span>
    </Flex>
  );
}
