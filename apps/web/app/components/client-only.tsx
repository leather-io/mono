import { useState } from 'react';

import { type HasChildren, useOnMount } from '@leather.io/ui';

interface WhenClientProps extends HasChildren {
  fallback?: React.ReactNode;
}
export function WhenClient({ children, fallback = null }: WhenClientProps) {
  const [loaded, setLoaded] = useState(false);
  useOnMount(() => setLoaded(true));
  return loaded ? children : fallback;
}
