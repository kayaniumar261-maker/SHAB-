import {
  Download,
  File,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type DocumentRecord = {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  relatedCase: string;
  category: string;
  notes: string;
  uploadedAt: string;
};

type StoredCase = {
  id: number;
  title: string;
  reference: string;
};

type DocumentForm = {
  title: string;
  relatedCase: string;
  category: string;
  notes: string;
};

const DOCUMENTS_STORAGE_KEY = 'shab-documents';
const CASES_STORAGE_KEY = 'shab-cases';
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const emptyForm: DocumentForm = {
  title: '',
  relatedCase: '',
  category: 'General',
  notes: '',
};

function loadDocuments(): DocumentRecord[] {
  try {
    const savedDocuments = window.localStorage.getItem(
      DOCUMENTS_STORAGE_KEY,
    );

    if (!savedDocuments) {
      return [];
    }

    const parsedDocuments = JSON.parse(savedDocuments);

    return Array.isArray(parsedDocuments)
      ? parsedDocuments
      : [];
  } catch {
    return [];
  }
}

function loadCases(): StoredCase[] {
  try {
    const savedCases = window.localStorage.getItem(
      CASES_STORAGE_KEY,
    );

    if (!savedCases) {
      return [];
    }

    const parsedCases = JSON.parse(savedCases);

    return Array.isArray(parsedCases)
      ? parsedCases
      : [];
  } catch {
    return [];
  }
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function Documents() {
  const [documents, setDocuments] =
    useState<DocumentRecord[]>(loadDocuments);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [form, setForm] =
    useState<DocumentForm>(emptyForm);

  const fileInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DOCUMENTS_STORAGE_KEY,
        JSON.stringify(documents),
      );
    } catch {
      window.alert(
        'The document could not be saved because browser storage is full.',
      );
    }
  }, [documents]);

  useEffect(() => {
    const refreshCases = () => {
      setCases(loadCases());
    };

    refreshCases();

    window.addEventListener('focus', refreshCases);
    window.addEventListener('storage', refreshCases);

    return () => {
      window.removeEventListener('focus', refreshCases);
      window.removeEventListener('storage', refreshCases);
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const sortedDocuments = [...documents].sort(
      (firstDocument, secondDocument) =>
        secondDocument.uploadedAt.localeCompare(
          firstDocument.uploadedAt,
        ),
    );

    if (!search) {
      return sortedDocuments;
    }

    return sortedDocuments.filter((document) =>
      [
        document.title,
        document.fileName,
        document.fileType,
        document.relatedCase,
        document.category,
        document.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [documents, searchTerm]);

  const openUploadForm = () => {
    setForm({
      ...emptyForm,
      relatedCase: '',
    });

    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedFile(null);
    setForm(emptyForm);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateForm = (
    field: keyof DocumentForm,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleFileSelection = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      window.alert(
        'Please select a file smaller than 2 MB.',
      );

      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    if (!form.title.trim()) {
      updateForm(
        'title',
        file.name.replace(/\.[^/.]+$/, ''),
      );
    }
  };

  const saveDocument = (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      window.alert('Please select a file.');
      return;
    }

    if (!form.title.trim()) {
      window.alert('Document title is required.');
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      window.alert(
        'The selected file could not be read.',
      );
    };

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        window.alert(
          'The selected file could not be saved.',
        );
        return;
      }

      const newDocument: DocumentRecord = {
        id: Date.now(),
        title: form.title.trim(),
        fileName: selectedFile.name,
        fileType:
          selectedFile.type ||
          'application/octet-stream',
        fileSize: selectedFile.size,
        dataUrl: reader.result,
        relatedCase: form.relatedCase.trim(),
        category:
          form.category.trim() || 'General',
        notes: form.notes.trim(),
        uploadedAt: new Date().toISOString(),
      };

      setDocuments((currentDocuments) => [
        newDocument,
        ...currentDocuments,
      ]);

      closeForm();
    };

    reader.readAsDataURL(selectedFile);
  };

  const downloadDocument = (
    document: DocumentRecord,
  ) => {
    const link =
      window.document.createElement('a');

    link.href = document.dataUrl;
    link.download = document.fileName;

    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const deleteDocument = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?',
    );

    if (!confirmed) {
      return;
    }

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) => document.id !== id,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Documents
          </h1>

          <p className="mt-1 text-gray-500">
            Store and organise case and client documents.
          </p>
        </div>

        <button
          type="button"
          onClick={openUploadForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Add Document
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total documents
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {documents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Linked to cases
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {
              documents.filter(
                (document) =>
                  document.relatedCase.trim() !== '',
              ).length
            }
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search documents"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6 space-y-4">
        {filteredDocuments.map((document) => (
          <article
            key={document.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-indigo-100 p-3">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">
                      {document.title}
                    </h2>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {document.fileName}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {document.category}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-gray-700">
                      Size:
                    </span>{' '}
                    {formatFileSize(
                      document.fileSize,
                    )}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Case:
                    </span>{' '}
                    {document.relatedCase ||
                      'Not linked'}
                  </p>

                  <p className="sm:col-span-2">
                    <span className="font-medium text-gray-700">
                      Uploaded:
                    </span>{' '}
                    {formatUploadDate(
                      document.uploadedAt,
                    )}
                  </p>
                </div>

                {document.notes && (
                  <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                    {document.notes}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      downloadDocument(document)
                    }
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteDocument(document.id)
                    }
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching documents found.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Document
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select a file and enter its details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close document form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveDocument}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select file *
                </label>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {selectedFile ? (
                    <>
                      <File className="h-10 w-10 text-indigo-600" />

                      <span className="mt-3 break-all font-semibold text-gray-900">
                        {selectedFile.name}
                      </span>

                      <span className="mt-1 text-sm text-gray-500">
                        {formatFileSize(
                          selectedFile.size,
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400" />

                      <span className="mt-3 font-semibold text-gray-700">
                        Tap to choose a file
                      </span>

                      <span className="mt-1 text-sm text-gray-500">
                        Maximum file size: 2 MB
                      </span>
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileSelection}
                  className="hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="document-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Document title *
                </label>

                <input
                  id="document-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      'title',
                      event.target.value,
                    )
                  }
                  placeholder="Legal notice or signed agreement"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="document-case"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Related case
                  </label>

                  {cases.length > 0 ? (
                    <select
                      id="document-case"
                      value={form.relatedCase}
                      onChange={(event) =>
                        updateForm(
                          'relatedCase',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        No linked case
                      </option>

                      {cases.map((caseItem) => (
                        <option
                          key={caseItem.id}
                          value={caseItem.reference}
                        >
                          {caseItem.reference} —{' '}
                          {caseItem.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="document-case"
                      type="text"
                      value={form.relatedCase}
                      onChange={(event) =>
                        updateForm(
                          'relatedCase',
                          event.target.value,
                        )
                      }
                      placeholder="Case reference"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="document-category"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Category
                  </label>

                  <select
                    id="document-category"
                    value={form.category}
                    onChange={(event) =>
                      updateForm(
                        'category',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="General">
                      General
                    </option>

                    <option value="Agreement">
                      Agreement
                    </option>

                    <option value="Legal Notice">
                      Legal Notice
                    </option>

                    <option value="Court Filing">
                      Court Filing
                    </option>

                    <option value="Evidence">
                      Evidence
                    </option>

                    <option value="Identity Document">
                      Identity Document
                    </option>

                    <option value="Invoice">
                      Invoice
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="document-notes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="document-notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Document description or internal notes"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="rounded-xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                Files are currently saved only in this
                browser on this device. Do not use this as
                the only storage location for important
                client documents.
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}