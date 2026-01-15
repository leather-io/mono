import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { OrdinalAvatarIcon } from '@leather.io/ui';

import { CollectibleText } from '@app/components/collectibles/collectible-text';
import { parseJson } from '@app/components/json';
import { useGetInscriptionTextContentQuery } from '@app/query/bitcoin/ordinals/inscription-text-content.query';

interface InscriptionTextProps {
  contentSrc: string;
  inscriptionNumber: number;
  onClickCallToAction?(): void;
  onClickSend(): void;
}
export function InscriptionText({
  contentSrc,
  inscriptionNumber,
  onClickCallToAction,
  onClickSend,
}: InscriptionTextProps) {
  const query = useGetInscriptionTextContentQuery(contentSrc);

  if (query.isLoading || query.isError) return null;

  return (
    <CollectibleText
      data-testid={SendCryptoAssetSelectors.Inscription}
      icon={<OrdinalAvatarIcon size="xl" />}
      key={inscriptionNumber}
      onClickCallToAction={onClickCallToAction}
      onClickSend={onClickSend}
      content={parseJson(query.data)}
      subtitle="Ordinal inscription"
      title={`# ${inscriptionNumber}`}
    />
  );
}
