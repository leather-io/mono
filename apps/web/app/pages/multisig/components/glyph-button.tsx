import { Box, styled } from 'leather-styles/jsx';

import { accountIconUrl } from '../multisig-tokens';

interface GlyphButtonProps {
  icon: string;
  selected: boolean;
  onClick(): void;
}

export function GlyphButton({ icon, selected, onClick }: GlyphButtonProps) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      aria-label={icon}
      aria-pressed={selected}
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      aspectRatio="1"
      borderRadius="sm"
      borderWidth={selected ? '2px' : '1px'}
      borderStyle="solid"
      borderColor={selected ? 'ink.text-primary' : 'ink.border-default'}
      bg="transparent"
      cursor="pointer"
      _hover={{ borderColor: 'ink.action-primary-default' }}
    >
      <Box
        width="24px"
        height="24px"
        bg="ink.text-primary"
        style={{
          WebkitMaskImage: `url(${accountIconUrl(icon)})`,
          maskImage: `url(${accountIconUrl(icon)})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    </styled.button>
  );
}
