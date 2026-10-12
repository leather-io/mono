import { Suspense } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { QueryClientProvider } from '@tanstack/react-query';
import { PersistGate } from 'redux-persist/integration/react';

import { Tooltip } from '@leather.io/ui';

import '@leather.io/ui/styles';

import { queryClient } from '@app/common/persistence';
import { ThemeSwitcherProvider } from '@app/common/theme-provider';
import { FullPageLoadingSpinner } from '@app/components/loading-spinner';
import { Devtools } from '@app/features/devtool/devtools';
import { HeadProvider } from '@app/features/html-head/head-provider';
import { ToastsProvider } from '@app/features/toasts/toasts-provider';
import { AppRoutes } from '@app/routes/app-routes';
import { persistor, store } from '@app/store';

import './index.css';

import { TaprootUtxoWarningDialog } from './features/dialogs/taproot-utxo-warning-dialog/taproot-utxo-warning-dialog';
import { createLaunchDarklyProvider } from './features/feature-flags';
import { LeatherQueryProvider } from './query/leather-query-provider';
import { useCurrentNetwork } from './store/networks/networks.selectors';

const LDProvider = await createLaunchDarklyProvider();

const reactQueryDevToolsEnabled = process.env.REACT_QUERY_DEVTOOLS_ENABLED === 'true';

function ConnectedApp() {
  const network = useCurrentNetwork();

  return (
    <QueryClientProvider client={queryClient}>
      <LeatherQueryProvider client={queryClient} network={network}>
        <LDProvider>
          <Suspense fallback={<FullPageLoadingSpinner />}>
            <AppRoutes />
            <TaprootUtxoWarningDialog.Root />
            {reactQueryDevToolsEnabled && <Devtools />}
          </Suspense>
        </LDProvider>
      </LeatherQueryProvider>
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<FullPageLoadingSpinner />} persistor={persistor}>
        <HeadProvider />
        <ToastsProvider>
          <ThemeSwitcherProvider>
            <Tooltip.Provider>
              <ConnectedApp />
            </Tooltip.Provider>
          </ThemeSwitcherProvider>
        </ToastsProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
