import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { Sidebar } from './components/layout/sidebar';
import { MobileNav } from './components/layout/MobileNav';

import { Dashboard } from './Pages/Dashboard';
import { Clients } from './Pages/Clients';

import { Cases } from './pages/Cases';
import { Tasks } from './pages/Tasks';
import { CalendarPage } from './pages/CalendarPage';
import { More } from './pages/More';
import { Documents } from './pages/Documents';
import { LegalNotices } from './pages/LegalNotices';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Staff } from './pages/Staff';
import { Quotations } from './pages/Quotations';

import { Payments } from './Src/Pages/Payments';

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