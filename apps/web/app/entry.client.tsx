import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import { persistor } from './store/store';

console.log('sldkjfslkdjfslkdjfslkdjf');

if (!persistor) throw new Error('persistor is not defined on client');

// Cannot use <PersistGate /> with SSR, so we manually hydrate app once store
// ready. This is needed to render content on server.
persistor.subscribe(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    );
  });
});
