import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { Button } from '@leather.io/ui';

import { isSidePanelSupported } from '@shared/utils/side-panel';

import { useToggleSidePanelMode } from '@app/store/settings/settings.actions';
import { useIsSidePanelModeEnabled } from '@app/store/settings/settings.selectors';

import { FeatureIntroducer } from '../feature-introducer';
import { useFeatureIntroducer } from '../use-feature-introducer';
import { SidePanelIllustration } from './side-panel-illustration';

export function SidePanelIntroducer() {
  const { shouldShow, markAsSeen } = useFeatureIntroducer('side-panel-mode');
  const isSidePanelModeEnabled = useIsSidePanelModeEnabled();
  const toggleSidePanelMode = useToggleSidePanelMode();

  if (!shouldShow || !isSidePanelSupported()) return null;

  function handleKeepSidebar() {
    markAsSeen();
  }

  function handleUsePopUp() {
    if (isSidePanelModeEnabled) toggleSidePanelMode();
    markAsSeen();
  }

  return (
    <FeatureIntroducer.Root onClose={handleKeepSidebar}>
      <FeatureIntroducer.Illustration>
        <SidePanelIllustration />
      </FeatureIntroducer.Illustration>

      <FeatureIntroducer.Content>
        <FeatureIntroducer.Label>Introducing</FeatureIntroducer.Label>

        <FeatureIntroducer.Title>
          Sidebar
          <br />
          mode
        </FeatureIntroducer.Title>

        <FeatureIntroducer.Description>
          Leather now opens beside the page instead of as a pop-up, so approvals stay in view while
          you browse. You can switch back any time in Settings.
        </FeatureIntroducer.Description>
      </FeatureIntroducer.Content>

      <FeatureIntroducer.Actions>
        <Button
          data-testid={SharedComponentsSelectors.FeatureIntroducerTryItOutBtn}
          onClick={handleKeepSidebar}
        >
          Try it out
        </Button>
        <Button variant="outline" onClick={handleUsePopUp}>
          Use pop-up instead
        </Button>
      </FeatureIntroducer.Actions>
    </FeatureIntroducer.Root>
  );
}
