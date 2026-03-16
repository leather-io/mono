import { token } from 'leather-styles/tokens';
import { clamp } from 'remeda';

import { CircularProgress } from '@leather.io/ui';

interface QuoteRefetchIndicatorProps {
  interval: number;
  lastStartedAt: number | null;
  nextRunTime: number | null;
}

export function QuoteRefetchIndicator({
  interval,
  lastStartedAt,
  nextRunTime,
}: QuoteRefetchIndicatorProps) {
  const progress = calculateRefreshProgress(interval, lastStartedAt);

  return (
    <CircularProgress
      size={12}
      strokeWidth={1.5}
      progress={1}
      initialValue={progress.initialValue}
      duration={progress.duration}
      max={1}
      activeStrokeColor={token('colors.ink.text-subdued-primary')}
      key={nextRunTime}
    />
  );
}

interface RefetchProgress {
  initialValue: number;
  duration: number;
}

function calculateRefreshProgress(interval: number, lastStartedAt: number | null): RefetchProgress {
  const elapsed = lastStartedAt ? Date.now() - lastStartedAt : 0;
  const initialValue = clamp(elapsed / interval, { min: 0, max: 1 });
  const remaining = Math.max(interval - elapsed, 0);
  const duration = remaining || interval;

  return { initialValue, duration };
}
