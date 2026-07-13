/* ==========================================
   SHAB ERP Professional ID Generator
========================================== */

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
  | 'INV';

const STORAGE_KEY = 'shab-id-counters';

type CounterMap = Record<string, number>;

function loadCounters(): CounterMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCounters(counters: CounterMap) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(counters),
  );
}

export function generateId(
  prefix: IdPrefix,
): string {
  const counters = loadCounters();

  const year = new Date().getFullYear();

  const key = `${prefix}-${year}`;

  const current =
    (counters[key] ?? 0) + 1;

  counters[key] = current;

  saveCounters(counters);

  return `${prefix}-${year}-${String(
    current,
  ).padStart(6, '0')}`;
}