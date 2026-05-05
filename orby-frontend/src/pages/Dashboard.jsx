import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, Search, Users, ChevronDown, X, Check, Building2, Layers, Clock, Mail, Phone, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '../components/DateTimePicker';

const STATUS_SECTIONS = [
  { key: 'open', label: 'Aguardando', color: 'var(--warning)' },
  { key: 'in_progress', label: 'Em Andamento', color: 'var(--info)' },
  { key: 'pending_transfer', label: 'Aguardando Transferência', color: '#A855F7' },
  { key: 'closed', label: 'Finalizado', color: 'var(--success)' },
];

const ALL_OPERATORS = ['Você', 'Carlos M.', 'Ana P.', 'João Silva'];
const ALL_SECTORS = [
  { value: 'n1', label: 'Suporte N1' },
  { value: 'n2', label: 'Suporte N2' },
  { value: 'comercial', label: 'Comercial' },
];

/* ── Generic multi-select chip dropdown ───────────── */
function ChipMultiSelect({ icon: Icon, allLabel, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };

  const displayLabel = selected.length === 0
    ? allLabel
    : selected.length === 1
      ? (options.find(o => o.value === selected[0])?.label || selected[0])
      : `${selected.length} selecionados`;
  const has = selected.length > 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.375rem 0.75rem', borderRadius: '100px',
        fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
        border: `1px solid ${has ? 'var(--accent-color)' : 'var(--border-color)'}`,
        background: has ? 'var(--accent-color)' : 'var(--bg-panel)',
        color: has ? 'var(--accent-text)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
      }}>
        <Icon size={13} /> {displayLabel}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
          minWidth: '200px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.15s ease-out',
        }}>
          {has && (
            <div onClick={() => { onChange([]); setOpen(false); }}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X size={12} /> Limpar filtro
            </div>
          )}
          {options.map(opt => {
            const isSel = selected.includes(opt.value);
            return (
              <div key={opt.value} onClick={() => toggle(opt.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSel ? 'var(--text-primary)' : 'var(--text-secondary)', background: isSel ? 'var(--bg-active)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ width: 16, height: 16, borderRadius: '3px', border: `1px solid ${isSel ? 'var(--accent-color)' : 'var(--border-focus)'}`, background: isSel ? 'var(--accent-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isSel && <Check size={10} style={{ color: 'var(--accent-text)' }} />}
                </div>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Period chips ──────────────────────────────────── */
function PeriodFilter({ dateRange, setDateRange, dateStart, setDateStart, dateEnd, setDateEnd }) {
  const periods = [
    { value: 'hoje', label: 'Hoje' }, { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' }, { value: 'custom', label: 'Personalizado' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
      {periods.map(opt => (
        <button key={opt.value} type="button" onClick={() => setDateRange(opt.value)} style={{
          display: 'inline-flex', alignItems: 'center', padding: '0.375rem 0.75rem', borderRadius: '100px',
          fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
          border: `1px solid ${dateRange === opt.value ? 'var(--accent-color)' : 'var(--border-color)'}`,
          background: dateRange === opt.value ? 'var(--accent-color)' : 'var(--bg-panel)',
          color: dateRange === opt.value ? 'var(--accent-text)' : 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
        }}>{opt.label}</button>
      ))}
      {dateRange === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <DateTimePicker value={dateStart} onChange={setDateStart} placeholder="Início" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>até</span>
          <DateTimePicker value={dateEnd} onChange={setDateEnd} placeholder="Fim" />
        </div>
      )}
    </div>
  );
}

/* ── History modal ────────────────────────────────── */
function HistoryModal({ ticket, onClose }) {
  if (!ticket || !ticket.history || ticket.history.length === 0) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Histórico — {ticket.clientName}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {ticket.history.map((h, idx) => (
            <div key={idx} style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>{h.ticketId}</span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span style={{ color: 'var(--text-secondary)' }}>{h.date}</span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span style={{ color: 'var(--text-secondary)' }}>{h.sector}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{h.operator}</span>
              </div>
              <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {h.messages.map((m, mi) => (
                  <div key={mi} style={{
                    alignSelf: m.sender === 'operator' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%', padding: '0.4375rem 0.75rem', borderRadius: '8px',
                    fontSize: '0.8125rem', lineHeight: 1.4,
                    background: m.sender === 'operator' ? 'var(--accent-color)' : 'var(--bg-hover)',
                    color: m.sender === 'operator' ? 'var(--accent-text)' : 'var(--text-primary)',
                    border: m.sender === 'operator' ? 'none' : '1px solid var(--border-color)',
                  }}>
                    <div>{m.text}</div>
                    <div style={{ fontSize: '0.625rem', opacity: 0.6, textAlign: 'right', marginTop: '0.125rem' }}>{m.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Client info expandable row ───────────────────── */
function ClientInfoRow({ ticket, onViewHistory }) {
  return (
    <tr>
      <td colSpan="6" style={{ padding: 0 }}>
        <div style={{ display: 'flex', gap: '1.5rem', padding: '0.625rem 1rem', background: 'var(--bg-hover)', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
            <Users size={12} /> <span style={{ fontWeight: 500 }}>{ticket.contactName || '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
            <Mail size={12} /> {ticket.clientEmail || '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
            <Phone size={12} /> {ticket.clientPhone || '—'}
          </div>
          {ticket.history && ticket.history.length > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onViewHistory(ticket); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto',
                background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.5rem', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                color: 'var(--info)', fontFamily: 'var(--font-sans)',
              }}>
              <History size={11} /> {ticket.history.length} atendimento{ticket.history.length > 1 ? 's' : ''} anterior{ticket.history.length > 1 ? 'es' : ''}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Main Component ───────────────────────────────── */
function Dashboard() {
  const navigate = useNavigate();
  const { tickets, assumeTicket } = useAppContext();

  const [dateRange, setDateRange] = useState('hoje');
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [operatorFilter, setOperatorFilter] = useState([]);
  const [sectorFilter, setSectorFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [historyTicket, setHistoryTicket] = useState(null);

  const clientOptions = useMemo(() => {
    const names = [...new Set(tickets.map(t => t.clientName))];
    return names.map(n => ({ value: n, label: n }));
  }, [tickets]);
  const [clientFilter, setClientFilter] = useState([]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (operatorFilter.length > 0 && !operatorFilter.includes(t.operator)) return false;
      if (sectorFilter.length > 0 && !sectorFilter.includes(t.sector)) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(t.clientName)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.clientName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tickets, operatorFilter, sectorFilter, statusFilter, clientFilter, searchQuery]);

  const groupedTickets = useMemo(() => {
    const groups = {};
    STATUS_SECTIONS.forEach(s => { groups[s.key] = []; });
    filteredTickets.forEach(t => { if (groups[t.status]) groups[t.status].push(t); });
    return groups;
  }, [filteredTickets]);

  const sectorLabel = (s) => ({ n1: 'Suporte N1', n2: 'Suporte N2', comercial: 'Comercial' }[s] || s);

  const canAssume = (ticket) => {
    if (ticket.status === 'open') return true;
    if (ticket.status === 'pending_transfer' && (ticket.transferredTo === 'Você' || !ticket.transferredTo)) return true;
    return false;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Chamados</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <PeriodFilter dateRange={dateRange} setDateRange={setDateRange} dateStart={dateStart} setDateStart={setDateStart} dateEnd={dateEnd} setDateEnd={setDateEnd} />
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
        <ChipMultiSelect icon={Users} allLabel="Operador" options={ALL_OPERATORS.map(o => ({ value: o, label: o }))} selected={operatorFilter} onChange={setOperatorFilter} />
        <ChipMultiSelect icon={Building2} allLabel="Setor" options={ALL_SECTORS} selected={sectorFilter} onChange={setSectorFilter} />
        <ChipMultiSelect icon={Layers} allLabel="Status" options={STATUS_SECTIONS.map(s => ({ value: s.key, label: s.label }))} selected={statusFilter} onChange={setStatusFilter} />
        <ChipMultiSelect icon={Search} allLabel="Cliente" options={clientOptions} selected={clientFilter} onChange={setClientFilter} />
        <div style={{ marginLeft: 'auto' }} className="search-input-wrap">
          <Search size={13} />
          <input type="text" placeholder="Buscar por nome ou ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {STATUS_SECTIONS.map(section => {
          if (statusFilter.length > 0 && !statusFilter.includes(section.key)) return null;
          const sectionTickets = groupedTickets[section.key] || [];
          return (
            <div key={section.key} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: sectionTickets.length > 0 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: section.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{section.label}</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: section.color, background: section.color + '15', padding: '0.125rem 0.5rem', borderRadius: '100px' }}>{sectionTickets.length}</span>
              </div>
              {sectionTickets.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>ID</th>
                      <th>Cliente</th>
                      <th style={{ width: '13%' }}>Setor</th>
                      <th style={{ width: '16%' }}>Operador</th>
                      <th style={{ width: '15%' }}>Status</th>
                      <th style={{ width: '9%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionTickets.map(ticket => (
                      <React.Fragment key={ticket.id}>
                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
                          <td className="mono" style={{ color: 'var(--text-muted)' }}>{ticket.id}</td>
                          <td style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.clientName}</td>
                          <td>{sectorLabel(ticket.sector)}</td>
                          <td>
                            {ticket.operator || <span style={{ color: 'var(--text-muted)' }}>Fila</span>}
                            {ticket.status === 'pending_transfer' && ticket.transferredTo && (
                              <span style={{ fontSize: '0.6875rem', color: '#A855F7', marginLeft: '0.25rem' }}>→ {ticket.transferredTo}</span>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{ background: section.color + '15', color: section.color, borderColor: section.color + '30' }}>{section.label}</span>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            {canAssume(ticket) ? (
                              <button className="btn primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => { assumeTicket(ticket.id); navigate('/chat'); }}>
                                Assumir <ArrowRight size={11} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                        {expandedTicket === ticket.id && (
                          <ClientInfoRow ticket={ticket} onViewHistory={setHistoryTicket} />
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Nenhum chamado nesta seção.</div>
              )}
            </div>
          );
        })}
      </div>

      {historyTicket && <HistoryModal ticket={historyTicket} onClose={() => setHistoryTicket(null)} />}
    </div>
  );
}

export default Dashboard;
