import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  FileText, 
  File, 
  Scale, 
  Sparkles, 
  Settings,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/cases', icon: Briefcase, label: 'Cases' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/payments', icon: DollarSign, label: 'Payments' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/quotations', icon: File, label: 'Quotations' },
  { path: '/legal-notices', icon: Scale, label: 'Legal Notices' },
  { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200">
        <div className="w-8 h-8 bg-[#1a2332] rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">SHAB Legal</h1>
          <p className="text-[10px] text-gray-500">Practice Manager</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-[10px] text-gray-400">
          SHAB Legal Consultants FZC
          <br />
          v1.0.0
        </div>
      </div>
    </div>
  );
}
