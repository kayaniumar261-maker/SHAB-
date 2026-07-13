import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/cases', icon: Briefcase, label: 'Cases' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg transition-colors",
                isActive(item.path)
                  ? "text-[#c9a84c]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg transition-colors",
              location.pathname === '/settings'
                ? "text-[#c9a84c]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
