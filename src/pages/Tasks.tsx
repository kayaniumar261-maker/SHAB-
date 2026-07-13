import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
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

const TASKS_STORAGE_KEY = 'shab-tasks';

const initialTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Prepare legal notice',
    description: 'Draft and review the debt recovery legal notice.',
    assignedTo: 'Umar Kayani',
    relatedCase: 'SHAB-2026-001',
    dueDate: '2026-07-15',
    priority: 'High',
    completed: false,
  },
  {
    id: 2,
    title: 'Call client for documents',
    description: 'Request Emirates ID, agreement and payment receipts.',
    assignedTo: 'Nourhan',
    relatedCase: 'SHAB-2026-002',
    dueDate: '2026-07-16',
    priority: 'Medium',
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

export function Tasks() {
  const [tasks, setTasks] =
    useState<TaskItem[]>(loadTasks);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify(tasks),
    );
  }, [tasks]);

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

  const addTask = () => {
    const title = window.prompt('Enter task title');

    if (!title?.trim()) {
      return;
    }

    const description =
      window.prompt('Enter task description')?.trim() || '';

    const assignedTo =
      window.prompt('Enter assigned staff member')?.trim() ||
      'Unassigned';

    const relatedCase =
      window.prompt('Enter related case reference')?.trim() ||
      '';

    const dueDate =
      window.prompt(
        'Enter due date in YYYY-MM-DD format',
      )?.trim() || '';

    const priorityInput =
      window.prompt(
        'Enter priority: High, Medium or Low',
      )?.trim() || 'Medium';

    const normalizedPriority =
      priorityInput.toLowerCase();

    const priority: TaskPriority =
      normalizedPriority === 'high'
        ? 'High'
        : normalizedPriority === 'low'
          ? 'Low'
          : 'Medium';

    const newTask: TaskItem = {
      id: Date.now(),
      title: title.trim(),
      description,
      assignedTo,
      relatedCase,
      dueDate,
      priority,
      completed: false,
    };

    setTasks((currentTasks) => [
      newTask,
      ...currentTasks,
    ]);
  };

  const editTask = (task: TaskItem) => {
    const title = window.prompt(
      'Edit task title',
      task.title,
    );

    if (!title?.trim()) {
      return;
    }

    const description =
      window.prompt(
        'Edit task description',
        task.description,
      ) ?? task.description;

    const assignedTo =
      window.prompt(
        'Edit assigned staff member',
        task.assignedTo,
      ) ?? task.assignedTo;

    const relatedCase =
      window.prompt(
        'Edit related case reference',
        task.relatedCase,
      ) ?? task.relatedCase;

    const dueDate =
      window.prompt(
        'Edit due date',
        task.dueDate,
      ) ?? task.dueDate;

    const priorityInput =
      window.prompt(
        'Edit priority: High, Medium or Low',
        task.priority,
      ) ?? task.priority;

    const normalizedPriority =
      priorityInput.trim().toLowerCase();

    const priority: TaskPriority =
      normalizedPriority === 'high'
        ? 'High'
        : normalizedPriority === 'low'
          ? 'Low'
          : 'Medium';

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              title: title.trim(),
              description: description.trim(),
              assignedTo: assignedTo.trim(),
              relatedCase: relatedCase.trim(),
              dueDate: dueDate.trim(),
              priority,
            }
          : currentTask,
      ),
    );
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
          onClick={addTask}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Add Task
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Open tasks</p>
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
                    {task.assignedTo}
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
                    onClick={() => editTask(task)}
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
    </div>
  );
}