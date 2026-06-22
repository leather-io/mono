import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { noop } from '@leather.io/utils';

import { getLedgerAccountIndicator } from '@app/components/account/ledger-account-indicator';
import { WalletType } from '@app/store/common/wallet-type.selectors';

import { accountActionMenuTriggerSize } from '../switch-account-sheet.utils';
import { WalletActionMenu } from './wallet-action-menu';

interface WalletHeaderProps {
  isManageMode: boolean;
  name: string;
  walletType: WalletType;
  canRemoveWallet?: boolean;
  onRename?(): void;
  onRemove?(): void;
  onViewSecretKey?(): void;
}

export function WalletHeader({
  isManageMode,
  name,
  walletType,
  canRemoveWallet = false,
  onRename = noop,
  onRemove = noop,
  onViewSecretKey = noop,
}: WalletHeaderProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      minHeight={accountActionMenuTriggerSize}
      pl="space.05"
      pr="space.04"
      py="space.00"
      width="100%"
    >
      <Flex alignItems="center" gap="space.02" flex={1} minWidth={0} overflow="hidden">
        <styled.span
          color="ink.text-primary"
          textStyle="label.01"
          minWidth={0}
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          data-testid={SwitchAccountSelectors.WalletHeaderName}
        >
          {name}
        </styled.span>
        {getLedgerAccountIndicator(walletType, SwitchAccountSelectors.WalletHeaderLedgerIndicator)}
      </Flex>
      {isManageMode ? (
        <WalletActionMenu
          walletType={walletType}
          canRemoveWallet={canRemoveWallet}
          onRename={onRename}
          onRemove={onRemove}
          onViewSecretKey={onViewSecretKey}
        />
      ) : (
        <Box flexShrink={0} width={accountActionMenuTriggerSize} aria-hidden />
      )}
    </Flex>
  );
}
