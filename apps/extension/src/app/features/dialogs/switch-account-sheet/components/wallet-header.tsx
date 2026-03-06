import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { WalletType } from '@app/store/common/wallet-type.selectors';

import { WalletActionMenu } from './wallet-action-menu';

interface WalletHeaderProps {
  isManageMode: boolean;
  name: string;
  walletType: WalletType;
  canRemoveWallet: boolean;
  onRename(): void;
  onRemove(): void;
  onViewSecretKey(): void;
}

export function WalletHeader({
  isManageMode,
  name,
  walletType,
  canRemoveWallet,
  onRename,
  onRemove,
  onViewSecretKey,
}: WalletHeaderProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      px="space.05"
      py="space.00"
      width="100%"
    >
      <styled.span
        color="ink.text-primary"
        textStyle="label.01"
        data-testid={SwitchAccountSelectors.WalletHeaderName}
      >
        {name}
      </styled.span>
      {isManageMode && (
        <WalletActionMenu
          walletType={walletType}
          canRemoveWallet={canRemoveWallet}
          onRename={onRename}
          onRemove={onRemove}
          onViewSecretKey={onViewSecretKey}
        />
      )}
    </Flex>
  );
}
