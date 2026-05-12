import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const AppContext = createContext();

const API_BASE = 'http://localhost:8080';

export function AppProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const stompClient = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [ticketReasons, setTicketReasons] = useState([]);
  const [ticketSubReasons, setTicketSubReasons] = useState([]);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [cardTypes, setCardTypes] = useState([
    { id: '1', title: 'Melhoria', color: '#6366f1' },
    { id: '2', title: 'Bug', color: '#ef4444' },
    { id: '3', title: 'Tarefa', color: '#10b981' }
  ]);
  const [kanbanCards, setKanbanCards] = useState([
    { id: 'K-101', title: 'Ajustar carregamento do Dashboard', type: 'Bug', status: 'in_progress', ticketId: '1001', clientName: 'Empresa Alpha', priority: 'high' },
    { id: 'K-102', title: 'Nova exportação de relatórios em CSV', type: 'Melhoria', status: 'todo', ticketId: null, clientName: null, priority: 'medium' },
  ]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // ── Brand & Theme ────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('orby_theme') || 'dark');
  const [tenantConfig, setTenantConfig] = useState(() => {
    const saved = localStorage.getItem('orby_tenant_config');
    if (saved) return JSON.parse(saved);
    return {
      brandName: 'Orby',
      primaryColor: '#EAEAEA',
      domain: '',
      widgetWelcome: 'Olá! Como podemos ajudar?',
    };
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('orby_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── API Integration ───────────────────────────

  const fetchInitialData = async () => {
    try {
      const [ticketsRes, reasonsRes, subResRes, cannedRes, configRes] = await Promise.all([
        fetch(`${API_BASE}/management/tickets`),
        fetch(`${API_BASE}/api/config/reasons`),
        fetch(`${API_BASE}/api/config/subreasons`),
        fetch(`${API_BASE}/api/config/canned-responses`),
        fetch(`${API_BASE}/api/tenant-config`)
      ]);

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        const mapped = data.map(t => ({
          ...t,
          id: t.id.toString(),
          clientName: t.client?.name || 'Cliente Desconhecido',
          operator: t.operator?.name || null,
          sector: t.sector?.name || null,
          status: t.status?.toLowerCase() || 'open',
          messages: t.messages?.map(m => ({
            id: m.id.toString(),
            text: m.content,
            sender: m.senderId === 'operator' ? 'operator' : 'client',
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'message'
          })) || [],
          notes: t.notes || [],
          equipments: t.equipments || []
        }));
        setTickets(mapped);
        if (mapped.length > 0 && !activeTicketId) setActiveTicketId(mapped[0].id);
      }

      if (reasonsRes.ok) setTicketReasons(await reasonsRes.json());
      if (subResRes.ok) {
        const subs = await subResRes.json();
        setTicketSubReasons(subs.map(sr => ({ ...sr, parentId: sr.reason?.id || sr.parentId })));
      }
      if (cannedRes.ok) setCannedResponses(await cannedRes.json());
      if (configRes.ok) setTenantConfig(await configRes.json());

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      showToast("Erro ao conectar com o servidor. Usando dados locais.", "warning");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const updateTenantConfig = async (newConfig) => {
    try {
      const res = await fetch(`${API_BASE}/api/tenant-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const saved = await res.json();
        setTenantConfig(saved);
        localStorage.setItem('orby_tenant_config', JSON.stringify(saved));
      }
    } catch (err) {
      showToast("Erro ao salvar configurações", "danger");
    }
  };

  // Actions
  const assumeTicket = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${id}/assume?operatorId=1`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id.toString() ? { 
          ...t, 
          status: 'in_progress', 
          operator: updated.operator?.name || 'Você',
          acceptedAt: updated.acceptedAt 
        } : t));
        showToast('Chamado assumido com sucesso');
      }
    } catch (err) {
      showToast('Erro ao assumir chamado', 'danger');
    }
  };

  const closeTicket = async (id, reason, subReason, comment, rating) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${id}/close`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, subReason, comment, rating })
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id.toString() ? { 
          ...t, 
          status: 'closed',
          reason,
          subReason,
          rating,
          closingComment: comment,
          closedAt: new Date().toISOString()
        } : t));
        showToast('Chamado finalizado');
      }
    } catch (err) {
      showToast('Erro ao finalizar chamado', 'danger');
    }
  };

  const transferTicket = async (id, sectorId, operatorId) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${id}/transfer?sectorId=${sectorId}&operatorId=${operatorId || ''}`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id.toString() ? { 
          ...t, 
          status: 'in_progress', // or pending_transfer if we had that state in frontend
          sector: updated.sector?.name,
          operator: updated.operator?.name
        } : t));
        showToast('Chamado transferido');
      }
    } catch (err) {
      showToast('Erro ao transferir chamado', 'danger');
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      const res = await fetch(`${API_BASE}/api/management/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        const updatedClient = await res.json();
        setTickets(prev => prev.map(t => {
          if (t.client && t.client.id === clientId) {
            return {
              ...t,
              client: updatedClient,
              clientName: updatedClient.name // sync denormalized field
            };
          }
          return t;
        }));
        showToast('Dados do cliente atualizados');
        return updatedClient;
      }
    } catch (err) {
      showToast('Erro ao atualizar dados do cliente', 'danger');
    }
    return null;
  };

  const addNoteToTicket = async (ticketId, text) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, operator: 'Você' })
      });
      if (res.ok) {
        const newNote = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId.toString() ? { 
          ...t, 
          notes: [...(t.notes || []), newNote] 
        } : t));
        showToast('Nota adicionada');
      }
    } catch (err) {
      showToast('Erro ao adicionar nota', 'danger');
    }
  };

  const addEquipmentToTicket = async (ticketId, name, type, description) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${ticketId}/equipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, description })
      });
      if (res.ok) {
        const newEq = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId.toString() ? { 
          ...t, 
          equipments: [...(t.equipments || []), newEq] 
        } : t));
        showToast('Equipamento adicionado');
      }
    } catch (err) {
      showToast('Erro ao adicionar equipamento', 'danger');
    }
  };

  const escalateTicketToDev = (ticketId, taskTitle, type) => {
    const ticket = tickets.find(t => t.id === ticketId.toString());
    const newCard = {
      id: `K-${Math.floor(Math.random() * 900) + 100}`,
      title: taskTitle || `Demanda do chamado ${ticketId}`,
      type: type || 'Bug',
      status: 'todo',
      ticketId: ticketId.toString(),
      clientName: ticket?.clientName || 'Cliente Externo',
      priority: 'medium',
      createdAt: new Date().toISOString()
    };

    setKanbanCards(prev => [newCard, ...prev]);
    
    // Update ticket to show it has a dev link
    setTickets(prev => prev.map(t => t.id === ticketId.toString() ? {
      ...t,
      devCardId: newCard.id,
      devStatus: 'todo'
    } : t));

    showToast('Ticket escalado para o desenvolvimento!', 'success');
  };

  const addCannedResponse = async (title, text) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/canned-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text })
      });
      if (res.ok) {
        const saved = await res.json();
        setCannedResponses(prev => [...prev, saved]);
        showToast('Resposta rápida adicionada');
      }
    } catch (err) {
      showToast('Erro ao salvar resposta', 'danger');
    }
  };

  const deleteCannedResponse = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/canned-responses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCannedResponses(prev => prev.filter(c => c.id !== id));
        showToast('Resposta rápida removida');
      }
    } catch (err) {
      showToast('Erro ao remover resposta', 'danger');
    }
  };

  const editCannedResponse = async (id, title, text) => {
    // For now, delete and recreate since we don't have PUT endpoint
    setCannedResponses(prev => prev.map(c => c.id === id ? { ...c, title, text } : c));
  };

  // ── Ticket Reasons CRUD ──
  const addTicketReason = async (title) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/reasons`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const saved = await res.json();
        setTicketReasons(prev => [...prev, saved]);
        showToast('Motivo adicionado');
      }
    } catch (err) { showToast('Erro ao adicionar motivo', 'danger'); }
  };

  const editTicketReason = async (id, title) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/reasons/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        setTicketReasons(prev => prev.map(r => r.id === id ? { ...r, title } : r));
        showToast('Motivo atualizado');
      }
    } catch (err) { showToast('Erro ao editar motivo', 'danger'); }
  };

  const deleteTicketReason = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/reasons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTicketReasons(prev => prev.filter(r => r.id !== id));
        setTicketSubReasons(prev => prev.filter(sr => sr.reason?.id !== id && sr.parentId !== id));
        showToast('Motivo removido');
      }
    } catch (err) { showToast('Erro ao remover motivo', 'danger'); }
  };

  const addTicketSubReason = async (reasonId, title) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/subreasons`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasonId, title })
      });
      if (res.ok) {
        const saved = await res.json();
        // Normalize parentId for frontend
        const normalized = { ...saved, parentId: saved.reason?.id || reasonId };
        setTicketSubReasons(prev => [...prev, normalized]);
        showToast('Submotivo adicionado');
      }
    } catch (err) { showToast('Erro ao adicionar submotivo', 'danger'); }
  };

  const editTicketSubReason = async (id, title) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/subreasons/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        setTicketSubReasons(prev => prev.map(sr => sr.id === id ? { ...sr, title } : sr));
        showToast('Submotivo atualizado');
      }
    } catch (err) { showToast('Erro ao editar submotivo', 'danger'); }
  };

  const deleteTicketSubReason = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/subreasons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTicketSubReasons(prev => prev.filter(sr => sr.id !== id));
        showToast('Submotivo removido');
      }
    } catch (err) { showToast('Erro ao remover submotivo', 'danger'); }
  };

  // ── WebSocket Chat ──
  useEffect(() => {
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP Debug:', str),
      onConnect: () => {
        console.log('STOMP Connected!');
        setIsConnected(true);
        client.subscribe('/topic/tickets', (msg) => {
          const t = JSON.parse(msg.body);
          const mapped = {
            ...t,
            id: t.id.toString(),
            clientName: t.client?.name || 'Cliente Desconhecido',
            operator: t.operator?.name || null,
            sector: t.sector?.name || null,
            status: t.status?.toLowerCase() || 'open',
            messages: t.messages?.map(m => ({
              id: m.id.toString(),
              text: m.content,
              sender: m.senderId === 'operator' ? 'operator' : 'client',
              time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'message'
            })) || [],
            notes: t.notes || [],
            equipments: t.equipments || []
          };
          setTickets(prev => {
            if (prev.some(existing => existing.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
          showToast(`Novo chamado de ${mapped.clientName}`, "info");
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error('STOMP Details:', frame.body);
      },
      onDisconnect: () => {
        console.log('STOMP Disconnected');
        setIsConnected(false);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => client.deactivate();
  }, []);

  useEffect(() => {
    if (!activeTicketId) return;

    // Fetch full message history from the API
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE}/management/tickets/${activeTicketId}/messages`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(m => ({
            id: m.id.toString(),
            text: m.content,
            sender: m.senderId === 'operator' ? 'operator' : 'client',
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'message'
          }));
          setTickets(prev => prev.map(t => 
            t.id === activeTicketId ? { ...t, messages: mapped } : t
          ));
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [activeTicketId]);

  useEffect(() => {
    if (!isConnected || !activeTicketId) return;

    const subscription = stompClient.current.subscribe(`/topic/chat/${activeTicketId}`, (msg) => {
      const rawMsg = JSON.parse(msg.body);
      const formattedMsg = {
        id: rawMsg.id.toString(),
        text: rawMsg.content,
        sender: rawMsg.senderId === 'operator' ? 'operator' : 'client',
        time: new Date(rawMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message'
      };

      setTickets(prev => prev.map(t => {
        if (t.id === activeTicketId) {
          if (t.messages.some(m => m.id === formattedMsg.id)) return t;
          return { ...t, messages: [...t.messages, formattedMsg] };
        }
        return t;
      }));
    });

    return () => subscription.unsubscribe();
  }, [isConnected, activeTicketId]);

  const addMessageToTicket = (ticketId, text, sender = 'operator') => {
    if (stompClient.current && isConnected) {
      const messagePayload = { content: text, senderId: sender, ticket: { id: parseInt(ticketId) } };
      stompClient.current.publish({ destination: `/app/chat.sendMessage/${ticketId}`, body: JSON.stringify(messagePayload) });
    }
  };

  return (
    <AppContext.Provider value={{
      tickets, activeTicketId, setActiveTicketId,
      cannedResponses, addCannedResponse, editCannedResponse, deleteCannedResponse,
      tenantConfig, updateTenantConfig,
      assumeTicket, closeTicket, transferTicket, addMessageToTicket, updateClient,
      addNoteToTicket, addEquipmentToTicket,
      ticketReasons, addTicketReason, editTicketReason, deleteTicketReason,
      ticketSubReasons, addTicketSubReason, editTicketSubReason, deleteTicketSubReason,
      cardTypes,
      theme, toggleTheme,
      toasts, showToast,
      isClientTyping, setIsClientTyping,
      kanbanCards, setKanbanCards, escalateTicketToDev
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
