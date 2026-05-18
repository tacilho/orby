import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const AppContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export function AppProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const stompClient = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [ticketReasons, setTicketReasons] = useState([]);
  const [ticketSubReasons, setTicketSubReasons] = useState([]);
  const [standByReasons, setStandByReasons] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [operators, setOperators] = useState([]);
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

  // ── Brand & Theme Engine ───────────────────────
  const builtinThemes = {
    'dark': {
      name: 'Padrão (Escuro)',
      vars: {
        '--bg-app': '#0A0A0B', '--bg-panel': '#131316', '--bg-hover': '#1A1A1F', '--bg-active': '#22222A',
        '--border-color': '#1E1E26', '--text-primary': '#EDEDF0', '--text-secondary': '#8A8A9A', '--text-muted': '#4A4A58'
      }
    },
    'light': {
      name: 'Padrão (Claro)',
      vars: {
        '--bg-app': '#F3F4F6', '--bg-panel': '#FFFFFF', '--bg-hover': '#EBEDF1', '--bg-active': '#E0E2E8',
        '--border-color': '#D4D6DC', '--text-primary': '#111827', '--text-secondary': '#374151', '--text-muted': '#6B7280'
      }
    },
    'midnight': {
      name: 'Meia-Noite',
      vars: {
        '--bg-app': '#0B0F19', '--bg-panel': '#131A2A', '--bg-hover': '#1A243A', '--bg-active': '#2A3B54',
        '--border-color': '#1E293B', '--text-primary': '#E2E8F0', '--text-secondary': '#64748B', '--text-muted': '#475569'
      }
    },
    'nature': {
      name: 'Natureza',
      vars: {
        '--bg-app': '#E9EDE5', '--bg-panel': '#F4F7F2', '--bg-hover': '#DFE5DA', '--bg-active': '#D2DDD0',
        '--border-color': '#C5D1C1', '--text-primary': '#1D2A1C', '--text-secondary': '#647361', '--text-muted': '#8A9A8A'
      }
    },
    'corporate': {
      name: 'Corporativo',
      vars: {
        '--bg-app': '#F0F2F5', '--bg-panel': '#FFFFFF', '--bg-hover': '#E4E6E9', '--bg-active': '#D8DADF',
        '--border-color': '#CCD0D5', '--text-primary': '#1C1E21', '--text-secondary': '#606770', '--text-muted': '#8D949E'
      }
    }
  };

  const [activeThemeId, setActiveThemeId] = useState(() => localStorage.getItem('orby_theme_id') || 'dark');
  const [customThemes, setCustomThemes] = useState(() => {
    const saved = localStorage.getItem('orby_custom_themes');
    return saved ? JSON.parse(saved) : {};
  });

  const [tenantConfig, setTenantConfig] = useState(() => {
    const saved = localStorage.getItem('orby_tenant_config');
    if (saved) return JSON.parse(saved);
    return {
      brandName: 'Orby',
      primaryColor: '#6390FF',
      accent2: '#6390FF',
      domain: '',
      widgetWelcome: 'Olá! Como podemos ajudar?',
    };
  });

  const applyTheme = (id) => {
    const theme = builtinThemes[id] || customThemes[id];
    if (!theme) return;
    
    setActiveThemeId(id);
    localStorage.setItem('orby_theme_id', id);

    // Apply specific theme variables
    Object.entries(theme.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Handle data-theme attribute for CSS transitions and logic
    const baseTheme = (id === 'light' || theme.isLight) ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', baseTheme);
  };

  const saveCustomTheme = (id, themeData) => {
    const newThemes = { ...customThemes, [id]: themeData };
    setCustomThemes(newThemes);
    localStorage.setItem('orby_custom_themes', JSON.stringify(newThemes));
    applyTheme(id);
  };

  const deleteCustomTheme = (id) => {
    const newThemes = { ...customThemes };
    delete newThemes[id];
    setCustomThemes(newThemes);
    localStorage.setItem('orby_custom_themes', JSON.stringify(newThemes));
    if (activeThemeId === id) applyTheme('dark');
  };

  useEffect(() => {
    applyTheme(activeThemeId);
  }, [activeThemeId]);

  // Sync tenant primary color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', tenantConfig.primaryColor);
    // Calc accent-text color based on brightness
    const hex = tenantConfig.primaryColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    document.documentElement.style.setProperty('--accent-text', brightness > 150 ? '#000000' : '#FFFFFF');
  }, [tenantConfig.primaryColor]);

  const toggleTheme = () => {
    const next = activeThemeId === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  };

  // ── API Integration ───────────────────────────

  const fetchInitialData = async () => {
    try {
      const opts = { credentials: 'include' };
      const [ticketsRes, reasonsRes, subResRes, cannedRes, configRes, standByRes, sectorsRes, operatorsRes] = await Promise.all([
        fetch(`${API_BASE}/management/tickets`, opts),
        fetch(`${API_BASE}/api/config/reasons`, opts),
        fetch(`${API_BASE}/api/config/subreasons`, opts),
        fetch(`${API_BASE}/api/config/canned-responses`, opts),
        fetch(`${API_BASE}/api/tenant-config`, opts),
        fetch(`${API_BASE}/management/standby-reasons`, opts),
        fetch(`${API_BASE}/management/sectors`, opts),
        fetch(`${API_BASE}/management/operators`, opts)
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
            senderName: m.senderName,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: m.timestamp,
            type: m.type || 'TEXT',
            mediaUrl: m.mediaUrl,
            mimeType: m.mimeType,
            filename: m.filename
          })) || [],
          notes: t.notes || [],
          equipments: t.equipments || []
        }));
        setTickets(mapped);
        if (mapped.length > 0 && !activeTicketId) setActiveTicketId(mapped[0].id);
      }

      if (reasonsRes.ok) setTicketReasons(await reasonsRes.json());
      if (standByRes.ok) setStandByReasons(await standByRes.json());
      if (sectorsRes.ok) setSectors(await sectorsRes.json());
      if (operatorsRes.ok) setOperators(await operatorsRes.json());
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
        credentials: 'include',
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
      const res = await fetch(`${API_BASE}/management/tickets/${id}/assume?operatorId=1`, { method: 'PUT', credentials: 'include' });
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
        credentials: 'include',
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
      const res = await fetch(`${API_BASE}/management/tickets/${id}/transfer?sectorId=${sectorId}&operatorId=${operatorId || ''}`, { method: 'PUT', credentials: 'include' });
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

  const standByTicket = async (id, reason) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${id}/standby?reason=${encodeURIComponent(reason)}`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id.toString() ? { 
          ...t, 
          status: 'stand_by',
          standByReason: reason
        } : t));
        showToast('Chamado colocado em Stand by');
      }
    } catch (err) {
      showToast('Erro ao colocar em Stand by', 'danger');
    }
  };

  const resumeTicket = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/${id}/resume`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id.toString() ? { 
          ...t, 
          status: 'in_progress',
          standByReason: null
        } : t));
        showToast('Atendimento retomado');
      }
    } catch (err) {
      showToast('Erro ao retomar chamado', 'danger');
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      const res = await fetch(`${API_BASE}/api/management/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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

  const fetchTicketHistory = async (clientId) => {
    try {
      const res = await fetch(`${API_BASE}/management/tickets/client/${clientId}/history`, { credentials: 'include' });
      if (res.ok) {
        const history = await res.json();
        setTickets(prev => prev.map(t => {
          if (t.client && t.client.id === clientId) {
            return { ...t, history };
          }
          return t;
        }));
        return history;
      }
    } catch (err) {
      console.error('Failed to fetch ticket history:', err);
    }
    return [];
  };

  const addCannedResponse = async (title, text) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/canned-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(`${API_BASE}/api/config/canned-responses/${id}`, { method: 'DELETE', credentials: 'include' });
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
        credentials: 'include', body: JSON.stringify({ title })
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
        credentials: 'include', body: JSON.stringify({ title })
      });
      if (res.ok) {
        setTicketReasons(prev => prev.map(r => r.id === id ? { ...r, title } : r));
        showToast('Motivo atualizado');
      }
    } catch (err) { showToast('Erro ao editar motivo', 'danger'); }
  };

  const deleteTicketReason = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/reasons/${id}`, { method: 'DELETE', credentials: 'include' });
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
        credentials: 'include', body: JSON.stringify({ reasonId, title })
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
        credentials: 'include', body: JSON.stringify({ title })
      });
      if (res.ok) {
        setTicketSubReasons(prev => prev.map(sr => sr.id === id ? { ...sr, title } : sr));
        showToast('Submotivo atualizado');
      }
    } catch (err) { showToast('Erro ao editar submotivo', 'danger'); }
  };

  const deleteTicketSubReason = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/config/subreasons/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setTicketSubReasons(prev => prev.filter(sr => sr.id !== id));
        showToast('Submotivo removido');
      }
    } catch (err) { showToast('Erro ao remover submotivo', 'danger'); }
  };

  // ── Stand By Reasons CRUD ──
  const addStandByReason = async (title) => {
    try {
      const res = await fetch(`${API_BASE}/management/standby-reasons`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ title })
      });
      if (res.ok) {
        const saved = await res.json();
        setStandByReasons(prev => [...prev, saved]);
        showToast('Motivo de Stand by adicionado');
      }
    } catch (err) { showToast('Erro ao adicionar motivo', 'danger'); }
  };

  const editStandByReason = async (id, title) => {
    try {
      const res = await fetch(`${API_BASE}/management/standby-reasons/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ title })
      });
      if (res.ok) {
        setStandByReasons(prev => prev.map(r => r.id === id ? { ...r, title } : r));
        showToast('Motivo de Stand by atualizado');
      }
    } catch (err) { showToast('Erro ao editar motivo', 'danger'); }
  };

  const deleteStandByReason = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/standby-reasons/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setStandByReasons(prev => prev.filter(r => r.id !== id));
        showToast('Motivo de Stand by removido');
      }
    } catch (err) { showToast('Erro ao remover motivo', 'danger'); }
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
              timestamp: m.timestamp,
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
        const res = await fetch(`${API_BASE}/management/tickets/${activeTicketId}/messages`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(m => ({
            id: m.id.toString(),
            text: m.content,
            sender: m.senderId === 'operator' ? 'operator' : 'client',
            senderName: m.senderName,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: m.timestamp,
            type: m.type || 'TEXT',
            mediaUrl: m.mediaUrl,
            mimeType: m.mimeType,
            filename: m.filename
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
          senderName: rawMsg.senderName,
          time: new Date(rawMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: rawMsg.timestamp,
          type: rawMsg.type || 'TEXT',
          mediaUrl: rawMsg.mediaUrl,
          mimeType: rawMsg.mimeType,
          filename: rawMsg.filename
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

  const addMessageToTicket = (ticketId, text, sender = 'operator', senderName = 'Gabriel Otacilio') => {
    if (stompClient.current && isConnected) {
      const messagePayload = { 
        content: text, 
        senderId: sender, 
        senderName: senderName,
        type: 'TEXT',
        ticket: { id: parseInt(ticketId) } 
      };
      stompClient.current.publish({ destination: `/app/chat.sendMessage/${ticketId}`, body: JSON.stringify(messagePayload) });
    }
  };

  const addMediaMessageToTicket = async (ticketId, file, type, caption = '', senderId = 'operator', senderName = 'Gabriel Otacilio') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('caption', caption);
    formData.append('senderId', senderId);
    formData.append('senderName', senderName);

    try {
      const res = await fetch(`${API_BASE}/api/chat/tickets/${ticketId}/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      showToast('Erro ao enviar mídia', 'danger');
    }
  };

  return (
    <AppContext.Provider value={{
      tickets, activeTicketId, setActiveTicketId,
      cannedResponses, addCannedResponse, editCannedResponse, deleteCannedResponse,
      tenantConfig, updateTenantConfig,
      assumeTicket, closeTicket, transferTicket, addMessageToTicket, addMediaMessageToTicket, updateClient, standByTicket, resumeTicket,
      addNoteToTicket, addEquipmentToTicket, fetchTicketHistory,
      ticketReasons, addTicketReason, editTicketReason, deleteTicketReason,
      ticketSubReasons, addTicketSubReason, editTicketSubReason, deleteTicketSubReason,
      standByReasons, addStandByReason, editStandByReason, deleteStandByReason,
      sectors, operators,
      cardTypes,
      activeThemeId, builtinThemes, customThemes, applyTheme, saveCustomTheme, deleteCustomTheme, toggleTheme,
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
