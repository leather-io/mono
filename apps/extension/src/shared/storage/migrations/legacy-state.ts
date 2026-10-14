import { isRecord } from '@shared/utils/is-record';

export type LegacyRecord = Record<string, unknown>;

export function asUnknownArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

export function getRecordAtPath(value: unknown, ...path: string[]): LegacyRecord | undefined {
  return path.reduce<LegacyRecord | undefined>(
    (record, key) => {
      const child = record?.[key];
      return isRecord(child) ? child : undefined;
    },
    isRecord(value) ? value : undefined
  );
}
