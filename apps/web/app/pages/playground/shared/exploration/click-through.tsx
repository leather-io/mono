import { type MouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Box } from 'leather-styles/jsx';

import type { FlowTransition, HotspotTarget } from './exploration-config';
import { useFitScale } from './scale-to-fit';

const clickable = [
  'button',
  'a[href]',
  'input',
  'select',
  'label',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function readableText(element: Element) {
  const aria = element.getAttribute('aria-label') ?? '';
  const placeholder = element.getAttribute('placeholder') ?? '';
  return `${aria} ${placeholder} ${element.textContent ?? ''}`.toLowerCase();
}

function matchesTarget(element: Element, target: HotspotTarget) {
  if (!element.matches(target.selector ?? clickable)) return false;
  if (target.text) return readableText(element).includes(target.text.toLowerCase());
  return true;
}

// The innermost elements in `root` that match the target.
function findTargets(root: Element, target: HotspotTarget) {
  const all = [...root.querySelectorAll(target.selector ?? clickable)].filter(element =>
    matchesTarget(element, target)
  );
  return all.filter(element => !all.some(other => other !== element && element.contains(other)));
}

interface Hotspot {
  key: string;
  top: number;
  left: number;
  width: number;
  height: number;
  label: string;
}

function measureHotspots<S extends string>(
  root: HTMLElement,
  transitions: FlowTransition<S>[],
  scale: number
) {
  const origin = root.getBoundingClientRect();
  const hotspots: Hotspot[] = [];
  transitions.forEach((transition, index) => {
    if (!transition.target) return;
    findTargets(root, transition.target).forEach((element, position) => {
      const rect = element.getBoundingClientRect();
      // Clip to the frame: content scrolled out of view has no hotspot.
      const top = Math.max(rect.top, origin.top);
      const bottom = Math.min(rect.bottom, origin.bottom);
      const left = Math.max(rect.left, origin.left);
      const right = Math.min(rect.right, origin.right);
      if (bottom - top < 2 || right - left < 2) return;
      hotspots.push({
        key: `${index}-${position}`,
        top: (top - origin.top) / scale,
        left: (left - origin.left) / scale,
        width: (right - left) / scale,
        height: (bottom - top) / scale,
        label: transition.trigger,
      });
    });
  });
  return hotspots;
}

interface ClickThroughProps<S extends string> {
  transitions: FlowTransition<S>[];
  showHotspots: boolean;
  onNavigate(to: S): void;
  onCoverage?(found: Set<number>): void;
  children: ReactNode;
}

export function ClickThrough<S extends string>({
  transitions,
  showHotspots,
  onNavigate,
  onCoverage,
  children,
}: ClickThroughProps<S>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [flash, setFlash] = useState(false);
  const visible = showHotspots || flash;

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    setHotspots(measureHotspots(root, transitions, scale));
  }, [transitions, scale]);

  // Coverage: which transitions found a target, re-checked as the screen
  // renders (mock sheets open, async content).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !onCoverage) return;
    function check() {
      if (!root || !onCoverage) return;
      const found = new Set<number>();
      transitions.forEach((transition, index) => {
        if (transition.target && findTargets(root, transition.target).length > 0) found.add(index);
      });
      onCoverage(found);
    }
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [transitions, onCoverage]);

  useEffect(() => {
    if (!visible) return;
    measure();
    const root = rootRef.current;
    root?.addEventListener('scroll', measure, true);
    return () => root?.removeEventListener('scroll', measure, true);
  }, [visible, measure]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(false), 700);
    return () => window.clearTimeout(timer);
  }, [flash]);

  function onClickCapture(event: MouseEvent) {
    const root = rootRef.current;
    if (!root || !(event.target instanceof Element)) return;
    for (
      let node: Element | null = event.target;
      node && node !== root;
      node = node.parentElement
    ) {
      const element = node;
      const hit = transitions.find(
        transition => transition.target && matchesTarget(element, transition.target)
      );
      if (hit) {
        event.preventDefault();
        event.stopPropagation();
        onNavigate(hit.to);
        return;
      }
    }
    if (transitions.some(transition => transition.target)) setFlash(true);
  }

  return (
    <Box ref={rootRef} position="relative" onClickCapture={onClickCapture}>
      {children}
      {visible ? (
        <Box position="absolute" inset="0" pointerEvents="none" zIndex={5} aria-hidden>
          {hotspots.map(hotspot => (
            <Box
              key={hotspot.key}
              position="absolute"
              title={hotspot.label}
              borderWidth="2px"
              borderStyle="solid"
              borderColor="blue.action-primary-default"
              borderRadius="xs"
              bg="blue.background-secondary"
              opacity={0.55}
              style={{
                top: hotspot.top,
                left: hotspot.left,
                width: hotspot.width,
                height: hotspot.height,
              }}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
