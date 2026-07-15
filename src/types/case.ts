import {
  BaseRecord,
  Priority,
  RecordStatus,
} from './common';

export interface LegalCase
  extends BaseRecord {
  title: string;
  clientReference: string;
  clientName: string;
  court: string;
  caseNumber: string;
  category: string;
  assignedLawyer: string;
  opponent: string;
  filingDate: string;
  nextHearing?: string;
  priority: Priority;
  status: RecordStatus;
  notes: string;
}