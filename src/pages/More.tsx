import {
  Bell,
  FileText,
  Settings,
  Users,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const items = [
  {
    label: 'Clients',
    path: '/clients',
    icon: Users,
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
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold text-gray-900">More</h1>
      <p className="mt-1 text-gray-500">Open additional SHAB modules.</p>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left shadow-sm"
            >
              <span className="flex items-center gap-3">
                <span className="rounded-xl bg-gray-100 p-3">
                  <Icon className="h-5 w-5 text-gray-700" />
                </span>

                <span className="font-semibold text-gray-900">
                  {item.label}
                </span>
              </span>

              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}