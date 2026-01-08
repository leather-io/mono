import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Button, CopyIcon, Eye1ClosedIcon, Eye1Icon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';

import { SecretKeyGrid } from './secret-key-grid';
import { SecretKeyWord } from './secret-key-word';

interface SecretKeyProps {
  secretKey: string;
}
export const SecretKey = memo(function SecretKey({ secretKey }: SecretKeyProps) {
  const { onCopy, hasCopied } = useClipboard(secretKey || '');
  const [showSecretKey, setShowSecretKey] = useState(false);

  const navigate = useNavigate();

  function copyToClipboard() {
    analytics.track('copy_secret_key_to_clipboard');
    onCopy();
  }

  const secretKeyWords = useMemo(() => secretKey?.split(' '), [secretKey]);

  const onCopyToClipboard = copyToClipboard;
  function onBackedUpSecretKey() {
    return navigate(RouteUrls.SetPassword);
  }

  return (
    <Flex
      flexDirection={['column', null, 'row']}
      pt={[0, 'space.03', 'space.06']}
      px="space.05"
      gap="space.05"
      width="100%"
      justifyContent="space-between"
    >
      <Flex flexDirection="column" gap="space.04">
        <Stack gap="space.05">
          <styled.h1 textStyle="heading.03">Secret Key</styled.h1>
          <styled.p textStyle="body.01">
            These 24 words are your Secret Key. They create your account, and you sign in on
            different devices with them. Make sure to save these somewhere safe. If you lose these
            words, you lose your account.
          </styled.p>
        </Stack>
      </Flex>

      <Flex gap="space.05" flexDirection="column" mb={{ base: 'space.05', md: '0' }}>
        <Stack gap="space.04" bg="ink.background-primary" borderRadius="lg" width="100%" flex="1">
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
                onClick={onBackedUpSecretKey}
              >
                I've backed it up
              </Button>
            </Flex>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  );
});
