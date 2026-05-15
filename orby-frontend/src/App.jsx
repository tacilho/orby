import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, Hexagon, PanelLeftClose, PanelLeftOpen, BarChart2, LayoutList, Sun, Moon, CheckCircle, XCircle, Info, Monitor, FileBarChart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Chat from './pages/Chat';
import Team from './pages/Team';
import Reports from './pages/Reports';
import AppSettings from './pages/Settings';
import { AppProvider, useAppContext } from './context/AppContext';
import './index.css';

function Sidebar() {
  const location = useLocation();
  const { tenantConfig, activeThemeId, toggleTheme, tickets } = useAppContext();
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

  const aguardandoCount = tickets.filter(t => t.status === 'open').length;

  const navItems = [
    { path: '/', label: 'Chamados', icon: LayoutList, exact: true, badge: aguardandoCount },
    { path: '/chat', label: 'Atendimento', icon: MessageSquare },
    { path: '/dashboard', label: 'Dashboard', icon: Monitor, exact: true },
    { path: '/team', label: 'Equipe', icon: Users, exact: true },
    { path: '/reports', label: 'Relatórios', icon: FileBarChart, exact: true },
    { path: '/settings', label: 'Configurações', icon: Settings, exact: true },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.includes(item.path);
  };

  const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

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
              <div className="nav-icon-wrapper">
                <Icon size={17} />
                {item.badge > 0 && (
                  <div className="nav-badge">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              {!isCollapsed && <span className="nav-text">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <button
          className="nav-item"
          onClick={toggleTheme}
          title={isCollapsed ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          {!isCollapsed && <span className="nav-text">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>
      </div>
    </aside>
  );
}

/* Helper: hex -> HSL components */
function hexToHSL(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isLightHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function ToastContainer() {
  const { toasts } = useAppContext();
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
          padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: '240px', borderLeft: `4px solid ${t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--info)'}`
        }}>
          {t.type === 'success' ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : 
           t.type === 'error' ? <XCircle size={18} style={{ color: 'var(--danger)' }} /> : 
           <Info size={18} style={{ color: 'var(--info)' }} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  // AppContent is now minimal as theme application is handled by AppContext
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Tickets />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<AppSettings />} />
          </Routes>
        </main>
        <ToastContainer />
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
