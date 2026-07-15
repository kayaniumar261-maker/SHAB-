/* ==========================================
   SHAB ERP Common Types
   Enterprise Version 2.0
========================================== */

export type RecordStatus =
  | 'Active'
  | 'Inactive'
  | 'Pending'
  | 'Completed'
  | 'Cancelled'
  | 'Closed';

export type Priority =
  | 'High'
  | 'Medium'
  | 'Low';

export interface AuditFields {
  createdAt: string;

  updatedAt: string;
}

export interface BaseRecord
  extends AuditFields {
  id: number;

  reference: string;
}

export interface Address {
  country: string;

  emirate: string;

  city: string;

  address: string;

  postalCode?: string;
}

export interface ContactDetails {
  email: string;

  phone: string;

  mobile: string;

  whatsapp?: string;

  website?: string;
}

export interface PersonName {
  firstName: string;

  middleName?: string;

  lastName: string;
}

export interface CompanyInfo {
  companyName?: string;

  tradeLicense?: string;

  vatNumber?: string;
}

export interface Money {
  amount: number;

  currency: string;
}

export interface UserStamp {
  createdBy?: string;

  updatedBy?: string;
}

export interface SearchableRecord {
  id: number;

  reference: string;

  title: string;

  subtitle?: string;
}

export interface TimelineItem {
  id: number;

  title: string;

  description: string;

  date: string;

  type: string;
}