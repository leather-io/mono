import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import { Button, Pressable } from '@leather.io/ui';

import { plainPressable } from './rail';

interface LightboxImage {
  src: string;
  caption: string;
}

const LightboxContext = createContext<(image: LightboxImage) => void>(() => undefined);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    if (!image) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setImage(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [image]);

  return (
    <LightboxContext.Provider value={setImage}>
      {children}
      {image ? (
        <Box
          position="fixed"
          inset="0"
          zIndex={100}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="ink.background-overlay"
          onClick={() => setImage(null)}
        >
          <Stack gap="space.03" alignItems="center" maxWidth="90vw">
            <styled.img
              src={image.src}
              alt={image.caption}
              maxHeight="84vh"
              maxWidth="90vw"
              objectFit="contain"
              borderRadius="sm"
              bg="ink.background-primary"
            />
            <Box
              display="flex"
              gap="space.03"
              alignItems="center"
              px="space.03"
              py="space.01"
              borderRadius="sm"
              bg="ink.background-primary"
            >
              <styled.span textStyle="label.03" color="ink.text-primary">
                {image.caption}
              </styled.span>
              <Button size="sm" variant="ghost" onClick={() => setImage(null)}>
                Close
              </Button>
            </Box>
          </Stack>
        </Box>
      ) : null}
    </LightboxContext.Provider>
  );
}

interface ThumbProps {
  src: string;
  caption: string;
  width: number;
  height?: number;
  fit?: 'cover' | 'contain';
  children?: ReactNode;
}

export function Thumb({ src, caption, width, height, fit = 'cover', children }: ThumbProps) {
  const open = useContext(LightboxContext);
  return (
    <Stack gap="space.02" style={{ width }} flexShrink={0}>
      {/* No Pressable halo: hover stays inside the image. */}
      <Pressable
        {...plainPressable}
        type="button"
        aria-label={`Enlarge: ${caption}`}
        onClick={() => open({ src, caption })}
        p="0"
        bg="transparent"
        cursor="zoom-in"
        _hover={{ opacity: 0.85 }}
      >
        <styled.img
          src={src}
          alt=""
          display="block"
          style={{ width, height }}
          objectFit={fit}
          objectPosition="top"
          borderWidth={1}
          borderStyle="solid"
          borderColor="ink.border-default"
          borderRadius="xs"
          bg="ink.background-secondary"
        />
      </Pressable>
      {children}
    </Stack>
  );
}
