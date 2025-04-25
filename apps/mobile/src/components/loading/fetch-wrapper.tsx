import { Error, FetchState, Loading } from '@/components/loading';

import { assertUnreachable } from '@leather.io/utils';

interface FetchWrapperProps {
  data: FetchState<any>;
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
            return error ?? <Error errorMessage={data.errorMessage} />;
          case 'success':
            return <>{children}</>;
          default:
            return assertUnreachable(data);
        }
      })()}
    </>
  );
}
