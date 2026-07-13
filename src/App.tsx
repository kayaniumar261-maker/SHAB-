import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Dashboard } from './Pages/Dashboard';

function App() {
  return (
    <BrowserRouter basename="/SHAB-/">
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64 pb-20 lg:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
