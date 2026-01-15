import { OrdinalAvatarIcon } from '@leather.io/ui';

import { CollectibleIframe } from '@app/components/collectibles/collectible-iframe';
import { CollectibleItemLayoutProps } from '@app/components/collectibles/collectible-item.layout';

interface InscriptionHtmlProps
  extends Pick<
    CollectibleItemLayoutProps,
    'onClickCallToAction' | 'onClickSend' | 'subtitle' | 'title'
  > {
  contentSrc: string;
}

export function InscriptionHtml({
  contentSrc,
  onClickCallToAction,
  onClickSend,
  subtitle,
  title,
}: InscriptionHtmlProps) {
  return (
    <CollectibleIframe
      icon={<OrdinalAvatarIcon size="lg" />}
      onClickCallToAction={onClickCallToAction}
      onClickSend={onClickSend}
      src={contentSrc}
      subtitle={subtitle}
      title={title}
    />
  );
}
