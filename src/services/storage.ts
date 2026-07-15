/* ==========================================
   SHAB ERP Storage Service
   Version: 2.1
========================================== */

export type StorageKey =
  | 'clients'
  | 'cases'
  | 'documents'
  | 'payments'
  | 'hearings'
  | 'calendar-events'
  | 'tasks'
  | 'quotations'
  | 'legal-notices'
  | 'staff'
  | 'notifications'
  | 'activity-log';

export type ObjectStorageKey =
  | 'company-settings'
  | 'id-counters';

export type RecordId = number | string;

type IdentifiableRecord = {
  id: RecordId;
};

type StorageUpdateDetail = {
  key: string;
  operation:
    | 'set'
    | 'append'
    | 'update'
    | 'delete'
    | 'clear'
    | 'import';
};

const PREFIX = 'shab-';

const LEGACY_COMPANY_SETTINGS_KEY =
  'shab-company-settings';

function buildKey(
  key: StorageKey | ObjectStorageKey,
): string {
  return `${PREFIX}${key}`;
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function dispatchStorageUpdate(
  detail: StorageUpdateDetail,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<StorageUpdateDetail>(
      'shab-storage-updated',
      {
        detail,
      },
    ),
  );
}

function safeParse<T>(
  value: string | null,
  fallback: T,
): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

class StorageService {
  /* ==========================================
     Collection methods
  ========================================== */

  getCollection<T>(
    key: StorageKey,
    fallback: T[] = [],
  ): T[] {
    const storage = getBrowserStorage();

    if (!storage) {
      return fallback;
    }

    const parsed = safeParse<unknown>(
      storage.getItem(buildKey(key)),
      fallback,
    );

    return Array.isArray(parsed)
      ? (parsed as T[])
      : fallback;
  }

  setCollection<T>(
    key: StorageKey,
    data: T[],
  ): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.setItem(
        buildKey(key),
        JSON.stringify(data),
      );

      dispatchStorageUpdate({
        key,
        operation: 'set',
      });

      return true;
    } catch (error) {
      console.error(
        `Unable to save SHAB collection: ${key}`,
        error,
      );

      return false;
    }
  }

  append<T>(
    key: StorageKey,
    item: T,
  ): T[] {
    const currentItems =
      this.getCollection<T>(key);

    const updatedItems = [
      item,
      ...currentItems,
    ];

    this.setCollection(
      key,
      updatedItems,
    );

    dispatchStorageUpdate({
      key,
      operation: 'append',
    });

    return updatedItems;
  }

  update<T extends IdentifiableRecord>(
    key: StorageKey,
    item: T,
  ): T[] {
    const currentItems =
      this.getCollection<T>(key);

    const recordExists =
      currentItems.some(
        (currentItem) =>
          currentItem.id === item.id,
      );

    const updatedItems = recordExists
      ? currentItems.map(
          (currentItem) =>
            currentItem.id === item.id
              ? item
              : currentItem,
        )
      : [item, ...currentItems];

    this.setCollection(
      key,
      updatedItems,
    );

    dispatchStorageUpdate({
      key,
      operation: 'update',
    });

    return updatedItems;
  }

  delete(
    key: StorageKey,
    id: RecordId,
  ): IdentifiableRecord[] {
    const currentItems =
      this.getCollection<IdentifiableRecord>(
        key,
      );

    const updatedItems =
      currentItems.filter(
        (item) => item.id !== id,
      );

    this.setCollection(
      key,
      updatedItems,
    );

    dispatchStorageUpdate({
      key,
      operation: 'delete',
    });

    return updatedItems;
  }

  clearCollection(
    key: StorageKey,
  ): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(buildKey(key));

      dispatchStorageUpdate({
        key,
        operation: 'clear',
      });

      return true;
    } catch (error) {
      console.error(
        `Unable to clear SHAB collection: ${key}`,
        error,
      );

      return false;
    }
  }

  /* ==========================================
     Single-object methods
  ========================================== */

  getObject<T>(
    key: ObjectStorageKey,
    fallback: T,
  ): T {
    const storage = getBrowserStorage();

    if (!storage) {
      return fallback;
    }

    return safeParse<T>(
      storage.getItem(buildKey(key)),
      fallback,
    );
  }

  setObject<T>(
    key: ObjectStorageKey,
    value: T,
  ): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.setItem(
        buildKey(key),
        JSON.stringify(value),
      );

      dispatchStorageUpdate({
        key,
        operation: 'set',
      });

      return true;
    } catch (error) {
      console.error(
        `Unable to save SHAB object: ${key}`,
        error,
      );

      return false;
    }
  }

  clearObject(
    key: ObjectStorageKey,
  ): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(buildKey(key));

      dispatchStorageUpdate({
        key,
        operation: 'clear',
      });

      return true;
    } catch (error) {
      console.error(
        `Unable to clear SHAB object: ${key}`,
        error,
      );

      return false;
    }
  }

  /* ==========================================
     Module shortcuts
  ========================================== */

  getClients<T>(): T[] {
    return this.getCollection<T>(
      'clients',
    );
  }

  saveClients<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'clients',
      data,
    );
  }

  getCases<T>(): T[] {
    return this.getCollection<T>(
      'cases',
    );
  }

  saveCases<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'cases',
      data,
    );
  }

  getDocuments<T>(): T[] {
    return this.getCollection<T>(
      'documents',
    );
  }

  saveDocuments<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'documents',
      data,
    );
  }

  getPayments<T>(): T[] {
    return this.getCollection<T>(
      'payments',
    );
  }

  savePayments<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'payments',
      data,
    );
  }

  getHearings<T>(): T[] {
    return this.getCollection<T>(
      'hearings',
    );
  }

  saveHearings<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'hearings',
      data,
    );
  }

  getCalendarEvents<T>(): T[] {
    return this.getCollection<T>(
      'calendar-events',
    );
  }

  saveCalendarEvents<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'calendar-events',
      data,
    );
  }

  getTasks<T>(): T[] {
    return this.getCollection<T>(
      'tasks',
    );
  }

  saveTasks<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'tasks',
      data,
    );
  }

  getQuotations<T>(): T[] {
    return this.getCollection<T>(
      'quotations',
    );
  }

  saveQuotations<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'quotations',
      data,
    );
  }

  getLegalNotices<T>(): T[] {
    return this.getCollection<T>(
      'legal-notices',
    );
  }

  saveLegalNotices<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'legal-notices',
      data,
    );
  }

  getStaff<T>(): T[] {
    return this.getCollection<T>(
      'staff',
    );
  }

  saveStaff<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'staff',
      data,
    );
  }

  getNotifications<T>(): T[] {
    return this.getCollection<T>(
      'notifications',
    );
  }

  saveNotifications<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'notifications',
      data,
    );
  }

  getActivityLog<T>(): T[] {
    return this.getCollection<T>(
      'activity-log',
    );
  }

  saveActivityLog<T>(
    data: T[],
  ): boolean {
    return this.setCollection(
      'activity-log',
      data,
    );
  }

  /* ==========================================
     Company settings
  ========================================== */

  getCompanySettings<T>(
    fallback: T,
  ): T {
    const storage = getBrowserStorage();

    if (!storage) {
      return fallback;
    }

    const currentValue =
      storage.getItem(
        buildKey('company-settings'),
      );

    if (currentValue) {
      return safeParse<T>(
        currentValue,
        fallback,
      );
    }

    const legacyValue =
      storage.getItem(
        LEGACY_COMPANY_SETTINGS_KEY,
      );

    if (!legacyValue) {
      return fallback;
    }

    const parsedLegacyValue =
      safeParse<T>(
        legacyValue,
        fallback,
      );

    this.saveCompanySettings(
      parsedLegacyValue,
    );

    return parsedLegacyValue;
  }

  saveCompanySettings<T>(
    settings: T,
  ): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    try {
      const serializedSettings =
        JSON.stringify(settings);

      storage.setItem(
        buildKey('company-settings'),
        serializedSettings,
      );

      // Keep compatibility with the existing
      // Settings page during migration.
      storage.setItem(
        LEGACY_COMPANY_SETTINGS_KEY,
        serializedSettings,
      );

      dispatchStorageUpdate({
        key: 'company-settings',
        operation: 'set',
      });

      return true;
    } catch (error) {
      console.error(
        'Unable to save SHAB company settings.',
        error,
      );

      return false;
    }
  }

  /* ==========================================
     ID counters
  ========================================== */

  getIdCounters<T>(
    fallback: T,
  ): T {
    return this.getObject(
      'id-counters',
      fallback,
    );
  }

  saveIdCounters<T>(
    counters: T,
  ): boolean {
    return this.setObject(
      'id-counters',
      counters,
    );
  }

  /* ==========================================
     Backup and restore
  ========================================== */

  exportDatabase(): Record<
    string,
    unknown
  > {
    const storage = getBrowserStorage();

    const database: Record<
      string,
      unknown
    > = {};

    if (!storage) {
      return database;
    }

    for (
      let index = 0;
      index < storage.length;
      index += 1
    ) {
      const key = storage.key(index);

      if (
        !key ||
        !key.startsWith(PREFIX)
      ) {
        continue;
      }

      const rawValue =
        storage.getItem(key);

      database[key] =
        safeParse<unknown>(
          rawValue,
          rawValue,
        );
    }

    return {
      application:
        'SHAB Legal ERP',
      version: '2.1',
      exportedAt:
        new Date().toISOString(),
      data: database,
    };
  }

  importDatabase(
    backup: unknown,
  ): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    if (
      !backup ||
      typeof backup !== 'object'
    ) {
      return false;
    }

    const backupRecord =
      backup as Record<
        string,
        unknown
      >;

    const source =
      backupRecord.data &&
      typeof backupRecord.data ===
        'object'
        ? (backupRecord.data as Record<
            string,
            unknown
          >)
        : backupRecord;

    try {
      Object.entries(source).forEach(
        ([key, value]) => {
          if (
            !key.startsWith(PREFIX)
          ) {
            return;
          }

          storage.setItem(
            key,
            JSON.stringify(value),
          );
        },
      );

      dispatchStorageUpdate({
        key: 'database',
        operation: 'import',
      });

      return true;
    } catch (error) {
      console.error(
        'Unable to import SHAB database.',
        error,
      );

      return false;
    }
  }

  clearOperationalData(): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    const protectedKeys = new Set([
      buildKey('company-settings'),
      LEGACY_COMPANY_SETTINGS_KEY,
      buildKey('id-counters'),
    ]);

    const keysToRemove: string[] = [];

    for (
      let index = 0;
      index < storage.length;
      index += 1
    ) {
      const key = storage.key(index);

      if (
        key &&
        key.startsWith(PREFIX) &&
        !protectedKeys.has(key)
      ) {
        keysToRemove.push(key);
      }
    }

    try {
      keysToRemove.forEach((key) => {
        storage.removeItem(key);
      });

      dispatchStorageUpdate({
        key: 'operational-data',
        operation: 'clear',
      });

      return true;
    } catch (error) {
      console.error(
        'Unable to clear SHAB operational data.',
        error,
      );

      return false;
    }
  }
}

export const Storage =
  new StorageService();