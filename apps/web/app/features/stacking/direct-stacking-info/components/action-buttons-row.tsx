import { useNavigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

export interface ActionButtonsRow {
  protocolSlug: string;
}

export function ActionButtonsRow({ protocolSlug }: ActionButtonsRow) {
  const navigate = useNavigate();
  async function handleLockMoreClick() {
    return navigate(`/liquid-stacking/${protocolSlug}`);
  }

  async function handleExtendStackingClick() {
    return navigate(`/liquid-stacking/${protocolSlug}`);
  }

  return (
    <Flex mt="space.04" gap="space.04">
      <Button fullWidth variant="ghost" onClick={handleLockMoreClick}>
        Stop stacking
      </Button>
      <Button fullWidth onClick={handleExtendStackingClick}>
        Increase stacking
      </Button>
    </Flex>
  );
}
