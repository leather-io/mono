import { useRef } from 'react';

import { ToastWrapper } from '@/components/toast/toast-context';
import { useAnalytics } from '@/utils/analytics';
import { HasChildren } from '@/utils/types';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';

export function SheetNavigationContainer({ children }: HasChildren) {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>();
  const analytics = useAnalytics();
  return (
    <ToastWrapper>
      <NavigationContainer
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

          if (previousRouteName !== currentRouteName) {
            // Replace the line below to add the tracker from a mobile analytics SDK
            if (currentRouteName) {
              await analytics.screen(currentRouteName);
            }
          }

          // Save the current route name for later comparison
          routeNameRef.current = currentRouteName;
        }}
        independent
      >
        {children}
      </NavigationContainer>
    </ToastWrapper>
  );
}
