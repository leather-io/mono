import { Flex, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/client-only';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Button, CloseIcon, Flag, Sheet } from '@leather.io/ui';

export function InstallDialog() {
  const { showInstallLeatherDialog, setShowInstallLeatherDialog } = useLeatherConnect();
  return (
    <WhenClient>
      <Sheet
        isShowing={showInstallLeatherDialog}
        onClose={() => setShowInstallLeatherDialog(false)}
      >
        <styled.div px="space.05" py="space.03">
          <Flag
            img={
              <Button variant="ghost" onClick={() => setShowInstallLeatherDialog(false)}>
                <CloseIcon />
              </Button>
            }
            reverse
            width="100%"
          >
            <styled.h1 textStyle="heading.04">Install Leather</styled.h1>
          </Flag>

          <styled.p textStyle="body.01" mt="space.06">
            Please install Leather wallet extension to proceed
          </styled.p>
          <Flex
            border="default"
            borderRadius="sm"
            p="space.04"
            mt="space.05"
            justifyContent="space-between"
            mb="-space.02"
          >
            <Flag img={<styled.img src="/icons/leather.webp" width="36px" alt="Leather logo" />}>
              <Flex textStyle="label.02" flexDir="column">
                <styled.span>Leather</styled.span>
                <styled.span color="ink.text-subdued">leather.io</styled.span>
              </Flex>
            </Flag>
            <Button
              size="sm"
              width="132px"
              onClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}
            >
              Install
            </Button>
          </Flex>
        </styled.div>
      </Sheet>
    </WhenClient>
  );
}
