import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRightLeft, X, User, CheckCircle2, Lock, Mail, CreditCard, Clock, Info, Zap, Plus, Edit2, Trash2, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
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
        <p>Acompanhe e responda as mensagens dos seus clientes.</p>
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
                        <Lock size={16} />
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
          <div className="panel-slide-in" style={{ width: '280px', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-panel)', padding: '1.5rem', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Detalhes do Cliente</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} /> NOME
                </div>
                <div style={{ fontWeight: 600 }}>{activeTicket.clientName}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} /> E-MAIL
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{activeTicket.clientEmail}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={14} /> PLANO ATUAL
                </div>
                <div><span className="badge blue">{activeTicket.clientPlan}</span></div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} /> TEMPO DE ESPERA
                </div>
                <div className="mono" style={{ color: 'var(--text-secondary)' }}>12 min</div>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />
            
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Histórico</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nenhum ticket anterior encontrado para este cliente.
            </div>
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
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editingCanned ? (editingCanned.id === 'new' ? 'Nova Resposta' : 'Editar Resposta') : 'Respostas Rápidas'}</h2>
              <button className="close-btn" onClick={() => { setShowCannedModal(false); setEditingCanned(null); }}>
                <X size={18} />
              </button>
            </div>
            
            {editingCanned ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editingCanned.title || !editingCanned.text) return;
                if (editingCanned.id === 'new') {
                  addCannedResponse(editingCanned.title, editingCanned.text);
                } else {
                  editCannedResponse(editingCanned.id, editingCanned.title, editingCanned.text);
                }
                setEditingCanned(null);
              }}>
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input type="text" className="form-control" value={editingCanned.title} onChange={e => setEditingCanned({...editingCanned, title: e.target.value})} autoFocus required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea className="form-control" rows={4} value={editingCanned.text} onChange={e => setEditingCanned({...editingCanned, text: e.target.value})} required style={{ resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                  <button type="button" className="btn" onClick={() => setEditingCanned(null)}>Voltar</button>
                  <button type="submit" className="btn primary">Salvar Resposta</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn primary" onClick={() => setEditingCanned({ id: 'new', title: '', text: '' })} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    <Plus size={14} /> Nova Resposta
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cannedResponses.map(canned => (
                    <div key={canned.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-app)' }}>
                      <div style={{ flex: 1, marginRight: '1rem', cursor: 'pointer' }} onClick={() => { setInput(canned.text); setShowCannedModal(false); }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{canned.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{canned.text}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn" style={{ padding: '0.4rem' }} onClick={() => setEditingCanned(canned)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn danger" style={{ padding: '0.4rem' }} onClick={() => setDeleteConfirm({ type: 'canned', id: canned.id, title: canned.title })} title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cannedResponses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhuma resposta rápida cadastrada.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showNotesModal && activeTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} style={{ color: 'var(--warning)' }} />
                {editingNote ? (editingNote.id === 'new' ? 'Nova Nota Interna' : 'Editar Nota') : 'Notas Internas'}
              </h2>
              <button className="close-btn" onClick={() => { setShowNotesModal(false); setEditingNote(null); }}>
                <X size={18} />
              </button>
            </div>
            
            {editingNote ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editingNote.text) return;
                if (editingNote.id === 'new') {
                  addNoteToTicket(activeTicket.id, editingNote.text);
                } else {
                  editNoteInTicket(activeTicket.id, editingNote.id, editingNote.text);
                }
                setEditingNote(null);
              }}>
                <div className="form-group">
                  <label className="form-label">Observação</label>
                  <textarea className="form-control" rows={4} value={editingNote.text} onChange={e => setEditingNote({...editingNote, text: e.target.value})} autoFocus required style={{ resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                  <button type="button" className="btn" onClick={() => setEditingNote(null)}>Voltar</button>
                  <button type="submit" className="btn primary" style={{ background: 'var(--warning)', borderColor: 'var(--warning)' }}>Salvar Nota</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn warning" onClick={() => setEditingNote({ id: 'new', text: '' })} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'var(--warning)', color: '#fff', borderColor: 'var(--warning)' }}>
                    <Plus size={14} /> Nova Nota
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeTicket.notes.map(note => (
                    <div key={note.id} style={{ padding: '1rem', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--warning)' }}>{note.operator}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="mono">{note.date} às {note.time}</div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{note.text}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setEditingNote(note)} title="Editar">
                          <Edit2 size={14} /> Editar
                        </button>
                        <button className="btn danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setDeleteConfirm({ type: 'note', id: note.id, title: 'Nota de ' + note.date })} title="Excluir">
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeTicket.notes.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhuma nota interna registrada.</div>
                  )}
                </div>
              </>
            )}
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
    </div>
  );
}

export default Chat;
