import { FlexProps } from 'leather-styles/jsx';
import { InfoCard } from '~/components/info-card';

import { Button } from '@leather.io/ui';
import { capitalize } from '@leather.io/utils';

interface SignerKeyGenerationResultCardProps extends FlexProps {
  result: Record<string, unknown>;
}
export function SignerKeyGenerationResultCard({
  result,
  ...rest
}: SignerKeyGenerationResultCardProps) {
  function handleCopyDetails() {
    const jsonString = JSON.stringify(result, null, 2);
    void navigator.clipboard.writeText(jsonString);
  }

  return (
    <InfoCard w={['100%', null, null, '360px']} title="Your signer key signature" {...rest}>
      {Object.entries(result).map(([key, value]) => (
        <InfoCard.Row
          key={key}
          flexDir="column"
          justifyContent="flex-start"
          textAlign="left"
          mb="space.03"
        >
          <InfoCard.Label>{capitalize(key)}</InfoCard.Label>
          <InfoCard.Value textAlign="left" mt="space.01">
            {String(value)}
          </InfoCard.Value>
        </InfoCard.Row>
      ))}
      <Button variant="outline" mt="space.03" onClick={handleCopyDetails}>
        Copy details
      </Button>
    </InfoCard>
  );
}
