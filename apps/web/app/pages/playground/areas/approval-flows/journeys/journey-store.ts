import { useMemo, useSyncExternalStore } from 'react';

import {
  type JourneyEvent,
  type JourneyRun,
  createJourneyRun,
  isJourneyRun,
  reduceJourneyRun,
} from './journey-state';

const storagePrefix = 'leather.approval-journey.v1.';
const changedEvent = 'leather-approval-journey-changed';
const memory = new Map<string, string>();

function snapshot(id: string) {
  try {
    return window.localStorage.getItem(`${storagePrefix}${id}`) ?? memory.get(id) ?? '';
  } catch {
    return memory.get(id) ?? '';
  }
}

function parseRun(value: string): JourneyRun | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    return isJourneyRun(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(changedEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(changedEvent, onChange);
  };
}

function saveRun(run: JourneyRun) {
  const serialized = JSON.stringify(run);
  memory.set(run.id, serialized);
  try {
    window.localStorage.setItem(`${storagePrefix}${run.id}`, serialized);
  } catch {
    return window.dispatchEvent(new Event(changedEvent));
  }
  return window.dispatchEvent(new Event(changedEvent));
}

export function startJourney(journeyId: string, signer: JourneyRun['signer'] = 'software') {
  const run = createJourneyRun({
    id: crypto.randomUUID(),
    journeyId,
    signer,
    startedAt: Date.now(),
  });
  saveRun(run);
  return run;
}

export function useJourneyRun(id: string) {
  const serialized = useSyncExternalStore(
    subscribe,
    () => snapshot(id),
    () => ''
  );
  const run = useMemo(() => parseRun(serialized), [serialized]);
  return {
    run,
    dispatch(event: JourneyEvent) {
      const current = parseRun(snapshot(id));
      if (!current) return;
      const next = reduceJourneyRun(current, event);
      if (next !== current) saveRun(next);
    },
  };
}

export function exportJourney(run: JourneyRun) {
  const blob = new Blob(
    [JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), run }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `leather-journey-${run.journeyId}-${run.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
