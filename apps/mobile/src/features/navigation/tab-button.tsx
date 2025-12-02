import { ReactNode } from 'react';

import { usePathname, useRouter } from 'expo-router';
import { TabTriggerSlotProps, useTabTrigger } from 'expo-router/ui';

import { Pressable, Text } from '@leather.io/ui/native';

import { useTabLayoutContext } from './tab-layout-context';

interface TabButtonProps extends Omit<TabTriggerSlotProps, 'ref'> {
  title: string;
  activeIcon: ReactNode;
  defaultIcon: ReactNode;
  name: string;
}

export function TabButton({ title, activeIcon, defaultIcon, isFocused, ...props }: TabButtonProps) {
  const { switchTab } = useTabTrigger({ name: props.name });
  const pathname = usePathname();
  const router = useRouter();
  const { scrollToTop } = useTabLayoutContext();

  function handlePress() {
    if (!isFocused) {
      switchTab(props.name, {});
      return;
    }

    if (isNestedRoute(pathname, props.name)) {
      router.dismissTo('/(tabs)/(index)');
      return;
    }

    scrollToTop(props.name);
  }

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      justifyContent="center"
      alignItems="center"
      gap="1"
      paddingBottom="2"
      paddingTop="3"
    >
      {isFocused ? activeIcon : defaultIcon}
      <Text variant="label03">{title}</Text>
    </Pressable>
  );
}

function isNestedRoute(pathname: string, tabName: string): boolean {
  if (tabName !== '(index)') return false;
  return pathname !== '/' && pathname.startsWith('/');
}
