import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, TrendingUp, Clock, CheckCircle2, Filter, Search, Calendar, User, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Select from '../components/Select';

function CustomDatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  
  // click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = Array.from({length: 31}, (_, i) => i + 1);
  const currentMonth = "Maio 2026"; // Mock estático para demonstração

  const parseDate = (val) => val ? val.split(' ')[0] : '';
  const parseTime = (val) => val && val.includes(' ') ? val.split(' ')[1] : '00:00';

  const dateOnly = parseDate(value);
  const timeOnly = parseTime(value);

  return (
    <div className="form-group" style={{ position: 'relative', marginBottom: 0 }} ref={containerRef}>
      <label className="form-label">{label}</label>
      <div 
        className="form-control" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--bg-app)' }}
        onClick={() => setOpen(!open)}
      >
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ flex: 1, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value || 'Selecionar data e hora...'}
        </span>
      </div>

      {open && (
        <div style={{ 
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          width: '300px', marginTop: '0.5rem', 
          background: 'var(--bg-app)', border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-md)', padding: '1.25rem', zIndex: 1050,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, marginBottom: '1rem' }}>
            <button type="button" className="btn" style={{ padding: '0.2rem', border: 'none' }}><ChevronLeft size={16} /></button>
            <span>{currentMonth}</span>
            <button type="button" className="btn" style={{ padding: '0.2rem', border: 'none' }}><ChevronRight size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
            <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {/* Blank spaces for 1st day of May 2026 (Friday) */}
            <div/><div/><div/><div/><div/>
            {days.map(d => {
              const dStr = `${d.toString().padStart(2, '0')}/05/2026`;
              const isSelected = dateOnly === dStr;
              return (
                <button 
                  key={d} 
                  type="button"
                  style={{ 
                    padding: '0.4rem 0', border: 'none', 
                    background: isSelected ? 'var(--accent-color)' : 'transparent', 
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => onChange(`${dStr} ${timeOnly}`)}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Horário</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="time" 
                className="form-control" 
                value={timeOnly} 
                onChange={(e) => {
                  const newTime = e.target.value || '00:00';
                  onChange(`${dateOnly || '01/05/2026'} ${newTime}`);
                }} 
              />
            </div>
            <button type="button" className="btn primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setOpen(false)}>
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Reports() {
  const { tickets, ticketReasons } = useAppContext();

  const [dateRange, setDateRange] = useState('7d');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customDate, setCustomDate] = useState({ start: '', end: '' });

  const handleDateChange = (val) => {
    if (val === 'custom') {
      setShowCustomDateModal(true);
    } else {
      setDateRange(val);
    }
  };

  // Lógica mockada de filtros (no mundo real faria fetch na API)
  const filteredTickets = tickets.filter(t => {
    if (operatorFilter && t.operator !== operatorFilter && operatorFilter !== 'todos') return false;
    if (clientSearch && !t.clientName.toLowerCase().includes(clientSearch.toLowerCase()) && !t.clientEmail.toLowerCase().includes(clientSearch.toLowerCase())) return false;
    return true;
  });

  const totalTickets = filteredTickets.length + (dateRange === '30d' ? 120 : dateRange === 'hoje' ? 5 : 24);
  const closedTickets = filteredTickets.filter(t => t.status === 'closed').length + (dateRange === '30d' ? 105 : dateRange === 'hoje' ? 3 : 21);
  const openTickets = filteredTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Relatórios e Métricas</h1>
          <p>Acompanhe o desempenho da sua equipe e os principais motivos de contato.</p>
        </div>
        <button className="btn primary">
          <Filter size={16} /> Exportar CSV
        </button>
      </div>

      <div className="panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          <Filter size={18} /> Filtros de Relatório
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Período</label>
            <Select 
              value={dateRange === 'custom' ? 'custom' : dateRange} 
              onChange={handleDateChange} 
              options={[
                { value: 'hoje', label: 'Hoje' },
                { value: '7d', label: 'Últimos 7 dias' },
                { value: '30d', label: 'Últimos 30 dias' },
                { value: 'custom', label: dateRange === 'custom' ? `Personalizado (${customDate.start ? 'Ativo' : '...'})` : 'Personalizado...' }
              ]} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Atendente</label>
            <Select 
              value={operatorFilter} 
              onChange={setOperatorFilter} 
              options={[
                { value: 'todos', label: 'Todos os Operadores' },
                { value: 'Você', label: 'Você' },
                { value: 'Carlos M.', label: 'Carlos M.' }
              ]} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Motivo (Tipificação)</label>
            <Select 
              value={reasonFilter} 
              onChange={setReasonFilter} 
              options={[
                { value: 'todos', label: 'Todos os Motivos' },
                ...ticketReasons.map(r => ({ value: r.id, label: r.title }))
              ]} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cliente</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar nome ou e-mail..." 
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={16} /> Total de Atendimentos
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600 }}>{totalTickets}</div>
        </div>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> Chamados Encerrados
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>{closedTickets}</div>
        </div>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} /> Em Atendimento
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>{openTickets}</div>
        </div>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Tempo Médio (Espera)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600 }} className="mono">04m 12s</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Principais Motivos de Contato</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Motivo (Tipificação)</th>
                <th style={{ textAlign: 'right' }}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {ticketReasons.map((reason, index) => (
                <tr key={reason.id}>
                  <td>{reason.title}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }} className="mono">{Math.max(2, 15 - index * 3)}</td>
                </tr>
              ))}
              {ticketReasons.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum motivo de chamado encerrado foi registrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Volume por Setor</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>Suporte Técnico</span>
                <span className="mono">65%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-active)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--accent-color)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>Financeiro e Faturamento</span>
                <span className="mono">25%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-active)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', background: 'var(--warning)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>Comercial / Vendas</span>
                <span className="mono">10%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-active)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '10%', height: '100%', background: 'var(--success)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCustomDateModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2>Período Personalizado</h2>
              <button className="close-btn" onClick={() => { setShowCustomDateModal(false); if(dateRange !== 'custom') setDateRange('7d'); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!customDate.start || !customDate.end) {
                alert('Preencha a data inicial e final.');
                return;
              }
              setDateRange('custom');
              setShowCustomDateModal(false);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <CustomDatePicker 
                  label="Data e Hora Inicial" 
                  value={customDate.start} 
                  onChange={(val) => setCustomDate({...customDate, start: val})} 
                />
                <CustomDatePicker 
                  label="Data e Hora Final" 
                  value={customDate.end} 
                  onChange={(val) => setCustomDate({...customDate, end: val})} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn" onClick={() => { setShowCustomDateModal(false); if(dateRange !== 'custom') setDateRange('7d'); }}>Cancelar</button>
                <button type="submit" className="btn primary">Aplicar Filtro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
