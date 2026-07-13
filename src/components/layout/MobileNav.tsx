import {
  Home,
  Briefcase,
  CheckSquare,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: Home,
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
    label: 'More',
    path: '/more',
    icon: MoreHorizontal,
  },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden">
      <div className="grid h-20 grid-cols-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-yellow-600'
                    : 'text-gray-500 hover:text-gray-900',
                ].join(' ')
              }
            >
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}