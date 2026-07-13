import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { MobileNav } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/sidebar';

import { Dashboard } from './Pages/Dashboard';
import { Clients } from './Pages/Clients';

import { AIAssistant } from './pages/AIAssistant';
import { CalendarPage } from './pages/CalendarPage';
import { Cases } from './pages/Cases';
import { Documents } from './pages/Documents';
import { Hearings } from './pages/Hearings';
import { LegalNotices } from './pages/LegalNotices';
import { More } from './pages/More';
import { Notifications } from './pages/Notifications';
import { Quotations } from './pages/Quotations';
import { Settings } from './pages/Settings';
import { Staff } from './pages/Staff';
import { Tasks } from './pages/Tasks';

import { Payments } from '../Src/Pages/Payments';

function App() {
  return (
    <BrowserRouter basename="/SHAB-/">
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="pb-24 lg:ml-64 lg:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/clients" element={<Clients />} />

            <Route path="/cases" element={<Cases />} />

            <Route path="/tasks" element={<Tasks />} />

            <Route
              path="/calendar"
              element={<CalendarPage />}
            />

            <Route
              path="/hearings"
              element={<Hearings />}
            />

            <Route
              path="/documents"
              element={<Documents />}
            />

            <Route
              path="/legal-notices"
              element={<LegalNotices />}
            />

            <Route
              path="/payments"
              element={<Payments />}
            />

            <Route
              path="/quotations"
              element={<Quotations />}
            />

            <Route path="/staff" element={<Staff />} />

            <Route
              path="/ai-assistant"
              element={<AIAssistant />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route path="/more" element={<More />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>

        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;