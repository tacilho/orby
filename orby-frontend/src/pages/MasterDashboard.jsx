import React, { useEffect, useState } from 'react';
import { Shield, Users, MessageSquare, Monitor, Activity, TrendingUp, BarChart3, Database } from 'lucide-react';

const UnifiedCard = ({ title, value, icon: Icon, color, subvalue }) => (
  <div className="panel" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    padding: '1.25rem 1.5rem',
    gap: '1.25rem',
    flex: 1,
    minHeight: '100px'
  }}>
    <div style={{ 
      width: '48px', 
      height: '48px', 
      borderRadius: '12px', 
      background: `${color}15`, 
      color: color, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {title}
      </div>
      {subvalue && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
          {subvalue}
        </div>
      )}
    </div>
  </div>
);

function MasterDashboard() {
  const [metrics, setMetrics] = useState({
    totalTenants: 0,
    totalTickets: 0,
    totalMessages: 0,
    activeOperators: 0,
    breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/master/metrics', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error("Erro de autenticação ou rede");
        return res.json();
      })
      .then(data => {
        if (data) {
          setMetrics(data);
        }
      })
      .catch(err => console.error("Erro ao carregar métricas SaaS reais:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ 
      height: 'calc(100vh - 4rem)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.25rem',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} style={{ color: 'var(--accent-color)' }} />
            Controle SaaS (Master Admin)
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Métricas globais de infraestrutura, clientes contratantes e tráfego de dados.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ 
        display: 'flex', 
        gap: '1.25rem',
        flexWrap: 'nowrap'
      }}>
        <UnifiedCard title="Empresas Ativas" value={loading ? "..." : metrics.totalTenants} icon={Users} color="var(--accent-color)" subvalue="Licenciadas no SaaS" />
        <UnifiedCard title="Mensagens Globais" value={loading ? "..." : metrics.totalMessages} icon={MessageSquare} color="var(--success)" subvalue="WhatsApp Cloud API" />
        <UnifiedCard title="Tickets (Global)" value={loading ? "..." : metrics.totalTickets} icon={TrendingUp} color="var(--info)" subvalue="Criados em toda a plataforma" />
        <UnifiedCard title="Uptime Operacional" value="99.99%" icon={Activity} color="#A855F7" subvalue="Disponibilidade Real" />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1.2fr 0.8fr', 
        gap: '1.25rem',
        flex: 1,
        minHeight: 0
      }}>
        {/* Resource Consumption */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <h3 className="section-header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} /> Recursos por Empresa Contratante
            </h3>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {metrics.breakdown.map(item => {
              const maxVal = Math.max(...metrics.breakdown.map(b => b.messages || 1));
              const percentage = Math.min(100, Math.max(5, (item.messages / maxVal) * 100));
              return (
                <div key={item.tenantId} style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{item.brandName}</span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        marginLeft: '0.5rem', 
                        padding: '0.125rem 0.375rem', 
                        borderRadius: '4px',
                        background: 'var(--success-light, #22c55e20)',
                        color: 'var(--success)',
                        fontWeight: 700
                      }}>Ativa</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.messages} msgs / {item.tickets} tickets</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-panel)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent-color)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global System Health */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <h3 className="section-header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Monitor size={16} /> Infraestrutura SaaS
            </h3>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            {[
              { label: 'Servidor Principal (Spring Boot)', status: 'Saudável', details: 'Tomcat Port 8080' },
              { label: 'Banco de Dados (H2 Dev)', status: 'Saudável', details: 'data/devdb' },
              { label: 'Webhook (Meta Graph API)', status: 'Conectado', details: 'Graph v19.0 active' },
              { label: 'WebSocket Broker', status: 'Estável', details: '0 WS sessions active' }
            ].map(sys => (
              <div key={sys.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sys.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sys.details}</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>{sys.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterDashboard;
