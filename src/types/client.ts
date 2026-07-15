import {
  Address,
  BaseRecord,
  CompanyInfo,
  ContactDetails,
  RecordStatus,
} from './common';

export interface Client
  extends BaseRecord {
  name: string;

  contactPerson?: string;

  contact: ContactDetails;

  address: Address;

  company: CompanyInfo;

  nationality?: string;

  passportNumber?: string;

  emiratesId?: string;

  notes?: string;

  status: RecordStatus;
}
