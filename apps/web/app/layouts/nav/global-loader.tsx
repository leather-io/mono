import { useEffect } from 'react';
import { useNavigation } from 'react-router';

import NProgress from 'nprogress';

import { useOnMount } from '@leather.io/ui';

const config = {
  color: '#000',
  minimum: 0.1,
  showSpinner: false,
  easing: 'linear',
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
};

export function GlobalLoader() {
  const navigation = useNavigation();

  useEffect(() => {
    let timeOut: ReturnType<typeof setTimeout> | null = null;

    if (navigation.state !== 'idle') {
      timeOut = setTimeout(() => NProgress.start(), 280);
    } else if (navigation.state === 'idle') {
      if (timeOut) clearTimeout(timeOut);
      NProgress.done();
    }

    return () => {
      if (timeOut) clearTimeout(timeOut);
    };
  }, [navigation.state]);

  useOnMount(() => void NProgress.configure(config));

  return null;
}
