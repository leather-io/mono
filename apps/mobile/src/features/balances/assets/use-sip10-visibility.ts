import { resolveSip10Visibility } from '@/features/balances/assets/utils/sip10-visibility';
import { useSettings } from '@/store/settings/settings';

export function useSip10Visibility() {
  const { assetVisibility } = useSettings();
  return {
    isVisible(assetId: string) {
      return resolveSip10Visibility(assetVisibility, assetId);
    },
  };
}
