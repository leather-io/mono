import { RefObject, createContext, forwardRef } from 'react';

import Inbox from '@/assets/inbox.svg';
import PaperPlane from '@/assets/paper-plane.svg';
import Plus from '@/assets/plus-icon.svg';
import Swap from '@/assets/swap.svg';
import { ActionBar, ActionBarMethods } from '@/components/action-bar';
import { APP_ROUTES } from '@/constants';
import { useWallets } from '@/state/wallets/wallets.slice';
import { Trans } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Text, TouchableOpacity } from '@leather.io/ui/native';
import { isEmptyArray } from '@leather.io/utils';

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

interface ActionBarButtonProps {
  onPress: () => void;
  icon: JSX.Element;
  label: string;
}
function ActionBarButton({ onPress, icon, label }: ActionBarButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      justifyContent="center"
      alignItems="center"
      flex={1}
      height="100%"
      flexDirection="row"
      gap="2"
    >
      {icon}
      <Text variant="label02">
        <Trans>{label}</Trans>
      </Text>
    </TouchableOpacity>
  );
}

export const ActionBarContainer = forwardRef<ActionBarMethods>((_, ref) => {
  const router = useRouter();
  const wallets = useWallets();

  if (isEmptyArray(wallets.list)) {
    return (
      <ActionBar
        ref={ref}
        center={
          <ActionBarButton
            onPress={() => router.navigate(APP_ROUTES.WalletCreateNewWallet)}
            icon={<Plus width={24} height={24} />}
            label="Add Wallet"
          />
        }
      />
    );
  }

  return (
    <ActionBar
      ref={ref}
      left={
        <ActionBarButton
          onPress={() => router.navigate(APP_ROUTES.WalletSend)}
          icon={<PaperPlane width={24} height={24} />}
          label="Send"
        />
      }
      center={
        <ActionBarButton
          onPress={() => router.navigate(APP_ROUTES.WalletReceive)}
          icon={<Inbox width={24} height={24} />}
          label="Receive"
        />
      }
      right={
        <ActionBarButton
          onPress={() => router.navigate(APP_ROUTES.WalletSwap)}
          icon={<Swap width={24} height={24} />}
          label="Swap"
        />
      }
    />
  );
});
