import { useMemo, useState } from 'react';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, Stack } from 'leather-styles/jsx';

import { Button, CopyIcon, Eye1ClosedIcon, Eye1Icon } from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';

import { SecretKeyGrid } from './secret-key-grid';
import { SecretKeyWord } from './secret-key-word';

interface SecretKeyProps {
  secretKey: string;
  onDone(): void;
}
export function SecretKey({ secretKey, onDone }: SecretKeyProps) {
  const { onCopy, hasCopied } = useClipboard(secretKey || '');
  const [showSecretKey, setShowSecretKey] = useState(false);

  function copyToClipboard() {
    analytics.track('copy_secret_key_to_clipboard');
    onCopy();
  }

  const secretKeyWords = useMemo(() => secretKey?.split(' '), [secretKey]);

  const onCopyToClipboard = copyToClipboard;

  return (
    <Stack gap="space.05">
      <SecretKeyGrid>
        {secretKeyWords?.map((word, index) => (
          <SecretKeyWord key={word} word={showSecretKey ? word : '******'} num={index + 1} />
        ))}
      </SecretKeyGrid>
      <Flex
        gap="space.02"
        pb="space.05"
        pt="space.03"
        background="ink.background-primary"
        boxShadow="contentOverflowFade"
        position="sticky"
        bottom={0}
        flexDirection="column"
      >
        <Flex gap="space.04" direction="row">
          <Button
            variant="outline"
            iconStart={showSecretKey ? Eye1ClosedIcon : Eye1Icon}
            flex="1"
            p="space.03"
            data-testid={SettingsSelectors.ShowSecretKeyBtn}
            onClick={() => setShowSecretKey(!showSecretKey)}
          >
            {showSecretKey ? 'Hide key' : 'Show key'}
          </Button>
          <Button
            variant="outline"
            iconStart={CopyIcon}
            flex="1"
            p="space.03"
            data-testid={SettingsSelectors.CopyKeyToClipboardBtn}
            onClick={!hasCopied ? onCopyToClipboard : undefined}
          >
            {!hasCopied ? ' Copy' : 'Copied!'}
          </Button>
        </Flex>
        <Button
          variant="solid"
          fullWidth
          data-testid={OnboardingSelectors.BackUpSecretKeyBtn}
          onClick={onDone}
        >
          I've backed it up
        </Button>
      </Flex>
    </Stack>
  );
}
