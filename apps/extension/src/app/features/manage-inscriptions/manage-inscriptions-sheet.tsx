import { useCallback, useState } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader, Switch } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

const UTXO_PROTECTION_LEARN_URL = 'https://leather.io/guides/utxo-protection';

interface ManageInscriptionsSheetProps {
  isShowing: boolean;
  onClose(): void;
}

export function ManageInscriptionsSheet({ isShowing, onClose }: ManageInscriptionsSheetProps) {
  const { discardAllInscriptions, recoverAllInscriptions, discardedInscriptions } =
    useCurrentAccountDiscardedInscriptions();

  const [isOrdinalsProtected, setIsOrdinalsProtected] = useState(
    discardedInscriptions.length === 0
  );

  const handleToggleOrdinalsProtection = useCallback(() => {
    if (isOrdinalsProtected) {
      discardAllInscriptions();
      setIsOrdinalsProtected(false);
    } else {
      recoverAllInscriptions();
      setIsOrdinalsProtected(true);
    }
  }, [isOrdinalsProtected, discardAllInscriptions, recoverAllInscriptions]);

  const handleLearnMore = useCallback(() => {
    openInNewTab(UTXO_PROTECTION_LEARN_URL);
  }, []);

  return (
    <Sheet
      header={<SheetHeader title="Manage collectibles" />}
      isShowing={isShowing}
      onClose={onClose}
    >
      <Stack gap="space.05" px="space.05" pb="space.05">
        <Box bg="ink.background-secondary" p="space.04" borderRadius="sm">
          <Stack gap="space.03">
            <styled.h3 textStyle="label.02" margin="0">
              UTXO protection
            </styled.h3>
            <styled.p textStyle="body.02" color="ink.text-subdued" margin="0">
              UTXO protection prevents you from accidentally spending Bitcoin that contains
              inscriptions or other valuable data. When enabled, these UTXOs are excluded from your
              spendable balance.
            </styled.p>
          </Stack>
        </Box>

        <Stack gap="space.04">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py="space.03"
            borderBottom="default"
          >
            <Stack gap="space.01">
              <styled.span textStyle="label.02">Ordinals</styled.span>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                Protect inscriptions from being spent
              </styled.span>
            </Stack>
            <Switch.Root
              checked={isOrdinalsProtected}
              onCheckedChange={handleToggleOrdinalsProtection}
            >
              <Switch.Thumb />
            </Switch.Root>
          </Box>
        </Stack>

        <styled.button
          type="button"
          textStyle="label.03"
          color="ink.action-primary-default"
          _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={handleLearnMore}
          width="fit-content"
        >
          Learn about UTXO protection
        </styled.button>

        <Button variant="outline" fullWidth onClick={discardAllInscriptions}>
          Unprotect all inscriptions
        </Button>
      </Stack>
    </Sheet>
  );
}
