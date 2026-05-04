import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [tickets, setTickets] = useState([
    {
      id: 'TCK-092',
      clientName: 'Tech Solutions Inc.',
      clientEmail: 'admin@techsolutions.com',
      clientPlan: 'Enterprise',
      sector: 'Suporte N1',
      operator: 'Você',
      status: 'in_progress', // open, in_progress, closed, transferred
      createdAt: '10:30',
      messages: [
        { id: '1', text: 'Olá, estou com problemas no acesso ao sistema.', sender: 'client', time: '10:30', type: 'message' },
        { id: '2', text: 'Bom dia! Pode me informar o seu e-mail de acesso por favor?', sender: 'operator', time: '10:32', type: 'message' }
      ],
      notes: [
        { id: 'n1', text: 'Cliente está impaciente, priorizar.', operator: 'Você', time: '10:35', date: new Date().toLocaleDateString() }
      ]
    },
    {
      id: 'TCK-093',
      clientName: 'Acme Corp',
      clientEmail: 'contato@acme.com',
      clientPlan: 'Basic',
      sector: 'Suporte N2',
      operator: null,
      status: 'open',
      createdAt: '11:05',
      messages: [
        { id: '3', text: 'Preciso de ajuda com a fatura mensal.', sender: 'client', time: '11:05', type: 'message' }
      ],
      notes: []
    },
    {
      id: 'TCK-091',
      clientName: 'Gplus Sistemas',
      clientEmail: 'ti@gplus.com',
      clientPlan: 'Pro',
      sector: 'DevOps',
      operator: 'Carlos M.',
      status: 'closed',
      createdAt: '09:15',
      messages: [],
      notes: []
    }
  ]);

  const [cannedResponses, setCannedResponses] = useState([
    { id: '1', title: 'Saudação', text: 'Olá, como posso ajudar hoje?' },
    { id: '2', title: 'Verificando', text: 'Estou verificando seu caso agora mesmo.' },
    { id: '3', title: 'Pedir Print', text: 'Poderia me enviar um print do erro?' }
  ]);

  const [ticketReasons, setTicketReasons] = useState([
    { id: '1', title: 'Dúvida Geral' },
    { id: '2', title: 'Suporte Técnico' },
    { id: '3', title: 'Financeiro' },
    { id: '4', title: 'Reclamação' }
  ]);
  
  const [activeTicketId, setActiveTicketId] = useState('TCK-092');

  const [tenantConfig, setTenantConfig] = useState(() => {
    const saved = localStorage.getItem('orby_tenant_config');
    if (saved) return JSON.parse(saved);
    return {
      brandName: 'Orby',
      primaryColor: '#EAEAEA',
      domain: '',
      smtpHost: '',
      smtpUser: '',
      smtpPort: '587',
      widgetWelcome: 'Olá! Como podemos ajudar?',
      widgetColor: '#EAEAEA'
    };
  });

  const updateTenantConfig = (newConfig) => {
    setTenantConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('orby_tenant_config', JSON.stringify(updated));
      return updated;
    });
  };

  const addTicket = (clientName, sector) => {
    const newId = `TCK-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newTicket = {
      id: newId,
      clientName,
      clientEmail: 'novo@cliente.com',
      clientPlan: 'Desconhecido',
      sector,
      operator: null,
      status: 'open',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
      notes: []
    };
    setTickets(prev => [newTicket, ...prev]);
    return newId;
  };

  const assumeTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress', operator: 'Você' } : t));
    setActiveTicketId(id);
  };

  const closeTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t));
    if (activeTicketId === id) setActiveTicketId(null);
  };

  const transferTicket = (id, newSector, newOperator) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: 'transferred', 
          sector: newSector,
          operator: newOperator || 'Fila',
          messages: [...t.messages, {
            id: Date.now().toString(),
            text: `O chamado foi transferido para ${newSector === 'n2' ? 'Suporte N2' : newSector}.`,
            sender: 'system',
            type: 'message',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return t;
    }));
  };

  const addMessageToTicket = (ticketId, text, sender = 'operator', type = 'message') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, {
            id: Date.now().toString(),
            text,
            sender,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return t;
    }));
  };

  const addNoteToTicket = (ticketId, text, operator = 'Você') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          notes: [...t.notes, {
            id: Date.now().toString(),
            text,
            operator,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
          }]
        };
      }
      return t;
    }));
  };

  const editNoteInTicket = (ticketId, noteId, text) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          notes: t.notes.map(n => n.id === noteId ? { ...n, text } : n)
        };
      }
      return t;
    }));
  };

  const deleteNoteFromTicket = (ticketId, noteId) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          notes: t.notes.filter(n => n.id !== noteId)
        };
      }
      return t;
    }));
  };

  const addCannedResponse = (title, text) => {
    setCannedResponses(prev => [...prev, { id: Date.now().toString(), title, text }]);
  };

  const editCannedResponse = (id, title, text) => {
    setCannedResponses(prev => prev.map(c => c.id === id ? { ...c, title, text } : c));
  };

  const deleteCannedResponse = (id) => {
    setCannedResponses(prev => prev.filter(c => c.id !== id));
  };

  const addTicketReason = (title) => {
    setTicketReasons(prev => [...prev, { id: Date.now().toString(), title }]);
  };

  const editTicketReason = (id, title) => {
    setTicketReasons(prev => prev.map(r => r.id === id ? { ...r, title } : r));
  };

  const deleteTicketReason = (id) => {
    setTicketReasons(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider value={{
      tickets,
      activeTicketId,
      setActiveTicketId,
      cannedResponses,
      addCannedResponse,
      editCannedResponse,
      deleteCannedResponse,
      tenantConfig,
      updateTenantConfig,
      addTicket,
      assumeTicket,
      closeTicket,
      transferTicket,
      addMessageToTicket,
      addNoteToTicket,
      editNoteInTicket,
      deleteNoteFromTicket,
      ticketReasons,
      addTicketReason,
      editTicketReason,
      deleteTicketReason
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
