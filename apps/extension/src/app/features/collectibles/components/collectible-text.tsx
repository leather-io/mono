import { CollectibleContentWrapper } from './collectible-content-wrapper';
import { createHtmlDataUrl, isHtmlContent } from './collectible-text.utils';
import { HtmlContent } from './html-content';
import { PlainTextContent } from './plain-text-content';

interface CollectibleTextProps {
  src: string;
  height?: number;
  onPress?(): void;
}

export function CollectibleText({ src, height = 200, onPress }: CollectibleTextProps) {
  if (typeof src !== 'string') return null;

  const hasHtmlContent = isHtmlContent(src);
  const dataUrl = hasHtmlContent ? createHtmlDataUrl(src) : null;

  return (
    <CollectibleContentWrapper height={height} onPress={onPress}>
      {hasHtmlContent && dataUrl ? (
        <HtmlContent dataUrl={dataUrl} height={height} />
      ) : (
        <PlainTextContent src={src} height={height} />
      )}
    </CollectibleContentWrapper>
  );
}
