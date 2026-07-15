/* ==========================================
   SHAB ERP Professional ID Generator
   Enterprise Version 2.0
========================================== */

import { Storage } from '../services/storage';

export type IdPrefix =
  | 'CLI'
  | 'CASE'
  | 'DOC'
  | 'PAY'
  | 'HRG'
  | 'CAL'
  | 'EMP'
  | 'QTN'
  | 'LNT'
  | 'TSK'
  | 'INV'
  | 'EXP';

type CounterMap = Record<string, number>;

const EMPTY_COUNTERS: CounterMap = {};

function getCounters(): CounterMap {
  return Storage.getIdCounters<CounterMap>(
    EMPTY_COUNTERS,
  );
}

function saveCounters(
  counters: CounterMap,
): void {
  Storage.saveIdCounters(counters);
}

export function generateId(
  prefix: IdPrefix,
): string {
  const year = new Date().getFullYear();

  const counters = getCounters();

  const counterKey = `${prefix}-${year}`;

  const nextNumber =
    (counters[counterKey] ?? 0) + 1;

  counters[counterKey] = nextNumber;

  saveCounters(counters);

  return [
    prefix,
    year,
    String(nextNumber).padStart(
      6,
      '0',
    ),
  ].join('-');
}

export function peekNextId(
  prefix: IdPrefix,
): string {
  const year = new Date().getFullYear();

  const counters = getCounters();

  const next =
    (counters[
      `${prefix}-${year}`
    ] ?? 0) + 1;

  return `${prefix}-${year}-${String(
    next,
  ).padStart(6, '0')}`;
}

export function resetCounters() {
  saveCounters({});
}

export function getCurrentCounter(
  prefix: IdPrefix,
): number {
  const year = new Date().getFullYear();

  const counters = getCounters();

  return (
    counters[
      `${prefix}-${year}`
    ] ?? 0
  );
}