import { useFormContext } from 'react-hook-form';

import { type FrontSupportMessageData } from '~/utils/support/front-app-integration';

export function useSupportForm() {
  return useFormContext<FrontSupportMessageData>();
}
