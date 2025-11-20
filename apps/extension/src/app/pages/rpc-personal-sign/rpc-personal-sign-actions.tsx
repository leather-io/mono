import { HStack } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { useWalletType } from '@app/common/use-wallet-type';

interface RpcPersonalSignActionsProps {
  isLoading: boolean;
  onApprove(): void;
  onCancel(): void;
}

export function RpcPersonalSignActions({
  isLoading,
  onApprove,
  onCancel,
}: RpcPersonalSignActionsProps) {
  const { whenWallet } = useWalletType();

  return (
    <HStack gap="space.04">
      <Button onClick={onCancel} variant="outline" width="50%">
        Cancel
      </Button>
      <Button aria-busy={isLoading} onClick={onApprove} width="50%">
        {whenWallet({ software: 'Sign', ledger: 'Sign on Ledger' })}
      </Button>
    </HStack>
  );
}
