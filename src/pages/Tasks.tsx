import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type TaskPriority = 'High' | 'Medium' | 'Low';

type TaskItem = {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  relatedCase: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
};

type TaskForm = Omit<TaskItem, 'id' | 'completed'>;

type StoredCase = {
  id: number;
  title: string;
  reference: string;
};

const TASKS_STORAGE_KEY = 'shab-tasks';
const CASES_STORAGE_KEY = 'shab-cases';

const emptyForm: TaskForm = {
  title: '',
  description: '',
  assignedTo: '',
  relatedCase: '',
  dueDate: '',
  priority: 'Medium',
};

const initialTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Prepare legal notice',
    description:
      'Draft and review the debt recovery legal notice.',
    assignedTo: 'Umar Kayani',
    relatedCase: 'SHAB-2026-001',
    dueDate: '2026-07-15',
    priority: 'High',
    completed: false,
  },
];

function loadTasks(): TaskItem[] {
  try {
    const savedTasks = window.localStorage.getItem(
      TASKS_STORAGE_KEY,
    );

    if (!savedTasks) {
      return initialTasks;
    }

    const parsedTasks = JSON.parse(savedTasks);

    return Array.isArray(parsedTasks)
      ? parsedTasks
      : initialTasks;
  } catch {
    return initialTasks;
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

export function Tasks() {
  const [tasks, setTasks] =
    useState<TaskItem[]>(loadTasks);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<TaskForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify(tasks),
    );
  }, [tasks]);

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

  const filteredTasks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search ||
        [
          task.title,
          task.description,
          task.assignedTo,
          task.relatedCase,
          task.priority,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search);

      const matchesCompletion =
        showCompleted || !task.completed;

      return matchesSearch && matchesCompletion;
    });
  }, [tasks, searchTerm, showCompleted]);

  const openAddForm = () => {
    setEditingTaskId(null);

    setForm({
      ...emptyForm,
      assignedTo: 'Umar Kayani',
      relatedCase: cases[0]?.reference || '',
    });

    setIsFormOpen(true);
  };

  const openEditForm = (task: TaskItem) => {
    setEditingTaskId(task.id);

    setForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      relatedCase: task.relatedCase,
      dueDate: task.dueDate,
      priority: task.priority,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
    setForm(emptyForm);
  };

  const updateForm = (
    field: keyof TaskForm,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveTask = (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert('Task title is required.');
      return;
    }

    if (editingTaskId !== null) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
                assignedTo: form.assignedTo.trim(),
                relatedCase: form.relatedCase.trim(),
                dueDate: form.dueDate.trim(),
              }
            : task,
        ),
      );
    } else {
      const newTask: TaskItem = {
        id: Date.now(),
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo.trim(),
        relatedCase: form.relatedCase.trim(),
        dueDate: form.dueDate.trim(),
        completed: false,
      };

      setTasks((currentTasks) => [
        newTask,
        ...currentTasks,
      ]);
    }

    closeForm();
  };

  const toggleTask = (id: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );
  };

  const deleteTask = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );

    if (!confirmed) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    );
  };

  const priorityClasses: Record<TaskPriority, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  const openTaskCount = tasks.filter(
    (task) => !task.completed,
  ).length;

  const completedTaskCount = tasks.filter(
    (task) => task.completed,
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tasks
          </h1>

          <p className="mt-1 text-gray-500">
            Assign, track and complete SHAB work.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Add Task
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Open tasks
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {openTaskCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {completedTaskCount}
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
          placeholder="Search tasks, staff or case reference"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(event) =>
            setShowCompleted(event.target.checked)
          }
          className="h-4 w-4 rounded"
        />

        Show completed tasks
      </label>

      <div className="mt-6 space-y-4">
        {filteredTasks.map((task) => (
          <article
            key={task.id}
            className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${
              task.completed ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="mt-1 shrink-0"
                aria-label={
                  task.completed
                    ? 'Mark task as incomplete'
                    : 'Mark task as completed'
                }
              >
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className={`font-semibold text-gray-900 ${
                        task.completed
                          ? 'line-through'
                          : ''
                      }`}
                    >
                      {task.title}
                    </h2>

                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-gray-700">
                      Assigned to:
                    </span>{' '}
                    {task.assignedTo || 'Unassigned'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Case:
                    </span>{' '}
                    {task.relatedCase || 'Not linked'}
                  </p>

                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />

                    <span>
                      {task.dueDate || 'No due date'}
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(task)}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
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

        {filteredTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No matching tasks found.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTaskId !== null
                    ? 'Edit Task'
                    : 'Add Task'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the task details and assignment.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close task form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveTask}
              className="space-y-5 p-5"
            >
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Task title *
                </label>

                <input
                  id="task-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      'title',
                      event.target.value,
                    )
                  }
                  placeholder="Prepare legal notice"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="task-description"
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      'description',
                      event.target.value,
                    )
                  }
                  placeholder="Describe the required work"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-assigned"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Assigned to
                  </label>

                  <input
                    id="task-assigned"
                    type="text"
                    value={form.assignedTo}
                    onChange={(event) =>
                      updateForm(
                        'assignedTo',
                        event.target.value,
                      )
                    }
                    placeholder="Staff member"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-case"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Related case
                  </label>

                  {cases.length > 0 ? (
                    <select
                      id="task-case"
                      value={form.relatedCase}
                      onChange={(event) =>
                        updateForm(
                          'relatedCase',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="">
                        No linked case
                      </option>

                      {cases.map((caseItem) => (
                        <option
                          key={caseItem.id}
                          value={caseItem.reference}
                        >
                          {caseItem.reference} — {caseItem.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="task-case"
                      type="text"
                      value={form.relatedCase}
                      onChange={(event) =>
                        updateForm(
                          'relatedCase',
                          event.target.value,
                        )
                      }
                      placeholder="Case reference"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Due date
                  </label>

                  <input
                    id="task-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm(
                        'dueDate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Priority
                  </label>

                  <select
                    id="task-priority"
                    value={form.priority}
                    onChange={(event) =>
                      updateForm(
                        'priority',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
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
                  className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                >
                  {editingTaskId !== null
                    ? 'Save Changes'
                    : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}