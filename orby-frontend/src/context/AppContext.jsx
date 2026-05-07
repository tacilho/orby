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
      if (subResRes.ok) setTicketSubReasons(await subResRes.json());
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

  // ── WebSocket Chat ──
  useEffect(() => {
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe('/topic/tickets', (msg) => {
          const newTicket = JSON.parse(msg.body);
          setTickets(prev => [...prev, { ...newTicket, id: newTicket.id.toString(), status: 'open', messages: [] }]);
        });
      },
      onDisconnect: () => setIsConnected(false)
    });

    client.activate();
    stompClient.current = client;

    return () => client.deactivate();
  }, []);

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
      cannedResponses, addCannedResponse, deleteCannedResponse,
      tenantConfig, updateTenantConfig,
      assumeTicket, closeTicket, transferTicket, addMessageToTicket,
      addNoteToTicket, addEquipmentToTicket,
      ticketReasons, ticketSubReasons,
      cardTypes,
      theme, toggleTheme,
      toasts, showToast,
      isClientTyping, setIsClientTyping
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
