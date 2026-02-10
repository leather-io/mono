import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

const checkmarkPath = css({
  strokeDasharray: '30',
  strokeDashoffset: '30',
  animation: 'drawCheckmark 1s ease-out forwards',
});

const AnimatedCheckmarkSvg = styled('svg', {
  base: {
    fill: 'none',
    height: '18px',
    width: '18px',
  },
});

export function AnimatedCheckmarkIcon() {
  return (
    <AnimatedCheckmarkSvg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        className={checkmarkPath}
        d="m3 15 6.294 5L21 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </AnimatedCheckmarkSvg>
  );
}
