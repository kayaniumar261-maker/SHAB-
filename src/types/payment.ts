import {
  BaseRecord,
  Money,
  RecordStatus,
} from './common';

export interface Payment
  extends BaseRecord {
  clientName: string;

  relatedCase: string;

  amount: Money;

  dueDate: string;

  paymentDate?: string;

  paymentMethod: string;

  invoiceNumber?: string;

  status: RecordStatus;

  notes?: string;
}
