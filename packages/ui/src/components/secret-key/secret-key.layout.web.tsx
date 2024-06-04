import { useState } from 'react';

import { Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { Button } from '../../components/button/button.web';
import { CopyIcon } from '../../icons/copy-icon';
import { EyeIcon } from '../../icons/eye-icon';
import { EyeSlashIcon } from '../../icons/eye-slash-icon';
import { OnboardingSelectors } from '../../tmp/tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '../../tmp/tests/selectors/settings.selectors';
import { SecretKeyGrid } from './secret-key-grid.web';
import { SecretKeyWord } from './secret-key-word.web';

interface SecretKeyLayoutProps {
  hasCopied: boolean;
  onCopyToClipboard(): void;
  secretKeyWords: string[] | undefined;
  showTitleAndIllustration: boolean;
  onBackedUpSecretKey(): void;
}
export function SecretKeyLayout({
  hasCopied,
  onCopyToClipboard,
  onBackedUpSecretKey,
  secretKeyWords,
}: SecretKeyLayoutProps) {
  const [showSecretKey, setShowSecretKey] = useState(false);

  return (
    <Stack gap="space.05">
      <SecretKeyGrid>
        {secretKeyWords?.map((word, index) => (
          <SecretKeyWord
            key={word}
            word={showSecretKey ? word : '*'.repeat(word.length)}
            num={index + 1}
          />
        ))}
      </SecretKeyGrid>
      <Flex gap="space.04" direction={{ base: 'column', md: 'row' }}>
        <Button
          fullWidth
          variant="outline"
          flex="1"
          display="flex"
          p="space.03"
          justifyContent="center"
          alignItems="center"
          data-testid={SettingsSelectors.ShowSecretKeyBtn}
          onClick={() => setShowSecretKey(!showSecretKey)}
        >
          <HStack>
            {showSecretKey ? <EyeSlashIcon width="20px" /> : <EyeIcon width="20px" />}
            <styled.span textStyle="label.02">
              {showSecretKey ? 'Hide key' : 'Show key'}
            </styled.span>
          </HStack>
        </Button>
        <Button
          fullWidth
          variant="outline"
          flex="1"
          display="flex"
          p="space.03"
          justifyContent="center"
          alignItems="center"
          data-testid={SettingsSelectors.CopyKeyToClipboardBtn}
          onClick={!hasCopied ? onCopyToClipboard : undefined}
        >
          <HStack>
            <CopyIcon />
            <styled.p textStyle="body.02">{!hasCopied ? ' Copy' : 'Copied!'}</styled.p>
          </HStack>
        </Button>
      </Flex>
      <Button
        width="100%"
        data-testid={OnboardingSelectors.BackUpSecretKeyBtn}
        onClick={onBackedUpSecretKey}
        variant="solid"
      >
        I've backed it up
      </Button>
    </Stack>
  );
}
