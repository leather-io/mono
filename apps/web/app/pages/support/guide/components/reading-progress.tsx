import { RefObject, useEffect, useRef } from 'react';

import { Box } from 'leather-styles/jsx';

interface ReadingProgressProps {
  targetRef: RefObject<HTMLElement | null>;
}

export function ReadingProgress({ targetRef }: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;

    function update() {
      const target = targetRef.current;
      const bar = barRef.current;
      if (!target || !bar) return;

      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollable = rect.height - viewportHeight;
      const scrolled = -rect.top;

      let progress = 0;
      if (scrollable > 0) {
        progress = Math.min(1, Math.max(0, scrolled / scrollable));
      } else if (scrolled >= 0) {
        progress = 1;
      }

      bar.style.width = `${progress * 100}%`;
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [targetRef]);

  return (
    <Box position="relative" h="2px" w="100%" bg="transparent">
      <Box
        ref={barRef}
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w={0}
        bg="ink.text-primary"
      />
    </Box>
  );
}
