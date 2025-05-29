import { useRef } from 'react';

import { ToastWrapper } from '@/components/toast/toast-context';
import { analytics } from '@/utils/analytics';
import {
  NavigationContainer,
  type NavigationContainerProps,
  NavigationIndependentTree,
  useNavigationContainerRef,
} from '@react-navigation/native';

interface SheetNavigationContainerProps extends NavigationContainerProps {
  base: string;
}

export function SheetNavigationContainer({ base, ...props }: SheetNavigationContainerProps) {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>(undefined);

  return (
    <ToastWrapper>
      <NavigationIndependentTree>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

            if (previousRouteName !== currentRouteName) {
              // Replace the line below to add the tracker from a mobile analytics SDK
              if (currentRouteName) {
                await analytics?.screen(`${base}/${currentRouteName}`);
              }
            }

            // Save the current route name for later comparison
            routeNameRef.current = currentRouteName;
          }}
          {...props}
        />
      </NavigationIndependentTree>
    </ToastWrapper>
  );
}
