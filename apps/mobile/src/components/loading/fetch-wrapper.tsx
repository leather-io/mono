import { Error } from '@/components/error/error';
import { FetchState } from '@/components/loading/fetch-state';
import { Loading } from '@/components/loading/loading';

import { assertUnreachable } from '@leather.io/utils';

interface FetchWrapperProps {
  data: FetchState<unknown>;
  loader?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}
export function FetchWrapper({ data, loader, error, children }: FetchWrapperProps) {
  return (
    <>
      {(() => {
        switch (data.state) {
          case 'loading':
            return loader ?? <Loading />;
          case 'error':
            return error ?? <Error />;
          case 'success':
            return <>{children}</>;
          default:
            return assertUnreachable(data);
        }
      })()}
    </>
  );
}
