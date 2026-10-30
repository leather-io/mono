import { styled } from 'leather-styles/jsx';

// Shared by every variant; its deviations are documented in shared/DEVIATIONS.md.
export function PrivateBadge() {
  return (
    <styled.span textStyle="label.03" style={{ color: '#7A5CFA' }}>
      Private
    </styled.span>
  );
}

// Moved here from a variant without a DEVIATIONS.md row: must still show.
export function HotBadge() {
  return (
    <styled.span textStyle="label.03" style={{ color: '#FF00AA' }}>
      Hot
    </styled.span>
  );
}
