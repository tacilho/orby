import React, { useState, useEffect, useMemo } from 'react';
import { User, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }).split('/').slice(0, 2).join('/') + ' ' + 
         date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function Chat() {
  const { user } = useAuth();
  const { tickets, activeTicketId, setActiveTicketId } = useAppContext();
  const activeTickets = tickets.filter(t => {
    const isActive = t.status === 'in_progress' || t.status === 'stand_by';
    if (!isActive) return false;
    
    // Check permission: ver chamados de outros operadores
    if (user?.role === 'OPERATOR' && user?.viewOthersTickets === false) {
      return t.operator === 'Você' || t.operator === user.name;
    }
    return true;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Atendimento</h1>
      </div>

      <div className="chat-container" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div className="chat-sidebar" style={{ width: '320px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Atendimentos Ativos ({activeTickets.length})
            </span>
          </div>
          <div className="chat-list" style={{ flex: 1, overflowY: 'auto' }}>
            {activeTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`chat-item ${ticket.id.toString() === activeTicketId?.toString() ? 'active' : ''}`}
                onClick={() => setActiveTicketId(ticket.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{ticket.clientName}</span>
                    {ticket.source === 'WHATSAPP' && <MessageCircle size={12} style={{ color: '#25D366' }} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(ticket.createdAt)}</span>
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

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeTicketId ? (
            <ChatWindow ticketId={activeTicketId} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               <User size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p>Selecione um atendimento na barra lateral para iniciar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
