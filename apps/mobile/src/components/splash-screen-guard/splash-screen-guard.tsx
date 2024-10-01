import { useState } from 'react';

import { HasChildren } from '@/utils/types';

import { Box } from '@leather.io/ui/native';

import { LeatherSplash } from '../animations/leather-splash';

const DEFAULT_ANIMATION_FINISHED = __DEV__;

export function SplashScreenGuard({ children }: HasChildren) {
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
