import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ArrowRightLeft, X, User, CheckCircle2, NotebookPen, Mail, Phone, Clock, Info, Zap, Plus, Edit2, Trash2, Paperclip, Image as ImageIcon, FileText, History, Layers, Search, AlertCircle, Cpu, Rocket, Monitor, ChevronDown, ChevronUp, MessageCircle, Star, Save, FileSignature, ArrowRight } from 'lucide-react';
import Select from './Select';
import DateTimePicker from './DateTimePicker';
import { useAppContext } from '../context/AppContext';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').slice(0, 2).join('/') + ' ' + 
         date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function ChatWindow({ ticketId, isModal = false, onClose }) {
  const { 
    tickets, 
    addMessageToTicket, 
    transferTicket,
    closeTicket,
    updateClient,
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
    standByReasons,
    addStandByReason,
    editStandByReason,
    deleteStandByReason,
    standByTicket,
    resumeTicket,
    sectors,
    operators,
    cardTypes,
    isClientTyping,
    fetchTicketHistory,
    escalateTicketToDev
  } = useAppContext();

  const activeTicket = tickets.find(t => t.id.toString() === ticketId.toString()) || null;
  
  const [input, setInput] = useState('');
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedSubReason, setSelectedSubReason] = useState('');
  const [closingDescription, setClosingDescription] = useState('');
  const [closingRating, setClosingRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [editingReason, setEditingReason] = useState(null);
  const [editingSubReason, setEditingSubReason] = useState(null);
  const [editingCanned, setEditingCanned] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEquipmentsModal, setShowEquipmentsModal] = useState(false);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [expandedEquipmentId, setExpandedEquipmentId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientData, setEditClientData] = useState({});
  const [historyConversation, setHistoryConversation] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyReasonFilter, setHistoryReasonFilter] = useState('');
  const [historySubReasonFilter, setHistorySubReasonFilter] = useState('');
  const [historyStart, setHistoryStart] = useState(null);
  const [historyEnd, setHistoryEnd] = useState(null);
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTab, setTransferTab] = useState('transfer');
  const [transferSector, setTransferSector] = useState('');
  const [transferOperator, setTransferOperator] = useState('');
  const [selectedStandByReason, setSelectedStandByReason] = useState('');
  const [editingStandByReason, setEditingStandByReason] = useState(null);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devTitle, setDevTitle] = useState('');
  const [devNote, setDevNote] = useState('');
  const [devTeam, setDevTeam] = useState('');
  const [devType, setDevType] = useState('');
  const [devPublicLink, setDevPublicLink] = useState('');
  const devFileRef = useRef(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, title: null, parentId: null });
  const [eqName, setEqName] = useState('');
  const [eqType, setEqType] = useState('servidor desktop');
  const [eqDesc, setEqDesc] = useState('');

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isTransferred = activeTicket?.status === 'transferred' || activeTicket?.status === 'closed';
  const isStandBy = activeTicket?.status === 'stand_by';

  useEffect(() => {
    if (activeTicket) {
      if (activeTicket.client?.id) {
        fetchTicketHistory(activeTicket.client.id);
      }
    }
  }, [ticketId, activeTicket?.client?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeTicket || isTransferred || isStandBy) return;
    const operatorName = "Gabriel Otacilio"; 
    addMessageToTicket(activeTicket.id, input, 'operator', operatorName);
    setInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeTicket || isTransferred || isStandBy) return;
    const isImage = file.type.startsWith('image/');
    addMessageToTicket(activeTicket.id, file.name, 'operator', isImage ? 'image' : 'file');
    e.target.value = '';
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (transferTab === 'transfer') {
      transferTicket(activeTicket.id, transferSector, transferOperator);
    } else {
      standByTicket(activeTicket.id, selectedStandByReason);
    }
    setShowTransferModal(false);
  };

  if (!activeTicket) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
         <User size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
         <p>Selecione um atendimento para visualizar.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0, height: '100%' }}>
      <div className="chat-main" style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isTransferred ? 'var(--text-secondary)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {!isTransferred && <span style={{ width: 6, height: 6, borderRadius: '50%', background: isClientTyping ? 'var(--warning)' : 'var(--success)' }}></span>}
                {isTransferred ? (activeTicket.status === 'transferred' ? 'Transferido' : 'Encerrado') : isClientTyping ? <span style={{ color: 'var(--warning)' }}>Digitando...</span> : 'Online'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isTransferred && (
              <>
                <button className={`btn ${showEquipmentsModal ? 'primary' : ''}`} title="Equipamentos do Cliente" onClick={() => setShowEquipmentsModal(true)}><Monitor size={16} /></button>
                <button className={`btn ${showNotesModal ? 'primary' : ''}`} title="Notas Internas" onClick={() => setShowNotesModal(true)}><NotebookPen size={16} /></button>
                <button className={`btn ${showCannedModal ? 'primary' : ''}`} title="Respostas Rápidas" onClick={() => setShowCannedModal(true)}><Zap size={16} /></button>
                <button className={`btn ${showDevModal ? 'primary' : ''}`} title="Enviar para Desenvolvimento" onClick={() => setShowDevModal(true)} style={{ color: 'var(--danger)' }}><AlertCircle size={16} /></button>
                <button className="btn" title="Transferir Atendimento" onClick={() => setShowTransferModal(true)}><ArrowRightLeft size={16} /> Transferir</button>
                <button className="btn primary" title="Encerrar Atendimento" onClick={() => setShowCloseModal(true)}><CheckCircle2 size={16} /> Encerrar</button>
              </>
            )}
            <button className={`btn ${showClientInfo ? 'primary' : ''}`} title="Detalhes do Cliente" onClick={() => setShowClientInfo(!showClientInfo)}><Info size={16} /></button>
            {isModal && <button className="close-btn" onClick={onClose}><X size={18} /></button>}
          </div>
        </div>

        <div className="chat-messages">
          {activeTicket.messages.map((msg) => {
            if (msg.sender === 'system') return <div key={msg.id} style={{ alignSelf: 'center', margin: '1rem 0', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid rgba(245, 158, 11, 0.2)' }}>{msg.text}</div>;
            return (
              <div key={msg.id} className={`message ${msg.sender === 'operator' ? 'sent' : 'received'}`}>
                {msg.type === 'image' ? <div style={{ marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', width: '180px' }}><ImageIcon size={32} style={{ opacity: 0.5 }} /></div> : msg.type === 'file' ? <div style={{ marginBottom: '0.5rem', padding: '0.75rem', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}><FileText size={18} /><span className="mono" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{msg.text}</span></div> : <div style={{ marginBottom: '0.25rem', wordBreak: 'break-word' }}>{msg.text}</div>}
                <div className="mono" style={{ opacity: 0.7, textAlign: 'right', fontSize: '0.75rem' }}>{msg.time}</div>
              </div>
            );
          })}
          {isClientTyping && <div className="message received typing" style={{ padding: '0.75rem 1.125rem', display: 'flex', gap: '0.25rem', alignItems: 'center', width: 'fit-content' }}><span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-secondary)', borderRadius: '50%' }}></span><span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-secondary)', borderRadius: '50%' }}></span><span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-secondary)', borderRadius: '50%' }}></span></div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
          {isStandBy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', padding: '1rem' }}>
              <div style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><AlertCircle size={18} /> Chamado em Stand by: {activeTicket.standByReason || 'Sem motivo'}</div>
              <button className="btn primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', background: '#10b981', borderColor: '#10b981', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => resumeTicket(activeTicket.id)}><CheckCircle2 size={18} /> Retomar Atendimento</button>
            </div>
          ) : (
            <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onSubmit={handleSend}>
              <button type="button" className="btn" title="Anexar Arquivo" onClick={() => fileInputRef.current?.click()} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }} disabled={isTransferred}><Paperclip size={16} /></button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} disabled={isTransferred} />
              <input type="text" className="chat-input" placeholder={isTransferred ? "Atendimento encerrado." : "Digite sua mensagem..."} value={input} onChange={(e) => setInput(e.target.value)} disabled={isTransferred} style={{ flex: 1 }} />
              <button type="submit" className="btn primary" disabled={isTransferred || !input.trim()} style={{ padding: '0.5rem 1rem' }}><Send size={16} /></button>
            </form>
          )}
        </div>
      </div>

      {showClientInfo && (
        <div className="panel-slide-in" style={{ width: '300px', minWidth: '300px', flexShrink: 0, borderLeft: '1px solid var(--border-color)', background: 'var(--bg-panel)', padding: '1.25rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, margin: 0 }}>Informações do Cliente</h3>
            {!isEditingClient ? (
              <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => { setIsEditingClient(true); setEditClientData({ name: activeTicket.client?.name || activeTicket.clientName || '', document: activeTicket.client?.document || '', phoneNumber: activeTicket.client?.phoneNumber || '', email: activeTicket.client?.email || '' }); }}>
                <Edit2 size={12} /> Editar
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setIsEditingClient(false)}><X size={12} /></button>
                <button className="btn primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={async () => { if (activeTicket.client?.id) { await updateClient(activeTicket.client.id, editClientData); setIsEditingClient(false); } }}>
                  <Save size={12} /> Salvar
                </button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}><User size={11} /> Nome</div>
            {isEditingClient ? <input type="text" className="form-control" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }} value={editClientData.name} onChange={e => setEditClientData({ ...editClientData, name: e.target.value })} /> : <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeTicket.clientName}</div>}</div>
            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}><FileSignature size={11} /> CPF/CNPJ</div>
            {isEditingClient ? <input type="text" className="form-control" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }} value={editClientData.document} onChange={e => setEditClientData({ ...editClientData, document: e.target.value })} /> : <div style={{ fontSize: '0.875rem' }}>{activeTicket.client?.document || '—'}</div>}</div>
            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}><Mail size={11} /> E-mail</div>
            {isEditingClient ? <input type="email" className="form-control" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }} value={editClientData.email} onChange={e => setEditClientData({ ...editClientData, email: e.target.value })} /> : <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{activeTicket.client?.email || '—'}</div>}</div>
            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}><Phone size={11} /> Telefone</div>
            {isEditingClient ? <input type="text" className="form-control" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }} value={editClientData.phoneNumber} onChange={e => setEditClientData({ ...editClientData, phoneNumber: e.target.value })} /> : <div style={{ fontSize: '0.875rem' }}>{activeTicket.client?.phoneNumber || '—'}</div>}</div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />
          
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><History size={12} /> Histórico</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="search-input-wrap" style={{ flex: 1, margin: 0 }}><Search size={14} /><input type="text" placeholder="Filtrar tickets..." style={{ fontSize: '0.8125rem', height: '36px' }} value={historySearch} onChange={e => setHistorySearch(e.target.value)} /></div>
              <button className={`btn ${showHistoryFilters ? 'primary' : ''}`} style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-sm)' }} onClick={() => setShowHistoryFilters(!showHistoryFilters)}><Search size={16} /></button>
            </div>
            {showHistoryFilters && <div style={{ padding: '0.75rem', background: 'var(--bg-active)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Select value={historyReasonFilter} onChange={(val) => { setHistoryReasonFilter(val); setHistorySubReasonFilter(''); }} options={ticketReasons.map(r => ({ value: r.title, label: r.title }))} placeholder="Motivo" />
              <DateTimePicker value={historyStart} onChange={setHistoryStart} placeholder="Início" />
              <DateTimePicker value={historyEnd} onChange={setHistoryEnd} placeholder="Fim" />
            </div>}
          </div>
          {activeTicket.history && activeTicket.history.length > 0 && <button className="btn" style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.75rem', borderStyle: 'dashed' }} onClick={() => { const allMessages = activeTicket.history.flatMap(h => [{ isDivider: true, label: `Protocolo ${h.ticketId} - ${formatDate(h.date)}` }, ...h.messages]); setHistoryConversation({ ticketId: 'Histórico Unificado', date: 'Todas as datas', sector: activeTicket.clientName, operator: 'Múltiplos', messages: allMessages }); }}><Layers size={14} /> Ver Histórico Completo</button>}
          {activeTicket.history?.map(h => (
            <div key={h.ticketId} className="panel" style={{ padding: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid var(--border-color)' }} onClick={() => setHistoryConversation(h)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}><span>{h.ticketId}</span><span>{formatDate(h.date)}</span></div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginTop: '0.25rem' }}>{h.reason}</div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showTransferModal && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h2>Gerenciar Atendimento</h2><button className="close-btn" onClick={() => setShowTransferModal(false)}><X size={18} /></button></div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={() => setTransferTab('transfer')} style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: transferTab === 'transfer' ? '2px solid var(--primary)' : '2px solid transparent', color: transferTab === 'transfer' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Transferir</button>
          <button onClick={() => setTransferTab('standby')} style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: transferTab === 'standby' ? '2px solid var(--warning)' : '2px solid transparent', color: transferTab === 'standby' ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>Stand by</button>
        </div>
        <form onSubmit={handleTransfer}>
          {transferTab === 'transfer' ? <>
            <div className="form-group"><label className="form-label">Setor</label><Select value={transferSector} onChange={setTransferSector} options={sectors.map(s => ({ value: s.id.toString(), label: s.name }))} placeholder="-- Selecione --" required /></div>
            <div className="form-group"><label className="form-label">Operador</label><Select value={transferOperator} onChange={setTransferOperator} options={operators.map(o => ({ value: o.id.toString(), label: o.name }))} placeholder="Qualquer um" /></div>
          </> : <>
            <div className="form-group"><label className="form-label">Motivo Stand by</label><Select value={selectedStandByReason} onChange={setSelectedStandByReason} options={standByReasons.map(r => ({ value: r.title, label: r.title }))} placeholder="-- Selecione --" required /></div>
          </>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}><button type="button" className="btn" onClick={() => setShowTransferModal(false)}>Cancelar</button><button type="submit" className="btn primary">Confirmar</button></div>
        </form>
      </div></div>}

      {showCannedModal && <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: '520px' }}><div className="modal-header"><h2>Respostas Rápidas</h2><button className="close-btn" onClick={() => setShowCannedModal(false)}><X size={18} /></button></div>
        <div style={{ padding: '1.25rem' }}>{cannedResponses.map(c => <div key={c.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => { setInput(c.text); setShowCannedModal(false); }}><strong>{c.title}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.text}</div></div>)}</div>
      </div></div>}

      {showNotesModal && activeTicket && <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: '520px' }}><div className="modal-header"><h2>Notas Internas</h2><button className="close-btn" onClick={() => setShowNotesModal(false)}><X size={18} /></button></div>
        <div style={{ padding: '1.25rem' }}>
          <form onSubmit={(e) => { e.preventDefault(); const text = e.target.note.value; if (text) { addNoteToTicket(activeTicket.id, text); e.target.reset(); } }} style={{ marginBottom: '1.5rem' }}>
            <textarea name="note" className="form-control" rows={3} placeholder="Adicionar nota..."></textarea>
            <button type="submit" className="btn primary" style={{ marginTop: '0.5rem', width: '100%' }}>Adicionar Nota</button>
          </form>
          {activeTicket.notes?.map(n => <div key={n.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '0.5rem', background: 'var(--bg-app)' }}><strong>{n.operator}</strong><div style={{ fontSize: '0.8rem' }}>{n.text}</div></div>)}
        </div>
      </div></div>}

      {showEquipmentsModal && activeTicket && <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: '540px' }}><div className="modal-header"><h2>Equipamentos</h2><button className="close-btn" onClick={() => setShowEquipmentsModal(false)}><X size={18} /></button></div>
        <div style={{ padding: '1.25rem' }}>{activeTicket.equipments?.map(e => <div key={e.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}><strong>{e.name} ({e.type})</strong><div>{e.description}</div></div>)}</div>
      </div></div>}

      {showDevModal && <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: '800px' }}><div className="modal-header"><h2>Dev Escalation</h2><button className="close-btn" onClick={() => setShowDevModal(false)}><X size={18} /></button></div>
        <div style={{ padding: '1.5rem' }}>
          <div className="form-group"><label className="form-label">Título</label><input type="text" className="form-control" value={devTitle} onChange={e => setDevTitle(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-control" rows={5} value={devNote} onChange={e => setDevNote(e.target.value)}></textarea></div>
          <button className="btn primary" onClick={() => { if (devTitle && devNote) { escalateTicketToDev(activeTicket.id, { title: devTitle, description: devNote }); setShowDevModal(false); } }}>Enviar para Dev</button>
        </div>
      </div></div>}

      {showCloseModal && activeTicket && <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: '480px' }}><div className="modal-header"><h2>Encerrar Chamado</h2><button className="close-btn" onClick={() => setShowCloseModal(false)}><X size={18} /></button></div>
        <div style={{ padding: '1.5rem' }}>
          <div className="form-group"><label className="form-label">Motivo</label><Select value={selectedReason} onChange={setSelectedReason} options={ticketReasons.map(r => ({ value: r.id, label: r.title }))} placeholder="Motivo" /></div>
          {selectedReason && <div className="form-group"><label className="form-label">Submotivo</label><Select value={selectedSubReason} onChange={setSelectedSubReason} options={ticketSubReasons.filter(sr => sr.parentId === selectedReason).map(sr => ({ value: sr.id, label: sr.title }))} placeholder="Submotivo" /></div>}
          <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-control" rows={3} value={closingDescription} onChange={e => setClosingDescription(e.target.value)}></textarea></div>
          <button className="btn primary" style={{ width: '100%' }} disabled={!selectedReason || !selectedSubReason} onClick={() => { closeTicket(activeTicket.id, ticketReasons.find(r => r.id === selectedReason).title, ticketSubReasons.find(sr => sr.id === selectedSubReason).title, closingDescription); setShowCloseModal(false); }}>Encerrar</button>
        </div>
      </div></div>}

      {historyConversation && <div className="modal-overlay" onClick={() => setHistoryConversation(null)}><div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{historyConversation.ticketId}</h2><button className="close-btn" onClick={() => setHistoryConversation(null)}><X size={18} /></button></div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '70vh' }}>
          {historyConversation.messages.map((m, i) => <div key={i} style={{ alignSelf: m.sender === 'operator' ? 'flex-end' : 'flex-start', background: m.sender === 'operator' ? 'var(--accent-color)' : 'var(--bg-hover)', color: m.sender === 'operator' ? 'var(--accent-text)' : 'var(--text-primary)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>{m.text}</div>)}
        </div>
      </div></div>}

      {deleteConfirm.id && <div className="modal-overlay"><div className="modal-content"><h2>Excluir?</h2><p>Confirma exclusão de {deleteConfirm.title}?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}><button className="btn" onClick={() => setDeleteConfirm({ id: null })}>Não</button><button className="btn danger" onClick={() => { /* DELETE LOGIC */ setDeleteConfirm({ id: null }); }}>Sim, excluir</button></div>
      </div></div>}
    </div>
  );
}

export default ChatWindow;
