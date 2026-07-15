export type ImportModule =
  | 'clients'
  | 'cases'
  | 'hearings'
  | 'staff'
  | 'payments';

export type RawExcelRow = Record<string, unknown>;

export type ImportRowStatus =
  | 'valid'
  | 'invalid'
  | 'duplicate';

export interface ImportPreviewRow<T> {
  rowNumber: number;
  status: ImportRowStatus;
  data: T;
  errors: string[];
  original: RawExcelRow;
}

export interface WorkbookSheet {
  name: string;
  rows: RawExcelRow[];
}

export interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicate: number;
}
