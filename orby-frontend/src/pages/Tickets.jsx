import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, Search, Users, ChevronDown, X, Check, Building2, Layers, Clock, Mail, Phone, History, Edit2, Trash2, Info, AlertCircle, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '../components/DateTimePicker';

const STATUS_SECTIONS = [
  { key: 'open', label: 'Aguardando', color: 'var(--warning)' },
  { key: 'in_progress', label: 'Em Andamento', color: 'var(--info)' },
  { key: 'pending_transfer', label: 'Aguardando Transferência', color: '#A855F7' },
  { key: 'closed', label: 'Finalizado', color: 'var(--success)' },
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
  const [selectedSubTicket, setSelectedSubTicket] = useState(null);
  const [unifiedView, setUnifiedView] = useState(false);
  const [search, setSearch] = useState('');

  if (!ticket || !ticket.history || ticket.history.length === 0) return null;

  const messagesToRender = unifiedView 
    ? ticket.history.flatMap(h => [{ isDivider: true, label: `Protocolo ${h.ticketId} - ${h.date}` }, ...h.messages])
    : selectedSubTicket?.messages || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', display: 'flex', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Left Sidebar - Ticket List */}
        {!selectedSubTicket && !unifiedView ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2>Histórico de Chamados — {ticket.clientName}</h2>
              <button className="close-btn" onClick={onClose}><X size={18} /></button>
            </div>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
              <button className="btn primary" style={{ width: '100%' }} onClick={() => setUnifiedView(true)}><Layers size={14} /> Ver Histórico Unificado</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ticket.history.map((h, idx) => (
                <div key={idx} className="panel" style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-color)' }} 
                  onClick={() => setSelectedSubTicket(h)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{h.ticketId}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>{h.sector}</span>
                    <span>{h.operator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Right Content - Messages */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="btn" style={{ padding: '0.25rem' }} onClick={() => { setSelectedSubTicket(null); setUnifiedView(false); }}><ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /></button>
                <div>
                  <h2 style={{ margin: 0 }}>{unifiedView ? 'Histórico Unificado' : `Chamado ${selectedSubTicket.ticketId}`}</h2>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{unifiedView ? 'Todas as conversas' : `${selectedSubTicket.date} · ${selectedSubTicket.operator}`}</div>
                </div>
              </div>
              <button className="close-btn" onClick={onClose}><X size={18} /></button>
            </div>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
              <div className="search-input-wrap" style={{ flex: 1 }}>
                <Search size={13} />
                <input type="text" placeholder="Pesquisar na conversa..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-app)' }}>
              {messagesToRender
                .filter(m => m.isDivider || !search || m.text.toLowerCase().includes(search.toLowerCase()))
                .map((m, i, filtered) => {
                  if (m.isDivider) {
                    const nextDividerIdx = filtered.findIndex((nm, ni) => ni > i && nm.isDivider);
                    const messagesBetween = filtered.slice(i + 1, nextDividerIdx === -1 ? undefined : nextDividerIdx);
                    if (messagesBetween.length === 0) return null;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{
                      alignSelf: m.sender === 'operator' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.8125rem', lineHeight: 1.45,
                      background: m.sender === 'operator' ? 'var(--accent-color)' : 'var(--bg-panel)',
                      color: m.sender === 'operator' ? 'var(--accent-text)' : 'var(--text-primary)',
                      border: m.sender === 'operator' ? 'none' : '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div>{m.text}</div>
                      <div style={{ fontSize: '0.625rem', opacity: 0.6, textAlign: 'right', marginTop: '0.25rem' }}>{m.time}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
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
function Tickets() {
  const navigate = useNavigate();
  const { tickets, assumeTicket } = useAppContext();

  const ALL_OPERATORS = useMemo(() => {
    const ops = new Set(['Você']);
    tickets.forEach(t => { if (t.operator) ops.add(t.operator); });
    return [...ops];
  }, [tickets]);

  const ALL_SECTORS = useMemo(() => {
    const sectors = new Set(['Suporte N1', 'Suporte N2', 'Financeiro', 'Comercial', 'Logística']);
    tickets.forEach(t => { if (t.sector) sectors.add(t.sector); });
    return [...sectors].map(s => ({ value: s, label: s }));
  }, [tickets]);

  const [dateRange, setDateRange] = useState('hoje');
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [operatorFilter, setOperatorFilter] = useState([]);
  const [sectorFilter, setSectorFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [historyTicket, setHistoryTicket] = useState(null);

  const clientOptions = useMemo(() => {
    const names = [...new Set(tickets.map(t => t.clientName))];
    return names.map(n => ({ value: n, label: n }));
  }, [tickets]);
  const [clientFilter, setClientFilter] = useState([]);
  const [reasonFilter, setReasonFilter] = useState([]);
  const [subReasonFilter, setSubReasonFilter] = useState([]);

  const { ticketReasons, ticketSubReasons } = useAppContext();

  const filteredTicketsWithoutStatus = useMemo(() => {
    return tickets.filter(t => {
      if (operatorFilter.length > 0 && !operatorFilter.includes(t.operator)) return false;
      if (sectorFilter.length > 0 && !sectorFilter.includes(t.sector)) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(t.clientName)) return false;
      if (reasonFilter.length > 0 && !reasonFilter.includes(t.reason)) return false;
      if (subReasonFilter.length > 0 && !subReasonFilter.includes(t.subReason)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.clientName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tickets, operatorFilter, sectorFilter, clientFilter, reasonFilter, subReasonFilter, searchQuery]);

  const counts = useMemo(() => {
    const c = {};
    STATUS_SECTIONS.forEach(s => c[s.key] = 0);
    filteredTicketsWithoutStatus.forEach(t => { if (c[t.status] !== undefined) c[t.status]++; });
    return c;
  }, [filteredTicketsWithoutStatus]);

  const filteredTickets = useMemo(() => {
    return filteredTicketsWithoutStatus.filter(t => {
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [filteredTicketsWithoutStatus, statusFilter]);

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
        <ChipMultiSelect icon={Search} allLabel="Cliente" options={clientOptions} selected={clientFilter} onChange={setClientFilter} />
        <ChipMultiSelect icon={Info} allLabel="Motivo" options={ticketReasons.map(r => ({ value: r.title, label: r.title }))} selected={reasonFilter} onChange={setReasonFilter} />
        <ChipMultiSelect icon={Info} allLabel="Submotivo" options={ticketSubReasons.map(s => ({ value: s.title, label: s.title }))} selected={subReasonFilter} onChange={setSubReasonFilter} />
        <div style={{ marginLeft: 'auto' }} className="search-input-wrap">
          <Search size={13} />
          <input type="text" placeholder="Buscar por nome ou ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {STATUS_SECTIONS.map(s => (
          <button key={s.key} className={`tab-btn ${statusFilter === s.key ? 'active' : ''}`} onClick={() => setStatusFilter(s.key)}>
            {s.label}
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '0.125rem 0.5rem', 
              borderRadius: '100px', 
              background: statusFilter === s.key ? 'var(--accent-color)' : 'var(--bg-active)',
              color: statusFilter === s.key ? 'var(--accent-text)' : 'var(--text-muted)',
              marginLeft: '0.25rem',
              fontWeight: 700
            }}>{counts[s.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {(() => {
          const section = STATUS_SECTIONS.find(s => s.key === statusFilter);
          if (!section) return null;
          const sectionTickets = groupedTickets[section.key] || [];
          return (
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
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
                          <td style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {ticket.clientName}
                            {ticket.source === 'WHATSAPP' && (
                              <MessageCircle size={14} style={{ color: '#25D366' }} title="Via WhatsApp" />
                            )}
                          </td>
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
                <div style={{ padding: '3rem 1rem', textAlign: 'center' }} className="fade-in">
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                      <Layers size={48} style={{ opacity: 0.1 }} />
                      <div style={{ fontSize: '0.875rem' }}>Nenhum chamado em {section.label.toLowerCase()}</div>
                   </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {historyTicket && <HistoryModal ticket={historyTicket} onClose={() => setHistoryTicket(null)} />}
    </div>
  );
}

export default Tickets;
