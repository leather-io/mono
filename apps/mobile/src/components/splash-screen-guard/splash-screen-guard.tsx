import { useState } from 'react';

import { Box } from '@leather.io/ui/native';

import { LeatherSplash } from '../animations/leather-splash';

interface SplashScreenGuardProps {
  children: React.ReactNode;
}

const DEFAULT_ANIMATION_FINISHED = __DEV__;

export function SplashScreenGuard({ children }: SplashScreenGuardProps) {
  const [animationFinished, setAnimationFinished] = useState(DEFAULT_ANIMATION_FINISHED);

  if (!animationFinished) {
    return (
      <Box backgroundColor="ink.component-background-default" flex={1}>
        <LeatherSplash onAnimationEnd={() => setAnimationFinished(true)} />
      </Box>
    );
  }

  return children;
}
