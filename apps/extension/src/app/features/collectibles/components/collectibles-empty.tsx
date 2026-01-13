import { styled } from 'leather-styles/jsx';

export function CollectiblesEmpty() {
  return (
    <styled.div
      border="default"
      borderRadius="sm"
      py="space.06"
      textAlign="center"
      color="ink.text-subdued"
    >
      No collectibles found for this account.
    </styled.div>
  );
}
