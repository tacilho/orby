import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Download, Search, Users, Building2, Layers, Calendar, Clock, Filter, FileText, Table as TableIcon, Star, UserCheck, ChevronDown, X, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '../components/DateTimePicker';
import Select from '../components/Select';

/* ── Helpers ────────────────────────────────────────── */
const formatDuration = (ms) => {
  if (!ms) return '—';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

const ReportCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="metric-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="metric-card-icon blue">
        <Icon size={18} />
      </div>
      {trend && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: trend > 0 ? 'var(--success)' : 'var(--danger)', background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{title}</div>
      {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtext}</div>}
    </div>
  </div>
);

/* ── Local Filter Component ────────────────────────── */
const SectionFilters = ({ isOpen, onToggle, children, label = "Filtros" }) => (
  <div style={{ borderBottom: isOpen ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-active)', transition: 'all 0.2s', borderRadius: isOpen ? '0' : 'var(--radius-sm)', overflow: 'visible' }}>
    <div 
      style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}
      onClick={onToggle}
    >
      <Filter size={12} /> {isOpen ? `Ocultar ${label}` : `Mostrar ${label}`}
      <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
    </div>
    {isOpen && (
      <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', overflow: 'visible' }}>
        {children}
      </div>
    )}
  </div>
);

function Reports() {
  const { tickets, ticketReasons, ticketSubReasons, showToast } = useAppContext();

  // 1. Summary Filters State
  const [summaryFilter, setSummaryFilter] = useState({
    open: false,
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    end: new Date().toISOString(),
    operator: '',
    sector: ''
  });

  // 2. Reasons Filter State
  const [reasonsFilter, setReasonsFilter] = useState({
    open: false,
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    end: new Date().toISOString(),
    reason: '',
    subReason: '',
    client: ''
  });

  // 3. Evaluations Filter State
  const [evalFilter, setEvalFilter] = useState({
    open: false,
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    end: new Date().toISOString(),
    rating: '',
    operator: '',
    client: ''
  });

  // Derived Summary Stats
  const summaryStats = useMemo(() => {
    const filtered = tickets.filter(t => {
      if (t.status !== 'closed') return false;
      if (t.closedAt < summaryFilter.start || t.closedAt > summaryFilter.end) return false;
      if (summaryFilter.operator && t.operator !== summaryFilter.operator) return false;
      if (summaryFilter.sector && t.sector !== summaryFilter.sector) return false;
      return true;
    });
    
    let totalTMA = 0;
    let totalTME = 0;
    let totalRating = 0;
    let ratedCount = 0;

    filtered.forEach(t => {
      if (t.closedAt && t.acceptedAt) totalTMA += new Date(t.closedAt) - new Date(t.acceptedAt);
      if (t.acceptedAt && t.createdAt) totalTME += new Date(t.acceptedAt) - new Date(t.createdAt);
      if (t.rating) { totalRating += t.rating; ratedCount++; }
    });

    return {
      total: filtered.length,
      avgTMA: filtered.length > 0 ? totalTMA / filtered.length : 0,
      avgTME: filtered.length > 0 ? totalTME / filtered.length : 0,
      satisfaction: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 'N/A'
    };
  }, [tickets, summaryFilter]);

  const handleExport = (name) => {
    showToast(`Gerando arquivo para ${name}...`);
    setTimeout(() => showToast(`Arquivo pronto para download!`, 'success'), 1200);
  };

  const filteredReasonsData = useMemo(() => {
    return tickets.filter(t => {
      if (t.status !== 'closed') return false;
      if (t.closedAt < reasonsFilter.start || t.closedAt > reasonsFilter.end) return false;
      if (reasonsFilter.reason && t.reason !== reasonsFilter.reason) return false;
      if (reasonsFilter.subReason && t.subReason !== reasonsFilter.subReason) return false;
      if (reasonsFilter.client && !t.clientName.toLowerCase().includes(reasonsFilter.client.toLowerCase())) return false;
      return true;
    });
  }, [tickets, reasonsFilter]);

  const filteredEvalData = useMemo(() => {
    return tickets.filter(t => {
      if (t.status !== 'closed' || !t.rating) return false;
      if (t.closedAt < evalFilter.start || t.closedAt > evalFilter.end) return false;
      if (evalFilter.rating && t.rating !== parseInt(evalFilter.rating)) return false;
      if (evalFilter.operator && t.operator !== evalFilter.operator) return false;
      if (evalFilter.client && !t.clientName.toLowerCase().includes(evalFilter.client.toLowerCase())) return false;
      return true;
    });
  }, [tickets, evalFilter]);

  const operatorsList = ['Ana Silva', 'Bruno Souza', 'Carla Dias', 'Diego Lima', 'Elena Rocha'];
  const sectorsList = ['Suporte N1', 'Suporte N2', 'Financeiro', 'Comercial', 'Logística'];

  const operatorOptions = [{ value: '', label: 'Todos os Operadores' }, ...operatorsList.map(o => ({ value: o, label: o }))];
  const sectorOptions = [{ value: '', label: 'Todos os Setores' }, ...sectorsList.map(s => ({ value: s, label: s }))];
  const reasonOptions = [{ value: '', label: 'Todos os Motivos' }, ...ticketReasons.map(r => ({ value: r.title, label: r.title }))];
  const subReasonOptions = useMemo(() => {
    const selectedReasonObj = ticketReasons.find(r => r.title === reasonsFilter.reason);
    if (!selectedReasonObj) return [{ value: '', label: 'Todos os Submotivos' }];
    
    const filteredSubs = ticketSubReasons.filter(sr => sr.parentId === selectedReasonObj.id);
    return [{ value: '', label: 'Todos os Submotivos' }, ...filteredSubs.map(sr => ({ value: sr.title, label: sr.title }))];
  }, [ticketSubReasons, ticketReasons, reasonsFilter.reason]);
  
  const ratingOptions = [
    { value: '', label: 'Todas as Notas' },
    { value: '5', label: '5 Estrelas' },
    { value: '4', label: '4 Estrelas' },
    { value: '3', label: '3 Estrelas' },
    { value: '2', label: '2 Estrelas' },
    { value: '1', label: '1 Estrela' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', overflow: 'visible' }}>
      <div className="page-header">
        <div>
          <h1>Central de Relatórios</h1>
          <p>Análise de KPIs e dados segmentados por categoria.</p>
        </div>
      </div>

      {/* Summary Section with its own filter */}
      <div style={{ marginBottom: '2rem', overflow: 'visible' }}>
        <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'visible', marginBottom: '1rem' }}>
          <SectionFilters 
            label="Filtro de Indicadores"
            isOpen={summaryFilter.open} 
            onToggle={() => setSummaryFilter(prev => ({ ...prev, open: !prev.open }))}
          >
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Período Inicial</label>
              <DateTimePicker value={summaryFilter.start} onChange={val => setSummaryFilter(prev => ({ ...prev, start: val }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Período Final</label>
              <DateTimePicker value={summaryFilter.end} onChange={val => setSummaryFilter(prev => ({ ...prev, end: val }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Setor</label>
              <Select 
                options={sectorOptions} 
                value={summaryFilter.sector} 
                onChange={val => setSummaryFilter(prev => ({ ...prev, sector: val }))} 
                placeholder="Filtrar Setor"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Operador</label>
              <Select 
                options={operatorOptions} 
                value={summaryFilter.operator} 
                onChange={val => setSummaryFilter(prev => ({ ...prev, operator: val }))} 
                placeholder="Filtrar Operador"
              />
            </div>
          </SectionFilters>
        </div>
        
        <div className="dashboard-grid">
          <ReportCard title="Total de Chamados" value={summaryStats.total} icon={Layers} />
          <ReportCard title="T.M.E. Médio" value={formatDuration(summaryStats.avgTME)} icon={Clock} />
          <ReportCard title="T.M.A. Médio" value={formatDuration(summaryStats.avgTMA)} icon={TrendingUp} />
          <ReportCard title="CSAT (Satisfação)" value={`${summaryStats.satisfaction}/5.0`} icon={Star} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', overflow: 'visible' }}>
        
        {/* Card 1: Motivos Mais Recorrentes */}
        <div className="panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
          <div className="section-header" style={{ padding: '1rem' }}>
            <h3 className="section-header-title"><BarChart3 size={18} /> Motivos Mais Recorrentes</h3>
            <button className="btn" style={{ padding: '0.35rem' }} onClick={() => handleExport('Recorrência de Motivos')}><Download size={14} /></button>
          </div>
          
          <SectionFilters 
            isOpen={reasonsFilter.open} 
            onToggle={() => setReasonsFilter(prev => ({ ...prev, open: !prev.open }))}
          >
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Início</label>
              <DateTimePicker value={reasonsFilter.start} onChange={val => setReasonsFilter(prev => ({ ...prev, start: val }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fim</label>
              <DateTimePicker value={reasonsFilter.end} onChange={val => setReasonsFilter(prev => ({ ...prev, end: val }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Motivo</label>
              <Select 
                options={reasonOptions} 
                value={reasonsFilter.reason} 
                onChange={val => {
                  setReasonsFilter(prev => ({ ...prev, reason: val, subReason: '' }));
                }} 
                placeholder="Filtrar Motivo"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Submotivo</label>
              <Select 
                options={subReasonOptions} 
                value={reasonsFilter.subReason} 
                onChange={val => setReasonsFilter(prev => ({ ...prev, subReason: val }))} 
                placeholder="Filtrar Submotivo"
                disabled={!reasonsFilter.reason}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cliente</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar cliente..." 
                value={reasonsFilter.client}
                onChange={e => setReasonsFilter(prev => ({ ...prev, client: e.target.value }))}
                style={{ height: '38px' }}
              />
            </div>
          </SectionFilters>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Motivo / Submotivo</th>
                  <th style={{ textAlign: 'right' }}>Qtd.</th>
                  <th style={{ textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(filteredReasonsData.reduce((acc, t) => {
                  const key = `${t.reason} > ${t.subReason}`;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
                  <tr key={key}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{key.split(' > ')[0]}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{key.split(' > ')[1]}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{count}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {((count / filteredReasonsData.length) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {filteredReasonsData.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Nenhum dado encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Avaliações Recentes */}
        <div className="panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
          <div className="section-header" style={{ padding: '1rem' }}>
            <h3 className="section-header-title"><Star size={18} /> Avaliações Recentes</h3>
            <button className="btn" style={{ padding: '0.35rem' }} onClick={() => handleExport('Pesquisa de Satisfação')}><Download size={14} /></button>
          </div>

          <SectionFilters 
            isOpen={evalFilter.open} 
            onToggle={() => setEvalFilter(prev => ({ ...prev, open: !prev.open }))}
          >
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Início</label>
              <DateTimePicker value={evalFilter.start} onChange={val => setEvalFilter(prev => ({ ...prev, start: val }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fim</label>
              <DateTimePicker value={evalFilter.end} onChange={val => setEvalFilter(prev => ({ ...prev, end: val }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nota</label>
              <Select 
                options={ratingOptions} 
                value={evalFilter.rating} 
                onChange={val => setEvalFilter(prev => ({ ...prev, rating: val }))} 
                placeholder="Filtrar Nota"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Operador</label>
              <Select 
                options={operatorOptions} 
                value={evalFilter.operator} 
                onChange={val => setEvalFilter(prev => ({ ...prev, operator: val }))} 
                placeholder="Filtrar Operador"
              />
            </div>
          </SectionFilters>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente / Operador</th>
                  <th>Data/Hora</th>
                  <th>Nota</th>
                  <th>Comentário</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvalData.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt)).map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.clientName}</div>
                      <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <UserCheck size={10} /> {t.operator}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(t.closedAt).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < t.rating ? 'var(--warning)' : 'none'} stroke={i < t.rating ? 'var(--warning)' : 'var(--text-muted)'} />
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.comment}>
                      {t.comment || '—'}
                    </td>
                  </tr>
                ))}
                {filteredEvalData.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Nenhuma avaliação encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reports;
