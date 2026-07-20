import { useSearchParams } from 'react-router';

import { styled } from 'leather-styles/jsx';

interface PlaygroundVariant {
  id: string;
  label: string;
}

const variantParam = 'v';

// The active variant is kept in the URL (?v=) so any specific variant is
// directly linkable — a share or feedback comment can point at exactly one
// iteration.
export function useActiveVariant(variants: PlaygroundVariant[]) {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get(variantParam);
  const match = variants.find(variant => variant.id === requested);
  return match ?? variants[0];
}

interface VariantSwitcherProps {
  variants: PlaygroundVariant[];
}

export function VariantSwitcher({ variants }: VariantSwitcherProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = useActiveVariant(variants);

  function selectVariant(id: string) {
    const next = new URLSearchParams(searchParams);
    next.set(variantParam, id);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }

  return (
    <styled.div
      display="flex"
      gap="space.01"
      width="fit-content"
      p="space.01"
      borderRadius="sm"
      bg="ink.background-secondary"
    >
      {variants.map(variant => (
        <styled.button
          key={variant.id}
          type="button"
          onClick={() => selectVariant(variant.id)}
          cursor="pointer"
          px="space.03"
          py="space.01"
          borderRadius="xs"
          textStyle="label.03"
          color={variant.id === active.id ? 'ink.text-primary' : 'ink.text-subdued'}
          bg={variant.id === active.id ? 'ink.background-primary' : 'transparent'}
          boxShadow={variant.id === active.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'}
          _hover={{ color: 'ink.text-primary' }}
        >
          {variant.label}
        </styled.button>
      ))}
    </styled.div>
  );
}
