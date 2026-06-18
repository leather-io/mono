import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { Button } from '@leather.io/ui';

import { FeatureIntroducer } from '../feature-introducer';
import { useFeatureIntroducer } from '../use-feature-introducer';
import { MultiWalletIllustration } from './multi-wallet-illustration';

export function MultiWalletIntroducer() {
  const { shouldShow, markAsSeen } = useFeatureIntroducer('multi-wallet-support');

  if (!shouldShow) return null;

  function handleTryIt() {
    markAsSeen();
  }

  function handleClose() {
    markAsSeen();
  }

  return (
    <FeatureIntroducer.Root onClose={handleClose}>
      <FeatureIntroducer.Illustration>
        <MultiWalletIllustration />
      </FeatureIntroducer.Illustration>

      <FeatureIntroducer.Content>
        <FeatureIntroducer.Label>Introducing</FeatureIntroducer.Label>

        <FeatureIntroducer.Title>
          Multi wallet
          <br />
          support
        </FeatureIntroducer.Title>

        <FeatureIntroducer.Description>
          Create or restore wallets in seconds, keeping all your Bitcoin and Stacks accounts in one
          secure place.
        </FeatureIntroducer.Description>
      </FeatureIntroducer.Content>

      <FeatureIntroducer.Actions>
        <Button
          data-testid={SharedComponentsSelectors.FeatureIntroducerTryItOutBtn}
          onClick={handleTryIt}
        >
          Try it out
        </Button>
      </FeatureIntroducer.Actions>
    </FeatureIntroducer.Root>
  );
}
