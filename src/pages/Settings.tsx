import {
  Building2,
  Check,
  Database,
  Download,
  FileImage,
  Landmark,
  Palette,
  RefreshCcw,
  Save,
  Settings2,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type CompanySettings = {
  companyName: string;
  companyShortName: string;
  legalForm: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  trn: string;

  logoDataUrl: string;

  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;

  currency: string;
  vatRate: string;

  invoicePrefix: string;
  quotationPrefix: string;
  receiptPrefix: string;
  legalNoticePrefix: string;

  defaultPaymentTerms: string;
  defaultQuotationValidity: string;

  bankAccountName: string;
  bankName: string;
  iban: string;
  swiftCode: string;
  accountCurrency: string;

  footerText: string;
  documentDisclaimer: string;
};

const SETTINGS_STORAGE_KEY = 'shab-company-settings';

const defaultSettings: CompanySettings = {
  companyName: 'SHAB Legal Consultants FZC',
  companyShortName: 'SHAB',
  legalForm: 'Free Zone Company',
  address: '',
  city: 'Sharjah',
  country: 'United Arab Emirates',
  email: 'info@shabadvocates.com',
  phone: '',
  website: 'www.shabadvocates.com',
  trn: '',

  logoDataUrl: '',

  primaryColor: '#C9A84C',
  secondaryColor: '#111111',
  backgroundColor: '#F8F8F8',

  currency: 'AED',
  vatRate: '5',

  invoicePrefix: 'SHAB-INV',
  quotationPrefix: 'SHAB-QTN',
  receiptPrefix: 'SHAB-RCP',
  legalNoticePrefix: 'SHAB-LN',

  defaultPaymentTerms: '7',
  defaultQuotationValidity: '15',

  bankAccountName: '',
  bankName: '',
  iban: '',
  swiftCode: '',
  accountCurrency: 'AED',

  footerText:
    'SHAB Legal Consultants FZC | United Arab Emirates',
  documentDisclaimer:
    'This document is confidential and intended only for the addressed recipient.',
};

function loadSettings(): CompanySettings {
  try {
    const savedSettings = window.localStorage.getItem(
      SETTINGS_STORAGE_KEY,
    );

    if (!savedSettings) {
      return defaultSettings;
    }

    const parsedSettings = JSON.parse(savedSettings);

    return {
      ...defaultSettings,
      ...parsedSettings,
    };
  } catch {
    return defaultSettings;
  }
}

function downloadJson(
  fileName: string,
  data: unknown,
) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');

  link.href = url;
  link.download = fileName;

  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function Settings() {
  const [settings, setSettings] =
    useState<CompanySettings>(loadSettings);

  const [savedMessage, setSavedMessage] =
    useState('');

  const logoInputRef =
    useRef<HTMLInputElement | null>(null);

  const backupInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!savedMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSavedMessage('');
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [savedMessage]);

  const updateSetting = <
    K extends keyof CompanySettings,
  >(
    field: K,
    value: CompanySettings[K],
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }));
  };

  const saveSettings = (event: FormEvent) => {
    event.preventDefault();

    if (!settings.companyName.trim()) {
      window.alert('Company name is required.');
      return;
    }

    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings),
      );

      window.dispatchEvent(
        new CustomEvent('shab-settings-updated'),
      );

      setSavedMessage('Settings saved successfully.');
    } catch {
      window.alert(
        'Settings could not be saved because browser storage is full.',
      );
    }
  };

  const handleLogoUpload = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      window.alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert(
        'Please select a logo smaller than 2 MB.',
      );

      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      window.alert('The logo could not be read.');
    };

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return;
      }

      updateSetting('logoDataUrl', reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    const confirmed = window.confirm(
      'Remove the saved company logo?',
    );

    if (!confirmed) {
      return;
    }

    updateSetting('logoDataUrl', '');

    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const exportBackup = () => {
    const backup: Record<string, unknown> = {};

    for (
      let index = 0;
      index < window.localStorage.length;
      index += 1
    ) {
      const key = window.localStorage.key(index);

      if (!key || !key.startsWith('shab-')) {
        continue;
      }

      const value = window.localStorage.getItem(key);

      try {
        backup[key] = value
          ? JSON.parse(value)
          : null;
      } catch {
        backup[key] = value;
      }
    }

    downloadJson(
      `SHAB-Backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`,
      {
        exportedAt: new Date().toISOString(),
        application: 'SHAB Legal Practice Manager',
        data: backup,
      },
    );
  };

  const importBackup = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      window.alert('The backup file could not be read.');
    };

    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') {
          throw new Error('Invalid backup file');
        }

        const parsedBackup = JSON.parse(reader.result);

        const backupData =
          parsedBackup?.data &&
          typeof parsedBackup.data === 'object'
            ? parsedBackup.data
            : parsedBackup;

        const confirmed = window.confirm(
          'Importing this backup may replace existing SHAB data. Continue?',
        );

        if (!confirmed) {
          return;
        }

        Object.entries(backupData).forEach(
          ([key, value]) => {
            if (!key.startsWith('shab-')) {
              return;
            }

            window.localStorage.setItem(
              key,
              JSON.stringify(value),
            );
          },
        );

        setSettings(loadSettings());

        window.alert(
          'Backup restored successfully. Refresh the app to load all restored data.',
        );
      } catch {
        window.alert(
          'The selected file is not a valid SHAB backup.',
        );
      } finally {
        if (backupInputRef.current) {
          backupInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const clearOperationalData = () => {
    const confirmed = window.confirm(
      'This will permanently delete clients, cases, tasks, payments, documents, quotations, notices, staff and notifications from this browser. Company settings will remain. Continue?',
    );

    if (!confirmed) {
      return;
    }

    const keysToDelete: string[] = [];

    for (
      let index = 0;
      index < window.localStorage.length;
      index += 1
    ) {
      const key = window.localStorage.key(index);

      if (
        key &&
        key.startsWith('shab-') &&
        key !== SETTINGS_STORAGE_KEY
      ) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    window.alert(
      'Operational data has been cleared. Company settings were preserved.',
    );
  };

  const resetSettings = () => {
    const confirmed = window.confirm(
      'Reset all company settings to the SHAB defaults?',
    );

    if (!confirmed) {
      return;
    }

    setSettings(defaultSettings);

    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(defaultSettings),
    );

    setSavedMessage('Default settings restored.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Settings2 className="h-8 w-8 text-[#C9A84C]" />
            Settings
          </h1>

          <p className="mt-1 text-gray-500">
            Manage SHAB branding, company details,
            finance defaults and application data.
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700">
            <Check className="h-5 w-5" />
            {savedMessage}
          </div>
        )}
      </div>

      <form
        onSubmit={saveSettings}
        className="mt-6 space-y-6"
      >
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div
            className="p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${settings.secondaryColor}, #252525)`,
            }}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black p-3">
                {settings.logoDataUrl ? (
                  <img
                    src={settings.logoDataUrl}
                    alt="SHAB logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2
                    className="h-14 w-14"
                    style={{
                      color: settings.primaryColor,
                    }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-bold uppercase tracking-[0.25em]"
                  style={{
                    color: settings.primaryColor,
                  }}
                >
                  SHAB Legal ERP
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {settings.companyName ||
                    'SHAB Legal Consultants FZC'}
                </h2>

                <p className="mt-2 text-sm text-gray-300">
                  {settings.email || 'Company email'}
                  {settings.website
                    ? ` • ${settings.website}`
                    : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    logoInputRef.current?.click()
                  }
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-black"
                  style={{
                    backgroundColor:
                      settings.primaryColor,
                  }}
                >
                  <FileImage className="h-4 w-4" />
                  Upload Logo
                </button>

                {settings.logoDataUrl && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-[#C9A84C]" />

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Company Information
              </h2>

              <p className="text-sm text-gray-500">
                These details will appear on future
                invoices, quotations and reports.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Company name *
              </label>

              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(event) =>
                  updateSetting(
                    'companyName',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Short name
              </label>

              <input
                type="text"
                value={settings.companyShortName}
                onChange={(event) =>
                  updateSetting(
                    'companyShortName',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Legal form
              </label>

              <input
                type="text"
                value={settings.legalForm}
                onChange={(event) =>
                  updateSetting(
                    'legalForm',
                    event.target.value,
                  )
                }
                placeholder="Free Zone Company"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                TRN
              </label>

              <input
                type="text"
                value={settings.trn}
                onChange={(event) =>
                  updateSetting(
                    'trn',
                    event.target.value,
                  )
                }
                placeholder="Tax registration number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Address
              </label>

              <input
                type="text"
                value={settings.address}
                onChange={(event) =>
                  updateSetting(
                    'address',
                    event.target.value,
                  )
                }
                placeholder="Office and building details"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                City
              </label>

              <input
                type="text"
                value={settings.city}
                onChange={(event) =>
                  updateSetting(
                    'city',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Country
              </label>

              <input
                type="text"
                value={settings.country}
                onChange={(event) =>
                  updateSetting(
                    'country',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={settings.email}
                onChange={(event) =>
                  updateSetting(
                    'email',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone
              </label>

              <input
                type="tel"
                value={settings.phone}
                onChange={(event) =>
                  updateSetting(
                    'phone',
                    event.target.value,
                  )
                }
                placeholder="+971"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Website
              </label>

              <input
                type="text"
                value={settings.website}
                onChange={(event) =>
                  updateSetting(
                    'website',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-[#C9A84C]" />

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                SHAB Branding
              </h2>

              <p className="text-sm text-gray-500">
                Gold, black and white visual identity.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Primary gold
              </label>

              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(event) =>
                    updateSetting(
                      'primaryColor',
                      event.target.value,
                    )
                  }
                  className="h-12 w-14 rounded-lg border border-gray-300"
                />

                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(event) =>
                    updateSetting(
                      'primaryColor',
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Secondary black
              </label>

              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(event) =>
                    updateSetting(
                      'secondaryColor',
                      event.target.value,
                    )
                  }
                  className="h-12 w-14 rounded-lg border border-gray-300"
                />

                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(event) =>
                    updateSetting(
                      'secondaryColor',
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                App background
              </label>

              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(event) =>
                    updateSetting(
                      'backgroundColor',
                      event.target.value,
                    )
                  }
                  className="h-12 w-14 rounded-lg border border-gray-300"
                />

                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(event) =>
                    updateSetting(
                      'backgroundColor',
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Landmark className="h-6 w-6 text-[#C9A84C]" />

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Finance and Banking
              </h2>

              <p className="text-sm text-gray-500">
                VAT, currency, payment terms and bank
                details.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Currency
              </label>

              <select
                value={settings.currency}
                onChange={(event) =>
                  updateSetting(
                    'currency',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                VAT rate %
              </label>

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.vatRate}
                onChange={(event) =>
                  updateSetting(
                    'vatRate',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Default payment period
              </label>

              <input
                type="number"
                min="1"
                value={settings.defaultPaymentTerms}
                onChange={(event) =>
                  updateSetting(
                    'defaultPaymentTerms',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <p className="mt-1 text-xs text-gray-500">
                Number of days from invoice date.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Quotation validity
              </label>

              <input
                type="number"
                min="1"
                value={
                  settings.defaultQuotationValidity
                }
                onChange={(event) =>
                  updateSetting(
                    'defaultQuotationValidity',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <p className="mt-1 text-xs text-gray-500">
                Default validity period in days.
              </p>
            </div>

            <div className="sm:col-span-2 border-t border-gray-200 pt-5">
              <h3 className="font-bold text-gray-900">
                Bank Account Details
              </h3>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Account name
              </label>

              <input
                type="text"
                value={settings.bankAccountName}
                onChange={(event) =>
                  updateSetting(
                    'bankAccountName',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Bank name
              </label>

              <input
                type="text"
                value={settings.bankName}
                onChange={(event) =>
                  updateSetting(
                    'bankName',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Account currency
              </label>

              <input
                type="text"
                value={settings.accountCurrency}
                onChange={(event) =>
                  updateSetting(
                    'accountCurrency',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                IBAN
              </label>

              <input
                type="text"
                value={settings.iban}
                onChange={(event) =>
                  updateSetting(
                    'iban',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                SWIFT code
              </label>

              <input
                type="text"
                value={settings.swiftCode}
                onChange={(event) =>
                  updateSetting(
                    'swiftCode',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Document Numbering
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Invoice prefix
              </label>

              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(event) =>
                  updateSetting(
                    'invoicePrefix',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Quotation prefix
              </label>

              <input
                type="text"
                value={settings.quotationPrefix}
                onChange={(event) =>
                  updateSetting(
                    'quotationPrefix',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Receipt prefix
              </label>

              <input
                type="text"
                value={settings.receiptPrefix}
                onChange={(event) =>
                  updateSetting(
                    'receiptPrefix',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Legal notice prefix
              </label>

              <input
                type="text"
                value={settings.legalNoticePrefix}
                onChange={(event) =>
                  updateSetting(
                    'legalNoticePrefix',
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Document Footer
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Footer text
              </label>

              <textarea
                rows={3}
                value={settings.footerText}
                onChange={(event) =>
                  updateSetting(
                    'footerText',
                    event.target.value,
                  )
                }
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confidentiality disclaimer
              </label>

              <textarea
                rows={4}
                value={settings.documentDisclaimer}
                onChange={(event) =>
                  updateSetting(
                    'documentDisclaimer',
                    event.target.value,
                  )
                }
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-[#C9A84C]" />

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Backup and Restore
              </h2>

              <p className="text-sm text-gray-500">
                Export or restore all SHAB data stored
                on this device.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={exportBackup}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-black"
            >
              <Download className="h-5 w-5" />
              Export Full Backup
            </button>

            <button
              type="button"
              onClick={() =>
                backupInputRef.current?.click()
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Upload className="h-5 w-5" />
              Restore Backup
            </button>

            <input
              ref={backupInputRef}
              type="file"
              accept=".json,application/json"
              onChange={importBackup}
              className="hidden"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <h2 className="text-xl font-bold text-red-900">
                Data Controls
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-700">
                Export a backup before deleting or
                resetting application data.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetSettings}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
            >
              <RefreshCcw className="h-5 w-5" />
              Reset Company Settings
            </button>

            <button
              type="button"
              onClick={clearOperationalData}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
            >
              <ShieldAlert className="h-5 w-5" />
              Clear Operational Data
            </button>
          </div>
        </section>

        <div className="sticky bottom-20 z-20 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:bottom-4">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-5 py-4 font-bold text-black hover:bg-[#b89536]"
          >
            <Save className="h-5 w-5" />
            Save SHAB Settings
          </button>
        </div>
      </form>
    </div>
  );
}