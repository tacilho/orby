import React, { useMemo, useEffect, useState } from 'react';
import { Clock, Activity, AlertCircle, CheckCircle2, Timer, TrendingUp, Monitor, BarChart3, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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

function Dashboard() {
  const { tickets } = useAppContext();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const closedToday = tickets.filter(t => {
      if (t.status !== 'closed') return false;
      const closedDate = new Date(t.closedAt);
      return closedDate.toDateString() === now.toDateString();
    }).length;

    let totalWait = 0;
    let waitCount = 0;
    tickets.filter(t => t.status === 'open').forEach(t => {
      totalWait += now - new Date(t.createdAt);
      waitCount++;
    });
    const avgWait = waitCount > 0 ? Math.floor(totalWait / waitCount / 60000) : 0;

    let totalHandling = 0;
    let handlingCount = 0;
    tickets.filter(t => t.status === 'closed').forEach(t => {
      if (t.closedAt && t.acceptedAt) {
        totalHandling += new Date(t.closedAt) - new Date(t.acceptedAt);
        handlingCount++;
      }
    });
    const avgHandling = handlingCount > 0 ? Math.floor(totalHandling / handlingCount / 60000) : 0;

    const reasons = tickets.reduce((acc, t) => {
      if (t.reason) acc[t.reason] = (acc[t.reason] || 0) + 1;
      return acc;
    }, {});
    const topReasons = Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { open, inProgress, closedToday, avgWait, avgHandling, topReasons };
  }, [tickets, now]);

  return (
    <div style={{ 
      height: 'calc(100vh - 4rem)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.25rem',
      overflow: 'hidden' // Prevent scrolling
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.125rem' }}>Dashboard Unificado</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Monitoramento operacional e gerencial em tempo real.</p>
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
        <UnifiedCard title="Aguardando" value={stats.open} icon={AlertCircle} color="var(--warning)" subvalue="Fila de espera" />
        <UnifiedCard title="Em Atendimento" value={stats.inProgress} icon={Activity} color="var(--info)" subvalue="Operadores ativos" />
        <UnifiedCard title="T.M.E. Médio" value={`${stats.avgWait}m`} icon={Clock} color="#A855F7" subvalue="Tempo de espera" />
        <UnifiedCard title="Finalizados Hoje" value={stats.closedToday} icon={CheckCircle2} color="var(--success)" subvalue="Total do dia" />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1.25rem',
        flex: 1,
        minHeight: 0 // Crucial for overflow child to work
      }}>
        {/* Performance Section */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <h3 className="section-header-title"><TrendingUp size={16} /> Desempenho por Setor</h3>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {['Suporte N1', 'Suporte N2', 'Financeiro', 'Comercial'].map(sector => {
              const count = tickets.filter(t => t.sector === sector && t.status !== 'closed').length;
              const percentage = Math.min(100, (count / 15) * 100);
              return (
                <div key={sector}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600 }}>{sector}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} chamados</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent-color)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demands Section */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <h3 className="section-header-title"><BarChart3 size={16} /> Demandas Mais Frequentes</h3>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            {stats.topReasons.map(([reason, count], idx) => (
              <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', width: '20px' }}>{idx + 1}</div>
                <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>{reason}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-color)' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="panel" style={{ 
        padding: '0.75rem 1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'var(--bg-active)',
        border: 'none'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Timer size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>TMA Médio:</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{stats.avgHandling} min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Monitor size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Sistema:</span>
            <span style={{ fontWeight: 700, color: 'var(--info)' }}>Estável (99.9%)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid var(--bg-panel)', background: 'var(--accent-color)', marginLeft: i > 1 ? '-6px' : 0 }} />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>8 operadores online</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
