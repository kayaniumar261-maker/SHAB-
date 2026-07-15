import {
  BaseRecord,
  ContactDetails,
  RecordStatus,
} from './common';

export interface Staff
  extends BaseRecord {
  name: string;

  role: string;

  department: string;

  contact: ContactDetails;

  joiningDate: string;

  salary: number;

  status: RecordStatus;
}