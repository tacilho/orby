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
  const { tenantConfig, theme, toggleTheme, tickets } = useAppContext();
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
          title={isCollapsed ? (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : ''}
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {!isCollapsed && <span className="nav-text">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
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
  const { tenantConfig, theme } = useAppContext();

  useEffect(() => {
    const root = document.documentElement;
    const primary = tenantConfig?.primaryColor || '#EAEAEA';
    const accent2 = tenantConfig?.accent2;

    // Always apply accent color
    root.style.setProperty('--accent-color', primary);
    root.style.setProperty('--accent-text', isLightHex(primary) ? '#000000' : '#FFFFFF');
    if (accent2) root.style.setProperty('--info', accent2);

    // Clear ALL surface/border inline overrides first so CSS :root / [data-theme] rules take effect
    const surfaceVars = ['--bg-app', '--bg-panel', '--bg-hover', '--bg-active', '--border-color', '--border-focus', '--border-subtle', '--bg-sidebar'];
    surfaceVars.forEach(v => root.style.removeProperty(v));

    if (theme === 'light') {
      // In light mode: generate tinted surfaces from the primary color
      const { h, s } = hexToHSL(primary);
      const isNeutral = s < 10; // grayscale accent

      if (isNeutral) {
        // For neutral/gray accents, use a cool-tinted light palette
        root.style.setProperty('--bg-app', '#F3F4F6');
        root.style.setProperty('--bg-panel', '#FFFFFF');
        root.style.setProperty('--bg-hover', '#EBEDF1');
        root.style.setProperty('--bg-active', '#E0E2E8');
        root.style.setProperty('--border-color', '#D4D6DC');
        root.style.setProperty('--border-focus', '#AEB2BC');
        root.style.setProperty('--border-subtle', '#E6E8EC');
      } else {
        // For colored accents, tint the surfaces with the hue
        const tintS = Math.min(s, 30); // subtle saturation for backgrounds
        root.style.setProperty('--bg-app', `hsl(${h}, ${tintS}%, 96%)`);
        root.style.setProperty('--bg-panel', `hsl(${h}, ${Math.min(s, 20)}%, 99%)`);
        root.style.setProperty('--bg-hover', `hsl(${h}, ${tintS}%, 93%)`);
        root.style.setProperty('--bg-active', `hsl(${h}, ${tintS}%, 90%)`);
        root.style.setProperty('--border-color', `hsl(${h}, ${Math.min(s, 20)}%, 85%)`);
        root.style.setProperty('--border-focus', `hsl(${h}, ${Math.min(s, 25)}%, 72%)`);
        root.style.setProperty('--border-subtle', `hsl(${h}, ${Math.min(s, 15)}%, 90%)`);
      }
    } else {
      // In dark mode: apply whitelabel dark palette if custom values are set
      const sidebarColor = tenantConfig?.sidebarColor;
      const panelBg = tenantConfig?.panelBg;
      const appBg = tenantConfig?.appBg;

      if (appBg) root.style.setProperty('--bg-app', appBg);
      if (panelBg) root.style.setProperty('--bg-panel', panelBg);
      if (sidebarColor) root.style.setProperty('--bg-sidebar', sidebarColor);
      // --bg-hover, --bg-active, --border-* fall back to :root CSS defaults
    }
  }, [tenantConfig?.primaryColor, tenantConfig?.accent2, tenantConfig?.sidebarColor, tenantConfig?.panelBg, tenantConfig?.appBg, theme]);

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
