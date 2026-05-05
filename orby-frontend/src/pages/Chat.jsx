import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRightLeft, X, User, CheckCircle2, NotebookPen, Mail, Phone, Clock, Info, Zap, Plus, Edit2, Trash2, Paperclip, Image as ImageIcon, FileText, History } from 'lucide-react';
import Select from '../components/Select';
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
    ticketReasons,
    addTicketReason,
    editTicketReason,
    deleteTicketReason
  } = useAppContext();

  const [input, setInput] = useState('');
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [editingReason, setEditingReason] = useState(null);
  const [editingCanned, setEditingCanned] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, title: null });
  const [historyConversation, setHistoryConversation] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSector, setTransferSector] = useState('');
  const [transferOperator, setTransferOperator] = useState('');
  const [isClientTyping, setIsClientTyping] = useState(false);
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

    // Simula o tempo de leitura e digitação do cliente
    setTimeout(() => {
      if (activeTicket.status !== 'transferred' && activeTicket.status !== 'closed') {
        setIsClientTyping(true);
        
        setTimeout(() => {
          setIsClientTyping(false);
          addMessageToTicket(activeTicket.id, 'Entendido, vou verificar as informações.', 'client');
        }, 2500); // 2.5s digitando
      }
    }, 1500); // 1.5s para ler
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
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{ticket.clientName}</span>
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
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{activeTicket.clientName}</div>
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
                      <button className={`btn ${showNotesModal ? 'primary' : ''}`} title="Notas Internas" onClick={() => setShowNotesModal(true)}>
                        <NotebookPen size={16} />
                      </button>
                      <button className={`btn ${showCannedModal ? 'primary' : ''}`} title="Respostas Rápidas" onClick={() => setShowCannedModal(true)}>
                        <Zap size={16} />
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
            {activeTicket.history && activeTicket.history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {activeTicket.history.map((h, idx) => (
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{h.sector}</span>
                      <span>{h.operator}</span>
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
          <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
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
          <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
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
              <button className="close-btn" onClick={() => setDeleteConfirm({ type: null, id: null, title: null })}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <p>Tem certeza que deseja excluir a {deleteConfirm.type === 'canned' ? 'resposta rápida' : 'nota'} <strong>{deleteConfirm.title}</strong>? Esta ação não poderá ser desfeita.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn" onClick={() => setDeleteConfirm({ type: null, id: null, title: null })}>
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
                  }
                  setDeleteConfirm({ type: null, id: null, title: null });
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
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                Encerrar Chamado
              </h2>
              <button className="close-btn" onClick={() => setShowCloseModal(false)}>
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
            ) : (
              <>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Selecione o motivo do chamado antes de encerrá-lo para alimentar os relatórios do sistema.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {ticketReasons.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: selectedReason === r.id ? 'var(--bg-active)' : 'transparent', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.1s' }} onClick={() => setSelectedReason(r.id)}>
                      <div style={{ flex: 1, fontWeight: selectedReason === r.id ? 600 : 400, color: selectedReason === r.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.title}</div>
                      <button className="btn" style={{ padding: '0.3rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setEditingReason(r); }}><Edit2 size={14} /></button>
                      <button className="btn danger" style={{ padding: '0.3rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); deleteTicketReason(r.id); if (selectedReason === r.id) setSelectedReason(''); }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {ticketReasons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Nenhum motivo cadastrado.</div>
                  )}
                </div>

                <button className="btn" style={{ width: '100%', marginBottom: '2rem', borderStyle: 'dashed' }} onClick={() => setEditingReason({ id: 'new', title: '' })}>
                  <Plus size={14} /> Cadastrar Novo Motivo
                </button>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <button className="btn" onClick={() => setShowCloseModal(false)}>Cancelar</button>
                  <button className="btn primary" disabled={!selectedReason} onClick={() => { 
                    closeTicket(activeTicket.id); 
                    setShowCloseModal(false);
                    setSelectedReason(''); 
                  }}>
                    <CheckCircle2 size={16} /> Encerrar e Salvar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* History conversation modal */}
      {historyConversation && (
        <div className="modal-overlay" onClick={() => setHistoryConversation(null)}>
          <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {historyConversation.messages.map((m, i) => (
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
