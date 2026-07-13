import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  DollarSign,
  File,
  FileText,
  Gavel,
  LayoutDashboard,
  Scale,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

const menuItems = [
  {
    path: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    path: '/clients',
    icon: Users,
    label: 'Clients',
  },
  {
    path: '/cases',
    icon: Briefcase,
    label: 'Cases',
  },
  {
    path: '/tasks',
    icon: CheckSquare,
    label: 'Tasks',
  },
  {
    path: '/calendar',
    icon: Calendar,
    label: 'Calendar',
  },
  {
    path: '/hearings',
    icon: Gavel,
    label: 'Hearings',
  },
  {
    path: '/payments',
    icon: DollarSign,
    label: 'Payments',
  },
  {
    path: '/documents',
    icon: FileText,
    label: 'Documents',
  },
  {
    path: '/quotations',
    icon: File,
    label: 'Quotations',
  },
  {
    path: '/legal-notices',
    icon: Scale,
    label: 'Legal Notices',
  },
  {
    path: '/staff',
    icon: UserRound,
    label: 'Staff',
  },
  {
    path: '/ai-assistant',
    icon: Sparkles,
    label: 'AI Assistant',
  },
  {
    path: '/notifications',
    icon: Bell,
    label: 'Notifications',
  },
  {
    path: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111111]">
          <Building2 className="h-5 w-5 text-[#C9A84C]" />
        </div>

        <div>
          <h1 className="text-sm font-bold text-gray-900">
            SHAB Legal
          </h1>

          <p className="text-[10px] text-gray-500">
            ERP Suite
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#C9A84C]/10 text-[#B89536]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="text-[10px] leading-4 text-gray-400">
          SHAB Legal Consultants FZC
          <br />
          v1.0.0
        </div>
      </div>
    </aside>
  );
}