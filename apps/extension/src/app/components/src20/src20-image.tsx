import { useState } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import { BitcoinFilledCircleIcon, Src20AvatarIcon } from '@leather.io/ui';

interface Src20ImageProps {
  alt?: string;
  src: string;
}
export function Src20Image(props: Src20ImageProps) {
  const { alt, src } = props;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);

  if (isError) return <Src20AvatarIcon />;

  return (
    <styled.div position="relative" width="xl" height="xl">
      <img
        alt={alt}
        onError={() => setIsError(true)}
        loading="lazy"
        onLoad={event => {
          const target = event.target as HTMLImageElement;
          setWidth(target.naturalWidth);
          setIsLoading(false);
        }}
        src={src}
        className={css({
          borderRadius: '100%',
          objectFit: 'cover',
          // display: 'none' breaks onLoad event firing
          opacity: isLoading ? '0' : '1',
          imageRendering: width <= 40 ? 'pixelated' : 'auto',
        })}
        style={{ width: '100%', height: '100%' }}
      />
      <styled.div position="absolute" bottom="-1px" right="-1px">
        <BitcoinFilledCircleIcon width={16} height={16} />
      </styled.div>
    </styled.div>
  );
}
