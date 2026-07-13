import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/Components/ui/Button';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  DollarSign, 
  FileText, 
  AlertCircle,
  Plus,
  Scale,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Cases', value: 12, icon: Briefcase, color: 'text-purple-600' },
    { label: 'Tasks Today', value: 8, icon: CheckSquare, color: 'text-green-600' },
    { label: 'Upcoming Hearings', value: 3, icon: CalendarIcon, color: 'text-orange-600' },
    { label: 'Payments Due', value: 5, icon: DollarSign, color: 'text-red-600' },
  ];

  const quickActions = [
    { label: 'Add Client', icon: Users, path: '/clients', color: 'bg-blue-500' },
    { label: 'Add Case', icon: Briefcase, path: '/cases', color: 'bg-purple-500' },
    { label: 'Add Task', icon: CheckSquare, path: '/tasks', color: 'bg-green-500' },
    { label: 'Add Hearing', icon: CalendarIcon, path: '/calendar', color: 'bg-orange-500' },
    { label: 'Add Payment', icon: DollarSign, path: '/payments', color: 'bg-teal-500' },
    { label: 'Add Document', icon: FileText, path: '/documents', color: 'bg-indigo-500' },
    { label: 'Legal Notice', icon: Scale, path: '/legal-notices', color: 'bg-red-500' },
    { label: 'Ask AI', icon: Sparkles, path: '/ai-assistant', color: 'bg-amber-500' },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome to SHAB Legal Practice Manager</p>
        </div>
      </div>

      {/* Morning Briefing */}
      <Card className="mb-6 bg-gradient-to-r from-[#1a2332] to-[#2d3a4f] text-white border-none">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌅</span>
            </div>
            <div>
              <p className="text-sm text-[#c9a84c] font-medium">Good morning, Umar</p>
              <p className="text-sm text-gray-300 mt-1">
                You have <strong className="text-white">8</strong> tasks today,{' '}
                <strong className="text-white">3</strong> hearings, and{' '}
                <strong className="text-white">{formatCurrency(25000)}</strong> in payments due.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-premium">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white border border-gray-100 shadow-premium hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center text-white`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-gray-600 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alert */}
      <Card className="mb-6 border-l-4 border-l-[#c9a84c]">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-sm font-medium">3 unread alerts</span>
            <Button variant="ghost" size="sm" className="ml-auto">
              View All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
