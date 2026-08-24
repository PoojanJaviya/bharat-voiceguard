import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DemoProvider, useDemo } from './context/DemoContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import TopBar from './components/TopBar.tsx';
import DemoControlPanel from './components/DemoControlPanel.tsx';

// Import Views
import Dashboard from './views/Dashboard.tsx';
import LiveCall from './views/LiveCall.tsx';
import CallHistory from './views/CallHistory.tsx';
import CallDetail from './views/CallDetail.tsx';
import RiskAnalysis from './views/RiskAnalysis.tsx';
import TrustedContacts from './views/TrustedContacts.tsx';
import Verification from './views/Verification.tsx';
import Privacy from './views/Privacy.tsx';
import Settings from './views/Settings.tsx';

// Helper component to synchronize react-router-dom path with DemoContext activeRoute
const RouteSync: React.FC = () => {
  const location = useLocation();
  const { setActiveRoute } = useDemo();

  React.useEffect(() => {
    // Normalise pathname
    let path = location.pathname;
    if (path.startsWith('/history/')) {
      setActiveRoute('/history');
    } else {
      setActiveRoute(path);
    }
  }, [location, setActiveRoute]);

  return null;
};

const AppContent: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-950 text-gray-100 font-sans">
      <RouteSync />
      
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <TopBar />

        {/* Views Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-call" element={<LiveCall />} />
            <Route path="/history" element={<CallHistory />} />
            <Route path="/history/:id" element={<CallDetail />} />
            <Route path="/risk-analysis" element={<RiskAnalysis />} />
            <Route path="/trusted-contacts" element={<TrustedContacts />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Demo Scenario Control Panel (sticky at bottom for SIH presentation) */}
        <DemoControlPanel />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </Router>
  );
};

export default App;
