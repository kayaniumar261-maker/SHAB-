import {
  Bell,
  Bot,
  Briefcase,
  Calendar,
  CheckSquare,
  ChevronRight,
  FileText,
  ReceiptText,
  Scale,
  Settings,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const items = [
  {
    label: 'Clients',
    path: '/clients',
    icon: Users,
  },
  {
    label: 'Cases',
    path: '/cases',
    icon: Briefcase,
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Documents',
    path: '/documents',
    icon: FileText,
  },
  {
    label: 'Legal Notices',
    path: '/legal-notices',
    icon: Scale,
  },
  {
    label: 'Payments',
    path: '/payments',
    icon: Wallet,
  },
  {
    label: 'Quotations',
    path: '/quotations',
    icon: ReceiptText,
  },
  {
    label: 'Staff Management',
    path: '/staff',
    icon: UserRound,
  },
  {
    label: 'AI Assistant',
    path: '/ai-assistant',
    icon: Bot,
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: Bell,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export function More() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          More
        </h1>

        <p className="mt-1 text-gray-500">
          Open additional SHAB modules.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-yellow-400 hover:bg-yellow-50"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-xl bg-gray-100 p-3">
                  <Icon className="h-5 w-5 text-gray-700" />
                </span>

                <span className="truncate font-semibold text-gray-900">
                  {item.label}
                </span>
              </span>

              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}