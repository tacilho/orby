import React, { useMemo, useEffect, useState } from 'react';
import { Clock, Activity, AlertCircle, CheckCircle2, Timer, Monitor, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const GiantCard = ({ title, value, icon: Icon, color, subvalue }) => (
  <div className="panel" style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '4rem 2rem',
    textAlign: 'center',
    border: 'none',
    background: 'var(--bg-panel)',
    boxShadow: 'var(--shadow-lg)',
    borderRadius: '24px',
    height: '100%'
  }}>
    <div style={{ 
      width: '80px', 
      height: '80px', 
      borderRadius: '24px', 
      background: `${color}15`, 
      color: color, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginBottom: '2rem'
    }}>
      <Icon size={40} />
    </div>
    <div style={{ fontSize: '6rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-primary)' }}>
      {value}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {title}
    </div>
    {subvalue && (
      <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 500 }}>
        {subvalue}
      </div>
    )}
  </div>
);

function Wallboard() {
  const { tickets } = useAppContext();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000); // Update every 5s for TV
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

    return { open, inProgress, closedToday, avgWait, avgHandling };
  }, [tickets, now]);

  return (
    <div style={{ 
      height: 'calc(100vh - 4rem)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2.5rem',
      padding: '1rem'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--accent-color)', color: 'var(--accent-text)', borderRadius: '12px' }}>
            <Monitor size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Live Monitor</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
              SISTEMA OPERACIONAL
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>

      {/* Main Grid - 4 Huge Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '2.5rem',
        flex: 1
      }}>
        <GiantCard title="Fila de Espera" value={stats.open} icon={AlertCircle} color="var(--warning)" subvalue="Chamados aguardando" />
        <GiantCard title="Tempo Médio Espera" value={`${stats.avgWait}m`} icon={Clock} color="#A855F7" subvalue="Minutos na fila" />
        <GiantCard title="Em Atendimento" value={stats.inProgress} icon={Activity} color="var(--info)" subvalue="Operadores ativos" />
        <GiantCard title="Finalizados Hoje" value={stats.closedToday} icon={CheckCircle2} color="var(--success)" subvalue="Meta diária" />
      </div>

      {/* Bottom Bar Metrics */}
      <div className="panel" style={{ 
        padding: '1.5rem 3rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'var(--bg-panel)',
        borderRadius: '20px',
        border: 'none',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Timer size={32} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TMA (Atendimento)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>{stats.avgHandling} min</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ShieldCheck size={32} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Uptime Global</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--info)' }}>99.98%</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Suporte Online</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>12 Operadores</div>
          </div>
          <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--bg-panel)', background: 'var(--accent-color)', marginLeft: '-10px' }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default Wallboard;
