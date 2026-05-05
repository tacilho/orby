import React, { useState, useMemo } from 'react';
import {
  BarChart2, TrendingUp, Clock, CheckCircle2, Search,
  Download, Users, ArrowUpRight, ArrowDownRight,
  Layers, Activity, FileText, Zap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Reports.css';

/* ── Pure-CSS Donut Chart ─────────────────────────────── */
function DonutChart({ segments, total, label }) {
  const size = 130;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg className="donut-chart" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-active)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * c;
        const el = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50%" y="46%" textAnchor="middle" className="donut-chart-center-text">{total}</text>
      <text x="50%" y="58%" textAnchor="middle" className="donut-chart-center-label">{label}</text>
    </svg>
  );
}

/* ── Mock data generators ─────────────────────────────── */
function useMockData(dateRange, tickets, ticketReasons) {
  return useMemo(() => {
    const multiplier = dateRange === '30d' ? 4 : dateRange === 'hoje' ? 0.3 : 1;

    const totalTickets = Math.round(27 * multiplier);
    const closedTickets = Math.round(22 * multiplier);
    const openTickets = Math.round(3 * multiplier);
    const waitingTickets = totalTickets - closedTickets - openTickets;
    const avgTime = dateRange === 'hoje' ? '02m 48s' : dateRange === '30d' ? '05m 32s' : '04m 12s';

    const dailyData = [
      { label: 'Seg', value: Math.round(5 * multiplier), closed: Math.round(4 * multiplier) },
      { label: 'Ter', value: Math.round(8 * multiplier), closed: Math.round(7 * multiplier) },
      { label: 'Qua', value: Math.round(6 * multiplier), closed: Math.round(5 * multiplier) },
      { label: 'Qui', value: Math.round(9 * multiplier), closed: Math.round(8 * multiplier) },
      { label: 'Sex', value: Math.round(7 * multiplier), closed: Math.round(6 * multiplier) },
      { label: 'Sáb', value: Math.round(3 * multiplier), closed: Math.round(3 * multiplier) },
      { label: 'Dom', value: Math.round(1 * multiplier), closed: Math.round(1 * multiplier) },
    ];

    const maxDaily = Math.max(...dailyData.map(d => d.value), 1);

    const sectors = [
      { label: 'Suporte Técnico', value: 65, color: '#6390FF' },
      { label: 'Financeiro', value: 25, color: '#F59E0B' },
      { label: 'Comercial', value: 10, color: '#10B981' },
    ];

    const operators = [
      { name: 'Você', tickets: Math.round(14 * multiplier), avgTime: '03m 22s', satisfaction: 96 },
      { name: 'Carlos M.', tickets: Math.round(10 * multiplier), avgTime: '05m 10s', satisfaction: 91 },
      { name: 'Ana P.', tickets: Math.round(6 * multiplier), avgTime: '04m 45s', satisfaction: 94 },
    ];

    const reasons = ticketReasons.map((r, i) => ({
      label: r.title,
      value: Math.max(2, Math.round((15 - i * 3) * multiplier)),
    }));
    const maxReason = Math.max(...reasons.map(r => r.value), 1);

    const recentActivity = [
      { time: '11:42', title: 'TCK-092 encerrado por Você', desc: 'Motivo: Suporte Técnico', color: 'var(--success)' },
      { time: '11:30', title: 'TCK-095 criado', desc: 'Cliente: Nova Empresa Ltda.', color: '#6390FF' },
      { time: '10:55', title: 'TCK-093 transferido para N2', desc: 'Operador: Carlos M.', color: 'var(--warning)' },
      { time: '10:32', title: 'TCK-092 assumido por Você', desc: 'Setor: Suporte N1', color: '#A855F7' },
      { time: '09:15', title: 'TCK-091 encerrado por Carlos M.', desc: 'Motivo: Financeiro', color: 'var(--success)' },
    ];

    return {
      totalTickets, closedTickets, openTickets, waitingTickets, avgTime,
      dailyData, maxDaily, sectors, operators, reasons, maxReason, recentActivity,
    };
  }, [dateRange, tickets, ticketReasons]);
}

/* ── Main Component ───────────────────────────────────── */
function Reports() {
  const { tickets, ticketReasons } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [clientSearch, setClientSearch] = useState('');

  const data = useMockData(dateRange, tickets, ticketReasons);

  const dateOptions = [
    { value: 'hoje', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <Layers size={15} /> },
    { id: 'operators', label: 'Operadores', icon: <Users size={15} /> },
    { id: 'activity', label: 'Atividade', icon: <Activity size={15} /> },
  ];

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Relatórios</h1>
        </div>
        <div className="reports-header-actions">
          <button className="btn">
            <Download size={15} /> Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`reports-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-group">
          <span className="filter-label">Período:</span>
          {dateOptions.map(opt => (
            <button
              key={opt.value}
              className={`filter-chip ${dateRange === opt.value ? 'active' : ''}`}
              onClick={() => setDateRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="filter-search">
          <Search size={13} />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'operators' && <OperatorsTab data={data} />}
      {activeTab === 'activity' && <ActivityTab data={data} />}
    </div>
  );
}

/* ── Overview Tab ─────────────────────────────────────── */
function OverviewTab({ data }) {
  const metrics = [
    { label: 'Total de Atendimentos', value: data.totalTickets, change: '+12%', positive: true, icon: <BarChart2 size={14} />, colorClass: 'blue' },
    { label: 'Encerrados', value: data.closedTickets, change: '+8%', positive: true, icon: <CheckCircle2 size={14} />, colorClass: 'green' },
    { label: 'Em Andamento', value: data.openTickets, change: '-3%', positive: true, icon: <Zap size={14} />, colorClass: 'amber' },
    { label: 'Tempo Médio', value: data.avgTime, change: '-15%', positive: true, icon: <Clock size={14} />, colorClass: 'purple', isMono: true },
  ];

  const donutSegments = [
    { pct: 56, color: 'var(--success)', label: 'Encerrados' },
    { pct: 32, color: '#6390FF', label: 'Em andamento' },
    { pct: 12, color: 'var(--warning)', label: 'Aguardando' },
  ];

  return (
    <>
      {/* Metric Cards */}
      <div className="metrics-grid">
        {metrics.map((m, i) => (
          <div className="metric-card" key={i}>
            <div className="metric-card-label">
              <div className={`metric-card-icon ${m.colorClass}`}>{m.icon}</div>
              {m.label}
            </div>
            <div className={`metric-card-value ${m.isMono ? 'mono' : ''}`}>{m.value}</div>
            <span className={`metric-card-change ${m.positive ? 'positive' : 'negative'}`}>
              {m.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {m.change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Bar Chart - Daily Volume */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <div className="chart-panel-title">Volume Diário</div>
              <div className="chart-panel-subtitle">Atendimentos por dia da semana</div>
            </div>
          </div>
          <div className="bar-chart">
            {data.dailyData.map((d, i) => (
              <div className="bar-chart-col" key={i}>
                <div
                  className="bar-chart-bar"
                  style={{
                    height: `${Math.max(4, (d.value / data.maxDaily) * 100)}%`,
                    background: `linear-gradient(180deg, #6390FF, rgba(99,144,255,0.4))`,
                  }}
                >
                  <span className="bar-tooltip">{d.value} atend.</span>
                </div>
                <span className="bar-chart-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart - Status Distribution */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <div className="chart-panel-title">Distribuição por Status</div>
              <div className="chart-panel-subtitle">Chamados no período</div>
            </div>
          </div>
          <div className="donut-chart-container">
            <DonutChart segments={donutSegments} total={data.totalTickets} label="total" />
            <div className="donut-legend">
              {donutSegments.map((seg, i) => (
                <div className="donut-legend-item" key={i}>
                  <div className="donut-legend-dot" style={{ background: seg.color }} />
                  <span className="donut-legend-label">{seg.label}</span>
                  <span className="donut-legend-value">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Reasons */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <div className="chart-panel-title">Motivos de Contato</div>
              <div className="chart-panel-subtitle">Tipificação dos chamados encerrados</div>
            </div>
          </div>
          {data.reasons.length > 0 ? (
            <div className="hbar-list">
              {data.reasons.map((r, i) => {
                const colors = ['#6390FF', '#A855F7', '#F59E0B', '#10B981', '#F43F5E'];
                return (
                  <div className="hbar-item" key={i}>
                    <div className="hbar-item-header">
                      <span className="hbar-item-label">{r.label}</span>
                      <span className="hbar-item-value">{r.value}</span>
                    </div>
                    <div className="hbar-track">
                      <div
                        className="hbar-fill"
                        style={{
                          width: `${(r.value / data.maxReason) * 100}%`,
                          background: colors[i % colors.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={32} />
              <p>Nenhum motivo registrado.</p>
            </div>
          )}
        </div>

        {/* Sectors */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <div className="chart-panel-title">Volume por Setor</div>
              <div className="chart-panel-subtitle">Distribuição dos atendimentos</div>
            </div>
          </div>
          <div className="hbar-list">
            {data.sectors.map((s, i) => (
              <div className="hbar-item" key={i}>
                <div className="hbar-item-header">
                  <span className="hbar-item-label">{s.label}</span>
                  <span className="hbar-item-value">{s.value}%</span>
                </div>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${s.value}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Operators Tab ────────────────────────────────────── */
function OperatorsTab({ data }) {
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const positionClass = (i) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'default';

  return (
    <div className="chart-panel" style={{ marginBottom: '1.75rem' }}>
      <div className="chart-panel-header">
        <div>
          <div className="chart-panel-title">Desempenho por Operador</div>
          <div className="chart-panel-subtitle">Ranking baseado no volume e tempo de resposta</div>
        </div>
      </div>
      <table className="ranking-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>#</th>
            <th>Operador</th>
            <th>Chamados</th>
            <th>Tempo Médio</th>
            <th>Satisfação</th>
          </tr>
        </thead>
        <tbody>
          {data.operators.map((op, i) => (
            <tr key={i}>
              <td>
                <span className={`ranking-position ${positionClass(i)}`}>{i + 1}</span>
              </td>
              <td>
                <div className="operator-cell">
                  <div className="operator-avatar">{getInitials(op.name)}</div>
                  <span>{op.name}</span>
                </div>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{op.tickets}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{op.avgTime}</td>
              <td>
                <span style={{
                  color: op.satisfaction >= 95 ? 'var(--success)' : op.satisfaction >= 90 ? 'var(--warning)' : 'var(--danger)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}>
                  {op.satisfaction}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Activity Tab ─────────────────────────────────────── */
function ActivityTab({ data }) {
  return (
    <div className="activity-section">
      <div className="chart-panel-header">
        <div>
          <div className="chart-panel-title">Atividade Recente</div>
          <div className="chart-panel-subtitle">Últimas ações do sistema</div>
        </div>
      </div>
      <div className="activity-list">
        {data.recentActivity.map((item, i) => (
          <div className="activity-item" key={i}>
            <span className="activity-time">{item.time}</span>
            <div className="activity-dot-col">
              <div className="activity-dot" style={{ background: item.color }} />
              {i < data.recentActivity.length - 1 && <div className="activity-line" />}
            </div>
            <div className="activity-content">
              <div className="activity-content-title">{item.title}</div>
              <div className="activity-content-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
