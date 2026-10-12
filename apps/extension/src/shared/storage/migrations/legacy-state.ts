import { isRecord } from '@shared/utils/is-record';

export type LegacyRecord = Record<string, unknown>;

export function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
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
