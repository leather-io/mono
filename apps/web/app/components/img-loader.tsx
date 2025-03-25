import { useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { useOnMount } from '@leather.io/ui';

type ImgLoaderState = 'loading' | 'loaded' | 'error';

interface ImgFillLoaderProps {
  src: string;
  alt?: string;
  fill: string;
  width: string;
  height?: string;
}
export function ImgFillLoader({ fill, width, height, src, alt, ...props }: ImgFillLoaderProps) {
  const [state, setState] = useState<ImgLoaderState>('loading');

  useOnMount(() => {
    if (ref.current?.complete) {
      setState('loaded');
      return;
    }
    ref.current?.addEventListener('load', () => setState('loaded'));
    ref.current?.addEventListener('error', () => setState('error'));
  });

  const ref = useRef<HTMLImageElement>(null);

  return (
    <>
      <styled.div
        width={width}
        height={height ?? width}
        style={{ background: state !== 'loaded' ? fill : 'none' }}
        overflow="hidden"
        borderRadius="xs"
        {...props}
      >
        <styled.img
          src={src}
          ref={ref}
          width="100%"
          height="100%"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          style={{ display: state === 'error' ? 'none' : 'block' }}
          alt={alt}
          data-state={state}
        />
      </styled.div>
    </>
  );
}
