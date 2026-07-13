import {
  BriefcaseBusiness,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type StaffStatus = 'Active' | 'Inactive';

type StaffRecord = {
  id: number;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  status: StaffStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type StaffForm = {
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  salary: string;
  status: StaffStatus;
  notes: string;
};

const STAFF_STORAGE_KEY = 'shab-staff';

const emptyForm: StaffForm = {
  name: '',
  role: '',
  department: 'Legal',
  phone: '',
  email: '',
  joiningDate: '',
  salary: '',
  status: 'Active',
  notes: '',
};

function loadStaff(): StaffRecord[] {
  try {
    const savedStaff = window.localStorage.getItem(
      STAFF_STORAGE_KEY,
    );

    if (!savedStaff) {
      return [];
    }

    const parsedStaff = JSON.parse(savedStaff);

    return Array.isArray(parsedStaff)
      ? parsedStaff
      : [];
  } catch {
    return [];
  }
}

function getLocalDate(): string {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(value);
}

export function Staff() {
  const [staff, setStaff] =
    useState<StaffRecord[]>(loadStaff);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<'All' | StaffStatus>('All');

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingStaffId, setEditingStaffId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<StaffForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      STAFF_STORAGE_KEY,
      JSON.stringify(staff),
    );
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return [...staff]
      .sort((first, second) =>
        first.name.localeCompare(second.name),
      )
      .filter((staffMember) => {
        const matchesStatus =
          statusFilter === 'All' ||
          staffMember.status === statusFilter;

        const matchesSearch =
          !search ||
          [
            staffMember.name,
            staffMember.role,
            staffMember.department,
            staffMember.phone,
            staffMember.email,
            staffMember.status,
            staffMember.notes,
          ]
            .join(' ')
            .toLowerCase()
            .includes(search);

        return matchesStatus && matchesSearch;
      });
  }, [staff, searchTerm, statusFilter]);

  const activeStaffCount = staff.filter(
    (staffMember) =>
      staffMember.status === 'Active',
  ).length;

  const inactiveStaffCount = staff.filter(
    (staffMember) =>
      staffMember.status === 'Inactive',
  ).length;

  const totalMonthlySalary = staff
    .filter(
      (staffMember) =>
        staffMember.status === 'Active',
    )
    .reduce(
      (total, staffMember) =>
        total + staffMember.salary,
      0,
    );

  const openAddForm = () => {
    setEditingStaffId(null);

    setForm({
      ...emptyForm,
      joiningDate: getLocalDate(),
    });

    setIsFormOpen(true);
  };

  const openEditForm = (
    staffMember: StaffRecord,
  ) => {
    setEditingStaffId(staffMember.id);

    setForm({
      name: staffMember.name,
      role: staffMember.role,
      department: staffMember.department,
      phone: staffMember.phone,
      email: staffMember.email,
      joiningDate: staffMember.joiningDate,
      salary: String(staffMember.salary),
      status: staffMember.status,
      notes: staffMember.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStaffId(null);
    setForm(emptyForm);
  };

  const updateForm = <
    K extends keyof StaffForm,
  >(
    field: K,
    value: StaffForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveStaff = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert(
        'Staff name is required.',
      );

      return;
    }

    if (!form.role.trim()) {
      window.alert(
        'Staff role is required.',
      );

      return;
    }

    const salary =
      Number.parseFloat(form.salary) || 0;

    if (salary < 0) {
      window.alert(
        'Salary cannot be negative.',
      );

      return;
    }

    const now = new Date().toISOString();

    const staffData = {
      name: form.name.trim(),
      role: form.role.trim(),
      department:
        form.department.trim() || 'Legal',
      phone: form.phone.trim(),
      email: form.email.trim(),
      joiningDate: form.joiningDate,
      salary,
      status: form.status,
      notes: form.notes.trim(),
      updatedAt: now,
    };

    if (editingStaffId !== null) {
      setStaff((currentStaff) =>
        currentStaff.map((staffMember) =>
          staffMember.id === editingStaffId
            ? {
                ...staffMember,
                ...staffData,
              }
            : staffMember,
        ),
      );
    } else {
      const newStaffMember: StaffRecord = {
        id: Date.now(),
        ...staffData,
        createdAt: now,
      };

      setStaff((currentStaff) => [
        newStaffMember,
        ...currentStaff,
      ]);
    }

    closeForm();
  };

  const toggleStaffStatus = (
    id: number,
  ) => {
    setStaff((currentStaff) =>
      currentStaff.map((staffMember) =>
        staffMember.id === id
          ? {
              ...staffMember,
              status:
                staffMember.status === 'Active'
                  ? 'Inactive'
                  : 'Active',
              updatedAt:
                new Date().toISOString(),
            }
          : staffMember,
      ),
    );
  };

  const deleteStaff = (id: number) => {
    const confirmed = window.confirm(
      'Delete this staff record permanently?',
    );

    if (!confirmed) {
      return;
    }

    setStaff((currentStaff) =>
      currentStaff.filter(
        (staffMember) =>
          staffMember.id !== id,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Management
          </h1>

          <p className="mt-1 text-gray-500">
            Manually add, update and deactivate
            SHAB team members.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-cyan-700"
        >
          <Plus className="h-5 w-5" />
          Add Staff
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total staff
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {staff.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {activeStaffCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-700">
            {inactiveStaffCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Monthly salaries
          </p>

          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(
              totalMonthlySalary,
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Search staff"
            className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | 'All'
                | StaffStatus,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-cyan-500"
        >
          <option value="All">
            All staff
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredStaff.map(
          (staffMember) => (
            <article
              key={staffMember.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="shrink-0 rounded-xl bg-cyan-100 p-3">
                    <UserRound className="h-6 w-6 text-cyan-600" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">
                      {staffMember.name}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-cyan-700">
                      {staffMember.role}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {staffMember.department}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    staffMember.status ===
                    'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {staffMember.status}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                {staffMember.phone && (
                  <a
                    href={`tel:${staffMember.phone}`}
                    className="flex items-center gap-2 hover:text-cyan-600"
                  >
                    <Phone className="h-4 w-4 text-gray-400" />

                    <span>
                      {staffMember.phone}
                    </span>
                  </a>
                )}

                {staffMember.email && (
                  <a
                    href={`mailto:${staffMember.email}`}
                    className="flex items-center gap-2 hover:text-cyan-600"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />

                    <span className="truncate">
                      {staffMember.email}
                    </span>
                  </a>
                )}

                <p>
                  <span className="font-medium text-gray-700">
                    Joined:
                  </span>{' '}
                  {formatDate(
                    staffMember.joiningDate,
                  )}
                </p>

                <p>
                  <span className="font-medium text-gray-700">
                    Monthly salary:
                  </span>{' '}
                  {formatCurrency(
                    staffMember.salary,
                  )}
                </p>

                {staffMember.notes && (
                  <p className="rounded-xl bg-gray-50 p-3">
                    {staffMember.notes}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-1 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    toggleStaffStatus(
                      staffMember.id,
                    )
                  }
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium ${
                    staffMember.status ===
                    'Active'
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {staffMember.status ===
                  'Active' ? (
                    <>
                      <UserX className="h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Activate
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openEditForm(staffMember)
                  }
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteStaff(staffMember.id)
                  }
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ),
        )}
      </div>

      {filteredStaff.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-gray-300" />

          <p className="mt-3 text-gray-500">
            No matching staff records found.
          </p>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStaffId !== null
                    ? 'Edit Staff Member'
                    : 'Add Staff Member'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the employee’s current details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close staff form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveStaff}
              className="space-y-5 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full name *
                  </label>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        'name',
                        event.target.value,
                      )
                    }
                    placeholder="Staff member name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Role *
                  </label>

                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(event) =>
                      updateForm(
                        'role',
                        event.target.value,
                      )
                    }
                    placeholder="Legal Consultant, Paralegal..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Department
                  </label>

                  <select
                    value={form.department}
                    onChange={(event) =>
                      updateForm(
                        'department',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
                  >
                    <option value="Legal">
                      Legal
                    </option>

                    <option value="Administration">
                      Administration
                    </option>

                    <option value="Sales">
                      Sales
                    </option>

                    <option value="Finance">
                      Finance
                    </option>

                    <option value="Marketing">
                      Marketing
                    </option>

                    <option value="Operations">
                      Operations
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Employment status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        'status',
                        event.target
                          .value as StaffStatus,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        'phone',
                        event.target.value,
                      )
                    }
                    placeholder="+971 50 000 0000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        'email',
                        event.target.value,
                      )
                    }
                    placeholder="staff@shab.ae"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Joining date
                  </label>

                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(event) =>
                      updateForm(
                        'joiningDate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Monthly salary in AED
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salary}
                    onChange={(event) =>
                      updateForm(
                        'salary',
                        event.target.value,
                      )
                    }
                    placeholder="5000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Responsibilities, commission arrangement or internal notes"
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
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
                  className="flex-1 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white hover:bg-cyan-700"
                >
                  {editingStaffId !== null
                    ? 'Save Changes'
                    : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}