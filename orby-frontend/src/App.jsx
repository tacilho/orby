import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users, Settings, Activity, Hexagon, PanelLeftClose, PanelLeftOpen, BarChart2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Team from './pages/Team';
import Reports from './pages/Reports';
import AppSettings from './pages/Settings';
import { AppProvider, useAppContext } from './context/AppContext';
import './index.css';

function Sidebar() {
  const location = useLocation();
  const { tenantConfig } = useAppContext();
  const brandName = tenantConfig?.brandName || 'Orby';
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar_collapsed', newState);
      return newState;
    });
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon">
            <Hexagon size={18} />
          </div>
          <span className="brand-text">{brandName}</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? "Expandir" : "Minimizar"}>
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} title={isCollapsed ? "Dashboard" : ""}>
          <LayoutDashboard size={18} />
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link to="/chat" className={`nav-item ${location.pathname.includes('/chat') ? 'active' : ''}`} title={isCollapsed ? "Atendimento" : ""}>
          <MessageSquare size={18} />
          <span className="nav-text">Atendimento</span>
        </Link>
        <Link to="/team" className={`nav-item ${location.pathname === '/team' ? 'active' : ''}`} title={isCollapsed ? "Equipe" : ""}>
          <Users size={18} />
          <span className="nav-text">Equipe</span>
        </Link>
        <Link to="/reports" className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`} title={isCollapsed ? "Relatórios" : ""}>
          <BarChart2 size={18} />
          <span className="nav-text">Relatórios</span>
        </Link>
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} title={isCollapsed ? "Configurações" : ""}>
          <Settings size={18} />
          <span className="nav-text">Configurações</span>
        </Link>
      </nav>
      
      <div className="sidebar-footer" style={{ 
        marginTop: 'auto', 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} title="Online"></div>
        <div className="status-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>Sistema Online</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Versão 2.0.0</span>
        </div>
      </div>
    </aside>
  );
}

function AppContent() {
  const { tenantConfig } = useAppContext();

  useEffect(() => {
    if (tenantConfig?.primaryColor) {
      document.documentElement.style.setProperty('--accent-color', tenantConfig.primaryColor);
    }
  }, [tenantConfig?.primaryColor]);

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/team" element={<Team />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<AppSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
