import { useMarkFeatureAsSeen } from '@app/store/settings/settings.actions';
import { useHasSeenFeature } from '@app/store/settings/settings.selectors';

export function useFeatureIntroducer(featureId: string) {
  const hasSeen = useHasSeenFeature(featureId);
  const markAsSeen = useMarkFeatureAsSeen();

  return {
    shouldShow: !hasSeen,
    markAsSeen: () => markAsSeen(featureId),
  };
}
