import { Box } from 'leather-styles/jsx';

import { OrdinalAvatarIcon } from '@leather.io/ui';
import { sanitizeContent } from '@leather.io/utils/sanitize-content';

import { LoadingSpinner } from '@app/components/loading-spinner';
import { useGetInscriptionTextContentQuery } from '@app/query/bitcoin/ordinals/inscription-text-content.query';

import { CollectibleIframe } from '@app/components/collectibles/collectible-iframe';
import {
  CollectibleItemLayout,
  CollectibleItemLayoutProps,
} from '@app/components/collectibles/collectible-item.layout';

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
  const query = useGetInscriptionTextContentQuery(contentSrc);

  if (query.isLoading) {
    return (
      <CollectibleItemLayout
        collectibleTypeIcon={<OrdinalAvatarIcon size="lg" />}
        onClickCallToAction={onClickCallToAction}
        onClickSend={onClickSend}
        subtitle={subtitle}
        title={title}
      >
        <Box alignItems="center" display="flex" height="100%" justifyContent="center" width="100%">
          <LoadingSpinner size="16px" />
        </Box>
      </CollectibleItemLayout>
    );
  }

  if (query.isError || !query.data) {
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

  return (
    <CollectibleItemLayout
      collectibleTypeIcon={<OrdinalAvatarIcon size="lg" />}
      onClickCallToAction={onClickCallToAction}
      onClickSend={onClickSend}
      subtitle={subtitle}
      title={title}
    >
      <Box
        bg="ink.text-primary"
        color="ink.background-secondary"
        height="100%"
        overflow="hidden"
        p="space.04"
        width="100%"
        // FIXME:   dangerouslySetInnerHTML={{ __html: sanitizeContent(query.data) }} is unsafe here
        dangerouslySetInnerHTML={{ __html: sanitizeContent(query.data) }}
      />
    </CollectibleItemLayout>
  );
}
