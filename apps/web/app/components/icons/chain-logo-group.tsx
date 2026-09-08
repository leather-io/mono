import { HTMLStyledProps, styled } from 'leather-styles/jsx';

import { ChainLogoIcon } from './chain-logo';

// Matches the avatar scale's `sm` tile, which is what the avatar-backed logos
// render at, so an img-backed logo sits at the same weight beside one.
const tokenLogoSize = 24;

// How much of the logo behind stays uncovered.
const peek = 12;

// A single logo still fills the width a pair needs, so the label after it
// starts at the same x on every row.
const slotWidth = tokenLogoSize + peek;

// Width of the cut between two logos. Wide enough to read as a separation,
// narrow enough not to look like a gap.
const cutWidth = 1.5;

const radius = tokenLogoSize / 2;
const overlap = tokenLogoSize - peek;

// Punches the logo in front back out of the one behind it, so the separation
// comes from an absence rather than from a ring painted in some assumed
// background colour. A ring has to guess what sits behind the cluster and gets
// it wrong the moment a row hover tints it; a cut is right on any ground. The
// hole is centred on the front logo's centre, expressed in the rear logo's own
// box, and oversized by the cut width.
const cutoutMask = `radial-gradient(circle at ${overlap + radius}px ${radius}px, transparent ${radius + cutWidth}px, black ${radius + cutWidth}px)`;

interface ChainLogoGroupProps extends HTMLStyledProps<'div'> {
  symbols: readonly string[];
}

// Right-aligned in a fixed slot and growing leftwards, so the first symbol
// keeps one vertical lane down the column and the label keeps another however
// many logos a row carries. Rendering reversed puts that first symbol last in
// the DOM, which is what lands it on top without juggling z-index, and leaves
// every logo except that last one needing the cut. A lone logo is therefore
// untouched, and looks like every other single token on the page.
export function ChainLogoGroup({ symbols, ...props }: ChainLogoGroupProps) {
  const reversed = [...symbols].reverse();

  return (
    <styled.div
      display="inline-flex"
      alignItems="center"
      justifyContent="flex-end"
      flexShrink={0}
      style={{ minWidth: `${slotWidth}px` }}
      {...props}
    >
      {reversed.map((symbol, index) => {
        const isCovered = index < reversed.length - 1;

        return (
          <styled.div
            key={symbol}
            display="inline-flex"
            style={{
              marginLeft: index === 0 ? undefined : `-${overlap}px`,
              WebkitMaskImage: isCovered ? cutoutMask : undefined,
              maskImage: isCovered ? cutoutMask : undefined,
            }}
          >
            <ChainLogoIcon symbol={symbol} size={tokenLogoSize} />
          </styled.div>
        );
      })}
    </styled.div>
  );
}
