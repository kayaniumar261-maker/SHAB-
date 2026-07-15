import {
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import {
  ChangeEvent,
  useMemo,
  useState,
} from 'react';

import {
  createPreview,
  detectModule,
  readWorkbook,
} from '../../services/excelImportService';
import {
  ImportModule,
  ImportPreviewRow,
  WorkbookSheet,
} from '../../types/import';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  existingRecords: unknown[];
  onImport: (
    module: ImportModule,
    rows: Record<
      string,
      string | number | boolean
    >[],
  ) => void;
};

export function ExcelImportModal({
  isOpen,
  onClose,
  existingRecords,
  onImport,
}: Props) {
  const [fileName, setFileName] =
    useState('');

  const [sheets, setSheets] =
    useState<WorkbookSheet[]>([]);

  const [
    selectedSheetName,
    setSelectedSheetName,
  ] = useState('');

  const [module, setModule] =
    useState<ImportModule | ''>('');

  const [preview, setPreview] =
    useState<
      ImportPreviewRow<
        Record<
          string,
          string | number | boolean
        >
      >[]
    >([]);

  const [error, setError] =
    useState('');

  const selectedSheet =
    sheets.find(
      (sheet) =>
        sheet.name ===
        selectedSheetName,
    );

  const summary = useMemo(
    () => ({
      total: preview.length,
      valid: preview.filter(
        (row) =>
          row.status === 'valid',
      ).length,
      duplicate: preview.filter(
        (row) =>
          row.status ===
          'duplicate',
      ).length,
      invalid: preview.filter(
        (row) =>
          row.status === 'invalid',
      ).length,
    }),
    [preview],
  );

  if (!isOpen) {
    return null;
  }

  const reset = () => {
    setFileName('');
    setSheets([]);
    setSelectedSheetName('');
    setModule('');
    setPreview([]);
    setError('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setError('');

      const workbookSheets =
        await readWorkbook(file);

      setFileName(file.name);
      setSheets(workbookSheets);

      const firstSheet =
        workbookSheets[0];

      if (!firstSheet) {
        throw new Error(
          'No worksheets found.',
        );
      }

      setSelectedSheetName(
        firstSheet.name,
      );

      const detected =
        detectModule(
          firstSheet.name,
        );

      setModule(
        detected ?? '',
      );

      setPreview([]);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : 'Could not read workbook.',
      );
    }
  };

  const handleSheetChange = (
    sheetName: string,
  ) => {
    setSelectedSheetName(
      sheetName,
    );

    const detected =
      detectModule(sheetName);

    setModule(
      detected ?? '',
    );

    setPreview([]);
  };

  const generatePreview = () => {
    if (
      !selectedSheet ||
      !module
    ) {
      setError(
        'Select a worksheet and module.',
      );

      return;
    }

    try {
      setError('');

      const result =
        createPreview(
          module,
          selectedSheet.rows,
          existingRecords,
        );

      setPreview(result);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : 'Could not preview data.',
      );
    }
  };

  const importValidRows = () => {
    if (!module) {
      return;
    }

    const validRows =
      preview
        .filter(
          (row) =>
            row.status === 'valid',
        )
        .map((row) => row.data);

    if (validRows.length === 0) {
      setError(
        'There are no valid rows to import.',
      );

      return;
    }

    onImport(
      module,
      validRows,
    );

    close();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-5xl sm:rounded-3xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              SHAB Excel Import Center
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Import only approved fields from your workbook.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#C9A84C] hover:bg-yellow-50">
            <Upload className="h-10 w-10 text-[#C9A84C]" />

            <span className="mt-3 font-semibold text-gray-900">
              Choose Excel workbook
            </span>

            <span className="mt-1 text-sm text-gray-500">
              XLSX, XLS or CSV
            </span>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {fileName && (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />

              <div>
                <p className="font-semibold text-gray-900">
                  {fileName}
                </p>

                <p className="text-sm text-gray-500">
                  {sheets.length} worksheet(s)
                </p>
              </div>
            </div>
          )}

          {sheets.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Worksheet
                </label>

                <select
                  value={
                    selectedSheetName
                  }
                  onChange={(event) =>
                    handleSheetChange(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  {sheets.map(
                    (sheet) => (
                      <option
                        key={sheet.name}
                        value={sheet.name}
                      >
                        {sheet.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Import module
                </label>

                <select
                  value={module}
                  onChange={(event) => {
                    setModule(
                      event.target
                        .value as
                        ImportModule,
                    );

                    setPreview([]);
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">
                    Select module
                  </option>

                  <option value="clients">
                    Clients
                  </option>

                  <option value="cases">
                    Cases
                  </option>

                  <option value="hearings">
                    Hearings
                  </option>

                  <option value="staff">
                    Staff
                  </option>

                  <option value="payments">
                    Payments
                  </option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {selectedSheet && (
            <button
              type="button"
              onClick={generatePreview}
              className="w-full rounded-xl bg-[#111111] px-4 py-3 font-semibold text-[#C9A84C]"
            >
              Preview Import
            </button>
          )}

          {preview.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Total
                  </p>

                  <p className="text-2xl font-bold">
                    {summary.total}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Valid
                  </p>

                  <p className="text-2xl font-bold text-green-700">
                    {summary.valid}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Duplicates
                  </p>

                  <p className="text-2xl font-bold text-yellow-700">
                    {summary.duplicate}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Invalid
                  </p>

                  <p className="text-2xl font-bold text-red-700">
                    {summary.invalid}
                  </p>
                </div>
              </div>

              <div className="max-h-96 overflow-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="px-4 py-3">
                        Row
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Record
                      </th>

                      <th className="px-4 py-3">
                        Notes
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {preview.map(
                      (row) => (
                        <tr
                          key={
                            row.rowNumber
                          }
                          className="border-t"
                        >
                          <td className="px-4 py-3">
                            {
                              row.rowNumber
                            }
                          </td>

                          <td className="px-4 py-3">
                            {row.status ===
                            'valid' ? (
                              <span className="inline-flex items-center gap-1 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-700">
                                <XCircle className="h-4 w-4" />
                                {row.status}
                              </span>
                            )}
                          </td>

                          <td className="max-w-sm px-4 py-3">
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(
                                row.data,
                                null,
                                2,
                              )}
                            </pre>
                          </td>

                          <td className="px-4 py-3 text-red-600">
                            {row.errors.join(
                              ' ',
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={
                  importValidRows
                }
                className="w-full rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black"
              >
                Import {summary.valid} Valid Rows
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
