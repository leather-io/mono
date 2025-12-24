import type { GridProps } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';
import { useFlags } from '@app/features/feature-flags';

import {
  HeaderGrid as CurrentHeaderGrid,
  HeaderGridRightCol as CurrentHeaderGridRightCol,
} from './header-grid-current';
import {
  HeaderGrid as LegacyHeaderGrid,
  HeaderGridRightCol as LegacyHeaderGridRightCol,
} from './header-grid-legacy';

export interface HeaderGridProps extends GridProps {
  leftCol: React.ReactNode;
  centerCol?: React.ReactNode;
  rightCol: React.ReactNode;
}

export function HeaderGrid(props: HeaderGridProps) {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <CurrentHeaderGrid {...props} /> : <LegacyHeaderGrid {...props} />;
}

export function HeaderGridRightCol(props: HasChildren) {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? (
    <CurrentHeaderGridRightCol {...props} />
  ) : (
    <LegacyHeaderGridRightCol {...props} />
  );
}
