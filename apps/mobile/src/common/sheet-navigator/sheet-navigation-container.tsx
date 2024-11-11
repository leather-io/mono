import { ToastWrapper } from '@/components/toast/toast-context';
import { HasChildren } from '@/utils/types';
import { NavigationContainer } from '@react-navigation/native';

export function SheetNavigationContainer({ children }: HasChildren) {
  return (
    <ToastWrapper>
      <NavigationContainer independent>{children}</NavigationContainer>
    </ToastWrapper>
  );
}
