import { Flex, styled } from 'leather-styles/jsx';

import { WalletActionMenu } from './wallet-action-menu';

interface WalletHeaderProps {
  isManageMode: boolean;
  name: string;
  onRename(): void;
}

export function WalletHeader({ isManageMode, name, onRename }: WalletHeaderProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      px="space.05"
      py="space.00"
      width="100%"
    >
      <styled.span color="ink.text-primary" textStyle="label.01">
        {name}
      </styled.span>
      {isManageMode && <WalletActionMenu onRename={onRename} />}
    </Flex>
  );
}
