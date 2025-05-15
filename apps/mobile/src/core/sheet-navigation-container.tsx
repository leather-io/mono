import { useRef } from 'react';

import { ToastWrapper } from '@/components/toast/toast-context';
import { analytics } from '@/utils/analytics';
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { HasChildren } from '@leather.io/ui/native';

export function SheetNavigationContainer({ children }: HasChildren) {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>(undefined);

  return (
    <ToastWrapper>
      <NavigationIndependentTree>
        <NavigationContainer
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

            if (previousRouteName !== currentRouteName) {
              // Replace the line below to add the tracker from a mobile analytics SDK
              if (currentRouteName) {
                await analytics?.screen(currentRouteName);
              }
            }

            // Save the current route name for later comparison
            routeNameRef.current = currentRouteName;
          }}
        >
          {children}
        </NavigationContainer>
      </NavigationIndependentTree>
    </ToastWrapper>
  );
}
