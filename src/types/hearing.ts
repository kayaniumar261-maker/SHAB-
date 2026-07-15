import {
  BaseRecord,
  Priority,
} from './common';

export interface Hearing
  extends BaseRecord {
  relatedCase: string;

  court: string;

  judge: string;

  hearingDate: string;

  hearingTime: string;

  assignedLawyer: string;

  outcome?: string;

  nextHearingDate?: string;

  status: string;

  priority: Priority;

  notes?: string;
}