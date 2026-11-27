import { useQuery } from '@tanstack/react-query';

import { createOnramperWidgetSignatureQueryConfig } from '@leather.io/queries';

export function useOnramperWidgetSignatureQuery(params: Record<string, string>) {
  return useQuery(createOnramperWidgetSignatureQueryConfig(params));
}
