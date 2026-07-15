/* ==========================================
   SHAB ERP Activity Logger
   Enterprise Version 2.0
========================================== */

import { Storage } from './storage';

export type ActivityType =
  | 'Client'
  | 'Case'
  | 'Document'
  | 'Payment'
  | 'Quotation'
  | 'Legal Notice'
  | 'Hearing'
  | 'Calendar'
  | 'Task'
  | 'Staff'
  | 'System';

export interface ActivityRecord {
  id: number;

  timestamp: string;

  type: ActivityType;

  title: string;

  description: string;

  reference?: string;

  user?: string;

  color?: string;
}

const MAX_LOGS = 1000;

class ActivityLogger {
  private getLogs(): ActivityRecord[] {
    return Storage.getActivityLog<ActivityRecord>();
  }

  private saveLogs(logs: ActivityRecord[]) {
    Storage.saveActivityLog(logs);
  }

  add(
    type: ActivityType,
    title: string,
    description: string,
    reference?: string,
    user = 'SHAB User',
  ) {
    const logs = this.getLogs();

    const log: ActivityRecord = {
      id: Date.now(),

      timestamp: new Date().toISOString(),

      type,

      title,

      description,

      reference,

      user,

      color: this.getColor(type),
    };

    logs.unshift(log);

    if (logs.length > MAX_LOGS) {
      logs.length = MAX_LOGS;
    }

    this.saveLogs(logs);
  }

  getAll() {
    return this.getLogs().sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    );
  }

  clear() {
    Storage.saveActivityLog([]);
  }

  private getColor(type: ActivityType): string {
    switch (type) {
      case 'Client':
        return '#2563EB';

      case 'Case':
        return '#7C3AED';

      case 'Payment':
        return '#16A34A';

      case 'Document':
        return '#D97706';

      case 'Hearing':
        return '#C9A84C';

      case 'Quotation':
        return '#0891B2';

      case 'Legal Notice':
        return '#DC2626';

      case 'Task':
        return '#9333EA';

      case 'Staff':
        return '#0F766E';

      default:
        return '#6B7280';
    }
  }
}

export const Activity = new ActivityLogger();
