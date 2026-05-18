import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ArrowRightLeft, X, User, CheckCircle2, NotebookPen, Mail, Phone, Clock, Info, Zap, Plus, Edit2, Trash2, Paperclip, Image as ImageIcon, FileText, History, Layers, Search, AlertCircle, Cpu, Rocket, Monitor, ChevronDown, ChevronUp, MessageCircle, Star, Save, FileSignature, ArrowRight } from 'lucide-react';
import Select from './Select';
import DateTimePicker from './DateTimePicker';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

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
    escalateTicketToDev,
    addMediaMessageToTicket
  } = useAppContext();

  const { user } = useAuth();
  const activeTicket = tickets.find(t => t.id.toString() === ticketId.toString()) || null;
  const isOthersTicket = activeTicket?.operator && activeTicket?.operator !== 'Você' && activeTicket?.operator !== user?.name;
  const canRespond = user?.role !== 'OPERATOR' || user?.respondOthersTickets !== false || !isOthersTicket;
  const canManageClient = user?.role !== 'OPERATOR' || user?.manageClientData !== false;
  const canManageSectorsAndReasons = user?.role !== 'OPERATOR' || user?.manageSectorsAndReasons !== false;

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeTicket || isTransferred || isStandBy) return;
    
    let type = 'DOCUMENT';
    if (file.type.startsWith('image/')) type = 'IMAGE';
    else if (file.type.startsWith('video/')) type = 'VIDEO';
    else if (file.type.startsWith('audio/')) type = 'AUDIO';
    
    await addMediaMessageToTicket(activeTicket.id, file, type);
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

  const renderMessageContent = (msg) => {
    const mediaUrl = msg.mediaUrl ? (msg.mediaUrl.includes('graph.facebook.com') || msg.mediaUrl.includes('lookaside.fbsbx.com') ? `http://localhost:8080/api/media/proxy?url=${encodeURIComponent(msg.mediaUrl)}` : msg.mediaUrl) : null;

    switch (msg.type) {
      case 'IMAGE':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <img src={mediaUrl} alt="Image" style={{ maxWidth: '100%', maxHeight:'300px', borderRadius: 'var(--radius-sm)', cursor:'pointer', objectFit:'contain' }} onClick={() => window.open(mediaUrl, '_blank')} />
            {msg.text && <div style={{ wordBreak:'break-word' }}>{msg.text}</div>}
          </div>
        );
      case 'VIDEO':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <video src={mediaUrl} controls style={{ maxWidth: '100%', maxHeight:'300px', borderRadius: 'var(--radius-sm)' }} />
            {msg.text && <div style={{ wordBreak:'break-word' }}>{msg.text}</div>}
          </div>
        );
      case 'AUDIO':
      case 'VOICE':
        return (
          <div style={{ padding: '0.25rem 0', minWidth:'240px' }}>
            <audio src={mediaUrl} controls style={{ width: '100%', height:'32px' }} />
          </div>
        );
      case 'DOCUMENT':
        return (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'var(--bg-active)', borderRadius:'var(--radius-sm)', textDecoration:'none', color:'var(--text-primary)', border:'1px solid var(--border-color)' }}>
            <FileText size={20} style={{ color:'var(--accent-color)' }} />
            <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <span style={{ fontSize:'0.8125rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.filename || 'Documento'}</span>
              <span style={{ fontSize:'0.65rem', color:'var(--text-secondary)', textTransform:'uppercase' }}>{msg.mimeType?.split('/')[1] || 'FILE'}</span>
            </div>
          </a>
        );
      default:
        return <div style={{ marginBottom: '0.25rem', wordBreak: 'break-word' }}>{msg.text}</div>;
    }
  };

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
                {canRespond && (
                  <>
                    <button className={`btn ${showCannedModal ? 'primary' : ''}`} title="Respostas Rápidas" onClick={() => setShowCannedModal(true)}><Zap size={16} /></button>
                    {canManageSectorsAndReasons && <button className={`btn ${showDevModal ? 'primary' : ''}`} title="Enviar para Desenvolvimento" onClick={() => setShowDevModal(true)} style={{ color: 'var(--danger)' }}><AlertCircle size={16} /></button>}
                    {canManageSectorsAndReasons && <button className="btn" title="Transferir Atendimento" onClick={() => setShowTransferModal(true)}><ArrowRightLeft size={16} /> Transferir</button>}
                    <button className="btn primary" title="Encerrar Atendimento" onClick={() => setShowCloseModal(true)}><CheckCircle2 size={16} /> Encerrar</button>
                  </>
                )}
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
              <div key={msg.id} className={`message ${msg.sender === 'operator' ? 'sent' : 'received'}`} style={{ maxWidth:'85%' }}>
                {renderMessageContent(msg)}
                <div className="mono" style={{ opacity: 0.7, textAlign: 'right', fontSize: '0.75rem', marginTop:'0.25rem' }}>{msg.time}</div>
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
              <button type="button" className="btn" title="Anexar Arquivo" onClick={() => fileInputRef.current?.click()} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }} disabled={isTransferred || !canRespond}><Paperclip size={16} /></button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} disabled={isTransferred || !canRespond} />
              <input type="text" className="chat-input" placeholder={isTransferred ? "Atendimento encerrado." : !canRespond ? "Sem permissão para responder a este chamado." : "Digite sua mensagem..."} value={input} onChange={(e) => setInput(e.target.value)} disabled={isTransferred || !canRespond} style={{ flex: 1 }} />
              <button type="submit" className="btn primary" disabled={isTransferred || !input.trim() || !canRespond} style={{ padding: '0.5rem 1rem' }}><Send size={16} /></button>
            </form>
          )}
        </div>
      </div>

      {showClientInfo && (
        <div className="panel-slide-in" style={{ width: '300px', minWidth: '300px', flexShrink: 0, borderLeft: '1px solid var(--border-color)', background: 'var(--bg-panel)', padding: '1.25rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, margin: 0 }}>Informações do Cliente</h3>
            {!isEditingClient ? (
              canManageClient && (
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => { setIsEditingClient(true); setEditClientData({ name: activeTicket.client?.name || activeTicket.clientName || '', document: activeTicket.client?.document || '', phoneNumber: activeTicket.client?.phoneNumber || '', email: activeTicket.client?.email || '' }); }}>
                  <Edit2 size={12} /> Editar
                </button>
              )
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

      {showCannedModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Respostas Rápidas</h2>
              <button className="close-btn" onClick={() => { setShowCannedModal(false); setEditingCanned(null); }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {canManageClient && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const title = e.target.title.value;
                  const text = e.target.text.value;
                  if (!title || !text) return;
                  if (editingCanned) {
                    await editCannedResponse(editingCanned.id, title, text);
                    setEditingCanned(null);
                  } else {
                    await addCannedResponse(title, text);
                  }
                  e.target.reset();
                }} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)' }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>{editingCanned ? 'Editar Resposta' : 'Nova Resposta Rápida'}</h3>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <input type="text" name="title" className="form-control" placeholder="Título/Atalho" defaultValue={editingCanned ? editingCanned.title : ''} key={editingCanned ? `title-edit-${editingCanned.id}` : 'title-new'} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <textarea name="text" className="form-control" rows={3} placeholder="Texto de resposta..." defaultValue={editingCanned ? editingCanned.text : ''} key={editingCanned ? `text-edit-${editingCanned.id}` : 'text-new'} required></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn primary" style={{ flex: 1 }}>{editingCanned ? 'Salvar Alterações' : 'Adicionar'}</button>
                    {editingCanned && <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingCanned(null)}>Cancelar</button>}
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cannedResponses.map(c => (
                  <div key={c.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)' }}>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setInput(c.text); setShowCannedModal(false); setEditingCanned(null); }}>
                      <strong style={{ fontSize: '0.875rem' }}>{c.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{c.text}</div>
                    </div>
                    {canManageClient && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem' }}>
                        <button className="btn" style={{ padding: '0.35rem' }} onClick={() => setEditingCanned(c)} title="Editar"><Edit2 size={13} /></button>
                        <button className="btn danger" style={{ padding: '0.35rem' }} onClick={() => deleteCannedResponse(c.id)} title="Excluir"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && activeTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Notas Internas</h2>
              <button className="close-btn" onClick={() => { setShowNotesModal(false); setEditingNote(null); }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {canManageClient ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const text = e.target.note.value;
                  if (!text) return;
                  if (editingNote) {
                    await editNoteInTicket(activeTicket.id, editingNote.id, text);
                    setEditingNote(null);
                  } else {
                    await addNoteToTicket(activeTicket.id, text);
                  }
                  e.target.reset();
                }} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)' }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>{editingNote ? 'Editar Nota Interna' : 'Nova Nota Interna'}</h3>
                  <textarea name="note" className="form-control" rows={3} placeholder="Adicionar nota..." defaultValue={editingNote ? editingNote.text : ''} key={editingNote ? `note-edit-${editingNote.id}` : 'note-new'} required></textarea>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn primary" style={{ flex: 1 }}>{editingNote ? 'Salvar Alterações' : 'Adicionar Nota'}</button>
                    {editingNote && <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingNote(null)}>Cancelar</button>}
                  </div>
                </form>
              ) : (
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Você não possui permissão para gerenciar dados do cliente e adicionar notas.
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeTicket.notes?.map(n => (
                  <div key={n.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem' }}>{n.operator}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(n.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{n.text}</div>
                    </div>
                    {canManageClient && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem' }}>
                        <button className="btn" style={{ padding: '0.35rem' }} onClick={() => setEditingNote(n)} title="Editar"><Edit2 size={13} /></button>
                        <button className="btn danger" style={{ padding: '0.35rem' }} onClick={() => deleteNoteFromTicket(activeTicket.id, n.id)} title="Excluir"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEquipmentsModal && activeTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Equipamentos do Cliente</h2>
              <button className="close-btn" onClick={() => { setShowEquipmentsModal(false); setEditingEquipment(null); }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {canManageClient ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const name = e.target.eqName.value;
                  const type = e.target.eqType.value;
                  const description = e.target.eqDesc.value;
                  if (!name || !type) return;
                  if (editingEquipment) {
                    await editEquipmentInTicket(activeTicket.id, editingEquipment.id, name, type, description);
                    setEditingEquipment(null);
                  } else {
                    await addEquipmentToTicket(activeTicket.id, name, type, description);
                  }
                  e.target.reset();
                }} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)' }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>{editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}</h3>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Nome</label>
                    <input type="text" name="eqName" className="form-control" placeholder="Ex: Servidor de Arquivos Dell" defaultValue={editingEquipment ? editingEquipment.name : ''} key={editingEquipment ? `eqName-edit-${editingEquipment.id}` : 'eqName-new'} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Tipo</label>
                    <select name="eqType" className="form-control" defaultValue={editingEquipment ? editingEquipment.type : 'servidor desktop'} key={editingEquipment ? `eqType-edit-${editingEquipment.id}` : 'eqType-new'} required>
                      <option value="servidor desktop">Servidor Desktop</option>
                      <option value="roteador">Roteador</option>
                      <option value="switch">Switch</option>
                      <option value="servidor rack">Servidor Rack</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Descrição</label>
                    <textarea name="eqDesc" className="form-control" rows={2} placeholder="Ex: IP 192.168.1.10, Linux Ubuntu 22.04" defaultValue={editingEquipment ? editingEquipment.description : ''} key={editingEquipment ? `eqDesc-edit-${editingEquipment.id}` : 'eqDesc-new'}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn primary" style={{ flex: 1 }}>{editingEquipment ? 'Salvar Alterações' : 'Adicionar'}</button>
                    {editingEquipment && <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingEquipment(null)}>Cancelar</button>}
                  </div>
                </form>
              ) : (
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Você não possui permissão para gerenciar dados do cliente e equipamentos.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeTicket.equipments?.map(e => (
                  <div key={e.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.875rem' }}>{e.name}</strong>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--bg-active)', color: 'var(--text-secondary)', padding: '0.1rem 0.35rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{e.type}</span>
                      <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{e.description || 'Sem descrição.'}</div>
                    </div>
                    {canManageClient && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem' }}>
                        <button className="btn" style={{ padding: '0.35rem' }} onClick={() => setEditingEquipment(e)} title="Editar"><Edit2 size={13} /></button>
                        <button className="btn danger" style={{ padding: '0.35rem' }} onClick={() => deleteEquipmentFromTicket(activeTicket.id, e.id)} title="Excluir"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
