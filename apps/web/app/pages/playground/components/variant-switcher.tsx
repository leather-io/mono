import { useSearchParams } from 'react-router';

import { styled } from 'leather-styles/jsx';

interface PlaygroundVariant {
  id: string;
  label: string;
}

const defaultVariantParam = 'v';

// The active variant is kept in the URL (?v=) so any specific variant is
// directly linkable — a share or feedback comment can point at exactly one
// iteration. Areas with several boards on one page give each board its own
// param so their switchers stay independent (and combinations stay linkable).
export function useActiveVariant(variants: PlaygroundVariant[], param = defaultVariantParam) {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get(param);
  const match = variants.find(variant => variant.id === requested);
  return match ?? variants[0];
}

interface VariantSwitcherProps {
  variants: PlaygroundVariant[];
  param?: string;
}

export function VariantSwitcher({ variants, param = defaultVariantParam }: VariantSwitcherProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = useActiveVariant(variants, param);

  function selectVariant(id: string) {
    const next = new URLSearchParams(searchParams);
    next.set(param, id);
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
