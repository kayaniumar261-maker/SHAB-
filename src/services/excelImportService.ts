import * as XLSX from 'xlsx';

import {
  ImportModule,
  ImportPreviewRow,
  RawExcelRow,
  WorkbookSheet,
} from '../types/import';

type ImportedRecord = Record<
  string,
  string | number | boolean
>;

type FieldDefinition = {
  key: string;
  required?: boolean;
  aliases: string[];
};

type ModuleDefinition = {
  module: ImportModule;
  sheetAliases: string[];
  fields: FieldDefinition[];
};

const MODULES: ModuleDefinition[] = [
  {
    module: 'clients',
    sheetAliases: [
      'client details',
      'clients',
      'client database',
    ],
    fields: [
      {
        key: 'legacyReference',
        aliases: [
          'client id',
          'client code',
        ],
      },
      {
        key: 'name',
        required: true,
        aliases: [
          'client name',
          'name',
          'full name',
          'company name',
        ],
      },
      {
        key: 'nationality',
        aliases: ['nationality'],
      },
      {
        key: 'phone',
        aliases: [
          'phone',
          'mobile',
          'contact number',
        ],
      },
      {
        key: 'email',
        aliases: [
          'email',
          'email address',
        ],
      },
      {
        key: 'address',
        aliases: [
          'address',
          'client address',
        ],
      },
      {
        key: 'identification',
        aliases: [
          'id passport number',
          'id/passport number',
          'emirates id',
          'passport number',
          'identification',
        ],
      },
      {
        key: 'company',
        aliases: ['company'],
      },
      {
        key: 'source',
        aliases: ['source'],
      },
      {
        key: 'createdAt',
        aliases: [
          'date added',
          'created date',
        ],
      },
      {
        key: 'status',
        aliases: ['status'],
      },
    ],
  },

  {
    module: 'cases',
    sheetAliases: [
      'case database',
      'cases',
      'case details',
    ],
    fields: [
      {
        key: 'caseNumber',
        aliases: [
          'case number',
          'court case number',
        ],
      },
      {
        key: 'client',
        required: true,
        aliases: [
          'client name',
          'client',
        ],
      },
      {
        key: 'court',
        aliases: [
          'court name',
          'court',
        ],
      },
      {
        key: 'jurisdiction',
        aliases: ['jurisdiction'],
      },
      {
        key: 'caseType',
        aliases: [
          'case type',
          'category',
        ],
      },
      {
        key: 'opponent',
        aliases: [
          'opponent party',
          'opponent',
          'counterparty',
        ],
      },
      {
        key: 'assignedTo',
        aliases: [
          'assigned lawyer',
          'assigned to',
          'case manager',
        ],
      },
      {
        key: 'status',
        aliases: [
          'case status',
          'status',
        ],
      },
      {
        key: 'filingDate',
        aliases: [
          'date opened',
          'filing date',
        ],
      },
      {
        key: 'closedDate',
        aliases: ['date closed'],
      },
      {
        key: 'caseValue',
        aliases: ['case value'],
      },
      {
        key: 'notes',
        aliases: [
          'description remarks',
          'description/remarks',
          'remarks',
          'notes',
        ],
      },
    ],
  },

  {
    module: 'hearings',
    sheetAliases: [
      'hearings tracker',
      'hearings',
      'hearing tracker',
    ],
    fields: [
      {
        key: 'legacyReference',
        aliases: ['hearing id'],
      },
      {
        key: 'relatedCase',
        required: true,
        aliases: [
          'case number',
          'related case',
          'case reference',
        ],
      },
      {
        key: 'clientName',
        aliases: ['client name'],
      },
      {
        key: 'hearingDate',
        required: true,
        aliases: ['hearing date'],
      },
      {
        key: 'hearingTime',
        aliases: ['hearing time'],
      },
      {
        key: 'courtName',
        aliases: [
          'court',
          'court name',
        ],
      },
      {
        key: 'assignedLawyer',
        aliases: [
          'assigned lawyer',
          'lawyer',
        ],
      },
      {
        key: 'hearingType',
        aliases: ['hearing type'],
      },
      {
        key: 'notes',
        aliases: ['notes'],
      },
      {
        key: 'outcome',
        aliases: ['outcome'],
      },
      {
        key: 'nextHearingDate',
        aliases: ['next hearing'],
      },
    ],
  },

  {
    module: 'staff',
    sheetAliases: [
      'staff management',
      'staff',
      'employees',
    ],
    fields: [
      {
        key: 'legacyReference',
        aliases: ['employee id'],
      },
      {
        key: 'name',
        required: true,
        aliases: [
          'full name',
          'staff name',
          'employee name',
          'name',
        ],
      },
      {
        key: 'role',
        required: true,
        aliases: [
          'role',
          'designation',
          'job title',
        ],
      },
      {
        key: 'specialization',
        aliases: ['specialization'],
      },
      {
        key: 'phone',
        aliases: ['phone', 'mobile'],
      },
      {
        key: 'email',
        aliases: ['email'],
      },
      {
        key: 'salary',
        aliases: ['salary'],
      },
      {
        key: 'visaExpiry',
        aliases: ['visa expiry'],
      },
      {
        key: 'passportExpiry',
        aliases: ['passport expiry'],
      },
      {
        key: 'eidExpiry',
        aliases: ['eid expiry'],
      },
      {
        key: 'status',
        aliases: ['status'],
      },
      {
        key: 'joiningDate',
        aliases: [
          'hire date',
          'joining date',
        ],
      },
    ],
  },

  {
    module: 'payments',
    sheetAliases: [
      'case tracker shab',
      'payments',
      'finance',
      'invoices',
    ],
    fields: [
      {
        key: 'invoiceNumber',
        required: true,
        aliases: ['invoice id'],
      },
      {
        key: 'relatedCase',
        aliases: ['case number'],
      },
      {
        key: 'clientReference',
        aliases: ['client id'],
      },
      {
        key: 'clientName',
        required: true,
        aliases: ['client name'],
      },
      {
        key: 'agreedFees',
        aliases: ['agreed fees'],
      },
      {
        key: 'retainerReceived',
        aliases: ['retainer received'],
      },
      {
        key: 'additionalFees',
        aliases: [
          'additional fees translation charges',
          'additional fees / translation charges',
        ],
      },
      {
        key: 'subtotal',
        aliases: ['subtotal'],
      },
      {
        key: 'vatAmount',
        aliases: [
          'vat 5',
          'vat_5%',
          'vat 5%',
        ],
      },
      {
        key: 'totalAmount',
        aliases: ['total amount'],
      },
      {
        key: 'dueDate',
        aliases: ['payment due date'],
      },
      {
        key: 'amountPaid',
        aliases: ['amount paid'],
      },
      {
        key: 'outstandingBalance',
        aliases: ['outstanding balance'],
      },
      {
        key: 'status',
        aliases: ['payment status'],
      },
      {
        key: 'invoiceDate',
        aliases: ['invoice date'],
      },
    ],
  },
];

function normalizeHeading(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

function normalizeValue(
  value: unknown,
): string | number | boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  const text = String(value).trim();

  if (
    text.startsWith('#')
  ) {
    return '';
  }

  return text;
}

function findDefinition(
  module: ImportModule,
): ModuleDefinition {
  const definition = MODULES.find(
    (item) => item.module === module,
  );

  if (!definition) {
    throw new Error(
      'Unsupported import module.',
    );
  }

  return definition;
}

function findSourceColumn(
  row: RawExcelRow,
  field: FieldDefinition,
): string | undefined {
  const aliases = new Set(
    [
      field.key,
      ...field.aliases,
    ].map(normalizeHeading),
  );

  return Object.keys(row).find(
    (column) =>
      aliases.has(
        normalizeHeading(column),
      ),
  );
}

function mapRow(
  row: RawExcelRow,
  definition: ModuleDefinition,
): ImportedRecord {
  const mapped: ImportedRecord = {};

  definition.fields.forEach(
    (field) => {
      const sourceColumn =
        findSourceColumn(
          row,
          field,
        );

      mapped[field.key] =
        sourceColumn
          ? normalizeValue(
              row[sourceColumn],
            )
          : '';
    },
  );

  return mapped;
}

function validateRow(
  record: ImportedRecord,
  definition: ModuleDefinition,
): string[] {
  const errors: string[] = [];

  definition.fields.forEach(
    (field) => {
      if (!field.required) {
        return;
      }

      const value =
        record[field.key];

      if (
        value === '' ||
        value === null ||
        value === undefined
      ) {
        errors.push(
          `${field.key} is required.`,
        );
      }
    },
  );

  if (
    typeof record.email === 'string' &&
    record.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      record.email,
    )
  ) {
    errors.push(
      'Email is invalid.',
    );
  }

  [
    'salary',
    'caseValue',
    'agreedFees',
    'retainerReceived',
    'additionalFees',
    'subtotal',
    'vatAmount',
    'totalAmount',
    'amountPaid',
    'outstandingBalance',
  ].forEach((field) => {
    const value = record[field];

    if (
      value === '' ||
      value === undefined
    ) {
      return;
    }

    const numberValue = Number(
      String(value).replace(
        /[^\d.-]/g,
        '',
      ),
    );

    if (
      Number.isNaN(numberValue)
    ) {
      errors.push(
        `${field} must be numeric.`,
      );
    } else {
      record[field] =
        numberValue;
    }
  });

  return errors;
}

function duplicateKey(
  module: ImportModule,
  record: ImportedRecord,
): string {
  switch (module) {
    case 'clients':
      return [
        record.name,
        record.email,
        record.phone,
      ]
        .map((value) =>
          String(value ?? '')
            .trim()
            .toLowerCase(),
        )
        .join('|');

    case 'cases':
      return [
        record.caseNumber,
        record.client,
        record.caseType,
      ]
        .map((value) =>
          String(value ?? '')
            .trim()
            .toLowerCase(),
        )
        .join('|');

    case 'hearings':
      return [
        record.relatedCase,
        record.hearingDate,
        record.hearingTime,
      ]
        .map((value) =>
          String(value ?? '')
            .trim()
            .toLowerCase(),
        )
        .join('|');

    case 'staff':
      return [
        record.name,
        record.email,
        record.phone,
      ]
        .map((value) =>
          String(value ?? '')
            .trim()
            .toLowerCase(),
        )
        .join('|');

    case 'payments':
      return [
        record.invoiceNumber,
        record.clientName,
      ]
        .map((value) =>
          String(value ?? '')
            .trim()
            .toLowerCase(),
        )
        .join('|');

    default:
      return JSON.stringify(record);
  }
}

export async function readWorkbook(
  file: File,
): Promise<WorkbookSheet[]> {
  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ?? '';

  if (
    !['xlsx', 'xls', 'csv'].includes(
      extension,
    )
  ) {
    throw new Error(
      'Select an XLSX, XLS or CSV file.',
    );
  }

  const buffer =
    await file.arrayBuffer();

  const workbook = XLSX.read(
    buffer,
    {
      type: 'array',
      cellDates: true,
    },
  );

  return workbook.SheetNames.map(
    (sheetName) => ({
      name: sheetName,
      rows:
        XLSX.utils.sheet_to_json<
          RawExcelRow
        >(
          workbook.Sheets[
            sheetName
          ],
          {
            defval: '',
            raw: false,
            dateNF: 'yyyy-mm-dd',
          },
        ),
    }),
  );
}

export function detectModule(
  sheetName: string,
): ImportModule | null {
  const normalized =
    normalizeHeading(sheetName);

  const definition = MODULES.find(
    (item) =>
      item.sheetAliases
        .map(normalizeHeading)
        .includes(normalized),
  );

  return definition?.module ?? null;
}

export function createPreview(
  module: ImportModule,
  rows: RawExcelRow[],
  existingRecords: unknown[],
): ImportPreviewRow<ImportedRecord>[] {
  const definition =
    findDefinition(module);

  const existingKeys = new Set(
    existingRecords
      .filter(
        (
          item,
        ): item is Record<
          string,
          unknown
        > =>
          Boolean(item) &&
          typeof item === 'object',
      )
      .map((item) =>
        duplicateKey(
          module,
          item as ImportedRecord,
        ),
      ),
  );

  const fileKeys = new Set<string>();

  return rows.map(
    (row, index) => {
      const data = mapRow(
        row,
        definition,
      );

      const errors =
        validateRow(
          data,
          definition,
        );

      const key =
        duplicateKey(
          module,
          data,
        );

      const duplicate =
        existingKeys.has(key) ||
        fileKeys.has(key);

      if (!duplicate) {
        fileKeys.add(key);
      }

      return {
        rowNumber: index + 2,
        status:
          errors.length > 0
            ? 'invalid'
            : duplicate
              ? 'duplicate'
              : 'valid',
        data,
        errors:
          errors.length > 0
            ? errors
            : duplicate
              ? [
                  'Matching record already exists.',
                ]
              : [],
        original: row,
      };
    },
  );
}
