import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [tickets, setTickets] = useState([
    // ── Aguardando (open) ────────────────────────
    {
      id: 'TCK-101', clientName: 'Tech Solutions Inc.', contactName: 'Rafael Mendes',
      clientEmail: 'rafael@techsolutions.com', clientPhone: '(11) 98765-4321',
      sector: 'n1', operator: null, status: 'open', createdAt: '08:42',
      messages: [
        { id: '1', text: 'Bom dia, estou sem acesso ao painel desde ontem.', sender: 'client', time: '08:42', type: 'message' }
      ],
      notes: [],
      history: [
        { ticketId: 'TCK-054', date: '22/04/2026', sector: 'Suporte N1', operator: 'Carlos M.', status: 'closed',
          messages: [
            { sender: 'client', text: 'Olá, preciso resetar minha senha.', time: '14:00' },
            { sender: 'operator', text: 'Claro, vou enviar o link de reset agora.', time: '14:02' },
            { sender: 'client', text: 'Recebi, obrigado!', time: '14:10' },
            { sender: 'operator', text: 'De nada, qualquer coisa estou à disposição.', time: '14:11' },
          ]
        },
        { ticketId: 'TCK-031', date: '10/04/2026', sector: 'Suporte N2', operator: 'Ana P.', status: 'closed',
          messages: [
            { sender: 'client', text: 'O relatório mensal está vindo em branco.', time: '09:20' },
            { sender: 'operator', text: 'Vou verificar o módulo de relatórios.', time: '09:25' },
            { sender: 'operator', text: 'Corrigido. Havia uma falha no filtro de data.', time: '09:45' },
            { sender: 'client', text: 'Funcionou, valeu!', time: '09:50' },
          ]
        }
      ]
    },
    {
      id: 'TCK-102', clientName: 'Acme Corp', contactName: 'Juliana Alves',
      clientEmail: 'juliana@acme.com', clientPhone: '(21) 91234-5678',
      sector: 'comercial', operator: null, status: 'open', createdAt: '09:15',
      messages: [
        { id: '2', text: 'Gostaria de informações sobre upgrade de plano.', sender: 'client', time: '09:15', type: 'message' }
      ],
      notes: [], history: []
    },
    {
      id: 'TCK-103', clientName: 'Infinity Digital', contactName: 'Lucas Borges',
      clientEmail: 'lucas@infinity.digital', clientPhone: '(31) 99876-1234',
      sector: 'n1', operator: null, status: 'open', createdAt: '10:01',
      messages: [
        { id: '3', text: 'O sistema está retornando erro 500 ao gerar boletos.', sender: 'client', time: '10:01', type: 'message' }
      ],
      notes: [],
      history: [
        { ticketId: 'TCK-067', date: '28/04/2026', sector: 'Suporte N1', operator: 'João Silva', status: 'closed',
          messages: [
            { sender: 'client', text: 'Não consigo emitir segunda via do boleto.', time: '11:00' },
            { sender: 'operator', text: 'Pode me passar o número do pedido?', time: '11:02' },
            { sender: 'client', text: 'Pedido #4421.', time: '11:03' },
            { sender: 'operator', text: 'Pronto, reemiti o boleto. Verifique seu e-mail.', time: '11:10' },
          ]
        }
      ]
    },
    // ── Em Andamento (in_progress) ───────────────
    {
      id: 'TCK-092', clientName: 'Gplus Sistemas', contactName: 'Marcelo Teixeira',
      clientEmail: 'marcelo@gplus.com.br', clientPhone: '(11) 94567-8901',
      sector: 'n1', operator: 'Você', status: 'in_progress', createdAt: '10:30',
      messages: [
        { id: '4', text: 'Olá, estou com problemas no acesso ao sistema.', sender: 'client', time: '10:30', type: 'message' },
        { id: '5', text: 'Bom dia! Pode me informar o seu e-mail de acesso?', sender: 'operator', time: '10:32', type: 'message' }
      ],
      notes: [
        { id: 'n1', text: 'Cliente está impaciente, priorizar.', operator: 'Você', time: '10:35', date: new Date().toLocaleDateString() }
      ],
      history: [
        { ticketId: 'TCK-044', date: '15/04/2026', sector: 'DevOps', operator: 'Carlos M.', status: 'closed',
          messages: [
            { sender: 'client', text: 'Servidor de homologação fora do ar.', time: '16:00' },
            { sender: 'operator', text: 'Reiniciando o serviço agora.', time: '16:05' },
            { sender: 'operator', text: 'Serviço restabelecido.', time: '16:12' },
            { sender: 'client', text: 'Confirmado, voltou.', time: '16:15' },
          ]
        }
      ]
    },
    {
      id: 'TCK-094', clientName: 'Nova Telecom', contactName: 'Fernanda Costa',
      clientEmail: 'fernanda@novatelecom.com', clientPhone: '(41) 93456-7890',
      sector: 'n2', operator: 'Carlos M.', status: 'in_progress', createdAt: '11:20',
      messages: [
        { id: '6', text: 'A API de integração parou de funcionar.', sender: 'client', time: '11:20', type: 'message' },
        { id: '7', text: 'Estou verificando os logs do servidor.', sender: 'operator', time: '11:25', type: 'message' }
      ],
      notes: [], history: []
    },
    {
      id: 'TCK-095', clientName: 'DataBridge', contactName: 'André Souza',
      clientEmail: 'andre@databridge.io', clientPhone: '(51) 92345-6789',
      sector: 'n1', operator: 'Você', status: 'in_progress', createdAt: '12:10',
      messages: [
        { id: '8', text: 'Preciso ajustar as permissões de um usuário.', sender: 'client', time: '12:10', type: 'message' },
        { id: '9', text: 'Qual o e-mail do usuário?', sender: 'operator', time: '12:12', type: 'message' },
        { id: '10', text: 'usuario@databridge.io', sender: 'client', time: '12:13', type: 'message' }
      ],
      notes: [], history: []
    },
    // ── Aguardando Transferência (pending_transfer) ───
    {
      id: 'TCK-088', clientName: 'CloudStack', contactName: 'Patrícia Lima',
      clientEmail: 'patricia@cloudstack.com', clientPhone: '(61) 91234-0000',
      sector: 'n2', operator: 'João Silva', status: 'pending_transfer', transferredTo: 'Você', createdAt: '09:50',
      messages: [
        { id: '11', text: 'O deploy automático não está disparando.', sender: 'client', time: '09:50', type: 'message' },
        { id: '12', text: 'Vou transferir para o N2 que tem mais contexto.', sender: 'operator', time: '10:00', type: 'message' },
        { id: '13', text: 'O chamado foi transferido para Suporte N2 (Você).', sender: 'system', time: '10:00', type: 'message' }
      ],
      notes: [],
      history: [
        { ticketId: 'TCK-072', date: '25/04/2026', sector: 'Suporte N1', operator: 'João Silva', status: 'closed',
          messages: [
            { sender: 'client', text: 'Dúvida sobre configuração do webhook.', time: '10:00' },
            { sender: 'operator', text: 'O webhook aceita POST com JSON no body.', time: '10:05' },
            { sender: 'client', text: 'Entendi, obrigada.', time: '10:08' },
          ]
        }
      ]
    },
    {
      id: 'TCK-089', clientName: 'PixelForge', contactName: 'Diego Ramos',
      clientEmail: 'diego@pixelforge.co', clientPhone: '(85) 98765-1111',
      sector: 'comercial', operator: 'Ana P.', status: 'pending_transfer', transferredTo: 'Carlos M.', createdAt: '13:40',
      messages: [
        { id: '14', text: 'Quero migrar do plano Basic para Pro.', sender: 'client', time: '13:40', type: 'message' },
        { id: '15', text: 'Transferindo para o comercial responsável.', sender: 'operator', time: '13:50', type: 'message' },
        { id: '16', text: 'O chamado foi transferido para Comercial (Carlos M.).', sender: 'system', time: '13:50', type: 'message' }
      ],
      notes: [], history: []
    },
    {
      id: 'TCK-090', clientName: 'Horizon Labs', contactName: 'Camila Duarte',
      clientEmail: 'camila@horizonlabs.tech', clientPhone: '(71) 97654-3210',
      sector: 'n1', operator: 'Você', status: 'pending_transfer', transferredTo: 'Você', createdAt: '14:05',
      messages: [
        { id: '17', text: 'Erro ao exportar dados em CSV.', sender: 'client', time: '14:05', type: 'message' },
        { id: '18', text: 'O chamado foi transferido para Suporte N1 (Você).', sender: 'system', time: '14:20', type: 'message' }
      ],
      notes: [], history: []
    },
    // ── Finalizado (closed) ──────────────────────
    {
      id: 'TCK-080', clientName: 'MegaStore', contactName: 'Ricardo Nunes',
      clientEmail: 'ricardo@megastore.com.br', clientPhone: '(19) 91111-2222',
      sector: 'n1', operator: 'Você', status: 'closed', createdAt: '08:00',
      messages: [
        { id: '19', text: 'Como faço para alterar meu e-mail?', sender: 'client', time: '08:00', type: 'message' },
        { id: '20', text: 'Acesse Configurações > Perfil > E-mail.', sender: 'operator', time: '08:05', type: 'message' },
        { id: '21', text: 'Consegui, obrigado!', sender: 'client', time: '08:10', type: 'message' }
      ],
      notes: [], history: []
    },
    {
      id: 'TCK-081', clientName: 'Tech Solutions Inc.', contactName: 'Rafael Mendes',
      clientEmail: 'rafael@techsolutions.com', clientPhone: '(11) 98765-4321',
      sector: 'n2', operator: 'Carlos M.', status: 'closed', createdAt: '07:30',
      messages: [
        { id: '22', text: 'O módulo financeiro está com cálculo errado.', sender: 'client', time: '07:30', type: 'message' },
        { id: '23', text: 'Identificamos e corrigimos o bug. Está no ar.', sender: 'operator', time: '08:45', type: 'message' }
      ],
      notes: [], history: []
    },
    {
      id: 'TCK-082', clientName: 'DataBridge', contactName: 'André Souza',
      clientEmail: 'andre@databridge.io', clientPhone: '(51) 92345-6789',
      sector: 'comercial', operator: 'Ana P.', status: 'closed', createdAt: '09:00',
      messages: [
        { id: '24', text: 'Preciso de uma proposta para 50 licenças.', sender: 'client', time: '09:00', type: 'message' },
        { id: '25', text: 'Enviei a proposta por e-mail. Qualquer dúvida, estou à disposição.', sender: 'operator', time: '09:30', type: 'message' }
      ],
      notes: [], history: []
    },
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
      id: newId, clientName, contactName: clientName, clientEmail: 'novo@cliente.com',
      clientPhone: '(00) 00000-0000', sector, operator: null, status: 'open',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [], notes: [], history: []
    };
    setTickets(prev => [newTicket, ...prev]);
    return newId;
  };

  const assumeTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress', operator: 'Você', transferredTo: null } : t));
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
          status: 'pending_transfer', 
          sector: newSector,
          transferredTo: newOperator || null,
          operator: t.operator,
          messages: [...t.messages, {
            id: Date.now().toString(),
            text: `O chamado foi transferido para ${newSector === 'n2' ? 'Suporte N2' : newSector}${newOperator ? ` (${newOperator})` : ''}.`,
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
            id: Date.now().toString(), text, sender, type,
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
            id: Date.now().toString(), text, operator,
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
        return { ...t, notes: t.notes.map(n => n.id === noteId ? { ...n, text } : n) };
      }
      return t;
    }));
  };

  const deleteNoteFromTicket = (ticketId, noteId) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, notes: t.notes.filter(n => n.id !== noteId) };
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
      tickets, activeTicketId, setActiveTicketId,
      cannedResponses, addCannedResponse, editCannedResponse, deleteCannedResponse,
      tenantConfig, updateTenantConfig,
      addTicket, assumeTicket, closeTicket, transferTicket,
      addMessageToTicket, addNoteToTicket, editNoteInTicket, deleteNoteFromTicket,
      ticketReasons, addTicketReason, editTicketReason, deleteTicketReason
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
