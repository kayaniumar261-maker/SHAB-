/* ==========================================
   SHAB ERP Storage Service
   Version: 2.0
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
  | 'settings'
  | 'activity-log';

const PREFIX = 'shab-';

function buildKey(key: StorageKey): string {
  return `${PREFIX}${key}`;
}

class StorageService {
  /* ------------------------------
      Generic Methods
  -------------------------------*/

  get<T>(key: StorageKey): T[] {
    try {
      const raw = localStorage.getItem(buildKey(key));

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch (error) {
      console.error(error);

      return [];
    }
  }

  set<T>(
    key: StorageKey,
    data: T[],
  ): void {
    localStorage.setItem(
      buildKey(key),
      JSON.stringify(data),
    );

    window.dispatchEvent(
      new CustomEvent('shab-storage-updated', {
        detail: key,
      }),
    );
  }

  clear(key: StorageKey): void {
    localStorage.removeItem(buildKey(key));

    window.dispatchEvent(
      new CustomEvent('shab-storage-updated', {
        detail: key,
      }),
    );
  }

  append<T>(
    key: StorageKey,
    item: T,
  ) {
    const list = this.get<T>(key);

    list.unshift(item);

    this.set(key, list);
  }

  update<T extends { id: number }>(
    key: StorageKey,
    item: T,
  ) {
    const list = this.get<T>(key);

    const updated = list.map((x) =>
      x.id === item.id ? item : x,
    );

    this.set(key, updated);
  }

  delete(
    key: StorageKey,
    id: number,
  ) {
    const list =
      this.get<{ id: number }>(key);

    this.set(
      key,
      list.filter((x) => x.id !== id),
    );
  }

  /* ------------------------------
      Shortcuts
  -------------------------------*/

  getClients() {
    return this.get('clients');
  }

  saveClients(data: unknown[]) {
    this.set('clients', data);
  }

  getCases() {
    return this.get('cases');
  }

  saveCases(data: unknown[]) {
    this.set('cases', data);
  }

  getDocuments() {
    return this.get('documents');
  }

  saveDocuments(data: unknown[]) {
    this.set('documents', data);
  }

  getPayments() {
    return this.get('payments');
  }

  savePayments(data: unknown[]) {
    this.set('payments', data);
  }

  getHearings() {
    return this.get('hearings');
  }

  saveHearings(data: unknown[]) {
    this.set('hearings', data);
  }

  getCalendarEvents() {
    return this.get(
      'calendar-events',
    );
  }

  saveCalendarEvents(
    data: unknown[],
  ) {
    this.set(
      'calendar-events',
      data,
    );
  }

  getTasks() {
    return this.get('tasks');
  }

  saveTasks(data: unknown[]) {
    this.set('tasks', data);
  }

  getQuotations() {
    return this.get(
      'quotations',
    );
  }

  saveQuotations(data: unknown[]) {
    this.set(
      'quotations',
      data,
    );
  }

  getLegalNotices() {
    return this.get(
      'legal-notices',
    );
  }

  saveLegalNotices(
    data: unknown[],
  ) {
    this.set(
      'legal-notices',
      data,
    );
  }

  getStaff() {
    return this.get('staff');
  }

  saveStaff(data: unknown[]) {
    this.set('staff', data);
  }

  getNotifications() {
    return this.get(
      'notifications',
    );
  }

  saveNotifications(
    data: unknown[],
  ) {
    this.set(
      'notifications',
      data,
    );
  }

  getActivityLog() {
    return this.get(
      'activity-log',
    );
  }

  saveActivityLog(
    data: unknown[],
  ) {
    this.set(
      'activity-log',
      data,
    );
  }

  getSettings() {
    return this.get(
      'settings',
    );
  }

  saveSettings(data: unknown[]) {
    this.set(
      'settings',
      data,
    );
  }

  /* ------------------------------
      Backup
  -------------------------------*/

  exportDatabase() {
    return {
      clients: this.getClients(),
      cases: this.getCases(),
      documents:
        this.getDocuments(),
      payments:
        this.getPayments(),
      hearings:
        this.getHearings(),
      calendar:
        this.getCalendarEvents(),
      tasks: this.getTasks(),
      quotations:
        this.getQuotations(),
      legalNotices:
        this.getLegalNotices(),
      staff: this.getStaff(),
      notifications:
        this.getNotifications(),
      activity:
        this.getActivityLog(),
      settings:
        this.getSettings(),
    };
  }
}

export const Storage =
  new StorageService();