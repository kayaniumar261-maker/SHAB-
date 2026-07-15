/* ==========================================
   SHAB ERP Professional ID Generator
   Version 2.0
========================================== */

import { Storage } from '../services/storage';

export type ReferencePrefix =
  | 'CLI'
  | 'CASE'
  | 'DOC'
  | 'PAY'
  | 'HRG'
  | 'CAL'
  | 'EMP'
  | 'QTN'
  | 'LNT'
  | 'INV'
  | 'TASK'
  | 'USR';

type CounterMap = Record<string, number>;

function loadCounters(): CounterMap {
  return Storage.getIdCounters<CounterMap>({});
}

function saveCounters(
  counters: CounterMap,
) {
  Storage.saveIdCounters(counters);
}

export function generateReference(
  prefix: ReferencePrefix,
): string {
  const counters = loadCounters();

  const year =
    new Date().getFullYear();

  const key =
    `${prefix}-${year}`;

  const next =
    (counters[key] ?? 0) + 1;

  counters[key] = next;

  saveCounters(counters);

  return `${prefix}-${year}-${String(
    next,
  ).padStart(6, '0')}`;
}

export function generateNumericId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function createRecordId(
  prefix: ReferencePrefix,
) {
  return {
    id: generateNumericId(),
    reference:
      generateReference(prefix),
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  };
}

export function updateTimestamp<
  T extends {
    updatedAt?: string;
  },
>(record: T): T {
  return {
    ...record,
    updatedAt:
      new Date().toISOString(),
  };
}

export function resetReferenceCounters() {
  Storage.saveIdCounters({});
}
