import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRightLeft, X, User, CheckCircle2, NotebookPen, Mail, Phone, Clock, Info, Zap, Plus, Edit2, Trash2, Paperclip, Image as ImageIcon, FileText, History, Layers, Search, AlertCircle, Cpu, Rocket, Monitor, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import Select from '../components/Select';
import DateTimePicker from '../components/DateTimePicker';
import { useAppContext } from '../context/AppContext';

function Chat() {
  const { 
    tickets, 
    activeTicketId, 
    setActiveTicketId, 
    addMessageToTicket, 
    transferTicket,
    closeTicket,
    cannedResponses,
    addCannedResponse,
    editCannedResponse,
    deleteCannedResponse,
    addNoteToTicket,
    editNoteInTicket,
    deleteNoteFromTicket,
    addEquipmentToTicket,
    editEquipmentInTicket,
    deleteEquipmentFromTicket,
    ticketReasons,
    addTicketReason,
    editTicketReason,
    deleteTicketReason,
    ticketSubReasons,
    addTicketSubReason,
    editTicketSubReason,
    deleteTicketSubReason,
    cardTypes,
    isClientTyping,
    setIsClientTyping
  } = useAppContext();

  const [input, setInput] = useState('');
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedSubReason, setSelectedSubReason] = useState('');
  const [closingDescription, setClosingDescription] = useState('');
  const [editingReason, setEditingReason] = useState(null);
  const [editingSubReason, setEditingSubReason] = useState(null);
  const [editingCanned, setEditingCanned] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEquipmentsModal, setShowEquipmentsModal] = useState(false);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [expandedEquipmentId, setExpandedEquipmentId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);

  // Sync form state when editing
  useEffect(() => {
    if (editingEquipment) {
      setEqName(editingEquipment.name);
      setEqType(editingEquipment.type);
      setEqDesc(editingEquipment.description);
    } else {
      setEqName('');
      setEqType('servidor desktop');
      setEqDesc('');
    }
  }, [editingEquipment, isAddingEquipment]);
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, title: null, parentId: null });
  const [historyConversation, setHistoryConversation] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSector, setTransferSector] = useState('');
  const [transferOperator, setTransferOperator] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStart, setHistoryStart] = useState(null);
  const [historyEnd, setHistoryEnd] = useState(null);
  const [historyReasonFilter, setHistoryReasonFilter] = useState('');
  const [historySubReasonFilter, setHistorySubReasonFilter] = useState('');
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devTitle, setDevTitle] = useState('');
  const [devTeam, setDevTeam] = useState('');
  const [devType, setDevType] = useState('');
  const [devNote, setDevNote] = useState('');
  const [devPublicLink, setDevPublicLink] = useState('');
  const [eqName, setEqName] = useState('');
  const [eqType, setEqType] = useState('servidor desktop');
  const [eqDesc, setEqDesc] = useState('');
  const devFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const activeTicket = tickets.find(t => t.id === activeTicketId) || null;
  const isTransferred = activeTicket?.status === 'transferred' || activeTicket?.status === 'closed';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeTicket || isTransferred) return;

    addMessageToTicket(activeTicket.id, input, 'operator', 'message');
    setInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeTicket || isTransferred) return;

    // Simula upload de imagem
    const isImage = file.type.startsWith('image/');
    addMessageToTicket(activeTicket.id, file.name, 'operator', isImage ? 'image' : 'file');
    e.target.value = '';
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    transferTicket(activeTicket.id, transferSector, transferOperator);
    setShowTransferModal(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Atendimento</h1>
      </div>

      <div className="chat-container">
        <div className="chat-sidebar">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Atendimentos Ativos ({activeTickets.length})
            </span>
          </div>
          <div className="chat-list">
            {activeTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`chat-item ${ticket.id === activeTicketId ? 'active' : ''}`}
                onClick={() => setActiveTicketId(ticket.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{ticket.clientName}</span>
                    {ticket.source === 'WHATSAPP' && <MessageCircle size={12} style={{ color: '#25D366' }} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.createdAt}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1].text : 'Novo chamado aguardando...'}
                </div>
              </div>
            ))}
            {activeTickets.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Nenhum atendimento ativo.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className="chat-main" style={{ flex: 1 }}>
          {!activeTicket ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               <User size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p>Selecione um atendimento na barra lateral para iniciar.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-active)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <User size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {activeTicket.clientName}
                      {activeTicket.source === 'WHATSAPP' && (
                        <span style={{ fontSize: '0.65rem', background: '#25D36615', color: '#25D366', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MessageCircle size={10} /> WHATSAPP
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isTransferred ? 'var(--text-secondary)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s' }}>
                      {!isTransferred && <span style={{ width: 6, height: 6, borderRadius: '50%', background: isClientTyping ? 'var(--warning)' : 'var(--success)' }}></span>}
                      {isTransferred ? (
                        activeTicket.status === 'transferred' ? 'Transferido' : 'Encerrado'
                      ) : isClientTyping ? (
                        <span style={{ color: 'var(--warning)' }}>Digitando...</span>
                      ) : (
                        'Online'
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!isTransferred && (
                    <>
                      <button className={`btn ${showEquipmentsModal ? 'primary' : ''}`} title="Equipamentos do Cliente" onClick={() => setShowEquipmentsModal(true)}>
                        <Monitor size={16} />
                      </button>
                      <button className={`btn ${showNotesModal ? 'primary' : ''}`} title="Notas Internas" onClick={() => setShowNotesModal(true)}>
                        <NotebookPen size={16} />
                      </button>
                      <button className={`btn ${showCannedModal ? 'primary' : ''}`} title="Respostas Rápidas" onClick={() => setShowCannedModal(true)}>
                        <Zap size={16} />
                      </button>
                      <button className={`btn ${showDevModal ? 'primary' : ''}`} title="Enviar para Desenvolvimento" onClick={() => setShowDevModal(true)} style={{ color: 'var(--danger)' }}>
                        <AlertCircle size={16} />
                      </button>
                      <button className="btn" title="Transferir Atendimento" onClick={() => setShowTransferModal(true)}>
                        <ArrowRightLeft size={16} /> Transferir
                      </button>
                      <button className="btn primary" title="Encerrar Atendimento" onClick={() => setShowCloseModal(true)}>
                        <CheckCircle2 size={16} /> Encerrar
                      </button>
                    </>
                  )}
                  <button className={`btn ${showClientInfo ? 'primary' : ''}`} title="Detalhes do Cliente" onClick={() => setShowClientInfo(!showClientInfo)}>
                    <Info size={16} />
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {activeTicket.messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} style={{ alignSelf: 'center', margin: '1rem 0', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    {msg.text}
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`message ${msg.sender === 'operator' ? 'sent' : 'received'}`}>
                  {msg.type === 'image' ? (
                    <div style={{ marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', width: '180px' }}>
                      <ImageIcon size={32} style={{ opacity: 0.5 }} />
                    </div>
                  ) : msg.type === 'file' ? (
                    <div style={{ marginBottom: '0.5rem', padding: '0.75rem', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                      <FileText size={18} />
                      <span className="mono" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{msg.text}</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '0.25rem', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  )}
                  <div className="mono" style={{ opacity: 0.7, textAlign: 'right', fontSize: '0.75rem' }}>{msg.time}</div>
                </div>
              );
            })}
              
              {isClientTyping && (
                <div className="message received" style={{ padding: '0.75rem 1.125rem', display: 'flex', gap: '0.25rem', alignItems: 'center', width: 'fit-content' }}>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-secondary)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both' }}></span>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-secondary)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-secondary)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
              <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onSubmit={handleSend}>
                <button 
                  type="button" 
                  className="btn" 
                  title="Anexar Arquivo" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}
                  disabled={isTransferred}
                >
                  <Paperclip size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                  disabled={isTransferred}
                />
                
                <input
                  type="text"
                  className="chat-input"
                  placeholder={isTransferred ? "Atendimento encerrado." : "Digite sua mensagem..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTransferred}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn primary" disabled={isTransferred} style={{ padding: '0.5rem 1rem' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
            </>
          )}
        </div>

        {activeTicket && showClientInfo && (
          <div className="panel-slide-in" style={{ width: '300px', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-panel)', padding: '1.25rem', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '1.25rem' }}>Informações do Cliente</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  <User size={11} /> Cliente
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeTicket.clientName}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  <User size={11} /> Contato
                </div>
                <div style={{ fontSize: '0.875rem' }}>{activeTicket.contactName || '—'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  <Mail size={11} /> E-mail
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{activeTicket.clientEmail || '—'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  <Phone size={11} /> Telefone
                </div>
                <div style={{ fontSize: '0.875rem' }}>{activeTicket.clientPhone || '—'}</div>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />
            
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <History size={12} /> Histórico
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="search-input-wrap" style={{ flex: 1, margin: 0 }}>
                  <Search size={14} />
                  <input 
                    type="text" 
                    placeholder="Filtrar tickets..." 
                    style={{ fontSize: '0.8125rem', height: '36px' }} 
                    value={historySearch} 
                    onChange={e => setHistorySearch(e.target.value)} 
                  />
                </div>
                <button 
                  className={`btn ${showHistoryFilters ? 'primary' : ''}`} 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    padding: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderRadius: 'var(--radius-sm)'
                  }} 
                  onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                  title="Filtros Avançados"
                >
                  <Search size={16} style={{ display: 'none' }} /> {/* Just for reference */}
                  <Layers size={16} style={{ display: 'none' }} /> {/* Just for reference */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  </div>
                </button>
              </div>
              
              {showHistoryFilters && (
                <div className="panel-slide-in" style={{ 
                  padding: '0.75rem', 
                  background: 'var(--bg-active)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.6rem',
                  boxShadow: 'var(--shadow-sm)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '100%' }}>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Motivo Principal</label>
                      <Select 
                        value={historyReasonFilter}
                        onChange={(val) => { setHistoryReasonFilter(val); setHistorySubReasonFilter(''); }}
                        options={ticketReasons.map(r => ({ value: r.title, label: r.title }))}
                        placeholder="Todos os motivos"
                        style={{ fontSize: '0.7rem', height: '28px', width: '100%' }}
                      />
                    </div>
                    <div style={{ width: '100%' }}>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Submotivo</label>
                      <Select 
                        value={historySubReasonFilter}
                        onChange={setHistorySubReasonFilter}
                        options={ticketSubReasons.filter(sr => !historyReasonFilter || ticketReasons.find(r => r.title === historyReasonFilter)?.id === sr.parentId).map(sr => ({ value: sr.title, label: sr.title }))}
                        placeholder="Todos os submotivos"
                        disabled={!historyReasonFilter}
                        style={{ fontSize: '0.7rem', height: '28px', width: '100%' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.1rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Período</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: '24px' }}>De:</span>
                        <DateTimePicker value={historyStart} onChange={setHistoryStart} placeholder="Início" style={{ flex: 1, height: '28px', fontSize: '0.7rem' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: '24px' }}>Até:</span>
                        <DateTimePicker value={historyEnd} onChange={setHistoryEnd} placeholder="Fim" style={{ flex: 1, height: '28px', fontSize: '0.7rem' }} />
                      </div>
                    </div>
                  </div>

                  {(historyReasonFilter || historySubReasonFilter || historyStart || historyEnd) && (
                    <button 
                      className="btn" 
                      style={{ 
                        width: '100%', 
                        fontSize: '0.65rem', 
                        padding: '0.35rem', 
                        height: '28px',
                        background: 'var(--bg-app)',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        fontWeight: 600,
                        marginTop: '0.2rem'
                      }} 
                      onClick={() => {
                        setHistoryReasonFilter('');
                        setHistorySubReasonFilter('');
                        setHistoryStart(null);
                        setHistoryEnd(null);
                      }}
                    >
                      <X size={12} /> Limpar Filtros
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeTicket.history && activeTicket.history.length > 0 && (
              <button 
                className="btn" 
                style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.75rem', borderStyle: 'dashed' }}
                onClick={() => {
                  const allMessages = activeTicket.history.flatMap(h => [
                    { isDivider: true, label: `Protocolo ${h.ticketId} - ${h.date}` },
                    ...h.messages
                  ]);
                  setHistoryConversation({ 
                    ticketId: 'Histórico Unificado', 
                    date: 'Todas as datas', 
                    sector: activeTicket.clientName, 
                    reason: '',
                    subReason: '',
                    operator: 'Múltiplos', 
                    messages: allMessages 
                  });
                }}
              >
                <Layers size={14} /> Ver Histórico Completo
              </button>
            )}

            {activeTicket.history && activeTicket.history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {activeTicket.history
                  .filter(h => {
                    const matchesSearch = !historySearch || 
                      h.ticketId.toLowerCase().includes(historySearch.toLowerCase()) ||
                      (h.reason && h.reason.toLowerCase().includes(historySearch.toLowerCase())) ||
                      (h.subReason && h.subReason.toLowerCase().includes(historySearch.toLowerCase()));
                    
                    if (!matchesSearch) return false;
                    if (historyReasonFilter && h.reason !== historyReasonFilter) return false;
                    if (historySubReasonFilter && h.subReason !== historySubReasonFilter) return false;
                    
                    // Simplified date filter for demo
                    if (historyStart || historyEnd) {
                      // Logic would go here
                    }
                    
                    return true;
                  })
                  .map((h, idx) => (
                  <div
                    key={idx}
                    onClick={() => setHistoryConversation(h)}
                    style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{h.ticketId}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{h.date}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>{h.sector}</span>
                      <span>{h.operator}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>Motivo:</span> {h.reason || 'N/A'} • <span style={{ fontWeight: 600 }}>Sub:</span> {h.subReason || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Nenhum atendimento anterior.</div>
            )}
          </div>
        )}
      </div>
      </div>

      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Transferir Atendimento</h2>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleTransfer}>
              <div className="form-group">
                <label className="form-label">Setor de Destino</label>
                <Select 
                  value={transferSector}
                  onChange={setTransferSector}
                  options={[
                    { value: 'n2', label: 'Suporte N2' },
                    { value: 'billing', label: 'Financeiro' },
                    { value: 'dev', label: 'Desenvolvimento' }
                  ]}
                  placeholder="-- Selecione o Setor --"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Operador (Opcional)</label>
                <Select 
                  value={transferOperator}
                  onChange={setTransferOperator}
                  options={[
                    { value: '1', label: 'Carlos M.' },
                    { value: '2', label: 'Ana B.' }
                  ]}
                  placeholder="Qualquer operador (Fila)"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowTransferModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">Confirmar Transferência</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCannedModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} style={{ color: 'var(--info)' }} />
                <h2 style={{ margin: 0, fontSize: '0.9375rem' }}>{editingCanned ? (editingCanned.id === 'new' ? 'Nova Resposta' : 'Editar Resposta') : 'Respostas Rápidas'}</h2>
              </div>
              <button className="close-btn" onClick={() => { setShowCannedModal(false); setEditingCanned(null); }}><X size={18} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {editingCanned ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!editingCanned.title || !editingCanned.text) return;
                  if (editingCanned.id === 'new') addCannedResponse(editingCanned.title, editingCanned.text);
                  else editCannedResponse(editingCanned.id, editingCanned.title, editingCanned.text);
                  setEditingCanned(null);
                }}>
                  <div className="form-group"><label className="form-label">Título</label><input type="text" className="form-control" value={editingCanned.title} onChange={e => setEditingCanned({...editingCanned, title: e.target.value})} autoFocus required /></div>
                  <div className="form-group"><label className="form-label">Mensagem</label><textarea className="form-control" rows={3} value={editingCanned.text} onChange={e => setEditingCanned({...editingCanned, text: e.target.value})} required></textarea></div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button type="button" className="btn" onClick={() => setEditingCanned(null)}>Voltar</button>
                    <button type="submit" className="btn primary">Salvar</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button className="btn primary" onClick={() => setEditingCanned({ id: 'new', title: '', text: '' })} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}><Plus size={13} /> Nova Resposta</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cannedResponses.map(canned => (
                      <div key={canned.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-app)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onClick={() => { setInput(canned.text); setShowCannedModal(false); }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(99,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Zap size={13} style={{ color: 'var(--info)' }} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.125rem' }}>{canned.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{canned.text}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <button className="btn" style={{ padding: '0.25rem' }} onClick={() => setEditingCanned(canned)} title="Editar"><Edit2 size={13} /></button>
                          <button className="btn danger" style={{ padding: '0.25rem' }} onClick={() => setDeleteConfirm({ type: 'canned', id: canned.id, title: canned.title })} title="Excluir"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                    {cannedResponses.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>Nenhuma resposta rápida cadastrada.</p></div>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showNotesModal && activeTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <NotebookPen size={16} style={{ color: 'var(--warning)' }} />
                <h2 style={{ margin: 0, fontSize: '0.9375rem' }}>{editingNote ? (editingNote.id === 'new' ? 'Nova Nota' : 'Editar Nota') : 'Notas Internas'}</h2>
              </div>
              <button className="close-btn" onClick={() => { setShowNotesModal(false); setEditingNote(null); }}><X size={18} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {editingNote ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!editingNote.text) return;
                  if (editingNote.id === 'new') addNoteToTicket(activeTicket.id, editingNote.text);
                  else editNoteInTicket(activeTicket.id, editingNote.id, editingNote.text);
                  setEditingNote(null);
                }}>
                  <div className="form-group"><label className="form-label">Observação</label><textarea className="form-control" rows={3} value={editingNote.text} onChange={e => setEditingNote({...editingNote, text: e.target.value})} autoFocus required></textarea></div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button type="button" className="btn" onClick={() => setEditingNote(null)}>Voltar</button>
                    <button type="submit" className="btn primary">Salvar Nota</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button className="btn primary" onClick={() => setEditingNote({ id: 'new', text: '' })} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}><Plus size={13} /> Nova Nota</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeTicket.notes.map(note => (
                      <div key={note.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{note.operator[0]}</div>
                            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{note.operator}</span>
                          </div>
                          <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{note.date} · {note.time}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: '0.5rem', paddingLeft: '1.625rem' }}>{note.text}</div>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button className="btn" style={{ padding: '0.25rem' }} onClick={() => setEditingNote(note)} title="Editar"><Edit2 size={13} /></button>
                          <button className="btn danger" style={{ padding: '0.25rem' }} onClick={() => setDeleteConfirm({ type: 'note', id: note.id, title: 'Nota de ' + note.date })} title="Excluir"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                    {activeTicket.notes.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>Nenhuma nota interna registrada.</p></div>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.id && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--danger)' }}>Confirmar Exclusão</h2>
              <button className="close-btn" onClick={() => setDeleteConfirm({ type: null, id: null, title: null, parentId: null })}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <p>Tem certeza que deseja excluir <strong>{deleteConfirm.title}</strong>? Esta ação não poderá ser desfeita.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn" onClick={() => setDeleteConfirm({ type: null, id: null, title: null, parentId: null })}>
                Cancelar
              </button>
              <button 
                className="btn danger" 
                style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }}
                onClick={() => {
                  if (deleteConfirm.type === 'canned') {
                    deleteCannedResponse(deleteConfirm.id);
                  } else if (deleteConfirm.type === 'note' && activeTicket) {
                    deleteNoteFromTicket(activeTicket.id, deleteConfirm.id);
                  } else if (deleteConfirm.type === 'reason') {
                    deleteTicketReason(deleteConfirm.id);
                    if (selectedReason === deleteConfirm.id) {
                      setSelectedReason('');
                      setSelectedSubReason('');
                    }
                  } else if (deleteConfirm.type === 'subreason') {
                    deleteTicketSubReason(deleteConfirm.id);
                    if (selectedSubReason === deleteConfirm.id) {
                      setSelectedSubReason('');
                    }
                  } else if (deleteConfirm.type === 'equipment') {
                    deleteEquipmentFromTicket(activeTicket.id, deleteConfirm.id);
                  }
                  setDeleteConfirm({ type: null, id: null, title: null, parentId: null });
                }}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && activeTicket && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                Encerrar Chamado
              </h2>
              <button className="close-btn" onClick={() => {
                setShowCloseModal(false);
                setEditingReason(null);
                setEditingSubReason(null);
              }}>
                <X size={18} />
              </button>
            </div>
            
            {editingReason ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editingReason.title) return;
                if (editingReason.id === 'new') addTicketReason(editingReason.title);
                else editTicketReason(editingReason.id, editingReason.title);
                setEditingReason(null);
              }}>
                <div className="form-group">
                  <label className="form-label">Nome do Motivo</label>
                  <input type="text" className="form-control" value={editingReason.title} onChange={e => setEditingReason({...editingReason, title: e.target.value})} autoFocus required />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn" onClick={() => setEditingReason(null)}>Cancelar</button>
                  <button type="submit" className="btn primary">Salvar</button>
                </div>
              </form>
            ) : editingSubReason ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editingSubReason.title) return;
                if (editingSubReason.id === 'new') addTicketSubReason(selectedReason, editingSubReason.title);
                else editTicketSubReason(editingSubReason.id, editingSubReason.title);
                setEditingSubReason(null);
              }}>
                <div className="form-group">
                  <label className="form-label">Nome do Submotivo</label>
                  <input type="text" className="form-control" value={editingSubReason.title} onChange={e => setEditingSubReason({...editingSubReason, title: e.target.value})} autoFocus required />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn" onClick={() => setEditingSubReason(null)}>Cancelar</button>
                  <button type="submit" className="btn primary">Salvar</button>
                </div>
              </form>
            ) : (
              <>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Selecione o motivo e submotivo do chamado antes de encerrá-lo.
                </p>
                
                <div className="form-group">
                  <label className="form-label">Motivo Principal</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                    {ticketReasons.map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: selectedReason === r.id ? 'var(--bg-active)' : 'transparent', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }} onClick={() => { setSelectedReason(r.id); setSelectedSubReason(''); }}>
                        <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: selectedReason === r.id ? 600 : 400 }}>{r.title}</div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn" style={{ padding: '0.2rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setEditingReason(r); }}><Edit2 size={12} /></button>
                          <button className="btn danger" style={{ padding: '0.2rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'reason', id: r.id, title: r.title }); }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn" style={{ width: '100%', fontSize: '0.75rem', borderStyle: 'dashed', padding: '0.35rem' }} onClick={() => setEditingReason({ id: 'new', title: '' })}>
                    <Plus size={12} /> Novo Motivo
                  </button>
                </div>

                {selectedReason && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Submotivo</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                      {ticketSubReasons.filter(sr => sr.parentId === selectedReason).map(sr => (
                        <div key={sr.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: selectedSubReason === sr.id ? 'var(--bg-active)' : 'transparent', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }} onClick={() => setSelectedSubReason(sr.id)}>
                          <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: selectedSubReason === sr.id ? 600 : 400 }}>{sr.title}</div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn" style={{ padding: '0.2rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setEditingSubReason(sr); }}><Edit2 size={12} /></button>
                            <button className="btn danger" style={{ padding: '0.2rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'subreason', id: sr.id, title: sr.title }); }}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                      {ticketSubReasons.filter(sr => sr.parentId === selectedReason).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhum submotivo para este motivo.</div>
                      )}
                    </div>
                    <button className="btn" style={{ width: '100%', fontSize: '0.75rem', borderStyle: 'dashed', padding: '0.35rem' }} onClick={() => setEditingSubReason({ id: 'new', title: '' })}>
                      <Plus size={12} /> Novo Submotivo
                    </button>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Descrição do Chamado (Opcional)</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Resumo do que foi tratado..."
                    value={closingDescription}
                    onChange={e => setClosingDescription(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                  <button className="btn" onClick={() => setShowCloseModal(false)}>Cancelar</button>
                  <button className="btn primary" disabled={!selectedReason || !selectedSubReason} onClick={() => { 
                    closeTicket(activeTicket.id, selectedReason, selectedSubReason, closingDescription); 
                    setShowCloseModal(false);
                    setSelectedReason(''); 
                    setSelectedSubReason('');
                    setClosingDescription('');
                  }}>
                    <CheckCircle2 size={16} /> Encerrar e Salvar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDevModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
                <Cpu size={20} />
                Enviar para Desenvolvimento
              </h2>
              <button className="close-btn" onClick={() => {
                setShowDevModal(false);
                setDevPublicLink('');
              }}><X size={18} /></button>
            </div>
            
            {!devPublicLink ? (
              <>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Utilize este espaço para reportar bugs ou solicitar melhorias diretamente para a equipe técnica.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Título do Card</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: Bug no relatório de faturamento"
                        style={{ fontSize: '0.9375rem', padding: '0.625rem 0.875rem' }}
                        value={devTitle}
                        onChange={e => setDevTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Descrição Detalhada</label>
                      <textarea 
                        className="form-control" 
                        rows={8} 
                        placeholder="Descreva detalhadamente o problema ou solicitação..."
                        style={{ fontSize: '0.9375rem', padding: '0.625rem 0.875rem', lineHeight: 1.5, resize: 'none' }}
                        value={devNote}
                        onChange={e => setDevNote(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tipo do Card</label>
                      <Select 
                        value={devType}
                        onChange={setDevType}
                        options={cardTypes.map(t => ({ value: t.id, label: t.title }))}
                        placeholder="-- Selecione o Tipo --"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Equipe de Destino</label>
                      <Select 
                        value={devTeam}
                        onChange={setDevTeam}
                        options={[
                          { value: 'backend', label: 'Backend / API' },
                          { value: 'frontend', label: 'Frontend / UI' },
                          { value: 'mobile', label: 'Mobile App' },
                          { value: 'qa', label: 'QA / Testes' }
                        ]}
                        placeholder="-- Selecione a Equipe --"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Anexos (Logs, Imagens)</label>
                      <div 
                        style={{ 
                          border: '2px dashed var(--border-color)', 
                          borderRadius: 'var(--radius-sm)', 
                          padding: '2rem 1rem', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'var(--bg-app)',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => devFileRef.current?.click()}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <Paperclip size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Clique para selecionar arquivos<br/>ou arraste-os para cá
                        </div>
                      </div>
                      <input type="file" ref={devFileRef} style={{ display: 'none' }} multiple />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <button className="btn" onClick={() => setShowDevModal(false)}>Cancelar</button>
                  <button className="btn primary" onClick={() => {
                    if (devTitle.trim() && devTeam && devNote.trim() && devType) {
                      const id = Math.floor(Math.random() * 9000) + 1000;
                      setDevPublicLink(`https://orby.io/track/${id}`);
                    }
                  }}>
                    <Rocket size={16} /> Criar Card e Gerar Link
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Card Criado com Sucesso!</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>A solicitação foi enviada para a equipe de desenvolvimento.</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Link Público para o Cliente</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-control" value={devPublicLink} readOnly />
                    <button className="btn primary" onClick={() => {
                      navigator.clipboard.writeText(devPublicLink);
                      alert('Link copiado!');
                    }}>Copiar</button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Envie este link para que o cliente possa acompanhar o status em tempo real.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                  <button className="btn" onClick={() => {
                    setShowDevModal(false);
                    setDevPublicLink('');
                    setDevTitle('');
                    setDevTeam('');
                    setDevNote('');
                    setDevType('');
                  }}>Fechar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History conversation modal */}
      {historyConversation && (
        <div className="modal-overlay" onClick={() => setHistoryConversation(null)}>
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={16} style={{ color: 'var(--info)' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '0.9375rem' }}>{historyConversation.ticketId}</h2>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{historyConversation.date} · {historyConversation.sector} · {historyConversation.operator}</div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setHistoryConversation(null)}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
              <div className="search-input-wrap">
                <Search size={13} />
                <input 
                  type="text" 
                  placeholder="Pesquisar nesta conversa..." 
                  value={historySearch} 
                  onChange={e => setHistorySearch(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {historyConversation.messages
                .filter(m => {
                  if (m.isDivider) return true;
                  
                  // Search filter (ID or Description/Text)
                  const matchesSearch = !historySearch || 
                    m.text.toLowerCase().includes(historySearch.toLowerCase()) ||
                    historyConversation.ticketId.toLowerCase().includes(historySearch.toLowerCase());
                  
                  if (!matchesSearch) return false;

                  // Reason/Subreason filters (In a real app, this would be on the ticket level, but here we can mock check)
                  if (historyReasonFilter && historyConversation.reason !== historyReasonFilter) return false;
                  if (historySubReasonFilter && historyConversation.subReason !== historySubReasonFilter) return false;

                  // Date filter
                  if (historyStart || historyEnd) {
                    // This is a bit tricky with mock strings like "10/04/2024", but for demo:
                    const msgDate = historyConversation.date; // Use ticket date for simplicity in mock
                    // Implementation would vary based on actual date format
                  }

                  return true;
                })
                .map((m, i, filtered) => {
                  if (m.isDivider) {
                    const nextDividerIdx = filtered.findIndex((nm, ni) => ni > i && nm.isDivider);
                    const messagesBetween = filtered.slice(i + 1, nextDividerIdx === -1 ? undefined : nextDividerIdx);
                    if (messagesBetween.length === 0) return null;

                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{
                      alignSelf: m.sender === 'operator' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.8125rem', lineHeight: 1.45,
                      background: m.sender === 'operator' ? 'var(--accent-color)' : 'var(--bg-hover)',
                      color: m.sender === 'operator' ? 'var(--accent-text)' : 'var(--text-primary)',
                      border: m.sender === 'operator' ? 'none' : '1px solid var(--border-color)',
                    }}>
                      <div>{m.text}</div>
                      <div style={{ fontSize: '0.625rem', opacity: 0.6, textAlign: 'right', marginTop: '0.125rem' }}>{m.time}</div>
                    </div>
                  );
                })}
              
              {historyConversation.messages.filter(m => !m.isDivider).length > 0 && 
               historyConversation.messages.filter(m => {
                 if (m.isDivider) return false;
                 const matchesSearch = !historySearch || 
                    m.text.toLowerCase().includes(historySearch.toLowerCase()) ||
                    historyConversation.ticketId.toLowerCase().includes(historySearch.toLowerCase());
                 if (!matchesSearch) return false;
                 if (historyReasonFilter && historyConversation.reason !== historyReasonFilter) return false;
                 if (historySubReasonFilter && historyConversation.subReason !== historySubReasonFilter) return false;
                 return true;
               }).length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Nenhum resultado para os filtros aplicados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Equipments Modal */}
      {showEquipmentsModal && activeTicket && (
        <div className="modal-overlay" onClick={() => { setShowEquipmentsModal(false); setEditingEquipment(null); setIsAddingEquipment(false); }} style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Monitor size={20} style={{ color: 'var(--accent-color)' }} />
                {isAddingEquipment || editingEquipment ? (editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento') : 'Equipamentos do Cliente'}
              </h2>
              <button className="close-btn" onClick={() => { 
                if (isAddingEquipment || editingEquipment) {
                  setIsAddingEquipment(false);
                  setEditingEquipment(null);
                } else {
                  setShowEquipmentsModal(false); 
                }
              }}><X size={18} /></button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              {!(isAddingEquipment || editingEquipment) ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button className="btn primary" onClick={() => setIsAddingEquipment(true)}>
                      <Plus size={16} /> Novo Equipamento
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {activeTicket.equipments?.length > 0 ? (
                      activeTicket.equipments.map(e => {
                        const isExpanded = expandedEquipmentId === e.id;
                        return (
                          <div key={e.id} style={{ 
                            background: 'var(--bg-panel)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{ 
                                padding: '0.75rem 1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onClick={() => setExpandedEquipmentId(isExpanded ? null : e.id)}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{e.name}</span>
                                  <span style={{ 
                                    fontSize: '0.65rem', 
                                    color: '#000000', 
                                    fontWeight: 800, 
                                    textTransform: 'uppercase', 
                                    background: 'var(--accent-color)',
                                    padding: '0.125rem 0.45rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--accent-color)',
                                    letterSpacing: '0.02em'
                                  }}>{e.type}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                                <button className="btn" style={{ padding: '0.25rem', border: 'none', background: 'transparent' }} onClick={() => setEditingEquipment(e)}>
                                  <Edit2 size={14} style={{ color: 'var(--text-secondary)' }} />
                                </button>
                                <button className="btn" style={{ padding: '0.25rem', border: 'none', background: 'transparent' }} onClick={() => setDeleteConfirm({ type: 'equipment', id: e.id, title: e.name })}>
                                  <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                                </button>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div style={{ 
                                padding: '0 1rem 1rem 2.5rem', 
                                fontSize: '0.8125rem', 
                                color: 'var(--text-secondary)', 
                                whiteSpace: 'pre-wrap', 
                                lineHeight: 1.5,
                                borderTop: '1px solid var(--border-subtle)',
                                paddingTop: '0.75rem',
                                background: 'var(--bg-app)'
                              }}>
                                {e.description}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                        <Monitor size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <div>Nenhum equipamento cadastrado para este cliente.</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '0.5rem 0' }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingEquipment) {
                      editEquipmentInTicket(activeTicket.id, editingEquipment.id, eqName, eqType, eqDesc);
                      setEditingEquipment(null);
                    } else {
                      addEquipmentToTicket(activeTicket.id, eqName, eqType, eqDesc);
                      setIsAddingEquipment(false);
                    }
                    setEqName('');
                    setEqType('servidor desktop');
                    setEqDesc('');
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ flex: 1.5 }}>
                        <label className="form-label">Nome do Dispositivo</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Ex: Servidor Principal" 
                          value={eqName}
                          onChange={e => setEqName(e.target.value)}
                          required 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Tipo</label>
                        <Select 
                          value={eqType}
                          onChange={setEqType}
                          options={[
                            { value: 'servidor desktop', label: 'Servidor Desktop' },
                            { value: 'terminal desktop', label: 'Terminal Desktop' },
                            { value: 'celular', label: 'Celular' },
                            { value: 'totem', label: 'Totem' },
                            { value: 'pos', label: 'POS' }
                          ]}
                          placeholder="Selecione o Tipo"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Descrição (Acessos, Senhas, etc.)</label>
                      <textarea 
                        className="form-control" 
                        rows={5} 
                        placeholder="Anydesk: 123 456 789\nSenha: admin123" 
                        value={eqDesc}
                        onChange={e => setEqDesc(e.target.value)}
                      ></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                      <button type="button" className="btn" onClick={() => { setIsAddingEquipment(false); setEditingEquipment(null); }}>Cancelar</button>
                      <button type="submit" className="btn primary">
                        {editingEquipment ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
