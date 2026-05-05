import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, Hexagon, PanelLeftClose, PanelLeftOpen, BarChart2, LayoutList } from 'lucide-react';
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

  const navItems = [
    { path: '/', label: 'Chamados', icon: LayoutList, exact: true },
    { path: '/chat', label: 'Atendimento', icon: MessageSquare },
    { path: '/team', label: 'Equipe', icon: Users, exact: true },
    { path: '/reports', label: 'Relatórios', icon: BarChart2, exact: true },
    { path: '/settings', label: 'Configurações', icon: Settings, exact: true },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.includes(item.path);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand / Logo — aligned with nav icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem' }}>
          <div className="brand-icon">
            <Hexagon size={16} />
          </div>
          {!isCollapsed && (
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', flex: 1 }}>
              {brandName}
            </span>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir' : 'Minimizar'}
          style={{ marginLeft: isCollapsed ? 'auto' : '0.75rem', marginRight: isCollapsed ? 'auto' : 0 }}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-item ${isActive(item) ? 'active' : ''}`} 
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={17} />
              {!isCollapsed && <span className="nav-text">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
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
